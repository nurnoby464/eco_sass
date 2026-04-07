"use strict";
// interface CreatePurchasePayload extends CreatePurchaseInput {
//   company_id: mongoose.Types.ObjectId;
//   createdBy: mongoose.Types.ObjectId;
// }
Object.defineProperty(exports, "__esModule", { value: true });
// interface ResolvedLineItem {
//   product_id: mongoose.Types.ObjectId;
//   variant_id: mongoose.Types.ObjectId;
//   product_name: string;
//   sku: string;
//   quantity: number;
//   unit_price: number;
//   selling_price: number;
//   total: number;
// }
// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function round2(n: number): number {
//   return Math.round(n * 100) / 100;
// }
// function buildSlug(name: string): string {
//   return name
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, "-");
// }
// function buildProductSku(name: string): string {
//   return (
//     name
//       .trim()
//       .toUpperCase()
//       .replace(/[^A-Z0-9]+/g, "-")
//       .slice(0, 12) +
//     "-" +
//     Date.now().toString().slice(-5)
//   );
// }
// function buildVariantSku(productSku: string, color: string, size: string): string {
//   const clean = (s: string) =>
//     s.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 8);
//   return `${productSku}-${clean(color)}-${clean(size)}`;
// }
// // variant attribute lookup key for Map
// function variantKey(
//   productId: string,
//   color: string,
//   size: string,
// ): string {
//   return `${productId}|${color.trim().toLowerCase()}|${size.trim().toLowerCase()}`;
// }
// // ─── Stage 1: Bulk upsert categories ─────────────────────────────────────────
// async function bulkUpsertCategories(
//   names: string[],
//   company_id: mongoose.Types.ObjectId,
//   createdBy: mongoose.Types.ObjectId,
//   session: ClientSession,
// ): Promise<Map<string, mongoose.Types.ObjectId>> {
//   const unique = [...new Set(names.map((n) => n.trim().toLowerCase()))];
//   const existing = await Category.find({
//     company_id,
//     name: { $in: unique.map((n) => new RegExp(`^${n}$`, "i")) },
//   })
//     .session(session)
//     .lean<any[]>();
//   const map = new Map<string, mongoose.Types.ObjectId>(
//     existing.map((c) => [c.name.toLowerCase(), c._id]),
//   );
//   const missing = unique.filter((n) => !map.has(n));
//   if (missing.length > 0) {
//     const created = await Category.insertMany(
//       missing.map((name) =>
//         sanitizeData({
//           company_id,
//           createdBy,
//           name: name.trim(),
//           slug: buildSlug(name),
//         }),
//       ),
//       { session },
//     );
//     created.forEach((c) => map.set(c.name.toLowerCase(), c._id));
//   }
//   return map;
// }
// // ─── Stage 2: Bulk upsert products ───────────────────────────────────────────
// async function bulkUpsertProducts(
//   items: CreatePurchaseInput["items"],
//   categoryMap: Map<string, mongoose.Types.ObjectId>,
//   vendor_id: mongoose.Types.ObjectId,
//   company_id: mongoose.Types.ObjectId,
//   createdBy: mongoose.Types.ObjectId,
//   session: ClientSession,
// ): Promise<Map<string, { _id: mongoose.Types.ObjectId; sku: string }>> {
//   // deduplicate by product name
//   const uniqueItems = [
//     ...new Map(
//       items.map((i) => [i.product_name.trim().toLowerCase(), i]),
//     ).values(),
//   ];
//   const existing = await Product.find({
//     company_id,
//     name: {
//       $in: uniqueItems.map((i) => new RegExp(`^${i.product_name.trim()}$`, "i")),
//     },
//   })
//     .session(session)
//     .lean<any[]>();
//   const map = new Map<string, { _id: mongoose.Types.ObjectId; sku: string }>(
//     existing.map((p) => [p.name.toLowerCase(), { _id: p._id, sku: p.sku }]),
//   );
//   const missing = uniqueItems.filter(
//     (i) => !map.has(i.product_name.trim().toLowerCase()),
//   );
//   if (missing.length > 0) {
//     const created = await Product.insertMany(
//       missing.map((i) => {
//         const category_id = categoryMap.get(i.category.trim().toLowerCase())!;
//         const sku = buildProductSku(i.product_name);
//         return {
//           company_id,
//           category_id,
//           vendor_id,
//           name: i.product_name.trim(),
//           slug: buildSlug(i.product_name) + "-" + Date.now(),
//           sku,
//           buying_price: i.unit_price,
//           selling_price: i.selling_price,
//           has_variants: true,
//           stock: 0,
//           is_active: true,
//           createdBy,
//         };
//       }),
//       { session },
//     );
//     created.forEach((p) => map.set(p.name.toLowerCase(), { _id: p._id, sku: p.sku }));
//   }
//   return map;
// }
// // ─── Stage 3: Bulk upsert variants ───────────────────────────────────────────
// async function bulkUpsertVariants(
//   items: CreatePurchaseInput["items"],
//   productMap: Map<string, { _id: mongoose.Types.ObjectId; sku: string }>,
//   company_id: mongoose.Types.ObjectId,
//   session: ClientSession,
// ): Promise<Map<string, { _id: mongoose.Types.ObjectId; sku: string }>> {
//   const productIds = [...new Set(
//     items.map((i) => productMap.get(i.product_name.trim().toLowerCase())!._id),
//   )];
//   const existing = await ProductVariant.find({
//     company_id,
//     product_id: { $in: productIds },
//   })
//     .session(session)
//     .lean<any[]>();
//   const map = new Map<string, { _id: mongoose.Types.ObjectId; sku: string }>(
//     existing.map((v) => {
//       const color = v.attributes?.find((a: any) => a.key === "color")?.value ?? "";
//       const size = v.attributes?.find((a: any) => a.key === "size")?.value ?? "";
//       return [variantKey(v.product_id.toString(), color, size), { _id: v._id, sku: v.sku }];
//     }),
//   );
//   const toCreate: typeof items = [];
//   const toUpdate: Array<{
//     variantId: mongoose.Types.ObjectId;
//     quantity: number;
//     buying_price: number;
//     selling_price: number;
//   }> = [];
//   for (const item of items) {
//     const product = productMap.get(item.product_name.trim().toLowerCase())!;
//     const key = variantKey(product._id.toString(), item.color, item.size);
//     if (map.has(key)) {
//       const variant = existing.find((v) => {
//         const c = v.attributes?.find((a: any) => a.key === "color")?.value ?? "";
//         const s = v.attributes?.find((a: any) => a.key === "size")?.value ?? "";
//         return variantKey(v.product_id.toString(), c, s) === key;
//       });
//       if (variant) {
//         toUpdate.push({
//           variantId: variant._id,
//           quantity: item.quantity,
//           buying_price: item.unit_price,
//           selling_price: item.selling_price,
//         });
//       }
//     } else {
//       toCreate.push(item);
//     }
//   }
//   // Parallel stock increments for existing variants
//   if (toUpdate.length > 0) {
//     await Promise.all(
//       toUpdate.map(({ variantId, quantity, buying_price, selling_price }) =>
//         ProductVariant.findByIdAndUpdate(
//           variantId,
//           { $inc: { stock: quantity }, $set: { buying_price, selling_price } },
//           { session },
//         ),
//       ),
//     );
//   }
//   // insertMany for new variants
//   if (toCreate.length > 0) {
//     const created = await ProductVariant.insertMany(
//       toCreate.map((item) => {
//         const product = productMap.get(item.product_name.trim().toLowerCase())!;
//         const sku = buildVariantSku(product.sku, item.color, item.size);
//         return {
//           product_id: product._id,
//           company_id,
//           sku,
//           attributes: [
//             { key: "color", value: item.color.trim() },
//             { key: "size", value: item.size.trim() },
//           ],
//           buying_price: item.unit_price,
//           selling_price: item.selling_price,
//           stock: item.quantity,
//           low_stock_alert: item.low_stock_alert ?? 5,
//           is_active: true,
//         };
//       }),
//       { session },
//     );
//     created.forEach((v) => {
//       const color = v.attributes?.find((a: any) => a.key === "color")?.value ?? "";
//       const size = v.attributes?.find((a: any) => a.key === "size")?.value ?? "";
//       const key = variantKey(v.product_id.toString(), color, size);
//       map.set(key, { _id: v._id, sku: v.sku });
//     });
//   }
//   return map;
// }
// // ─── Create purchase ──────────────────────────────────────────────────────────
// export const createPurchase = async (
//   payload: CreatePurchasePayload,
//   req: Request,
// ) => {
//   const {
//     vendor_id,
//     purchase_date,
//     paid_amount,
//     note,
//     items,
//     company_id,
//     createdBy,
//   } = payload;
//   const vendor = await Vendor.findOne({
//     _id: vendor_id,
//     company_id,
//     is_active: true,
//   }).lean<any>();
//   if (!vendor) throw new AppError("Vendor not found", 404);
//   const session = await mongoose.startSession();
//   try {
//     let purchase: any;
//     await session.withTransaction(async () => {
//       // ── Stage 1: Categories ──────────────────────────────────────────────
//       const categoryMap = await bulkUpsertCategories(
//         items.map((i) => i.category),
//         company_id,
//         createdBy,
//         session,
//       );
//       // ── Stage 2: Products ────────────────────────────────────────────────
//       const productMap = await bulkUpsertProducts(
//         items,
//         categoryMap,
//         new mongoose.Types.ObjectId(vendor_id),
//         company_id,
//         createdBy,
//         session,
//       );
//       // ── Stage 3: Variants ────────────────────────────────────────────────
//       const variantMap = await bulkUpsertVariants(
//         items,
//         productMap,
//         company_id,
//         session,
//       );
//       // ── Build resolved line items from maps (zero extra DB calls) ────────
//       const resolvedItems: ResolvedLineItem[] = items.map((item) => {
//         const product = productMap.get(item.product_name.trim().toLowerCase())!;
//         const key = variantKey(product._id.toString(), item.color, item.size);
//         const variant = variantMap.get(key)!;
//         return {
//           product_id: product._id,
//           variant_id: variant._id,
//           product_name: item.product_name.trim(),
//           sku: variant.sku,
//           quantity: item.quantity,
//           unit_price: item.unit_price,
//           selling_price: item.selling_price,
//           total: round2(item.unit_price * item.quantity),
//         };
//       });
//       const total_amount = round2(
//         resolvedItems.reduce((sum, i) => sum + i.total, 0),
//       );
//       const product_ids = [
//         ...new Set(resolvedItems.map((i) => i.product_id.toString())),
//       ].map((id) => new mongoose.Types.ObjectId(id));
//       // ── Create purchase document ─────────────────────────────────────────
//       const [created] = await Purchase.create(
//         [
//           {
//             company_id,
//             vendor_id: new mongoose.Types.ObjectId(vendor_id),
//             product_ids,
//             item_count: resolvedItems.length,
//             total_amount,
//             paid_amount: paid_amount ?? 0,
//             purchase_date: purchase_date ? new Date(purchase_date) : new Date(),
//             note: note ?? null,
//             createdBy,
//           },
//         ],
//         { session },
//       );
//       purchase = created;
//     });
//     if (!purchase) throw new AppError("Failed to create purchase", 500);
//     auditLog({
//       req,
//       action: AUDIT_ACTIONS.PURCHASE_CREATED,
//       targetModel: "Purchase",
//       targetId: purchase._id,
//       after: {
//         vendor_name: vendor.name,
//         total_amount: purchase.total_amount,
//         item_count: purchase.item_count,
//         status: purchase.status,
//         total_paid: purchase.paid_amount,
//         due_amount: purchase.due_amount,
//       },
//     });
//     return purchase;
//   } finally {
//     await session.endSession();
//   }
// };
//# sourceMappingURL=test.js.map