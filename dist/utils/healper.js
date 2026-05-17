"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOderNumber = void 0;
const order_schema_1 = __importDefault(require("../CRM/order/order.schema"));
const generateOderNumber = async (companyId) => {
    const count = await order_schema_1.default.countDocuments({ company_id: companyId });
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const date = String(new Date().getDate()).padStart(2, "0");
    const orderNum = String(count + 1).padStart(5, "0");
    return `ORD-${year}${month}${date}${orderNum}`;
};
exports.generateOderNumber = generateOderNumber;
//# sourceMappingURL=healper.js.map