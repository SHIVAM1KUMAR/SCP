import React, { useState } from "react";
import DeleteActionButton from "../../component/ui/modal/DeleteActionButton";

const DeleteSubscriptionModal = ({
  show,
  onClose,
  onConfirm,
  subscription,
  loading: externalLoading = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!show) return null;

  const handleDelete = async () => {
    if (!subscription?._id) {
      setError("Subscription ID missing");
      return;
    }

    setError("");
    setLoading(true);
    const startedAt = Date.now();

    try {
      await onConfirm?.({ id: subscription._id });
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 250) {
        await new Promise((resolve) => setTimeout(resolve, 250 - elapsed));
      }
      setLoading(false);
    }
  };

  const isLoading = loading || externalLoading;
  const name = subscription?.subscriptionName || "this subscription";

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h5 style={{ margin: 0, fontWeight: 600, color: "#dc2626" }}>
            Delete Subscription
          </h5>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
          <p style={{ margin: 0, fontSize: 15, color: "#333" }}>
            Are you sure you want to delete
          </p>
          <p style={{ margin: "6px 0", fontWeight: 600, fontSize: 16, color: "#111" }}>
            {name}
          </p>
          <p style={{ fontSize: 13, color: "#777" }}>
            This action cannot be undone.
          </p>
          {error && <p style={{ color: "red", marginTop: 10, fontSize: 13 }}>{error}</p>}
        </div>

        <div style={{
          padding: "15px 20px",
          borderTop: "1px solid #eee",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <DeleteActionButton loading={isLoading} onClick={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default DeleteSubscriptionModal;
