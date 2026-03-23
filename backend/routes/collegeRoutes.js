import express from "express";
import { getColleges, toggleInterest } from "../controllers/collegeController.js";

const router = express.Router();

router.get("/", getColleges);
router.post("/:id/interest", toggleInterest);

export default router;
