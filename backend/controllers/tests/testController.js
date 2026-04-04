import { isValidObjectId } from "mongoose";
import { randomUUID } from "node:crypto";
import TestSchedule from "../../models/tests/testModal.js";
import TestAttempt from "../../models/tests/testAttemptModal.js";
import TestNotification from "../../models/counselling/notificationModal.js";
import Student from "../../models/student/studentModal.js";
import College from "../../models/college/collegeModal.js";

const normalizeRole = (role = "") => String(role).toLowerCase();
const getCollegeId = (req) => req.user?.collegeId || null;
const getStudentId = (req) => req.user?.id || null;

const toPlain = (doc) => (doc?.toObject ? doc.toObject({ virtuals: true }) : doc ? { ...doc } : null);

const isObjectIdLike = (value) => Boolean(value) && isValidObjectId(String(value));
const createQuestionId = () => randomUUID();
const ATTEMPT_STALE_MS = 45 * 1000;

const normalizeTestMode = (mode = "") => {
  const value = String(mode).trim().toLowerCase();
  if (["link", "url", "external", "external-link"].includes(value)) return "link";
  return "platform";
};

const normalizeTestStatus = (status = "") => {
  const value = String(status).trim().toLowerCase();
  if (["completed", "done", "complete"].includes(value)) return "Completed";
  if (["reschedule", "rescheduled"].includes(value)) return "Rescheduled";
  if (value === "missed") return "Missed";
  if (value === "scheduled") return "Scheduled";
  return "Scheduled";
};

const buildScheduledAt = (scheduledDate, scheduledTime) => {
  if (!scheduledDate || !scheduledTime) return null;
  const next = new Date(`${scheduledDate}T${scheduledTime}:00`);
  return Number.isNaN(next.getTime()) ? null : next;
};

const parseQuestions = (value) => {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
      ? JSON.parse(value)
      : [];

  return raw
    .map((question) => ({
      id: String(question?.id || createQuestionId()),
      questionText: String(question?.questionText || "").trim(),
      options: Array.isArray(question?.options)
        ? question.options.map((option) => String(option || "").trim())
        : [],
      correctAnswerIndex: Number.isInteger(question?.correctAnswerIndex)
        ? question.correctAnswerIndex
        : Number(question?.correctAnswerIndex || 0),
      marks: Number.isFinite(Number(question?.marks)) && Number(question?.marks) > 0
        ? Number(question?.marks)
        : 1,
    }))
    .filter((question) => question.questionText || question.options.some(Boolean));
};

const validateQuestions = (questions = []) =>
  Array.isArray(questions) &&
  questions.length > 0 &&
  questions.every((question) => {
    const options = question.options || [];
    const filledOptions = options.filter((option) => String(option || "").trim());
    const correctAnswer = String(options[question.correctAnswerIndex] || "").trim();
    return (
      String(question.questionText || "").trim() &&
      filledOptions.length >= 2 &&
      Boolean(correctAnswer) &&
      Number.isInteger(question.correctAnswerIndex) &&
      question.correctAnswerIndex >= 0 &&
      question.correctAnswerIndex < options.length &&
      Number.isFinite(Number(question.marks || 1)) &&
      Number(question.marks || 1) > 0
    );
  });

const serializeAttempt = (doc) => {
  const attempt = toPlain(doc);
  if (!attempt) return null;
  return attempt;
};

const buildAttemptAnswers = (test, answers = []) => {
  const questions = Array.isArray(test?.questions) ? test.questions : [];
  return questions.map((question) => {
    const matched = answers.find((answer) => String(answer?.questionId || "") === String(question.id || ""));
    const selectedOptionIndex = Number.isInteger(matched?.selectedOptionIndex)
      ? matched.selectedOptionIndex
      : Number(matched?.selectedOptionIndex);
    const selectedOption = Array.isArray(question.options) && Number.isInteger(selectedOptionIndex)
      ? String(question.options[selectedOptionIndex] || "").trim()
      : "";
    const isCorrect = Number.isInteger(selectedOptionIndex) && selectedOptionIndex === Number(question.correctAnswerIndex || 0);
    const marks = Number(question.marks || 1) || 1;
    return {
      questionId: String(question.id || ""),
      selectedOptionIndex: Number.isInteger(selectedOptionIndex) ? selectedOptionIndex : null,
      selectedOption,
      isCorrect,
      marks,
    };
  });
};

const calculateAttemptScore = (test, answers = []) => {
  const builtAnswers = buildAttemptAnswers(test, answers);
  const score = builtAnswers.reduce((sum, answer) => (answer.isCorrect ? sum + Number(answer.marks || 1) : sum), 0);
  const totalMarks = builtAnswers.reduce((sum, answer) => sum + Number(answer.marks || 1), 0);
  return { answers: builtAnswers, score, totalMarks };
};

const finalizeAttempt = async (attempt, test, { autoSubmitted = false, expired = false } = {}) => {
  if (!attempt || attempt.status !== "InProgress") return attempt;
  const computed = calculateAttemptScore(test, attempt.answers || []);
  attempt.answers = computed.answers;
  attempt.score = computed.score;
  attempt.totalMarks = computed.totalMarks;
  attempt.status = expired ? "Expired" : "Submitted";
  attempt.autoSubmitted = autoSubmitted;
  attempt.submittedAt = new Date();
  attempt.expiredAt = expired ? new Date() : attempt.expiredAt;
  attempt.lastHeartbeatAt = new Date();
  await attempt.save();

  if (test && test.status !== "Completed") {
    test.status = "Completed";
    await test.save();
  }

  return attempt;
};

const syncStaleAttempt = async (attemptId, test) => {
  if (!attemptId || !test) return null;
  const attempt = attemptId && typeof attemptId === "object" && attemptId._id
    ? attemptId
    : await TestAttempt.findById(attemptId);
  if (!attempt || attempt.status !== "InProgress") return attempt;
  const lastHeartbeat = attempt.lastHeartbeatAt ? new Date(attempt.lastHeartbeatAt).getTime() : 0;
  if (!lastHeartbeat) return attempt;
  if (Date.now() - lastHeartbeat > ATTEMPT_STALE_MS) {
    return finalizeAttempt(attempt, test, { autoSubmitted: true });
  }
  return attempt;
};

const serializeTest = (doc) => {
  const test = toPlain(doc);
  if (!test) return null;
  return {
    ...test,
    college: test.collegeId && typeof test.collegeId === "object" ? test.collegeId : null,
    student: test.studentId && typeof test.studentId === "object" ? test.studentId : null,
  };
};

const getRoomName = (recipientRole, recipientId) => {
  const normalizedRole = normalizeRole(recipientRole);
  if (normalizedRole === "superadmin") return "counselling:superadmin";
  return `counselling:${normalizedRole}:${recipientId}`;
};

const emitNotification = (req, notification) => {
  const io = req.app.get("io");
  if (!io || !notification) return;
  io.to(getRoomName(notification.recipientRole, notification.recipientId)).emit("counselling_notification", notification.toObject ? notification.toObject({ virtuals: true }) : notification);
};

const createNotification = async (req, payload) => {
  const notification = await TestNotification.create(payload);
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

const ensureCollegeExists = async (collegeId) => {
  if (!isObjectIdLike(collegeId)) return null;
  return College.findOne({ _id: collegeId, isDeleted: { $ne: true } });
};

const ensureStudentAppliedToCollege = async (studentId, collegeId) => {
  if (!isObjectIdLike(studentId) || !isObjectIdLike(collegeId)) return null;
  return Student.findOne({
    _id: studentId,
    isDeleted: { $ne: true },
    interestedColleges: collegeId,
  });
};

const assertAccess = (req, test) => {
  const role = normalizeRole(req.user?.role);
  if (role === "superadmin") return true;
  if (role === "college") return String(getCollegeId(req)) === String(test.collegeId?._id || test.collegeId);
  if (role === "student") return String(getStudentId(req)) === String(test.studentId?._id || test.studentId);
  return false;
};

const notifyMissedTest = async (req, test) => {
  const [student, college] = await Promise.all([
    Student.findById(test.studentId).select("firstName lastName email"),
    College.findById(test.collegeId).select("collegeName collegeCode email"),
  ]);

  const message = `Test session for ${student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "a student"} was marked as missed.`;
  const commonMeta = {
    testId: test._id,
    scheduledDate: test.scheduledDate,
    scheduledTime: test.scheduledTime,
    testStatus: test.status,
    testTitle: test.title,
  };

  await createBroadcastNotifications(req, [
    {
      recipientRole: "Student",
      recipientId: String(test.studentId),
      collegeId: test.collegeId,
      studentId: test.studentId,
      sessionId: test._id,
      title: "Test Missed",
      message: `Your test "${test.title}" was marked as missed.`,
      type: "warning",
      category: "test-missed",
      meta: commonMeta,
    },
    {
      recipientRole: "College",
      recipientId: String(test.collegeId),
      collegeId: test.collegeId,
      studentId: test.studentId,
      sessionId: test._id,
      title: "Test Missed",
      message,
      type: "warning",
      category: "test-missed",
      meta: { ...commonMeta, collegeName: college?.collegeName || "" },
    },
  ]);
};

const notifyRescheduledTest = async (req, test) => {
  const [student, college] = await Promise.all([
    Student.findById(test.studentId).select("firstName lastName email"),
    College.findById(test.collegeId).select("collegeName collegeCode email"),
  ]);

  const friendlyDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(test.scheduledAt || `${test.scheduledDate}T${test.scheduledTime}:00`));
  const friendlyTime = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`1970-01-01T${test.scheduledTime}`));
  const commonMeta = {
    testId: test._id,
    scheduledDate: test.scheduledDate,
    scheduledTime: test.scheduledTime,
    testStatus: test.status,
    testTitle: test.title,
  };

  await createBroadcastNotifications(req, [
    {
      recipientRole: "Student",
      recipientId: String(test.studentId),
      collegeId: test.collegeId,
      studentId: test.studentId,
      sessionId: test._id,
      title: "Test Rescheduled",
      message: `Your test "${test.title}" has been rescheduled to ${friendlyDate} at ${friendlyTime}.`,
      type: "info",
      category: "test-rescheduled",
      meta: commonMeta,
    },
    {
      recipientRole: "College",
      recipientId: String(test.collegeId),
      collegeId: test.collegeId,
      studentId: test.studentId,
      sessionId: test._id,
      title: "Test Rescheduled",
      message: `Test "${test.title}" for ${student ? `${student.firstName || ""} ${student.lastName || ""}`.trim() : "a student"} was rescheduled to ${friendlyDate} at ${friendlyTime}.`,
      type: "info",
      category: "test-rescheduled",
      meta: { ...commonMeta, collegeName: college?.collegeName || "" },
    },
  ]);
};

const fetchTestsQuery = (req) => {
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
    query.status = normalizeTestStatus(req.query.status);
  }

  return query;
};

export const getTests = async (req, res) => {
  try {
    const tests = await TestSchedule.find(fetchTestsQuery(req))
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone interestedColleges")
      .sort({ scheduledAt: -1, createdAt: -1 });

    return res.json({ success: true, data: tests.map(serializeTest) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectIdLike(id)) {
      return res.status(400).json({ success: false, message: "Invalid test id" });
    }

    const test = await TestSchedule.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone interestedColleges");

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    if (!assertAccess(req, test)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.json({ success: true, data: serializeTest(test) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createTest = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can schedule tests" });
    }

    const collegeId = getCollegeId(req);
    if (!isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "College context missing" });
    }

    const college = await ensureCollegeExists(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    const title = String(req.body.title || "").trim();
    const studentId = String(req.body.studentId || "").trim();
    const mode = normalizeTestMode(req.body.mode);
    const scheduledDate = String(req.body.scheduledDate || "").trim();
    const scheduledTime = String(req.body.scheduledTime || "").trim();
    const durationMinutes = Number(req.body.durationMinutes || 30);
    const notes = String(req.body.notes || "").trim();
    const testLink = String(req.body.testLink || "").trim();
    const status = ["Completed", "Missed", "Scheduled"].includes(normalizeTestStatus(req.body.status))
      ? normalizeTestStatus(req.body.status)
      : "Scheduled";
    const questions = mode === "platform" ? parseQuestions(req.body.questions) : [];

    if (!title) {
      return res.status(400).json({ success: false, message: "Test title is required" });
    }
    if (!isObjectIdLike(studentId)) {
      return res.status(400).json({ success: false, message: "Please select a student" });
    }
    if (!scheduledDate || !scheduledTime) {
      return res.status(400).json({ success: false, message: "Valid date and time are required" });
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return res.status(400).json({ success: false, message: "Valid duration is required" });
    }

    const student = await ensureStudentAppliedToCollege(studentId, collegeId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Applied student not found for this college" });
    }

    if (mode === "platform") {
      if (!validateQuestions(questions)) {
        return res.status(400).json({ success: false, message: "Please add at least one valid platform question" });
      }
    } else if (!testLink) {
      return res.status(400).json({ success: false, message: "Test link is required for external test mode" });
    }

    const scheduledAt = buildScheduledAt(scheduledDate, scheduledTime);
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "Valid date and time are required" });
    }

    const test = await TestSchedule.create({
      collegeId,
      studentId,
      title,
      mode,
      testLink: mode === "link" ? testLink : "",
      questions: mode === "platform" ? questions : [],
      scheduledAt,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      status,
      notes,
      createdByRole: req.user?.role || "College",
      createdBy: req.user?.email || "",
    });

    const createdTest = await TestSchedule.findById(test._id)
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone interestedColleges");

    if (status === "Missed" && createdTest) {
      await notifyMissedTest(req, createdTest);
    }

    return res.status(201).json({
      success: true,
      message: "Test scheduled successfully",
      data: serializeTest(createdTest),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateTest = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can update tests" });
    }

    const collegeId = getCollegeId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "Invalid test selection" });
    }

    const test = await TestSchedule.findOne({ _id: id, collegeId, isDeleted: { $ne: true } });
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    if (test.status === "Completed") {
      return res.status(409).json({ success: false, message: "Completed tests cannot be edited" });
    }

    const previousStatus = test.status;
    const scheduledDateChanged =
      req.body.scheduledDate !== undefined &&
      String(req.body.scheduledDate) !== String(test.scheduledDate);
    const scheduledTimeChanged =
      req.body.scheduledTime !== undefined &&
      String(req.body.scheduledTime) !== String(test.scheduledTime);
    const shouldAutoReschedule = scheduledDateChanged || scheduledTimeChanged;

    if (req.body.title !== undefined) {
      test.title = String(req.body.title || "").trim();
    }

    if (req.body.studentId !== undefined) {
      if (!isObjectIdLike(req.body.studentId)) {
        return res.status(400).json({ success: false, message: "Please select a student" });
      }
      const student = await ensureStudentAppliedToCollege(req.body.studentId, collegeId);
      if (!student) {
        return res.status(404).json({ success: false, message: "Applied student not found for this college" });
      }
      test.studentId = req.body.studentId;
    }

    if (req.body.mode !== undefined) {
      const nextMode = normalizeTestMode(req.body.mode);
      test.mode = nextMode;
      if (nextMode === "link") {
        test.questions = [];
      }
    }

    if (req.body.testLink !== undefined) {
      test.testLink = String(req.body.testLink || "").trim();
    }

    if (req.body.questions !== undefined) {
      const questions = parseQuestions(req.body.questions);
      if (test.mode === "platform" && !validateQuestions(questions)) {
        return res.status(400).json({ success: false, message: "Please add at least one valid platform question" });
      }
      test.questions = test.mode === "platform" ? questions : [];
    }

    if (req.body.scheduledDate !== undefined) {
      test.scheduledDate = String(req.body.scheduledDate || "").trim();
    }
    if (req.body.scheduledTime !== undefined) {
      test.scheduledTime = String(req.body.scheduledTime || "").trim();
    }
    if (req.body.notes !== undefined) {
      test.notes = String(req.body.notes || "").trim();
    }

    if (req.body.durationMinutes !== undefined) {
      const nextDuration = Number(req.body.durationMinutes || 30);
      if (!Number.isFinite(nextDuration) || nextDuration <= 0) {
        return res.status(400).json({ success: false, message: "Valid duration is required" });
      }
      test.durationMinutes = nextDuration;
    }

    if (req.body.status !== undefined) {
      const requestedStatus = normalizeTestStatus(req.body.status);
      if (requestedStatus !== "Rescheduled") {
        test.status = requestedStatus;
      }
    }

    const scheduledAt = buildScheduledAt(test.scheduledDate, test.scheduledTime);
    if (!scheduledAt) {
      return res.status(400).json({ success: false, message: "Valid date and time are required" });
    }
    test.scheduledAt = scheduledAt;

    if (shouldAutoReschedule) {
      test.status = "Rescheduled";
    }

    if (test.mode === "platform" && !validateQuestions(test.questions)) {
      return res.status(400).json({ success: false, message: "Please add at least one valid platform question" });
    }
    if (test.mode === "link" && !test.testLink) {
      return res.status(400).json({ success: false, message: "Test link is required for external test mode" });
    }

    await test.save();

    if (shouldAutoReschedule || test.status === "Missed") {
      if (test.status === "Rescheduled" && previousStatus !== "Rescheduled") {
        await notifyRescheduledTest(req, test);
      }
      if (test.status === "Missed" && previousStatus !== "Missed") {
        await notifyMissedTest(req, test);
      }
    }

    const updated = await TestSchedule.findById(test._id)
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone interestedColleges");

    return res.json({ success: true, message: "Test updated successfully", data: serializeTest(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteTest = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can delete tests" });
    }

    const collegeId = getCollegeId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "Invalid test selection" });
    }

    const test = await TestSchedule.findOne({ _id: id, collegeId, isDeleted: { $ne: true } });
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    test.isDeleted = true;
    await test.save();
    return res.json({ success: true, message: "Test deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const studentId = getStudentId(req);
    const student = await Student.findOne({ _id: studentId, isDeleted: { $ne: true } });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const tests = await TestSchedule.find({ studentId, isDeleted: { $ne: true } })
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone interestedColleges")
      .sort({ scheduledAt: -1, createdAt: -1 });

    const upcomingTest = tests.find((item) => item.status === "Scheduled") || tests[0] || null;

    return res.json({
      success: true,
      data: {
        student,
        assignedTest: upcomingTest ? serializeTest(upcomingTest) : null,
        tests: tests.map(serializeTest),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getStudentAttempt = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const studentId = getStudentId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid test selection" });
    }

    const test = await TestSchedule.findOne({ _id: id, studentId, isDeleted: { $ne: true } })
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone interestedColleges");

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    const existing = await syncStaleAttempt(
      await TestAttempt.findOne({ testId: id, studentId, isDeleted: { $ne: true } }),
      test
    );

    return res.json({
      success: true,
      data: {
        test: serializeTest(test),
        attempt: existing ? serializeAttempt(existing) : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const startStudentAttempt = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const studentId = getStudentId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid test selection" });
    }

    const test = await TestSchedule.findOne({ _id: id, studentId, isDeleted: { $ne: true } });
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    let attempt = await TestAttempt.findOne({ testId: id, studentId, isDeleted: { $ne: true } });
    attempt = await syncStaleAttempt(attempt, test);

    if (!attempt || attempt.status !== "InProgress") {
      attempt = await TestAttempt.create({
        testId: id,
        collegeId: test.collegeId,
        studentId,
        startedAt: new Date(),
        lastHeartbeatAt: new Date(),
        status: "InProgress",
        answers: [],
      });
    }

    return res.json({
      success: true,
      message: "Test attempt started",
      data: serializeAttempt(attempt),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const heartbeatStudentAttempt = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const studentId = getStudentId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid test selection" });
    }

    const test = await TestSchedule.findOne({ _id: id, studentId, isDeleted: { $ne: true } });
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    let attempt = await TestAttempt.findOne({ testId: id, studentId, isDeleted: { $ne: true } });
    attempt = await syncStaleAttempt(attempt, test);

    if (!attempt || attempt.status !== "InProgress") {
      return res.status(409).json({ success: false, message: "No active test attempt found" });
    }

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    attempt.answers = buildAttemptAnswers(test, answers);
    attempt.lastHeartbeatAt = new Date();
    await attempt.save();

    return res.json({ success: true, message: "Heartbeat saved", data: serializeAttempt(attempt) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const submitStudentAttempt = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const studentId = getStudentId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid test selection" });
    }

    const test = await TestSchedule.findOne({ _id: id, studentId, isDeleted: { $ne: true } });
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    let attempt = await TestAttempt.findOne({ testId: id, studentId, isDeleted: { $ne: true } });
    attempt = await syncStaleAttempt(attempt, test);

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Test attempt not found" });
    }

    if (attempt.status === "Submitted") {
      return res.json({ success: true, message: "Test already submitted", data: serializeAttempt(attempt) });
    }

    const answers = Array.isArray(req.body.answers) ? req.body.answers : attempt.answers || [];
    const computed = calculateAttemptScore(test, answers);
    attempt.answers = computed.answers;
    attempt.score = computed.score;
    attempt.totalMarks = computed.totalMarks;
    attempt.status = "Submitted";
    attempt.autoSubmitted = Boolean(req.body.autoSubmitted);
    attempt.submittedAt = new Date();
    attempt.lastHeartbeatAt = new Date();
    await attempt.save();

    if (test.status !== "Completed") {
      test.status = "Completed";
      await test.save();
    }

    return res.json({
      success: true,
      message: req.body.autoSubmitted ? "Test auto-submitted successfully" : "Test submitted successfully",
      data: serializeAttempt(attempt),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
