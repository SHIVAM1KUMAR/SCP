/* eslint-disable react-refresh/only-export-components */

const RESULT_STATUS_META = {
  Pending: {
    label: "Pending",
    bg: "#f8fafc",
    border: "#e2e8f0",
    color: "#475569",
    dot: "#94a3b8",
  },
  Pass: {
    label: "Pass",
    bg: "#ecfdf5",
    border: "#bbf7d0",
    color: "#166534",
    dot: "#16a34a",
  },
  Fail: {
    label: "Fail",
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#b91c1c",
    dot: "#dc2626",
  },
};

export const RESULT_STATUS_OPTIONS = ["Pending", "Pass", "Fail"];

export const SCHOLARSHIP_TYPE_OPTIONS = [
  { value: "Per Year", label: "Per Year" },
  { value: "Per Sem", label: "Per Sem" },
  { value: "One Time", label: "One Time" },
];

export const normalizeResultStatus = (value = "") => {
  const text = String(value || "").trim().toLowerCase();
  if (["pass", "passed", "approved"].includes(text)) return "Pass";
  if (["fail", "failed", "rejected"].includes(text)) return "Fail";
  if (["pending", "waiting", "in-progress"].includes(text)) return "Pending";
  return "Pending";
};

export const normalizeScholarshipType = (value = "") => {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (["per year", "year", "yearly", "annual"].includes(text)) return "Per Year";
  if (["per sem", "semester", "sem", "half yearly"].includes(text)) return "Per Sem";
  if (["one time", "onetime", "single", "once"].includes(text)) return "One Time";
  return "";
};

export const formatScholarshipAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getResultStatusMeta = (status) =>
  RESULT_STATUS_META[normalizeResultStatus(status)] || RESULT_STATUS_META.Pending;

export function ResultStatusBadge({ status }) {
  const meta = getResultStatusMeta(status);
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

export function ScholarshipTypeBadge({ value }) {
  const label = normalizeScholarshipType(value);
  if (!label) {
    return <span style={{ color: "#94a3b8" }}>-</span>;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1d4ed8",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
