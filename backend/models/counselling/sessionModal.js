import mongoose from "mongoose";

const counsellingSessionSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    counsellorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counsellor",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    scheduledAt: { type: Date, required: true, index: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["Scheduled", "Rescheduled", "Completed", "Missed"],
      default: "Scheduled",
    },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    createdByRole: { type: String, default: "College" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("CounsellingSession", counsellingSessionSchema);
