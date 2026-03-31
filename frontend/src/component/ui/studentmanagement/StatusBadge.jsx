export function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const palette = {
    approved: { label: "Approved", bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", dot: "#16a34a" },
    active: { label: "Active", bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", dot: "#16a34a" },
    verified: { label: "Verified", bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", dot: "#16a34a" },
    pending: { label: "Pending", bg: "#fffbeb", border: "#fde68a", color: "#b45309", dot: "#d97706" },
    uploaded: { label: "Uploaded", bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", dot: "#2563eb" },
    rejected: { label: "Rejected", bg: "#fef2f2", border: "#fecaca", color: "#b91c1c", dot: "#dc2626" },
    failed: { label: "Failed", bg: "#fef2f2", border: "#fecaca", color: "#b91c1c", dot: "#dc2626" },
    inactive: { label: "Inactive", bg: "#f8fafc", border: "#e2e8f0", color: "#475569", dot: "#94a3b8" },
    default: { label: status || "Unknown", bg: "#f8fafc", border: "#e2e8f0", color: "#475569", dot: "#94a3b8" },
  };
  const s = palette[normalized] || palette.default;
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
        border: `1px solid ${s.border}`,
        color: s.color,
        background: s.bg,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}
