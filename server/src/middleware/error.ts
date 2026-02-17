import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/index.js";
import logger from "../utils/logger.js";

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle operational errors
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: "Token expired",
    });
    return;
  }

  // Handle database errors
  if (err.message && err.message.includes("duplicate key")) {
    res.status(409).json({
      success: false,
      error: "Resource already exists",
    });
    return;
  }

  // Default to 500 server error
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
}

/**
 * Handle 404 errors
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
