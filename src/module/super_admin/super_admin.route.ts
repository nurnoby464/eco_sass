import express from "express";
import { validate } from "../../middlewares/validate";
import { createUserSchema } from "./super_admin.validation";
const router = express.Router();

router.post("/company", validate({ body: createUserSchema }));
export const SuperAdminRoute = router;
