// ─── TableSkeleton ────────────────────────────────────────────────────────────
// AmniCare: MUI Stack + Skeleton variant="rectangular" + useMediaQuery xl
// EduAdmit: CSS shimmer rows — same structure, no MUI needed
//
// Props match AmniCare exactly:
//   rows            — default 8 (15 on xl screens, auto-detected)
//   columns         — default 1
//   isHeader        — show header row, default true
//   containerHeight — outer height, default "100%"
// ─────────────────────────────────────────────────────────────────────────────

const HEADER_HEIGHT = 40;
const ROW_HEIGHT    = 40;

const shimmerBase = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
  borderRadius: 4,
};

const TableSkeleton = ({
  rows            = 8,
  columns         = 1,
  isHeader        = true,
  containerHeight = "100%",
}) => {
  // Mirror AmniCare's xl breakpoint behaviour: 15 rows on large screens
  const isXl     = window.innerWidth >= 1536;
  const totalRows = isXl ? 15 : rows;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: containerHeight }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header row */}
      {isHeader && (
        <div style={{ display: "flex", gap: 8, height: HEADER_HEIGHT }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} style={{ ...shimmerBase, flex: 1, height: HEADER_HEIGHT }} />
          ))}
        </div>
      )}

      {/* Data rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: totalRows }).map((_, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                style={{ ...shimmerBase, flex: 1, height: ROW_HEIGHT }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;