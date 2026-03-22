// ─── NotAvailableState ────────────────────────────────────────────────────────
// AmniCare: MUI Paper + BlockOutlinedIcon + Typography
// EduAdmit: Bootstrap card + SVG block icon — default export matches AmniCare
// ─────────────────────────────────────────────────────────────────────────────

const NotAvailableState = ({
    title       = "Not Available",
    description = "This page is currently unavailable.",
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
        {/* BlockOutlined icon equivalent */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={1.5}
          width={48}
          height={48}
          style={{ marginBottom: 12 }}
        >
          <circle cx={12} cy={12} r={10} />
          <line x1={4.93} y1={4.93} x2={19.07} y2={19.07} />
        </svg>
  
        <h5 style={{ fontWeight: 600, fontSize: 20, color: "#1e293b", marginBottom: 6 }}>
          {title}
        </h5>
  
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
  );
  
  export default NotAvailableState;