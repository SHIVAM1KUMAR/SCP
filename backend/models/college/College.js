import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    // ── Basic Info ────────────────────────────────────────────────────────────
    collegeName: { type: String, required: true, trim: true },
    collegeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    establishedYear: { type: Number },
    collegeType: {
      type: String,
      enum: ["Government", "Private", "Deemed", "Autonomous"],
      required: true,
    },
    affiliation: { type: String, trim: true },

    // ── Address ───────────────────────────────────────────────────────────────
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, default: "India", trim: true },
    },

    // ── Documents ─────────────────────────────────────────────────────────────
    documents: {
      logo: { type: String },
      affiliationCert: { type: String },
      registrationCert: { type: String },
    },

    // ── Bank / Payment ────────────────────────────────────────────────────────
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      bankName: { type: String, trim: true },
      ifscCode: { type: String, uppercase: true, trim: true },
      branch: { type: String, trim: true },
    },

    // ── Admin-controlled fields ───────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive", "Rejected"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Waived"],
      default: "Unpaid",
    },
    paymentAmount: { type: Number, default: 0 },
    paymentDate: { type: Date },
    paymentNote: { type: String },
    activatedAt: { type: Date },
    activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },

    // ── Login User ref ────────────────────────────────────────────────────────
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const College = mongoose.model("College", collegeSchema);

export default College; // ✅ IMPORTANT