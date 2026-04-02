// src/module/vendor/vendor.validation.ts
import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createVendorSchema = z.object({
  name   : z.string().trim().min(2, "Min 2 characters").max(200, "Max 200 characters"),
  phone  : z.string().trim().min(1, "Phone is required"),
  email  : z.string().trim().email("Invalid email").toLowerCase().optional().nullable(),
  address: z.string().trim().optional().nullable(),
});

export const updateVendorSchema = z.object({
  name   : z.string().trim().min(2).max(200).optional(),
  phone  : z.string().trim().min(1).optional(),
  email  : z.string().trim().email().toLowerCase().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const addNoteSchema = z.object({
  text: z.string().trim().min(1, "Note text is required").max(1000, "Max 1000 characters"),
});

export const vendorParamsSchema = z.object({
  id: objectId,
});

export const noteParamsSchema = z.object({
  id    : objectId,
  noteId: objectId,
});

export const vendorQuerySchema = z.object({
  page     : z.string().optional().transform((v) => parseInt(v ?? "1")),
  limit    : z.string().optional().transform((v) => parseInt(v ?? "10")),
  search   : z.string().trim().optional(),
  is_active: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
  sort_by  : z.enum(["name", "due", "createdAt"]).optional().default("createdAt"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});