import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  getStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  approveStudent,
  rejectStudent,
  activateStudent,
} from "../../controllers/student/studentController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${file.fieldname}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPhoto = file.fieldname === "photo";
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedDocTypes = [...allowedImageTypes, "application/pdf"];
  const allowedTypes = isPhoto ? allowedImageTypes : allowedDocTypes;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error(`Invalid file type for ${file.fieldname}`), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadStudentDocuments = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "aadharCard", maxCount: 1 },
  { name: "tenthMarksheet", maxCount: 1 },
  { name: "twelfthMarksheet", maxCount: 1 },
  { name: "entranceCert", maxCount: 1 },
  { name: "casteCertificate", maxCount: 1 },
]);

router.get("/", getStudents);
router.get("/:id", getStudentById);
router.post("/", uploadStudentDocuments, addStudent);
router.put("/:id", uploadStudentDocuments, updateStudent);
router.delete("/:id", deleteStudent);
router.post("/:id/approve", approveStudent);
router.post("/:id/reject", rejectStudent);
router.post("/:id/activate", activateStudent);

export default router;
