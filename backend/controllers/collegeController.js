import College from "../models/college.js";
import Student from "../models/student.js";
import bcrypt from "bcryptjs";
import path from "path";
import { sendCollegeCredentialsEmail } from "../utils/mailer.js";

// 🔥 BASE URL (IMPORTANT)
const BASE_URL = "http://localhost:5000";

const toPublicFileUrl = (value) => {
  if (!value) return value;
  const normalized = String(value).replace(/\\/g, "/");
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  const uploadsMatch = normalized.match(/(?:^|\/)uploads\/(.+)$/i);
  if (uploadsMatch?.[1]) {
    const uploadPath = uploadsMatch[1]
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${BASE_URL}/uploads/${uploadPath}`;
  }

  if (/^[a-zA-Z]:\//.test(normalized) || path.isAbsolute(normalized)) {
    return `${BASE_URL}/uploads/${encodeURIComponent(path.basename(normalized))}`;
  }

  return `${BASE_URL}/${normalized.replace(/^\/+/, "")}`;
};

const toStoredUploadPath = (file) => {
  if (!file?.filename) return null;
  return `uploads/${file.filename}`;
};

const normalizeDocumentValue = (value) => {
  if (!value) return null;

  const raw = String(value).replace(/\\/g, "/");
  const fileName = raw.split("/").pop() || "";

  return {
    path: raw,
    url: toPublicFileUrl(raw),
    name: fileName,
  };
};

const attachDocumentViews = (obj) => {
  const documents = obj?.documents || {};
  const documentFiles = {};

  Object.keys(documents).forEach((key) => {
    documentFiles[key] = normalizeDocumentValue(documents[key]);
    if (documentFiles[key]?.url) {
      documents[key] = documentFiles[key].url;
    }
  });

  return {
    ...obj,
    documents,
    documentFiles,
  };
};

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

    // ✅ FIX: add full file URL
    const formatted = colleges.map((c) => {
      const obj = c.toObject();

      if (obj.documents) {
        Object.keys(obj.documents).forEach((key) => {
          if (obj.documents[key]) {
            obj.documents[key] = toPublicFileUrl(obj.documents[key]);
          }
        });
      }

      return attachDocumentViews(obj);
    });

    const total = await College.countDocuments(query);

    res.json({ success: true, data: formatted, total });
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
    console.log("🔥 FULL REQ BODY:", req.body);

    const {
      collegeName,
      collegeCode,
      email,
      collegeType,
      phone,
      website,
      establishedYear,
      affiliation,
    } = req.body;

    // ✅ Parse address properly
    let address = {};
    if (req.body.address) {
      try {
        address = JSON.parse(req.body.address);
      } catch (e) {
        console.log("❌ Address JSON parse error:", e.message);
        address = {};
      }
    }

    // ✅ Ensure all fields exist
    address = {
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      country: address.country || "India",
    };

    console.log("📍 PARSED ADDRESS:", address);

    // ✅ Create proper location
    const locationParts = [
      address.city,
      address.state,
      address.country,
    ].filter(Boolean);

    const location =
      locationParts.length > 0
        ? locationParts.join(", ")
        : "Unknown";

    console.log("🌍 FINAL LOCATION:", location);

    // ✅ Parse courses
    let parsedCourses = [];
    if (req.body.courses) {
      try {
        parsedCourses = JSON.parse(req.body.courses);
      } catch (e) {
        console.log("❌ Courses parse error:", e.message);
      }
    }

    console.log("📚 COURSES:", parsedCourses);

    // ✅ Handle documents
    const documents = {};
    if (req.files) {
      if (req.files.logo?.[0]) documents.logo = toStoredUploadPath(req.files.logo[0]);
      if (req.files.affiliationCert?.[0]) documents.affiliationCert = toStoredUploadPath(req.files.affiliationCert[0]);
      if (req.files.registrationCert?.[0]) documents.registrationCert = toStoredUploadPath(req.files.registrationCert[0]);
      if (req.files.paymentReceipt?.[0]) documents.paymentReceipt = toStoredUploadPath(req.files.paymentReceipt[0]);
    }

    console.log("📁 FILES:", documents);

    // ✅ Check duplicate
    const existing = await College.findOne({ collegeCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "College code already exists",
      });
    }

    // ✅ Save
    const college = new College({
      collegeName,
      collegeCode,
      email,
      phone,
      website,
      established: establishedYear,
      affiliation,
      location,
      collegeType,
      address,
      documents,
      courses: parsedCourses,
      status: "Pending",
      paymentStatus: documents.paymentReceipt ? "Uploaded" : "Unpaid",
    });

    await college.save();

    console.log("✅ SAVED COLLEGE:", college);

    res.json({
      success: true,
      message: "College registered successfully",
      data: attachDocumentViews(college.toObject()),
    });

  } catch (error) {
    console.log("❌ ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const activateCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    if (college.status === "Active") {
      return res.status(400).json({ success: false, message: "College already active" });
    }

    const rawPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    college.status = "Active";
    college.paymentStatus = "Paid";
    college.password = hashedPassword;

    await college.save();

    await sendCollegeCredentialsEmail(college.email, rawPassword);

    res.json({
      success: true,
      message: "College activated and credentials sent",
      data: college
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const rejectCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findByIdAndUpdate(
      id,
      { status: "Rejected" },
      { new: true }
    );

    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    res.json({ success: true, message: "College rejected", data: college });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findByIdAndDelete(id);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

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

    res.json({
      message: index === -1 ? "Interest added" : "Interest removed",
      interestedColleges: student.interestedColleges
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });

    // ✅ format URLs
    const formatted = colleges.map((c) => {
      const obj = c.toObject();
      if (obj.documents) {
        Object.keys(obj.documents).forEach((key) => {
          if (obj.documents[key]) {
            obj.documents[key] = toPublicFileUrl(obj.documents[key]);
          }
        });
      }
      return attachDocumentViews(obj);
    });

    res.json({ success: true, data: formatted });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    college.paymentStatus = "Verified";
    college.status = "Active";

    if (!college.password) {
      const rawPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      college.password = await bcrypt.hash(rawPassword, salt);

      await sendCollegeCredentialsEmail(college.email, rawPassword);
    }

    await college.save();

    res.json({
      success: true,
      message: "Payment verified and college activated",
      data: college
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    let address = college.address || {};
    if (req.body.address) {
      try {
        address = JSON.parse(req.body.address);
      } catch (e) {}
    }

    let parsedCourses = college.courses || [];
    if (typeof req.body.courses === "string") {
      try {
        parsedCourses = JSON.parse(req.body.courses);
      } catch (e) {}
    } else if (Array.isArray(req.body.courses)) {
      parsedCourses = req.body.courses;
    }

    const documents = {
      ...(college.documents || {}),
    };

    if (req.files?.logo?.[0]) documents.logo = toStoredUploadPath(req.files.logo[0]);
    if (req.files?.affiliationCert?.[0]) documents.affiliationCert = toStoredUploadPath(req.files.affiliationCert[0]);
    if (req.files?.registrationCert?.[0]) documents.registrationCert = toStoredUploadPath(req.files.registrationCert[0]);
    if (req.files?.paymentReceipt?.[0]) documents.paymentReceipt = toStoredUploadPath(req.files.paymentReceipt[0]);

    const locationParts = [
      address?.city,
      address?.state,
      address?.country,
    ].filter(Boolean);

    college.collegeName = req.body.collegeName ?? college.collegeName;
    college.collegeCode = req.body.collegeCode ?? college.collegeCode;
    college.email = req.body.email ?? college.email;
    college.phone = req.body.phone ?? college.phone;
    college.website = req.body.website ?? college.website;
    college.established = req.body.establishedYear ?? req.body.established ?? college.established;
    college.affiliation = req.body.affiliation ?? college.affiliation;
    college.collegeType = req.body.collegeType ?? college.collegeType;
    college.address = address;
    college.location = locationParts.length ? locationParts.join(", ") : college.location;
    college.courses = parsedCourses;
    college.documents = documents;
    if (req.files?.paymentReceipt?.[0]) {
      college.paymentStatus = "Uploaded";
    }

    await college.save();

    res.json({
      success: true,
      message: "College updated successfully",
      data: attachDocumentViews(college.toObject())
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getSingleCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // ✅ FIX: return full URLs
    const obj = college.toObject();

    res.status(200).json({
      success: true,
      data: attachDocumentViews(obj),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
