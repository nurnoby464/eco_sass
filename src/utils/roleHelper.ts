// utils/roleHelper.ts
export const STAFF_ROLES = [
  "admin", "account", "site_management",
  "inventory", "sales", "report",
] as const;

export const getProfileType = (role: string) => {
  if (role === "customer") return "Customer";
  if (STAFF_ROLES.includes(role as any)) return "Staff";
  return null; // super_admin
};