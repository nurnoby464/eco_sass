import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../middlewares/appError';

/**
 * Wraps an async controller and catches any thrown error.
 * - AppError   → forwarded to next() as-is (already structured)
 * - Any other  → wrapped in a generic 500 AppError first, then forwarded
 *
 * This guarantees the global error handler always receives an AppError.
 */
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
      if (err instanceof AppError) {
        // Already structured — pass straight through
        return next(err);
      }

      // Unknown error (Mongoose driver crash, typo, etc.)
      // Wrap it so the global handler always gets a consistent shape
      const wrapped = new AppError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
        500,
        false, // isOperational = false → log this as a bug
      );

      return next(wrapped);
    });
  };
};