import { useRef, useState } from "react";
import StudentRegistrationForm from "../../component/forms/student/StudentRegistrationForm";
import Loader from "../../component/ui/loader/Loader";

const AddEditStudentModal = ({
  open,
  onClose,
  student = null,
  isLoading = false,
}) => {
  const isEdit   = Boolean(student);
  const formRef  = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 5;
  const isLastStep = activeStep === totalSteps - 1;
  const busy       = isLoading || submitting;

  if (!open) return null;

  const handleNext = async () => {
    if (formRef.current?.handleNext) {
      const success = await formRef.current.handleNext();
      if (success) setActiveStep((prev) => prev + 1);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (formRef.current?.handleBack) formRef.current.handleBack();
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (!formRef.current?.submitForm) return;
    setSubmitting(true);
    try {
      await formRef.current.submitForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">

          {/* Header */}
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title fw-semibold">
              {isEdit ? "Edit Student" : "Add Student"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={busy}
            />
          </div>

          {/* Progress */}
          <div className="modal-body pt-0">
            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-2">
                {[1, 2, 3, 4, 5].map((step, index) => (
                  <span
                    key={index}
                    className={`fw-medium ${activeStep === index ? "text-primary" : ""}`}
                  >
                    Step {step}
                  </span>
                ))}
              </div>
              <div className="progress" style={{ height: 8 }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${((activeStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <StudentRegistrationForm
              ref={formRef}
              student={student}
              studentId={student?._id || null}
              onClose={onClose}
            />
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 pt-0 d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary px-4"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>

            <div>
              <button
                className="btn btn-outline-secondary px-4 me-3"
                onClick={handleBack}
                disabled={activeStep === 0 || busy}
              >
                Back
              </button>

              {isLastStep ? (
                <button
                  className="btn btn-success px-4"
                  onClick={handleSubmit}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader size={16} color="inherit" />
                      {" "}Saving…
                    </>
                  ) : (
                    isEdit ? "Update" : "Save"
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-primary px-4"
                  onClick={handleNext}
                  disabled={busy}
                >
                  Next
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddEditStudentModal;