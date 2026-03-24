import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError }          from 'mongoose';
import { MongoServerError }                from 'mongodb';
import { ApiResponse }                     from '../utils/ApiResponse';
import { AppError } from './appError';

// ─── Mongoose / MongoDB error normalizers ─────────────────

function handleCastError(err: MongooseError.CastError): AppError {
  return new AppError(`Invalid ${err.path}: "${err.value}"`, 400);
}

function handleValidationError(err: MongooseError.ValidationError): AppError {
  const messages = Object.values(err.errors).map(e => e.message).join('. ');
  return new AppError(`Validation error: ${messages}`, 400);
}

function handleDuplicateKeyError(err: MongoServerError): AppError {
  const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
  const value = err.keyValue?.[field];
  return new AppError(`${field} "${value}" is already taken`, 409);
}

// ─── Global error handler ─────────────────────────────────
// Must have exactly 4 parameters so Express recognizes it as an error handler.

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  // ── 1. Normalize third-party errors into AppError ────────
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof MongooseError.CastError) {
    error = handleCastError(err);
  } else if (err instanceof MongooseError.ValidationError) {
    error = handleValidationError(err);
  } else if (err instanceof MongoServerError && err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err instanceof Error) {
    // Unknown programmer error — don't leak internals in production
    error = new AppError(
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
      500,
      false,
    );
  } else {
    error = new AppError('Something went wrong', 500, false);
  }

  // ── 2. Log non-operational (bug) errors ──────────────────
  if (!error.isOperational) {
    console.error('💥 UNHANDLED ERROR:', err);
    // Plug in your logger here: logger.error(err)
  }

  // ── 3. Send response ─────────────────────────────────────
  return ApiResponse.error(res, error.message, error.statusCode);
};

// ─── 404 handler (mount before globalErrorHandler) ────────

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};