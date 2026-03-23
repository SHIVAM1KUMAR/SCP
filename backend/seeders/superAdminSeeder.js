import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/superAdmin.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if super admin already exists
    const adminExists = await Admin.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
    if (adminExists) {
      console.log("Super Admin already exists in DB");
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt);

    const superAdmin = new Admin({
      name: "Super Admin",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: "superadmin"
    });

    await superAdmin.save();
    console.log("Super Admin Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding Super Admin:", error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
