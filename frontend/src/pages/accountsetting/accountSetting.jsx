import { useMemo, useState, useEffect } from "react";
import MainCard from "../../component/ui/card/Main";
import CollegeInfo from "../../component/ui/profile/college/collegeInfo";
import StudentInfo from "../../component/ui/profile/student/studentInfo";
import NotAvailableState from "../../component/ui/state/notavailableState";
// import Documents         from "../student/documents/Documents";           // wire when ready
// import Licenses          from "../student/license/Licenses";              // wire when ready
// import BackgroundCheck   from "../student/background-checks/BackgroundCheck"; // wire when ready
// import Availability      from "../student/availability/Availability";     // wire when ready
// import ChangePasswordForm from "../../components/forms/change-password/ChangePasswordForm"; // wire when ready

// ─── AccountSettings ──────────────────────────────────────────────────────────
// AmniCare: MUI Tabs + useMediaQuery + Redux state.auth
// EduAdmit: Custom tab bar + window.innerWidth + localStorage
//
// provider = college, user = student (as per project mapping)
// ─────────────────────────────────────────────────────────────────────────────

// ── SVG Tab Icons (replacing MUI icons) ──────────────────────────────────────
const Icons = {
  Profile:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={16} height={16}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>,
  Documents:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={16} height={16}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Licenses:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={16} height={16}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  Background: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={16} height={16}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  Schedule:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={16} height={16}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>,
  Security:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={16} height={16}><rect x={3} y={11} width={18} height={11} rx={2} ry={2}/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
};

// ── TabPanel ──────────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-settings-tabpanel-${index}`}
      aria-labelledby={`account-settings-tab-${index}`}
    >
      {value === index && (
        <div style={{ paddingTop: 24 }}>{children}</div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AccountSettings() {
  // Read auth from localStorage (replaces Redux state.auth)
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const { role, email, collegeId, userMasterId } = user;

  const [tabValue,    setTabValue]    = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 960);
  const [isBigScreen,   setIsBigScreen]   = useState(window.innerWidth >= 1536);

  // Mirror AmniCare's useMediaQuery — update on resize
  useEffect(() => {
    const handler = () => {
      setIsSmallScreen(window.innerWidth < 960);
      setIsBigScreen(window.innerWidth >= 1536);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const isStudent = role?.toLowerCase() === "student";   // replaces isCaregiver
  const isCollege = role?.toLowerCase() === "college";   // replaces isProvider

  // ── Tab definitions (mirrors AmniCare's tabs array) ───────────────────────
  const tabs = useMemo(() => [
    {
      id: 0,
      title: "Profile Information",
      icon: Icons.Profile,
      content: isCollege ? (
        <CollegeInfo
          collegeId={collegeId}
          email={email}
          userMasterId={userMasterId}
          role={role}
          isSmallScreen={isSmallScreen}
        />
      ) : (
        <StudentInfo
          email={email}
          userMasterId={userMasterId}
          isSmallScreen={isSmallScreen}
        />
      ),
    },
    {
      id: 1,
      title: "Documents",
      icon: Icons.Documents,
      content: (
        // <Documents userMasterId={userMasterId} role={role} isSmallScreen={isSmallScreen} />
        <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Documents — wire component when ready
        </div>
      ),
    },
    {
      id: 2,
      title: "Licenses",
      icon: Icons.Licenses,
      content: (
        // <Licenses userMasterId={userMasterId} role={role} isSmallScreen={isSmallScreen} />
        <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Licenses — wire component when ready
        </div>
      ),
    },
    {
      id: 3,
      title: "Background Checks",
      icon: Icons.Background,
      content: (
        // <BackgroundCheck userMasterId={userMasterId} role={role} isSmallScreen={isSmallScreen} />
        <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Background Checks — wire component when ready
        </div>
      ),
    },
    {
      id: 4,
      title: "Availability",
      icon: Icons.Schedule,
      content: (
        // <Availability userMasterId={userMasterId} role={role} isSmallScreen={isSmallScreen} />
        <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Availability — wire component when ready
        </div>
      ),
    },
    {
      id: 5,
      title: "Security",
      icon: Icons.Security,
      content: (
        // <ChangePasswordForm userMasterId={userMasterId} isSmallScreen={isSmallScreen} />
        <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Change Password — wire ChangePasswordForm when ready
        </div>
      ),
    },
  ], [userMasterId, role, email, collegeId, isSmallScreen]);

  // Mirror AmniCare: non-caregiver (non-student) only sees tabs 0 and 5
  const filteredTabs = useMemo(
    () => tabs.filter(tab => [0, 5].includes(tab.id)),
    [tabs],
  );

  const tabItems = isStudent ? tabs : filteredTabs;

  // SuperAdmin has no account settings
  if (role === "SuperAdmin") {
    return <NotAvailableState />;
  }

  return (
    <MainCard>

      {/* ── Tab header bar ── */}
      <div
        style={{
          borderBottom: "1px solid #e5e9f0",
          overflowX: "auto",
          display: "flex",
        }}
      >
        {tabItems.map((item, index) => {
          const isActive = tabValue === index;
          return (
            <button
              key={item.id}
              id={`account-settings-tab-${index}`}
              aria-controls={`account-settings-tabpanel-${index}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => setTabValue(index)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: isSmallScreen ? 0 : 7,
                padding: isSmallScreen ? "10px 14px" : "12px 20px",
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid #1a6fa8" : "2px solid transparent",
                cursor: "pointer",
                color: isActive ? "#1a6fa8" : "#64748b",
                fontWeight: isActive ? 600 : 400,
                fontSize: 13.5,
                fontFamily: "'Outfit', sans-serif",
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
                flexShrink: 0,
                // fullWidth on big screens (mirrors MUI variant="fullWidth")
                flex: isBigScreen ? 1 : "none",
                justifyContent: "center",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#1a6fa8"; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "#64748b"; }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {/* Hide label on small screens (mirrors AmniCare's label={isSmallScreen ? "" : item.title}) */}
              {!isSmallScreen && <span>{item.title}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Tab content panels ── */}
      {tabItems.map((item, index) => (
        <TabPanel key={item.id} value={tabValue} index={index}>
          {item.content}
        </TabPanel>
      ))}

    </MainCard>
  );
}