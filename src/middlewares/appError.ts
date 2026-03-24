/**
 * AppError — throw this anywhere in your app.
 * The global error handler reads statusCode, message, and isOperational.
 *
 * isOperational = true  → expected error (wrong input, not found, etc.)
 * isOperational = false → unexpected bug (programmer error)
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode    = statusCode;
    this.isOperational = isOperational;

    // Keeps the prototype chain intact for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Removes AppError constructor from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}