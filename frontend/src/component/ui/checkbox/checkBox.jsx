import { Controller, useFormContext } from "react-hook-form";

// ─── Checkbox ─────────────────────────────────────────────────────────────────
// AmniCare: MUI Checkbox + FormControlLabel + Controller
// EduAdmit: Bootstrap form-check + react-hook-form Controller
//
// Must be used inside a <FormProvider> (react-hook-form)
// ─────────────────────────────────────────────────────────────────────────────

const Checkbox = ({ name, label, disabled, size = "medium", ...props }) => {
  const { control } = useFormContext();
  const inputId = `checkbox-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="form-check d-flex align-items-center gap-2 mb-0">
          <input
            type="checkbox"
            className="form-check-input"
            id={inputId}
            ref={field.ref}
            checked={field.value || false}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              width:  size === "small" ? 14 : 16,
              height: size === "small" ? 14 : 16,
              marginTop: 2,
            }}
            {...props}
          />
          <label
            htmlFor={inputId}
            className="form-check-label"
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: size === "small" ? 13 : 14,
              fontFamily: "'Outfit', sans-serif",
              color: "#1e293b",
              userSelect: "none",
            }}
          >
            {label}
          </label>
        </div>
      )}
    />
  );
};

export default Checkbox;