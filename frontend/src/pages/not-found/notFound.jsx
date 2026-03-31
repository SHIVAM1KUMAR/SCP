import { useNavigate } from "react-router-dom";
import Button from "../../component/ui/button/Button";
import NotFoundState from "../../component/ui/state/notfoundState";

export default function NotFound() {
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
        <NotFoundState
          title="Page Not Found"
          description="The page you're looking for doesn't exist or may have been moved."
        />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <Button variant="primary" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
