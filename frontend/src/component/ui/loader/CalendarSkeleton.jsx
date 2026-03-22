// ─── CalendarSkeleton ─────────────────────────────────────────────────────────
// AmniCare: MUI Grid + Skeleton (text / rounded variants)
// EduAdmit: CSS shimmer animation + plain grid
// ─────────────────────────────────────────────────────────────────────────────

const shimmer = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 4,
  };
  
  export default function CalendarSkeleton({ weeks = 5 }) {
    return (
      <div>
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
  
        {/* Weekday header row */}
        <div className="row g-1 mb-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ width: `${100 / 7}%`, padding: "0 2px" }}>
              <div style={{ ...shimmer, height: 30 }} />
            </div>
          ))}
        </div>
  
        {/* Calendar grid weeks × 7 days */}
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="d-flex g-1 mb-1" style={{ gap: 4 }}>
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div
                key={dayIndex}
                style={{
                  flex: 1,
                  border: "1px solid #eee",
                  borderRadius: 8,
                  height: 120,
                  padding: 8,
                }}
              >
                {/* Date number */}
                <div style={{ ...shimmer, width: 30, height: 18, marginBottom: 8 }} />
                {/* Event 1 */}
                <div style={{ ...shimmer, height: 20, marginBottom: 4 }} />
                {/* Event 2 — shorter */}
                <div style={{ ...shimmer, height: 20, width: "80%" }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }