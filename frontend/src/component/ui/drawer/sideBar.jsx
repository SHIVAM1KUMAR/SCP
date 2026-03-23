import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DrawerHeader } from "./drawerHeader";
import { getMenuByRole } from "./MenuItems";

// ─── Sidebar ──────────────────────────────────────────────────────────────────
// Logo import removed — using text logo instead to avoid missing asset error
// ─────────────────────────────────────────────────────────────────────────────

const DRAWER_WIDTH     = 280;
const DRAWER_COLLAPSED = 65;

const ChevronLeft  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}><polyline points="15 18 9 12 15 6" /></svg>;
const ChevronRight = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}><polyline points="9 18 15 12 9 6" /></svg>;
const ChevronDown  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}><polyline points="6 9 12 15 18 9" /></svg>;
const ChevronUp    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}><polyline points="18 15 12 9 6 15" /></svg>;

function SidebarItem({ item, open, level = 0, onNavigate }) {
  const location    = useLocation();
  const [childOpen, setChildOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  useEffect(() => {
    if (hasChildren && item.children.some(c => location.pathname === c.path)) {
      setChildOpen(true);
    }
  }, [location.pathname]);

  const isActive = !hasChildren && location.pathname === item.path;

  const handleClick = () => {
    if (hasChildren) setChildOpen(o => !o);
    else             onNavigate(item.path);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        title={!open ? item.label : undefined}
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            open ? 12 : 0,
          width:          "100%",
          minHeight:      44,
          padding:        open ? `10px 16px 10px ${16 + level * 16}px` : "10px 0",
          justifyContent: open ? "flex-start" : "center",
          background:     isActive ? "rgba(255,255,255,0.12)" : "transparent",
          border:         "none",
          borderLeft:     isActive && open ? "3px solid #fff" : "3px solid transparent",
          borderRadius:   0,
          color:          isActive ? "#ffffff" : "rgba(255,255,255,0.75)",
          fontSize:       13.5,
          fontWeight:     isActive ? 600 : 400,
          fontFamily:     "'Outfit', sans-serif",
          cursor:         "pointer",
          transition:     "background 0.15s, color 0.15s",
          textAlign:      "left",
          whiteSpace:     "nowrap",
          overflow:       "hidden",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.8 }}>{item.icon}</span>
        {open && <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
        {open && hasChildren && (
          <span style={{ flexShrink: 0, opacity: 0.7 }}>
            {childOpen ? <ChevronUp /> : <ChevronDown />}
          </span>
        )}
      </button>

      {hasChildren && (
        <div style={{ maxHeight: childOpen && open ? item.children.length * 48 : 0, overflow: "hidden", transition: "max-height 0.25s ease", background: "rgba(0,0,0,0.1)" }}>
          {item.children.map(child => (
            <SidebarItem key={child.subModuleId || child.path} item={child} open={open} level={level + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ open, handleDrawerClose, handleDrawerOpen, menuItems, onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header — text logo, no image import needed */}
      <DrawerHeader style={{
        justifyContent: open ? "space-between" : "center",
        padding: open ? "0 12px 0 16px" : "0 12px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        {open && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            {/* Graduation cap icon as logo — no image file needed */}
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} width={18} height={18}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", whiteSpace: "nowrap", letterSpacing: "-0.2px" }}>EduAdmit</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>Admission Portal</div>
            </div>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            open ? handleDrawerClose() : handleDrawerOpen();
          }}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, padding: "5px 7px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", flexShrink: 0, transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </DrawerHeader>

      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />

      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingTop: 8 }}>
        {menuItems.map(item => (
          <SidebarItem key={item.moduleId} item={item} open={open} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar({ open, handleDrawerClose, handleDrawerOpen }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const user      = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const menuItems = getMenuByRole(user.role);

  const handleNavigation = (path) => {
    navigate(path || "/");
    if (isMobile) handleDrawerClose();
  };

  const sidebarStyle = {
    position:      "fixed",
    top:           0,
    left:          0,
    height:        "100vh",
    width:         open ? DRAWER_WIDTH : DRAWER_COLLAPSED,
    background:    "linear-gradient(180deg, #0d2d4a 0%, #0a1f36 100%)",
    color:         "#fff",
    zIndex:        1200,
    transition:    "width 0.2s ease",
    overflowX:     "hidden",
    overflowY:     "hidden",
    boxShadow:     "2px 0 8px rgba(0,0,0,0.15)",
    display:       "flex",
    flexDirection: "column",
  };

  if (isMobile) {
    return (
      <>
        {open && (
          <div onClick={handleDrawerClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1199 }} />
        )}
        <div style={{ ...sidebarStyle, width: DRAWER_WIDTH, transform: open ? "translateX(0)" : `translateX(-${DRAWER_WIDTH}px)`, transition: "transform 0.25s ease" }}>
          <SidebarContent open={true} handleDrawerClose={handleDrawerClose} menuItems={menuItems} onNavigate={handleNavigation} />
        </div>
      </>
    );
  }

  return (
    <div 
      style={{ ...sidebarStyle, cursor: !open ? "pointer" : "default" }}
      onClick={() => {
        if (!open && handleDrawerOpen) handleDrawerOpen();
      }}
    >
      <SidebarContent open={open} handleDrawerClose={handleDrawerClose} handleDrawerOpen={handleDrawerOpen} menuItems={menuItems} onNavigate={handleNavigation} />
    </div>
  );
}