import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

// ─── CheckboxList ─────────────────────────────────────────────────────────────
// AmniCare: MUI Checkbox + Collapse + FormControlLabel + Controller
// EduAdmit: Bootstrap checkboxes + CSS collapse + react-hook-form Controller
//
// Supports:
//  - Nested items (parent → children)
//  - Indeterminate state (some children checked)
//  - Expand/collapse per group
//  - Loading skeleton
//  - react-hook-form integration via useFormContext
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────
const collectLeafIds = (item) => {
  if (!item.subItems?.length) return [item.id];
  return item.subItems.flatMap(collectLeafIds);
};

const countTotalLeaves = (list) =>
  list.reduce((sum, item) => sum + collectLeafIds(item).length, 0);

const countSelectedLeaves = (list, value = []) => {
  let count = 0;
  const traverse = (item) => {
    if (item.subItems?.length) item.subItems.forEach(traverse);
    else if (value.includes(item.id)) count += 1;
  };
  list.forEach(traverse);
  return count;
};

const getModuleStats = (item, value = []) => {
  const leafIds = collectLeafIds(item);
  const selected = leafIds.filter((id) => value.includes(id)).length;
  return { selected, total: leafIds.length };
};

// ── Indeterminate checkbox (no native HTML attr via React, needs ref) ─────────
const IndeterminateCheckbox = ({ checked, indeterminate, onChange, disabled, id }) => {
  const ref = (el) => {
    if (el) el.indeterminate = indeterminate;
  };
  return (
    <input
      ref={ref}
      type="checkbox"
      className="form-check-input"
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      style={{ cursor: disabled ? "not-allowed" : "pointer", marginTop: 2 }}
    />
  );
};

// ── Skeleton row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="placeholder-glow mb-2">
    <span className="placeholder col-8 rounded" style={{ height: 20 }} />
  </div>
);

// ── Recursive item renderer ───────────────────────────────────────────────────
const CheckboxItem = ({ item, value = [], onChange, level = 0, loading }) => {
  const [open, setOpen] = useState(false);
  const leafIds    = collectLeafIds(item);
  const hasChildren = !!item.subItems?.length;
  const { selected, total } = getModuleStats(item, value);

  const allChecked  = leafIds.every((id) => value.includes(id));
  const someChecked = leafIds.some((id) => value.includes(id));

  const toggle = (checked) => {
    if (checked) onChange(Array.from(new Set([...value, ...leafIds])));
    else          onChange(value.filter((v) => !leafIds.includes(v)));
  };

  const checkboxId = `chk-${item.id}-lvl${level}`;

  return (
    <div style={{ marginLeft: level * 20 }}>
      <div className="d-flex align-items-center gap-1 py-1">

        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            className="btn btn-sm p-0 border-0 text-muted"
            style={{ width: 24, lineHeight: 1 }}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </button>
        ) : (
          <span style={{ width: 24, flexShrink: 0 }} />
        )}

        {/* Checkbox */}
        <div className="form-check mb-0 d-flex align-items-center gap-2">
          <IndeterminateCheckbox
            id={checkboxId}
            checked={allChecked}
            indeterminate={!allChecked && someChecked}
            onChange={(e) => toggle(e.target.checked)}
            disabled={loading}
          />
          <label
            htmlFor={checkboxId}
            className="form-check-label d-flex align-items-center gap-2"
            style={{
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontFamily: "'Outfit', sans-serif",
              color: "#1e293b",
              userSelect: "none",
            }}
          >
            {item.label}
            {level === 0 && (
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>
                ({selected}/{total})
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Children — animated collapse using max-height trick */}
      {hasChildren && (
        <div
          style={{
            maxHeight: open ? 9999 : 0,
            overflow: "hidden",
            transition: "max-height 0.25s ease",
          }}
        >
          {item.subItems.map((sub) => (
            <CheckboxItem
              key={sub.id}
              item={sub}
              value={value}
              onChange={onChange}
              level={level + 1}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
export default function CheckboxList({ name, items = [], label, loading = false }) {
  const { control, formState } = useFormContext();
  const error = formState.errors[name]?.message;
  const total = countTotalLeaves(items);

  return (
    <div>
      {/* Label + count (re-renders with field value) */}
      {label && (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const selected = countSelectedLeaves(items, field.value || []);
            return (
              <div className="d-flex align-items-center gap-2 mb-2">
                <h6 className="mb-0 fw-semibold" style={{ fontSize: 15, color: "#1e293b", fontFamily: "'Outfit', sans-serif" }}>
                  {label}
                </h6>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  ({selected}/{total} selected)
                </span>
              </div>
            );
          }}
        />
      )}

      {/* Checkbox list */}
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <div>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              : items.map((item) => (
                  <CheckboxItem
                    key={item.id}
                    item={item}
                    value={field.value || []}
                    onChange={field.onChange}
                    level={0}
                    loading={loading}
                  />
                ))
            }
          </div>
        )}
      />

      {/* Error */}
      {error && (
        <div className="text-danger mt-1" style={{ fontSize: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}