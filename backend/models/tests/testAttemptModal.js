import mongoose from "mongoose";

const testAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, default: "" },
    selectedOptionIndex: { type: Number, default: null },
    selectedOption: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
    marks: { type: Number, default: 1 },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestSchedule",
      required: true,
      index: true,
    },
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
    status: {
      type: String,
      enum: ["InProgress", "Submitted", "Expired"],
      default: "InProgress",
      index: true,
    },
    answers: { type: [testAnswerSchema], default: [] },
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    lastHeartbeatAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
    expiredAt: { type: Date, default: null },
    autoSubmitted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

testAttemptSchema.index({ testId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("TestAttempt", testAttemptSchema);
