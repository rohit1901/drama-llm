import { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "../utils/auth";
import { query } from "../db/pool";
import { User, AuthenticationError, AuthorizationError } from "../types/index";
import logger from "../utils/logger";

// Extend Express Request type to include user
declare module "express-serve-static-core" {
  interface Request {
    user?: Omit<User, "password_hash">;
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new AuthenticationError("No token provided");
    }

    // Verify token
    const payload = verifyToken(token);

    // Get user from database
    const result = await query<User>(
      "SELECT id, email, username, created_at, updated_at, last_login, is_active FROM users WHERE id = $1",
      [payload.userId],
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError("User not found");
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw new AuthorizationError("User account is inactive");
    }

    // Check if session exists and is valid
    const sessionResult = await query(
      "SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()",
      [token],
    );

    if (sessionResult.rows.length === 0) {
      throw new AuthenticationError("Session expired or invalid");
    }

    // Update last activity
    await query("UPDATE sessions SET last_activity = NOW() WHERE token = $1", [
      token,
    ]);

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      logger.error("Authentication error:", error);
      res.status(401).json({
        success: false,
        error: "Authentication failed",
      });
    }
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return next();
    }

    const payload = verifyToken(token);
    const result = await query<User>(
      "SELECT id, email, username, created_at, updated_at, last_login, is_active FROM users WHERE id = $1",
      [payload.userId],
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      req.user = result.rows[0];
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

/**
 * Middleware to check if user owns a resource
 */
export function requireOwnership(resourceUserIdField: string = "user_id") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError("Not authenticated");
      }

      // Check if the resource belongs to the user
      const resourceUserId =
        req.params[resourceUserIdField] || req.body[resourceUserIdField];

      if (resourceUserId && resourceUserId !== req.user.id) {
        throw new AuthorizationError(
          "You do not have permission to access this resource",
        );
      }

      next();
    } catch (error) {
      if (
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError
      ) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        logger.error("Ownership check error:", error);
        res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }
    }
  };
}

/**
 * Middleware to verify conversation ownership
 */
export async function verifyConversationOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AuthenticationError("Not authenticated");
    }

    const conversationId = req.params.conversationId || req.params.id;

    if (!conversationId) {
      throw new Error("Conversation ID not provided");
    }

    const result = await query(
      "SELECT user_id FROM conversations WHERE id = $1 AND is_deleted = false",
      [conversationId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
      return;
    }

    if (result.rows[0].user_id !== req.user.id) {
      throw new AuthorizationError(
        "You do not have permission to access this conversation",
      );
    }

    next();
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      logger.error("Conversation ownership verification error:", error);
      res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }
  }
}
