import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  collegeCode: { type: String, required: true, unique: true },
  collegeType: { type: String },
  location: { type: String, default: "Unknown" },
  email: { type: String },
  address: {
    city: String,
    state: String
  },
  documents: {
    logo: String,
    paymentReceipt: String,
  },
  courses: [{
    courseName: String,
    courseCode: String,
    duration: String,
    totalSeats: Number,
    fees: Number,
    description: String,
  }],
  password: { type: String },
  paymentStatus: { type: String, default: "Unpaid", enum: ["Paid", "Unpaid", "Waived", "Uploaded", "Verified"] },
  status: { type: String, default: "Pending", enum: ["Active", "Inactive", "Pending", "Rejected"] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("College", collegeSchema);
