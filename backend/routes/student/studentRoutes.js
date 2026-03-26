import express from "express";
import { getStudents, addStudent, updateStudent, deleteStudent, activateStudent } from "../../controllers/student/studentController.js";

const router = express.Router();

router.get("/", getStudents);
router.post("/", addStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.post("/:id/activate", activateStudent);

export default router;
