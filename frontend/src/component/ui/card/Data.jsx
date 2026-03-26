import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";

// ─── DataCard ─────────────────────────────────────────────────────────────────
// Refined healthcare/education patient card
// ─────────────────────────────────────────────────────────────────────────────

const formatPhoneNumber = (phone = "") => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10)
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  return phone;
};

// Deterministic avatar color from name
const getAvatarColor = (name = "") => {
  const palettes = [
    { bg: "linear-gradient(140deg, #1e6fd9 0%, #0f4fa0 100%)", text: "#fff" },
    { bg: "linear-gradient(140deg, #0e9f6e 0%, #057a55 100%)", text: "#fff" },
    { bg: "linear-gradient(140deg, #7c3aed 0%, #5b21b6 100%)", text: "#fff" },
    { bg: "linear-gradient(140deg, #e05c1a 0%, #b84309 100%)", text: "#fff" },
    { bg: "linear-gradient(140deg, #0891b2 0%, #0369a1 100%)", text: "#fff" },
  ];
  const idx = name.charCodeAt(0) % palettes.length;
  return palettes[idx];
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

  .dc-wrap {
    font-family: 'Outfit', sans-serif;
    background: #ffffff;
    border-radius: 16px;
    border: 1.5px solid #e8edf4;
    overflow: hidden;
    transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
    position: relative;
  }
  .dc-wrap:hover {
    box-shadow: 0 4px 12px rgba(15,52,96,0.08), 0 12px 36px rgba(15,52,96,0.1);
    transform: translateY(-2px);
    border-color: #d0daea;
  }

  /* Status accent bar at top */
  .dc-accent-bar {
    height: 3.5px;
    width: 100%;
  }

  .dc-inner {
    padding: 18px 20px 16px;
  }

  /* Top row: avatar + identity + menu */
  .dc-top {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  /* Avatar */
  .dc-avatar {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    font-weight: 700;
    flex-shrink: 0;
    letter-spacing: -0.5px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  .dc-identity {
    flex: 1;
    min-width: 0;
  }
  .dc-name {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: -0.015em;
    line-height: 1.3;
    margin: 0 0 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dc-meta {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 400;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .dc-meta-sep { color: #cbd5e1; }

  /* Menu */
  .dc-menu-wrap {
    position: relative;
    flex-shrink: 0;
  }
  .dc-menu-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    padding: 4px 5px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    transition: background 0.15s, color 0.15s;
    line-height: 1;
  }
  .dc-menu-btn:hover {
    background: #f1f5f9;
    color: #475569;
  }
  .dc-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(15,52,96,0.12), 0 1px 4px rgba(0,0,0,0.06);
    min-width: 168px;
    z-index: 200;
    padding: 5px;
    animation: dc-pop 0.14s ease;
  }
  @keyframes dc-pop {
    from { opacity: 0; transform: scale(0.94) translateY(-4px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  .dc-dd-item {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 8px 10px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #334155;
    transition: background 0.12s, color 0.12s;
    text-align: left;
  }
  .dc-dd-item:hover { background: #f8fafc; color: #0f172a; }
  .dc-dd-item.danger { color: #dc2626; }
  .dc-dd-item.danger:hover { background: #fef2f2; }
  .dc-dd-sep {
    height: 1px;
    background: #f1f5f9;
    margin: 4px 0;
  }

  /* Divider */
  .dc-divider {
    height: 1px;
    background: #f1f5f9;
    margin: 14px 0;
  }

  /* Contact row */
  .dc-contacts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;
  }
  .dc-contact-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #64748b;
    min-width: 0;
  }
  .dc-contact-icon {
    color: #1e6fd9;
    flex-shrink: 0;
    opacity: 0.85;
  }
  .dc-contact-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  /* Footer: tags + hours */
  .dc-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .dc-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
  }
  .dc-tag {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 99px;
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e2e8f0;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .dc-tag-active {
    background: #f0fdf4;
    color: #15803d;
    border-color: #86efac;
  }
  .dc-tag-inactive {
    background: #fef2f2;
    color: #b91c1c;
    border-color: #fca5a5;
  }

  /* Hours bar */
  .dc-hours {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
  .dc-hours-label {
    font-size: 11.5px;
    color: #94a3b8;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .dc-hours-val {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
  }
  .dc-hours-val span { color: #94a3b8; font-weight: 400; }
  .dc-progress-track {
    width: 80px;
    height: 5px;
    background: #e8edf4;
    border-radius: 99px;
    overflow: hidden;
  }
  .dc-progress-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.4s ease;
  }
`;

const IconEdit = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={14}
    height={14}
  >
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconView = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={14}
    height={14}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx={12} cy={12} r={3} />
  </svg>
);
const IconDeactivate = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={14}
    height={14}
  >
    <circle cx={12} cy={12} r={10} />
    <line x1={8} y1={12} x2={16} y2={12} />
  </svg>
);
const IconDelete = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={14}
    height={14}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);
const IconMail = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={13}
    height={13}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconPhone = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={13}
    height={13}
  >
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const IconPin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    width={13}
    height={13}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx={12} cy={10} r={3} />
  </svg>
);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const isActive = status === "Active";
  const avatarColor = getAvatarColor(name || "");

  const pct =
    hoursTotal > 0 ? Math.min((hoursUsed / hoursTotal) * 100, 100) : 0;
  const progressColor =
    pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#1e6fd9";

  const accentColor = isActive ? "#22c55e" : "#f87171";

  return (
    <>
      <style>{STYLES}</style>
      <div className="dc-wrap">
        {/* Status accent bar */}
        <div className="dc-accent-bar" style={{ background: accentColor }} />

        <div className="dc-inner">
          {/* Top: avatar + name + menu */}
          <div className="dc-top">
            <div
              className="dc-avatar"
              style={{ background: avatarColor.bg, color: avatarColor.text }}
            >
              {initial}
            </div>

            <div className="dc-identity">
              <h6 className="dc-name">{name}</h6>
              <div className="dc-meta">
                <span>DOB: {dob ? dayjs(dob).format("MM/DD/YYYY") : "—"}</span>
                <span className="dc-meta-sep">·</span>
                <span>ID: {id}</span>
                {gender && (
                  <>
                    <span className="dc-meta-sep">·</span>
                    <span>{gender}</span>
                  </>
                )}
              </div>
            </div>

            {/* Three-dot menu */}
            <div className="dc-menu-wrap" ref={menuRef}>
              <button
                className="dc-menu-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Actions"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width={17}
                  height={17}
                >
                  <circle cx={12} cy={5} r={1.6} />
                  <circle cx={12} cy={12} r={1.6} />
                  <circle cx={12} cy={19} r={1.6} />
                </svg>
              </button>

              {menuOpen && (
                <div className="dc-dropdown">
                  {onView && (
                    <button
                      className="dc-dd-item"
                      onClick={() => {
                        setMenuOpen(false);
                        onView();
                      }}
                    >
                      <IconView /> View profile
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="dc-dd-item"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit();
                      }}
                    >
                      <IconEdit /> Edit
                    </button>
                  )}
                  {(onView || onEdit) && (onDeactivate || onDelete) && (
                    <div className="dc-dd-sep" />
                  )}
                  {onDeactivate && (
                    <button
                      className="dc-dd-item"
                      onClick={() => {
                        setMenuOpen(false);
                        onDeactivate();
                      }}
                    >
                      <IconDeactivate /> Deactivate
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="dc-dd-item danger"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                      }}
                    >
                      <IconDelete /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="dc-divider" />

          {/* Contact info */}
          <div className="dc-contacts">
            {mail && (
              <span className="dc-contact-item">
                <span className="dc-contact-icon">
                  <IconMail />
                </span>
                <span className="dc-contact-text">{mail}</span>
              </span>
            )}
            {phone && (
              <span className="dc-contact-item">
                <span className="dc-contact-icon">
                  <IconPhone />
                </span>
                <span className="dc-contact-text">
                  {formatPhoneNumber(phone)}
                </span>
              </span>
            )}
            {address && (
              <span className="dc-contact-item">
                <span className="dc-contact-icon">
                  <IconPin />
                </span>
                <span className="dc-contact-text">{address}</span>
              </span>
            )}
          </div>

          {/* Footer: tags left, hours right */}
          <div className="dc-footer">
            <div className="dc-tags">
              {program?.map((p) => (
                <span
                  key={p?.providerTypeId || Math.random()}
                  className="dc-tag"
                >
                  {p?.typeName || "Home Care"}
                </span>
              ))}
              <span
                className={`dc-tag ${isActive ? "dc-tag-active" : "dc-tag-inactive"}`}
              >
                {status}
              </span>
            </div>

            {hoursTotal > 0 && (
              <div className="dc-hours">
                <span className="dc-hours-label">Hours</span>
                <span className="dc-hours-val">
                  {hoursUsed} <span>/ {hoursTotal}</span>
                </span>
                <div className="dc-progress-track">
                  <div
                    className="dc-progress-fill"
                    style={{ width: `${pct}%`, background: progressColor }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DataCard;
