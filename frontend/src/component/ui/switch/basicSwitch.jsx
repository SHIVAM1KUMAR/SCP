import { Controller, useFormContext } from "react-hook-form";

// ─── BasicSwitch ──────────────────────────────────────────────────────────────
// AmniCare: MUI Switch + FormControlLabel + FormGroup + Controller
// EduAdmit: Bootstrap form-check form-switch + react-hook-form Controller
//
// Must be inside a <FormProvider>
// ─────────────────────────────────────────────────────────────────────────────

export default function BasicSwitch({
  name,
  label,
  required = false,
  disabled = false,
  onChange,
}) {
  const { control } = useFormContext();
  const inputId = `switch-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required }}
      render={({ field }) => (
        <div className="form-check form-switch d-flex align-items-center gap-2 mb-0">
          <input
            type="checkbox"
            className="form-check-input"
            role="switch"
            id={inputId}
            ref={field.ref}
            checked={field.value || false}
            disabled={disabled}
            onChange={(_e) => {
              const checked = _e.target.checked;
              // Allow parent to cancel the change (matches AmniCare's shouldContinue logic)
              const shouldContinue = onChange?.(checked);
              if (shouldContinue === false) return;
              field.onChange(checked);
            }}
            onBlur={field.onBlur}
            style={{
              cursor:    disabled ? "not-allowed" : "pointer",
              width:     40,
              height:    22,
              marginTop: 0,
              // Red when checked — mirrors AmniCare's color="error"
              accentColor: "#e53e3e",
            }}
          />
          <label
            htmlFor={inputId}
            className="form-check-label"
            style={{
              cursor:     disabled ? "not-allowed" : "pointer",
              fontSize:   14,
              fontFamily: "'Outfit', sans-serif",
              color:      "#1e293b",
              userSelect: "none",
              marginBottom: 0,
            }}
          >
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        </div>
      )}
    />
  );
}