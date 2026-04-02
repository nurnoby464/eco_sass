// src/module/vendor/vendor.route.ts
import { Router }          from "express";
import { validate }        from "../../middlewares/validate";
import {
  createVendorSchema,
  updateVendorSchema,
  addNoteSchema,
  vendorParamsSchema,
  noteParamsSchema,
  vendorQuerySchema,
} from "./vendor.validation";
import { VendorController } from "./vendor.controller";

const router = Router();

// ── /api/vendors ──────────────────────────────────────────
router
  .route("/")
  .get(
    validate({ query: vendorQuerySchema }),
    VendorController.getVendors
  )
  .post(
    validate({ body: createVendorSchema }),
    VendorController.createVendor
  );

// ── /api/vendors/:id ──────────────────────────────────────
router
  .route("/:id")
  .get(
    validate({ params: vendorParamsSchema }),
    VendorController.getVendorById
  )
  .patch(
    validate({ params: vendorParamsSchema, body: updateVendorSchema }),
    VendorController.updateVendor
  )
  .delete(
    validate({ params: vendorParamsSchema }),
    VendorController.deleteVendor
  );

// ── /api/vendors/:id/notes ────────────────────────────────
router
  .route("/:id/notes")
  .post(
    validate({ params: vendorParamsSchema, body: addNoteSchema }),
    VendorController.addNote
  );

// ── /api/vendors/:id/notes/:noteId ───────────────────────
router
  .route("/:id/notes/:noteId")
  .delete(
    validate({ params: noteParamsSchema }),
    VendorController.deleteNote
  );

export default router;