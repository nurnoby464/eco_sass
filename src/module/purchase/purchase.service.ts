// src/module/purchase/purchase.service.ts
import mongoose from "mongoose";
import Purchase      from "./purchase.schema";
import Product       from "../product/product.schema";
import Vendor        from "../vendor/vendor.schema";
import { AppError }  from "../../middlewares/appError";
import ProductVariant from "../product-variant/product-variant.schema";

// ─── Create purchase ──────────────────────────────────────
export const createPurchase = async (payload: {
  company_id   : mongoose.Types.ObjectId;
  vendor_id    : string;
  items        : {
    product_id : string;
    variant_id : string | null;
    quantity   : number;
    unit_price : number;
  }[];
  paid_amount  : number;
  purchase_date: Date;
  note        ?: string | null;
  createdBy    : mongoose.Types.ObjectId;
}) => {
  const { company_id, vendor_id, items, paid_amount, createdBy } = payload;

  // ── Phase 1: validate vendor ──────────────────────────
  const vendor = await Vendor.findOne({
    _id       : vendor_id,
    company_id,
    is_active : true,
  }).lean();
  if (!vendor) throw new AppError("Vendor not found or inactive", 404);

  // ── Phase 2: validate all items + build snapshots ─────
  const resolvedItems = await Promise.all(
    items.map(async (item) => {
      // validate product
      const product = await Product.findOne({
        _id       : item.product_id,
        company_id,
        is_active : true,
      }).lean();
      if (!product) {
        throw new AppError(`Product "${item.product_id}" not found or inactive`, 404);
      }

      // validate variant if provided
      if (item.variant_id) {
        const variant = await ProductVariant.findOne({
          _id       : item.variant_id,
          product_id: item.product_id,
          is_active : true,
        }).lean();
        if (!variant) {
          throw new AppError(
            `Variant "${item.variant_id}" not found or does not belong to product "${product.name}"`,
            404,
          );
        }

        return {
          product_id  : new mongoose.Types.ObjectId(item.product_id),
          variant_id  : new mongoose.Types.ObjectId(item.variant_id),
          product_name: product.name,           // snapshot
          sku         : variant.sku,            // snapshot from variant
          quantity    : item.quantity,
          unit_price  : item.unit_price,
          total       : item.quantity * item.unit_price,
        };
      }

      // no variant
      if (product.has_variants) {
        throw new AppError(
          `Product "${product.name}" has variants. Please specify a variant_id.`,
          400,
        );
      }

      return {
        product_id  : new mongoose.Types.ObjectId(item.product_id),
        variant_id  : null,
        product_name: product.name,             // snapshot
        sku         : product.sku,              // snapshot from product
        quantity    : item.quantity,
        unit_price  : item.unit_price,
        total       : item.quantity * item.unit_price,
      };
    }),
  );

  // ── Phase 3: calculate financials server-side ─────────
  const total_amount = resolvedItems.reduce((sum, i) => sum + i.total, 0);

  if (paid_amount > total_amount) {
    throw new AppError(
      `Paid amount (${paid_amount}) cannot exceed total amount (${total_amount})`,
      400,
    );
  }

  // ── Phase 4: transaction — all writes together ─────────
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 4a. create purchase
    const [purchase] = await Purchase.create(
      [
        {
          company_id,
          vendor_id : new mongoose.Types.ObjectId(vendor_id),
          items     : resolvedItems,
          total_amount,
          paid_amount,
          purchase_date: payload.purchase_date,
          note      : payload.note ?? null,
          createdBy,
        },
      ],
      { session },
    );

    // 4b. increase stock on each product or variant
    await Promise.all(
      resolvedItems.map((item) => {
        if (item.variant_id) {
          return ProductVariant.updateOne(
            { _id: item.variant_id },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
        return Product.updateOne(
          { _id: item.product_id },
          { $inc: { stock: item.quantity } },
          { session },
        );
      }),
    );

    // 4c. update vendor financials
    const due_amount = total_amount - paid_amount;
    await Vendor.updateOne(
      { _id: vendor_id },
      {
        $inc: {
          total_payable: total_amount,
          total_paid   : paid_amount,
          due          : due_amount,
        },
      },
      { session },
    );

    // 4d. commit — all 3 writes permanent
    await session.commitTransaction();

    return purchase;

  } catch (err) {
    // any failure → roll back everything
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// ─── Get all purchases (paginated) ────────────────────────
export const getPurchases = async (payload: {
  company_id : mongoose.Types.ObjectId;
  page       : number;
  limit      : number;
  vendor_id ?: string;
  status    ?: "pending" | "partial" | "paid";
  from_date ?: Date;
  to_date   ?: Date;
  sort_order : string;
}) => {
  const { company_id, page, limit, vendor_id, status, from_date, to_date, sort_order } = payload;

  const filter: Record<string, unknown> = { company_id };

  if (vendor_id) filter.vendor_id = new mongoose.Types.ObjectId(vendor_id);
  if (status)    filter.status    = status;

  if (from_date || to_date) {
    const dateFilter: Record<string, Date> = {};
    if (from_date) dateFilter.$gte = from_date;
    if (to_date)   dateFilter.$lte = to_date;
    filter.purchase_date = dateFilter;
  }

  const sortDir = sort_order === "asc" ? 1 : -1;

  const [purchases, total] = await Promise.all([
    Purchase.find(filter)
      .populate("vendor_id",  "name phone")
      .populate("createdBy",  "name email")
      .sort({ createdAt: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Purchase.countDocuments(filter),
  ]);

  return { purchases, total };
};

// ─── Get one purchase ─────────────────────────────────────
export const getPurchaseById = async (payload: {
  id        : string;
  company_id: mongoose.Types.ObjectId;
}) => {
  const purchase = await Purchase.findOne({
    _id       : payload.id,
    company_id: payload.company_id,
  })
    .populate("vendor_id",          "name phone email address")
    .populate("createdBy",          "name email")
    .populate("items.product_id",   "name sku images")
    .populate("items.variant_id",   "sku attributes")
    .lean();

  if (!purchase) throw new AppError("Purchase not found", 404);
  return purchase;
};