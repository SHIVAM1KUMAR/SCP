import { useMemo, useState, useEffect } from "react";
import StudentDetails from "../studentmanagement/studentDetails";
import StudentInfo from "../../component/ui/profile/student/studentInfo";
import CollegeInfo from "../../component/ui/profile/college/collegeInfo";
import ChangePasswordForm from "../../component/forms/account/ChangePasswordForm";

const Icons = {
  Profile: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      width={15}
      height={15}
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx={12} cy={7} r={4} />
    </svg>
  ),
  Documents: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      width={15}
      height={15}
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1={16} y1={13} x2={8} y2={13} />
      <line x1={16} y1={17} x2={8} y2={17} />
    </svg>
  ),
  Licenses: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      width={15}
      height={15}
    >
      <rect x={2} y={7} width={20} height={14} rx={2} />
      <path d="M16 7V5a2 2 0 00-4 0v2M12 12v3M12 12a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  ),
  Background: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      width={15}
      height={15}
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Schedule: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      width={15}
      height={15}
    >
      <circle cx={12} cy={12} r={10} />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Security: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      width={15}
      height={15}
    >
      <rect x={3} y={11} width={18} height={11} rx={2} />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

  .tabs-bar {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    border-bottom: 1.5px solid #e8edf4;
    padding: 0 4px;
    font-family: 'Outfit', sans-serif;
    background: #ffffff;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs-bar::-webkit-scrollbar { display: none; }

  .tab-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 10px 14px 11px;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #94a3b8;
    border-radius: 10px 10px 0 0;
    transition: color 0.15s ease, background 0.15s ease;
    white-space: nowrap;
    outline: none;
    flex-shrink: 0;
  }
  .tab-btn:hover { color: #475569; background: #f8fafc; }
  .tab-btn.active { color: #1e6fd9; background: #f0f6ff; }
  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1.5px;
    left: 0; right: 0;
    height: 2px;
    background: #1e6fd9;
    border-radius: 99px 99px 0 0;
  }
  .tab-icon {
    display: flex;
    align-items: center;
    opacity: 0.7;
    transition: opacity 0.15s;
  }
  .tab-btn.active .tab-icon { opacity: 1; }

  .tab-panel { display: none; padding-top: 24px; }
  .tab-panel.active { display: block; }
`;

function TabPanel({ children, value, index }) {
  return (
    <div className={`tab-panel${value === index ? " active" : ""}`}>
      {children}
    </div>
  );
}

export default function AccountSettings() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const { role, email, id, userMasterId } = user;

  const [tabValue, setTabValue] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 960);

  useEffect(() => {
    const handler = () => setIsSmallScreen(window.innerWidth < 960);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    setTabValue(0);
  }, [role]);

  const roleLower = role?.toLowerCase();
  const isStudent = roleLower === "student";
  const isCollege = roleLower === "college";
  const isSuperAdmin = roleLower === "superadmin";
  const collegeAccountId = id || userMasterId || user.collegeId || null;

  const tabs = useMemo(
    () => [
      {
        id: 0,
        title: "Profile",
        icon: Icons.Profile,
        content: isStudent ? (
          <StudentDetails
            studentId={id || userMasterId || user.studentId}
            embedded
          />
        ) : isCollege ? (
          <CollegeInfo
            email={email}
            collegeId={collegeAccountId}
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
      // {
      //   id: 1,
      //   title: "Documents",
      //   icon: Icons.Documents,
      //   content: <div>Documents</div>,
      // },
      // {
      //   id: 2,
      //   title: "Licenses",
      //   icon: Icons.Licenses,
      //   content: <div>Licenses</div>,
      // },
      // {
      //   id: 3,
      //   title: "Background Checks",
      //   icon: Icons.Background,
      //   content: <div>Background</div>,
      // },
      // {
      //   id: 4,
      //   title: "Availability",
      //   icon: Icons.Schedule,
      //   content: <div>Availability</div>,
      // },
      {
        id: 5,
        title: "Security",
        icon: Icons.Security,
        content: <ChangePasswordForm />,
      },
    ],
    [role, email, id, userMasterId, isSmallScreen],
  );

  const tabItems = isSuperAdmin
    ? tabs.filter((t) => [0, 5].includes(t.id))
    : isStudent || isCollege
      ? tabs
      : tabs.filter((t) => [0, 5].includes(t.id));

  return (
    <>
      <style>{STYLES}</style>

      <div className="tabs-bar" role="tablist">
        {tabItems.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tabValue === index}
            className={`tab-btn${tabValue === index ? " active" : ""}`}
            onClick={() => setTabValue(index)}
          >
            <span className="tab-icon">{item.icon}</span>
            {!isSmallScreen && item.title}
          </button>
        ))}
      </div>

      {tabItems.map((item, index) => (
        <TabPanel key={item.id} value={tabValue} index={index}>
          {item.content}
        </TabPanel>
      ))}
    </>
  );
}
