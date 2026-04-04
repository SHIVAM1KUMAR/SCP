import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNo: {
      type: String,
      default: "",
      index: true,
      unique: true,
      sparse: true,
    },
    creatorRole: {
      type: String,
      enum: ["College", "Student"],
      required: true,
      index: true,
    },
    creatorId: {
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
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      default: "",
      trim: true,
    },
    contactPreference: {
      type: String,
      enum: ["Email", "Phone", "Both"],
      default: "Email",
    },
    status: {
      type: String,
      enum: ["Open", "InProgress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },
    resolutionNote: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedByRole: {
      type: String,
      default: "",
    },
    resolvedById: {
      type: String,
      default: "",
    },
    lastUpdatedByRole: {
      type: String,
      default: "",
    },
    lastUpdatedById: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

supportTicketSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("SupportTicket", supportTicketSchema);
