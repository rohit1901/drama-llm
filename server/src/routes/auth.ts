import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { query, getClient } from '../db/pool.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateSessionToken,
  getSessionExpiration,
  isValidEmail,
  sanitizeUser,
} from '../utils/auth.js';
import {
  User,
  Session,
  AuthResponse,
  ValidationError,
  AuthenticationError,
  ConflictError,
} from '../types/index.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('username').optional().isLength({ min: 3, max: 100 }),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { email, password, username } = req.body;

    // Check if registration is enabled
    if (process.env.ENABLE_REGISTRATION === 'false') {
      throw new ValidationError('Registration is currently disabled');
    }

    // Validate email format
    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const userResult = await client.query<User>(
        `INSERT INTO users (email, password_hash, username, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING id, email, username, created_at, updated_at, last_login, is_active`,
        [email.toLowerCase(), passwordHash, username || null]
      );

      const user = userResult.rows[0];

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      // Create session
      const sessionToken = token;
      const expiresAt = getSessionExpiration();

      await client.query(
        `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          sessionToken,
          expiresAt,
          req.ip,
          req.headers['user-agent'] || null,
        ]
      );

      await client.query('COMMIT');

      logger.info(`New user registered: ${email}`);

      const response: AuthResponse = {
        user: sanitizeUser(user),
        token: sessionToken,
        expires_at: expiresAt,
      };

      res.status(201).json({
        success: true,
        data: response,
        message: 'User registered successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { email, password } = req.body;

    // Get user from database
    const userResult = await query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw new AuthenticationError('Account is inactive');
    }

    // Verify password
    if (!user.password_hash) {
      throw new AuthenticationError('Invalid account configuration');
    }

    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Create session
    const expiresAt = getSessionExpiration();

    // Delete old expired sessions
    await query('DELETE FROM sessions WHERE user_id = $1 AND expires_at < NOW()', [
      user.id,
    ]);

    await query(
      `INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, token, expiresAt, req.ip, req.headers['user-agent'] || null]
    );

    logger.info(`User logged in: ${email}`);

    const response: AuthResponse = {
      user: sanitizeUser(user),
      token,
      expires_at: expiresAt,
    };

    res.json({
      success: true,
      data: response,
      message: 'Login successful',
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate session)
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      await query('DELETE FROM sessions WHERE token = $1', [token]);
      logger.info(`User logged out: ${req.user?.email}`);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    res.json({
      success: true,
      data: req.user,
    });
  })
);

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  [
    body('username').optional().isLength({ min: 3, max: 100 }),
    body('email').optional().isEmail(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { username, email } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }

    if (email !== undefined) {
      // Check if email is already taken
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), req.user.id]
      );

      if (existingUser.rows.length > 0) {
        throw new ConflictError('Email already in use');
      }

      updates.push(`email = $${paramCount++}`);
      values.push(email.toLowerCase());
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    values.push(req.user.id);

    const result = await query<User>(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING id, email, username, created_at, updated_at, last_login, is_active`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully',
    });
  })
);

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const userResult = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    if (!user.password_hash) {
      throw new AuthenticationError('Invalid account configuration');
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password_hash);

    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      newPasswordHash,
      req.user.id,
    ]);

    // Invalidate all sessions except current
    const currentToken = req.headers.authorization?.split(' ')[1];
    await query('DELETE FROM sessions WHERE user_id = $1 AND token != $2', [
      req.user.id,
      currentToken || '',
    ]);

    logger.info(`Password changed for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

/**
 * @route   GET /api/auth/sessions
 * @desc    Get all active sessions
 * @access  Private
 */
router.get(
  '/sessions',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    const result = await query<Session>(
      `SELECT id, created_at, last_activity, ip_address, user_agent, expires_at
       FROM sessions
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY last_activity DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  })
);

/**
 * @route   DELETE /api/auth/sessions/:sessionId
 * @desc    Delete a specific session
 * @access  Private
 */
router.delete(
  '/sessions/:sessionId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    const { sessionId } = req.params;

    // Verify session belongs to user
    const result = await query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        error: 'Session not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  })
);

export default router;
