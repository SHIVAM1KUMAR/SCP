/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import BasicTable from "../../component/ui/table/basicTable";
import { useToast } from "../../context/ToastContext";
import { getAuth } from "../../store/slice/auth.slice";
import { useResults } from "../../hooks/useResults";
import {
  formatScholarshipAmount,
  ResultStatusBadge,
  SCHOLARSHIP_TYPE_OPTIONS,
  normalizeResultStatus,
  normalizeScholarshipType,
} from "../../constant/results.jsx";

const formatDate = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
};

export default function Results() {
  const toast = useToast();
  const navigate = useNavigate();
  const auth = getAuth();
  const role = auth?.role || "";
  const isSuperAdmin = role === "SuperAdmin";
  const isCollege = role === "College";
  const basePath = isSuperAdmin ? "/superadmin/results" : isCollege ? "/college/results" : "/student/results";
  const title = isCollege ? "Results" : isSuperAdmin ? "All Results" : "Your Results";
  const subtitle = isCollege
    ? "Review completed tests and publish pass or fail results with scholarship details."
    : isSuperAdmin
      ? "Track completed test results across every college."
      : "View completed test results shared by your colleges.";

  const { results, loadingResults, saving, fetchResults, saveResult } = useResults(toast);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    void fetchResults?.();
  }, []);

  useEffect(() => {
    const next = {};
    (results || []).forEach((item) => {
      next[String(item._id)] = {
        resultStatus: normalizeResultStatus(item.resultStatus),
        scholarshipAmount: item.scholarshipAmount !== undefined && item.scholarshipAmount !== null ? String(item.scholarshipAmount) : "",
        scholarshipType: item.scholarshipType || "",
      };
    });
    setDrafts(next);
  }, [results]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (results || []).filter((item) =>
      [item?.title, item?.student?.firstName, item?.student?.lastName, item?.college?.collegeName, item?.resultStatus, item?.scholarshipType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [search, results]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);

  const updateDraft = (id, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [String(id)]: {
        ...(prev[String(id)] || {}),
        ...patch,
      },
    }));
  };

  const commitResult = async (item, overrideDraft = null) => {
    const draft = overrideDraft || drafts[String(item._id)] || {};
    const nextStatus = normalizeResultStatus(draft.resultStatus || item.resultStatus);
    const amountValue = String(draft.scholarshipAmount || "").trim();
    const scholarshipAmount = amountValue ? Number(amountValue) : null;
    const scholarshipType = normalizeScholarshipType(draft.scholarshipType || "");

    if (nextStatus === "Pass") {
      if (!Number.isFinite(scholarshipAmount) || scholarshipAmount <= 0) return;
      if (!scholarshipType) return;
    }

    await saveResult({
      id: item._id,
      payload: {
        resultStatus: nextStatus,
        scholarshipAmount: nextStatus === "Pass" ? scholarshipAmount : null,
        scholarshipType: nextStatus === "Pass" ? scholarshipType : "",
        resultNote: item.resultNote || "",
      },
    });
  };

  const columns = [
    { key: "title", header: "Test Title", minWidth: 200, render: (item) => item.title || "-" },
    { key: "student", header: "Student", minWidth: 180, render: (item) => `${item.student?.firstName || ""} ${item.student?.lastName || ""}`.trim() || "-" },
    ...(isSuperAdmin ? [{ key: "college", header: "College", minWidth: 200, render: (item) => item.college?.collegeName || "-" }] : []),
    { key: "marks", header: "Marks", minWidth: 120, render: (item) => formatScore(item) },
    {
      key: "status",
      header: "Result Status",
      minWidth: 160,
      render: (item) => {
        const draft = drafts[String(item._id)] || {};
        const value = normalizeResultStatus(draft.resultStatus || item.resultStatus);

        if (!isCollege) {
          return <ResultStatusBadge status={value} />;
        }

        return (
          <PillSelect
            value={value}
            disabled={loadingResults || saving}
            onChange={async (nextStatus) => {
              const normalized = normalizeResultStatus(nextStatus);
              const nextDraft = { ...draft, resultStatus: normalized };
              updateDraft(item._id, nextDraft);

              if (normalized !== "Pass") {
                await commitResult(item, { ...nextDraft, scholarshipAmount: "", scholarshipType: "" });
                return;
              }

              const amountValue = String(nextDraft.scholarshipAmount || "").trim();
              const scholarshipAmount = amountValue ? Number(amountValue) : null;
              const scholarshipType = normalizeScholarshipType(nextDraft.scholarshipType || "");
              if (Number.isFinite(scholarshipAmount) && scholarshipAmount > 0 && scholarshipType) {
                await commitResult(item, nextDraft);
              }
            }}
          />
        );
      },
    },
    {
      key: "scholarship",
      header: "Scholarship",
      minWidth: 320,
      render: (item) => {
        const draft = drafts[String(item._id)] || {};
        const value = normalizeResultStatus(draft.resultStatus || item.resultStatus);

        if (!isCollege) {
          return (
            <div style={{ fontWeight: 700, color: "#0f2044" }}>
              {formatScholarshipInline(item.scholarshipAmount, item.scholarshipType)}
            </div>
          );
        }

        if (value !== "Pass") {
          return <span style={{ color: "#94a3b8", fontSize: 12.5 }}>Available after pass</span>;
        }

        return (
          <div style={scholarshipCardStyle} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div style={scholarshipGridStyle}>
              <MoneyInput
                value={draft.scholarshipAmount || ""}
                onChange={(nextValue) => updateDraft(item._id, { scholarshipAmount: nextValue })}
                onBlur={async () => {
                  const current = { ...(drafts[String(item._id)] || {}), scholarshipAmount: draft.scholarshipAmount };
                  const amountValue = String(current.scholarshipAmount || "").trim();
                  const scholarshipAmount = amountValue ? Number(amountValue) : null;
                  const scholarshipType = normalizeScholarshipType(current.scholarshipType || "");
                  if (Number.isFinite(scholarshipAmount) && scholarshipAmount > 0 && scholarshipType) {
                    await commitResult(item, current);
                  }
                }}
                disabled={loadingResults || saving}
              />

              <select
                value={draft.scholarshipType || ""}
                onChange={async (e) => {
                  const nextType = e.target.value;
                  const nextDraft = { ...(drafts[String(item._id)] || {}), scholarshipType: nextType };
                  updateDraft(item._id, nextDraft);
                  const amountValue = String(nextDraft.scholarshipAmount || "").trim();
                  const scholarshipAmount = amountValue ? Number(amountValue) : null;
                  if (Number.isFinite(scholarshipAmount) && scholarshipAmount > 0 && normalizeScholarshipType(nextDraft.scholarshipType || "")) {
                    await commitResult(item, nextDraft);
                  }
                }}
                style={scholarshipTypeStyle}
                disabled={loadingResults || saving}
              >
                <option value="">Type</option>
                {SCHOLARSHIP_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      },
    },
    { key: "date", header: "Completed", minWidth: 120, render: (item) => formatDate(item.submittedAt || item.updatedAt || item.createdAt) },
  ];

  const handleRowClick = (item) => {
    navigate(`${basePath}/${item._id}`);
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>{title}</h2>
            <p style={subTitleStyle}>{subtitle}</p>
          </div>

          <div style={toolbarStyle}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search results..."
              width="340px"
              style={{ flex: "0 1 340px", minWidth: 250 }}
            />
            <button type="button" onClick={() => fetchResults?.()} style={refreshButton}>
              Refresh
            </button>
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {loadingResults ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={handleRowClick}
              emptyText="No completed results found"
              tableStyle={{ minWidth: isSuperAdmin ? 1080 : 980 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No completed results found
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div style={paginationStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                style={smallSelectStyle}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              {start + 1}-{Math.min(start + rowsPerPage, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} style={pagerButtonStyle(safePage === 1)}>
                {"<"}
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={pagerButtonStyle(safePage >= totalPages)}>
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatScore(item) {
  const score = Number(item?.score);
  const totalMarks = Number(item?.totalMarks);
  if (!Number.isFinite(score) || !Number.isFinite(totalMarks)) return "-";
  return `${score} / ${totalMarks}`;
}

function formatScholarshipInline(amount, type) {
  const money = formatScholarshipAmount(amount);
  const term = String(type || "").trim();
  const termShort =
    {
      "Per Year": "per yr",
      "Per Sem": "per sem",
      "One Time": "one time",
    }[term] || term.toLowerCase();

  if (money === "-" && !term) return "-";
  if (money === "-") return termShort || "-";
  if (!term) return money;
  return `${money} / ${termShort}`;
}

function PillSelect({ value, onChange, disabled = false }) {
  return (
    <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <select value={value || "Pending"} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} style={pillSelectStyle(value)}>
        <option value="Pending">Pending</option>
        <option value="Pass">Pass</option>
        <option value="Fail">Fail</option>
      </select>
    </div>
  );
}

function MoneyInput({ value, onChange, onBlur, disabled = false }) {
  return (
    <div style={moneyWrapStyle}>
      <span style={moneyPrefixStyle}>INR</span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        placeholder="12000"
        type="number"
        min="1"
        disabled={disabled}
        style={moneyInputStyle}
      />
    </div>
  );
}

function pillSelectStyle(value) {
  const normalized = normalizeResultStatus(value);
  const bg = normalized === "Pass" ? "#ecfdf5" : normalized === "Fail" ? "#fef2f2" : "#f8fafc";
  const border = normalized === "Pass" ? "#bbf7d0" : normalized === "Fail" ? "#fecaca" : "#dbe3ee";
  const color = normalized === "Pass" ? "#166534" : normalized === "Fail" ? "#b91c1c" : "#0f2044";

  return {
    width: "100%",
    minWidth: 0,
    height: 38,
    border: `1px solid ${border}`,
    borderRadius: 999,
    padding: "0 12px",
    fontSize: 13,
    fontWeight: 700,
    color,
    background: bg,
    boxSizing: "border-box",
    fontFamily: "'Outfit', sans-serif",
    cursor: "pointer",
    outline: "none",
  };
}

const scholarshipCardStyle = {
  padding: 10,
  borderRadius: 14,
  background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
  border: "1px solid #dbeafe",
};

const scholarshipGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 126px",
  gap: 8,
  alignItems: "center",
};

const scholarshipTypeStyle = {
  width: "100%",
  minWidth: 0,
  height: 38,
  border: "1px solid #dbe3ee",
  borderRadius: 10,
  padding: "0 10px",
  fontSize: 13,
  color: "#0f2044",
  background: "#fff",
  boxSizing: "border-box",
  fontFamily: "'Outfit', sans-serif",
  cursor: "pointer",
};

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #e5e9f0",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid #f0f3f7",
  flexWrap: "wrap",
  gap: 12,
};

const titleStyle = { margin: 0, fontSize: 18, fontWeight: 700, color: "#0f2044" };
const subTitleStyle = { margin: "2px 0 0", fontSize: 12.5, color: "#64748b", fontWeight: 500 };
const toolbarStyle = { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" };
const paginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 16,
  padding: "12px 20px 16px",
  fontSize: 13,
  color: "#64748b",
  borderTop: "1px solid #f0f3f7",
};
const smallSelectStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: 13,
  fontFamily: "'Outfit', sans-serif",
  color: "#1e293b",
};
const pagerButtonStyle = (disabled) => ({
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  background: "none",
  padding: "3px 10px",
  fontSize: 16,
  cursor: disabled ? "not-allowed" : "pointer",
  color: disabled ? "#cbd5e1" : "#374151",
});
const refreshButton = {
  background: "#fff",
  border: "1px solid #dbe3ee",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  color: "#0f2044",
  cursor: "pointer",
};
const moneyWrapStyle = {
  display: "flex",
  alignItems: "center",
  border: "1px solid #dbe3ee",
  borderRadius: 10,
  background: "#fff",
  overflow: "hidden",
  minWidth: 0,
  height: 38,
};
const moneyPrefixStyle = {
  padding: "0 10px 0 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  borderRight: "1px solid #e2e8f0",
  flexShrink: 0,
  letterSpacing: "0.3px",
};
const moneyInputStyle = {
  width: "100%",
  minWidth: 0,
  border: "none",
  outline: "none",
  padding: "0 12px 0 10px",
  height: 36,
  fontSize: 13,
  color: "#0f2044",
  background: "transparent",
  boxSizing: "border-box",
};
