import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  getColleges,
  getSingleCollege,
  getCollegeStats,
  activateCollege,
  rejectCollege,
  deleteCollege,
  toggleInterest,
  registerCollege,
  updateCollege,
  getPayments,
  verifyPayment,
} from "../../controllers/college/collegeController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
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
router.put("/:id", upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "affiliationCert", maxCount: 1 },
  { name: "registrationCert", maxCount: 1 },
  { name: "paymentReceipt", maxCount: 1 },
]), updateCollege);
router.delete("/:id", deleteCollege);
router.get("/:id", getSingleCollege);
router.post("/:id/interest", toggleInterest);
//These Are go in OtherPart
router.get("/payments", getPayments);
router.patch("/payments/:id/verify", verifyPayment);
export default router;
