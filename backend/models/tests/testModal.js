import mongoose from "mongoose";

const testQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    questionText: { type: String, default: "" },
    options: [{ type: String, default: "" }],
    correctAnswerIndex: { type: Number, default: 0 },
    marks: { type: Number, default: 1 },
  },
  { _id: false }
);

const testScheduleSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: ["platform", "link"],
      default: "platform",
    },
    testLink: { type: String, default: "" },
    questions: { type: [testQuestionSchema], default: [] },
    scheduledAt: { type: Date, required: true, index: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    durationMinutes: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["Scheduled", "Rescheduled", "Completed", "Missed"],
      default: "Scheduled",
    },
    resultStatus: {
      type: String,
      enum: ["Pending", "Pass", "Fail"],
      default: "Pending",
    },
    scholarshipAmount: { type: Number, default: null },
    scholarshipType: {
      type: String,
      enum: ["Per Year", "Per Sem", "One Time", ""],
      default: "",
    },
    resultNote: { type: String, default: "" },
    resultUpdatedAt: { type: Date, default: null },
    resultUpdatedBy: { type: String, default: "" },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    createdByRole: { type: String, default: "College" },
    createdBy: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model("TestSchedule", testScheduleSchema);
