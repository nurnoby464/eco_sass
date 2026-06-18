import { Request, Response, NextFunction } from "express";
import Company from "../module/company/company.schema";
import { AppError } from "./appError";
import mongoose from 'mongoose';

export const companyIdentifier = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let company = null;
  const subdomain = req.headers["x-subdomain"] as string | undefined;
  const headerCompanyId = req.headers["x-company-id"];
  console.log("dubbing ---------------------------------");
  console.log(headerCompanyId);
  console.log("origin", req.headers.origin);
  console.log("company before subdomain", company);

  if (subdomain) {
    company = await Company.findOne({
      subdomain: subdomain.toLocaleLowerCase().trim(),
      status: "active",
    })
      .select("_id company_name logo subdomain domain status")
      .lean<any>();
  }
  console.log("company after subdomain", company);
  if (!company) {
    console.log("in !company");
    const companyId = req.headers["x-company-id"] as string | undefined;
    console.log("companyId", companyId);
    console.log("companyId value:", companyId);
    console.log("companyId type:", typeof companyId);
    console.log("check valid or not",)
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      console.log("in company id if");
      company = await Company.findOne({ _id: companyId, status: "active" })
        .select("_id company_name logo subdomain domain status")
        .lean<any>();
    }
    console.log("companyId in req.headers", companyId);
  }

  if (!company && req.params.company_id) {
    const company = await Company.findOne({
      _id: req.params.company_id,
      status: "active",
    })
      .select("_id company_name logo subdomain domain status")
      .lean<any>();
  }

  if (!company && req.headers.origin) {
    console.log("in origin block");
    const origin = req.headers.origin;
    const domain = origin
      .replace(/^https?:\/\//, "") // "rubban.com"
      .replace(/:\d+$/, "") // remove port (localhost:3000 → localhost)
      .toLowerCase();
    console.log("domain", domain);
    if (domain && domain !== "localhost") {
      company = await Company.findOne({ domain, status: "active" })
        .select("_id company_name logo subdomain domain status")
        .lean<any>();
    }
    console.log("company with domain filter", company);
  }
  if (!company) {
    return next(
      new AppError(
        "Company not found. Please check your subdomain, domain or company ID.",
        404,
      ),
    );
  }
  console.log("company", company);
  console.log("dubbing ---------------------------------");
  req.company = company;
  next();
};
