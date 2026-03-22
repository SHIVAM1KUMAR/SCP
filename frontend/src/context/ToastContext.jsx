import { createContext, useContext, useState, useCallback } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Types & colours ─────────────────────────────────────────────────────────
const TOAST_STYLES = {
  success: { bg: "#f0fdf4", border: "#86efac", color: "#166534", icon: "✅" },
  error:   { bg: "#fff5f5", border: "#fca5a5", color: "#991b1b", icon: "❌" },
  warning: { bg: "#fefce8", border: "#fde047", color: "#854d0e", icon: "⚠️" },
  info:    { bg: "#e8f4fd", border: "#93c5fd", color: "#1e40af", icon: "ℹ️" },
};

// ─── Provider — wrap your App with this ──────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* ── Toast container ── */}
      <div style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}>
        {toasts.map(toast => {
          const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <div
              key={toast.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 10,
                padding: "12px 16px",
                minWidth: 260,
                maxWidth: 380,
                boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                pointerEvents: "all",
                animation: "slideIn 0.25s ease",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
              <span style={{ fontSize: 13.5, color: s.color, fontWeight: 500, flex: 1, lineHeight: 1.4 }}>
                {toast.message}
              </span>
              <button
                onClick={() => remove(toast.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: s.color, opacity: 0.6, fontSize: 16,
                  padding: "0 2px", lineHeight: 1, flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// ─── Hook — use anywhere inside ToastProvider ─────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.show; // returns: show(message, type, duration?)
}