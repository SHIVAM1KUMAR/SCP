import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    photo: { type: String, default: "" },
    aadharCard: { type: String, default: "" },
    tenthMarksheet: { type: String, default: "" },
    twelfthMarksheet: { type: String, default: "" },
    entranceCert: { type: String, default: "" },
    casteCertificate: { type: String, default: "" },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    category: { type: String, default: "" },
    nationality: { type: String, default: "Indian" },
    aadharNumber: { type: String, default: undefined, sparse: true, unique: true },

    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    guardianPhone: { type: String, default: "" },

    address: { type: addressSchema, default: () => ({}) },

    tenthBoard: { type: String, default: "" },
    tenthSchool: { type: String, default: "" },
    tenthYear: { type: Number, default: null },
    tenthMarks: { type: Number, default: null },
    tenthPercentage: { type: Number, default: null },

    twelfthBoard: { type: String, default: "" },
    twelfthSchool: { type: String, default: "" },
    twelfthYear: { type: Number, default: null },
    twelfthMarks: { type: Number, default: null },
    twelfthPercentage: { type: Number, default: null },

    entranceExamName: { type: String, default: "" },
    entranceExamRollNo: { type: String, default: "" },
    entranceExamYear: { type: Number, default: null },
    entranceExamScore: { type: Number, default: null },
    entranceExamRank: { type: Number, default: null },
    otherExamDetails: { type: String, default: "" },

    documents: { type: documentSchema, default: () => ({}) },

    password: { type: String, default: "" },
    interestedColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected", "Inactive", "Active"],
    },
    role: { type: String, default: "student" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.virtual("studentName").get(function studentNameGetter() {
  return [this.firstName, this.lastName].filter(Boolean).join(" ").trim();
});

studentSchema.virtual("fullName").get(function fullNameGetter() {
  return [this.firstName, this.lastName].filter(Boolean).join(" ").trim();
});

export default mongoose.model("Student", studentSchema);
