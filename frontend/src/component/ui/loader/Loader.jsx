// ─── Loader ───────────────────────────────────────────────────────────────────
// AmniCare: MUI CircularProgress
// EduAdmit: Bootstrap spinner-border — exact drop-in replacement
//
// Props:
//   size  — number (px), default 30  → maps to spinner width/height
//   color — "primary" | "secondary" | "inherit" → Bootstrap text color class
// ─────────────────────────────────────────────────────────────────────────────

const COLOR_CLASS = {
    primary:   "text-primary",
    secondary: "text-secondary",
    inherit:   "",
  };
  
  const Loader = ({ size = 30, color = "primary" }) => {
    const colorClass = COLOR_CLASS[color] || COLOR_CLASS.primary;
  
    return (
      <div
        className={`spinner-border ${colorClass}`}
        role="status"
        style={{
          width:  size,
          height: size,
          borderWidth: Math.max(2, size / 12), // scale border with size
        }}
      >
        <span className="visually-hidden">Loading…</span>
      </div>
    );
  };
  
  export default Loader;