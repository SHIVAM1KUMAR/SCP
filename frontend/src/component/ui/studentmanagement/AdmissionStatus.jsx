/* eslint-disable react-refresh/only-export-components */

const ADMISSION_STATUS_META = {
  Pending: {
    label: "Pending",
    bg: "#f8fafc",
    border: "#e2e8f0",
    color: "#475569",
    dot: "#94a3b8",
  },
  Admitted: {
    label: "Admitted",
    bg: "#ecfdf5",
    border: "#bbf7d0",
    color: "#166534",
    dot: "#16a34a",
  },
  "Not Admitted": {
    label: "Not Admitted",
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#b91c1c",
    dot: "#dc2626",
  },
  default: {
    label: "Pending",
    bg: "#f8fafc",
    border: "#e2e8f0",
    color: "#475569",
    dot: "#94a3b8",
  },
};

export const ADMISSION_STATUS_OPTIONS = ["Pending", "Admitted", "Not Admitted"];

export const normalizeAdmissionStatus = (value) => {
  const text = String(value || "").trim();
  if (!text) return "Pending";

  const legacyMap = {
    yes: "Admitted",
    admitted: "Admitted",
    taken: "Admitted",
    true: "Admitted",
    no: "Not Admitted",
    "not admitted": "Not Admitted",
    notadmitted: "Not Admitted",
    false: "Not Admitted",
    pending: "Pending",
    undecided: "Pending",
    unknown: "Pending",
  };

  const legacy = legacyMap[text.toLowerCase()];
  if (legacy) return legacy;

  const match = ADMISSION_STATUS_OPTIONS.find(
    (option) => option.toLowerCase() === text.toLowerCase(),
  );
  return match || "Pending";
};

const getAdmissionMeta = (status) => ADMISSION_STATUS_META[status] || ADMISSION_STATUS_META.default;

export function AdmissionStatusBadge({ status }) {
  const normalized = normalizeAdmissionStatus(status);
  const meta = getAdmissionMeta(normalized);

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

export function AdmissionStatusSelect({
  value,
  onChange,
  disabled = false,
  loading = false,
}) {
  const normalized = normalizeAdmissionStatus(value);
  const meta = getAdmissionMeta(normalized);

  return (
    <div style={{ minWidth: 160 }}>
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
        {ADMISSION_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
