import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { UserService } from "./super_admin.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { AppError } from "../../middlewares/appError";
import { CompanyQueryInput } from "../company/company.validation";

// ─── POST /users ──────────────────────────────────────────
const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body, req.user?._id ?? null);

  return ApiResponse.created(res, user, "User created successfully");
});

// ─── GET /users/:id ───────────────────────────────────────
const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await UserService.getUserById(id);

  return ApiResponse.success(res, user);
});

// ─── GET /users ───────────────────────────────────────────
const list = asyncHandler(async (req: Request, res: Response) => {
  const { users, total, page, limit } = await UserService.listUsers(req.query);

  return ApiResponse.paginated(res, users, total, page, limit);
});

// ─── DELETE /users/:id ────────────────────────────────────
const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const requestor = req.user!;

  if (requestor.role !== "super_admin" && requestor.role !== "admin") {
    throw new AppError("You do not have permission to delete users", 403);
  }

  await UserService.deleteUser(id, requestor);

  return ApiResponse.success(res, null, "User deleted successfully");
});

// ─── PATCH /users/:id/status ──────────────────────────────
const toggleStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await UserService.toggleUserStatus(id, req.user!);

  return ApiResponse.success(res, user, "User status updated");
});
// create company

const createCompany = asyncHandler(async (req: Request, res: Response) => {
  const company = await UserService.createCompany(req.body, req);

  return ApiResponse.created(res, company, "Company created successfully");
});

const getAllCompanies = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.getAllCompanies(req.validatedQuery as CompanyQueryInput);
  return ApiResponse.success(res, result, "Companies fetched successfully");
});

const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.getCompanyById(req.params.id as string, req);
  return ApiResponse.success(res, result, "Company fetched successfully");
});

const updateCompany = asyncHandler(async (req: Request, res: Response) => {
  const result = await UserService.updateCompany(req.params.id as string, req.body, req);
  return ApiResponse.success(res, result, "Company updated successfully");
});

const deleteCompany = asyncHandler(async (req: Request, res: Response) => {
  await UserService.deleteCompany(req.params.id as string, req);
  return ApiResponse.success(res, null, "Company deleted successfully");
});

export const UserController = {
  create,
  getById,
  list,
  remove,
  toggleStatus,
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
};
