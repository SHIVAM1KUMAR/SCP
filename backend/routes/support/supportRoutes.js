import express from "express";
import { protect, requireRole } from "../../middleware/auth.js";
import {
  createSupportTicket,
  deleteSupportTicket,
  getSupportAlerts,
  getSupportContact,
  getSupportTicketById,
  getSupportTickets,
  updateSupportTicket,
  updateSupportTicketStatus,
} from "../../controllers/support/supportController.js";

const router = express.Router();

router.use(protect);

router.get("/alerts", requireRole("SuperAdmin"), getSupportAlerts);
router.get("/contact", requireRole("SuperAdmin", "College", "Student"), getSupportContact);
router.get("/", requireRole("SuperAdmin", "College", "Student"), getSupportTickets);
router.get("/:id", requireRole("SuperAdmin", "College", "Student"), getSupportTicketById);
router.post("/", requireRole("College", "Student"), createSupportTicket);
router.put("/:id", requireRole("College", "Student"), updateSupportTicket);
router.delete("/:id", requireRole("College", "Student"), deleteSupportTicket);
router.patch("/:id/status", requireRole("SuperAdmin"), updateSupportTicketStatus);

export default router;
