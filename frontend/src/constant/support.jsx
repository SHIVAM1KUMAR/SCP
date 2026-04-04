export const SUPPORT_STATUS_OPTIONS = [
  { value: "Open", label: "Open" },
  { value: "InProgress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];

export const SUPPORT_CATEGORY_OPTIONS = [
  "General",
  "Admission",
  "Payment",
  "Result",
  "Counselling",
  "Technical",
  "Other",
];

export const CONTACT_PREFERENCE_OPTIONS = [
  { value: "Email", label: "Email" },
  { value: "Phone", label: "Phone" },
  { value: "Both", label: "Both" },
];

export const normalizeSupportStatus = (status = "") => {
  const value = String(status).trim().toLowerCase();
  if (value === "open") return "Open";
  if (value === "inprogress" || value === "in progress" || value === "working") return "InProgress";
  if (value === "resolved") return "Resolved";
  if (value === "closed") return "Closed";
  return "Open";
};

export const getSupportStatusLabel = (status = "") => {
  const normalized = normalizeSupportStatus(status);
  return SUPPORT_STATUS_OPTIONS.find((item) => item.value === normalized)?.label || normalized;
};

export const getSupportStatusTone = (status = "") => {
  const normalized = normalizeSupportStatus(status);
  if (normalized === "Open") return "warning";
  if (normalized === "InProgress") return "info";
  if (normalized === "Resolved") return "success";
  if (normalized === "Closed") return "muted";
  return "muted";
};

export function SupportStatusBadge({ status }) {
  const tone = getSupportStatusTone(status);
  const label = getSupportStatusLabel(status);
  const palette = {
    warning: { background: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
    info: { background: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    success: { background: "#ecfdf5", color: "#047857", border: "#bbf7d0" },
    muted: { background: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
  }[tone];

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
        border: `1px solid ${palette.border}`,
        background: palette.background,
        color: palette.color,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: palette.color }} />
      {label}
    </span>
  );
}

export function SupportStatusSelect({ value, onChange, disabled = false, loading = false, style = {} }) {
  return (
    <select
      value={normalizeSupportStatus(value)}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled || loading}
      style={{
        height: 36,
        minWidth: 150,
        borderRadius: 8,
        border: "1px solid #cbd5e1",
        padding: "0 10px",
        fontSize: 13,
        color: "#1e293b",
        background: disabled ? "#f8fafc" : "#fff",
        fontFamily: "'Outfit', sans-serif",
        outline: "none",
        ...style,
      }}
    >
      {SUPPORT_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
