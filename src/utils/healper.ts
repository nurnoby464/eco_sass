import { Types } from "mongoose";
import Order from "../CRM/order/order.schema";

export const generateOderNumber = async (
  companyId: Types.ObjectId,
): Promise<string> => {
  const count = await Order.countDocuments({ company_id: companyId });
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const date = String(new Date().getDate()).padStart(2, "0");
  const orderNum = String(count + 1).padStart(5, "0");
  return `ORD-${year}${month}${date}${orderNum}`
};
