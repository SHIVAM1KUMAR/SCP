import Student from "../../models/student/student.js";
import bcrypt from "bcryptjs";
import { sendCredentialsEmail } from "../../utils/mailer.js";

// Fetch all students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password").sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new student
export const addStudent = async (req, res) => {
  const { studentName, email, status } = req.body;
  try {
    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: "Student with this email already exists" });

    const newStudent = new Student({ studentName, email, status: status || "Inactive" });
    await newStudent.save();

    res.status(201).json({ message: "Student added successfully", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { studentName, email, status } = req.body;
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.studentName = studentName || student.studentName;
    student.email = email || student.email;
    student.status = status || student.status;

    await student.save();
    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await Student.findByIdAndDelete(id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Activate student & send credentials
export const activateStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.status === "Active") {
      return res.status(400).json({ message: "Student is already active" });
    }

    // Generate random 8-char password
    const rawPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    student.password = hashedPassword;
    student.status = "Active";
    await student.save();

    // Send email with credentials
    await sendCredentialsEmail(student.email, rawPassword);

    res.json({ message: "Student activated and credentials sent via email", student });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
