import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  collegeCode: { type: String, required: true, unique: true },
  collegeType: { type: String },

  // ✅ Basic Info
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  established: { type: String },
  affiliation: { type: String },

  location: { type: String, default: "Unknown" },

  // ✅ Address (extended but backward safe)
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },

  // ✅ Documents (extended but backward safe)
  documents: {
    logo: String,
    affiliationCert: String,
    registrationCert: String,
    paymentReceipt: String,
  },

  // ✅ Courses (same as before)
  courses: [{
    courseName: String,
    courseCode: String,
    duration: String,
    totalSeats: Number,
    fees: Number,
    description: String,
  }],

  // ✅ Optional (kept from old schema)
  password: { type: String },

  paymentStatus: {
    type: String,
    default: "Unpaid",
    enum: ["Paid", "Unpaid", "Waived", "Uploaded", "Verified"]
  },

  status: {
    type: String,
    default: "Pending",
    enum: ["Active", "Inactive", "Pending", "Rejected"]
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("College", collegeSchema);