"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CompanySchema = new mongoose_1.Schema({
    company_name: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
        minlength: [2, "Company name must be at least 2 characters"],
        maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    company_email: {
        type: String,
        required: [true, "Company email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
    },
    logo: {
        type: String,
        default: null,
    },
    // ─── new fields ──────────────────────────────────────
    domain: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
        sparse: true, // unique but allows multiple nulls
        unique: true,
        // example: "fashionzone.com.bd"
    },
    subdomain: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
        sparse: true,
        unique: true,
        match: [
            /^[a-z0-9-]+$/,
            "Subdomain can only contain lowercase letters, numbers and hyphens",
        ],
        // example: "fashion-zone" → fashion-zone.yourplatform.com
    },
    // ─────────────────────────────────────────────────────
    status: {
        type: String,
        enum: {
            values: ["active", "inactive", "suspended"],
            message: "Invalid status: {VALUE}",
        },
        default: "active",
    },
    admin_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Admin user reference is required"],
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "CreatedBy reference is required"],
    },
}, {
    timestamps: true,
});
// ─── Indexes ──────────────────────────────────────────────
CompanySchema.index({ company_email: 1 }); // unique company lookup
CompanySchema.index({ status: 1 }); // filter by status
CompanySchema.index({ domain: 1 }, { sparse: true }); // ← new
CompanySchema.index({ subdomain: 1 }, { sparse: true }); // ← new
const Company = (0, mongoose_1.model)("Company", CompanySchema);
exports.default = Company;
//# sourceMappingURL=company.schema.js.map