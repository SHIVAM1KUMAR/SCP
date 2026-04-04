/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../component/ui/loader/Loader";
import { useToast } from "../../context/ToastContext";
import { getAuth } from "../../store/slice/auth.slice";
import { useResults } from "../../hooks/useResults";
import { C, font, SectionCard, InfoField, ActionBtn } from "../../component/ui/studentmanagement/StudentDetailParts";
import ResultModal from "../../component/forms/results/ResultModal";
import {
  formatScholarshipAmount,
  ResultStatusBadge,
  ScholarshipTypeBadge,
} from "../../constant/results.jsx";

const formatDate = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
};

export default function ResultDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const auth = getAuth();
  const role = auth?.role || "";
  const isCollege = role === "College";
  const isSuperAdmin = role === "SuperAdmin";
  const backPath = isCollege ? "/college/results" : isSuperAdmin ? "/superadmin/results" : "/student/results";

  const { results, loadingResults, saving, fetchResultById, saveResult } = useResults(toast);

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [result, setResult] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingDetail(true);
      try {
        const record = await fetchResultById(id);
        setResult(record);
      } catch (error) {
        toast(error?.response?.data?.message || error?.message || "Failed to load result", "error");
      } finally {
        setLoadingDetail(false);
      }
    };
    if (id) void load();
  }, [id]);

  const detail = useMemo(
    () => result || results.find((item) => String(item._id) === String(id)) || null,
    [result, results, id],
  );

  const canEditResult = isCollege;
  const scholarshipAmount = getScholarshipAmount(detail);
  const scholarshipType = getScholarshipType(detail);

  const handleSave = async ({ id: resultId, payload }) => {
    const saved = await saveResult({ id: resultId, payload });
    if (saved?._id) {
      setResult(saved);
    }
    setShowEditModal(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 760px) { .result-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: "#f4f6fb", minHeight: "100vh", padding: "20px 16px 48px", fontFamily: font.body }}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: C.navyLight, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>
                  R
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 5px", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {detail?.title || "Result Details"}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <ResultStatusBadge status={detail?.resultStatus || "Pending"} />
                    <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                      {formatDate(detail?.submittedAt || detail?.updatedAt || detail?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <ActionBtn label="Back" variant="default" onClick={() => navigate(backPath)} />
                {canEditResult ? (
                  <ActionBtn label="Edit Result" variant="primary" onClick={() => setShowEditModal(true)} />
                ) : (
                  <div style={{ fontSize: 13, color: "#64748b", padding: "8px 10px" }}>Read only view</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {loadingDetail || loadingResults ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, gap: 14 }}>
            <Loader size={28} />
          </div>
        ) : detail ? (
          <div className="result-grid">
            <SectionCard title="Result Information" icon="R">
              <div className="sd-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoField label="Test Title" value={detail.title || "-"} fullWidth />
                <InfoField label="Student" value={`${detail.student?.firstName || ""} ${detail.student?.lastName || ""}`.trim() || "-"} />
                <InfoField label="College" value={detail.college?.collegeName || "-"} />
                <InfoField label="Marks" value={formatScore(detail)} />
                <InfoField label="Result Status" value={<ResultStatusBadge status={detail.resultStatus || "Pending"} />} />
                <InfoField label="Completed On" value={formatDate(detail.submittedAt || detail.updatedAt || detail.createdAt)} />
                <InfoField label="Result Note" value={detail.resultNote || "-"} fullWidth />
              </div>
            </SectionCard>

            <SectionCard title="Test Snapshot" icon="T">
              <div className="sd-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoField label="Test Status" value={detail.status || "-"} />
                <InfoField label="Mode" value={detail.mode === "link" ? "External Link" : "Platform Test"} />
                <InfoField label="Date" value={formatDate(detail.scheduledDate || detail.scheduledAt)} />
                <InfoField label="Time" value={detail.scheduledTime || "-"} />
                <InfoField label="Notes" value={detail.notes || "-"} fullWidth />
                {detail.mode === "link" && <InfoField label="Test Link" value={detail.testLink || "-"} fullWidth />}
              </div>
            </SectionCard>

            <SectionCard title="Scholarship Summary" icon="S">
              <div className="sd-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoField
                  label="Scholarship Amount"
                  value={scholarshipAmount ? formatScholarshipAmount(scholarshipAmount) : "Not awarded"}
                />
                <InfoField
                  label="Scholarship Type"
                  value={scholarshipType ? <ScholarshipTypeBadge value={scholarshipType} /> : "Not awarded"}
                />
              </div>
            </SectionCard>
          </div>
        ) : (
          <div style={{ color: "#64748b", fontSize: 14 }}>Result not found.</div>
        )}
      </div>

      <ResultModal
        open={showEditModal}
        result={detail}
        loading={saving}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSave}
      />
    </>
  );
}

function formatScore(item) {
  const score = Number(item?.score);
  const totalMarks = Number(item?.totalMarks);
  if (!Number.isFinite(score) || !Number.isFinite(totalMarks)) return "-";
  return `${score} / ${totalMarks}`;
}

function getScholarshipAmount(detail) {
  const raw = detail?.scholarshipAmount ?? detail?.scholarship?.amount ?? detail?.amount ?? null;
  const amount = Number(raw);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function getScholarshipType(detail) {
  const raw = String(detail?.scholarshipType || detail?.scholarship?.type || detail?.durationType || "").trim();
  if (!raw) return "";
  return raw;
}
