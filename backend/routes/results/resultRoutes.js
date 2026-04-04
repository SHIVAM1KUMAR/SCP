import express from "express";
import { protect, requireRole } from "../../middleware/auth.js";
import {
  getResultById,
  getResults,
  updateResult,
} from "../../controllers/results/resultController.js";

const router = express.Router();

router.use(protect);

router.get("/", requireRole("College", "Student", "SuperAdmin"), getResults);
router.get("/:id", requireRole("College", "Student", "SuperAdmin"), getResultById);
router.put("/:id", requireRole("College"), updateResult);

export default router;
