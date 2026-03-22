// ─── CardSkeleton ─────────────────────────────────────────────────────────────
// AmniCare: MUI Card + CardHeader + Skeleton + useMediaQuery
// EduAdmit: Bootstrap card + CSS shimmer rows
// ─────────────────────────────────────────────────────────────────────────────

const shimmer = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
  borderRadius: 4,
};

const CardSkeleton = ({
  showHeader    = true,
  contentLines  = 12,
  elevation     = 1,
  variant       = "elevation",
}) => {
  const isOutlined  = variant === "outlined";
  const shadowStyle = isOutlined ? {} : elevation > 0
    ? { boxShadow: "0 1px 4px rgba(0,0,0,0.08)" } : {};

  return (
    <div
      className={`card h-100 ${isOutlined ? "border" : "border-0"}`}
      style={{ borderRadius: 10, ...shadowStyle }}
    >
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {showHeader && (
        <>
          <div className="card-header bg-white px-3 py-3" style={{ borderBottom: "1px solid #f0f3f7" }}>
            {/* Title skeleton */}
            <div style={{ ...shimmer, height: 22, width: "40%", marginBottom: 8 }} />
            {/* Subtitle skeleton */}
            <div style={{ ...shimmer, height: 16, width: "60%" }} />
          </div>
        </>
      )}

      <div className="card-body p-3">
        {Array.from({ length: contentLines }).map((_, index) => (
          <div
            key={index}
            style={{
              ...shimmer,
              height: 28,
              width: index === contentLines - 1 ? "80%" : "100%",
              marginBottom: 8,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardSkeleton;