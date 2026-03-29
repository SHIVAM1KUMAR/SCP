import bcrypt from "bcryptjs";
import path from "path";
import Student from "../../models/student/studentModal.js";
import { sendCredentialsEmail } from "../../utils/mailer.js";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

const REQUIRED_DOCUMENT_KEYS = [
  "photo",
  "aadharCard",
  "tenthMarksheet",
  "twelfthMarksheet",
];

const ALL_DOCUMENT_KEYS = [
  "photo",
  "aadharCard",
  "tenthMarksheet",
  "twelfthMarksheet",
  "entranceCert",
  "casteCertificate",
];

const LEGACY_STATUS_DEFAULT = "Inactive";
const REGISTRATION_STATUS_DEFAULT = "Pending";

const toText = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const toOptionalText = (value) => {
  const text = toText(value);
  return text === "" ? "" : text;
};

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseAddress = (value) => {
  if (!value) {
    return {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    };
  }

  if (typeof value === "object") {
    return {
      street: toText(value.street),
      city: toText(value.city),
      state: toText(value.state),
      pincode: toText(value.pincode),
      country: toText(value.country, "India") || "India",
    };
  }

  try {
    const parsed = JSON.parse(value);
    return parseAddress(parsed);
  } catch {
    return {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    };
  }
};

const normalizeFilePath = (value) => {
  if (!value) return "";
  return String(value).replace(/\\/g, "/");
};

const toPublicFileUrl = (value) => {
  if (!value) return "";
  const normalized = normalizeFilePath(value);

  if (/^https?:\/\//i.test(normalized)) {
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
  if (!file?.filename) return "";
  return `uploads/${file.filename}`;
};

const normalizeDocumentValue = (value) => {
  if (!value) return "";

  const raw = normalizeFilePath(value);
  return {
    path: raw,
    url: toPublicFileUrl(raw),
    name: raw.split("/").pop() || "",
  };
};

const buildDocumentViews = (documents = {}) => {
  const documentFiles = {};
  const publicDocuments = {};

  ALL_DOCUMENT_KEYS.forEach((key) => {
    const value = documents?.[key] || "";
    documentFiles[key] = normalizeDocumentValue(value);
    publicDocuments[key] = documentFiles[key]?.url || "";
  });

  return { publicDocuments, documentFiles };
};

const attachStudentViews = (student) => {
  if (!student) return student;

  const obj = student.toObject ? student.toObject() : { ...student };
  delete obj.password;
  delete obj.__v;
  const { publicDocuments, documentFiles } = buildDocumentViews(obj.documents || {});

  return {
    ...obj,
    studentName: [obj.firstName, obj.lastName].filter(Boolean).join(" ").trim(),
    fullName: [obj.firstName, obj.lastName].filter(Boolean).join(" ").trim(),
    documents: publicDocuments,
    documentFiles,
  };
};

const hasDetailedRegistrationPayload = (body, files) => (
  Boolean(
    body.firstName ||
      body.lastName ||
      body.phone ||
      body.dateOfBirth ||
      body.gender ||
      body.address ||
      body.tenthBoard ||
      body.twelfthBoard ||
      body.entranceExamName ||
      files?.photo?.[0] ||
      files?.aadharCard?.[0] ||
      files?.tenthMarksheet?.[0] ||
      files?.twelfthMarksheet?.[0]
  )
);

const buildStudentPayload = (req, existingStudent = null) => {
  const body = req.body || {};
  const isDetailed = hasDetailedRegistrationPayload(body, req.files);
  const fallbackName = toText(body.studentName || existingStudent?.studentName || "");
  const nameParts = fallbackName.split(/\s+/).filter(Boolean);

  const firstName = toOptionalText(body.firstName || existingStudent?.firstName || nameParts[0] || "");
  const lastName = toOptionalText(
    body.lastName || existingStudent?.lastName || nameParts.slice(1).join(" ") || ""
  );

  const documents = {
    ...(existingStudent?.documents || {}),
  };

  if (req.files?.photo?.[0]) documents.photo = toStoredUploadPath(req.files.photo[0]);
  if (req.files?.aadharCard?.[0]) documents.aadharCard = toStoredUploadPath(req.files.aadharCard[0]);
  if (req.files?.tenthMarksheet?.[0]) documents.tenthMarksheet = toStoredUploadPath(req.files.tenthMarksheet[0]);
  if (req.files?.twelfthMarksheet?.[0]) documents.twelfthMarksheet = toStoredUploadPath(req.files.twelfthMarksheet[0]);
  if (req.files?.entranceCert?.[0]) documents.entranceCert = toStoredUploadPath(req.files.entranceCert[0]);
  if (req.files?.casteCertificate?.[0]) documents.casteCertificate = toStoredUploadPath(req.files.casteCertificate[0]);

  const statusFromBody = toOptionalText(body.status || existingStudent?.status);
  const status = statusFromBody || (isDetailed ? REGISTRATION_STATUS_DEFAULT : LEGACY_STATUS_DEFAULT);

  return {
    firstName,
    lastName,
    email: toText(body.email || existingStudent?.email).toLowerCase(),
    phone: toOptionalText(body.phone || existingStudent?.phone),
    dateOfBirth: toOptionalText(body.dateOfBirth || existingStudent?.dateOfBirth),
    age: toNumber(body.age ?? existingStudent?.age),
    gender: toOptionalText(body.gender || existingStudent?.gender),
    bloodGroup: toOptionalText(body.bloodGroup || existingStudent?.bloodGroup),
    category: toOptionalText(body.category || existingStudent?.category),
    nationality: toOptionalText(body.nationality || existingStudent?.nationality) || "Indian",
    aadharNumber: toOptionalText(body.aadharNumber || existingStudent?.aadharNumber) || undefined,
    fatherName: toOptionalText(body.fatherName || existingStudent?.fatherName),
    motherName: toOptionalText(body.motherName || existingStudent?.motherName),
    guardianPhone: toOptionalText(body.guardianPhone || existingStudent?.guardianPhone),
    address: parseAddress(body.address || existingStudent?.address),
    tenthBoard: toOptionalText(body.tenthBoard || existingStudent?.tenthBoard),
    tenthSchool: toOptionalText(body.tenthSchool || existingStudent?.tenthSchool),
    tenthYear: toNumber(body.tenthYear ?? existingStudent?.tenthYear),
    tenthMarks: toNumber(body.tenthMarks ?? existingStudent?.tenthMarks),
    tenthPercentage: toNumber(body.tenthPercentage ?? existingStudent?.tenthPercentage),
    twelfthBoard: toOptionalText(body.twelfthBoard || existingStudent?.twelfthBoard),
    twelfthSchool: toOptionalText(body.twelfthSchool || existingStudent?.twelfthSchool),
    twelfthYear: toNumber(body.twelfthYear ?? existingStudent?.twelfthYear),
    twelfthMarks: toNumber(body.twelfthMarks ?? existingStudent?.twelfthMarks),
    twelfthPercentage: toNumber(body.twelfthPercentage ?? existingStudent?.twelfthPercentage),
    entranceExamName: toOptionalText(body.entranceExamName || existingStudent?.entranceExamName),
    entranceExamRollNo: toOptionalText(body.entranceExamRollNo || existingStudent?.entranceExamRollNo),
    entranceExamYear: toNumber(body.entranceExamYear ?? existingStudent?.entranceExamYear),
    entranceExamScore: toNumber(body.entranceExamScore ?? existingStudent?.entranceExamScore),
    entranceExamRank: toNumber(body.entranceExamRank ?? existingStudent?.entranceExamRank),
    otherExamDetails: toOptionalText(body.otherExamDetails || existingStudent?.otherExamDetails),
    documents,
    status,
    isDetailed,
  };
};

const validateRequiredDocuments = (documents) => {
  const missing = REQUIRED_DOCUMENT_KEYS.filter((key) => !documents?.[key]);
  return missing;
};

const sanitizeEmail = (value) => toText(value).toLowerCase();

// Fetch all students
export const getStudents = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      const regex = { $regex: search, $options: "i" };
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { fatherName: regex },
        { motherName: regex },
      ];
    }

    const students = await Student.find(query).select("-password").sort({ createdAt: -1 });
    res.json(students.map(attachStudentViews));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch single student
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).select("-password");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.json({ success: true, data: attachStudentViews(student) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Add new student
export const addStudent = async (req, res) => {
  try {
    const { isDetailed, ...payload } = buildStudentPayload(req);

    if (!payload.email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existing = await Student.findOne({ email: payload.email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Student with this email already exists" });
    }

    if (payload.aadharNumber) {
      const existingAadhar = await Student.findOne({ aadharNumber: payload.aadharNumber });
      if (existingAadhar) {
        return res.status(400).json({ success: false, message: "Student with this Aadhar number already exists" });
      }
    }

    if (isDetailed) {
      const missingDocuments = validateRequiredDocuments(payload.documents);
      if (missingDocuments.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required documents: ${missingDocuments.join(", ")}`,
        });
      }
    }

    const student = new Student(payload);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: attachStudentViews(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const { isDetailed, ...payload } = buildStudentPayload(req, student);

    if (!payload.email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const existingEmail = await Student.findOne({
      email: sanitizeEmail(payload.email),
      _id: { $ne: id },
    });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Student with this email already exists" });
    }

    if (payload.aadharNumber) {
      const existingAadhar = await Student.findOne({
        aadharNumber: payload.aadharNumber,
        _id: { $ne: id },
      });
      if (existingAadhar) {
        return res.status(400).json({ success: false, message: "Student with this Aadhar number already exists" });
      }
    }

    Object.assign(student, payload);

    if (isDetailed) {
      const missingDocuments = validateRequiredDocuments(student.documents);
      if (missingDocuments.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required documents: ${missingDocuments.join(", ")}`,
        });
      }
    }

    await student.save();

    res.json({
      success: true,
      message: "Student updated successfully",
      data: attachStudentViews(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Approve student profile
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    student.status = "Approved";
    await student.save();

    res.json({
      success: true,
      message: "Student approved successfully",
      data: attachStudentViews(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Reject student profile
export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    student.status = "Rejected";
    await student.save();

    res.json({
      success: true,
      message: "Student rejected successfully",
      data: attachStudentViews(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Activate student & send credentials
export const activateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (student.status === "Active") {
      return res.status(400).json({ success: false, message: "Student is already active" });
    }

    if (!student.email) {
      return res.status(400).json({ success: false, message: "Student email is missing" });
    }

    const rawPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    student.password = hashedPassword;
    student.status = "Active";
    await student.save();

    await sendCredentialsEmail(student.email, rawPassword);

    res.json({
      success: true,
      message: "Student activated and credentials sent via email",
      data: attachStudentViews(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
