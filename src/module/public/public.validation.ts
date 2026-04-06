import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });
export const productParamsSchema = z.object({
  id: objectId,
});

export type GetProductParamsQuery = z.infer<typeof productParamsSchema>;