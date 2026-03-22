// ─── Button ───────────────────────────────────────────────────────────────────
// AmniCare: MUI Button with variant="contained" default + sx prop
// EduAdmit: Bootstrap btn wrapper with same variant logic
//
// variant: "contained" → btn-primary
//          "outlined"  → btn-outline-primary
//          "text"      → btn-link
// ─────────────────────────────────────────────────────────────────────────────

const VARIANT_CLASS = {
  contained: "btn-primary",
  outlined:  "btn-outline-primary",
  text:      "btn-link",
};

const SIZE_CLASS = {
  small:  "btn-sm",
  medium: "",
  large:  "btn-lg",
};

const Button = ({
  variant  = "contained",
  size     = "medium",
  color    = "primary",        // ignored — use variant/className to override
  disabled = false,
  onClick,
  children,
  className = "",
  style     = {},
  type      = "button",
  ...props
}) => {
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.contained;
  const sizeClass    = SIZE_CLASS[size]        || "";

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      style={{
        textTransform: "none",   // AmniCare had textTransform: "none"
        fontFamily: "'Outfit', sans-serif",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;