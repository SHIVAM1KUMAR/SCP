import generateToken from "../utils/generateToken.js";
import Admin from "../models/superAdmin.js";
import Student from "../models/student.js";
import College from "../models/college.js";
import bcrypt from "bcryptjs";

export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check Super Admin in DB
    const admin = await Admin.findOne({ email });
    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
      
      const token = generateToken({ role: "SuperAdmin", email });
      return res.json({ message: "Super Admin Logged In", role: "SuperAdmin", token });
    }

    // 2. Check Student in DB
    const student = await Student.findOne({ email });
    if (student && student.status === "Active") {
      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
      
      // The frontend uses "User" role for general students/users
      const token = generateToken({ role: "Student", email });
      return res.json({ message: "Student Logged In", role: "Student", token, user: student });
    }

    // 3. Check College in DB
    const college = await College.findOne({ email });
    if (college && college.status === "Active") {
      const isMatch = await bcrypt.compare(password, college.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
      
      const token = generateToken({ role: "College", email });
      return res.json({ message: "College Logged In", role: "College", token, user: college });
    }

    // Fallback: Check Process Env SuperAdmin
    if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
      const token = generateToken({ role: "SuperAdmin", email });
      return res.json({ message: "Super Admin Logged In", role: "SuperAdmin", token });
    }

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};