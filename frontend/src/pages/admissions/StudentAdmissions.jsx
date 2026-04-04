/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import BasicTable from "../../component/ui/table/basicTable";
import { getAuth } from "../../store/slice/auth.slice";
import { useStudents } from "../../hooks/useStudents";
import { useColleges } from "../../hooks/useCollege";
import { useToast } from "../../context/ToastContext";
import {
  AdmissionStatusSelect,
  normalizeAdmissionStatus,
} from "../../component/ui/studentmanagement/AdmissionStatus";

export default function StudentAdmissions() {
  const toast = useToast();
  const navigate = useNavigate();
  const auth = getAuth();
  const studentId = auth?.id || auth?.userMasterId || null;

  const {
    student,
    studentLoading,
    updateStudentAdmissionStatus,
    admissionUpdating,
  } = useStudents(studentId, toast);
  const { colleges, isLoadingColleges } = useColleges();

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const admissionRows = useMemo(() => {
    const admissionStatuses = student?.admissionStatuses || {};
    return (student?.interestedColleges || []).map((collegeRef) => {
      const collegeId = String(collegeRef?._id || collegeRef);
      const college = colleges?.find((item) => String(item._id) === collegeId);

      if (!college) {
        return null;
      }

      return {
        ...college,
        admissionStatus: normalizeAdmissionStatus(admissionStatuses[collegeId]),
      };
    }).filter(Boolean);
  }, [colleges, student?.admissionStatuses, student?.interestedColleges]);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return admissionRows.filter((item) =>
      [
        item.collegeName,
        item.collegeCode,
        item.collegeType,
        item.email,
        item.admissionStatus,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [admissionRows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filteredRows.slice(start, start + rowsPerPage);

  const columns = [
    {
      key: "index",
      header: "#",
      minWidth: 56,
      render: (_row, rowIndex) => start + rowIndex + 1,
    },
    {
      key: "collegeName",
      header: "College",
      minWidth: 230,
      render: (college) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0f2044" }}>{college.collegeName || "-"}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{college.collegeType || "-"}</div>
        </div>
      ),
    },
    { key: "collegeCode", header: "Code", minWidth: 120, render: (college) => college.collegeCode || "-" },
    { key: "email", header: "Email", minWidth: 220, render: (college) => college.email || "-" },
    {
      key: "admissionStatus",
      header: "Admission Status",
      minWidth: 180,
      render: (college) => (
        <div onClick={(e) => e.stopPropagation()}>
          <AdmissionStatusSelect
            value={college.admissionStatus}
            loading={admissionUpdating === `${studentId}:${college._id}`}
            disabled={admissionUpdating === `${studentId}:${college._id}`}
            onChange={(nextStatus) =>
              updateStudentAdmissionStatus(
                studentId,
                normalizeAdmissionStatus(nextStatus),
                college._id,
              )
            }
          />
        </div>
      ),
    },
    {
      key: "status",
      header: "College Status",
      minWidth: 140,
      render: (college) => <span style={statusChip(college.status)}>{college.status || "-"}</span>,
    },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>Admissions</h2>
            <p style={subTitleStyle}>Track every college you applied to and mark whether admission was taken.</p>
          </div>

          <div style={toolbarStyle}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search colleges..."
              width="320px"
              style={{ flex: "0 1 320px", minWidth: 240 }}
            />
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {studentLoading || isLoadingColleges ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={(college) => navigate(`/student/applied-colleges/${college._id}`)}
              emptyText="No applied colleges found"
              tableStyle={{ minWidth: 1060 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No applied colleges found
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

const statusChip = (status) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  background: status === "Active" ? "#ecfdf5" : status === "Rejected" ? "#fef2f2" : "#f8fafc",
  color: status === "Active" ? "#047857" : status === "Rejected" ? "#b91c1c" : "#64748b",
});

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
