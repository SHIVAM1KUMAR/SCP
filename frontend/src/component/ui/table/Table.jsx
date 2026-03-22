import { useState, useMemo } from "react";
import TableSkeleton from "../loader/TableSkeleton";

// ─── Table ────────────────────────────────────────────────────────────────────
// AmniCare: MUI DataGrid (x-data-grid) with filter/sort/pagination persistence
// EduAdmit: Custom table with same features — no MUI dependency
//
// Column def shape matches BasicTable for consistency:
//   { key, header, minWidth, render, align, defaultSort, sortType }
//
// Extra DataGrid-style props supported:
//   storageKey        → persists sort/pagination to localStorage
//   checkboxSelection → row checkboxes
//   onRowClick        → click handler
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [20, 50, 100];

function getSaved(storageKey, suffix, fallback) {
  if (!storageKey) return fallback;
  try {
    const saved = localStorage.getItem(`${storageKey}-${suffix}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
}

function setSaved(storageKey, suffix, value) {
  if (!storageKey) return;
  localStorage.setItem(`${storageKey}-${suffix}`, JSON.stringify(value));
}

export default function Table({
  rows             = [],
  columns          = [],
  pageSize         = 20,
  checkboxSelection = false,
  isLoading        = false,
  onRowClick,
  storageKey,
  height           = "60dvh",
  autoHeight       = false,
}) {
  // ── Persisted state (mirrors AmniCare's DataGrid persistence) ────────────
  const [sortConfig,  setSortConfig]  = useState(() => getSaved(storageKey, "sort",       { key: null, dir: "asc" }));
  const [pagination,  setPagination]  = useState(() => getSaved(storageKey, "pagination", { page: 0, pageSize }));
  const [hiddenCols,  setHiddenCols]  = useState(() => getSaved(storageKey, "columns",    {}));
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState(new Set());

  // Ensure every row has an id
  const safeRows = rows.map((row, i) => row?.id ? row : { id: i + 1, ...row });
  const visibleCols = columns.filter(c => c && !hiddenCols[c.key]);

  // ── Sort ─────────────────────────────────────────────────────────────────
  const sortedRows = useMemo(() => {
    let data = [...safeRows];

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(row =>
        visibleCols.some(col => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Apply sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aV = a[sortConfig.key];
        const bV = b[sortConfig.key];
        const col = columns.find(c => c.key === sortConfig.key);
        let cmp = col?.sortType === "number"
          ? Number(aV ?? 0) - Number(bV ?? 0)
          : String(aV ?? "").localeCompare(String(bV ?? ""), undefined, { sensitivity: "base" });
        return sortConfig.dir === "desc" ? -cmp : cmp;
      });
    }
    return data;
  }, [safeRows, sortConfig, search]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(sortedRows.length / pagination.pageSize);
  const start      = pagination.page * pagination.pageSize;
  const pageRows   = sortedRows.slice(start, start + pagination.pageSize);

  const handleSort = (key) => {
    const newSort = sortConfig.key === key && sortConfig.dir === "asc"
      ? { key, dir: "desc" } : { key, dir: "asc" };
    setSortConfig(newSort);
    setSaved(storageKey, "sort", newSort);
  };

  const handlePage = (page) => {
    const next = { ...pagination, page };
    setPagination(next);
    setSaved(storageKey, "pagination", next);
  };

  const handlePageSize = (ps) => {
    const next = { page: 0, pageSize: Number(ps) };
    setPagination(next);
    setSaved(storageKey, "pagination", next);
  };

  const toggleCol = (key) => {
    const next = { ...hiddenCols, [key]: !hiddenCols[key] };
    setHiddenCols(next);
    setSaved(storageKey, "columns", next);
  };

  const toggleAll = (checked) => {
    setSelected(checked ? new Set(pageRows.map(r => r.id)) : new Set());
  };

  const toggleRow = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey) return <span style={{ opacity: 0.3, fontSize: 10 }}>↕</span>;
    return <span style={{ fontSize: 10 }}>{sortConfig.dir === "asc" ? "↑" : "↓"}</span>;
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div style={{ width: "100%", fontFamily: "'Outfit', sans-serif" }}>

      {/* Toolbar: search + column toggle */}
      <div className="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2} width={14} height={14}>
            <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
          </svg>
          <input
            value={search} onChange={e => { setSearch(e.target.value); handlePage(0); }}
            placeholder="Search…"
            style={{ paddingLeft: 30, paddingRight: 10, height: 34, border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 13, fontFamily: "'Outfit', sans-serif", outline: "none", width: 200 }}
            onFocus={e => (e.target.style.borderColor = "#1a6fa8")}
            onBlur={e  => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        {/* Column visibility toggle */}
        <div className="dropdown">
          <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown"
            style={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            Columns
          </button>
          <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 160, fontSize: 13 }}>
            {columns.map(col => (
              <li key={col.key}>
                <label className="dropdown-item d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                  <input type="checkbox" checked={!hiddenCols[col.key]} onChange={() => toggleCol(col.key)} />
                  {col.header}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflow: "auto", height: autoHeight ? "auto" : height, border: "1px solid #e5e9f0", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
          <thead>
            <tr style={{ background: "#f8fafc", position: "sticky", top: 0, zIndex: 1 }}>
              {checkboxSelection && (
                <th style={{ padding: "12px 12px", borderBottom: "2px solid #e5e9f0", width: 40 }}>
                  <input type="checkbox"
                    checked={pageRows.length > 0 && pageRows.every(r => selected.has(r.id))}
                    onChange={e => toggleAll(e.target.checked)}
                    style={{ width: 15, height: 15 }}
                  />
                </th>
              )}
              {visibleCols.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: "12px 16px", textAlign: col.align || "left",
                    borderBottom: "2px solid #e5e9f0",
                    fontSize: 13, fontWeight: 600, color: "#1a6fa8",
                    minWidth: col.minWidth, cursor: "pointer",
                    userSelect: "none", whiteSpace: "nowrap",
                  }}
                >
                  {col.header} <SortIcon colKey={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + (checkboxSelection ? 1 : 0)}
                  style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>
                  No data available
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? "pointer" : "default", borderBottom: "1px solid #f0f3f7" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {checkboxSelection && (
                    <td style={{ padding: "13px 12px" }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)}
                        style={{ width: 15, height: 15 }} />
                    </td>
                  )}
                  {visibleCols.map(col => {
                    const val = col.render ? col.render(row) : row[col.key];
                    return (
                      <td key={col.key} style={{
                        padding: "13px 16px", textAlign: col.align || "left",
                        fontSize: 13.5, color: "#374151",
                        maxWidth: col.minWidth || 200,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                        title={typeof val === "string" ? val : undefined}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sortedRows.length > 0 && (
        <div className="d-flex align-items-center justify-content-end gap-3 mt-2" style={{ fontSize: 13, color: "#64748b" }}>
          <div className="d-flex align-items-center gap-2">
            <span>Rows:</span>
            <select value={pagination.pageSize} onChange={e => handlePageSize(e.target.value)}
              style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "2px 8px", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <span>{start + 1}–{Math.min(start + pagination.pageSize, sortedRows.length)} of {sortedRows.length}</span>
          <div className="d-flex gap-1">
            <button onClick={() => handlePage(0)} disabled={pagination.page === 0}
              style={{ border: "1px solid #e2e8f0", borderRadius: 5, background: "none", padding: "2px 8px", cursor: pagination.page === 0 ? "not-allowed" : "pointer", color: pagination.page === 0 ? "#cbd5e1" : "#374151" }}>«</button>
            <button onClick={() => handlePage(pagination.page - 1)} disabled={pagination.page === 0}
              style={{ border: "1px solid #e2e8f0", borderRadius: 5, background: "none", padding: "2px 8px", cursor: pagination.page === 0 ? "not-allowed" : "pointer", color: pagination.page === 0 ? "#cbd5e1" : "#374151" }}>‹</button>
            <button onClick={() => handlePage(pagination.page + 1)} disabled={pagination.page >= totalPages - 1}
              style={{ border: "1px solid #e2e8f0", borderRadius: 5, background: "none", padding: "2px 8px", cursor: pagination.page >= totalPages - 1 ? "not-allowed" : "pointer", color: pagination.page >= totalPages - 1 ? "#cbd5e1" : "#374151" }}>›</button>
            <button onClick={() => handlePage(totalPages - 1)} disabled={pagination.page >= totalPages - 1}
              style={{ border: "1px solid #e2e8f0", borderRadius: 5, background: "none", padding: "2px 8px", cursor: pagination.page >= totalPages - 1 ? "not-allowed" : "pointer", color: pagination.page >= totalPages - 1 ? "#cbd5e1" : "#374151" }}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}