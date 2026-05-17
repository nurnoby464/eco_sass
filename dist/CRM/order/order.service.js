"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../middlewares/appError");
const customer_schema_1 = __importDefault(require("../customer/customer.schema"));
const resolveCustomer = async (companyId, name, phone, email, session) => {
    // check is exist customer
    const existing = await customer_schema_1.default.findOne({ companyId, phone }).session(session);
    if (existing) {
        await customer_schema_1.default.updateOne({ _id: existing._id }, { $set: { name, ...(email && { email }) } }, { runValidators: true }).session(session);
        return existing._id;
    }
    // create new customer
    const [customer] = await customer_schema_1.default.create([
        {
            companyId,
            name,
            email,
            phone,
        },
    ], { session });
    if (!Array.isArray(customer)) {
        throw new appError_1.AppError("Failed to create customer");
    }
    return customer._id;
};
const createOrder = async ({ companyId, input, }) => {
    const { name, phone, email, items, shipping_address, discount_amount, tax_amount, shipping_charge, paid_amount, payment_method, note, } = input;
    const session = await mongoose_1.default.startSession();
    try {
        await session.startTransaction();
    }
    catch (error) {
        await session.abortTransaction();
    }
    finally {
        session.endSession();
    }
};
exports.createOrder = createOrder;
//# sourceMappingURL=order.service.js.map