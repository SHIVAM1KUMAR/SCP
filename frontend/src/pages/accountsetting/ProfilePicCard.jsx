// ─── ProfilePicCard ───────────────────────────────────────────────────────────
// AmniCare: MUI Avatar + Badge + Skeleton + Stack + Typography
// EduAdmit: Plain div layout + CSS shimmer skeleton + SVG camera icon
//
// Props identical to AmniCare — drop-in replacement
// ─────────────────────────────────────────────────────────────────────────────

// Replaces AmniCare's getInitials util
const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  const shimmer = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: "50%",
  };
  
  const CameraIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx={12} cy={13} r={4} />
    </svg>
  );
  
  export default function ProfilePicCard({
    name,
    role,
    email,
    avatarUrl,
    isLoading   = false,
    fileInputRef,
    onAvatarClick,
    onAvatarChange,
  }) {
    const initials = getInitials(name);
  
    return (
      <>
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
  
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, fontFamily: "'Outfit', sans-serif" }}>
  
          {/* ── Avatar with camera badge ── */}
          <div style={{ position: "relative", display: "inline-block" }}>
  
            {isLoading ? (
              /* Skeleton circle */
              <div style={{ ...shimmer, width: 160, height: 160 }} />
            ) : avatarUrl ? (
              /* Profile image */
              <img
                src={avatarUrl}
                alt={name || "Profile"}
                style={{
                  width: 160, height: 160,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #e5e9f0",
                  display: "block",
                }}
              />
            ) : (
              /* Initials avatar */
              <div style={{
                width: 160, height: 160,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1a6fa8, #0d4f82)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "3rem", fontWeight: 700,
                border: "2px solid #e5e9f0",
                userSelect: "none",
              }}>
                {initials}
              </div>
            )}
  
            {/* Camera button — bottom-right badge (AmniCare: MUI Badge anchorOrigin bottom/right) */}
            <button
              onClick={onAvatarClick}
              disabled={isLoading}
              title="Change photo"
              style={{
                position: "absolute", bottom: 4, right: 4,
                width: 36, height: 36, borderRadius: "50%",
                background: "#fff", border: "1.5px solid #e5e9f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: isLoading ? "not-allowed" : "pointer",
                color: "#1a6fa8",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = "#e8f4fd"; }}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              <CameraIcon />
            </button>
          </div>
  
          {/* ── Name / role / email ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center" }}>
            {isLoading ? (
              <>
                <div style={{ ...shimmer, borderRadius: 6, width: 120, height: 24, marginBottom: 2 }} />
                <div style={{ ...shimmer, borderRadius: 6, width: 80,  height: 18 }} />
                <div style={{ ...shimmer, borderRadius: 6, width: 160, height: 16, marginTop: 2 }} />
              </>
            ) : (
              <>
                {/* Name — h5 equivalent */}
                <span style={{
                  fontSize: 20, fontWeight: 600, color: "#1e293b",
                  maxWidth: 250, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                  display: "block",
                }}>
                  {name || "User Name"}
                </span>
  
                {/* Role */}
                <span style={{
                  fontSize: 13, color: "#64748b",
                  maxWidth: 250, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                  display: "block",
                }}>
                  ({role || "Role"})
                </span>
  
                {/* Email */}
                <span style={{
                  fontSize: 12, color: "#94a3b8",
                  maxWidth: 250, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                  display: "block",
                }}>
                  {email || "email@example.com"}
                </span>
              </>
            )}
          </div>
  
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            style={{ display: "none" }}
          />
        </div>
      </>
    );
  }