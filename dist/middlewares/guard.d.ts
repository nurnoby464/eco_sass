import { UserRole } from "../module/super_admin/super_admin.interface";
import { Request, Response, NextFunction } from "express";
export declare const guard: (...allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=guard.d.ts.map