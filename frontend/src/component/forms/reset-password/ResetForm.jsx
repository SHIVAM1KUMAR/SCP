import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { useToast } from "../../../context/ToastContext";
import TextField from "../../ui/textfeild/textFeild";
import Button from "../../ui/button/Button";

export default function ResetForm({ token = "" }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newPassword = form.newPassword.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!token) {
      toast("Verification token is missing or expired. Please request a new OTP.", "error");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast("Please fill in both password fields.", "error");
      return;
    }

    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast("New password and confirm password must match.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword,
      });
      toast("Password reset successfully. Please sign in.", "success");
      navigate("/auth/login");
    } catch (error) {
      toast(
        error?.response?.data?.message || "Failed to reset password.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ marginBottom: 18 }}>
        <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
          Reset Password
        </h5>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 0, lineHeight: 1.6 }}>
          Create a new password for your account.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <TextField
          label="New Password"
          type="password"
          placeholder="••••••••"
          value={form.newPassword}
          onChange={handleChange("newPassword")}
          required
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <TextField
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange("confirmPassword")}
          required
        />
      </div>

      <Button type="submit" fullWidth variant="primary" loading={isSubmitting}>
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
