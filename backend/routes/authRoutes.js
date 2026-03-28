import express from "express";
import { changePassword, superAdminLogin } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/superadmin/login", superAdminLogin);
router.put("/change-password", protect, changePassword);

export default router;
