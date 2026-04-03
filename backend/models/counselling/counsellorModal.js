import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema(
  {
    day: { type: String, default: "" },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
  },
  { _id: false }
);

const counsellorSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    department: { type: String, default: "" },
    availability: { type: [availabilitySlotSchema], default: [] },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    isDeleted: { type: Boolean, default: false },
    createdByRole: { type: String, default: "College" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

counsellorSchema.index(
  { collegeId: 1, email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export default mongoose.model("Counsellor", counsellorSchema);
