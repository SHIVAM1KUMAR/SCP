import { isValidElement } from "react";

// ─── DetailRow ────────────────────────────────────────────────────────────────
// AmniCare: MUI Box + Typography + Stack
// EduAdmit: Plain divs with Bootstrap utilities
//
// Usage:
//   <DetailRow label="Status" value="Active" />
//   <DetailRow label="Programs" value={<Badge>Home Care</Badge>} />
// ─────────────────────────────────────────────────────────────────────────────

const DetailRow = ({ label, value, isElement = false }) => {
  const shouldRenderAsElement = isValidElement(value) || isElement;

  return (
    <div className="mb-3">
      <p
        className="mb-1 fw-semibold"
        style={{
          fontSize: 13,
          color: "#475569",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {label}:
      </p>

      {shouldRenderAsElement ? (
        // Render JSX elements (chips, badges, etc.) in a flex wrap row
        <div className="d-flex flex-wrap gap-2">
          {value}
        </div>
      ) : (
        <p
          className="mb-0"
          style={{
            fontSize: 14,
            color: "#1e293b",
            wordBreak: "break-all",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {value || "—"}
        </p>
      )}
    </div>
  );
};

export default DetailRow;