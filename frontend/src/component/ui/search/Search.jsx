// ─── Search ───────────────────────────────────────────────────────────────────
// AmniCare: MUI TextField + InputAdornment + SearchIcon
// EduAdmit: Bootstrap input with inline SVG search icon
// ─────────────────────────────────────────────────────────────────────────────

export default function Search({
    value,
    onChange,
    placeholder = "Search…",
    width       = "auto",
  }) {
    const handleChange = (e) => {
      onChange(e.target.value.trim());
    };
  
    return (
      <div style={{ width, position: "relative" }}>
        {/* Search icon */}
        <svg
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} width={15} height={15}
        >
          <circle cx={11} cy={11} r={8} />
          <line x1={21} y1={21} x2={16.65} y2={16.65} />
        </svg>
  
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            height: 36,
            paddingLeft: 32,
            paddingRight: 12,
            border: "1.5px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            color: "#1e293b",
            background: "#f8fafc",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={e => (e.target.style.borderColor = "#1a6fa8")}
          onBlur={e  => (e.target.style.borderColor = "#e2e8f0")}
        />
      </div>
    );
  }