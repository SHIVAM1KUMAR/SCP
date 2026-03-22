import { Controller, useFormContext } from "react-hook-form";

// ─── FileUpload ───────────────────────────────────────────────────────────────
// AmniCare: MUI Button (component="label") + Chip + Stack + Controller
// EduAdmit: Bootstrap outlined button + badge chips + react-hook-form Controller
//
// Features:
//   - Single or multiple file upload
//   - Duplicate file detection (by name+size+lastModified)
//   - Deletable file chips
//   - Validation error display
// ─────────────────────────────────────────────────────────────────────────────

const FileUpload = ({
  name,
  label    = "Upload Files",
  accept,
  multiple = false,
  helperText,
}) => {
  const { control } = useFormContext();
  const inputId = `file-upload-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={multiple ? [] : undefined}
      render={({ field, fieldState }) => {
        const value = field.value;
        const files = multiple
          ? Array.isArray(value) ? value : []
          : value instanceof File ? [value] : [];

        const handleChange = (e) => {
          const selected = Array.from(e.target.files || []);
          if (!multiple) {
            field.onChange(selected[0] || undefined);
            return;
          }
          // Deduplicate by name + size + lastModified
          const existingKeys = new Set(
            files.map(f => `${f.name}-${f.size}-${f.lastModified}`)
          );
          const unique = selected.filter(
            f => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`)
          );
          field.onChange([...files, ...unique]);
          e.target.value = ""; // allow re-selecting same file
        };

        const handleDelete = (index) => {
          if (!multiple) { field.onChange(undefined); return; }
          field.onChange(files.filter((_, i) => i !== index));
        };

        return (
          <div>
            {/* Upload button — label wraps hidden input (same as MUI component="label") */}
            <label
              htmlFor={inputId}
              className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
              style={{
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                borderRadius: 8,
              }}
            >
              {/* Upload icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1={12} y1={3} x2={12} y2={15} />
              </svg>
              {label}
              <input
                id={inputId}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                style={{ display: "none" }}
              />
            </label>

            {/* Helper text */}
            {helperText && (
              <small className="d-block text-muted mt-1">{helperText}</small>
            )}

            {/* Validation error */}
            {fieldState.error && (
              <small className="d-block text-danger mt-1">
                {fieldState.error.message}
              </small>
            )}

            {/* Selected file chips */}
            {files.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-2">
                {files.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="badge d-inline-flex align-items-center gap-1 border text-secondary fw-normal"
                    style={{
                      background: "#f8fafc",
                      fontSize: 12,
                      padding: "5px 10px",
                      borderRadius: 20,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {file.name}
                    {/* Delete × */}
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      style={{
                        background: "none", border: "none",
                        padding: "0 0 0 4px", cursor: "pointer",
                        color: "#94a3b8", fontSize: 14, lineHeight: 1,
                        display: "flex", alignItems: "center",
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default FileUpload;