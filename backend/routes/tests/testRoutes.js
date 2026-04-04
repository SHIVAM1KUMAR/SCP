import express from "express";
import { protect, requireRole } from "../../middleware/auth.js";
import {
  createTest,
  deleteTest,
  getStudentAttempt,
  getStudentDashboard,
  getTestById,
  getTests,
  heartbeatStudentAttempt,
  startStudentAttempt,
  submitStudentAttempt,
  updateTest,
} from "../../controllers/tests/testController.js";

const router = express.Router();

router.use(protect);

router.get("/student-dashboard", requireRole("Student"), getStudentDashboard);
router.get("/:id/attempt", requireRole("Student"), getStudentAttempt);
router.post("/:id/attempt/start", requireRole("Student"), startStudentAttempt);
router.post("/:id/attempt/heartbeat", requireRole("Student"), heartbeatStudentAttempt);
router.post("/:id/attempt/submit", requireRole("Student"), submitStudentAttempt);

router.get("/", requireRole("College", "Student", "SuperAdmin"), getTests);
router.get("/:id", requireRole("College", "Student", "SuperAdmin"), getTestById);
router.post("/", requireRole("College"), createTest);
router.put("/:id", requireRole("College"), updateTest);
router.delete("/:id", requireRole("College"), deleteTest);

export default router;
