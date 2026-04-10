import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollegeRegistrationForm from "../../component/forms/college/CollegeRegistrationForm";
import StudentRegistrationForm from "../../component/forms/student/studentRegistration";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  .register-root {
    min-height: 100dvh;
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.95fr);
    overflow: hidden;
    background:
      radial-gradient(circle at 20% 20%, rgba(18, 71, 118, 0.35), transparent 34%),
      radial-gradient(circle at 80% 20%, rgba(14, 33, 65, 0.18), transparent 28%),
      linear-gradient(135deg, #09111f 0%, #0e1a2f 42%, #f6f8fb 42%, #f6f8fb 100%);
    font-family: 'DM Sans', sans-serif;
  }

  .register-left {
    position: relative;
    padding: 48px;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  .register-left::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 55% 45% at 22% 76%, rgba(77, 163, 212, 0.26), transparent 70%),
      radial-gradient(ellipse 38% 36% at 82% 18%, rgba(255, 255, 255, 0.08), transparent 65%);
    pointer-events: none;
  }

  .register-brand {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .register-brand-badge {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #1a6fa8, #0d4f82);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  }

  .register-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.1;
  }

  .register-brand-subtitle {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.48);
  }

  .register-hero {
    position: relative;
    z-index: 1;
    max-width: 520px;
  }

  .register-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.76);
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 18px;
  }

  .register-hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(38px, 5vw, 56px);
    line-height: 1.02;
    letter-spacing: -1.5px;
    margin: 0 0 18px;
  }

  .register-hero h1 span {
    color: #4da3d4;
  }

  .register-hero p {
    max-width: 480px;
    margin: 0;
    font-size: 15px;
    line-height: 1.8;
    color: rgba(255,255,255,0.58);
  }

  .register-points {
    display: grid;
    gap: 10px;
    margin-top: 28px;
    max-width: 440px;
  }

  .register-point {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.09);
  }

  .register-point-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4da3d4;
    flex-shrink: 0;
  }

  .register-point span {
    font-size: 13px;
    color: rgba(255,255,255,0.72);
  }

  .register-right {
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .register-panel {
    width: 100%;
    max-width: 460px;
    background: rgba(255,255,255,0.88);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 24px;
    box-shadow: 0 30px 80px rgba(15, 32, 68, 0.14);
    backdrop-filter: blur(18px);
    padding: 28px;
  }

  .register-panel h2 {
    margin: 0;
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    line-height: 1.1;
    color: #0f2044;
  }

  .register-panel p {
    margin: 8px 0 0;
    font-size: 13.5px;
    color: #64748b;
    line-height: 1.7;
  }

  .register-grid {
    display: grid;
    gap: 14px;
    margin-top: 24px;
  }

  .register-choice {
    width: 100%;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    border-radius: 18px;
    padding: 18px;
    cursor: pointer;
    text-align: left;
    transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
  }

  .register-choice:hover {
    transform: translateY(-1px);
    border-color: #0f2044;
    box-shadow: 0 14px 28px rgba(15, 32, 68, 0.08);
  }

  .register-choice-title {
    font-size: 17px;
    font-weight: 700;
    color: #0f2044;
    margin: 0 0 6px;
  }

  .register-choice-desc {
    font-size: 13px;
    color: #64748b;
    line-height: 1.65;
    margin: 0;
  }

  .register-choice-pill {
    display: inline-flex;
    align-items: center;
    margin-top: 14px;
    padding: 7px 10px;
    border-radius: 999px;
    background: #e8f4fd;
    color: #1a6fa8;
    font-size: 12px;
    font-weight: 700;
  }

  .register-panel-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid #e8edf4;
    font-size: 13px;
  }

  .register-link {
    color: #1a6fa8;
    font-weight: 700;
    text-decoration: none;
  }

  .register-backdrop {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(246,248,251,0.08) 100%);
  }

  @media (max-width: 980px) {
    .register-root {
      grid-template-columns: 1fr;
      background: #0e1a2f;
    }
    .register-left {
      min-height: 38vh;
      padding: 28px 24px;
    }
    .register-right {
      padding: 20px;
      align-items: flex-start;
      overflow-y: auto;
    }
  }

  @media (max-width: 640px) {
    .register-left {
      min-height: auto;
      padding-bottom: 18px;
    }
    .register-panel {
      padding: 20px;
      border-radius: 20px;
    }
    .register-panel h2 {
      font-size: 24px;
    }
  }
`;

const OPTIONS = [
  {
    key: "college",
    title: "Register as College",
    description: "Use the same college application flow Super Admin already uses, including documents, courses, and payment proof.",
  },
  {
    key: "student",
    title: "Register as Student",
    description: "Use the same student admission form Super Admin uses, with identity, academics, and document upload steps.",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");

  const activeChoice = useMemo(
    () => OPTIONS.find((item) => item.key === selectedRole) || null,
    [selectedRole],
  );

  const closeForm = () => {
    setSelectedRole("");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="register-root">
        <div className="register-left">
          <div className="register-brand">
            <div className="register-brand-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} width={20} height={20}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div className="register-brand-name">
                EduAdmit
                <span className="register-brand-subtitle">Admission Portal</span>
              </div>
            </div>
          </div>

          <div className="register-hero">
            <div className="register-kicker">Create your account in a few steps</div>
            <h1>
              Start your
              <br />
              <span>admission</span>
              <br />
              journey.
            </h1>
            <p>
              We keep the registration experience aligned with the rest of the portal so colleges and students feel like they are using the same system everywhere.
            </p>

            <div className="register-points">
              <div className="register-point">
                <div className="register-point-dot" />
                <span>Reuse the existing Super Admin registration forms</span>
              </div>
              <div className="register-point">
                <div className="register-point-dot" />
                <span>Keep onboarding consistent across roles</span>
              </div>
              <div className="register-point">
                <div className="register-point-dot" />
                <span>Open the full form only after role selection</span>
              </div>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-panel">
            {!selectedRole ? (
              <>
                <h2>Create account</h2>
                <p>Select the account type first. We’ll open the matching registration flow right after that.</p>

                <div className="register-grid">
                  {OPTIONS.map((choice) => (
                    <button
                      key={choice.key}
                      type="button"
                      className="register-choice"
                      onClick={() => setSelectedRole(choice.key)}
                    >
                      <div className="register-choice-title">{choice.title}</div>
                      <p className="register-choice-desc">{choice.description}</p>
                      <span className="register-choice-pill">Continue</span>
                    </button>
                  ))}
                </div>

                <div className="register-panel-footer">
                  <span style={{ color: "#64748b" }}>Already have an account?</span>
                  <button
                    type="button"
                    onClick={() => navigate("/auth/login")}
                    className="register-link"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
                  >
                    Sign in
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
                  <div>
                    <h2 style={{ fontSize: 24, marginBottom: 6 }}>{activeChoice?.title || "Registration"}</h2>
                    <p style={{ margin: 0 }}>Complete the form in the modal that opens over this page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="register-link"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
                  >
                    Change
                  </button>
                </div>

                {selectedRole === "college" ? (
                  <CollegeRegistrationForm onClose={closeForm} />
                ) : (
                  <StudentRegistrationForm onClose={closeForm} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="register-backdrop" />
    </>
  );
}

