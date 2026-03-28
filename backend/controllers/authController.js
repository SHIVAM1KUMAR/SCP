import generateToken from "../utils/generateToken.js";
import Admin from "../models/superAdmin.js";
import Student from "../models/student/student.js";
import College from "../models/college/college.js";
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
////change password for all roles (SuperAdmin, Student, College) in one function to avoid code duplication
export const changePassword = async (req, res) => {
  try {
    const { role, email } = req.user || {};
    const { oldPassword, newPassword } = req.body || {};

    if (!role || !email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const modelByRole = {
      Student,
      College,
      SuperAdmin: Admin,
    };

    const Model = modelByRole[role];
    if (!Model) {
      return res.status(400).json({ message: "Unsupported account role" });
    }

    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Password change is not available for this account" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};
