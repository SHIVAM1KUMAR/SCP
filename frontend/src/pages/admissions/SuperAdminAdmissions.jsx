/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import BasicTable from "../../component/ui/table/basicTable";
import { useStudents } from "../../hooks/useStudents";
import { useColleges } from "../../hooks/useCollege";
import { AdmissionStatusBadge, normalizeAdmissionStatus } from "../../component/ui/studentmanagement/AdmissionStatus";
import { StatusBadge } from "../../component/ui/studentmanagement/StatusBadge";

export default function SuperAdminAdmissions() {
  const navigate = useNavigate();
  const { students, isLoadingStudents } = useStudents();
  const { colleges, isLoadingColleges } = useColleges();

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const collegeMap = useMemo(
    () =>
      new Map(
        (colleges || []).map((college) => [String(college._id), college]),
      ),
    [colleges],
  );

  const reportRows = useMemo(() => {
    const items = [];

    (students || []).forEach((student) => {
      const admissionStatuses = student?.admissionStatuses || {};
      (student?.interestedColleges || []).forEach((collegeRef) => {
        const collegeId = String(collegeRef?._id || collegeRef);
        const college = collegeMap.get(collegeId);
        if (!college) return;
        items.push({
          studentId: student._id,
          studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim() || "-",
          studentEmail: student.email || "-",
          studentStatus: student.status || "-",
          collegeId,
          collegeName: college.collegeName || "-",
          collegeCode: college.collegeCode || "-",
          collegeType: college.collegeType || "-",
          collegeStatus: college.status || "-",
          admissionStatus: normalizeAdmissionStatus(admissionStatuses[collegeId]),
        });
      });
    });

    return items;
  }, [collegeMap, students]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return reportRows.filter((item) =>
      [
        item.studentName,
        item.studentEmail,
        item.collegeName,
        item.collegeCode,
        item.admissionStatus,
        item.studentStatus,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [reportRows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filteredRows.slice(start, start + rowsPerPage);

  const columns = [
    {
      key: "studentName",
      header: "Student",
      minWidth: 220,
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0f2044" }}>{item.studentName}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{item.studentEmail}</div>
        </div>
      ),
    },
    { key: "collegeName", header: "College", minWidth: 220, render: (item) => item.collegeName },
    { key: "collegeCode", header: "Code", minWidth: 110, render: (item) => item.collegeCode },
    { key: "collegeType", header: "Type", minWidth: 130, render: (item) => item.collegeType },
    {
      key: "admissionStatus",
      header: "Admission",
      minWidth: 150,
      render: (item) => <AdmissionStatusBadge status={item.admissionStatus} />,
    },
    {
      key: "studentStatus",
      header: "Student Status",
      minWidth: 140,
      render: (item) => <StatusBadge status={item.studentStatus} />,
    },
    {
      key: "collegeStatus",
      header: "College Status",
      minWidth: 140,
      render: (item) => <StatusBadge status={item.collegeStatus} />,
    },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>Admissions Report</h2>
            <p style={subTitleStyle}>All student-to-college admission updates in one view.</p>
          </div>

          <div style={toolbarStyle}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search report..."
              width="320px"
              style={{ flex: "0 1 320px", minWidth: 240 }}
            />
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {isLoadingStudents || isLoadingColleges ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={(item) => navigate(`/superadmin/students/${item.studentId}`)}
              emptyText="No admission records found"
              tableStyle={{ minWidth: 1160 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No admission records found
            </div>
          )}
        </div>

        {filteredRows.length > 0 && (
          <div style={paginationStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                style={selectStyle}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              {start + 1}-{Math.min(start + rowsPerPage, filteredRows.length)} of {filteredRows.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={pagerButtonStyle(safePage === 1)}
              >
                {"<"}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={pagerButtonStyle(safePage >= totalPages)}
              >
                {">"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
const selectStyle = {
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
