/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../component/ui/loader/Loader";
import { useToast } from "../../context/ToastContext";
import { useCounselling } from "../../hooks/useCounselling";
import { C, font, SectionCard, InfoField, ActionBtn } from "../../component/ui/studentmanagement/StudentDetailParts";

const displayStatus = (status = "") => (status === "Completed" ? "Counseled" : status || "-");

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

export default function CounsellingStudentSessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    sessions,
    loadingSessions,
    fetchSessionById,
    fetchStudentDashboard,
  } = useCounselling({ enableRealtime: false, toast });

  const [loadingDetail, setLoadingDetail] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingDetail(true);
      try {
        const record = await fetchSessionById(id);
        setSession(record);
      } catch (error) {
        toast(error?.response?.data?.message || error?.message || "Failed to load session", "error");
      } finally {
        setLoadingDetail(false);
      }
    };

    if (id) void load();
  }, [id]);

  useEffect(() => {
    void fetchStudentDashboard?.();
  }, []);

  const detail = useMemo(
    () => session || sessions.find((item) => String(item._id) === String(id)) || null,
    [session, sessions, id],
  );

  const studentName = `${detail?.student?.firstName || ""} ${detail?.student?.lastName || ""}`.trim() || "-";
  const backPath = "/student/counselling";

  return (
    <div style={{ background: "#f4f6fb", minHeight: "100vh", padding: "20px 16px 48px", fontFamily: font.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .student-counselling-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 760px) { .student-counselling-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: C.shadowMd, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: 5, background: `linear-gradient(90deg,${C.navy} 0%,${C.gold} 60%,${C.goldLt} 100%)` }} />
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: C.navyLight, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>
                📅
              </div>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 400, color: C.navy, margin: "0 0 5px", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Counselling Booking Details
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.slate, fontFamily: font.body, letterSpacing: "0.8px", background: C.navyLight, padding: "3px 10px", borderRadius: 6 }}>
                    {displayStatus(detail?.status)}
                  </span>
                  <span style={{ fontSize: 12, color: C.slate, fontFamily: font.body, background: C.cream, border: `1px solid ${C.border}`, padding: "3px 10px", borderRadius: 6 }}>
                    {formatDate(detail?.scheduledDate || detail?.scheduledAt)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <ActionBtn label="Back" variant="default" onClick={() => navigate(backPath)} />
            </div>
          </div>
        </div>
      </div>

      {loadingDetail || loadingSessions ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 260, gap: 14 }}>
          <Loader size={28} />
        </div>
      ) : detail ? (
        <div className="student-counselling-grid">
          <SectionCard title="Booking Information" icon="🧾">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <InfoField label="Counsellor" value={detail.counsellor?.name || "-"} fullWidth />
              <InfoField label="College" value={detail.college?.collegeName || "-"} />
              <InfoField label="Date" value={formatDate(detail.scheduledDate || detail.scheduledAt)} />
              <InfoField label="Time" value={formatTime(detail.scheduledTime)} />
              <InfoField label="Status" value={displayStatus(detail.status)} />
              <InfoField label="Notes" value={detail.notes || "-"} fullWidth />
            </div>
          </SectionCard>

          <SectionCard title="Counsellor Details" icon="👤">
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: C.cream }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.slateXl, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                  Counsellor
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  <InfoField label="Name" value={detail.counsellor?.name || "-"} />
                  <InfoField label="Email" value={detail.counsellor?.email || "-"} />
                  <InfoField label="Phone" value={detail.counsellor?.phone || "-"} />
                  <InfoField label="Department" value={detail.counsellor?.department || "-"} />
                </div>
              </div>

              <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, background: C.cream }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.slateXl, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                  Student
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  <InfoField label="Name" value={studentName} />
                  <InfoField label="Email" value={detail.student?.email || "-"} />
                  <InfoField label="Phone" value={detail.student?.phone || "-"} />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : (
        <div style={{ color: "#64748b", fontSize: 14 }}>Session not found.</div>
      )}
    </div>
  );
}
