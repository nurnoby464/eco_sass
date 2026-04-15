"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts — ONLY Express config, routes, middleware
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const super_admin_route_1 = require("./module/super_admin/super_admin.route");
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
const auth_route_1 = require("./module/auth/auth.route");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const company_route_1 = require("./module/company/company.route");
const vendor_route_1 = require("./module/vendor/vendor.route");
const category_route_1 = require("./module/category/category.route");
const product_route_1 = require("./module/product/product.route");
const purchase_route_1 = require("./module/purchase/purchase.route");
const product_variant_route_1 = require("./module/product-variant/product-variant.route");
const public_route_1 = __importDefault(require("./module/public/public.route"));
const appError_1 = require("./middlewares/appError");
// routes
// import authRoutes from './modules/auth/auth.routes';
// import adminRoutes from './modules/admin/admin.routes';
// import vendorRoutes from './modules/vendor/vendor.routes';
// import customerRoutes from './modules/customer/customer.routes';
// import publicRoutes from './modules/public/public.routes';
const app = (0, express_1.default)();
const allowOrigin = process.env.NODE_ENV === "production"
    ? [
        "https://your-app.vercel.app",
        "https://your-app.herokuapp.com",
        // add more production domains as needed
    ]
    : ["http://localhost:3000"];
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowOrigin.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new appError_1.AppError(`CORS blocked: ${origin}`));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-company-id",
        "x-subdomain",
    ],
    exposedHeaders: ["X-Total-Count", "X-Total-Pages"],
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// public route
app.use("/api/v1/public", public_route_1.default);
// Routes
app.use("/api/v1/auth", auth_route_1.AuthRoutes);
app.use("/api/v1/super-admin", super_admin_route_1.SuperAdminRoute);
app.use("/api/v1/company", company_route_1.CompanyRouter);
app.use("/api/v1/vendor", vendor_route_1.VendorRoutes);
app.use("/api/v1/category", category_route_1.CategoryRoutes);
app.use("/api/v1/product", product_route_1.ProductRoutes);
app.use("/api/v1/purchase", purchase_route_1.PurchaseRoute);
app.use("/api/v1/product-variant", product_variant_route_1.ProductVariantRoute);
// app.use('/api/v1/customer', customerRoutes);
// app.use('/api/v1/public',   publicRoutes);
// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});
// ─── 404 — must come after all routes ────────────────────
app.use(ErrorHandler_1.notFoundHandler);
// ─── Global error handler — must be last, needs 4 params ─
app.use(ErrorHandler_1.globalErrorHandler);
exports.default = app;
// ✅ No listen() here
// ✅ No connectDB() here
//# sourceMappingURL=app.js.map