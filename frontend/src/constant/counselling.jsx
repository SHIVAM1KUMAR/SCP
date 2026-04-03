/* eslint-disable react-refresh/only-export-components */
export const COUNSELLOR_AVAILABILITY_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const COUNSELLOR_STATUS_OPTIONS = ["Active", "Inactive"];

export const SESSION_STATUS_OPTIONS = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Completed", label: "Counseled" },
  { value: "Missed", label: "Missed" },
];

export const SESSION_STATUS_META = {
  Scheduled: {
    label: "Scheduled",
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
    dot: "#2563eb",
  },
  Completed: {
    label: "Counseled",
    bg: "#ecfdf5",
    border: "#bbf7d0",
    color: "#166534",
    dot: "#16a34a",
  },
  Missed: {
    label: "Missed",
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#b91c1c",
    dot: "#dc2626",
  },
  Rescheduled: {
    label: "Rescheduled",
    bg: "#fff7ed",
    border: "#fed7aa",
    color: "#c2410c",
    dot: "#f97316",
  },
  default: {
    label: "Scheduled",
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
    dot: "#2563eb",
  },
};

export const createEmptyAvailabilitySlot = () => ({
  day: "Monday",
  startTime: "09:00",
  endTime: "17:00",
});

export const buildCounsellorInitialForm = (counsellor) => ({
  name: counsellor?.name || "",
  email: counsellor?.email || "",
  phone: counsellor?.phone || "",
  department: counsellor?.department || "",
  status: counsellor?.status || "Active",
  availability: Array.isArray(counsellor?.availability) && counsellor.availability.length
    ? counsellor.availability.map((slot) => ({
        day: slot?.day || "Monday",
        startTime: slot?.startTime || "09:00",
        endTime: slot?.endTime || "17:00",
      }))
    : [createEmptyAvailabilitySlot()],
});

export const buildSessionInitialForm = (session) => ({
  counsellorId: session?.counsellorId?._id || session?.counsellorId || "",
  studentId: session?.studentId?._id || session?.studentId || "",
  scheduledDate: session?.scheduledDate || "",
  scheduledTime: session?.scheduledTime || "",
  notes: session?.notes || "",
  status: session?.status || "Scheduled",
});

export const normalizeSessionStatus = (status = "") => {
  const value = String(status || "").trim().toLowerCase();
  if (["counseled", "counselled", "done", "completed", "complete"].includes(value)) return "Completed";
  if (["reschedule", "rescheduled"].includes(value)) return "Rescheduled";
  if (value === "missed") return "Missed";
  if (value === "scheduled") return "Scheduled";
  return "Scheduled";
};

export const displaySessionStatus = (status = "") => {
  const normalized = normalizeSessionStatus(status);
  return SESSION_STATUS_META[normalized]?.label || SESSION_STATUS_META.default.label;
};

export const getSessionStatusMeta = (status) => SESSION_STATUS_META[normalizeSessionStatus(status)] || SESSION_STATUS_META.default;

export function SessionStatusBadge({ status }) {
  const meta = getSessionStatusMeta(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        background: meta.bg,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: meta.dot,
          display: "inline-block",
        }}
      />
      {meta.label}
    </span>
  );
}

export function SessionStatusSelect({ value, onChange, disabled = false, loading = false }) {
  const normalized = normalizeSessionStatus(value);
  const meta = getSessionStatusMeta(normalized);
  const options = SESSION_STATUS_OPTIONS;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ minWidth: 160 }}
    >
      <select
        value={normalized}
        disabled={disabled || loading}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: "100%",
          height: 36,
          padding: "0 34px 0 12px",
          border: `1px solid ${meta.border}`,
          borderRadius: 8,
          fontSize: 12.5,
          fontWeight: 700,
          fontFamily: "'Outfit', sans-serif",
          color: meta.color,
          backgroundColor: meta.bg,
          outline: "none",
          appearance: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2364748b' d='M5 7L0 0h10z'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          cursor: disabled || loading ? "not-allowed" : "pointer",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {normalized === "Rescheduled" && (
          <option value="Rescheduled" hidden>
            Rescheduled
          </option>
        )}
      </select>
    </div>
  );
}
