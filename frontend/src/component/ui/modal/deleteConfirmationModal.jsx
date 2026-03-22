import BasicModal from "./BasicModal";
import Button from "../button/Button";
import Loader from "../loader/Loader";

// ─── DeleteConfirmationModal ──────────────────────────────────────────────────
// AmniCare: BasicModal + color="error" Button + Loader
// EduAdmit: BasicModal + btn-danger + Loader — exact same props API
// ─────────────────────────────────────────────────────────────────────────────

const DeleteConfirmationModal = ({
  title,
  description,
  open,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <BasicModal
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <div className="d-flex gap-2">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <button
            type="button"
            className="btn btn-danger d-flex align-items-center gap-2"
            onClick={onConfirm}
            disabled={isLoading}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8 }}
          >
            {isLoading && <Loader size={18} color="inherit" />}
            Delete
          </button>
        </div>
      }
    >
      {/* Trash icon */}
      <div className="d-flex align-items-start gap-3">
        <div
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "#fff5f5", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth={2} width={22} height={22}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </div>
        <p
          className="mb-0"
          style={{ fontSize: 14, color: "#374151", fontFamily: "'Outfit', sans-serif", paddingTop: 10 }}
        >
          {description ?? "Are you sure you want to delete? This action cannot be undone."}
        </p>
      </div>
    </BasicModal>
  );
};

export default DeleteConfirmationModal;