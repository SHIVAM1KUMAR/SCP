import BasicModal from "../modal/basicModal";
import Button from "../button/Button";

// ─── LogoutModal ──────────────────────────────────────────────────────────────
// AmniCare: MUI Button + Typography + BasicModal
// EduAdmit: Our BasicModal + Bootstrap Button — exact same props API
// ─────────────────────────────────────────────────────────────────────────────

const LogoutModal = ({ open, onClose, onLogout }) => {
  return (
    <BasicModal
      open={open}
      onClose={onClose}
      title="Confirm Logout"
      maxWidth="xs"
      actions={
        <div className="d-flex gap-2">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <button
            className="btn btn-danger"
            onClick={onLogout}
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, borderRadius: 8 }}
          >
            Logout
          </button>
        </div>
      }
    >
      <p className="mb-0" style={{ fontSize: 14, color: "#374151", fontFamily: "'Outfit', sans-serif" }}>
        Are you sure you want to logout?
      </p>
    </BasicModal>
  );
};

export default LogoutModal;