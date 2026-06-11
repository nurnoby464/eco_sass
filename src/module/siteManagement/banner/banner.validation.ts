import { z } from "zod";

// Create Banner Validation
export const createBannerSchema = z
  .object({
    text: z
      .string()
      .max(500, "Text cannot exceed 500 characters")
      .optional()
      .nullable(),
    imageUrl: z
      .string()
      .url("Please provide a valid image URL")
      .min(1, "Image URL is required"),
    imagePublicId: z.string().optional(),
    active: z.boolean().default(false),
    order: z.number().int().min(0).default(0),
    linkUrl: z.string().optional().nullable(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

// Update Banner Validation
export const BannerParams = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid banner ID format"),
});

export const updateBannerSchema = z
  .object({
    text: z.string().max(500).optional().nullable(),
    imageUrl: z.string().url().optional(),
    imagePublicId: z.string().optional(),
    active: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
    linkUrl: z.string().optional().nullable(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

// Get Banners Query Validation
export const getBannersQuerySchema = z.object({
  active: z.enum(["true", "false"]).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(["createdAt", "order", "updatedAt"]).default("order"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Delete Banner Validation
export const deleteBannerSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid banner ID format"),
});

// Get Single Banner Validation
export const getBannerSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid banner ID format"),
});

// Bulk Update Validation (for reordering)
export const bulkUpdateBannersSchema = z.object({
  banners: z.array(
    z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/),
      order: z.number().int().min(0),
      active: z.boolean().optional(),
    }),
  ),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type GetBannersQuery = z.infer<typeof getBannersQuerySchema>;
