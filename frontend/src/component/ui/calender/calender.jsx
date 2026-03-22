// ─── CalendarLegend ───────────────────────────────────────────────────────────
// AmniCare: MUI Stack + useTheme + getStatusPalette
// EduAdmit: Bootstrap flex row + static color map
// Import scheduleStatusOptions from your constants file.
// ─────────────────────────────────────────────────────────────────────────────

// Default status colours — replace with your own constants/schedule values
const STATUS_COLORS = {
    scheduled:   "#3b82f6",
    completed:   "#22c55e",
    cancelled:   "#ef4444",
    pending:     "#f59e0b",
    inprogress:  "#8b5cf6",
  };
  
  const Dot = ({ color, label }) => (
    <div className="d-flex align-items-center gap-2">
      <div
        style={{
          width: 12, height: 12,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 13, color: "#52637a", fontFamily: "'Outfit', sans-serif" }}>
        {label}
      </span>
    </div>
  );
  
  // ── Usage: pass your scheduleStatusOptions array, or it uses defaults ─────────
  export const CalendarLegend = ({ statusOptions }) => {
    const options = statusOptions || Object.entries(STATUS_COLORS).map(([value, color]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      color,
    }));
  
    return (
      <div className="d-flex flex-wrap gap-3 mb-3">
        {options.map((status) => (
          <Dot
            key={status.value}
            color={status.color || STATUS_COLORS[status.value] || "#94a3b8"}
            label={status.label}
          />
        ))}
      </div>
    );
  };
  
  export default CalendarLegend;