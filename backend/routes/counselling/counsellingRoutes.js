import express from "express";
import { protect, requireRole } from "../../middleware/auth.js";
import {
  createCounsellor,
  createSession,
  deleteCounsellor,
  getCounsellorById,
  getCounsellors,
  getNotifications,
  getSessionById,
  getSessions,
  getStudentDashboard,
  clearNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteSession,
  updateCounsellor,
  updateSession,
} from "../../controllers/counselling/counsellingController.js";

const router = express.Router();

router.use(protect);

router.get("/notifications", getNotifications);
router.patch("/notifications/read-all", markAllNotificationsRead);
router.patch("/notifications/:id/read", markNotificationRead);
router.delete("/notifications/clear", clearNotifications);
router.get("/student-dashboard", requireRole("Student"), getStudentDashboard);

router.get("/counsellors", requireRole("SuperAdmin", "College"), getCounsellors);
router.get("/counsellors/:id", requireRole("SuperAdmin", "College"), getCounsellorById);
router.post("/counsellors", requireRole("College"), createCounsellor);
router.put("/counsellors/:id", requireRole("College"), updateCounsellor);
router.delete("/counsellors/:id", requireRole("College"), deleteCounsellor);

router.get("/sessions", requireRole("SuperAdmin", "College", "Student"), getSessions);
router.get("/sessions/:id", requireRole("SuperAdmin", "College", "Student"), getSessionById);
router.post("/sessions", requireRole("College"), createSession);
router.put("/sessions/:id", requireRole("College"), updateSession);
router.delete("/sessions/:id", requireRole("College"), deleteSession);

export default router;
