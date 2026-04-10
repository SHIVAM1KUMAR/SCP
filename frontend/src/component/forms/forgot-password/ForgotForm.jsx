import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { useToast } from "../../../context/ToastContext";
import Button from "../../ui/button/Button";
import TextField from "../../ui/textfeild/textFeild";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "college", label: "College" },
  { value: "counsellor", label: "Counsellor" },
];

export default function ForgotForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast("Please enter your email address.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post("/auth/forgot-password", {
        email: trimmedEmail,
        role,
      });
      toast("If the account exists, an OTP has been sent to your email.", "success");
      navigate(`/auth/verify-otp?email=${encodeURIComponent(trimmedEmail)}&role=${encodeURIComponent(role)}`);
    } catch (error) {
      toast(
        error?.response?.data?.message || "Failed to request password reset.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div>
        <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
          Forgot Password
        </h5>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
          Choose the account type first, then enter the email linked to that account. We&apos;ll send an OTP to verify the request.
        </p>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.3px" }}>
          Account Type
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {ROLE_OPTIONS.map((option) => {
            const active = role === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
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
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <TextField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button type="submit" fullWidth variant="primary" loading={isSubmitting}>
        {isSubmitting ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );
}
