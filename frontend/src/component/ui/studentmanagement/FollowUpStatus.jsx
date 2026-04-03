/* eslint-disable react-refresh/only-export-components */

const FOLLOW_UP_STATUS_META = {
  Unvisited: {
    label: "Unvisited",
    bg: "#f8fafc",
    border: "#e2e8f0",
    color: "#475569",
    dot: "#94a3b8",
  },
  Visited: {
    label: "Visited",
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
    dot: "#2563eb",
  },
  Counseled: {
    label: "Counseled",
    bg: "#ecfdf5",
    border: "#bbf7d0",
    color: "#166534",
    dot: "#16a34a",
  },
  Rescheduled: {
    label: "Rescheduled",
    bg: "#eff6ff",
    border: "#bfdbfe",
    color: "#1d4ed8",
    dot: "#2563eb",
  },
  Missed: {
    label: "Missed",
    bg: "#fef2f2",
    border: "#fecaca",
    color: "#b91c1c",
    dot: "#dc2626",
  },
  default: {
    label: "Unvisited",
    bg: "#f8fafc",
    border: "#e2e8f0",
    color: "#475569",
    dot: "#94a3b8",
  },
};

const FOLLOW_UP_STATUS_VARIANTS = {
  basic: ["Unvisited", "Visited"],
  extended: ["Unvisited", "Visited", "Counseled", "Rescheduled", "Missed"],
  counselling: ["Unvisited", "Visited", "Counseled", "Missed"],
};

export const FOLLOW_UP_STATUS_OPTIONS = FOLLOW_UP_STATUS_VARIANTS.basic;

export const FOLLOW_UP_STATUS_EXTENDED_OPTIONS = FOLLOW_UP_STATUS_VARIANTS.extended;

export const normalizeFollowUpStatus = (value) => {
  const text = String(value || "").trim();
  const legacyMap = {
    unseen: "Unvisited",
    "not visited": "Unvisited",
    counseled: "Counseled",
    counselled: "Counseled",
    done: "Counseled",
    completed: "Counseled",
    complete: "Counseled",
    reschedule: "Rescheduled",
    rescheduled: "Rescheduled",
    missed: "Missed",
  };
  const legacy = legacyMap[text.toLowerCase()];
  if (legacy) return legacy;

  const match = FOLLOW_UP_STATUS_VARIANTS.extended.find(
    (option) => option.toLowerCase() === text.toLowerCase(),
  );
  return match || "Unvisited";
};

export const collapseFollowUpStatusToBasic = (status) => {
  const normalized = normalizeFollowUpStatus(status);
  return normalized === "Unvisited" ? "Unvisited" : "Visited";
};

export const buildFollowUpUpdateKey = (studentId, collegeId = null) =>
  `${studentId || "student"}:${collegeId || "global"}`;

export const getFollowUpStatusForCollege = (student, collegeId = null, scope = "student") => {
  if (!student) return "Unvisited";

  if (collegeId) {
    const statuses = scope === "college"
      ? student.collegeFollowUpStatuses
      : student.studentFollowUpStatuses;
    const rawStatus = statuses instanceof Map
      ? statuses.get(String(collegeId))
      : statuses?.[String(collegeId)];

    if (rawStatus) return normalizeFollowUpStatus(rawStatus);
  }

  return "Unvisited";
};

function getFollowUpMeta(status) {
  return FOLLOW_UP_STATUS_META[status] || FOLLOW_UP_STATUS_META.default;
}

export function FollowUpStatusBadge({ status, variant = "basic" }) {
  const normalized = normalizeFollowUpStatus(status);
  const displayStatus = variant === "basic" ? collapseFollowUpStatusToBasic(normalized) : normalized;
  const meta = getFollowUpMeta(displayStatus);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        border: `1px solid ${meta.border}`,
        color: meta.color,
        background: meta.bg,
        whiteSpace: "nowrap",
      }}
      >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: meta.dot,
          display: "inline-block",
        }}
      />
      {getFollowUpMeta(displayStatus).label}
    </span>
  );
}

export function FollowUpStatusSelect({
  value,
  onChange,
  disabled = false,
  loading = false,
  variant = "basic",
}) {
  const normalized = normalizeFollowUpStatus(value);
  const displayStatus = variant === "basic" ? collapseFollowUpStatusToBasic(normalized) : normalized;
  const meta = getFollowUpMeta(displayStatus);
  const options = FOLLOW_UP_STATUS_VARIANTS[variant] || FOLLOW_UP_STATUS_VARIANTS.basic;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ minWidth: 160 }}
    >
      <select
        value={displayStatus}
        disabled={disabled || loading}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: "100%",
          height: 36,
          padding: "0 34px 0 12px",
          border: `1px solid ${meta.border}`,
          borderRadius: 8,
          fontSize: 12.5,
          fontWeight: 700,
          fontFamily: "'Outfit', sans-serif",
          color: meta.color,
          backgroundColor: meta.bg,
          outline: "none",
          appearance: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7' viewBox='0 0 10 7'%3E%3Cpath fill='%2364748b' d='M5 7L0 0h10z'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          cursor: disabled || loading ? "not-allowed" : "pointer",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getFollowUpMeta(option).label}
          </option>
        ))}
      </select>
    </div>
  );
}
