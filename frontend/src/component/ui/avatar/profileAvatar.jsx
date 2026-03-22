// ─── ProfileAvatar ────────────────────────────────────────────────────────────
// AmniCare: MUI Avatar + Skeleton
// EduAdmit: Plain div circle + CSS shimmer skeleton
// ─────────────────────────────────────────────────────────────────────────────

const ProfileAvatar = ({
    firstName,
    lastName,
    size = 180,
    fontSize = "3.5rem",
    bgColor = "#1a6fa8",
    url,
    isLoading = false,
  }) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial  = lastName?.charAt(0)?.toUpperCase()  || "";
    const initials     = `${firstInitial}${lastInitial}`;
  
    return (
      <div className="d-flex justify-content-center align-items-center py-4 px-3">
        {isLoading ? (
          // Skeleton circle (replaces MUI Skeleton variant="circular")
          <div
            style={{
              width: size, height: size,
              borderRadius: "50%",
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }}
          />
        ) : url ? (
          // Image avatar
          <img
            src={url}
            alt={initials}
            style={{
              width: size, height: size,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          // Initials avatar
          <div
            style={{
              width: size, height: size,
              borderRadius: "50%",
              background: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}
  
        {/* Shimmer keyframe */}
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  };
  
  export default ProfileAvatar;