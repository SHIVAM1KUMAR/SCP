// ─── MainCard ─────────────────────────────────────────────────────────────────
// AmniCare: MUI Paper + Grid + Divider + Typography
// EduAdmit: Bootstrap card with row/col layout
// Used as the primary page-level container card.
// ─────────────────────────────────────────────────────────────────────────────

const MainCard = ({ title, subtitle, children, actions }) => {
    const hasHeader = title || subtitle || actions;
  
    return (
      <div
        className="card border"
        style={{
          borderRadius: 10,
          fontFamily: "'Outfit', sans-serif",
          borderColor: "#e5e9f0",
        }}
      >
        {hasHeader && (
          <>
            <div className="card-header bg-white px-3 py-2" style={{ borderBottom: "1px solid #e5e9f0" }}>
              <div className="row align-items-center g-2">
  
                {/* Title + Subtitle */}
                <div className="col-12 col-sm">
                  {title && (
                    typeof title === "string" || typeof title === "number"
                      ? <h4 className="mb-0 fw-bold" style={{ fontSize: 18, color: "#1e293b" }}>{title}</h4>
                      : title
                  )}
                  {subtitle && (
                    typeof subtitle === "string" || typeof subtitle === "number"
                      ? <small className="text-muted d-block mt-1">{subtitle}</small>
                      : subtitle
                  )}
                </div>
  
                {/* Actions */}
                {actions && (
                  <div className="col-12 col-sm-auto">
                    {actions}
                  </div>
                )}
              </div>
            </div>
  
            {/* Divider under header */}
            <hr className="m-0" style={{ borderColor: "#f0f3f7" }} />
          </>
        )}
  
        <div className="card-body p-3">
          {children}
        </div>
      </div>
    );
  };
  
  export default MainCard;