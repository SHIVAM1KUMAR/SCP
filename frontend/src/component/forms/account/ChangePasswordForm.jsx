import { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useToast } from "../../../context/ToastContext";
import TextField from "../../ui/textfeild/textFeild";
import Button from "../../ui/button/Button";

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
          <TextField
            name="oldPassword"
            label="Old Password"
            type="password"
            value={form.oldPassword}
            onChange={handleChange("oldPassword")}
            placeholder="Enter current password"
          />
        </div>

        <div>
          <TextField
            name="newPassword"
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            placeholder="Create a new password"
          />
        </div>

        <div>
          <TextField
            name="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            value={form.confirmNewPassword}
            onChange={handleChange("confirmNewPassword")}
            placeholder="Re-enter the new password"
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
        <Button type="submit" disabled={isSubmitting} loading={isSubmitting} variant="primary" style={{ minWidth: 160 }}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
}
