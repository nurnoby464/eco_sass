import mongoose, { Document } from "mongoose";
export interface ICustomer {
    companyId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    totalPurchased: number;
    totalPaid: number;
    due: number;
    credit: number;
    tags: string[];
    lastPurchasedAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICustomerDocument extends ICustomer, Document {
}
//# sourceMappingURL=customer.interface.d.ts.map