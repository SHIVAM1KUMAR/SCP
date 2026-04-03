import { isValidObjectId } from "mongoose";
import Counsellor from "../../models/counselling/counsellorModal.js";
import CounsellingSession from "../../models/counselling/sessionModal.js";
import CounsellingNotification from "../../models/counselling/notificationModal.js";
import Student from "../../models/student/studentModal.js";
import College from "../../models/college/collegeModal.js";

const normalizeRole = (role = "") => String(role).toLowerCase();

const getCollegeId = (req) => req.user?.collegeId || null;
const getStudentId = (req) => req.user?.id || null;

const toPlain = (doc) => {
  if (!doc) return null;
  return doc.toObject ? doc.toObject({ virtuals: true }) : { ...doc };
};

const serializeCounsellor = (doc) => {
  const counsellor = toPlain(doc);
  if (!counsellor) return null;
  return {
    ...counsellor,
    college: counsellor.collegeId && typeof counsellor.collegeId === "object" ? counsellor.collegeId : null,
  };
};

const serializeSession = (doc) => {
  const session = toPlain(doc);
  if (!session) return null;
  return {
    ...session,
    counsellor: session.counsellorId && typeof session.counsellorId === "object" ? session.counsellorId : null,
    student: session.studentId && typeof session.studentId === "object" ? session.studentId : null,
    college: session.collegeId && typeof session.collegeId === "object" ? session.collegeId : null,
  };
};

const serializeNotification = (doc) => {
  const notification = toPlain(doc);
  if (!notification) return null;
  return notification;
};

const buildScheduledAt = (scheduledDate, scheduledTime) => {
  if (!scheduledDate || !scheduledTime) return null;
  const next = new Date(`${scheduledDate}T${scheduledTime}:00`);
  return Number.isNaN(next.getTime()) ? null : next;
};

const isObjectIdLike = (value) => Boolean(value) && isValidObjectId(String(value));

const normalizeSessionStatus = (status = "") => {
  const value = String(status).trim().toLowerCase();
  if (["counseled", "counselled"].includes(value)) return "Completed";
  if (["done", "completed", "complete"].includes(value)) return "Completed";
  if (["reschedule", "rescheduled"].includes(value)) return "Rescheduled";
  if (value === "missed") return "Missed";
  if (value === "scheduled") return "Scheduled";
  return "Scheduled";
};

const applyStudentFollowUpStatus = (studentDoc, collegeId, status) => {
  if (!studentDoc || !collegeId || !status) return;
  const targetField = "collegeFollowUpStatuses";
  const existingStatuses =
    studentDoc[targetField] instanceof Map
      ? studentDoc[targetField]
      : new Map(Object.entries(studentDoc[targetField] || {}));
  existingStatuses.set(String(collegeId), String(status));
  studentDoc[targetField] = existingStatuses;
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatTime = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`1970-01-01T${value}`));

const getRoomName = (recipientRole, recipientId) => {
  const normalizedRole = normalizeRole(recipientRole);
  if (normalizedRole === "superadmin") return "counselling:superadmin";
  return `counselling:${normalizedRole}:${recipientId}`;
};

const emitNotification = (req, notification) => {
  const io = req.app.get("io");
  if (!io || !notification) return;
  io.to(getRoomName(notification.recipientRole, notification.recipientId)).emit(
    "counselling_notification",
    serializeNotification(notification)
  );
};

const createNotification = async (req, payload) => {
  const notification = await CounsellingNotification.create(payload);
  emitNotification(req, notification);
  return notification;
};

const createBroadcastNotifications = async (req, payloads = []) => {
  const created = [];
  for (const payload of payloads) {
    created.push(await createNotification(req, payload));
  }
  return created;
};

const assertCollegeAccess = (req, collegeId) => {
  if (normalizeRole(req.user?.role) === "superadmin") return true;
  return String(getCollegeId(req)) === String(collegeId);
};

const assertStudentAccess = (req, studentId) => {
  if (normalizeRole(req.user?.role) === "superadmin") return true;
  return String(getStudentId(req)) === String(studentId);
};

const ensureCounsellorBelongsToCollege = async (counsellorId, collegeId) => {
  if (!isObjectIdLike(counsellorId) || !isObjectIdLike(collegeId)) return null;
  const counsellor = await Counsellor.findOne({
    _id: counsellorId,
    collegeId,
    isDeleted: { $ne: true },
  });
  return counsellor;
};

const ensureStudentExists = async (studentId) => {
  if (!isObjectIdLike(studentId)) return null;
  return Student.findOne({
    _id: studentId,
    isDeleted: { $ne: true },
  });
};

const ensureCollegeExists = async (collegeId) => {
  if (!isObjectIdLike(collegeId)) return null;
  return College.findOne({
    _id: collegeId,
    isDeleted: { $ne: true },
  });
};

export const getCounsellors = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    const collegeId = getCollegeId(req);
    const query = { isDeleted: { $ne: true } };

    if (role === "college") {
      if (!collegeId) {
        return res.status(400).json({ success: false, message: "College context missing" });
      }
      query.collegeId = collegeId;
    } else if (role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const counsellors = await Counsellor.find(query)
      .populate("collegeId", "collegeName collegeCode email location")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: counsellors.map(serializeCounsellor) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getCounsellorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectIdLike(id)) {
      return res.status(400).json({ success: false, message: "Invalid counsellor id" });
    }
    const counsellor = await Counsellor.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate("collegeId", "collegeName collegeCode email location");

    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    if (!assertCollegeAccess(req, counsellor.collegeId?._id || counsellor.collegeId)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({ success: true, data: serializeCounsellor(counsellor) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createCounsellor = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can manage counsellors" });
    }

    const collegeId = getCollegeId(req);
    if (!collegeId) {
      return res.status(400).json({ success: false, message: "College context missing" });
    }

    const college = await ensureCollegeExists(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const department = String(req.body.department || "").trim();
    const status = String(req.body.status || "Active");
    const availability = Array.isArray(req.body.availability)
      ? req.body.availability
      : typeof req.body.availability === "string" && req.body.availability
        ? JSON.parse(req.body.availability)
        : [];

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "Name, email and phone are required" });
    }

    const existing = await Counsellor.findOne({
      collegeId,
      email,
      isDeleted: { $ne: true },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Counsellor email already exists for this college" });
    }

    const counsellor = await Counsellor.create({
      collegeId,
      name,
      email,
      phone,
      department,
      availability,
      status: status === "Inactive" ? "Inactive" : "Active",
      createdByRole: req.user?.role || "College",
      createdBy: req.user?.email || "",
    });

    return res.status(201).json({ success: true, message: "Counsellor added successfully", data: serializeCounsellor(counsellor) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateCounsellor = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can manage counsellors" });
    }

    const collegeId = getCollegeId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "Invalid counsellor selection" });
    }
    const counsellor = await Counsellor.findOne({
      _id: id,
      collegeId,
      isDeleted: { $ne: true },
    });
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    const nextEmail = String(req.body.email || counsellor.email).trim().toLowerCase();
    const duplicate = await Counsellor.findOne({
      collegeId,
      email: nextEmail,
      _id: { $ne: counsellor._id },
      isDeleted: { $ne: true },
    });
    if (duplicate) {
      return res.status(400).json({ success: false, message: "Counsellor email already exists for this college" });
    }

    counsellor.name = String(req.body.name ?? counsellor.name).trim();
    counsellor.email = nextEmail;
    counsellor.phone = String(req.body.phone ?? counsellor.phone).trim();
    counsellor.department = String(req.body.department ?? counsellor.department).trim();
    if (req.body.status) {
      counsellor.status = String(req.body.status) === "Inactive" ? "Inactive" : "Active";
    }
    if (req.body.availability !== undefined) {
      counsellor.availability = Array.isArray(req.body.availability)
        ? req.body.availability
        : typeof req.body.availability === "string" && req.body.availability
          ? JSON.parse(req.body.availability)
          : [];
    }

    await counsellor.save();
    return res.json({ success: true, message: "Counsellor updated successfully", data: serializeCounsellor(counsellor) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteCounsellor = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can manage counsellors" });
    }

    const { id } = req.params;
    const collegeId = getCollegeId(req);
    if (!isObjectIdLike(id) || !isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "Invalid counsellor selection" });
    }
    const counsellor = await Counsellor.findOne({
      _id: id,
      collegeId,
      isDeleted: { $ne: true },
    });
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    counsellor.isDeleted = true;
    await counsellor.save();
    return res.json({ success: true, message: "Counsellor deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const fetchSessionsQuery = (req) => {
  const role = normalizeRole(req.user?.role);
  const query = { isDeleted: { $ne: true } };

  if (role === "college") {
    query.collegeId = getCollegeId(req);
  } else if (role === "student") {
    query.studentId = getStudentId(req);
  } else if (role !== "superadmin") {
    query._id = null;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.counsellorId) {
    query.counsellorId = req.query.counsellorId;
  }

  return query;
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await CounsellingSession.find(fetchSessionsQuery(req))
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone collegeFollowUpStatuses studentFollowUpStatuses")
      .populate("counsellorId", "name email phone department status availability")
      .sort({ scheduledAt: -1, createdAt: -1 });

    return res.json({ success: true, data: sessions.map(serializeSession) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectIdLike(id)) {
      return res.status(400).json({ success: false, message: "Invalid session id" });
    }
    const session = await CounsellingSession.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone collegeFollowUpStatuses studentFollowUpStatuses")
      .populate("counsellorId", "name email phone department status availability");

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (
      !assertCollegeAccess(req, session.collegeId?._id || session.collegeId) &&
      !assertStudentAccess(req, session.studentId?._id || session.studentId)
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({ success: true, data: serializeSession(session) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createSession = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can schedule sessions" });
    }

    const collegeId = getCollegeId(req);
    const { counsellorId, studentId, scheduledDate, scheduledTime, notes = "" } = req.body || {};

    if (!isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "College context missing" });
    }
    if (!isObjectIdLike(counsellorId)) {
      return res.status(400).json({ success: false, message: "Please select a counsellor" });
    }
    if (!isObjectIdLike(studentId)) {
      return res.status(400).json({ success: false, message: "Please select a student" });
    }
    if (!scheduledDate || !scheduledTime) {
      return res.status(400).json({ success: false, message: "Valid date and time are required" });
    }

    const counsellor = await ensureCounsellorBelongsToCollege(counsellorId, collegeId);
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    const student = await ensureStudentExists(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const scheduledAt = buildScheduledAt(scheduledDate, scheduledTime);
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "Valid date and time are required" });
    }

  const session = await CounsellingSession.create({
    collegeId,
    counsellorId,
    studentId,
    scheduledAt,
    scheduledDate,
    scheduledTime,
    notes,
    status: ["Completed", "Missed", "Scheduled"].includes(normalizeSessionStatus(req.body?.status))
      ? normalizeSessionStatus(req.body?.status)
      : "Scheduled",
    createdByRole: req.user?.role || "College",
    createdBy: req.user?.email || "",
  });

    const createdSession = await CounsellingSession.findById(session._id)
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone collegeFollowUpStatuses studentFollowUpStatuses")
      .populate("counsellorId", "name email phone department status availability");

    return res.status(201).json({
      success: true,
      message: "Counselling session scheduled successfully",
      data: serializeSession(createdSession),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const notifyMissedSession = async (req, session) => {
  const [student, counsellor, college] = await Promise.all([
    Student.findById(session.studentId).select("firstName lastName email"),
    Counsellor.findById(session.counsellorId).select("name email"),
    College.findById(session.collegeId).select("collegeName collegeCode email"),
  ]);

  const message = `Counselling session marked as missed on ${session.scheduledDate} at ${session.scheduledTime}.`;
  const commonMeta = {
    scheduledDate: session.scheduledDate,
    scheduledTime: session.scheduledTime,
    sessionStatus: session.status,
  };

  await createBroadcastNotifications(req, [
    {
      recipientRole: "Student",
      recipientId: String(session.studentId),
      collegeId: session.collegeId,
      studentId: session.studentId,
      sessionId: session._id,
      counsellorId: session.counsellorId,
      title: "Counselling Missed",
      message,
      type: "warning",
      category: "session-missed",
      meta: { ...commonMeta, studentName: student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "" },
    },
    {
      recipientRole: "College",
      recipientId: String(session.collegeId),
      collegeId: session.collegeId,
      studentId: session.studentId,
      sessionId: session._id,
      counsellorId: session.counsellorId,
      title: "Counselling Missed",
      message: `A session for ${student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "a student"} was marked as missed.`,
      type: "warning",
      category: "session-missed",
      meta: { ...commonMeta, counsellorName: counsellor?.name || "" },
    },
    {
      recipientRole: "SuperAdmin",
      recipientId: "superadmin",
      collegeId: session.collegeId,
      studentId: session.studentId,
      sessionId: session._id,
      counsellorId: session.counsellorId,
      title: "Counselling Missed",
      message: `Counselling session missed in ${college ? college.collegeName : "a college"} for ${student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "a student"}.`,
      type: "warning",
      category: "session-missed",
      meta: commonMeta,
    },
  ]);
};

const notifyRescheduledSession = async (req, session) => {
  const [student, counsellor, college] = await Promise.all([
    Student.findById(session.studentId).select("firstName lastName email"),
    Counsellor.findById(session.counsellorId).select("name email"),
    College.findById(session.collegeId).select("collegeName collegeCode email"),
  ]);

  const friendlyDate = formatDate(session.scheduledAt || `${session.scheduledDate}T${session.scheduledTime}:00`);
  const friendlyTime = formatTime(session.scheduledTime);
  const commonMeta = {
    scheduledDate: session.scheduledDate,
    scheduledTime: session.scheduledTime,
    sessionStatus: session.status,
  };

  await createBroadcastNotifications(req, [
    {
      recipientRole: "Student",
      recipientId: String(session.studentId),
      collegeId: session.collegeId,
      studentId: session.studentId,
      sessionId: session._id,
      counsellorId: session.counsellorId,
      title: "Counselling Rescheduled",
      message: `Your counselling session has been rescheduled to ${friendlyDate} at ${friendlyTime}. Please be prepared.`,
      type: "info",
      category: "session-rescheduled",
      meta: { ...commonMeta, studentName: student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "" },
    },
    {
      recipientRole: "College",
      recipientId: String(session.collegeId),
      collegeId: session.collegeId,
      studentId: session.studentId,
      sessionId: session._id,
      counsellorId: session.counsellorId,
      title: "Counselling Rescheduled",
      message: `A counselling session for ${student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "a student"} was rescheduled to ${friendlyDate} at ${friendlyTime}.`,
      type: "info",
      category: "session-rescheduled",
      meta: { ...commonMeta, counsellorName: counsellor?.name || "" },
    },
    {
      recipientRole: "SuperAdmin",
      recipientId: "superadmin",
      collegeId: session.collegeId,
      studentId: session.studentId,
      sessionId: session._id,
      counsellorId: session.counsellorId,
      title: "Counselling Rescheduled",
      message: `Counselling session rescheduled in ${college ? college.collegeName : "a college"} for ${student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "a student"}.`,
      type: "info",
      category: "session-rescheduled",
      meta: commonMeta,
    },
  ]);
};

export const updateSession = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    if (role !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can update sessions" });
    }

    const collegeId = getCollegeId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "Invalid session selection" });
    }
    const session = await CounsellingSession.findOne({
      _id: id,
      collegeId,
      isDeleted: { $ne: true },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const previousStatus = session.status;
    const nextCounsellorId = req.body.counsellorId || session.counsellorId;
    if (!isObjectIdLike(nextCounsellorId)) {
      return res.status(400).json({ success: false, message: "Please select a counsellor" });
    }
    const counsellor = await ensureCounsellorBelongsToCollege(nextCounsellorId, collegeId);
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    if (req.body.studentId) {
      if (!isObjectIdLike(req.body.studentId)) {
        return res.status(400).json({ success: false, message: "Please select a student" });
      }
      const student = await ensureStudentExists(req.body.studentId);
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }
      session.studentId = req.body.studentId;
    }

    session.counsellorId = nextCounsellorId;
    const scheduledDateChanged =
      req.body.scheduledDate !== undefined &&
      String(req.body.scheduledDate) !== String(session.scheduledDate);
    const scheduledTimeChanged =
      req.body.scheduledTime !== undefined &&
      String(req.body.scheduledTime) !== String(session.scheduledTime);
    const shouldAutoReschedule = scheduledDateChanged || scheduledTimeChanged;

    if (req.body.scheduledDate) {
      session.scheduledDate = String(req.body.scheduledDate);
    }
    if (req.body.scheduledTime) {
      session.scheduledTime = String(req.body.scheduledTime);
    }
    if (req.body.notes !== undefined) {
      session.notes = String(req.body.notes || "");
    }
    if (req.body.status) {
      const requestedStatus = normalizeSessionStatus(req.body.status);
      if (requestedStatus === "Rescheduled" && !shouldAutoReschedule && previousStatus !== "Rescheduled") {
        session.status = previousStatus;
      } else if (requestedStatus !== "Rescheduled") {
        session.status = requestedStatus;
      }
    }

    const scheduledAt = buildScheduledAt(session.scheduledDate, session.scheduledTime);
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "Valid date and time are required" });
    }
    session.scheduledAt = scheduledAt;

    if (shouldAutoReschedule) {
      session.status = "Rescheduled";
    }

    await session.save();

    if (shouldAutoReschedule || session.status === "Completed" || session.status === "Missed") {
      const student = await Student.findOne({ _id: session.studentId, isDeleted: { $ne: true } });
      if (student) {
        if (shouldAutoReschedule) {
          applyStudentFollowUpStatus(student, session.collegeId, "Rescheduled");
        } else if (session.status === "Completed") {
          applyStudentFollowUpStatus(student, session.collegeId, "Counseled");
        } else if (session.status === "Missed") {
          applyStudentFollowUpStatus(student, session.collegeId, "Missed");
        }
        await student.save();
      }
    }

    if (session.status === "Rescheduled" && previousStatus !== "Rescheduled") {
      await notifyRescheduledSession(req, session);
    }

    if (session.status === "Missed" && previousStatus !== "Missed") {
      await notifyMissedSession(req, session);
    }

    const updatedSession = await CounsellingSession.findById(session._id)
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone collegeFollowUpStatuses studentFollowUpStatuses")
      .populate("counsellorId", "name email phone department status availability");

    return res.json({ success: true, message: "Counselling session updated successfully", data: serializeSession(updatedSession) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    if (role !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can delete sessions" });
    }

    const collegeId = getCollegeId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "Invalid session selection" });
    }

    const session = await CounsellingSession.findOne({
      _id: id,
      collegeId,
      isDeleted: { $ne: true },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    session.isDeleted = true;
    await session.save();

    return res.json({ success: true, message: "Counselling session deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "student") {
      return res.status(403).json({ success: false, message: "Only students can view this dashboard" });
    }

    const studentId = getStudentId(req);
    const student = await Student.findOne({ _id: studentId, isDeleted: { $ne: true } }).select("-password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const sessions = await CounsellingSession.find({
      studentId,
      isDeleted: { $ne: true },
    })
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("counsellorId", "name email phone department status availability")
      .sort({ scheduledAt: -1, createdAt: -1 });

    const upcomingSession = sessions.find((session) => session.status === "Scheduled") || sessions[0] || null;

    return res.json({
      success: true,
      data: {
        student,
        assignedCounsellor: upcomingSession?.counsellorId ? serializeCounsellor(upcomingSession.counsellorId) : null,
        sessions: sessions.map(serializeSession),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    const query = {};

    if (role === "superadmin") {
      query.recipientRole = "SuperAdmin";
      query.recipientId = "superadmin";
    } else if (role === "college") {
      query.recipientRole = "College";
      query.recipientId = String(getCollegeId(req));
    } else if (role === "student") {
      query.recipientRole = "Student";
      query.recipientId = String(getStudentId(req));
    } else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const notifications = await CounsellingNotification.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: notifications.map(serializeNotification) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const canAccessNotification = (req, notification) => {
  const role = normalizeRole(req.user?.role);
  if (role === "superadmin") return notification.recipientRole === "SuperAdmin";
  if (role === "college") {
    return notification.recipientRole === "College" && String(notification.recipientId) === String(getCollegeId(req));
  }
  if (role === "student") {
    return notification.recipientRole === "Student" && String(notification.recipientId) === String(getStudentId(req));
  }
  return false;
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await CounsellingNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (!canAccessNotification(req, notification)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    notification.isRead = true;
    await notification.save();
    return res.json({ success: true, data: serializeNotification(notification) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    const query = { isRead: false };

    if (role === "superadmin") {
      query.recipientRole = "SuperAdmin";
      query.recipientId = "superadmin";
    } else if (role === "college") {
      query.recipientRole = "College";
      query.recipientId = String(getCollegeId(req));
    } else if (role === "student") {
      query.recipientRole = "Student";
      query.recipientId = String(getStudentId(req));
    } else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await CounsellingNotification.updateMany(query, { $set: { isRead: true } });
    return res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    const query = {};

    if (role === "superadmin") {
      query.recipientRole = "SuperAdmin";
      query.recipientId = "superadmin";
    } else if (role === "college") {
      query.recipientRole = "College";
      query.recipientId = String(getCollegeId(req));
    } else if (role === "student") {
      query.recipientRole = "Student";
      query.recipientId = String(getStudentId(req));
    } else {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await CounsellingNotification.deleteMany(query);
    return res.json({
      success: true,
      message: "Notifications cleared",
      data: { deletedCount: result.deletedCount || 0 },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
