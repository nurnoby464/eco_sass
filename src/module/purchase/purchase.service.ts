// src/module/purchase/purchase.service.ts
import mongoose, { ClientSession } from "mongoose";
import Purchase from "./purchase.schema";
import Product from "../product/product.schema";
import Vendor from "../vendor/vendor.schema";
import { AppError } from "../../middlewares/appError";
import ProductVariant from "../product-variant/product-variant.schema";
import {
  CreatePurchaseInput,
  ListPurchaseQuery,
  UpdatePurchaseInput,
} from "./purchase.validation";
import { auditLog } from "../../utils/auditLogger";
import { AUDIT_ACTIONS } from "../audit/audit.interface";
import { Request } from "express";
import { sanitizeData } from "../../utils/sanitizeData";
import Category from "../category/category.schema";

// Interface types

interface CreatePurchasePayload extends CreatePurchaseInput {
  company_id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

interface ResolvedLineItem {
  product_id: mongoose.Types.ObjectId;
  variant_id: mongoose.Types.ObjectId;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function buildProductSku(name: string): string {
  return (
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .slice(0, 12) +
    "-" +
    Date.now().toString().slice(-5)
  );
}

function buildVariantSku(
  productSku: string,
  color: string,
  size: string,
): string {
  const clean = (s: string) =>
    s
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .slice(0, 8);
  return `${productSku}-${clean(color)}-${clean(size)}`;
}

// variant attribute lookup key for Map
function variantKey(productId: string, color: string, size: string): string {
  return `${productId}|${color.trim().toLowerCase()}|${size.trim().toLowerCase()}`;
}

// ─── Stage 1: Bulk upsert categories ─────────────────────────────────────────

async function bulkUpsertCategories(
  names: string[],
  company_id: mongoose.Types.ObjectId,
  createdBy: mongoose.Types.ObjectId,
  session: ClientSession,
): Promise<Map<string, mongoose.Types.ObjectId>> {
  const unique = [...new Set(names.map((n) => n.trim().toLowerCase()))];

  const existing = await Category.find({
    company_id,
    name: { $in: unique.map((n) => new RegExp(`^${n}$`, "i")) },
  })
    .session(session)
    .lean<any[]>();

  const map = new Map<string, mongoose.Types.ObjectId>(
    existing.map((c) => [c.name.toLowerCase(), c._id]),
  );

  const missing = unique.filter((n) => !map.has(n));
  if (missing.length > 0) {
    const created = await Category.insertMany(
      missing.map((name) =>
        sanitizeData({
          company_id,
          createdBy,
          name: name.trim(),
          slug: buildSlug(name),
        }),
      ),
      { session },
    );
    created.forEach((c) => map.set(c.name.toLowerCase(), c._id));
  }

  return map;
}

// ─── Stage 2: Bulk upsert products ───────────────────────────────────────────

async function bulkUpsertProducts(
  items: CreatePurchaseInput["items"],
  categoryMap: Map<string, mongoose.Types.ObjectId>,
  vendor_id: mongoose.Types.ObjectId,
  company_id: mongoose.Types.ObjectId,
  createdBy: mongoose.Types.ObjectId,
  session: ClientSession,
): Promise<Map<string, { _id: mongoose.Types.ObjectId; sku: string }>> {
  // deduplicate by product name
  const uniqueItems = [
    ...new Map(
      items.map((i) => [i.product_name.trim().toLowerCase(), i]),
    ).values(),
  ];

  const existing = await Product.find({
    company_id,
    name: {
      $in: uniqueItems.map(
        (i) => new RegExp(`^${i.product_name.trim()}$`, "i"),
      ),
    },
  })
    .session(session)
    .lean<any[]>();

  const map = new Map<string, { _id: mongoose.Types.ObjectId; sku: string }>(
    existing.map((p) => [p.name.toLowerCase(), { _id: p._id, sku: p.sku }]),
  );
  const missing = uniqueItems.filter(
    (i) => !map.has(i.product_name.trim().toLowerCase()),
  );

  if (missing.length > 0) {
    const created = await Product.insertMany(
      missing.map((i) => {
        const category_id = categoryMap.get(i.category.trim().toLowerCase())!;
        const sku = buildProductSku(i.product_name);
        return {
          company_id,
          category_id,
          vendor_id,
          name: i.product_name.trim(),
          slug: buildSlug(i.product_name) + "-" + Date.now(),
          sku,
          buying_price: i.unit_price,
          selling_price: i.selling_price,
          has_variants: true,
          stock: 0,
          is_active: true,
          createdBy,
        };
      }),
      { session },
    );
    created.forEach((p) =>
      map.set(p.name.toLowerCase(), { _id: p._id, sku: p.sku }),
    );
  }

  return map;
}

// ─── Stage 3: Bulk upsert variants ───────────────────────────────────────────

async function bulkUpsertVariants(
  items: CreatePurchaseInput["items"],
  productMap: Map<string, { _id: mongoose.Types.ObjectId; sku: string }>,
  company_id: mongoose.Types.ObjectId,
  session: ClientSession,
): Promise<Map<string, { _id: mongoose.Types.ObjectId; sku: string }>> {
  const productIds = [
    ...new Set(
      items.map(
        (i) => productMap.get(i.product_name.trim().toLowerCase())!._id,
      ),
    ),
  ];

  const existing = await ProductVariant.find({
    company_id,
    product_id: { $in: productIds },
  })
    .session(session)
    .lean<any[]>();

  const map = new Map<string, { _id: mongoose.Types.ObjectId; sku: string }>(
    existing.map((v) => {
      const color =
        v.attributes?.find((a: any) => a.key === "color")?.value ?? "";
      const size =
        v.attributes?.find((a: any) => a.key === "size")?.value ?? "";
      return [
        variantKey(v.product_id.toString(), color, size),
        { _id: v._id, sku: v.sku },
      ];
    }),
  );

  const toCreate: typeof items = [];
  const toUpdate: Array<{
    variantId: mongoose.Types.ObjectId;
    quantity: number;
    buying_price: number;
    selling_price: number;
  }> = [];

  for (const item of items) {
    const product = productMap.get(item.product_name.trim().toLowerCase())!;
    const key = variantKey(product._id.toString(), item.color, item.size);

    if (map.has(key)) {
      const variant = existing.find((v) => {
        const c =
          v.attributes?.find((a: any) => a.key === "color")?.value ?? "";
        const s = v.attributes?.find((a: any) => a.key === "size")?.value ?? "";
        return variantKey(v.product_id.toString(), c, s) === key;
      });
      if (variant) {
        toUpdate.push({
          variantId: variant._id,
          quantity: item.quantity,
          buying_price: item.unit_price,
          selling_price: item.selling_price,
        });
      }
    } else {
      toCreate.push(item);
    }
  }

  // Parallel stock increments for existing variants
  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map(({ variantId, quantity, buying_price, selling_price }) =>
        ProductVariant.findByIdAndUpdate(
          variantId,
          { $inc: { stock: quantity }, $set: { buying_price, selling_price } },
          { session },
        ),
      ),
    );
  }

  // insertMany for new variants
  if (toCreate.length > 0) {
    const created = await ProductVariant.insertMany(
      toCreate.map((item) => {
        const product = productMap.get(item.product_name.trim().toLowerCase())!;
        const sku = buildVariantSku(product.sku, item.color, item.size);
        return {
          product_id: product._id,
          company_id,
          sku,
          attributes: [
            { key: "color", value: item.color.trim() },
            { key: "size", value: item.size.trim() },
          ],
          buying_price: item.unit_price,
          selling_price: item.selling_price,
          stock: item.quantity,
          low_stock_alert: item.low_stock_alert ?? 5,
          is_active: true,
        };
      }),
      { session },
    );

    created.forEach((v) => {
      const color =
        v.attributes?.find((a: any) => a.key === "color")?.value ?? "";
      const size =
        v.attributes?.find((a: any) => a.key === "size")?.value ?? "";
      const key = variantKey(v.product_id.toString(), color, size);
      map.set(key, { _id: v._id, sku: v.sku });
    });
  }

  return map;
}

// ─── Create purchase ──────────────────────────────────────────────────────────

export const createPurchase = async (
  payload: CreatePurchasePayload,
  req: Request,
) => {
  const {
    vendor_id,
    purchase_date,
    paid_amount,
    note,
    items,
    company_id,
    createdBy,
  } = payload;

  const vendor = await Vendor.findOne({
    _id: vendor_id,
    company_id,
    is_active: true,
  }).lean<any>();
  if (!vendor) throw new AppError("Vendor not found", 404);

  const session = await mongoose.startSession();
  try {
    let purchase: any;

    await session.withTransaction(async () => {
      // ── Stage 1: Categories ──────────────────────────────────────────────
      const categoryMap = await bulkUpsertCategories(
        items.map((i) => i.category),
        company_id,
        createdBy,
        session,
      );

      // ── Stage 2: Products ────────────────────────────────────────────────
      const productMap = await bulkUpsertProducts(
        items,
        categoryMap,
        new mongoose.Types.ObjectId(vendor_id),
        company_id,
        createdBy,
        session,
      );

      // ── Stage 3: Variants ────────────────────────────────────────────────
      const variantMap = await bulkUpsertVariants(
        items,
        productMap,
        company_id,
        session,
      );

      // ── Build resolved line items from maps (zero extra DB calls) ────────
      const resolvedItems: ResolvedLineItem[] = items.map((item) => {
        const product = productMap.get(item.product_name.trim().toLowerCase())!;
        console.log("product", product);
        if (!product)
          throw new AppError(
            `Product not resolved: "${item.product_name}"`,
            500,
          );
        const key = variantKey(product._id.toString(), item.color, item.size);
        const variant = variantMap.get(key)!;
        console.log("variant", variant);
        if (!variant)
          throw new AppError(
            `Variant not resolved: "${item.product_name}" (${item.color}, ${item.size})`,
            500,
          );

        return {
          product_id: product._id,
          variant_id: variant._id,
          product_name: item.product_name.trim(),
          sku: variant.sku,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selling_price: item.selling_price,
          total: round2(item.unit_price * item.quantity),
        };
      });
      if (resolvedItems.length === 0)
        throw new AppError("No items resolved — purchase aborted", 400);
      if (resolvedItems.length !== items.length)
        throw new AppError(
          `Expected ${items.length} items but only resolved ${resolvedItems.length}`,
          500,
        );

      const total_amount = round2(
        resolvedItems.reduce((sum, i) => sum + i.total, 0),
      );
      const product_ids = [
        ...new Set(resolvedItems.map((i) => i.product_id.toString())),
      ].map((id) => new mongoose.Types.ObjectId(id));

      const purchaseStart = new Date(purchase_date ?? new Date());
      purchaseStart.setHours(0, 0, 0, 0);
      const purchaseEnd = new Date(purchaseStart);
      purchaseEnd.setHours(23, 59, 59, 999);
      const duplicate = await Purchase.findOne({
        company_id,
        vendor_id: new mongoose.Types.ObjectId(vendor_id),
        product_ids: { $all: product_ids, $size: product_ids.length },
        purchase_date: { $gte: purchaseStart, $lte: purchaseEnd },
      }).session(session);

      if (duplicate)
        throw new AppError(
          "A purchase with the same vendor and products already exists for this date",
          409,
        );
      // ── Create purchase document ─────────────────────────────────────────
      const [created] = await Purchase.create(
        [
          {
            company_id,
            vendor_id: new mongoose.Types.ObjectId(vendor_id),
            product_ids,
            item_count: resolvedItems.length,
            total_amount,
            paid_amount: paid_amount ?? 0,
            purchase_date: purchase_date ? new Date(purchase_date) : new Date(),
            note: note ?? null,
            createdBy,
          },
        ],
        { session },
      );

      await Vendor.findByIdAndUpdate(
        vendor_id,
        [
          // aggregation pipeline update — recalculates due from source fields
          {
            $set: {
              total_payable: { $add: ["$total_payable", total_amount] },
              total_paid: { $add: ["$total_paid", paid_amount ?? 0] },
              due: {
                $subtract: [
                  { $add: ["$total_payable", total_amount] },
                  { $add: ["$total_paid", paid_amount ?? 0] },
                ],
              },
            },
          },
        ],
        { session, updatePipeline: true },
      );

      purchase = created;
    });

    if (!purchase) throw new AppError("Failed to create purchase", 500);

    auditLog({
      req,
      action: AUDIT_ACTIONS.PURCHASE_CREATED,
      targetModel: "Purchase",
      targetId: purchase._id,
      after: {
        vendor_name: vendor.name,
        total_amount: purchase.total_amount,
        item_count: purchase.item_count,
        status: purchase.status,
        total_paid: purchase.paid_amount,
        due_amount: purchase.due_amount,
      },
    });

    return purchase;
  } finally {
    await session.endSession();
  }
};

// ─── Get all purchases (paginated) ────────────────────────
export const getPurchases = async (
  company_id: mongoose.Types.ObjectId,
  query: ListPurchaseQuery,
) => {
  const filter: Record<string, unknown> = { company_id };
  if (query.vendor_id) filter.vendor_id = query.vendor_id;
  if (query.status) filter.status = query.status;
  if (query.search)
    filter.vendor_name = { $regex: query.search, $options: "i" };

  if (query.vendor_id)
    filter.vendor_id = new mongoose.Types.ObjectId(query.vendor_id);
  if (query.status) filter.status = query.status;

  if (query.from_date || query.to_date) {
    const dateFilter: Record<string, Date> = {};
    if (query.from_date) dateFilter.$gte = query.from_date;
    if (query.to_date) dateFilter.$lte = query.to_date;
    filter.purchase_date = dateFilter;
  }

  const sortDir = query.sort_order === "asc" ? 1 : -1;

  const [purchases, total] = await Promise.all([
    Purchase.find(filter)
      .populate("vendor_id", "name phone")
      .populate("createdBy", "name email")
      .populate("product_ids", "name sku ")
      .sort({ createdAt: sortDir })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Purchase.countDocuments(filter),
  ]);

  return { purchases, total };
};

// ─── Get one purchase ─────────────────────────────────────
export const getPurchaseById = async (payload: {
  id: string;
  company_id: mongoose.Types.ObjectId;
}) => {
  const purchase = await Purchase.findOne({
    _id: payload.id,
    company_id: payload.company_id,
  })
    .populate(
      "vendor_id",
      "name phone email address total_payable total_paid due",
    )
    .populate("createdBy", "name email")
    .populate(
      "product_ids",
      "name sku images has_variants buying_price selling_price",
    )
    // .populate("items.variant_id", "sku attributes")
    .lean();

  if (!purchase) throw new AppError("Purchase not found", 404);

  return purchase;
};

// ─── Update purchase (only paid_amount and note) ────────────────────────
export const updatePayment = async (
  id: string,
  company_id: mongoose.Types.ObjectId,
  payload: UpdatePurchaseInput,
  req: Request,
) => {
  const purchase = await Purchase.findOne({ _id: id, company_id }).populate(
    "vendor_id",
    "name phone email address total_payable total_paid due",
  );
  if (!purchase) throw new AppError("Purchase not found", 404);
  if (purchase.status === "paid")
    throw new AppError("This purchase is already fully paid", 422);

  const before = {
    paid_amount: purchase.paid_amount,
    status: purchase.status,
    due_amount: purchase.due_amount,
  };
  const remaining_due = purchase.total_amount - purchase.paid_amount;
  if (payload.paid_amount > remaining_due) {
    throw new AppError(
      `Paid amount (${payload.paid_amount}) cannot exceed total amount (${remaining_due})`,
      422,
    );
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      purchase.paid_amount += payload.paid_amount;
      if (payload.note) purchase.note = payload.note;
      await purchase.save({ session });
      await Vendor.findByIdAndUpdate(
        purchase.vendor_id,
        [
          {
            $set: {
              total_paid: { $add: ["$total_paid", payload.paid_amount] },
              due: { $subtract: ["$due", payload.paid_amount] },
            },
          },
        ],
        { session, updatePipeline: true },
      );
    });
  } finally {
    // catch (error) {
    //   console.log("payment update error",error)
    //   throw new AppError("Failed to update payment", 500);
    // }
    await session.endSession();
  }

  auditLog({
    req,
    action: AUDIT_ACTIONS.PURCHASE_PAYMENT_UPDATED,
    targetModel: "Purchase",
    targetId: purchase._id,
    before,
    after: {
      paid_amount: purchase.paid_amount,
      status: purchase.status,
      due_amount: purchase.due_amount,
    },
  });

  return purchase;
};
export const deletePurchase = async (
  id: string,
  company_id: mongoose.Types.ObjectId,
  req: Request,
) => {
  const purchase = await Purchase.findOne({ _id: id, company_id });
  if (!purchase) throw new AppError("Purchase not found", 404);

  if (purchase.status !== "pending") {
    throw new AppError(
      `Only pending purchases can be deleted (current status: ${purchase.status})`,
      422,
    );
  }

  const before = {
    total_amount: purchase.total_amount,
  };

  // Reverse vendor financials
  await Vendor.findByIdAndUpdate(purchase.vendor_id, {
    $inc: {
      total_payable: -purchase.total_amount,
      total_paid: -purchase.paid_amount,
      due: -purchase.due_amount,
    },
  });

  await Purchase.findByIdAndUpdate(id, { $set: { is_deleted: true } });

  auditLog({
    req,
    action: AUDIT_ACTIONS.PURCHASE_DELETED,
    targetModel: "Purchase",
    targetId: purchase._id,
    before,
  });
};

/*
interface CreatePurchasePayload extends CreatePurchaseInput {
  company_id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

interface ResolvedLineItem {
  product_id: mongoose.Types.ObjectId;
  variant_id: mongoose.Types.ObjectId;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  selling_price: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

// ─── Upsert helpers ───────────────────────────────────────────────────────────

async function upsertCategory(
  name: string,
  company_id: mongoose.Types.ObjectId,
  createdBy: mongoose.Types.ObjectId,
  session: mongoose.ClientSession,
): Promise<mongoose.Types.ObjectId> {
  const existing = await Category.findOne({
    company_id,
    name: { $regex: `^${name.trim()}$`, $options: "i" },
  })
    .session(session)
    .lean<any>();

  if (existing) return existing._id;

  const [created] = await Category.create(
    [
      sanitizeData({
        company_id,
        createdBy,
        name: name.trim(),
        slug: buildSlug(name),
      }),
    ],
    { session },
  );
  if (!created) throw new AppError("Failed to create category", 500);
  return created._id;
}

async function upsertProduct(
  opts: {
    name: string;
    category_id: mongoose.Types.ObjectId;
    vendor_id: mongoose.Types.ObjectId;
    company_id: mongoose.Types.ObjectId;
    buying_price: number;
    selling_price: number;
    createdBy: mongoose.Types.ObjectId;
  },
  session: mongoose.ClientSession,
): Promise<{ product_id: mongoose.Types.ObjectId; product_sku: string }> {
  const existing = await Product.findOne({
    company_id: opts.company_id,
    category_id: opts.category_id,
    name: { $regex: `^${opts.name.trim()}$`, $options: "i" },
  })
    .session(session)
    .lean<any>();

  if (existing) return { product_id: existing._id, product_sku: existing.sku };

  // Build SKU here in the service — do NOT rely on pre-save hook
  // because the hook runs Product.findById() without the session
  // and can't see documents created inside this transaction.
  const baseSku = opts.name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .slice(0, 12);
  const sku = `${baseSku}-${Date.now().toString().slice(-5)}`; // e.g. "COTTON-SHIRT-93201"

  const [created] = await Product.create(
    [
      {
        company_id: opts.company_id,
        category_id: opts.category_id,
        vendor_id: opts.vendor_id,
        name: opts.name.trim(),
        slug: buildSlug(opts.name) + "-" + Date.now(),
        sku,
        buying_price: opts.buying_price,
        selling_price: opts.selling_price,
        has_variants: true,
        stock: 0,
        is_active: true,
        createdBy: opts.createdBy,
      },
    ],
    { session },
  );
  if (!created) throw new AppError("Failed to create product", 500);
  return { product_id: created._id, product_sku: created.sku };
}

async function upsertVariant(
  opts: {
    product_id: mongoose.Types.ObjectId;
    product_sku: string; // ← passed in from upsertProduct
    company_id: mongoose.Types.ObjectId;
    color: string;
    size: string;
    buying_price: number;
    selling_price: number;
    quantity: number;
    low_stock_alert: number;
  },
  session: mongoose.ClientSession,
): Promise<{ variant_id: mongoose.Types.ObjectId; sku: string }> {
  // Find existing variant by product + color + size
  const existing = await ProductVariant.findOne({
    product_id: opts.product_id,
    company_id: opts.company_id,
    attributes: {
      $all: [
        {
          $elemMatch: {
            key: "color",
            value: { $regex: `^${opts.color}$`, $options: "i" },
          },
        },
        {
          $elemMatch: {
            key: "size",
            value: { $regex: `^${opts.size}$`, $options: "i" },
          },
        },
      ],
    },
  }).session(session);

  if (existing) {
    existing.buying_price = opts.buying_price;
    existing.selling_price = opts.selling_price;
    existing.stock += opts.quantity;
    await existing.save({ session });
    return { variant_id: existing._id, sku: existing.sku };
  }

  // Build variant SKU here — NOT in pre-save hook.
  // Same reason: pre-save hook calls Product.findById() without session
  // and the product is invisible inside an uncommitted transaction.
  const clean = (s: string) =>
    s
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .slice(0, 8);
  const varSku = `${opts.product_sku}-${clean(opts.color)}-${clean(opts.size)}`;
  // e.g. "COTTON-SHIRT-93201-ORANGE-M"

  const [created] = await ProductVariant.create(
    [
      {
        product_id: opts.product_id,
        company_id: opts.company_id,
        sku: varSku,
        attributes: [
          { key: "color", value: opts.color.trim() },
          { key: "size", value: opts.size.trim() },
        ],
        buying_price: opts.buying_price,
        selling_price: opts.selling_price,
        stock: opts.quantity,
        low_stock_alert: opts.low_stock_alert,
        is_active: true,
      },
    ],
    { session },
  );
  if (!created) throw new AppError("Failed to create product variant", 500);
  return { variant_id: created._id, sku: created.sku };
}
// ─── Create purchase ──────────────────────────────────────
export const createPurchase = async (
  payload: CreatePurchasePayload,
  req: Request,
) => {
  const {
    vendor_id,
    purchase_date,
    paid_amount,
    note,
    items,
    company_id,
    createdBy,
  } = payload;

  const vendor = await Vendor.findOne({
    _id: vendor_id,
    company_id,
    is_active: true,
  }).lean<any>();
  if (!vendor) throw new AppError("Vendor not found", 404);

  const session = await mongoose.startSession();
  try {
    let purchase: any;

    await session.withTransaction(async () => {
      const resolvedItems: ResolvedLineItem[] = [];

      for (const item of items) {
        // 1. Category — find or create
        const category_id = await upsertCategory(
          item.category,
          company_id,
          createdBy,
          session,
        );

        // 2. Product — find or create
        const { product_id, product_sku } = await upsertProduct(
          {
            name: item.product_name,
            category_id,
            vendor_id: new mongoose.Types.ObjectId(vendor_id),
            company_id,
            buying_price: item.unit_price,
            selling_price: item.selling_price,
            createdBy,
          },
          session,
        );

        // 3. Variant — find or create, stock updated inside
        const { variant_id, sku } = await upsertVariant(
          {
            product_id,
            product_sku,
            company_id,
            color: item.color,
            size: item.size,
            buying_price: item.unit_price,
            selling_price: item.selling_price,
            quantity: item.quantity,
            low_stock_alert: item.low_stock_alert ?? 5,
          },
          session,
        );

        resolvedItems.push({
          product_id,
          variant_id,
          product_name: item.product_name.trim(),
          sku,
          quantity: item.quantity,
          unit_price: item.unit_price,
          selling_price: item.selling_price,
          total: round2(item.unit_price * item.quantity),
        });
      }

      const total_amount = round2(
        resolvedItems.reduce((sum, i) => sum + i.total, 0),
      );
      const product_ids = [
        ...new Set(resolvedItems.map((i) => i.product_id.toString())),
      ].map((id) => new mongoose.Types.ObjectId(id));

      const [created] = await Purchase.create(
        [
          {
            company_id,
            vendor_id: new mongoose.Types.ObjectId(vendor_id),
            product_ids,
            item_count: resolvedItems?.length,
            total_amount,
            paid_amount: paid_amount ?? 0,
            purchase_date: purchase_date ? new Date(purchase_date) : new Date(),
            note: note ?? null,
            createdBy,
          },
        ],
        { session },
      );

      purchase = created;
    });
    // ── Guard before auditLog ──────────────────────────────────
    if (!purchase) throw new AppError("Failed to create purchase", 500);

    auditLog({
      req,
      action: AUDIT_ACTIONS.PURCHASE_CREATED,
      targetModel: "Purchase",
      targetId: purchase._id,
      after: {
        vendor_name: vendor.name,
        total_amount: purchase.total_amount,
        item_count: purchase.item_count, // ← use purchase.item_count, not items.length
        status: purchase.status,
        total_paid: purchase.paid_amount,
        due_amount: purchase.due_amount,

      },
    });

    return purchase;
  } finally {
    await session.endSession();
  }
};
*/
