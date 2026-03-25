import { useRef, useState } from "react";
import CollegeRegistrationForm from "../../component/forms/college/CollegeRegistrationForm";

const AddEditCollegeModal = ({
  open,
  onClose,
  onSubmit,
  college = null,
  isLoading = false,
}) => {
  const isEdit = Boolean(college);
  const formRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const totalSteps = 4;
  const isLastStep = activeStep === totalSteps - 1;

  if (!open) return null;

  const handleNext = async () => {
    if (formRef.current?.handleNext) {
      const success = await formRef.current.handleNext();
      if (success) {
        setActiveStep((prev) => prev + 1);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (formRef.current?.handleBack) {
      formRef.current.handleBack();
    }
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    if (formRef.current?.submitForm) {
      formRef.current.submitForm();
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
              {isEdit ? "Edit College" : "Add College"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body pt-0">

            {/* Step Progress Indicator */}
            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-2">
                {[1, 2, 3, 4].map((step, index) => (
                  <span
                    key={index}
                    className={`fw-medium ${activeStep === index ? "text-primary" : ""}`}
                  >
                    Step {step}
                  </span>
                ))}
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-primary"
                  style={{
                    width: `${((activeStep + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Form Component */}
            <CollegeRegistrationForm
              ref={formRef}
              defaultValues={college || {}}
              onSubmit={onSubmit}
              activeStep={activeStep}
            />
          </div>

          {/* Footer with Actions */}
          <div className="modal-footer border-0 pt-0 d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary px-4"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>

            <div>
              <button
                className="btn btn-outline-secondary px-4 me-3"
                onClick={handleBack}
                disabled={activeStep === 0 || isLoading}
              >
                Back
              </button>

              {isLastStep ? (
                <button
                  className="btn btn-success px-4"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : isEdit ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-primary px-4"
                  onClick={handleNext}
                  disabled={isLoading}
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

export default AddEditCollegeModal;