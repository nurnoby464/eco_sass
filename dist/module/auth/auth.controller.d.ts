import { Request, Response } from "express";
export declare const AuthController: {
    login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
    refresh: (req: Request, res: Response, next: import("express").NextFunction) => void;
    removeSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updatePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
//# sourceMappingURL=auth.controller.d.ts.map