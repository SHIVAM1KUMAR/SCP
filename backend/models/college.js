import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  collegeCode: { type: String, required: true, unique: true },
  location: { type: String, default: "Unknown" },
  email: { type: String },
  status: { type: String, default: "Active", enum: ["Active", "Inactive"] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("College", collegeSchema);
