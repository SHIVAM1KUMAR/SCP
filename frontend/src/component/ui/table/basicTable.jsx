import { useMemo } from "react";
import TableSkeleton from "../loader/TableSkeleton";

// ─── BasicTable ───────────────────────────────────────────────────────────────
// AmniCare: MUI Table + TableHead + TableBody + TableRow + TableCell
// EduAdmit: Plain HTML table — same Column<T> interface
//
// Column shape:
//   { key, header, minWidth, render?, align?, defaultSort?, sortType? }
// ─────────────────────────────────────────────────────────────────────────────

const BasicTable = ({
  columns     = [],
  rows        = [],
  emptyText   = "No records found",
  stickyHeader = true,
  isLoading   = false,
}) => {
  const sortedRows = useMemo(() => {
    if (!rows.length) return rows;
    const sortCol = columns.find(c => c.defaultSort);
    if (!sortCol) return rows;

    const { key, defaultSort, sortType = "string" } = sortCol;
    return [...rows].sort((a, b) => {
      const aV = a[key], bV = b[key];
      if (sortType === "number") {
        return defaultSort === "asc"
          ? Number(aV ?? 0) - Number(bV ?? 0)
          : Number(bV ?? 0) - Number(aV ?? 0);
      }
      return defaultSort === "asc"
        ? String(aV ?? "").localeCompare(String(bV ?? ""), undefined, { sensitivity: "base" })
        : String(bV ?? "").localeCompare(String(aV ?? ""), undefined, { sensitivity: "base" });
    });
  }, [rows, columns]);

  if (isLoading) return <TableSkeleton />;

  if (!sortedRows.length) {
    return (
      <div className="text-center py-4 px-3">
        <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'Outfit', sans-serif" }}>
          {emptyText}
        </span>
      </div>
    );
  }

  return (
    <div style={{ overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Outfit', sans-serif" }}>
        <thead style={{ position: stickyHeader ? "sticky" : "static", top: 0, zIndex: 1, background: "#f8fafc" }}>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  padding: "11px 16px",
                  textAlign: col.align || "left",
                  borderBottom: "2px solid #e5e9f0",
                  fontSize: 13, fontWeight: 600,
                  color: "#1a6fa8",
                  minWidth: col.minWidth,
                  whiteSpace: "nowrap",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, rowIndex) => (
            <tr
              key={row?.id ?? rowIndex}
              style={{ borderBottom: "1px solid #f0f3f7" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {columns.map(col => {
                const value = col.render ? col.render(row) : row[col.key];
                return (
                  <td
                    key={col.key}
                    style={{
                      padding: "12px 16px",
                      textAlign: col.align || "left",
                      fontSize: 13.5, color: "#374151",
                      maxWidth: col.minWidth || 200,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={typeof value === "string" ? value : undefined}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BasicTable;