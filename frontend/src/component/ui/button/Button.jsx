const VARIANT_STYLES = {
  contained: {
    background: "#0f2044",
    color: "#ffffff",
    border: "1px solid #0f2044",
    boxShadow: "0 4px 14px rgba(15,32,68,.18)",
  },
  primary: {
    background: "#0f2044",
    color: "#ffffff",
    border: "1px solid #0f2044",
    boxShadow: "0 4px 14px rgba(15,32,68,.18)",
  },
  outlined: {
    background: "#ffffff",
    color: "#0f2044",
    border: "1.5px solid #e2e8f4",
  },
  outline: {
    background: "#ffffff",
    color: "#0f2044",
    border: "1.5px solid #e2e8f4",
  },
  text: {
    background: "transparent",
    color: "#0f2044",
    border: "none",
  },
  danger: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    boxShadow: "none",
  },
  ghost: {
    background: "rgba(255,255,255,.14)",
    color: "#ffffff",
    border: "1.5px solid rgba(255,255,255,.28)",
    boxShadow: "none",
  },
  icon: {
    background: "transparent",
    color: "#0f2044",
    border: "none",
    boxShadow: "none",
  },
};

const SIZE_STYLES = {
  small: {
    height: 30,
    padding: "0 10px",
    fontSize: 12.5,
    borderRadius: 7,
  },
  sm: {
    height: 30,
    padding: "0 10px",
    fontSize: 12.5,
    borderRadius: 7,
  },
  medium: {
    height: 42,
    padding: "0 18px",
    fontSize: 13.5,
    borderRadius: 9,
  },
  md: {
    height: 42,
    padding: "0 18px",
    fontSize: 13.5,
    borderRadius: 9,
  },
  large: {
    height: 48,
    padding: "0 22px",
    fontSize: 14.5,
    borderRadius: 10,
  },
  lg: {
    height: 48,
    padding: "0 22px",
    fontSize: 14.5,
    borderRadius: 10,
  },
  icon: {
    width: 34,
    height: 34,
    padding: 0,
    borderRadius: "50%",
    fontSize: 18,
  },
};

const Button = ({
  variant = "contained",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  children,
  className = "",
  style = {},
  type = "button",
  ...props
}) => {
  const resolvedVariant = VARIANT_STYLES[variant] ? variant : "contained";
  const resolvedSize = SIZE_STYLES[size] ? size : "medium";
  const variantStyle = VARIANT_STYLES[resolvedVariant];
  const sizeStyle = SIZE_STYLES[resolvedSize];
  const isIcon = resolvedSize === "icon" || resolvedVariant === "icon";

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...variantStyle,
        ...sizeStyle,
        width: fullWidth ? "100%" : sizeStyle.width,
        minWidth: isIcon ? 34 : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        textTransform: "none",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        lineHeight: 1,
        transition: "transform .15s ease, opacity .15s ease, background-color .15s ease, box-shadow .15s ease",
        opacity: disabled || loading ? 0.72 : 1,
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            display: "inline-block",
            animation: "buttonSpin 0.8s linear infinite",
          }}
        />
      )}
      {children}
      <style>{`
        @keyframes buttonSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;
