import { CompanyUserInput } from "./company.validation";

const createCompanyUser = async (payload: CompanyUserInput) => {
  console.log(payload);
};
export const CompanyServices = {
    createCompanyUser
}
