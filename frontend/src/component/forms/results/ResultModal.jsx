import { useEffect, useMemo, useState } from "react";
import BasicModal from "../../ui/modal/basicModal";
import Button from "../../ui/button/Button";
import TextField from "../../ui/textfeild/textFeild.jsx";
import { buildResultInitialForm } from "../../../types/results.type.js";
import {
  RESULT_STATUS_OPTIONS,
  SCHOLARSHIP_TYPE_OPTIONS,
  normalizeResultStatus,
  normalizeScholarshipType,
} from "../../../constant/results.jsx";

export default function ResultModal({
  open,
  onClose,
  onSubmit,
  result = null,
  loading = false,
}) {
  const [form, setForm] = useState(() => buildResultInitialForm(result));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(buildResultInitialForm(result));
    setError("");
  }, [result, open]);

  const isPass = useMemo(() => normalizeResultStatus(form.resultStatus) === "Pass", [form.resultStatus]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const resultStatus = normalizeResultStatus(form.resultStatus);
    const scholarshipAmount = Number(form.scholarshipAmount || 0);
    const scholarshipType = normalizeScholarshipType(form.scholarshipType);

    if (resultStatus === "Pass") {
      if (!Number.isFinite(scholarshipAmount) || scholarshipAmount <= 0) {
        setError("Please enter a scholarship amount for pass results.");
        return;
      }
      if (!scholarshipType) {
        setError("Please select how the scholarship is given.");
        return;
      }
    }

    setError("");
    await onSubmit?.({
      id: result?._id || null,
      payload: {
        resultStatus,
        scholarshipAmount: resultStatus === "Pass" ? scholarshipAmount : null,
        scholarshipType: resultStatus === "Pass" ? scholarshipType : "",
        resultNote: String(form.resultNote || "").trim(),
      },
    });
  };

  return (
    <BasicModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={result?._id ? "Update Result" : "Result"}
      maxWidth={620}
      actions={(
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Save Result
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <ReadOnlyField label="Student" value={`${result?.student?.firstName || ""} ${result?.student?.lastName || ""}`.trim() || "-"} />
          <ReadOnlyField label="College" value={result?.college?.collegeName || "-"} />
          <ReadOnlyField label="Marks" value={formatScore(result)} />
          <ReadOnlyField label="Completed On" value={formatDate(result?.submittedAt || result?.updatedAt || result?.createdAt)} />
        </div>

        <Field label="Result Status">
          <select
            value={form.resultStatus}
            onChange={(e) => setForm((prev) => ({ ...prev, resultStatus: e.target.value }))}
            style={inputStyle}
          >
            {RESULT_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        {isPass && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextField
              label="Scholarship Amount"
              type="number"
              min="1"
              value={form.scholarshipAmount}
              onChange={(e) => setForm((prev) => ({ ...prev, scholarshipAmount: e.target.value }))}
              placeholder="25000"
            />
            <Field label="Scholarship Type">
              <select
                value={form.scholarshipType}
                onChange={(e) => setForm((prev) => ({ ...prev, scholarshipType: e.target.value }))}
                style={inputStyle}
              >
                <option value="">Select type</option>
                {SCHOLARSHIP_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        <TextField
          label="Result Note"
          value={form.resultNote}
          onChange={(e) => setForm((prev) => ({ ...prev, resultNote: e.target.value }))}
          multiline
          rows={4}
          placeholder="Optional note"
        />
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

function ReadOnlyField({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={labelStyle}>{label}</div>
      <div style={readOnlyStyle}>{value || "-"}</div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
}

function formatScore(result) {
  const score = Number(result?.score);
  const totalMarks = Number(result?.totalMarks);
  if (!Number.isFinite(score) || !Number.isFinite(totalMarks)) return "-";
  return `${score} / ${totalMarks}`;
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
  fontFamily: "'Outfit', sans-serif",
  marginBottom: 6,
};

const readOnlyStyle = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 14,
  color: "#0f2044",
  background: "#f8fafc",
  fontFamily: "'Outfit', sans-serif",
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #dbe3ee",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "#0f2044",
  background: "#fff",
  boxSizing: "border-box",
};
