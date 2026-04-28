"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const customerSchema = new mongoose_1.Schema({
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    totalPurchased: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    //CRM
    tags: { type: [String], default: [] },
    lastPurchasedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});
customerSchema.index({ companyId: 1, phone: 1 }, { unique: true });
customerSchema.index({ companyId: 1, due: -1 }); // desending order due report
customerSchema.index({ companyId: 1, lastPurchasedAt: -1 }); // recent customers
const Customer = (0, mongoose_1.model)("Customer", customerSchema);
exports.default = Customer;
//# sourceMappingURL=customer.schema.js.map