// ─── FormSkeleton ─────────────────────────────────────────────────────────────
// AmniCare: MUI Grid (2 cols) + Skeleton variant="rounded"
// EduAdmit: Bootstrap row/col-md-6 + CSS shimmer
// ─────────────────────────────────────────────────────────────────────────────

const shimmer = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: 8,
  };
  
  export default function FormSkeleton({ rows = 4, rowHeight = 50 }) {
    return (
      <div>
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
  
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="row g-2 mb-2">
            <div className="col-12 col-md-6">
              <div style={{ ...shimmer, height: rowHeight }} />
            </div>
            <div className="col-12 col-md-6">
              <div style={{ ...shimmer, height: rowHeight }} />
            </div>
          </div>
        ))}
      </div>
    );
  }