import { useMemo, useState } from "react";
import BasicTable from "../../component/ui/table/basicTable";
import Button from "../../component/ui/button/Button";
import Loader from "../../component/ui/loader/Loader";
import Search from "../../component/ui/search/Search";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import SubscriptionForm from "../../component/forms/subscription/subscriptionForm";
import DeleteSubscriptionModal from "./deleteSubscriptionModal";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function SubscriptionManagement() {
  const {
    subscriptions,
    isLoadingSubscriptions,
    deleteSubscription,
    fetchSubscriptions,
    isDeletingSubscription,
  } = useSubscriptions();

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [openAddEditModal, setOpenAddEditModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (subscriptions || []).filter((subscription) =>
      [
        subscription.subscriptionName,
        subscription.subscriptionType,
        String(subscription.months),
        String(subscription.amount),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [search, subscriptions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const currentItems = filtered.slice(start, start + rowsPerPage);

  const handleAdd = () => {
    setSelectedSubscription(null);
    setOpenAddEditModal(true);
  };

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
    setOpenAddEditModal(true);
  };

  const handleDeleteClick = (subscription) => {
    setSubscriptionToDelete(subscription);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async ({ id }) => {
    await deleteSubscription(id);
    setShowDeleteModal(false);
    setSubscriptionToDelete(null);
  };

  const handleSaved = async (isEdit) => {
    if (!isEdit) setPage(1);
    await fetchSubscriptions?.();
  };

  const columns = [
    {
      key: "index",
      header: "#",
      minWidth: 56,
      render: (_row, rowIndex) => start + rowIndex + 1,
    },
    {
      key: "subscriptionName",
      header: "Subscription",
      minWidth: 220,
      render: (item) => (
        <div>
          <div style={{ fontWeight: 700, color: "#0f2044" }}>{item.subscriptionName}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {item.subscriptionType} · {item.months} month{item.months === 1 ? "" : "s"}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      minWidth: 120,
      render: (item) => formatCurrency(item.amount),
    },
    {
      key: "description",
      header: "Description",
      minWidth: 220,
      render: (item) => item.description || "-",
    },
    {
      key: "status",
      header: "Status",
      minWidth: 100,
      render: (item) => (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 10px",
          borderRadius: 999,
          background: item.isActive ? "#ecfdf5" : "#f8fafc",
          color: item.isActive ? "#047857" : "#64748b",
          fontSize: 12,
          fontWeight: 700,
        }}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      minWidth: 120,
      render: (item) => (item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      minWidth: 170,
      align: "center",
      render: (item) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(item);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e9f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid #f0f3f7",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f2044" }}>
              Subscription Management
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>
              Manage the plans shown in college registration
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", width: "100%", justifyContent: "flex-end" }}>
            <Search
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search subscription..."
              width="320px"
              style={{ flex: "0 1 320px", minWidth: 240, maxWidth: 360 }}
            />
            <Button onClick={handleAdd} variant="primary" style={{ flexShrink: 0 }}>
              + Add Subscription
            </Button>
          </div>
        </div>

        <div style={{ padding: "0 20px 14px" }}>
          {isLoadingSubscriptions ? (
            <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
              <Loader size={30} />
            </div>
          ) : currentItems.length ? (
            <BasicTable
              columns={columns}
              rows={currentItems}
              emptyText="No subscriptions found"
              tableStyle={{ minWidth: 900 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              No subscriptions found
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 16,
            padding: "12px 20px 16px",
            fontSize: 13,
            color: "#64748b",
            borderTop: "1px solid #f0f3f7",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 13,
                  fontFamily: "'Outfit', sans-serif",
                  color: "#1e293b",
                }}
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              {start + 1}–{Math.min(start + rowsPerPage, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  background: "none",
                  padding: "3px 10px",
                  fontSize: 16,
                  cursor: safePage === 1 ? "not-allowed" : "pointer",
                  color: safePage === 1 ? "#cbd5e1" : "#374151",
                }}
              >
                ‹
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  background: "none",
                  padding: "3px 10px",
                  fontSize: 16,
                  cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                  color: safePage >= totalPages ? "#cbd5e1" : "#374151",
                }}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {openAddEditModal && (
        <SubscriptionForm
          subscription={selectedSubscription}
          subscriptionId={selectedSubscription?._id || null}
          onSaved={handleSaved}
          onClose={() => setOpenAddEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteSubscriptionModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSubscriptionToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          subscription={subscriptionToDelete}
          loading={isDeletingSubscription}
        />
      )}
    </div>
  );
}
