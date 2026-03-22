import { Controller, useFormContext } from "react-hook-form";
import dayjs from "dayjs";

// ─── BasicDateTimePicker ──────────────────────────────────────────────────────
// AmniCare: MUI x-date-pickers DateTimePicker + Controller
// EduAdmit: Native HTML <input type="datetime-local"> + react-hook-form Controller
//
// Value format: stored as ISO string (same as AmniCare: value.toISOString())
// ─────────────────────────────────────────────────────────────────────────────

// Convert ISO / any date string → "YYYY-MM-DDTHH:mm" for datetime-local input
const toLocalInputValue = (val) => {
  if (!val) return "";
  return dayjs(val).format("YYYY-MM-DDTHH:mm");
};

export default function BasicDateTimePicker({
  name,
  label,
  required      = false,
  disabled      = false,
  disableFuture = false,
  disablePast   = false,
  minDateTime,  // dayjs or ISO string
  maxDateTime,  // dayjs or ISO string
}) {
  const { control } = useFormContext();

  const now        = dayjs();
  const minStr     = disablePast
    ? (minDateTime ? dayjs(minDateTime).format("YYYY-MM-DDTHH:mm") : now.format("YYYY-MM-DDTHH:mm"))
    : (minDateTime ? dayjs(minDateTime).format("YYYY-MM-DDTHH:mm") : undefined);

  const maxStr     = disableFuture
    ? (maxDateTime ? dayjs(maxDateTime).format("YYYY-MM-DDTHH:mm") : now.format("YYYY-MM-DDTHH:mm"))
    : (maxDateTime ? dayjs(maxDateTime).format("YYYY-MM-DDTHH:mm") : undefined);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="mb-3">
          <label
            htmlFor={`dtp-${name}`}
            className="form-label"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>

          <input
            type="datetime-local"
            id={`dtp-${name}`}
            ref={field.ref}
            value={toLocalInputValue(field.value)}
            onChange={(e) => {
              // Store as ISO string — same format as AmniCare's value.toISOString()
              const iso = e.target.value
                ? dayjs(e.target.value).toISOString()
                : "";
              field.onChange(iso);
            }}
            onBlur={field.onBlur}
            disabled={disabled}
            required={required}
            min={minStr}
            max={maxStr}
            className={`form-control ${fieldState.error ? "is-invalid" : ""}`}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 14,
              height: 42,
              borderRadius: 8,
              borderColor: fieldState.error ? "#dc3545" : "#e2e8f0",
            }}
          />

          {fieldState.error && (
            <div className="invalid-feedback">
              {fieldState.error.message}
            </div>
          )}
        </div>
      )}
    />
  );
}