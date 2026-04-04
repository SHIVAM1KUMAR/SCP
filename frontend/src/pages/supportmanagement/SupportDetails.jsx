/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../component/ui/loader/Loader";
import BasicModal from "../../component/ui/modal/basicModal";
import Button from "../../component/ui/button/Button";
import { useToast } from "../../context/ToastContext";
import { getAuth } from "../../store/slice/auth.slice";
import { useSupport } from "../../hooks/useSupport";
import {
  SupportStatusBadge,
  SupportStatusSelect,
  getSupportStatusLabel,
  normalizeSupportStatus,
} from "../../constant/support";
import SupportTicketForm from "../../component/forms/support/SupportTicketForm";

const fieldValueStyle = {
  margin: 0,
  fontSize: 14,
  color: "#0f2044",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

const infoCard = {
  background: "#f8fafc",
  border: "1px solid #e5e9f0",
  borderRadius: 12,
  padding: 16,
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SupportDetails() {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const auth = getAuth();
  const role = String(auth.role || "").toLowerCase();
  const isSuperAdmin = role === "superadmin";
  const isOwner = ["college", "student"].includes(role);
  const {
    ticket,
    loadingTicket,
    fetchTicketById,
    updateSupportTicketStatus,
    updateSupportTicket,
    deleteSupportTicket,
  } = useSupport({
    enableRealtime: true,
    toast,
    loadTickets: false,
    loadAlerts: true,
  });

  const [status, setStatus] = useState("Open");
  const [resolutionNote, setResolutionNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!id) return;
    void fetchTicketById(id);
  }, [id]);

  useEffect(() => {
    if (!ticket) return;
    setStatus(normalizeSupportStatus(ticket.status));
    setResolutionNote(ticket.resolutionNote || "");
  }, [ticket?._id, ticket?.updatedAt, ticket?.status, ticket?.resolutionNote]);

  const creatorName = useMemo(() => ticket?.creator?.name || "-", [ticket]);

  const handleSaveResolution = async () => {
    if (!ticket?._id) return;
    setSaving(true);
    try {
      const updated = await updateSupportTicketStatus(ticket._id, {
        status,
        resolutionNote,
      });
      if (updated) {
        await fetchTicketById(ticket._id);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (payload) => {
    if (!ticket?._id) return;
    const updated = await updateSupportTicket(ticket._id, payload);
    if (updated) {
      setShowEdit(false);
      await fetchTicketById(ticket._id);
    }
  };

  const handleDelete = async () => {
    if (!ticket?._id) return;
    const ok = window.confirm("Delete this support ticket?");
    if (!ok) return;
    const deleted = await deleteSupportTicket(ticket._id);
    if (deleted) {
      navigate(-1);
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>{ticket?.ticketNo || "Support Ticket"}</h2>
            <p style={subTitleStyle}>{ticket?.subject || "Ticket details and resolution status"}</p>
          </div>

          <div className="sd-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {ticket?.status ? <SupportStatusBadge status={ticket.status} /> : null}
            <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
              Back
            </Button>
            {isOwner && ticket && ["Open", "InProgress"].includes(normalizeSupportStatus(ticket.status)) && (
              <>
                <Button variant="outlined" size="small" onClick={() => setShowEdit(true)}>
                  Edit
                </Button>
                <Button variant="danger" size="small" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {loadingTicket ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : ticket ? (
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                <div style={infoCard}>
                  <div style={labelStyle}>Description</div>
                  <p style={fieldValueStyle}>{ticket.description || "-"}</p>
                </div>
                <div style={{ ...infoCard, display: "grid", gap: 12 }}>
                  <DetailLine label="Created By" value={creatorName} />
                  <DetailLine label="Role" value={ticket.creatorRole || "-"} />
                  <DetailLine label="Category" value={ticket.category || "-"} />
                  <DetailLine label="Priority" value={ticket.priority || "-"} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <InfoBox label="Contact Email" value={ticket.contactEmail || "-"} />
                <InfoBox label="Contact Phone" value={ticket.contactPhone || "-"} />
                <InfoBox label="Preferred Contact" value={ticket.contactPreference || "-"} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                <InfoBox label="Created" value={formatDateTime(ticket.createdAt)} />
                <InfoBox label="Updated" value={formatDateTime(ticket.updatedAt)} />
                <InfoBox label="Resolved" value={formatDateTime(ticket.resolvedAt)} />
                <InfoBox label="Current Status" value={getSupportStatusLabel(ticket.status)} />
              </div>

              {isSuperAdmin ? (
                <div style={infoCard}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    <div>
                      <div style={labelStyle}>Update Status</div>
                      <SupportStatusSelect value={status} onChange={setStatus} />
                    </div>
                    <div>
                      <div style={labelStyle}>Resolution Note</div>
                      <textarea
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        rows={4}
                        placeholder="Add resolution details for student or college"
                        style={textAreaStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                    <Button onClick={handleSaveResolution} variant="primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Update"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={infoCard}>
                  <div style={labelStyle}>Resolution Note</div>
                  <p style={fieldValueStyle}>{ticket.resolutionNote || "Waiting for support review."}</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              Support ticket not found
            </div>
          )}
        </div>
      </div>

      <BasicModal
        open={showEdit && isOwner && ticket && ["Open", "InProgress"].includes(normalizeSupportStatus(ticket.status))}
        onClose={() => setShowEdit(false)}
        title="Edit Support Ticket"
        maxWidth="lg"
      >
        <SupportTicketForm
          onSubmit={handleSaveEdit}
          loading={saving}
          initialValues={{
            subject: ticket?.subject || "",
            category: ticket?.category || "General",
            description: ticket?.description || "",
            contactEmail: ticket?.contactEmail || "",
            contactPhone: ticket?.contactPhone || "",
            contactPreference: ticket?.contactPreference || "Email",
          }}
          submitLabel="Save Ticket"
        />
      </BasicModal>
    </div>
  );
}

function DetailLine({ label, value }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 14, color: "#0f2044" }}>{value || "-"}</div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={infoCard}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontSize: 14, color: "#0f2044", lineHeight: 1.6 }}>{value || "-"}</div>
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

const textAreaStyle = {
  width: "100%",
  minHeight: 120,
  borderRadius: 8,
  border: "1px solid #dbe3ef",
  padding: "10px 12px",
  fontSize: 13,
  fontFamily: "'Outfit', sans-serif",
  color: "#1e293b",
  outline: "none",
  resize: "vertical",
};
