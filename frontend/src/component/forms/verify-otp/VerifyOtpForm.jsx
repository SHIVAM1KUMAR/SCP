import TextField from "../../ui/textfeild/textFeild";
import Button from "../../ui/button/Button";

export default function VerifyOtpForm() {
    return (
      <div style={{ fontFamily: "'Outfit', sans-serif" }}>
        <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
          Verify OTP
        </h5>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
          Enter the OTP sent to your email address.
        </p>
  
        <div style={{ marginBottom: 20 }}>
          <TextField
            label="OTP Code"
            type="text"
            placeholder="Enter OTP"
            style={{ letterSpacing: 8, textAlign: "center" }}
          />
        </div>
  
        <Button type="button" fullWidth variant="primary">
          Verify OTP
        </Button>
  
        <Button type="button" fullWidth variant="text" style={{ marginTop: 8, color: "#1a6fa8" }}>
          Resend OTP
        </Button>
      </div>
    );
  }
