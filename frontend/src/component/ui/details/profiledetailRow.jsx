import { isValidElement } from "react";

// ─── ProfileDetailRow ─────────────────────────────────────────────────────────
// AmniCare: MUI Grid container + Grid items + Typography + Stack
// EduAdmit: Bootstrap row + col-12/col-sm-4 / col-sm-8
//
// Two-column layout: label on left (4 cols), value on right (8 cols)
//
// Usage:
//   <ProfileDetailRow label="Full Name" value="John Doe" />
//   <ProfileDetailRow label="Programs" value={[<Badge>X</Badge>]} isElement />
// ─────────────────────────────────────────────────────────────────────────────

export const ProfileDetailRow = ({ label, value, isElement = false }) => {
  const isArrayOfElements =
    Array.isArray(value) && value.some((v) => isValidElement(v));

  const shouldRenderAsElement =
    isValidElement(value) || isArrayOfElements || isElement;

  return (
    <div className="row py-2" style={{ borderBottom: "1px solid #f0f3f7" }}>

      {/* Label — 4 cols */}
      <div className="col-12 col-sm-4">
        <p
          className="mb-0 fw-semibold"
          style={{
            fontSize: 13,
            color: "#475569",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {label}:
        </p>
      </div>

      {/* Value — 8 cols */}
      <div className="col-12 col-sm-8">
        {shouldRenderAsElement ? (
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
    </div>
  );
};

export default ProfileDetailRow;