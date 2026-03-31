import TextField from "../../ui/textfeild/textFeild";
import Button from "../../ui/button/Button";

export default function ForgotForm() {
    return (
      <div style={{ fontFamily: "'Outfit', sans-serif" }}>
        <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
          Forgot Password
        </h5>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
          Enter your email and we'll send you a reset link.
        </p>
  
        <div style={{ marginBottom: 16 }}>
          <TextField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
          />
        </div>

        <Button type="button" fullWidth variant="primary">
          Send Reset Link
        </Button>
      </div>
    );
  }
