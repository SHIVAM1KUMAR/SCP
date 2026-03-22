import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";

// ─── DataCard ─────────────────────────────────────────────────────────────────
// AmniCare: MUI Card + Menu + Chip + Stack + Avatar
// EduAdmit: Bootstrap card + dropdown + badges + flexbox
// ─────────────────────────────────────────────────────────────────────────────

// Simple phone formatter (was imported from utils in AmniCare)
const formatPhoneNumber = (phone = "") => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10)
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  return phone;
};

const DataCard = ({
  name,
  dob,
  id,
  phone,
  mail,
  gender,
  address,
  hoursUsed,
  hoursTotal,
  status,
  program = [],
  onEdit,
  onDeactivate,
  onDelete,
  onView,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const isActive = status === "Active";

  return (
    <div
      className="card border rounded-3"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="card-body p-3">
        <div className="d-flex gap-3 align-items-start">

          {/* Avatar */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 48, height: 48,
              background: "linear-gradient(135deg, #1a6fa8, #0d4f82)",
              color: "#fff", fontWeight: 700, fontSize: 18,
            }}
          >
            {initial}
          </div>

          {/* Content */}
          <div className="flex-grow-1 w-100">

            {/* Header row */}
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="mb-0 fw-semibold" style={{ fontSize: 15, color: "#1e293b" }}>
                  {name}
                </h6>
                <small className="text-muted">
                  DOB: {dob ? dayjs(dob).format("MM/DD/YYYY") : "—"} &bull; ID: {id}
                </small>
              </div>

              {/* Three-dot menu */}
              <div className="position-relative" ref={menuRef}>
                <button
                  className="btn btn-sm btn-light border-0 p-1"
                  onClick={() => setMenuOpen((o) => !o)}
                  style={{ lineHeight: 1 }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
                    <circle cx={12} cy={5}  r={1.5} />
                    <circle cx={12} cy={12} r={1.5} />
                    <circle cx={12} cy={19} r={1.5} />
                  </svg>
                </button>

                {menuOpen && (
                  <div
                    className="position-absolute bg-white border rounded-3 shadow-sm py-1"
                    style={{ right: 0, top: "110%", minWidth: 160, zIndex: 100 }}
                  >
                    {onEdit && (
                      <button className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => { setMenuOpen(false); onEdit(); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    {onView && (
                      <button className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => { setMenuOpen(false); onView(); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx={12} cy={12} r={3} />
                        </svg>
                        View
                      </button>
                    )}
                    {onDeactivate && (
                      <button className="dropdown-item d-flex align-items-center gap-2 px-3 py-2"
                        onClick={() => { setMenuOpen(false); onDeactivate(); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
                          <circle cx={12} cy={12} r={10} />
                          <line x1={8} y1={12} x2={16} y2={12} />
                        </svg>
                        Deactivate
                      </button>
                    )}
                    {onDelete && (
                      <button className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger"
                        onClick={() => { setMenuOpen(false); onDelete(); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contact row */}
            <div className="d-flex flex-wrap gap-3 mt-2">
              <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 13 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a6fa8" strokeWidth={2} width={14} height={14}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {mail || "—"}
              </span>
              <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 13 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#1a6fa8" strokeWidth={2} width={14} height={14}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 0117 1.18 2 2 0 0119 3.2v3.06c0 1.1-.9 2-2 2h-2.5a2 2 0 01-2-1.72A12 12 0 008 5.16" />
                </svg>
                {formatPhoneNumber(phone) || "—"}
              </span>
              {address && (
                <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 13, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx={12} cy={10} r={3} />
                  </svg>
                  {address}
                </span>
              )}
            </div>

            {/* Chips + Hours */}
            <div className="d-flex flex-wrap gap-2 align-items-center mt-2">
              {program?.map((p) => (
                <span key={p?.providerTypeId || Math.random()} className="badge border text-secondary fw-normal" style={{ fontSize: 11, background: "#f8fafc" }}>
                  {p?.typeName || "Home Care"}
                </span>
              ))}

              {gender && (
                <span className="badge border text-secondary fw-normal" style={{ fontSize: 11, background: "#f8fafc" }}>
                  {gender}
                </span>
              )}

              <span
                className={`badge border fw-normal`}
                style={{
                  fontSize: 11,
                  background: isActive ? "#f0fdf4" : "#fff5f5",
                  color:      isActive ? "#166534" : "#991b1b",
                  border:     `1px solid ${isActive ? "#86efac" : "#fca5a5"}`,
                }}
              >
                {status}
              </span>

              <span className="d-flex align-items-center gap-1" style={{ fontSize: 13, color: "#52637a" }}>
                Hours:&nbsp;<strong>{hoursUsed}/{hoursTotal}</strong>
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCard;