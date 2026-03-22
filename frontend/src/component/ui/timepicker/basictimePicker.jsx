import { Controller, useFormContext } from "react-hook-form";

// ─── BasicTimePicker ──────────────────────────────────────────────────────────
// AmniCare: MUI x-date-pickers TimePicker + Controller
// EduAdmit: Native HTML <input type="time"> + react-hook-form Controller
//
// Fix: removed duplicate onBlur — destructure field.onBlur out and call
//      it manually inside a single onBlur handler (same fix as TextField)
//
// Value format: stored as "HH:mm:ss" string (same as AmniCare)
// ─────────────────────────────────────────────────────────────────────────────

export default function BasicTimePicker({
  name,
  label,
  required = false,
  disabled = false,
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const error = !!fieldState.error;

        // Destructure onBlur so we don't spread it AND set it explicitly
        const { onBlur: fieldOnBlur, ...restField } = field;

        // Convert "HH:mm:ss" → "HH:mm" for the native time input
        const inputValue = field.value && field.value !== ""
          ? String(field.value).slice(0, 5)
          : "";

        return (
          <div>
            {/* Label */}
            <label
              htmlFor={`tp-${name}`}
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "#475569",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.3px",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {label}
              {required && <span style={{ color: "#dc3545", marginLeft: 4 }}>*</span>}
            </label>

            {/* Time input — single onBlur handler, no duplicate */}
            <input
              type="time"
              id={`tp-${name}`}
              name={restField.name}
              ref={restField.ref}
              value={inputValue}
              disabled={disabled}
              required={required}
              onChange={e => {
                const val = e.target.value;
                // Store as "HH:mm:ss" — same format as AmniCare's value.format("HH:mm:ss")
                field.onChange(val ? `${val}:00` : "");
              }}
              onBlur={e => {
                // Single combined handler — no duplicate attribute
                fieldOnBlur();
                e.target.style.borderColor = error ? "#dc3545" : "#e2e8f0";
              }}
              onFocus={e => {
                e.target.style.borderColor = error ? "#dc3545" : "#1a6fa8";
              }}
              style={{
                width: "100%",
                height: 42,
                padding: "0 12px",
                border: `1.5px solid ${error ? "#dc3545" : "#e2e8f0"}`,
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "'Outfit', sans-serif",
                color: "#1e293b",
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
                cursor: disabled ? "not-allowed" : "auto",
              }}
            />

            {/* Error message */}
            {error && (
              <div style={{ fontSize: 12, marginTop: 4, color: "#dc3545" }}>
                {fieldState.error.message}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}