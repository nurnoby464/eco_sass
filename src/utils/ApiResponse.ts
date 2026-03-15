import { Response } from 'express';

export class ApiResponse {

  static success(res: Response, data: any, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res: Response, data: any, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message = 'Something went wrong', statusCode = 500, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors || null,
    });
  }

  static paginated(res: Response, data: any, total: number, page: number, limit: number) {
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