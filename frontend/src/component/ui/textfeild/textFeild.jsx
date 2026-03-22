import { useState, forwardRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";

// ─── TextField ────────────────────────────────────────────────────────────────
// Fix: removed duplicate onBlur — field.onBlur is already spread via {...field}
// ─────────────────────────────────────────────────────────────────────────────

const EyeIcon = ({ open }) => open ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx={12} cy={12} r={3} />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1={1} y1={1} x2={23} y2={23} />
  </svg>
);

const getInputStyle = (error) => ({
  width: "100%",
  height: 42,
  padding: "0 14px",
  border: `1.5px solid ${error ? "#dc3545" : "#e2e8f0"}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "'Outfit', sans-serif",
  color: "#1e293b",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
});

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#475569",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.3px",
  fontFamily: "'Outfit', sans-serif",
};

const TextField = forwardRef(({
  name,
  label,
  type          = "text",
  required      = false,
  disabled      = false,
  placeholder   = "",
  isPhoneNumber = false,
  helperText,
}, ref) => {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputId = `tf-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const error  = !!fieldState.error;
        const errMsg = fieldState.error?.message;

        // ── Phone number with mask ────────────────────────────────────────
        if (isPhoneNumber) {
          return (
            <div>
              {label && (
                <label htmlFor={inputId} style={labelStyle}>
                  {label}{required && <span style={{ color: "#dc3545", marginLeft: 4 }}>*</span>}
                </label>
              )}
              <PatternFormat
                id={inputId}
                value={field.value || ""}
                format="(###) ###-####"
                mask="_"
                type="tel"
                getInputRef={ref || field.ref}
                onValueChange={values => field.onChange(values.value)}
                onBlur={field.onBlur}
                placeholder={placeholder || "(___) ___-____"}
                disabled={disabled}
                required={required}
                style={getInputStyle(error)}
                onFocus={e  => (e.target.style.borderColor = error ? "#dc3545" : "#1a6fa8")}
              />
              {(errMsg || helperText) && (
                <div style={{ fontSize: 12, marginTop: 4, color: error ? "#dc3545" : "#94a3b8" }}>
                  {errMsg || helperText}
                </div>
              )}
            </div>
          );
        }

        // ── Standard input ────────────────────────────────────────────────
        // Destructure onBlur out of field so we can handle it manually
        // This prevents the duplicate onBlur attribute error (ts 17001)
        const { onBlur: fieldOnBlur, ...restField } = field;

        return (
          <div>
            {label && (
              <label htmlFor={inputId} style={labelStyle}>
                {label}{required && <span style={{ color: "#dc3545", marginLeft: 4 }}>*</span>}
              </label>
            )}

            <div style={{ position: "relative" }}>
              <input
                {...restField}                  // spreads onChange, value, name, ref — NO onBlur
                id={inputId}
                ref={ref || field.ref}
                type={isPassword ? (showPassword ? "text" : "password") : type}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                value={field.value ?? ""}
                onChange={e => {
                  const val = e.target.value;
                  if (type === "number" && val === "") field.onChange(undefined);
                  else field.onChange(val);
                }}
                onBlur={e => {                  // single explicit onBlur — no duplicate
                  fieldOnBlur();
                  e.target.style.borderColor = error ? "#dc3545" : "#e2e8f0";
                }}
                onFocus={e => (e.target.style.borderColor = error ? "#dc3545" : "#1a6fa8")}
                style={{
                  ...getInputStyle(error),
                  paddingRight: isPassword ? 42 : 14,
                }}
              />

              {/* Password show/hide toggle */}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  onMouseDown={e => e.preventDefault()}
                  aria-label="toggle password visibility"
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", color: "#94a3b8",
                    display: "flex", alignItems: "center", padding: 0,
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              )}
            </div>

            {(errMsg || helperText) && (
              <div style={{ fontSize: 12, marginTop: 4, color: error ? "#dc3545" : "#94a3b8" }}>
                {errMsg || helperText}
              </div>
            )}
          </div>
        );
      }}
    />
  );
});

TextField.displayName = "TextField";
export default TextField;