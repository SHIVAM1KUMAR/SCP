import { isValidObjectId } from "mongoose";
import TestSchedule from "../../models/tests/testModal.js";
import TestAttempt from "../../models/tests/testAttemptModal.js";

const normalizeRole = (role = "") => String(role).trim().toLowerCase();
const isObjectIdLike = (value) => Boolean(value) && isValidObjectId(String(value));

const getCollegeId = (req) => req.user?.collegeId || null;
const getStudentId = (req) => req.user?.id || null;

const toPlain = (doc) => (doc?.toObject ? doc.toObject({ virtuals: true }) : doc ? { ...doc } : null);

const normalizeResultStatus = (value = "") => {
  const text = String(value || "").trim().toLowerCase();
  if (["pass", "passed", "approved"].includes(text)) return "Pass";
  if (["fail", "failed", "rejected"].includes(text)) return "Fail";
  if (["pending", "waiting", "in-progress"].includes(text)) return "Pending";
  return "Pending";
};

const normalizeScholarshipType = (value = "") => {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (["per year", "year", "yearly", "annual"].includes(text)) return "Per Year";
  if (["per sem", "semester", "sem", "half yearly"].includes(text)) return "Per Sem";
  if (["one time", "onetime", "single", "once"].includes(text)) return "One Time";
  return "";
};

const serializeResult = (testDoc, attemptDoc = null) => {
  const test = toPlain(testDoc);
  const attempt = toPlain(attemptDoc);
  if (!test) return null;

  const score = attempt?.score ?? null;
  const totalMarks = attempt?.totalMarks ?? null;
  const percentage =
    Number.isFinite(Number(score)) && Number.isFinite(Number(totalMarks)) && Number(totalMarks) > 0
      ? Math.round((Number(score) / Number(totalMarks)) * 100)
      : null;

  return {
    ...test,
    college: test.collegeId && typeof test.collegeId === "object" ? test.collegeId : null,
    student: test.studentId && typeof test.studentId === "object" ? test.studentId : null,
    score,
    totalMarks,
    percentage,
    submittedAt: attempt?.submittedAt || null,
  };
};

const getResultsQuery = (req) => {
  const role = normalizeRole(req.user?.role);
  const query = {
    isDeleted: { $ne: true },
    status: "Completed",
  };

  if (role === "college") {
    query.collegeId = getCollegeId(req);
  } else if (role === "student") {
    query.studentId = getStudentId(req);
  } else if (role !== "superadmin") {
    query._id = null;
  }

  if (req.query.resultStatus) {
    query.resultStatus = normalizeResultStatus(req.query.resultStatus);
  }

  return query;
};

const loadResultsWithAttempts = async (req, query) => {
  const tests = await TestSchedule.find(query)
    .populate("collegeId", "collegeName collegeCode email location")
    .populate("studentId", "firstName lastName email phone interestedColleges")
    .sort({ updatedAt: -1, createdAt: -1 });

  const testIds = tests.map((test) => test._id);
  const attempts = testIds.length
    ? await TestAttempt.find({ testId: { $in: testIds }, isDeleted: { $ne: true } })
      .select("testId score totalMarks submittedAt createdAt")
    : [];

  const attemptsMap = new Map(
    attempts.map((attempt) => [String(attempt.testId), attempt])
  );

  return tests.map((test) => serializeResult(test, attemptsMap.get(String(test._id))));
};

const assertAccess = (req, test) => {
  const role = normalizeRole(req.user?.role);
  if (role === "superadmin") return true;
  if (role === "college") return String(getCollegeId(req)) === String(test.collegeId?._id || test.collegeId);
  if (role === "student") return String(getStudentId(req)) === String(test.studentId?._id || test.studentId);
  return false;
};

export const getResults = async (req, res) => {
  try {
    const results = await loadResultsWithAttempts(req, getResultsQuery(req));
    return res.json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getResultById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectIdLike(id)) {
      return res.status(400).json({ success: false, message: "Invalid result id" });
    }

    const test = await TestSchedule.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone interestedColleges");

    if (!test) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    if (!assertAccess(req, test)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const attempt = await TestAttempt.findOne({ testId: id, isDeleted: { $ne: true } })
      .select("testId score totalMarks submittedAt createdAt");

    return res.json({ success: true, data: serializeResult(test, attempt) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateResult = async (req, res) => {
  try {
    if (normalizeRole(req.user?.role) !== "college") {
      return res.status(403).json({ success: false, message: "Only college users can update results" });
    }

    const collegeId = getCollegeId(req);
    const { id } = req.params;
    if (!isObjectIdLike(id) || !isObjectIdLike(collegeId)) {
      return res.status(400).json({ success: false, message: "Invalid result selection" });
    }

    const test = await TestSchedule.findOne({ _id: id, collegeId, isDeleted: { $ne: true } });
    if (!test) {
      return res.status(404).json({ success: false, message: "Result not found" });
    }

    if (test.status !== "Completed") {
      return res.status(409).json({ success: false, message: "Only completed tests can be marked as results" });
    }

    const resultStatus = normalizeResultStatus(req.body.resultStatus || req.body.status);
    const scholarshipAmount = Number(req.body.scholarshipAmount ?? req.body.amount ?? null);
    const scholarshipType = normalizeScholarshipType(req.body.scholarshipType || req.body.durationType || "");
    const resultNote = String(req.body.resultNote || req.body.notes || "").trim();

    if (!["Pending", "Pass", "Fail"].includes(resultStatus)) {
      return res.status(400).json({ success: false, message: "Invalid result status" });
    }

    if (resultStatus === "Pass") {
      if (!Number.isFinite(scholarshipAmount) || scholarshipAmount <= 0) {
        return res.status(400).json({ success: false, message: "Scholarship amount is required for pass results" });
      }
      if (!scholarshipType) {
        return res.status(400).json({ success: false, message: "Scholarship type is required for pass results" });
      }
      test.scholarshipAmount = scholarshipAmount;
      test.scholarshipType = scholarshipType;
    } else {
      test.scholarshipAmount = null;
      test.scholarshipType = "";
    }

    test.resultStatus = resultStatus;
    test.resultNote = resultNote;
    test.resultUpdatedAt = new Date();
    test.resultUpdatedBy = req.user?.email || "";
    await test.save();

    const updated = await TestSchedule.findById(test._id)
      .populate("collegeId", "collegeName collegeCode email location")
      .populate("studentId", "firstName lastName email phone interestedColleges");
    const attempt = await TestAttempt.findOne({ testId: id, isDeleted: { $ne: true } })
      .select("testId score totalMarks submittedAt createdAt");

    return res.json({
      success: true,
      message: "Result updated successfully",
      data: serializeResult(updated, attempt),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
