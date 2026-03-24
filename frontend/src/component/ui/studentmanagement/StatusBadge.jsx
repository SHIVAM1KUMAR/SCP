export function StatusBadge({ status }) {
  const active = status?.toLowerCase() === "active";
  return (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${active ? "#86efac" : "#fca5a5"}`, color: active ? "#166634" : "#991b1b", background: active ? "#f0fdf4" : "#fff5f5" }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
