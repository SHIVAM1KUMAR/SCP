import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionName: { type: String, required: true, trim: true },
    subscriptionType: {
      type: String,
      required: true,
      enum: ["Quarterly", "Half Yearly", "Yearly", "Custom"],
    },
    months: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

subscriptionSchema.index(
  { subscriptionName: 1 },
  { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } },
);

export default mongoose.model("Subscription", subscriptionSchema);
