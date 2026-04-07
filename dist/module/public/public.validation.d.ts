import { z } from "zod";
export declare const productParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type GetProductParamsQuery = z.infer<typeof productParamsSchema>;
//# sourceMappingURL=public.validation.d.ts.map