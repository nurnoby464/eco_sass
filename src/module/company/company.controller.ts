import express from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CompanyServices } from "./company.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { UserQueryInput } from "./company.validation";

const createCompanyUser: express.RequestHandler = asyncHandler(
  async (req, res) => {
    const user = await CompanyServices.createCompanyUser(req.body, req);
    return ApiResponse.created(res, user, "Company user created successfully");
  },
);

const getAllUsers: express.RequestHandler = asyncHandler(async (req, res) => {
  const {user, page, limit, total} = await CompanyServices.getAllUsers(
    req.validatedQuery as UserQueryInput,
    req,
  );
  return ApiResponse.paginated(res,"User fetch successfully", user, total, page, limit);
  // return ApiResponse.success(res, result, "Users fetched successfully");
});

const getUserById: express.RequestHandler = asyncHandler(async (req, res) => {
  const result = await CompanyServices.getUserById(
    req.params.id as string,
    req,
  );
  return ApiResponse.success(res, result, "User fetched successfully");
});

const updateUser: express.RequestHandler = asyncHandler(async (req, res) => {
  const result = await CompanyServices.updateUser(
    req.params.id as string,
    req.body,
    req,
  );
  return ApiResponse.success(res, result, "User updated successfully");
});

const deleteUser: express.RequestHandler = asyncHandler(async (req, res) => {
  await CompanyServices.deleteUser(req.params.id as string, req);
  return ApiResponse.success(res, null, "User deleted successfully");
});

export const CompanyControllers = {
  createCompanyUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
