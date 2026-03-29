import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import SuperAdmin from "../models/superAdmin.js";
import Student from "../models/student/student.js";
import College from "../models/college/college.js";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

const toText = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const toOptionalText = (value) => {
  const text = toText(value);
  return text === "" ? "" : text;
};

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toPublicFileUrl = (value) => {
  if (!value) return "";
  const normalized = String(value).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) return normalized;

  const uploadsMatch = normalized.match(/(?:^|\/)uploads\/(.+)$/i);
  if (uploadsMatch?.[1]) {
    const uploadPath = uploadsMatch[1]
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${BASE_URL}/uploads/${uploadPath}`;
  }

  return `${BASE_URL}/${normalized.replace(/^\/+/, "")}`;
};

const getDisplayName = (user) =>
  [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(" ").trim() ||
  user?.name ||
  "Super Admin";

const serializeSuperAdmin = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject({ virtuals: true }) : { ...user };
  return {
    ...obj,
    userMasterId: obj.userMasterId || obj._id?.toString?.() || String(obj._id || ""),
    name: getDisplayName(obj),
    fullName: getDisplayName(obj),
    roleName: obj.roleName || "Super Admin",
    imageUrl: obj.imageUrl ? toPublicFileUrl(obj.imageUrl) : "",
  };
};

const getProfileModelForRole = (role) => {
  const normalized = String(role || "").toLowerCase();
  if (normalized === "superadmin") return SuperAdmin;
  if (normalized === "student") return Student;
  if (normalized === "college") return College;
  return null;
};

const buildSuperAdminPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

const ensureSeedSuperAdmin = async () => {
  const email = toText(process.env.SUPER_ADMIN_EMAIL).toLowerCase();
  const password = toText(process.env.SUPER_ADMIN_PASSWORD);

  if (!email || !password) return null;

  let admin = await SuperAdmin.findOne({ email });
  if (admin) {
    if (!admin.password) {
      admin.password = await buildSuperAdminPassword(password);
      await admin.save();
    }
    return admin;
  }

  admin = await SuperAdmin.create({
    firstName: "Super",
    lastName: "Admin",
    name: "Super Admin",
    email,
    password: await buildSuperAdminPassword(password),
    role: "superadmin",
    roleName: "Super Admin",
    addresses: [],
    emergencyContacts: [],
  });

  return admin;
};

export const superAdminLogin = async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = toText(email).toLowerCase();
  const envEmail = toText(process.env.SUPER_ADMIN_EMAIL).toLowerCase();
  const envPassword = toText(process.env.SUPER_ADMIN_PASSWORD);

  try {
    // Super admin login is anchored to the fixed env identity.
    if (normalizedEmail === envEmail && password === envPassword) {
      const admin = await ensureSeedSuperAdmin();
      const token = generateToken({ role: "SuperAdmin", email: normalizedEmail });
      return res.json({
        message: "Super Admin Logged In",
        role: "SuperAdmin",
        token,
        user: serializeSuperAdmin(admin),
      });
    }

    const admin = await SuperAdmin.findOne({ email: normalizedEmail });
    if (admin) {
      if (!admin.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = generateToken({ role: "SuperAdmin", email: normalizedEmail });
      return res.json({
        message: "Super Admin Logged In",
        role: "SuperAdmin",
        token,
        user: serializeSuperAdmin(admin),
      });
    }

    const student = await Student.findOne({ email: normalizedEmail });
    if (student && student.status === "Active") {
      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = generateToken({ role: "Student", email: normalizedEmail, id: student._id });
      return res.json({ message: "Student Logged In", role: "Student", token, user: student });
    }

    const college = await College.findOne({ email: normalizedEmail });
    if (college && college.status === "Active") {
      const isMatch = await bcrypt.compare(password, college.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = generateToken({ role: "College", email: normalizedEmail, collegeId: college._id });
      return res.json({ message: "College Logged In", role: "College", token, user: college });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { role, email } = req.user || {};
    const { oldPassword, newPassword } = req.body || {};

    if (!role || !email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const Model = getProfileModelForRole(role);
    if (!Model) {
      return res.status(400).json({ message: "Unsupported account role" });
    }

    const user = await Model.findOne({ email: toText(email).toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Password change is not available for this account" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await buildSuperAdminPassword(newPassword);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const { role, email } = req.user || {};
    const Model = getProfileModelForRole(role);

    if (!Model || !email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let user = await Model.findOne({ email: toText(email).toLowerCase() }).select("-password");
    if (!user && String(role).toLowerCase() === "superadmin") {
      const seeded = await ensureSeedSuperAdmin();
      user = seeded ? await Model.findOne({ email: seeded.email }).select("-password") : null;
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    return res.json({ success: true, data: serializeSuperAdmin(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { role, email } = req.user || {};
    const Model = getProfileModelForRole(role);

    if (!Model || !email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentEmail = toText(email).toLowerCase();
    const body = req.body || {};

    let user = await Model.findOne({ email: currentEmail });
    if (!user && String(role).toLowerCase() === "superadmin") {
      const seeded = await ensureSeedSuperAdmin();
      user = seeded ? await Model.findOne({ email: seeded.email }) : null;
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (body.email && toText(body.email).toLowerCase() !== currentEmail) {
      return res.status(400).json({ success: false, message: "Super admin email cannot be changed" });
    }

    const nextAddresses = parseMaybeJson(body.addresses, user.addresses || []);
    const nextContacts = parseMaybeJson(body.emergencyContacts, user.emergencyContacts || []);

    user.firstName = toOptionalText(body.firstName || user.firstName);
    user.middleName = toOptionalText(body.middleName || user.middleName);
    user.lastName = toOptionalText(body.lastName || user.lastName);
    user.name = getDisplayName(user);
    user.phoneNumber = toOptionalText(body.phoneNumber || body.phone || user.phoneNumber);
    user.gender = toOptionalText(body.gender || user.gender);
    user.roleName = toOptionalText(body.roleName || user.roleName) || "Super Admin";
    user.npiNumber = toOptionalText(body.npiNumber || user.npiNumber);
    user.employmentType = toOptionalText(body.employmentType || user.employmentType);
    user.dob = toOptionalText(body.dob || user.dob);
    user.hireDate = toOptionalText(body.hireDate || user.hireDate);
    user.addresses = Array.isArray(nextAddresses) ? nextAddresses : user.addresses;
    user.emergencyContacts = Array.isArray(nextContacts) ? nextContacts : user.emergencyContacts;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: serializeSuperAdmin(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateMyProfilePicture = async (req, res) => {
  try {
    const { role, email } = req.user || {};
    const Model = getProfileModelForRole(role);

    if (!Model || !email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    let user = await Model.findOne({ email: toText(email).toLowerCase() });
    if (!user && String(role).toLowerCase() === "superadmin") {
      const seeded = await ensureSeedSuperAdmin();
      user = seeded ? await Model.findOne({ email: seeded.email }) : null;
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    user.imageUrl = `uploads/${req.file.filename}`;
    await user.save();

    return res.json({
      success: true,
      message: "Profile picture updated",
      data: serializeSuperAdmin(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

export const setPrimaryAddress = async (req, res) => {
  try {
    const { role, email } = req.user || {};
    const { addressId } = req.body || {};
    const Model = getProfileModelForRole(role);

    if (!Model || !email) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!addressId) {
      return res.status(400).json({ success: false, message: "Address ID is required" });
    }

    let user = await Model.findOne({ email: toText(email).toLowerCase() });
    if (!user && String(role).toLowerCase() === "superadmin") {
      const seeded = await ensureSeedSuperAdmin();
      user = seeded ? await Model.findOne({ email: seeded.email }) : null;
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    user.addresses = (user.addresses || []).map((address) => {
      const plain = address.toObject ? address.toObject() : { ...address };
      return {
        ...plain,
        isPrimary: String(plain.addressId) === String(addressId),
      };
    });

    await user.save();

    return res.json({
      success: true,
      message: "Primary address updated",
      data: serializeSuperAdmin(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
