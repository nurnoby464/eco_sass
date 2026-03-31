// src/app.ts — ONLY Express config, routes, middleware
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { SuperAdminRoute } from "./module/super_admin/super_admin.route";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./middlewares/ErrorHandler";
import { AuthRoutes } from "./module/auth/auth.route";
import cookieParser from "cookie-parser";
import { CompanyRouter } from "./module/company/company.route";

// routes
// import authRoutes from './modules/auth/auth.routes';
// import adminRoutes from './modules/admin/admin.routes';
// import vendorRoutes from './modules/vendor/vendor.routes';
// import customerRoutes from './modules/customer/customer.routes';
// import publicRoutes from './modules/public/public.routes';

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/super-admin", SuperAdminRoute);
app.use("/api/v1/company", CompanyRouter);
// app.use('/api/v1/vendor',   vendorRoutes);
// app.use('/api/v1/customer', customerRoutes);
// app.use('/api/v1/public',   publicRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// ─── 404 — must come after all routes ────────────────────
app.use(notFoundHandler);

// ─── Global error handler — must be last, needs 4 params ─
app.use(globalErrorHandler);
export default app;
// ✅ No listen() here
// ✅ No connectDB() here
