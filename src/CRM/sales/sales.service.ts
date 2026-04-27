import mongoose, { Types } from "mongoose";
import { generateSaleCode } from "../../utils/generateSaleCode";
import { CreateSaleInput } from "./sales.validation";
import { AppError } from "../../middlewares/appError";
import Product from "../../module/product/product.schema";
import ProductVariant from "../../module/product-variant/product-variant.schema";
import Sale from "./sales.schema";
import Customer from "../customer/customer.schema";

type CalculatedItem = {
  productId: mongoose.Types.ObjectId;
  variantId: mongoose.Types.ObjectId;
  productName: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  discountType: "flat" | "percentage" | null;
  discountValue: number;
  discountAmount: number;
  subtotal: number;
};

interface ICalculateDiscount {
  sellingPrice: number;
  quantity: number;
  discountType: "flat" | "percentage" | null;
  discountValue: number;
}

interface ICreateSalePayload {
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId | null;
  input: CreateSaleInput;
}

// ─── Helpers ──────────────────────────────────────────────

const calculateDiscount = (data: ICalculateDiscount): number => {
  const { sellingPrice, quantity, discountType, discountValue } = data;
  if (!discountType || !discountValue) return 0;
  if (discountType === "flat") return discountValue * quantity;
  return Math.round((sellingPrice * discountValue) / 100) * quantity;
};

const getAttribute = (
  attributes: { key: string; value: string }[],
  key: string,
): string => attributes.find((a) => a.key === key)?.value ?? "";

const resolveCustomer = async (
  companyId: Types.ObjectId,
  customerName: string,
  customerPhone: string,
  netAmount: number,
  effectivePaid: number,
  session: mongoose.ClientSession,
): Promise<Types.ObjectId> => {
  const existing = await Customer.findOne({
    companyId,
    phone: customerPhone,
  }).session(session);
  if (existing) {
    await Customer.updateOne({ _id: existing._id }, [
      {
        $set: {
          totalPurchased: { $add: ["$totalPurchased", netAmount] },
          totalPaid: { $add: ["$totalPaid", effectivePaid] },
          due: {
            $max: [
              0,
              {
                $subtract: [
                  { $add: ["$totalPurchased", netAmount] },
                  { $add: ["$totalPaid", effectivePaid] },
                ],
              },
            ],
          },
          credit: {
            $max: [
              0,
              {
                $subtract: [
                  { $add: ["$totalPaid", effectivePaid] },
                  { $add: ["$totalPurchased", netAmount] },
                ],
              },
            ],
          },
          name: customerName,
          lastPurchasedAt: new Date(),
        },
      },
    ]).session(session);
    return existing._id;
  }
  const totalPurchased = netAmount;
  const totalPaid = effectivePaid;
  const due = Math.max(totalPurchased - totalPaid, 0);
  const credit = Math.max(totalPaid - totalPurchased, 0);
  const [customer] = await Customer.create(
    [
      {
        companyId,
        name: customerName,
        phone: customerPhone,
        totalPurchased,
        totalPaid,
        due,
        credit,
        lastPurchasedAt: new Date(),
      },
    ],
    { session },
  );
  if (!customer) throw new AppError("Customer not created", 400);
  return customer._id;
};

// ─── Main Service ─────────────────────────────────────────

export const createSale = async (payload: ICreateSalePayload) => {
  const { companyId, createdBy, input } = payload;
  const {
    customerName,
    customerPhone,
    items,
    paymentMethod,
    paidAmount,
    note,
    createdByType
  } = input;

  // 1. block online payments
  if (paymentMethod === "card" || paymentMethod === "mobile_banking") {
    throw new AppError(
      "Online payments must use /orders/initiate endpoint",
      400,
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const companyObjectId = new Types.ObjectId(companyId);

    // 2. load all products in one query
    const productIds = items.map((i) => new Types.ObjectId(i.productId));

    const products = await Product.find({
      _id: { $in: productIds },
      company_id: companyObjectId,
      is_active: true,
    }).session(session);

    // check all products found
    const uniqueProductIds = new Set(items.map((i) => i.productId));
    if (products.length !== uniqueProductIds.size) {
      throw new AppError("One or more products not found", 404);
    }

    // build product map → productId: product
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // 3. load all variants in one query
    const variantIds = items.map((i) => new Types.ObjectId(i.variantId));

    const variants = await ProductVariant.find({
      _id: { $in: variantIds },
      company_id: companyObjectId,
      is_active: true,
    }).session(session);

    if (variants.length !== items.length) {
      throw new AppError("One or more variants not found", 404);
    }

    // build variant map → variantId: variant
    const variantMap = new Map(variants.map((v) => [v._id.toString(), v]));

    // 4. validate stock + build calculated items
    const calculatedItems: CalculatedItem[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      const variant = variantMap.get(item.variantId);

      if (!product)
        throw new AppError(`Product not found: ${item.productId}`, 404);
      if (!variant)
        throw new AppError(`Variant not found: ${item.variantId}`, 404);

      // check variant belongs to this product
      if (variant.product_id.toString() !== item.productId) {
        throw new AppError(
          `Variant ${item.variantId} does not belong to product ${item.productId}`,
          400,
        );
      }

      // check stock
      if (variant.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name} - ${variant.sku}. Available: ${variant.stock}`,
          400,
        );
      }

      // extract color and size from attributes
      const color = getAttribute(variant.attributes, "color");
      const size = getAttribute(variant.attributes, "size");

      // calculate discount
      const discountAmount = calculateDiscount({
        sellingPrice: item.sellingPrice,
        quantity: item.quantity,
        discountType: item.discountType ?? null,
        discountValue: item.discountValue,
      });

      const subtotal = item.sellingPrice * item.quantity - discountAmount;

      calculatedItems.push({
        productId: new Types.ObjectId(item.productId),
        variantId: new Types.ObjectId(item.variantId),
        productName: product.name,
        color,
        size,
        sku: variant.sku,
        quantity: item.quantity,
        unitPrice: variant.buying_price, // from variant — actual cost
        sellingPrice: item.sellingPrice,
        discountType: item.discountType ?? null,
        discountValue: item.discountValue,
        discountAmount,
        subtotal,
      });
    }

    // 5. calculate totals
    const grossAmount = calculatedItems.reduce(
      (sum, i) => sum + i.sellingPrice * i.quantity,
      0,
    );
    const discountTotal = calculatedItems.reduce(
      (sum, i) => sum + i.discountAmount,
      0,
    );
    const netAmount = grossAmount - discountTotal;

    // 6. calculate payment status
    const effectivePaid = paymentMethod === "cash_on_delivery" ? 0 : paidAmount;
    const dueAmount = Math.max(netAmount - effectivePaid, 0);
    const changeAmount = Math.max(effectivePaid - netAmount, 0);
    const paymentStatus =
      effectivePaid <= 0
        ? "due"
        : effectivePaid >= netAmount
          ? "paid"
          : "partial";

    // 7. resolve or create customer
    const customerId = await resolveCustomer(
      companyObjectId,
      customerName,
      customerPhone,
      netAmount,
      effectivePaid,
      session,
    );

    // 8. deduct stock for each variant
    for (const item of calculatedItems) {
      await ProductVariant.updateOne(
        {
          _id: item.variantId,
          company_id: companyObjectId,
        },
        { $inc: { stock: -item.quantity } },
        { session },
      );
    }

    // 9. generate sale code
    const saleCode = await generateSaleCode(companyId);

    // 10. create sale
    const [sale] = await Sale.create(
      [
        {
          companyId: companyObjectId,
          saleCode,
          customer: {
            name: customerName,
            phone: customerPhone,
            customerId, // CRM link comes later
          },
          items: calculatedItems,
          grossAmount,
          discountTotal,
          netAmount,
          paidAmount: effectivePaid,
          dueAmount,
          changeAmount,
          paymentMethod,
          paymentStatus,
          creditUsed: 0,
          saleDate: new Date(),
          note: note ?? null,
          status: "completed",
          createdBy: createdBy,
          createdByType
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
