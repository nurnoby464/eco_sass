// src/app.ts — ONLY Express config, routes, middleware
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { SuperAdminRoute } from "./module/super_admin/super_admin.route";
import { globalErrorHandler, notFoundHandler } from "./middlewares/ErrorHandler";

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

// Routes
// app.use('/api/auth',     authRoutes);
app.use("/api/v1/super-admin", SuperAdminRoute);
// app.use('/api/admin',    adminRoutes);
// app.use('/api/vendor',   vendorRoutes);
// app.use('/api/customer', customerRoutes);
// app.use('/api/public',   publicRoutes);

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
