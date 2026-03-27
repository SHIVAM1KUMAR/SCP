import { useEffect } from "react";
import { createPortal } from "react-dom";

// ─── BasicModal ───────────────────────────────────────────────────────────────
// AmniCare: MUI Dialog + DialogTitle + DialogContent + DialogActions
// EduAdmit: Bootstrap modal rendered via React portal
//
// Key behaviour preserved from AmniCare:
//   - backdropClick does NOT close (disableScrollLock + reason check)
//   - dividers on content (border-top/bottom)
//   - maxWidth maps to Bootstrap modal-sm/md/lg/xl
//   - ESC key closes (unless you remove the keydown listener)
// ─────────────────────────────────────────────────────────────────────────────

const MAX_WIDTH_PX = {
  xs: 320,
  sm: 400,
  md: 500,
  lg: 800,
  xl: 1140,
};

export default function BasicModal({
  open,
  title,
  onClose,
  children,
  actions,
  maxWidth  = "sm",
  fullWidth = true,
}) {
  // Lock body scroll when open (replaces MUI disableScrollLock=false behaviour)
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ESC key closes
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const parsedMaxWidth = typeof maxWidth === "number"
    ? maxWidth
    : MAX_WIDTH_PX[maxWidth] || 500;
  const fullWidthStyle = fullWidth ? { width: "100%" } : {};

  const modal = (
    <>
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes backdropFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      {/* Backdrop — clicking it does NOT close (AmniCare backdropClick prevention) */}
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 9999, // ensures absolute top priority
          animation: "backdropFadeIn 0.3s ease-out forwards",
        }}
      />

      {/* Modal wrapper — centres the dialog */}
        <div
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         10000, // strictly over 9999
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "16px",
            overflow:       "hidden",
          }}
          onClick={onClose}
        >
        <div
          style={{ 
            background: "#fff",
            borderRadius: 16, 
            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            maxWidth: parsedMaxWidth,
            ...fullWidthStyle, 
            fontFamily: "'Outfit', sans-serif",
            animation: "modalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          {title && (
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 style={{ fontSize: 18, color: "#0f172a", margin: 0, fontWeight: 700, letterSpacing: "-0.3px" }}>
                {title}
              </h5>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  cursor: "pointer", padding: "6px",
                  color: "#64748b", fontSize: 18,
                  lineHeight: 1, borderRadius: 8,
                  display: "flex", alignItems: "center",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Content (dividers = border top/bottom) ── */}
          <div style={{
            padding:      "24px",
            borderTop:    title   ? "none" : "1px solid #f1f5f9",
            borderBottom: actions ? "1px solid #f1f5f9" : "none",
            overflowY:    "hidden",
            maxHeight:    "none",
          }}>
            {children}
          </div>

          {/* ── Footer / Actions ── */}
          {actions && (
            <div style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderRadius: "0 0 16px 16px" }}>
              {actions}
            </div>
          )}

        </div>
      </div>
    </>
  );

  // Render into document.body via portal (same as MUI Dialog)
  return createPortal(modal, document.body);
}
