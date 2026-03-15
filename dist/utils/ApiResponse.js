"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static created(res, data, message = 'Created successfully') {
        return res.status(201).json({
            success: true,
            message,
            data,
        });
    }
    static error(res, message = 'Something went wrong', statusCode = 500, errors) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors: errors || null,
        });
    }
    static paginated(res, data, total, page, limit) {
        return res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        });
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=ApiResponse.js.map