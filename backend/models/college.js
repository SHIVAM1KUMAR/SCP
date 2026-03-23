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
  },
  password: { type: String },
  paymentStatus: { type: String, default: "Unpaid", enum: ["Paid", "Unpaid", "Waived"] },
  status: { type: String, default: "Pending", enum: ["Active", "Inactive", "Pending", "Rejected"] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("College", collegeSchema);
