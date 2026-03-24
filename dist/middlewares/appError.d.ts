/**
 * AppError — throw this anywhere in your app.
 * The global error handler reads statusCode, message, and isOperational.
 *
 * isOperational = true  → expected error (wrong input, not found, etc.)
 * isOperational = false → unexpected bug (programmer error)
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
//# sourceMappingURL=appError.d.ts.map