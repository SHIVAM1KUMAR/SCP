import { isValidObjectId } from "mongoose";
import SupportTicket from "../../models/support/supportModal.js";
import Student from "../../models/student/studentModal.js";
import College from "../../models/college/collegeModal.js";
import SuperAdmin from "../../models/superAdmin.js";

const normalizeRole = (role = "") => String(role).trim().toLowerCase();

const isObjectIdLike = (value) => Boolean(value) && isValidObjectId(String(value));

const getCollegeId = (req) => req.user?.collegeId || req.user?.id || req.user?.userMasterId || null;
const getStudentId = (req) => req.user?.id || req.user?.userMasterId || null;

const toPlain = (doc) => {
  if (!doc) return null;
  return doc.toObject ? doc.toObject({ virtuals: true }) : { ...doc };
};

const buildRoomName = (recipientRole, recipientId) => {
  const role = normalizeRole(recipientRole);
  if (role === "superadmin") return "support:superadmin";
  return `support:${role}:${recipientId}`;
};

const emitSupportEvent = (req, recipientRole, recipientId, eventName, ticket) => {
  const io = req.app.get("io");
  if (!io || !ticket) return;
  io.to(buildRoomName(recipientRole, recipientId)).emit(eventName, ticket);
};

const serializeTicket = (doc) => {
  const ticket = toPlain(doc);
  if (!ticket) return null;

  const student = ticket.studentId && typeof ticket.studentId === "object" ? ticket.studentId : null;
  const college = ticket.collegeId && typeof ticket.collegeId === "object" ? ticket.collegeId : null;
  const resolvedBy = ticket.resolvedById && typeof ticket.resolvedById === "object" ? ticket.resolvedById : null;

  return {
    ...ticket,
    creator: {
      role: ticket.creatorRole || "",
      id: ticket.creatorId || "",
      name:
        ticket.creatorRole === "Student"
          ? [student?.firstName, student?.lastName].filter(Boolean).join(" ").trim() || student?.studentName || "Student"
          : college?.collegeName || "College",
      email: ticket.creatorRole === "Student" ? student?.email || "" : college?.email || "",
      phone: ticket.creatorRole === "Student" ? student?.phone || "" : college?.phone || "",
    },
    student: student,
    college: college,
    resolvedBy: resolvedBy || null,
  };
};

const getSupportQuery = (req) => {
  const role = normalizeRole(req.user?.role);
  const query = { isDeleted: { $ne: true } };

  if (role === "superadmin") return query;
  if (role === "college") {
    query.collegeId = getCollegeId(req);
    return query;
  }
  if (role === "student") {
    query.studentId = getStudentId(req);
    return query;
  }
  query._id = null;
  return query;
};

const ensureSupportAccess = (req, ticket) => {
  const role = normalizeRole(req.user?.role);
  if (role === "superadmin") return true;
  const ticketCollegeId = ticket.collegeId?._id || ticket.collegeId || "";
  const ticketStudentId = ticket.studentId?._id || ticket.studentId || "";
  if (role === "college") return String(ticketCollegeId) === String(getCollegeId(req));
  if (role === "student") return String(ticketStudentId) === String(getStudentId(req));
  return false;
};

const ensureStudentExists = async (studentId) => {
  if (!isObjectIdLike(studentId)) return null;
  return Student.findOne({ _id: studentId, isDeleted: { $ne: true } });
};

const ensureCollegeExists = async (collegeId) => {
  if (!isObjectIdLike(collegeId)) return null;
  return College.findOne({ _id: collegeId, isDeleted: { $ne: true } });
};

const normalizeSupportStatus = (status = "") => {
  const value = String(status).trim().toLowerCase();
  if (value === "open") return "Open";
  if (value === "inprogress" || value === "in progress" || value === "working") return "InProgress";
  if (value === "resolved") return "Resolved";
  if (value === "closed") return "Closed";
  return "Open";
};

const buildTicketNo = () => {
  const stamp = new Date();
  const ymd = stamp.toISOString().slice(0, 10).replace(/-/g, "");
  const unique = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
  return `SUP-${ymd}-${unique}`;
};

export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find(getSupportQuery(req))
      .populate("studentId", "firstName lastName email phone")
      .populate("collegeId", "collegeName collegeCode email phone")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: tickets.map(serializeTicket) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectIdLike(id)) {
      return res.status(400).json({ success: false, message: "Invalid support ticket id" });
    }

    const ticket = await SupportTicket.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate("studentId", "firstName lastName email phone")
      .populate("collegeId", "collegeName collegeCode email phone");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    if (!ensureSupportAccess(req, ticket)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({ success: true, data: serializeTicket(ticket) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createSupportTicket = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    if (!["college", "student"].includes(role)) {
      return res.status(403).json({ success: false, message: "Only college and student users can raise support tickets" });
    }

    const subject = String(req.body.subject || "").trim();
    const category = String(req.body.category || "General").trim() || "General";
    const description = String(req.body.description || "").trim();
    const contactEmail = String(req.body.contactEmail || req.user?.email || "").trim().toLowerCase();
    const contactPhone = String(req.body.contactPhone || "").trim();
    const contactPreference = ["Email", "Phone", "Both"].includes(String(req.body.contactPreference))
      ? String(req.body.contactPreference)
      : "Email";
    const priority = ["Low", "Medium", "High"].includes(String(req.body.priority))
      ? String(req.body.priority)
      : "Medium";

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: "Subject and description are required" });
    }
    if (!contactEmail && !contactPhone) {
      return res.status(400).json({ success: false, message: "At least one contact method is required" });
    }

    const creatorId = role === "college" ? String(getCollegeId(req) || "") : String(getStudentId(req) || "");
    if (!creatorId) {
      return res.status(400).json({ success: false, message: "Account context missing" });
    }

    const basePayload = {
      creatorRole: role === "college" ? "College" : "Student",
      creatorId,
      subject,
      category,
      description,
      contactEmail,
      contactPhone,
      contactPreference,
      priority,
      status: "Open",
      lastUpdatedByRole: req.user?.role || "",
      lastUpdatedById: String(req.user?.id || req.user?.collegeId || ""),
    };

    if (role === "college") {
      const college = await ensureCollegeExists(getCollegeId(req));
      if (!college) {
        return res.status(404).json({ success: false, message: "College not found" });
      }
      basePayload.collegeId = college._id;
    }

    if (role === "student") {
      const student = await ensureStudentExists(getStudentId(req));
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      basePayload.studentId = student._id;
    }

    const ticket = await SupportTicket.create({
      ...basePayload,
      ticketNo: buildTicketNo(),
    });
    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate("studentId", "firstName lastName email phone")
      .populate("collegeId", "collegeName collegeCode email phone");

    const serialized = serializeTicket(populatedTicket);
    emitSupportEvent(req, "SuperAdmin", "superadmin", "support_ticket_created", serialized);

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: serialized,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateSupportTicketStatus = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "superadmin") {
      return res.status(403).json({ success: false, message: "Only superadmin can update support tickets" });
    }

    const { id } = req.params;
    if (!isObjectIdLike(id)) {
      return res.status(400).json({ success: false, message: "Invalid support ticket selection" });
    }

    const ticket = await SupportTicket.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    const nextStatus = normalizeSupportStatus(req.body.status || ticket.status);
    const resolutionNote = String(req.body.resolutionNote ?? ticket.resolutionNote ?? "").trim();

    ticket.status = nextStatus;
    ticket.resolutionNote = resolutionNote;
    ticket.lastUpdatedByRole = req.user?.role || "SuperAdmin";
    ticket.lastUpdatedById = String(req.user?.id || "superadmin");

    if (["Resolved", "Closed"].includes(nextStatus)) {
      ticket.resolvedAt = new Date();
      ticket.resolvedByRole = req.user?.role || "SuperAdmin";
      ticket.resolvedById = String(req.user?.id || "superadmin");
    } else {
      ticket.resolvedAt = null;
      ticket.resolvedByRole = "";
      ticket.resolvedById = "";
    }

    await ticket.save();

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate("studentId", "firstName lastName email phone")
      .populate("collegeId", "collegeName collegeCode email phone");

    const serialized = serializeTicket(populatedTicket);
    if (serialized.creator.role === "Student" && serialized.student?._id) {
      emitSupportEvent(req, "Student", String(serialized.student._id), "support_ticket_updated", serialized);
    }
    if (serialized.creator.role === "College" && serialized.college?._id) {
      emitSupportEvent(req, "College", String(serialized.college._id), "support_ticket_updated", serialized);
    }
    emitSupportEvent(req, "SuperAdmin", "superadmin", "support_ticket_updated", serialized);

    return res.json({
      success: true,
      message: "Support ticket updated successfully",
      data: serialized,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateSupportTicket = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    if (!["college", "student"].includes(role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { id } = req.params;
    if (!isObjectIdLike(id)) {
      return res.status(400).json({ success: false, message: "Invalid support ticket selection" });
    }

    const ticket = await SupportTicket.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    if (!ensureSupportAccess(req, ticket)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!["Open", "InProgress"].includes(ticket.status)) {
      return res.status(400).json({ success: false, message: "Resolved tickets cannot be edited" });
    }

    const subject = String(req.body.subject ?? ticket.subject).trim();
    const category = String(req.body.category ?? ticket.category).trim() || "General";
    const description = String(req.body.description ?? ticket.description).trim();
    const contactEmail = String(req.body.contactEmail ?? ticket.contactEmail ?? "").trim().toLowerCase();
    const contactPhone = String(req.body.contactPhone ?? ticket.contactPhone ?? "").trim();
    const contactPreference = ["Email", "Phone", "Both"].includes(String(req.body.contactPreference))
      ? String(req.body.contactPreference)
      : ticket.contactPreference;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: "Subject and description are required" });
    }

    ticket.subject = subject;
    ticket.category = category;
    ticket.description = description;
    ticket.contactEmail = contactEmail;
    ticket.contactPhone = contactPhone;
    ticket.contactPreference = contactPreference;
    ticket.lastUpdatedByRole = req.user?.role || ticket.lastUpdatedByRole;
    ticket.lastUpdatedById = String(req.user?.id || req.user?.collegeId || ticket.lastUpdatedById || "");

    await ticket.save();

    const populatedTicket = await SupportTicket.findById(ticket._id)
      .populate("studentId", "firstName lastName email phone")
      .populate("collegeId", "collegeName collegeCode email phone");

    const serialized = serializeTicket(populatedTicket);
    if (serialized.creator.role === "Student" && serialized.student?._id) {
      emitSupportEvent(req, "Student", String(serialized.student._id), "support_ticket_updated", serialized);
    }
    if (serialized.creator.role === "College" && serialized.college?._id) {
      emitSupportEvent(req, "College", String(serialized.college._id), "support_ticket_updated", serialized);
    }

    return res.json({ success: true, message: "Support ticket updated successfully", data: serialized });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteSupportTicket = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    if (!["college", "student"].includes(role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { id } = req.params;
    if (!isObjectIdLike(id)) {
      return res.status(400).json({ success: false, message: "Invalid support ticket selection" });
    }

    const ticket = await SupportTicket.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Support ticket not found" });
    }

    if (!ensureSupportAccess(req, ticket)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    ticket.isDeleted = true;
    await ticket.save();

    return res.json({ success: true, message: "Support ticket deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getSupportAlerts = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const alertCount = await SupportTicket.countDocuments({
      isDeleted: { $ne: true },
      status: "Open",
    });

    return res.json({
      success: true,
      data: {
        alertCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getSupportContact = async (req, res) => {
  try {
    const contactEmail = String(process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
    const admin =
      (contactEmail ? await SuperAdmin.findOne({ email: contactEmail }).select("name email phoneNumber") : null) ||
      (await SuperAdmin.findOne().sort({ createdAt: 1 }).select("name email phoneNumber"));

    return res.json({
      success: true,
      data: {
        name: admin?.name || "Super Admin",
        email: admin?.email || contactEmail || "",
        phoneNumber: admin?.phoneNumber || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
