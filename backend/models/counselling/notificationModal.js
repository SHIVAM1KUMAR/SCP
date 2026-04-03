import mongoose from "mongoose";

const counsellingNotificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ["SuperAdmin", "College", "Student"],
      required: true,
      index: true,
    },
    recipientId: {
      type: String,
      default: "",
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingSession",
      default: null,
      index: true,
    },
    counsellorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counsellor",
      default: null,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    category: { type: String, default: "counselling" },
    isRead: { type: Boolean, default: false, index: true },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("CounsellingNotification", counsellingNotificationSchema);
