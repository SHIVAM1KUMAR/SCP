import TextField from "../../ui/textfeild/textFeild";
import Button from "../../ui/button/Button";

export default function ResetForm() {
    return (
      <div style={{ fontFamily: "'Outfit', sans-serif" }}>
        <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
          Reset Password
        </h5>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
          Enter your new password below.
        </p>
  
        <div style={{ marginBottom: 16 }}>
          <TextField
            label="New Password"
            type="password"
            placeholder="••••••••"
          />
        </div>
  
        <div style={{ marginBottom: 20 }}>
          <TextField
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
          />
        </div>
  
        <Button type="button" fullWidth variant="primary">
          Reset Password
        </Button>
      </div>
    );
  }
