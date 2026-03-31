import express from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CompanyServices } from "./company.service";
import { ApiResponse } from "../../utils/ApiResponse";

const createCompanyUser: express.RequestHandler = asyncHandler(
  async (req, res) => {
    const user = await CompanyServices.createCompanyUser(req.body,req);
    return ApiResponse.created(res, user, "Company user created successfully");
  },
);

export const CompanyControllers = {
  createCompanyUser,
};
