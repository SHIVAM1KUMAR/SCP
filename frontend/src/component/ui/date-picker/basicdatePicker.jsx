import { Controller, useFormContext } from "react-hook-form";
import dayjs from "dayjs";

// ─── BasicDatePicker ──────────────────────────────────────────────────────────
// AmniCare: MUI x-date-pickers DatePicker + Controller
// EduAdmit: Native HTML <input type="date"> + react-hook-form Controller
//
// Value format: stored as "YYYY-MM-DD" string (same as AmniCare)
// ─────────────────────────────────────────────────────────────────────────────

export default function BasicDatePicker({
  name,
  label,
  required      = false,
  disabled      = false,
  disableFuture = false,
  minDate,      // dayjs object or "YYYY-MM-DD" string
  maxDate,      // dayjs object or "YYYY-MM-DD" string
}) {
  const { control } = useFormContext();

  // Compute min/max as "YYYY-MM-DD" strings for the native input
  const today    = dayjs().format("YYYY-MM-DD");
  const minStr   = minDate ? dayjs(minDate).format("YYYY-MM-DD") : undefined;
  const maxStr   = disableFuture
    ? (maxDate ? dayjs(maxDate).format("YYYY-MM-DD") : today)
    : (maxDate ? dayjs(maxDate).format("YYYY-MM-DD") : undefined);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="mb-3">
          <label
            htmlFor={`dp-${name}`}
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
            type="date"
            id={`dp-${name}`}
            ref={field.ref}
            value={field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""}
            onChange={(e) =>
              field.onChange(e.target.value ? e.target.value : "")
            }
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