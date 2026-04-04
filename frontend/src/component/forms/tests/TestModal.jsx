import { useMemo, useState } from "react";
import BasicModal from "../../ui/modal/basicModal";
import Button from "../../ui/button/Button";
import TextField from "../../ui/textfeild/textFeild.jsx";
import {
  TEST_MODE_OPTIONS,
  TEST_STATUS_OPTIONS,
  displayTestMode,
  normalizeTestMode,
  normalizeTestStatus,
} from "../../../constant/tests.jsx";
import { buildTestInitialForm, createEmptyTestQuestion } from "../../../types/tests.type.js";

export default function TestModal({
  open,
  onClose,
  onSubmit,
  test = null,
  students = [],
  loading = false,
}) {
  const [form, setForm] = useState(() => buildTestInitialForm(test));
  const [error, setError] = useState("");

  const platformMode = normalizeTestMode(form.mode) === "platform";
  const selectedModeLabel = useMemo(() => displayTestMode(form.mode), [form.mode]);

  const updateQuestion = (questionIndex, key, value) => {
    setForm((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((question, index) => {
        if (index !== questionIndex) return question;
        return { ...question, [key]: value };
      }),
    }));
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setForm((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((question, index) => {
        if (index !== questionIndex) return question;
        const options = [...(question.options || ["", "", "", ""])];
        options[optionIndex] = value;
        const correctAnswerIndex = question.correctAnswerIndex >= options.length ? 0 : question.correctAnswerIndex;
        return { ...question, options, correctAnswerIndex };
      }),
    }));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), createEmptyTestQuestion()],
    }));
  };

  const removeQuestion = (questionIndex) => {
    setForm((prev) => {
      const nextQuestions = (prev.questions || []).filter((_, index) => index !== questionIndex);
      return {
        ...prev,
        questions: nextQuestions.length ? nextQuestions : [createEmptyTestQuestion()],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: String(form.title || "").trim(),
      studentId: form.studentId,
      mode: normalizeTestMode(form.mode),
      testLink: platformMode ? "" : String(form.testLink || "").trim(),
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      durationMinutes: Number(form.durationMinutes || 30),
      status: normalizeTestStatus(form.status),
      notes: String(form.notes || "").trim(),
      questions: platformMode
        ? (form.questions || []).map((question) => ({
          id: String(question.id || ""),
          questionText: String(question.questionText || "").trim(),
          options: (question.options || []).map((option) => String(option || "").trim()),
          correctAnswerIndex: Number(question.correctAnswerIndex || 0),
          marks: 1,
        }))
        : [],
    };

    if (!payload.title || !payload.studentId || !payload.scheduledDate || !payload.scheduledTime) {
      setError("Please fill title, student, date and time.");
      return;
    }
    if (!Number.isFinite(payload.durationMinutes) || payload.durationMinutes <= 0) {
      setError("Please enter a valid duration.");
      return;
    }

    if (platformMode) {
      const invalidQuestion = (payload.questions || []).some((question) => {
        const options = question.options || [];
        const filledOptions = options.filter(Boolean);
        const correctAnswer = String(options[question.correctAnswerIndex] || "").trim();
        return (
          !question.questionText ||
          filledOptions.length < 2 ||
          !correctAnswer ||
          question.correctAnswerIndex < 0 ||
          question.correctAnswerIndex >= options.length
        );
      });
      if (!payload.questions.length || invalidQuestion) {
        setError("Please add at least one valid platform question with a marked answer.");
        return;
      }
    } else if (!payload.testLink) {
      setError("Please provide a test link for external test mode.");
      return;
    }

    setError("");
    await onSubmit?.({
      id: test?._id || null,
      payload,
    });
  };

  return (
    <BasicModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={test?._id ? "Edit Test" : "Schedule Test"}
      maxWidth={820}
      actions={(
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {test?._id ? "Save Changes" : "Schedule Test"}
          </Button>
        </div>
      )}
      disableClose={loading}
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        {error && (
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "#fef2f2", color: "#b91c1c", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <TextField
          label="Test Title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="NEET Mock Test 1"
        />

        <Field label="Student">
          <select
            value={form.studentId}
            onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
            style={inputStyle}
          >
            <option value="">Select student</option>
            {students.map((item) => (
              <option key={item._id} value={item._id}>
                {item.firstName} {item.lastName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Test Type">
          <select
            value={form.mode}
            onChange={(e) => setForm((prev) => ({ ...prev, mode: normalizeTestMode(e.target.value) }))}
            style={inputStyle}
          >
            {TEST_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {platformMode ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2044" }}>Platform Questions</div>
            </div>

            {(form.questions || []).map((question, questionIndex) => (
              <div key={question.id || question._id || questionIndex} style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    background: "#f8fafc",
                    padding: 16,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <TextField
                    label={`Question ${questionIndex + 1}`}
                    value={question.questionText}
                    multiline
                    rows={3}
                    onChange={(e) => updateQuestion(questionIndex, "questionText", e.target.value)}
                    placeholder="Enter question"
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {(question.options || ["", "", "", ""]).map((option, optionIndex) => (
                      <TextField
                        key={`${question.id || questionIndex}-${optionIndex}`}
                        label={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    ))}
                  </div>

                  <Field label="Marks">
                    <input
                      value={1}
                      readOnly
                      disabled
                      style={{
                        ...inputStyle,
                        background: "#f8fafc",
                        color: "#64748b",
                        cursor: "not-allowed",
                      }}
                    />
                  </Field>

                  <Field label="Correct Answer">
                    <select
                      value={question.correctAnswerIndex}
                      onChange={(e) => updateQuestion(questionIndex, "correctAnswerIndex", Number(e.target.value))}
                      style={inputStyle}
                    >
                      {(question.options || ["", "", "", ""]).map((_, optionIndex) => (
                        <option key={optionIndex} value={optionIndex}>
                          Option {optionIndex + 1}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={(form.questions || []).length === 1}
                    >
                      Remove Question
                    </Button>
                  </div>
                </div>

                {questionIndex === 0 && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <Button variant="outlined" onClick={addQuestion} type="button">
                      + Add Question
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <TextField
            label="Test Link"
            value={form.testLink}
            onChange={(e) => setForm((prev) => ({ ...prev, testLink: e.target.value }))}
            placeholder="https://"
          />
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextField
            label="Date"
            type="date"
            value={form.scheduledDate}
            onChange={(e) => setForm((prev) => ({ ...prev, scheduledDate: e.target.value }))}
          />
          <TextField
            label="Time"
            type="time"
            value={form.scheduledTime}
            onChange={(e) => setForm((prev) => ({ ...prev, scheduledTime: e.target.value }))}
          />
        </div>

        <TextField
          label="Duration (minutes)"
          type="number"
          min="1"
          value={form.durationMinutes}
          onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
          placeholder="30"
        />

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            style={inputStyle}
          >
            {TEST_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <TextField
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          multiline
          rows={4}
          placeholder="Optional notes"
        />
        <div style={{ fontSize: 12, color: "#64748b" }}>Mode: {selectedModeLabel}</div>
      </form>
    </BasicModal>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: "#1e293b" };
const inputStyle = {
  width: "100%",
  border: "1px solid #dbe3ee",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "#0f2044",
  background: "#fff",
};
