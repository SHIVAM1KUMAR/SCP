import MainCard from "../../component/ui/card/Main";

export default function AuthCard({ children }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "#f4f6f9",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        <MainCard title="EduAdmit" subtitle="Admission Portal">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {children}
          </div>
        </MainCard>
      </div>
    </div>
  );
}
