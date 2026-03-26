// ─── MainCard ─────────────────────────────────────────────────────────────────
// Primary page-level container card — refined UI
// ─────────────────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

  .mc-wrap {
    font-family: 'Outfit', sans-serif;
    background: #ffffff;
    border-radius: 16px;
    border: 1.5px solid #e8edf4;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(15,52,96,0.05), 0 4px 20px rgba(15,52,96,0.06);
  }

  .mc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 18px 24px 16px;
    background: #ffffff;
    flex-wrap: wrap;
  }

  .mc-header-left {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  .mc-title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.25;
  }

  .mc-subtitle {
    font-size: 13px;
    color: #94a3b8;
    font-weight: 400;
    line-height: 1.4;
  }

  .mc-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .mc-divider {
    height: 1px;
    background: linear-gradient(90deg, #e8edf4 0%, #f8fafc 100%);
    margin: 0;
  }

  .mc-body {
    padding: 22px 24px;
  }

  /* Responsive: stack actions below title on very narrow screens */
  @media (max-width: 480px) {
    .mc-header { flex-direction: column; align-items: flex-start; }
    .mc-actions { width: 100%; }
  }
`;

const MainCard = ({ title, subtitle, children, actions }) => {
  const hasHeader = title || subtitle || actions;

  return (
    <>
      <style>{STYLES}</style>
      <div className="mc-wrap">
        {hasHeader && (
          <>
            <div className="mc-header">
              <div className="mc-header-left">
                {title &&
                  (typeof title === "string" || typeof title === "number" ? (
                    <h4 className="mc-title">{title}</h4>
                  ) : (
                    title
                  ))}
                {subtitle &&
                  (typeof subtitle === "string" ||
                  typeof subtitle === "number" ? (
                    <div className="mc-subtitle">{subtitle}</div>
                  ) : (
                    subtitle
                  ))}
              </div>

              {actions && <div className="mc-actions">{actions}</div>}
            </div>

            <div className="mc-divider" />
          </>
        )}

        <div className="mc-body">{children}</div>
      </div>
    </>
  );
};

export default MainCard;
