/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import BasicTable from "../../component/ui/table/basicTable";
import { useToast } from "../../context/ToastContext";
import { getAuth } from "../../store/slice/auth.slice";
import { useSupport } from "../../hooks/useSupport";
import SupportTicketForm from "../../component/forms/support/SupportTicketForm";
import { SupportStatusBadge } from "../../constant/support";

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

const getCreatorLabel = (ticket) => ticket?.creator?.name || ticket?.creatorRole || "-";
const getSupportEmail = (contact) =>
  contact?.email ||
  import.meta.env.VITE_SUPPORT_EMAIL ||
  "support@eduexample.com";
const getSupportPhone = (contact) =>
  contact?.phoneNumber ||
  import.meta.env.VITE_SUPPORT_PHONE ||
  "+91 00000 00000";

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} width={16} height={16}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} width={16} height={16}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.86.32 1.7.6 2.51a2 2 0 01-.45 2.11L8 9.61a16 16 0 006.39 6.39l1.27-1.26a2 2 0 012.11-.45c.81.28 1.65.48 2.51.6A2 2 0 0122 16.92z" />
  </svg>
);

export default function SupportManagement() {
  const toast = useToast();
  const navigate = useNavigate();
  const auth = getAuth();
  const role = String(auth.role || "").toLowerCase();
  const isSuperAdmin = role === "superadmin";
  const { tickets, loadingTickets, fetchTickets, createSupportTicket, contact } = useSupport({
    enableRealtime: true,
    toast,
    loadTickets: true,
    loadAlerts: true,
  });

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    void fetchTickets?.();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (tickets || []).filter((ticket) =>
      [
        ticket.ticketNo,
        ticket.subject,
        ticket.category,
        ticket.description,
        ticket.contactEmail,
        ticket.contactPhone,
        ticket.status,
        ticket.creator?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [search, tickets]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);

  const handleRowClick = (ticket) => {
    const base = isSuperAdmin ? "/superadmin/support" : role === "college" ? "/college/support" : "/student/support";
    navigate(`${base}/${ticket._id}`);
  };

  const handleCreateTicket = async (payload) => {
    setSubmitting(true);
    try {
      const created = await createSupportTicket(payload);
      if (created) {
        setPage(1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "ticketNo",
      header: "Ticket",
      minWidth: 180,
      render: (ticket) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0f2044" }}>{ticket.ticketNo || "-"}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{ticket.subject || "-"}</div>
        </div>
      ),
    },
    { key: "creator", header: "Created By", minWidth: 190, render: (ticket) => getCreatorLabel(ticket) },
    { key: "category", header: "Category", minWidth: 130, render: (ticket) => ticket.category || "-" },
    {
      key: "contact",
      header: "Contact",
      minWidth: 220,
      render: (ticket) => (
        <div style={{ display: "grid", gap: 2 }}>
          <span>{ticket.contactEmail || "-"}</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{ticket.contactPhone || "-"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      minWidth: 140,
      render: (ticket) => <SupportStatusBadge status={ticket.status} />,
    },
    {
      key: "updatedAt",
      header: "Updated",
      minWidth: 160,
      render: (ticket) => formatDateTime(ticket.updatedAt || ticket.createdAt),
    },
  ];

  if (isSuperAdmin) {
    columns.push({
      key: "note",
      header: "Resolution",
      minWidth: 200,
      render: (ticket) => ticket.resolutionNote || "-",
    });
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      {!isSuperAdmin && (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <div>
              <h2 style={titleStyle}>Support</h2>
              <p style={subTitleStyle}>Raise a support issue and track the status as it is handled.</p>
            </div>
            <button onClick={() => setShowForm((value) => !value)} style={toggleButtonStyle}>
              {showForm ? "Hide Ticket Form" : "Raise Ticket"}
            </button>
          </div>

          <div style={{ padding: "0 20px 18px" }}>
            <div style={contactCardStyle}>
              <div style={contactTitleStyle}>Super Admin Contact</div>
              <div style={contactGridStyle}>
                <ContactLine label="Name" value={contact?.name || "Super Admin"} />
                <ContactLine label="Email" value={getSupportEmail(contact)} icon={<MailIcon />} />
                <ContactLine label="Phone" value={getSupportPhone(contact)} icon={<PhoneIcon />} />
                <ContactLine label="Help Type" value="Email, phone, and support ticket" />
              </div>
            </div>
          </div>

          {showForm && (
            <div style={{ padding: "0 20px 20px" }}>
              <SupportTicketForm onSubmit={handleCreateTicket} loading={submitting} />
            </div>
          )}
        </div>
      )}

      <div style={{ ...cardStyle, marginTop: isSuperAdmin ? 0 : 16 }}>
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>{isSuperAdmin ? "Support Tickets" : "Your Tickets"}</h2>
            <p style={subTitleStyle}>
              {isSuperAdmin
                ? "Review new support requests from colleges and students, then update their status."
                : "Review the support tickets you raised with the superadmin team."}
            </p>
          </div>

          <div style={toolbarStyle}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search tickets..."
              width="320px"
              style={{ flex: "0 1 320px", minWidth: 240 }}
            />
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {loadingTickets ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              onRowClick={handleRowClick}
              emptyText="No support tickets found"
              tableStyle={{ minWidth: isSuperAdmin ? 1100 : 980 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No support tickets found
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
              {start + 1}â€“{Math.min(start + rowsPerPage, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={pagerButtonStyle(safePage === 1)}
              >
                â€¹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={pagerButtonStyle(safePage >= totalPages)}
              >
                â€º
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactLine({ label, value, icon = null }) {
  return (
    <div>
      <div style={contactLabelStyle}>{label}</div>
      <div style={contactValueStyle}>
        {icon && <span style={contactIconStyle}>{icon}</span>}
        <span>{value || "-"}</span>
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
const toggleButtonStyle = {
  height: 36,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid #dbe3ef",
  background: "#fff",
  color: "#0f2044",
  fontWeight: 700,
  cursor: "pointer",
};
const contactCardStyle = {
  background: "#f8fafc",
  border: "1px solid #e5e9f0",
  borderRadius: 12,
  padding: 16,
};
const contactTitleStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  marginBottom: 10,
};
const contactGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 18,
};
const contactLabelStyle = {
  fontSize: 11.5,
  fontWeight: 700,
  color: "#94a3b8",
  marginBottom: 4,
  textTransform: "uppercase",
};
const contactValueStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13.5,
  color: "#0f2044",
  fontWeight: 600,
  lineHeight: 1.5,
  wordBreak: "break-word",
};
const contactIconStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  borderRadius: 999,
  background: "#e8f0fe",
  color: "#1a6fa8",
  flexShrink: 0,
};
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
