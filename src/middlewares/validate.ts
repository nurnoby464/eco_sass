// src/middlewares/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiResponse } from '../utils/ApiResponse';
import { ParsedQs } from 'qs';

interface ValidateSchemas {
  body?  : ZodSchema;
  params?: ZodSchema;
  query? : ZodSchema;
}

export const validate = (schemas: ValidateSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];

    // ─── Validate req.body ────────────────────────────────
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach(err =>
          errors.push({
            field  : `body.${err.path.join('.')}`,
            message: err.message,
          })
        );
      } else {
        req.body = result.data; // replace with clean validated data
      }
    }

    // ─── Validate req.params ──────────────────────────────
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach(err =>
          errors.push({
            field  : `params.${err.path.join('.')}`,
            message: err.message,
          })
        );
      }
    }

    // ─── Validate req.query ───────────────────────────────
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach(err =>
          errors.push({
            field  : `query.${err.path.join('.')}`,
            message: err.message,
          })
        );
      } else {
        req.query = result.data as ParsedQs // replace with clean validated data
      }
    }

    // ─── If any errors — stop here ────────────────────────
    if (errors.length > 0) {
      return ApiResponse.error(res, 'Validation failed', 400, errors);
    }

    next();
  };
};