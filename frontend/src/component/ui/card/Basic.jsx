// ─── BasicCard ────────────────────────────────────────────────────────────────
// AmniCare: MUI Card + CardHeader + CardContent + Divider
// EduAdmit: Bootstrap card with header, divider, body
// ─────────────────────────────────────────────────────────────────────────────

const BasicCard = ({
    title,
    subtitle,
    children,
    elevation = 1,     // 0 = no shadow, 1 = light shadow
    variant   = "elevation",  // "elevation" | "outlined"
    actions,
  }) => {
    const isOutlined = variant === "outlined";
    const shadowStyle = isOutlined
      ? {}
      : elevation === 0
        ? {}
        : { boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };
  
    const hasHeader = title || subtitle || actions;
  
    return (
      <div
        className={`card h-100 ${isOutlined ? "border" : "border-0"}`}
        style={{
          borderRadius: 10,
          fontFamily: "'Outfit', sans-serif",
          ...shadowStyle,
        }}
      >
        {hasHeader && (
          <>
            <div className="card-header bg-white d-flex justify-content-between align-items-center px-3 py-2"
              style={{ borderBottom: "1px solid #f0f3f7" }}>
              <div>
                {title && (
                  <h5 className="mb-0 fw-semibold" style={{ fontSize: 15, color: "#1e293b" }}>
                    {title}
                  </h5>
                )}
                {subtitle && (
                  <small className="text-muted">{subtitle}</small>
                )}
              </div>
              {actions && <div>{actions}</div>}
            </div>
          </>
        )}
  
        <div className="card-body p-3">
          {typeof children === "string"
            ? <p className="mb-0">{children}</p>
            : children
          }
        </div>
      </div>
    );
  };
  
  export default BasicCard;