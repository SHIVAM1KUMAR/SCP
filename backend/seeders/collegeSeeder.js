import mongoose from "mongoose";
import dotenv from "dotenv";
import College from "../models/college.js";

dotenv.config();

const seedColleges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const count = await College.countDocuments();
    if (count > 0) {
      console.log("Colleges already seeded");
      process.exit();
    }

    const initialColleges = [
      { collegeName: "St. Xavier's College", collegeCode: "SXC001", location: "New York", email: "info@sxc.edu" },
      { collegeName: "Harvard University", collegeCode: "HU002", location: "Cambridge", email: "info@harvard.edu" },
      { collegeName: "MIT", collegeCode: "MIT003", location: "Boston", email: "info@mit.edu" },
    ];

    await College.insertMany(initialColleges);
    console.log("Colleges Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding Colleges:", error.message);
    process.exit(1);
  }
};

seedColleges();
