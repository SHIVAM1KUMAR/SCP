import { Controller, useFormContext } from "react-hook-form";

const getOptions = (options = []) =>
  options.map((opt) => (
    typeof opt === "string"
      ? { label: opt, value: opt }
      : { label: opt.label ?? opt.value, value: opt.value ?? opt.label }
  ));

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

const fieldStyle = (hasError) => ({
  width: "100%",
  height: 42,
  padding: "0 34px 0 14px",
  border: `1.5px solid ${hasError ? "#dc3545" : "#e2e8f0"}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "'Outfit', sans-serif",
  color: "#1e293b",
  backgroundColor: "#fff",
  outline: "none",
  appearance: "none",
  boxSizing: "border-box",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2364748b' d='M5 7L0 0h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 13px center",
});

function SelectUI({
  value,
  onChange,
  label,
  options = [],
  required = false,
  disabled = false,
  loading = false,
  multiple = false,
  error = false,
  helperText,
  placeholder,
}) {
  const optionList = getOptions(options);

  if (!multiple) {
    return (
      <div className="mb-0">
        {label && (
          <label style={labelStyle}>
            {label}{required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        <select
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled || loading}
          required={required}
          style={fieldStyle(error)}
        >
          <option value="">{loading ? "Loading..." : (placeholder || `Select ${label}`)}</option>
          {!loading && optionList.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
          {!loading && optionList.length === 0 && <option disabled>No options available</option>}
        </select>
        {helperText && (
          <div style={{ fontSize: 12, marginTop: 4, color: error ? "#dc3545" : "#94a3b8" }}>
            {helperText}
          </div>
        )}
      </div>
    );
  }

  const selectedArr = Array.isArray(value) ? value : [];
  const handleToggle = (val) => {
    if (selectedArr.includes(val)) onChange?.(selectedArr.filter((v) => v !== val));
    else onChange?.([...selectedArr, val]);
  };

  return (
    <div className="mb-0">
      {label && (
        <label style={labelStyle}>
          {label}{required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      {selectedArr.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mb-2">
          {selectedArr.map((val) => {
            const optLabel = optionList.find((o) => o.value === val)?.label ?? val;
            return (
              <span
                key={val}
                className="badge d-inline-flex align-items-center gap-1 border text-secondary fw-normal"
                style={{
                  background: "#f8fafc",
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {optLabel}
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => handleToggle(val)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: 14,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      <select
        value=""
        onChange={(e) => { if (e.target.value) handleToggle(e.target.value); }}
        disabled={disabled || loading}
        style={fieldStyle(error)}
      >
        <option value="">{loading ? "Loading..." : (placeholder || `Add ${label}...`)}</option>
        {!loading && optionList
          .filter((opt) => !selectedArr.includes(opt.value))
          .map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        {!loading && optionList.length === 0 && <option disabled>No options available</option>}
      </select>

      {helperText && (
        <div style={{ fontSize: 12, marginTop: 4, color: error ? "#dc3545" : "#94a3b8" }}>
          {helperText}
        </div>
      )}
    </div>
  );
}

export default function SelectField(props) {
  const { name, value, onChange } = props;
  const formContext = useFormContext();

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
            onChange={(next) => {
              field.onChange(next);
              props.onChange?.(next);
            }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message || props.helperText}
          />
        )}
      />
    );
  }

  return <SelectUI {...props} value={value} onChange={onChange} />;
}
