// ─── BasicCard ────────────────────────────────────────────────────────────────
// Refined, production-grade card component
// ─────────────────────────────────────────────────────────────────────────────

const BasicCard = ({
  title,
  subtitle,
  children,
  elevation = 1,
  variant = "elevation",
  actions,
  accent, // optional: "blue" | "green" | "amber" | "red" | "purple"
  badge, // optional: string shown as a small tag in the header
  loading = false,
}) => {
  const isOutlined = variant === "outlined";

  const accentMap = {
    blue: { bar: "#2563eb", badge: "#eff6ff", badgeText: "#1d4ed8" },
    green: { bar: "#16a34a", badge: "#f0fdf4", badgeText: "#15803d" },
    amber: { bar: "#d97706", badge: "#fffbeb", badgeText: "#b45309" },
    red: { bar: "#dc2626", badge: "#fef2f2", badgeText: "#b91c1c" },
    purple: { bar: "#7c3aed", badge: "#f5f3ff", badgeText: "#6d28d9" },
  };

  const ac = accent ? accentMap[accent] : null;
  const hasHeader = title || subtitle || actions || badge;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

        .bc-card {
          font-family: 'Outfit', sans-serif;
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          position: relative;
        }
        .bc-card.elevation-1 {
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
        }
        .bc-card.elevation-0 {
          box-shadow: none;
        }
        .bc-card.outlined {
          border: 1.5px solid #e8ecf2;
          box-shadow: none;
        }
        .bc-card:hover.elevation-1 {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.09);
          transform: translateY(-1px);
        }
        .bc-card-accent-bar {
          height: 3px;
          width: 100%;
        }
        .bc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px 20px 14px;
          border-bottom: 1px solid #f1f5f9;
          gap: 12px;
        }
        .bc-header-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .bc-header-top {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .bc-title {
          margin: 0;
          font-size: 14.5px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }
        .bc-subtitle {
          font-size: 12.5px;
          color: #94a3b8;
          font-weight: 400;
          line-height: 1.4;
          margin-top: 1px;
        }
        .bc-badge {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 99px;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .bc-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .bc-body {
          padding: 18px 20px;
        }
        .bc-body p {
          margin: 0;
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
        }

        /* Skeleton shimmer */
        .bc-skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e8edf4 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: bc-shimmer 1.4s ease-in-out infinite;
          border-radius: 6px;
        }
        @keyframes bc-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div
        className={`bc-card ${
          isOutlined
            ? "outlined"
            : elevation === 0
              ? "elevation-0"
              : "elevation-1"
        }`}
      >
        {/* Accent bar */}
        {ac && (
          <div className="bc-card-accent-bar" style={{ background: ac.bar }} />
        )}

        {/* Header */}
        {hasHeader && (
          <div className="bc-header">
            <div className="bc-header-left">
              <div className="bc-header-top">
                {title &&
                  (loading ? (
                    <div
                      className="bc-skeleton"
                      style={{ width: 140, height: 16 }}
                    />
                  ) : (
                    <h5 className="bc-title">{title}</h5>
                  ))}
                {badge && !loading && (
                  <span
                    className="bc-badge"
                    style={{
                      background: ac ? ac.badge : "#f1f5f9",
                      color: ac ? ac.badgeText : "#64748b",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </div>
              {subtitle &&
                (loading ? (
                  <div
                    className="bc-skeleton"
                    style={{ width: 100, height: 12, marginTop: 4 }}
                  />
                ) : (
                  <div className="bc-subtitle">{subtitle}</div>
                ))}
            </div>

            {actions && !loading && <div className="bc-actions">{actions}</div>}
          </div>
        )}

        {/* Body */}
        <div className="bc-body">
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                className="bc-skeleton"
                style={{ width: "100%", height: 14 }}
              />
              <div
                className="bc-skeleton"
                style={{ width: "85%", height: 14 }}
              />
              <div
                className="bc-skeleton"
                style={{ width: "60%", height: 14 }}
              />
            </div>
          ) : typeof children === "string" ? (
            <p>{children}</p>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
};

export default BasicCard;
