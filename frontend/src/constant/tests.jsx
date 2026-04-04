/* eslint-disable react-refresh/only-export-components */

export const TEST_MODE_OPTIONS = [
  { value: "platform", label: "Create on platform" },
  { value: "link", label: "Use test link" },
];

export const TEST_STATUS_OPTIONS = ["Scheduled", "Completed", "Missed"];

const TEST_STATUS_META = {
  Scheduled: {
    label: "Scheduled",
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
    dot: "#2563eb",
  },
  Completed: {
    label: "Completed",
    bg: "#ecfdf5",
    border: "#bbf7d0",
    color: "#166534",
    dot: "#16a34a",
  },
  Rescheduled: {
    label: "Rescheduled",
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
    dot: "#2563eb",
  },
  Missed: {
    label: "Missed",
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#b91c1c",
    dot: "#dc2626",
  },
  default: {
    label: "Scheduled",
    bg: "#f8fafc",
    border: "#e2e8f0",
    color: "#475569",
    dot: "#94a3b8",
  },
};

export const normalizeTestMode = (value = "") => {
  const text = String(value || "").trim().toLowerCase();
  if (["link", "url", "external", "external-link"].includes(text)) return "link";
  return "platform";
};

export const displayTestMode = (value = "") =>
  normalizeTestMode(value) === "link" ? "External Link" : "Platform Test";

export const normalizeTestStatus = (value = "") => {
  const text = String(value || "").trim().toLowerCase();
  if (["done", "completed", "complete"].includes(text)) return "Completed";
  if (["reschedule", "rescheduled"].includes(text)) return "Rescheduled";
  if (text === "missed") return "Missed";
  if (text === "scheduled") return "Scheduled";
  return "Scheduled";
};

export const displayTestStatus = (value = "") => normalizeTestStatus(value);

export const getTestStatusMeta = (status) =>
  TEST_STATUS_META[normalizeTestStatus(status)] || TEST_STATUS_META.default;

export function TestStatusBadge({ status }) {
  const meta = getTestStatusMeta(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        color: meta.color,
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

export function TestStatusSelect({
  value,
  onChange,
  disabled = false,
  loading = false,
}) {
  const normalized = normalizeTestStatus(value);
  const meta = getTestStatusMeta(normalized);

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
        {TEST_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {getTestStatusMeta(option).label}
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
