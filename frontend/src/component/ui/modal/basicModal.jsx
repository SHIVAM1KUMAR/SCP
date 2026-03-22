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

const MAX_WIDTH_CLASS = {
  xs: "modal-dialog-xs",   // custom, see style below
  sm: "modal-sm",
  md: "",                  // Bootstrap default (~500px)
  lg: "modal-lg",
  xl: "modal-xl",
};

// xs is not a Bootstrap size — we handle it with inline max-width
const XS_STYLE = { maxWidth: 320 };

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

  const dialogClass = MAX_WIDTH_CLASS[maxWidth] || "";
  const widthStyle  = maxWidth === "xs" ? XS_STYLE : {};
  const fullWidthStyle = fullWidth ? { width: "100%" } : {};

  const modal = (
    <>
      {/* Backdrop — clicking it does NOT close (AmniCare backdropClick prevention) */}
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 1300,
        }}
      />

      {/* Modal wrapper — centres the dialog */}
      <div
        style={{
          position:       "fixed",
          inset:          0,
          zIndex:         1301,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "16px",
          overflowY:      "auto",
        }}
      >
        <div
          className={`modal-dialog ${dialogClass} m-0`}
          style={{ ...widthStyle, ...fullWidthStyle, fontFamily: "'Outfit', sans-serif" }}
          // Stop clicks inside from bubbling to backdrop
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="modal-content"
            style={{ borderRadius: 12, border: "none", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}
          >

            {/* ── Header ── */}
            {title && (
              <div
                className="modal-header"
                style={{ padding: "16px 20px", borderBottom: "1px solid #e5e9f0" }}
              >
                <h5
                  className="modal-title fw-semibold mb-0"
                  style={{ fontSize: 17, color: "#1e293b" }}
                >
                  {title}
                </h5>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", padding: "4px 6px",
                    color: "#94a3b8", fontSize: 20,
                    lineHeight: 1, borderRadius: 6,
                    display: "flex", alignItems: "center",
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            )}

            {/* ── Content (dividers = border top/bottom) ── */}
            <div
              className="modal-body"
              style={{
                padding:      "20px",
                borderTop:    title   ? "none" : "1px solid #e5e9f0",
                borderBottom: actions ? "1px solid #e5e9f0" : "none",
                overflowY:    "auto",
                maxHeight:    "70vh",
              }}
            >
              {children}
            </div>

            {/* ── Footer / Actions ── */}
            {actions && (
              <div
                className="modal-footer"
                style={{ padding: "12px 20px", borderTop: "1px solid #e5e9f0" }}
              >
                {actions}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );

  // Render into document.body via portal (same as MUI Dialog)
  return createPortal(modal, document.body);
}