import College from "../models/college.js";
import Student from "../models/student.js";
import bcrypt from "bcryptjs";
import { sendCollegeCredentialsEmail } from "../utils/mailer.js";

export const getColleges = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.collegeName = { $regex: search, $options: "i" };
    }
    if (status && status !== "All") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const colleges = await College.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await College.countDocuments(query);
    res.json({ success: true, data: colleges, total });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getCollegeStats = async (req, res) => {
  try {
    const total = await College.countDocuments();
    const active = await College.countDocuments({ status: "Active" });
    const pending = await College.countDocuments({ status: "Pending" });
    const rejected = await College.countDocuments({ status: "Rejected" });
    
    res.json({ success: true, data: { total, active, pending, rejected } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const registerCollege = async (req, res) => {
  try {
    const { 
      collegeName, collegeCode, email, location, collegeType, 
      phone, website, establishedYear, affiliation
    } = req.body;
    
    const address = {
      street: req.body["address[street]"],
      city: req.body["address[city]"],
      state: req.body["address[state]"],
      pincode: req.body["address[pincode]"],
      country: req.body["address[country]"],
    };
    
    const bankDetails = {
      accountHolderName: req.body["bankDetails[accountHolderName]"],
      accountNumber: req.body["bankDetails[accountNumber]"],
      bankName: req.body["bankDetails[bankName]"],
      ifscCode: req.body["bankDetails[ifscCode]"],
      branch: req.body["bankDetails[branch]"],
    };

    const documents = {};
    if (req.files) {
      if (req.files.logo) documents.logo = req.files.logo[0].path;
      if (req.files.affiliationCert) documents.affiliationCert = req.files.affiliationCert[0].path;
      if (req.files.registrationCert) documents.registrationCert = req.files.registrationCert[0].path;
    }

    const existing = await College.findOne({ collegeCode });
    if (existing) {
      return res.status(400).json({ success: false, message: "College code already exists" });
    }
    
    const college = new College({
      collegeName,
      collegeCode,
      email,
      phone,
      website,
      establishedYear,
      affiliation,
      location: location || req.body["address[city]"],
      collegeType,
      address,
      bankDetails,
      documents,
      status: "Pending",
      paymentStatus: "Unpaid"
    });
    
    await college.save();
    res.json({ success: true, message: "College registered successfully", data: college });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const activateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);
    if (!college) return res.status(404).json({ success: false, message: "College not found" });

    if (college.status === "Active") {
      return res.status(400).json({ success: false, message: "College is already active" });
    }

    // Generate random 8-char password
    const rawPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    college.status = "Active";
    college.paymentStatus = "Paid";
    college.password = hashedPassword;
    await college.save();

    await sendCollegeCredentialsEmail(college.email, rawPassword);

    res.json({ success: true, message: "College activated and credentials sent successfully", data: college });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const rejectCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const college = await College.findByIdAndUpdate(id, { 
      status: "Rejected", 
      // rejectionReason 
    }, { new: true });
    if (!college) return res.status(404).json({ success: false, message: "College not found" });
    res.json({ success: true, message: "College rejected", data: college });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findByIdAndDelete(id);
    if (!college) return res.status(404).json({ success: false, message: "College not found" });
    res.json({ success: true, message: "College deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const toggleInterest = async (req, res) => {
  const { id } = req.params; 
  const { studentEmail } = req.body; 

  try {
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!student.interestedColleges) {
      student.interestedColleges = [];
    }

    const index = student.interestedColleges.indexOf(id);
    if (index === -1) {
      student.interestedColleges.push(id);
    } else {
      student.interestedColleges.splice(index, 1);
    }
    
    await student.save();
    res.json({ message: index === -1 ? "Interest added" : "Interest removed", interestedColleges: student.interestedColleges });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
