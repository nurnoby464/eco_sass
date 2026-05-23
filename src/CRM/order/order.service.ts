import mongoose, { Types } from "mongoose";
import { generateSaleCode } from "../../utils/generateSaleCode";
import { AppError } from "../../middlewares/appError";
import Product from "../../module/product/product.schema";
import ProductVariant from "../../module/product-variant/product-variant.schema";
import Customer from "../customer/customer.schema";
import {
  ICreateOrderPayload,
  IEmptyOrderItem,
  OrderQuery,
} from "./order.interface";
import {
  calculateDiscount,
  generateInvoiceNumber,
  generateOderNumber,
} from "../../utils/healper";
import Order from "./order.schema";
import { useSkip } from "../../utils/useSkip";
import { TGetOrderListQuery } from "./order.validation";
import Invoice from "../invoice/invoice.schema";

const resolveCustomer = async (
  companyId: Types.ObjectId,
  name: string,
  phone: string,
  email: string | null,
  session: mongoose.ClientSession,
) => {
  // check is exist customer
  const existing = await Customer.findOne({ companyId, phone }).session(
    session,
  );

  if (existing) {
    await Customer.updateOne(
      { _id: existing._id },
      { $set: { name, ...(email && { email }) } },
      { runValidators: true },
    ).session(session);
    return existing._id;
  }

  // create new customer
  const [customer] = await Customer.create(
    [
      {
        companyId,
        name,
        email,
        phone,
      },
    ],
    { session },
  );
  if (!customer) {
    throw new AppError("Failed to create customer");
  }
  return customer._id;
};
export const createOrder = async ({
  companyId,
  input,
}: ICreateOrderPayload) => {
  const {
    name,
    phone,
    email,
    items,
    shipping_address,
    discount_amount,
    tax_amount,
    shipping_charge,
    paid_amount,
    payment_method,
    note,
  } = input;

  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    // 1. load all variant
    const variantIds = items.map((i) => new Types.ObjectId(i.variant_id));
    const variants = await ProductVariant.find({
      company_id: companyId,
      is_active: true,
      _id: { $in: variantIds },
    }).session(session);

    if (variants.length < items.length) {
      throw new AppError("One or more variants not found or inactive", 404);
    }
    const variantMap = new Map(variants.map((v) => [v._id.toString(), v]));

    // 2. load all products
    const productIds = variants.map((v) => v.product_id);
    const product = await Product.find({
      company_id: companyId,
      is_active: true,
      _id: { $in: productIds },
    }).session(session);

    const productMap = new Map(product.map((p) => [p._id.toString(), p]));
    // 3 validate stock
    const orderItem = [];

    for (const item of items) {
      const variant = variantMap.get(item.variant_id);
      if (!variant) {
        throw new AppError(`Not found this ${item.variant_id} `, 404);
      }
      const product = productMap.get(variant.product_id.toString());
      if (!product) {
        throw new AppError(
          `Product not found for variant: ${item.variant_id} `,
          404,
        );
      }
      if (variant.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name} - ${variant.sku}. Available: ${variant.stock}`,
          400,
        );
      }
      const unitPrice = variant.selling_price;
      const taxRete = product.taxRate;
      const taxAmount = Math.round((unitPrice * item.quantity * taxRete) / 100);

      const discountAmount = calculateDiscount({
        sellingPrice: unitPrice,
        quantity: item.quantity,
        discountType: variant.discountType ?? null,
        discountValue: variant.discountValue ?? 0,
      });
      const totalPrice = unitPrice * item.quantity - discountAmount;
      orderItem.push({
        total_price: totalPrice,
        unit_price: unitPrice,
        quantity: item.quantity,
        sku: variant.sku,
        name: product.name,
        variant: variant._id,
        product: product._id,
        discountType: variant.discountType ?? null,
        discountValue: variant.discountValue ?? 0,
        discountAmount,
        taxAmount,
        taxRete,
      });
    }
    // 4. calculate total
    const subTotal = orderItem.reduce((sum, item) => sum + item.total_price, 0);
    const discountTotal = orderItem.reduce(
      (sum, item) => sum + item.discountAmount,
      0,
    );
    const shippingCharge = 60;
    const totalTax = orderItem.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = subTotal + totalTax + shippingCharge;
    //  check is paid or unpaid or partial
    const effectivePaid =
      payment_method === "cash_on_delivery"
        ? 0
        : Math.min(paid_amount, grandTotal);
    const dueAmount = Math.max(grandTotal - effectivePaid, 0);

    let paymentStatus;
    if (payment_method === "cash_on_delivery") {
      paymentStatus = "unpaid";
    } else {
      paymentStatus =
        effectivePaid <= 0
          ? "unpaid"
          : effectivePaid >= grandTotal
            ? "paid"
            : "partial";
    }
    // 5. resolve customer
    const customerId = await resolveCustomer(
      companyId,
      name,
      phone,
      email,
      session,
    );
    // 6. update customer info

    await Customer.updateOne(
      { _id: customerId },
      [
        {
          $set: {
            totalPurchased: { $add: ["$totalPurchased", grandTotal] },
            totalPaid: { $add: ["$totalPaid", effectivePaid] },
            due: {
              $max: [
                0,
                {
                  $subtract: [
                    { $add: ["$totalPurchased", grandTotal] },
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
                    { $add: ["$totalPurchased", grandTotal] },
                  ],
                },
              ],
            },
            lastPurchasedAt: new Date(),
          },
        },
      ],
      { session, updatePipeline: true },
    );

    //7. deduct stock
    for (const item of orderItem) {
      await ProductVariant.updateOne(
        { _id: item.variant },
        {
          $inc: { stock: -item.quantity },
        },
        {
          session,
        },
      );
    }
    //8 generate order
    const orderNumber = await generateOderNumber(companyId);
    //9 create order
    const [order] = await Order.create(
      [
        {
          company_id: companyId,
          order_number: orderNumber,
          customer: customerId,
          items: orderItem,
          shipping_address,
          subtotal: subTotal,
          discount_amount: discountTotal,
          tax_amount: orderItem.reduce((sum, item) => sum + item.taxAmount, 0),
          shipping_charge: shippingCharge,
          grand_total: grandTotal,
          paid_amount: effectivePaid,
          due_amount: dueAmount,
          payment_status: paymentStatus,
          payment_method,
          order_status: "pending",
          note: note ?? null,
        },
      ],
      { session },
    );
    if (!order) {
      throw new AppError("Failed to order", 400);
    }
    const invoiceNumber = await generateInvoiceNumber();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    await Invoice.create(
      [
        {
          invoiceNumber,
          order: order._id,
          company: companyId,
          customer: order.customer,
          items: order.items,
          subtotal: order.subtotal,
          discountAmount: order.discount_amount,
          taxAmount: order.tax_amount,
          shippingCharge: order.shipping_charge,
          grandTotal: order.grand_total,
          paidAmount: order.paid_amount,
          dueAmount: order.due_amount,
          paymentMethod: order.payment_method,
          status: order.payment_status,
          issuedAt: new Date(),
          deliveryDate,
          paidDate: paymentStatus === "paid" ? new Date() : null,
          note: order.note,
        },
      ],
      { session },
    );
    // next apply here send email
    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getAllOrder = async (
  companyId: Types.ObjectId,
  query: TGetOrderListQuery,
) => {
  const {
    search,
    sortBy,
    sortOrder,
    page,
    limit,
    orderStatus,
    paymentStatus,
    customerId,
  } = query;

  if (!companyId || !Types.ObjectId.isValid(companyId)) {
    throw new AppError("Invalid company", 400);
  }
  const filter: Record<string, unknown> = {
    company_id: companyId,
  };
  if (search?.trim()) {
    filter.$or = [{}];
  }
  if (orderStatus) {
    filter.order_status = orderStatus;
  }
  if (paymentStatus) {
    filter.payment_status = paymentStatus;
  }
  const [orders, total, meta] = await Promise.all([
    Order.find(filter)
      .populate("customer", "_id name phone")
      .populate("items.product", "_id name sku")
      .skip(useSkip({ page, limit }))
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .lean(),
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: { company_id: companyId } },
      {
        $facet: {
          orderStatusStats: [
            { $group: { _id: "$order_status", count: { $sum: 1 } } },
          ],
        },
      },
    ]),
  ]);

  const orderStatusCounts = meta[0].orderStatusStats.reduce(
    (acc: Record<string, number>, item: { _id: string; count: number }) => {
      if (item._id) {
        acc[item._id] = item.count;
      }
      return acc;
    },
    {},
  );

  return { orders, total, orderStatusCounts };
};
