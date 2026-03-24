import express from "express";
import multer from "multer";
import { getColleges, getCollegeStats, activateCollege, rejectCollege, deleteCollege, toggleInterest, registerCollege } from "../controllers/collegeController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/register", upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'affiliationCert', maxCount: 1 },
  { name: 'registrationCert', maxCount: 1 },
  { name: 'paymentReceipt', maxCount: 1 }
]), registerCollege);
router.get("/stats", getCollegeStats);
router.get("/", getColleges);
router.post("/:id/activate", activateCollege);
router.post("/:id/reject", rejectCollege);
router.post("/:id/interest", toggleInterest);
router.delete("/:id", deleteCollege);

// Superadmin payment routes
import { getPayments, verifyPayment } from "../controllers/collegeController.js";
router.get("/payments", getPayments);
router.patch("/payments/:id/verify", verifyPayment);

export default router;
