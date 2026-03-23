import express from "express";
import multer from "multer";
import path from "path";

import ctrl from "../../controllers/college/collegeController.js";
import { protect, requireRole } from "../../middleware/auth.js";

const router = express.Router();

// ─── Multer — file uploads ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext)
    ? cb(null, true)
    : cb(new Error("Only jpg/png/pdf allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5 MB

// ─── Public ───────────────────────────────────────────────────────────────────
router.post(
  "/register",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "affiliationCert", maxCount: 1 },
    { name: "registrationCert", maxCount: 1 },
  ]),
  ctrl.registerCollege
);

// ─── Superadmin only ──────────────────────────────────────────────────────────
router.use(protect, requireRole("superadmin"));

router.get("/stats", ctrl.getStats);
router.get("/", ctrl.listColleges);
router.get("/:id", ctrl.getCollege);
router.put("/:id", ctrl.updateCollege);
router.delete("/:id", ctrl.deleteCollege);
router.post("/:id/activate", ctrl.activateCollege);
router.post("/:id/reject", ctrl.rejectCollege);

export default router; // ✅ VERY IMPORTANT