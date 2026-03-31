export default function DeleteActionButton({
  loading = false,
  onClick,
  disabled = false,
  children = "Delete",
  width = 116,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width,
        height: 38,
        padding: "0 16px",
        borderRadius: 8,
        border: "none",
        background: "#dc2626",
        color: "#fff",
        fontWeight: 700,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        flexShrink: 0,
        opacity: disabled || loading ? 0.92 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      {loading ? (
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.35)",
            borderTopColor: "#ffffff",
            display: "inline-block",
            animation: "deleteActionSpin 0.75s linear infinite",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        />
      ) : (
        children
      )}
      <style>{`
        @keyframes deleteActionSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
