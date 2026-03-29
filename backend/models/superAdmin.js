import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    addressId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    contactId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    contactName: { type: String, default: "" },
    relationship: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { _id: false }
);

const superAdminSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "" },
    middleName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    name: { type: String, default: "Super Admin" },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, default: "" },
    role: { type: String, default: "superadmin" },
    roleName: { type: String, default: "Super Admin" },
    phoneNumber: { type: String, default: "" },
    gender: { type: String, default: "" },
    dob: { type: String, default: "" },
    npiNumber: { type: String, default: "" },
    employmentType: { type: String, default: "" },
    hireDate: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    addresses: { type: [addressSchema], default: [] },
    emergencyContacts: { type: [emergencyContactSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

superAdminSchema.virtual("userMasterId").get(function userMasterIdGetter() {
  return this._id?.toString?.() || String(this._id || "");
});

superAdminSchema.virtual("fullName").get(function fullNameGetter() {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(" ").trim();
});

export default mongoose.model("SuperAdmin", superAdminSchema);
