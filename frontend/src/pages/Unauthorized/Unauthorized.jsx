import { useNavigate } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import NotAvailableState from "../../component/ui/state/notavailableState";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f6f9",
        padding: "0 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <NotAvailableState
          title="Unauthorized"
          description="You don't have permission to access this page. Please contact an administrator or return to a safe location."
        />
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => navigate("/")}>
            Go Home
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
