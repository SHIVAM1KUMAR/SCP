import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { useToast } from "../../../context/ToastContext";
import TextField from "../../ui/textfeild/textFeild";
import Button from "../../ui/button/Button";

const ROLE_LABELS = {
  student: "Student",
  college: "College",
  counsellor: "Counsellor",
};

export default function VerifyOtpForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const initialRole = (searchParams.get("role") || "student").toLowerCase();

  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState(initialRole);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const roleLabel = useMemo(
    () => ROLE_LABELS[role] || "Account",
    [role],
  );

  const handleVerify = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail || !role || !trimmedOtp) {
      toast("Please enter the email and OTP.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post("/auth/verify-otp", {
        email: trimmedEmail,
        role,
        otp: trimmedOtp,
      });

      const resetToken = response?.data?.data?.resetToken;
      if (!resetToken) {
        toast("OTP verified, but the reset token was not returned.", "error");
        return;
      }

      toast("OTP verified successfully.", "success");
      navigate(`/auth/reset-password?token=${encodeURIComponent(resetToken)}`);
    } catch (error) {
      toast(error?.response?.data?.message || "OTP verification failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !role) {
      toast("Please enter your email first.", "error");
      return;
    }

    try {
      setIsResending(true);
      await axiosInstance.post("/auth/forgot-password", {
        email: trimmedEmail,
        role,
      });
      toast("A fresh OTP has been sent to your email.", "success");
    } catch (error) {
      toast(error?.response?.data?.message || "Failed to resend OTP.", "error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div>
        <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
          Verify OTP
        </h5>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
          Enter the OTP sent to the registered {roleLabel.toLowerCase()} email address.
        </p>
      </div>

      <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
        <TextField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
          Account Type
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {Object.entries(ROLE_LABELS).map(([value, label]) => {
            const active = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                style={{
                  border: `1.5px solid ${active ? "#0f2044" : "#e2e8f0"}`,
                  background: active ? "#eef5ff" : "#fff",
                  color: active ? "#0f2044" : "#475569",
                  borderRadius: 10,
                  padding: "10px 8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <TextField
          label="OTP Code"
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ letterSpacing: 8, textAlign: "center" }}
          required
        />
      </div>

      <Button type="submit" fullWidth variant="primary" loading={isSubmitting}>
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </Button>

      <Button
        type="button"
        fullWidth
        variant="text"
        loading={isResending}
        onClick={handleResend}
        style={{ marginTop: 8, color: "#1a6fa8" }}
      >
        {isResending ? "Resending..." : "Resend OTP"}
      </Button>
    </form>
  );
}
