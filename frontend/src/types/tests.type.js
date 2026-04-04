const createQuestionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createEmptyTestQuestion = () => ({
  id: createQuestionId(),
  questionText: "",
  options: ["", "", "", ""],
  correctAnswerIndex: 0,
  marks: 1,
});

export const INITIAL_TEST_FORM_VALUES = {
  studentId: "",
  title: "",
  mode: "platform",
  testLink: "",
  scheduledDate: "",
  scheduledTime: "",
  durationMinutes: 30,
  status: "Scheduled",
  notes: "",
  questions: [createEmptyTestQuestion()],
};

const normalizeQuestion = (question = {}) => {
  const options = Array.isArray(question.options) ? question.options : [];
  return {
    id: String(question.id || question._id || createQuestionId()),
    questionText: String(question.questionText || "").trim(),
    options: Array.from({ length: 4 }, (_, index) => String(options[index] || "").trim()),
    correctAnswerIndex: Number.isInteger(question.correctAnswerIndex)
      ? question.correctAnswerIndex
      : Number(question.correctAnswerIndex || 0),
    marks: Number.isFinite(Number(question.marks)) && Number(question.marks) > 0
      ? Number(question.marks)
      : 1,
  };
};

const toDateInput = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toTimeInput = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const date = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toTimeString().slice(0, 5);
};

export const buildTestInitialForm = (test, { studentId = "" } = {}) => {
  if (!test) {
    return {
      ...INITIAL_TEST_FORM_VALUES,
      studentId,
    };
  }

  const mode = test.mode === "link" ? "link" : "platform";
  const questions = Array.isArray(test.questions) && test.questions.length
    ? test.questions.map(normalizeQuestion)
    : [createEmptyTestQuestion()];

  return {
    ...INITIAL_TEST_FORM_VALUES,
    studentId: test.student?._id || test.studentId?._id || test.studentId || studentId || "",
    title: test.title || "",
    mode,
    testLink: test.testLink || "",
    scheduledDate: toDateInput(test.scheduledDate || test.scheduledAt),
    scheduledTime: toTimeInput(test.scheduledTime),
    durationMinutes: Number(test.durationMinutes || 30),
    status: test.status || "Scheduled",
    notes: test.notes || "",
    questions,
  };
};
