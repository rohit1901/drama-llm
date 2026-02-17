import { Router, Request, Response } from "express";
import {
  body,
  query as validateQuery,
  validationResult,
} from "express-validator";
import { query, getClient } from "../db/pool.js";
import {
  authenticate,
  verifyConversationOwnership,
} from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";
import {
  Conversation,
  ConversationWithCount,
  Message,
  ValidationError,
  NotFoundError,
  ConversationExport,
} from "../types/index.js";
import logger from "../utils/logger.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get(
  "/",
  [
    validateQuery("page").optional().isInt({ min: 1 }),
    validateQuery("limit").optional().isInt({ min: 1, max: 100 }),
    validateQuery("search").optional().isString(),
    validateQuery("model").optional().isString(),
    validateQuery("sort_by")
      .optional()
      .isIn(["created_at", "updated_at", "title"]),
    validateQuery("sort_order").optional().isIn(["asc", "desc"]),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    if (!req.user) {
      throw new ValidationError("User not authenticated");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const model = req.query.model as string;
    const sortBy = (req.query.sort_by as string) || "updated_at";
    const sortOrder = (req.query.sort_order as string) || "desc";

    // Build query
    let queryText = `
      SELECT * FROM get_conversations_with_count($1)
      WHERE 1=1
    `;
    const queryParams: unknown[] = [req.user.id];
    let paramCount = 2;

    if (search) {
      queryText += ` AND (title ILIKE $${paramCount} OR last_message ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (model) {
      queryText += ` AND model = $${paramCount}`;
      queryParams.push(model);
      paramCount++;
    }

    queryText += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    // Get conversations
    const result = await query<ConversationWithCount>(queryText, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM conversations
      WHERE user_id = $1 AND is_deleted = false
    `;
    const countParams: unknown[] = [req.user.id];
    let countParamIndex = 2;

    if (search) {
      countQuery += ` AND title ILIKE $${countParamIndex}`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (model) {
      countQuery += ` AND model = $${countParamIndex}`;
      countParams.push(model);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  }),
);

/**
 * @route   POST /api/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post(
  "/",
  [
    body("title").optional().isString().isLength({ min: 1, max: 255 }),
    body("model").notEmpty().withMessage("Model is required"),
    body("settings").optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    if (!req.user) {
      throw new ValidationError("User not authenticated");
    }

    const { title, model, settings } = req.body;

    const result = await query<Conversation>(
      `INSERT INTO conversations (user_id, title, model, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        req.user.id,
        title || "New Conversation",
        model,
        settings ? JSON.stringify(settings) : "{}",
      ],
    );

    logger.info(
      `New conversation created: ${result.rows[0].id} by user: ${req.user.email}`,
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Conversation created successfully",
    });
  }),
);

/**
 * @route   GET /api/conversations/:id
 * @desc    Get a specific conversation with messages
 * @access  Private
 */
router.get(
  "/:id",
  verifyConversationOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get conversation
    const conversationResult = await query<Conversation>(
      "SELECT * FROM conversations WHERE id = $1 AND is_deleted = false",
      [id],
    );

    if (conversationResult.rows.length === 0) {
      throw new NotFoundError("Conversation not found");
    }

    // Get messages
    const messagesResult = await query<Message>(
      `SELECT * FROM messages
       WHERE conversation_id = $1 AND is_deleted = false
       ORDER BY created_at ASC`,
      [id],
    );

    res.json({
      success: true,
      data: {
        conversation: conversationResult.rows[0],
        messages: messagesResult.rows,
      },
    });
  }),
);

/**
 * @route   PUT /api/conversations/:id
 * @desc    Update a conversation
 * @access  Private
 */
router.put(
  "/:id",
  verifyConversationOwnership,
  [
    body("title").optional().isString().isLength({ min: 1, max: 255 }),
    body("model").optional().isString(),
    body("settings").optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { id } = req.params;
    const { title, model, settings } = req.body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (model !== undefined) {
      updates.push(`model = $${paramCount++}`);
      values.push(model);
    }

    if (settings !== undefined) {
      updates.push(`settings = $${paramCount++}`);
      values.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      throw new ValidationError("No fields to update");
    }

    values.push(id);

    const result = await query<Conversation>(
      `UPDATE conversations
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: "Conversation updated successfully",
    });
  }),
);

/**
 * @route   DELETE /api/conversations/:id
 * @desc    Delete a conversation (soft delete)
 * @access  Private
 */
router.delete(
  "/:id",
  verifyConversationOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await query(
      "UPDATE conversations SET is_deleted = true, updated_at = NOW() WHERE id = $1",
      [id],
    );

    logger.info(`Conversation deleted: ${id} by user: ${req.user?.email}`);

    res.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  }),
);

/**
 * @route   POST /api/conversations/:id/messages
 * @desc    Add a message to a conversation
 * @access  Private
 */
router.post(
  "/:id/messages",
  verifyConversationOwnership,
  [
    body("role")
      .isIn(["user", "assistant", "system"])
      .withMessage("Invalid role"),
    body("content").notEmpty().withMessage("Content is required"),
    body("metadata").optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { id } = req.params;
    const { role, content, metadata } = req.body;

    const client = await getClient();

    try {
      await client.query("BEGIN");

      // Insert message
      const messageResult = await client.query<Message>(
        `INSERT INTO messages (conversation_id, role, content, metadata)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, role, content, metadata ? JSON.stringify(metadata) : "{}"],
      );

      // Update conversation timestamp
      await client.query(
        "UPDATE conversations SET updated_at = NOW() WHERE id = $1",
        [id],
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        data: messageResult.rows[0],
        message: "Message added successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }),
);

/**
 * @route   GET /api/conversations/:id/messages
 * @desc    Get messages for a conversation
 * @access  Private
 */
router.get(
  "/:id/messages",
  verifyConversationOwnership,
  [
    validateQuery("page").optional().isInt({ min: 1 }),
    validateQuery("limit").optional().isInt({ min: 1, max: 100 }),
    validateQuery("before").optional().isISO8601(),
    validateQuery("after").optional().isISO8601(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const before = req.query.before as string;
    const after = req.query.after as string;

    let queryText = `
      SELECT * FROM messages
      WHERE conversation_id = $1 AND is_deleted = false
    `;
    const queryParams: unknown[] = [id];
    let paramCount = 2;

    if (before) {
      queryText += ` AND created_at < $${paramCount++}`;
      queryParams.push(before);
    }

    if (after) {
      queryText += ` AND created_at > $${paramCount++}`;
      queryParams.push(after);
    }

    queryText += ` ORDER BY created_at ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query<Message>(queryText, queryParams);

    // Get total count
    const countResult = await query(
      "SELECT COUNT(*) as total FROM messages WHERE conversation_id = $1 AND is_deleted = false",
      [id],
    );
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  }),
);

/**
 * @route   PUT /api/conversations/:conversationId/messages/:messageId
 * @desc    Update a message
 * @access  Private
 */
router.put(
  "/:conversationId/messages/:messageId",
  verifyConversationOwnership,
  [
    body("content").optional().isString().notEmpty(),
    body("metadata").optional().isObject(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { conversationId, messageId } = req.params;
    const { content, metadata } = req.body;

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      throw new ValidationError("No fields to update");
    }

    values.push(messageId, conversationId);

    const result = await query<Message>(
      `UPDATE messages
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${paramCount} AND conversation_id = $${paramCount + 1}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      throw new NotFoundError("Message not found");
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: "Message updated successfully",
    });
  }),
);

/**
 * @route   DELETE /api/conversations/:conversationId/messages/:messageId
 * @desc    Delete a message (soft delete)
 * @access  Private
 */
router.delete(
  "/:conversationId/messages/:messageId",
  verifyConversationOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const { conversationId, messageId } = req.params;

    const result = await query(
      `UPDATE messages
       SET is_deleted = true, updated_at = NOW()
       WHERE id = $1 AND conversation_id = $2`,
      [messageId, conversationId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("Message not found");
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  }),
);

/**
 * @route   GET /api/conversations/:id/export
 * @desc    Export conversation as JSON
 * @access  Private
 */
router.get(
  "/:id/export",
  verifyConversationOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get conversation
    const conversationResult = await query<Conversation>(
      "SELECT * FROM conversations WHERE id = $1 AND is_deleted = false",
      [id],
    );

    if (conversationResult.rows.length === 0) {
      throw new NotFoundError("Conversation not found");
    }

    // Get messages
    const messagesResult = await query<Message>(
      `SELECT * FROM messages
       WHERE conversation_id = $1 AND is_deleted = false
       ORDER BY created_at ASC`,
      [id],
    );

    const exportData: ConversationExport = {
      conversation: conversationResult.rows[0],
      messages: messagesResult.rows,
      exported_at: new Date(),
    };

    res.json({
      success: true,
      data: exportData,
    });
  }),
);

/**
 * @route   POST /api/conversations/:id/duplicate
 * @desc    Duplicate a conversation
 * @access  Private
 */
router.post(
  "/:id/duplicate",
  verifyConversationOwnership,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      throw new ValidationError("User not authenticated");
    }

    const client = await getClient();

    try {
      await client.query("BEGIN");

      // Get original conversation
      const originalConv = await client.query<Conversation>(
        "SELECT * FROM conversations WHERE id = $1 AND is_deleted = false",
        [id],
      );

      if (originalConv.rows.length === 0) {
        throw new NotFoundError("Conversation not found");
      }

      const original = originalConv.rows[0];

      // Create duplicate conversation
      const newConv = await client.query<Conversation>(
        `INSERT INTO conversations (user_id, title, model, settings)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          req.user.id,
          `${original.title} (Copy)`,
          original.model,
          JSON.stringify(original.settings),
        ],
      );

      // Get original messages
      const messages = await client.query<Message>(
        `SELECT * FROM messages
         WHERE conversation_id = $1 AND is_deleted = false
         ORDER BY created_at ASC`,
        [id],
      );

      // Duplicate messages
      if (messages.rows.length > 0) {
        const values = messages.rows
          .map(
            (msg, idx) =>
              `($1, $${idx * 3 + 2}, $${idx * 3 + 3}, $${idx * 3 + 4})`,
          )
          .join(", ");

        const params = [newConv.rows[0].id];
        messages.rows.forEach((msg) => {
          params.push(msg.role, msg.content, JSON.stringify(msg.metadata));
        });

        await client.query(
          `INSERT INTO messages (conversation_id, role, content, metadata)
           VALUES ${values}`,
          params,
        );
      }

      await client.query("COMMIT");

      logger.info(`Conversation duplicated: ${id} -> ${newConv.rows[0].id}`);

      res.status(201).json({
        success: true,
        data: newConv.rows[0],
        message: "Conversation duplicated successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }),
);

export default router;
