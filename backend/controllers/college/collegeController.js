import College from "../../models/college/College.js";
import User from "../../models/user/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// ─── Mailer ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendCredentials = async ({ to, collegeName, email, password }) => {
  await transporter.sendMail({
    from: `"EduAdmit" <${process.env.SMTP_FROM}>`,
    to,
    subject: `✅ Your EduAdmit College Account is Active — Login Credentials`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="color:#1a6fa8;margin-bottom:8px">Welcome to EduAdmit!</h2>
        <p>Your college <strong>${collegeName}</strong> has been activated.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
    `,
  });
};

// ─── Controllers ───────────────────────────────────────────────────────────

// Register
const registerCollege = async (req, res) => {
  try {
    const { collegeName, collegeCode, email } = req.body;

    const existing = await College.findOne({
      $or: [{ email }, { collegeCode: collegeCode?.toUpperCase() }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "College already exists",
      });
    }

    const docs = {};
    if (req.files?.logo) docs.logo = req.files.logo[0].path;
    if (req.files?.affiliationCert)
      docs.affiliationCert = req.files.affiliationCert[0].path;
    if (req.files?.registrationCert)
      docs.registrationCert = req.files.registrationCert[0].path;

    const college = await College.create({
      ...req.body,
      documents: docs,
      status: "Pending",
      paymentStatus: "Unpaid",
    });

    res.status(201).json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// List
const listColleges = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      const q = new RegExp(search, "i");
      filter.$or = [
        { collegeName: q },
        { collegeCode: q },
        { email: q },
      ];
    }

    const total = await College.countDocuments(filter);

    const colleges = await College.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: colleges, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single
const getCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
const updateCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete
const deleteCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(req.params.id);

    if (college?.adminUser) {
      await User.findByIdAndDelete(college.adminUser);
    }

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Activate
const activateCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);

    const tempPassword = crypto.randomBytes(5).toString("hex");

    const user = new User({
      name: college.collegeName,
      email: college.email,
      password: tempPassword,
      role: "college",
      college: college._id,
    });

    await user.save();

    college.status = "Active";
    college.adminUser = user._id;
    await college.save();

    await sendCredentials({
      to: college.email,
      collegeName: college.collegeName,
      email: college.email,
      password: tempPassword,
    });

    res.json({ success: true, message: "Activated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reject
const rejectCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );

    res.json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const match = await user.comparePassword(password);

    if (!match)
      return res.status(401).json({ success: false, message: "Invalid" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stats
const getStats = async (req, res) => {
  try {
    const total = await College.countDocuments();
    res.json({ success: true, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ EXPORT DEFAULT (VERY IMPORTANT)
export default {
  registerCollege,
  listColleges,
  getCollege,
  updateCollege,
  deleteCollege,
  activateCollege,
  rejectCollege,
  login,
  getStats,
};