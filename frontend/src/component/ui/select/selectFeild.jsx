import { Controller, useFormContext } from "react-hook-form";

// ─── SelectField ──────────────────────────────────────────────────────────────
// AmniCare: MUI Select + FormControl + Chip (multi) + Controller
// EduAdmit: Bootstrap select + custom multi-chip display + react-hook-form
//
// Works both inside and outside FormProvider:
//   - Inside  FormProvider: pass name → auto-wired to react-hook-form
//   - Outside FormProvider: pass value + onChange directly
// ─────────────────────────────────────────────────────────────────────────────

// ── SelectUI (pure presentational) ───────────────────────────────────────────
function SelectUI({
  value,
  onChange,
  label,
  options = [],
  required  = false,
  disabled  = false,
  loading   = false,
  multiple  = false,
  error     = false,
  helperText,
  size      = "medium",
}) {
  const height = size === "small" ? 36 : 42;

  // Single select
  if (!multiple) {
    return (
      <div className="mb-0">
        <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.3px", fontFamily: "'Outfit', sans-serif" }}>
          {label}{required && <span className="text-danger ms-1">*</span>}
        </label>
        <select
          className={`form-select ${error ? "is-invalid" : ""}`}
          value={value ?? ""}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled || loading}
          required={required}
          style={{ height, fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8, borderColor: error ? "#dc3545" : "#e2e8f0" }}
        >
          <option value="" disabled>{loading ? "Loading…" : `Select ${label}`}</option>
          {!loading && options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
          {!loading && options.length === 0 && <option disabled>No options available</option>}
        </select>
        {helperText && <div className={error ? "invalid-feedback d-block" : "form-text text-muted"} style={{ fontSize: 12 }}>{helperText}</div>}
      </div>
    );
  }

  // Multi select — chip display
  const selectedArr = Array.isArray(value) ? value : [];

  const handleToggle = (val) => {
    if (selectedArr.includes(val)) onChange?.(selectedArr.filter(v => v !== val));
    else                            onChange?.([...selectedArr, val]);
  };

  const handleRemove = (val, e) => {
    e.stopPropagation();
    onChange?.(selectedArr.filter(v => v !== val));
  };

  return (
    <div className="mb-0">
      <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.3px", fontFamily: "'Outfit', sans-serif" }}>
        {label}{required && <span className="text-danger ms-1">*</span>}
      </label>

      {/* Selected chips */}
      {selectedArr.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mb-2">
          {selectedArr.map(val => {
            const optLabel = options.find(o => o.value === val)?.label ?? val;
            return (
              <span key={val} className="badge d-inline-flex align-items-center gap-1 border text-secondary fw-normal"
                style={{ background: "#f8fafc", fontSize: 12, padding: "4px 10px", borderRadius: 20, fontFamily: "'Outfit', sans-serif" }}>
                {optLabel}
                <button type="button" onMouseDown={e => e.stopPropagation()} onClick={e => handleRemove(val, e)}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#94a3b8", fontSize: 14, lineHeight: 1, display: "flex", alignItems: "center" }}>×</button>
              </span>
            );
          })}
        </div>
      )}

      {/* Dropdown */}
      <select
        className={`form-select ${error ? "is-invalid" : ""}`}
        value=""
        onChange={e => { if (e.target.value) handleToggle(e.target.value); }}
        disabled={disabled || loading}
        style={{ height, fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8, borderColor: error ? "#dc3545" : "#e2e8f0" }}
      >
        <option value="">{loading ? "Loading…" : `Add ${label}…`}</option>
        {!loading && options
          .filter(opt => !selectedArr.includes(opt.value))
          .map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        {!loading && options.length === 0 && <option disabled>No options available</option>}
      </select>

      {helperText && <div className={error ? "invalid-feedback d-block" : "form-text text-muted"} style={{ fontSize: 12 }}>{helperText}</div>}
    </div>
  );
}

// ── Main export — auto-detects FormProvider ───────────────────────────────────
export default function SelectField(props) {
  const { name, value, onChange } = props;

  let formContext = null;
  try { formContext = useFormContext(); } catch { formContext = null; }

  if (name && formContext?.control) {
    return (
      <Controller
        name={name}
        control={formContext.control}
        defaultValue={props.multiple ? [] : ""}
        render={({ field, fieldState }) => (
          <SelectUI
            {...props}
            value={field.value}
            onChange={field.onChange}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    );
  }

  return <SelectUI {...props} value={value} onChange={onChange} />;
}