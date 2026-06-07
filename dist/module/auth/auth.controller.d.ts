import { Request, Response } from "express";
export declare const registerCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const AuthController: {
    login: (req: Request, res: Response, next: import("express").NextFunction) => void;
    logout: (req: Request, res: Response, next: import("express").NextFunction) => void;
    refresh: (req: Request, res: Response, next: import("express").NextFunction) => void;
    removeSession: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updatePassword: (req: Request, res: Response, next: import("express").NextFunction) => void;
    registerCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getMe: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=auth.controller.d.ts.map