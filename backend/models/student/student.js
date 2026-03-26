import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional initially, generated upon activation
  interestedColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
  status: { type: String, default: "Inactive", enum: ["Active", "Inactive"] },
  role: { type: String, default: "student" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Student", studentSchema);
