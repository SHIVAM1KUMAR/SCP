import { useState, forwardRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";

const EyeIcon = ({ open }) => (open ? (
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
));

const getInputStyle = (hasError) => ({
  width: "100%",
  height: 42,
  padding: "0 14px",
  border: `1.5px solid ${hasError ? "#dc3545" : "#e2e8f0"}`,
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

function HelpText({ errorMessage, helperText }) {
  if (!errorMessage && !helperText) return null;
  return (
    <div style={{ fontSize: 12, marginTop: 4, color: errorMessage ? "#dc3545" : "#94a3b8" }}>
      {errorMessage || helperText}
    </div>
  );
}

const TextField = forwardRef(({
  name,
  label,
  type = "text",
  required = false,
  disabled = false,
  placeholder = "",
  isPhoneNumber = false,
  helperText,
  error,
  value,
  onChange,
  onBlur,
  onFocus,
  multiline = false,
  rows = 3,
  className = "",
  style = {},
}, ref) => {
  const formContext = useFormContext();
  const control = formContext?.control;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputId = `tf-${name || label || "field"}`;

  const renderStandard = ({
    currentValue,
    setValue,
    blur,
    focus,
    inputRef,
    errorMessage,
  }) => {
    const shared = {
      id: inputId,
      disabled,
      required,
      placeholder,
      className,
      style: {
        ...getInputStyle(!!errorMessage),
        ...style,
        paddingRight: isPassword ? 42 : undefined,
      },
      onFocus: (e) => {
        e.target.style.borderColor = errorMessage ? "#dc3545" : "#1a6fa8";
        focus?.(e);
      },
      onBlur: (e) => {
        blur?.(e);
        e.target.style.borderColor = errorMessage ? "#dc3545" : "#e2e8f0";
      },
    };

    if (multiline) {
      return (
        <div>
          {label && (
            <label htmlFor={inputId} style={labelStyle}>
              {label}{required && <span style={{ color: "#dc3545", marginLeft: 4 }}>*</span>}
            </label>
          )}
          <textarea
            {...shared}
            ref={inputRef || ref}
            rows={rows}
            value={currentValue ?? ""}
            onChange={(e) => {
              setValue(e.target.value);
              onChange?.(e);
            }}
            style={{
              ...shared.style,
              height: "auto",
              minHeight: rows * 24,
              paddingTop: 10,
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
          <HelpText errorMessage={errorMessage} helperText={helperText} />
        </div>
      );
    }

    return (
      <div>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}{required && <span style={{ color: "#dc3545", marginLeft: 4 }}>*</span>}
          </label>
        )}

        <div style={{ position: "relative" }}>
          <input
            {...shared}
            ref={inputRef || ref}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            value={currentValue ?? ""}
            onChange={(e) => {
              const next = type === "number" && e.target.value === "" ? "" : e.target.value;
              setValue(next);
              onChange?.(e);
            }}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              onMouseDown={(e) => e.preventDefault()}
              aria-label="toggle password visibility"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              <EyeIcon open={showPassword} />
            </button>
          )}
        </div>

        <HelpText errorMessage={errorMessage} helperText={helperText} />
      </div>
    );
  };

  if (name && control) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const errorMessage = fieldState.error?.message || error;

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
                  onValueChange={(values) => {
                    field.onChange(values.value);
                    onChange?.(values.value);
                  }}
                  onBlur={(e) => {
                    field.onBlur();
                    onBlur?.(e);
                  }}
                  placeholder={placeholder || "(___) ___-____"}
                  disabled={disabled}
                  required={required}
                  style={getInputStyle(!!errorMessage)}
                  onFocus={(e) => {
                    e.target.style.borderColor = errorMessage ? "#dc3545" : "#1a6fa8";
                    onFocus?.(e);
                  }}
                />
                <HelpText errorMessage={errorMessage} helperText={helperText} />
              </div>
            );
          }

          return renderStandard({
            currentValue: field.value,
            setValue: field.onChange,
            blur: (e) => {
              field.onBlur();
              onBlur?.(e);
            },
            focus: onFocus,
            inputRef: field.ref,
            errorMessage,
          });
        }}
      />
    );
  }

  return renderStandard({
    currentValue: value,
    setValue: () => {},
    blur: onBlur,
    focus: onFocus,
    inputRef: undefined,
    errorMessage: error,
  });
});

TextField.displayName = "TextField";
export default TextField;
