import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  changePassword,
  getMyProfile,
  setPrimaryAddress,
  superAdminLogin,
  updateMyProfile,
  updateMyProfilePicture,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const safeName = String(file.originalname || "profile").replace(/\s+/g, "-");
      cb(null, `${Date.now()}-${safeName}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"), false);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/superadmin/login", superAdminLogin);
router.put("/change-password", protect, changePassword);
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);
router.put("/profile/primary-address", protect, setPrimaryAddress);
router.post("/profile/picture", protect, upload.single("image"), updateMyProfilePicture);

export default router;
