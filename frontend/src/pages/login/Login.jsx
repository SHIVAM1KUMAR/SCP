import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    display: flex;
    height: 100vh;
    width: 100vw;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  /* ── Left panel ── */
  .login-left {
    width: 48%;
    background: #0a1628;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    overflow: hidden;
  }

  .login-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 80%, rgba(26, 111, 168, 0.35) 0%, transparent 70%),
      radial-gradient(ellipse 40% 40% at 80% 20%, rgba(26, 111, 168, 0.2) 0%, transparent 60%);
    pointer-events: none;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  .brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #1a6fa8, #0d4f82);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(26,111,168,0.4);
  }

  .brand-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #ffffff;
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .brand-name span {
    display: block;
    font-size: 11px;
    font-weight: 400;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .left-hero {
    position: relative;
    z-index: 1;
  }

  .left-hero h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 40px;
    line-height: 1.1;
    color: #ffffff;
    letter-spacing: -1px;
    margin-bottom: 18px;
  }

  .left-hero h1 span {
    color: #4da3d4;
  }

  .left-hero p {
    font-size: 14.5px;
    color: rgba(255,255,255,0.5);
    line-height: 1.7;
    max-width: 340px;
    font-weight: 300;
  }

  .feature-pills {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    z-index: 1;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 10px 16px;
    width: fit-content;
  }

  .pill-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4da3d4;
    flex-shrink: 0;
  }

  .pill span {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    font-weight: 400;
  }

  /* ── Right panel ── */
  .login-right {
    flex: 1;
    background: #f7f9fc;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 32px;
    position: relative;
  }

  .login-right::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 260px; height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(26,111,168,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .form-card {
    width: 100%;
    max-width: 400px;
    animation: fadeUp 0.5s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .form-card h2 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 26px;
    color: #0d2d4a;
    margin-bottom: 6px;
    letter-spacing: -0.4px;
  }

  .form-card .subtitle {
    font-size: 13.5px;
    color: #94a3b8;
    margin-bottom: 32px;
    font-weight: 400;
  }

  .field {
    margin-bottom: 18px;
  }

  .field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #475569;
    margin-bottom: 7px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  .field input {
    width: 100%;
    height: 46px;
    padding: 0 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #1e293b;
    background: #ffffff;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .field input:focus {
    border-color: #1a6fa8;
    box-shadow: 0 0 0 3px rgba(26,111,168,0.1);
  }

  .field input::placeholder { color: #cbd5e1; }

  .error-box {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #c53030;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .submit-btn {
    width: 100%;
    height: 48px;
    background: linear-gradient(135deg, #1a6fa8, #0d4f82);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14.5px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.2px;
    transition: opacity 0.15s, transform 0.1s;
    margin-top: 4px;
    box-shadow: 0 4px 16px rgba(26,111,168,0.3);
  }

  .submit-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .login-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 12px;
    color: #94a3b8;
  }

  @media (max-width: 768px) {
    .login-left { display: none; }
    .login-right { background: #ffffff; }
  }
`;

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
// Removed error state for toast
  const [loading,  setLoading]  = useState(false);

  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast("Login successful! Redirecting...", "success");
      if (res.role === "SuperAdmin")  navigate("/superadmin/college");
      else if (res.role === "Admin")  navigate("/admin/college");
      else                            navigate("/user/college");
    } catch {
      toast("Invalid email or password. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="grid-overlay" />

          {/* Brand */}
          <div className="brand">
            <div className="brand-icon">
              {/* Graduation cap icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} width={20} height={20}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div className="brand-name">
                EduAdmit
                <span>College Admission Portal</span>
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className="left-hero">
            <h1>
              Simplify<br />
              <span>college</span><br />
              admissions.
            </h1>
            <p>
              Manage student intake, college registrations, and admission workflows — all from one unified platform.
            </p>
          </div>

          {/* Feature pills */}
          <div className="feature-pills">
            <div className="pill"><div className="pill-dot" /><span>College & intake management</span></div>
            <div className="pill"><div className="pill-dot" /><span>Student registration & tracking</span></div>
            <div className="pill"><div className="pill-dot" /><span>Admission approvals & status</span></div>
            <div className="pill"><div className="pill-dot" /><span>Role-based access control</span></div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="form-card">
            <h2>Welcome back</h2>
            <p className="subtitle">Sign in to your admission portal account</p>



            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="username"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="submit-btn" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="login-footer">
              © {new Date().getFullYear()} EduAdmit. All rights reserved.
            </div>
          </div>
        </div>

      </div>
    </>
  );
}