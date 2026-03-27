import { Controller, useFormContext } from "react-hook-form";
import { MAX_FILE_SIZE_MB } from "../../../constant/collegeRegistration.jsx";

const getDisplayFileName = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    return decodeURIComponent(value.split("/").pop()?.split("?")[0] || "Uploaded file");
  }
  return value.name || value.fileName || value.path?.split("/").pop() || value.url?.split("/").pop() || "Uploaded file";
};

const FileUpload = ({
  name,
  label = "Upload Files",
  accept,
  multiple = false,
  helperText,
  hint,
  error,
  value,
  onChange,
  required = false,
}) => {
  const formContext = useFormContext();
  const control = formContext?.control;
  const maxMb = MAX_FILE_SIZE_MB;
  const inputId = `file-upload-${name || label}`;
  const isControlled = typeof onChange === "function"
    || value !== undefined
    || error !== undefined
    || helperText !== undefined
    || hint !== undefined
    || !name;

  const renderUI = ({
    currentValue,
    setValue,
    fieldError,
    fieldHelperText,
  }) => {
    const errorMessage = fieldError || error;
    const helperMessage = errorMessage || fieldHelperText || helperText || hint;
    const hasValue = multiple
      ? Array.isArray(currentValue) && currentValue.length > 0
      : !!currentValue;
    const selectedFiles = multiple
      ? Array.isArray(currentValue) ? currentValue : []
      : currentValue
        ? [currentValue]
        : [];

    const handleChange = (e) => {
      const selected = Array.from(e.target.files || []);
      if (multiple) {
        const next = [...selectedFiles, ...selected].filter((file, index, arr) => {
          const key = `${file.name}-${file.size}-${file.lastModified}`;
          return arr.findIndex((candidate) => `${candidate.name}-${candidate.size}-${candidate.lastModified}` === key) === index;
        });
        setValue(next);
      } else {
        setValue(selected[0] || null);
      }
      e.target.value = "";
    };

    const handleRemove = (index) => {
      if (multiple) {
        setValue(selectedFiles.filter((_, i) => i !== index));
      } else {
        setValue(null);
      }
    };

    return (
      <div>
        <label
          htmlFor={inputId}
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
          {label}{required && <span className="text-danger ms-1">*</span>}
        </label>

        <div
          onClick={() => document.getElementById(inputId)?.click()}
          style={{
            border: `1.5px dashed ${errorMessage ? "#dc2626" : hasValue ? "#86efac" : "#e2e8f0"}`,
            borderRadius: 10,
            padding: "13px 15px",
            cursor: "pointer",
            background: errorMessage ? "#fef2f2" : hasValue ? "#f0fdf4" : "#faf8f4",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "all .15s",
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            flexShrink: 0,
            background: hasValue ? "#dcfce7" : errorMessage ? "#fecaca" : "#e8eef8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
          }}>
            {hasValue ? "✅" : errorMessage ? "⚠️" : "📎"}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              color: hasValue ? "#16a34a" : errorMessage ? "#dc2626" : "#0f2044",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {hasValue ? getDisplayFileName(selectedFiles[0]) : "Click to upload"}
            </div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1, fontFamily: "'Outfit', sans-serif" }}>
              {String(accept || "").replace(/\./g, "").toUpperCase().split(",").join(", ")} {accept ? "· " : ""}max {maxMb} MB
            </div>
          </div>
        </div>

        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: "none" }}
          onChange={handleChange}
        />

        {helperMessage && (
          <div style={{
            marginTop: 4,
            fontSize: 12,
            color: errorMessage ? "#dc2626" : "#94a3b8",
          }}>
            {helperMessage}
          </div>
        )}

        {selectedFiles.length > 0 && multiple && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {selectedFiles.map((file, index) => (
              <span
                key={`${getDisplayFileName(file)}-${index}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  borderRadius: 20,
                  padding: "5px 10px",
                  fontSize: 12,
                  color: "#475569",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {getDisplayFileName(file)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: 14,
                    lineHeight: 1,
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
  };

  if (isControlled || !name || !control) {
    return renderUI({
      currentValue: value,
      setValue: (next) => onChange?.(next),
      fieldError: error,
      fieldHelperText: helperText || hint,
    });
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={multiple ? [] : undefined}
      render={({ field, fieldState }) => renderUI({
        currentValue: field.value,
        setValue: field.onChange,
        fieldError: fieldState.error?.message,
        fieldHelperText: helperText || hint,
      })}
    />
  );
};

export default FileUpload;
