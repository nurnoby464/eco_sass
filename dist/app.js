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
// routes
// import authRoutes from './modules/auth/auth.routes';
// import adminRoutes from './modules/admin/admin.routes';
// import vendorRoutes from './modules/vendor/vendor.routes';
// import customerRoutes from './modules/customer/customer.routes';
// import publicRoutes from './modules/public/public.routes';
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
// app.use('/api/auth',     authRoutes);
app.use("/api/v1/super-admin", super_admin_route_1.SuperAdminRoute);
// app.use('/api/admin',    adminRoutes);
// app.use('/api/vendor',   vendorRoutes);
// app.use('/api/customer', customerRoutes);
// app.use('/api/public',   publicRoutes);
// Health check
app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running" });
});
exports.default = app;
// ✅ No listen() here
// ✅ No connectDB() here
//# sourceMappingURL=app.js.map