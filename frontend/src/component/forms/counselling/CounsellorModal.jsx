import { useState } from "react";
import BasicModal from "../../ui/modal/basicModal";
import Button from "../../ui/button/Button";
import TextField from "../../ui/textfeild/textFeild.jsx";
import "../../../types/counselling.type.js";
import {
  COUNSELLOR_AVAILABILITY_DAYS,
  COUNSELLOR_STATUS_OPTIONS,
  buildCounsellorInitialForm,
  createEmptyAvailabilitySlot,
} from "../../../constant/counselling.jsx";

export default function CounsellorModal({
  open,
  onClose,
  onSubmit,
  counsellor = null,
  loading = false,
}) {
  const [form, setForm] = useState(buildCounsellorInitialForm(counsellor));
  const [error, setError] = useState("");

  const updateSlot = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [field]: value } : slot,
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = String(form.name || "").trim();
    const email = String(form.email || "").trim();
    const phone = String(form.phone || "").trim();

    if (!name || !email || !phone) {
      setError("Name, email and phone are required.");
      return;
    }

    setError("");
    await onSubmit?.({
      id: counsellor?._id || null,
      payload: {
        name,
        email,
        phone,
        department: String(form.department || "").trim(),
        status: form.status === "Inactive" ? "Inactive" : "Active",
        availability: form.availability,
      },
    });
  };

  return (
    <BasicModal
      open={open}
      onClose={loading ? undefined : onClose}
      title={counsellor?._id ? "Edit Counsellor" : "Add Counsellor"}
      maxWidth={640}
      actions={(
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {counsellor?._id ? "Save Changes" : "Save Counsellor"}
          </Button>
        </div>
      )}
      disableClose={loading}
    >
      <style>{`
        .counsellor-availability-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .counsellor-availability-time-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .counsellor-availability-remove {
          display: flex;
          justify-content: flex-end;
        }
        @media (max-width: 560px) {
          .counsellor-availability-time-grid {
            grid-template-columns: 1fr;
          }
          .counsellor-availability-remove {
            justify-content: stretch;
          }
        }
      `}</style>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, overflowX: "hidden" }}>
        {error && (
          <div style={{ padding: "10px 12px", borderRadius: 10, background: "#fef2f2", color: "#b91c1c", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <TextField label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        <TextField label="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
        <TextField label="Phone" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
        <TextField label="Department" value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} />
        <Field label="Status">
          <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} style={inputStyle}>
            {COUNSELLOR_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <div style={labelStyle}>Availability</div>
          <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
            {form.availability.map((slot, index) => (
              <div
                key={`${slot.day}-${index}`}
                className="counsellor-availability-row"
                style={{
                  border: "1px solid #e6edf7",
                  borderRadius: 14,
                  padding: 14,
                  background: "#fafcff",
                }}
              >
                <Field label="Day">
                  <select value={slot.day} onChange={(e) => updateSlot(index, "day", e.target.value)} style={inputStyle}>
                    {COUNSELLOR_AVAILABILITY_DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="counsellor-availability-time-grid">
                  <TextField
                    label="Start Time"
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                  />
                </div>
                <div className="counsellor-availability-remove">
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        availability: prev.availability.filter((_, slotIndex) => slotIndex !== index),
                      }))
                    }
                    disabled={form.availability.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 8 }}>
            <Button
              variant="outlined"
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, availability: [...prev.availability, createEmptyAvailabilitySlot()] }))}
            >
              Add Slot
            </Button>
          </div>
        </div>
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
