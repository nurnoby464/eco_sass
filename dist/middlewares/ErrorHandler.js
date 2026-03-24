"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.globalErrorHandler = void 0;
const mongoose_1 = require("mongoose");
const mongodb_1 = require("mongodb");
const ApiResponse_1 = require("../utils/ApiResponse");
const appError_1 = require("./appError");
// ─── Mongoose / MongoDB error normalizers ─────────────────
function handleCastError(err) {
    return new appError_1.AppError(`Invalid ${err.path}: "${err.value}"`, 400);
}
function handleValidationError(err) {
    const messages = Object.values(err.errors).map(e => e.message).join('. ');
    return new appError_1.AppError(`Validation error: ${messages}`, 400);
}
function handleDuplicateKeyError(err) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    const value = err.keyValue?.[field];
    return new appError_1.AppError(`${field} "${value}" is already taken`, 409);
}
// ─── Global error handler ─────────────────────────────────
// Must have exactly 4 parameters so Express recognizes it as an error handler.
const globalErrorHandler = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    // ── 1. Normalize third-party errors into AppError ────────
    let error;
    if (err instanceof appError_1.AppError) {
        error = err;
    }
    else if (err instanceof mongoose_1.Error.CastError) {
        error = handleCastError(err);
    }
    else if (err instanceof mongoose_1.Error.ValidationError) {
        error = handleValidationError(err);
    }
    else if (err instanceof mongodb_1.MongoServerError && err.code === 11000) {
        error = handleDuplicateKeyError(err);
    }
    else if (err instanceof Error) {
        // Unknown programmer error — don't leak internals in production
        error = new appError_1.AppError(process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message, 500, false);
    }
    else {
        error = new appError_1.AppError('Something went wrong', 500, false);
    }
    // ── 2. Log non-operational (bug) errors ──────────────────
    if (!error.isOperational) {
        console.error('💥 UNHANDLED ERROR:', err);
        // Plug in your logger here: logger.error(err)
    }
    // ── 3. Send response ─────────────────────────────────────
    return ApiResponse_1.ApiResponse.error(res, error.message, error.statusCode);
};
exports.globalErrorHandler = globalErrorHandler;
// ─── 404 handler (mount before globalErrorHandler) ────────
const notFoundHandler = (req, _res, next) => {
    next(new appError_1.AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=ErrorHandler.js.map