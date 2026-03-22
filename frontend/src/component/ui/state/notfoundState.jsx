// ─── NotFoundState ────────────────────────────────────────────────────────────
// AmniCare: MUI Paper + Typography color="error"
// EduAdmit: Bootstrap card + red title — default export matches AmniCare
// ─────────────────────────────────────────────────────────────────────────────

const NotFoundState = ({
    title       = "Not Found",
    description = "The requested record could not be found in the system.",
  }) => (
    <div style={{ padding: 24 }}>
      <div
        style={{
          padding: 48,
          textAlign: "center",
          border: "1px solid #e5e9f0",
          borderRadius: 10,
          fontFamily: "'Outfit', sans-serif",
          background: "#fff",
        }}
      >
        {/* Search-not-found icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fca5a5"
          strokeWidth={1.5}
          width={48}
          height={48}
          style={{ marginBottom: 12 }}
        >
          <circle cx={11} cy={11} r={8} />
          <line x1={21} y1={21} x2={16.65} y2={16.65} />
          <line x1={8} y1={8} x2={14} y2={14} />
        </svg>
  
        {/* color="error" → red title */}
        <h5 style={{ fontWeight: 600, fontSize: 20, color: "#e53e3e", marginBottom: 6 }}>
          {title}
        </h5>
  
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
  );
  
  export default NotFoundState;