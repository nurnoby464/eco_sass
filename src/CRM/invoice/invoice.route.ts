import express from "express";
import * as InvoiceController from "./invoice.controller";

const router = express.Router();
// router.get("/", CustomerController.getAll);
router.get("/:orderId", InvoiceController.getByOrderId);
// router.post("/", CustomerController.create);
// router.put("/:id", CustomerController.update);
// router.delete("/:id", CustomerController.delete);

export const InvoiceRouter = router;
