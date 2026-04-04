/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";
import { useToast } from "../../context/ToastContext";
import { useTests } from "../../hooks/useTests";
import { C, font, SectionCard, InfoField, ActionBtn } from "../../component/ui/studentmanagement/StudentDetailParts";
import { TestStatusBadge, displayTestMode } from "../../constant/tests.jsx";

const formatDate = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN");
};

const formatTime = (value) => {
  if (!value) return "-";
  try {
    return new Date(`1970-01-01T${value}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

export default function TestStudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { tests, loadingTests, fetchTestById } = useTests(toast);

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [test, setTest] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingDetail(true);
      try {
        const record = await fetchTestById(id);
        setTest(record);
      } catch (error) {
        toast(error?.response?.data?.message || error?.message || "Failed to load test", "error");
      } finally {
        setLoadingDetail(false);
      }
    };
    if (id) void load();
  }, [id]);

  const detail = useMemo(
    () => test || tests.find((item) => String(item._id) === String(id)) || null,
    [test, tests, id],
  );

  const backPath = "/student/tests";
  const canStartTest = detail?.mode === "platform" && ["Scheduled", "Rescheduled"].includes(String(detail?.status || "").trim());
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .td-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 760px) { .td-grid { grid-template-columns: 1fr; } }
        .question-grid { display: grid; gap: 12px; }
        .question-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 560px) { .question-options { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: "#f4f6fb", minHeight: "100vh", padding: "20px 16px 48px", fontFamily: font.body }}>
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: C.navyLight, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>
                  📝
                </div>
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 5px", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {detail?.title || "Test Details"}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <TestStatusBadge status={detail?.status || "Scheduled"} />
                    <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                      {formatDate(detail?.scheduledDate || detail?.scheduledAt)}
                    </span>
                    <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.navyLight, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                      {displayTestMode(detail?.mode)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <ActionBtn label="Back" variant="default" onClick={() => navigate(backPath)} />
                {canStartTest && (
                  <Button variant="primary" onClick={() => navigate(`/student/tests/${detail._id}/attempt`)}>
                    Start Test
                  </Button>
                )}
                {detail?.mode === "link" && detail?.testLink && (
                  <Button variant="primary" onClick={() => window.open(detail.testLink, "_blank", "noopener,noreferrer")}>
                    Open Link
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {loadingDetail || loadingTests ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, gap: 14 }}>
            <Loader size={28} />
          </div>
        ) : detail ? (
          <div className="td-grid">
            <SectionCard title="Test Information" icon="🧪">
              <div className="sd-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <InfoField label="Test Title" value={detail.title || "-"} fullWidth />
                <InfoField label="College" value={detail.college?.collegeName || "-"} />
                <InfoField label="Mode" value={displayTestMode(detail.mode)} />
                <InfoField label="Date" value={formatDate(detail.scheduledDate || detail.scheduledAt)} />
                <InfoField label="Time" value={formatTime(detail.scheduledTime)} />
                <InfoField label="Status" value={detail.status || "-"} />
                <InfoField label="Notes" value={detail.notes || "-"} fullWidth />
                {detail.mode === "link" && (
                  <InfoField label="Test Link" value={detail.testLink || "-"} fullWidth />
                )}
              </div>
            </SectionCard>
          </div>
        ) : (
          <div style={{ color: "#64748b", fontSize: 14 }}>Test not found.</div>
        )}
      </div>
    </>
  );
}
