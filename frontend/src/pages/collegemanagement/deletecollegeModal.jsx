import React, { useState } from "react";
import DeleteActionButton from "../../component/ui/modal/DeleteActionButton";

const DeleteCollegeModal = ({
  show,
  onClose,
  onConfirm,
  college,
  loading: externalLoading = false, // kept for compatibility, modal uses local state
}) => {
  const [loading, setLoading] = useState(false); // ✅ NEW
  const [error, setError] = useState(""); // ✅ NEW

  if (!show) return null;

  // ✅ NEW: handle delete like activate modal
  const handleDelete = async () => {
    if (!college?._id) {
      setError("College ID missing");
      return;
    }

    setError("");
    setLoading(true);
    const startedAt = Date.now();

    try {
      await onConfirm?.({ id: college._id });
      onClose();
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Delete failed"
      );
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 250) {
        await new Promise((resolve) => setTimeout(resolve, 250 - elapsed));
      }
      setLoading(false);
    }
  };

  const isLoading = loading;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          overflow: "hidden",
          fontFamily: "system-ui",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ margin: 0, fontWeight: 600, color: "#dc2626" }}>
            Delete College
          </h5>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading} // ✅ CHANGED
            style={{
              border: "none",
              background: "transparent",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚠️</div>

          <p style={{ margin: 0, fontSize: "15px", color: "#333" }}>
            Are you sure you want to delete
          </p>

          <p
            style={{
              margin: "6px 0",
              fontWeight: 600,
              fontSize: "16px",
              color: "#111",
            }}
          >
            {college?.collegeName}
          </p>

          <p style={{ fontSize: "13px", color: "#777" }}>
            This action cannot be undone.
          </p>

          {/* ✅ NEW: Error */}
          {error && (
            <p style={{ color: "red", marginTop: 10, fontSize: 13 }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "15px 20px",
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            disabled={isLoading} // ✅ CHANGED
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
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

export default DeleteCollegeModal;
