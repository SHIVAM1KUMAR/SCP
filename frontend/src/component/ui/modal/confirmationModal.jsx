import BasicModal from "./basicModal";
import Button from "../button/Button";
import Loader from "../loader/Loader";

// ─── ConfirmationModal ────────────────────────────────────────────────────────
// AmniCare: BasicModal + MUI Typography + Button + Loader
// EduAdmit: BasicModal + Bootstrap Button + Loader — exact same props API
//
// confirmColor maps: primary → btn-primary, error → btn-danger, etc.
// ─────────────────────────────────────────────────────────────────────────────

// Map MUI color prop → Bootstrap variant
const COLOR_VARIANT = {
  primary:   "contained",
  secondary: "outlined",
  success:   "contained",
  warning:   "contained",
  error:     "contained",
  info:      "contained",
};

// Map MUI color → Bootstrap btn class override
const COLOR_CLASS = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  success:   "btn-success",
  warning:   "btn-warning",
  error:     "btn-danger",
  info:      "btn-info",
};

const ConfirmationModal = ({
  title,
  description,
  open,
  onClose,
  onConfirm,
  isLoading    = false,
  confirmText  = "Confirm",
  cancelText   = "Cancel",
  confirmColor = "primary",
}) => {
  return (
    <BasicModal
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <div className="d-flex gap-2">
          <Button variant="outlined" onClick={onClose}>
            {cancelText}
          </Button>
          <button
            type="button"
            className={`btn ${COLOR_CLASS[confirmColor] || "btn-primary"} d-flex align-items-center gap-2`}
            onClick={onConfirm}
            disabled={isLoading}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8 }}
          >
            {isLoading && <Loader size={18} color="inherit" />}
            {confirmText}
          </button>
        </div>
      }
    >
      <p
        className="mb-0"
        style={{ fontSize: 14, color: "#374151", fontFamily: "'Outfit', sans-serif" }}
      >
        {description ?? "Are you sure you want to continue?"}
      </p>
    </BasicModal>
  );
};

export default ConfirmationModal;