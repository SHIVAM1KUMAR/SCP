import { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useToast } from "../../../context/ToastContext";

const inputStyle = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  borderRadius: 10,
  border: "1.5px solid #d9e2ef",
  background: "#fff",
  color: "#0f172a",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

export default function ChangePasswordForm() {
  const toast = useToast();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const oldPassword = form.oldPassword.trim();
    const newPassword = form.newPassword.trim();
    const confirmNewPassword = form.confirmNewPassword.trim();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast("Please fill in all password fields.", "error");
      return;
    }

    if (newPassword.length < 6) {
      toast("New password must be at least 6 characters.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast("New password and confirm password must match.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast("You are not logged in.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosInstance.put(
        "/auth/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast("Password updated successfully.", "success");
      setForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      toast(
        error?.response?.data?.message || "Failed to update password.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 560,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>
          Change Password
        </h3>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b" }}>
          Enter your current password and choose a new one.
        </p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label
            htmlFor="oldPassword"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Old Password
          </label>
          <input
            id="oldPassword"
            type="password"
            value={form.oldPassword}
            onChange={handleChange("oldPassword")}
            placeholder="Enter current password"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#1a6fa8";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26, 111, 168, 0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d9e2ef";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            placeholder="Create a new password"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#1a6fa8";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26, 111, 168, 0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d9e2ef";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label
            htmlFor="confirmNewPassword"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Confirm New Password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            value={form.confirmNewPassword}
            onChange={handleChange("confirmNewPassword")}
            placeholder="Re-enter the new password"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#1a6fa8";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26, 111, 168, 0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d9e2ef";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            height: 44,
            padding: "0 18px",
            border: "none",
            borderRadius: 10,
            background: isSubmitting
              ? "linear-gradient(135deg, #7aaed0, #5d8eb0)"
              : "linear-gradient(135deg, #1a6fa8, #0d4f82)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            minWidth: 160,
            boxShadow: "0 10px 24px rgba(26, 111, 168, 0.22)",
          }}
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}
