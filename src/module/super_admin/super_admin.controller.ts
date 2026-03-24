import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserService } from './super_admin.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { AppError } from '../../middlewares/appError';

// ─── POST /users ──────────────────────────────────────────
const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body, req.user?._id ?? null);

  return ApiResponse.created(res, user, 'User created successfully');
});

// ─── GET /users/:id ───────────────────────────────────────
const getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string
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
    const id = req.params.id as string
  const requestor = req.user!;

  if (requestor.role !== 'super_admin' && requestor.role !== 'admin') {
    throw new AppError('You do not have permission to delete users', 403);
  }

  await UserService.deleteUser(id, requestor);

  return ApiResponse.success(res, null, 'User deleted successfully');
});

// ─── PATCH /users/:id/status ──────────────────────────────
const toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string
  const user = await UserService.toggleUserStatus(id, req.user!);

  return ApiResponse.success(res, user, 'User status updated');
});

export const UserController = {
  create,
  getById,
  list,
  remove,
  toggleStatus,
};