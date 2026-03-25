import React from "react";

const DeleteCollegeModal = ({
  show,
  onClose,
  onConfirm,
  college,
  loading = false,
}) => {
  if (!show) return null;

  return (
    <div 
      className="modal show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          
          {/* Header */}
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title fw-semibold text-danger">
              Delete College
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <p className="mb-0">
              Are you sure you want to delete{" "}
              <strong>{college?.collegeName}</strong>?
            </p>
            <p className="text-muted small mt-2">
              This action cannot be undone.
            </p>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 pt-0">
            <button
              className="btn btn-outline-secondary px-4"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger px-4"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCollegeModal;