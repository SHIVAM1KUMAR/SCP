import { useState } from "react";
import BasicModal from "../../ui/modal/basicModal";
import Button from "../../ui/button/Button";
import TextField from "../../ui/textfeild/textFeild.jsx";
import "../../../types/counselling.type.js";
import { SESSION_STATUS_OPTIONS, buildSessionInitialForm } from "../../../constant/counselling.jsx";

export default function SessionModal({
  open,
  onClose,
  onSubmit,
  session = null,
  counsellors = [],
  students = [],
  loading = false,
}) {
  const [form, setForm] = useState(buildSessionInitialForm(session));
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.counsellorId || !form.studentId || !form.scheduledDate || !form.scheduledTime) {
      setError("Please select a counsellor, student, date and time.");
      return;
    }

    setError("");
    await onSubmit?.({
      id: session?._id || null,
      payload: {
        counsellorId: form.counsellorId,
        studentId: form.studentId,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        notes: String(form.notes || ""),
        status: form.status,
      },
    });
  };

  return (
    <BasicModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={session?._id ? "Edit Counselling" : "Schedule Counselling"}
      maxWidth={560}
      actions={(
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {session?._id ? "Save Changes" : "Schedule Session"}
          </Button>
        </div>
      )}
      disableClose={loading}
    >
      <style>{`
        .session-form {
          display: grid;
          gap: 12px;
          overflow-x: hidden;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="session-form">
        {error && (
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "#fef2f2", color: "#b91c1c", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <Field label="Counsellor">
          <select value={form.counsellorId} onChange={(e) => setForm((prev) => ({ ...prev, counsellorId: e.target.value }))} style={inputStyle}>
            <option value="">Select counsellor</option>
            {counsellors.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Student">
          <select value={form.studentId} onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))} style={inputStyle}>
            <option value="">Select student</option>
            {students.map((item) => (
              <option key={item._id} value={item._id}>
                {item.firstName} {item.lastName}
              </option>
            ))}
          </select>
        </Field>

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

        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} style={inputStyle}>
            {SESSION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {form.status === "Rescheduled" && (
              <option value="Rescheduled" hidden>
                Rescheduled
              </option>
            )}
          </select>
        </Field>

        <Field label="Notes">
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>
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
