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
import { authenticate, verifySession } from "../../middlewares/AuthenticateHelper";
import { guard } from "../../middlewares/guard";

const router = Router();

// ── /api/vendors ──────────────────────────────────────────
router
  .route("/")
  .get(
    validate({ query: vendorQuerySchema }),
    authenticate,verifySession, guard("super_admin","admin","inventory"),
    VendorController.getVendors
  )
  .post(
    validate({ body: createVendorSchema }),
    authenticate,verifySession, guard("super_admin","admin","inventory"),
    VendorController.createVendor
  );

// ── /api/vendors/:id ──────────────────────────────────────
router
  .route("/:id")
  .get(
    validate({ params: vendorParamsSchema }),
    authenticate, verifySession, guard("super_admin","admin","inventory"),
    VendorController.getVendorById
  )
  .patch(
    validate({ params: vendorParamsSchema, body: updateVendorSchema }),
    authenticate, verifySession, guard("super_admin","admin","inventory"),
    VendorController.updateVendor
  )
  .delete(
    validate({ params: vendorParamsSchema }),
    authenticate, verifySession, guard("super_admin","admin","inventory"),
    VendorController.deleteVendor
  );

// ── /api/vendors/:id/notes ────────────────────────────────
router
  .route("/:id/notes")
  .post(
    validate({ params: vendorParamsSchema, body: addNoteSchema }),
    authenticate, verifySession, guard("super_admin","admin","inventory"),
    VendorController.addNote
  );

// ── /api/vendors/:id/notes/:noteId ───────────────────────
router
  .route("/:id/notes/:noteId")
  .delete(
    validate({ params: noteParamsSchema }),
    authenticate, verifySession, guard("super_admin","admin","inventory"),
    VendorController.deleteNote
  );

export const VendorRoutes = router;