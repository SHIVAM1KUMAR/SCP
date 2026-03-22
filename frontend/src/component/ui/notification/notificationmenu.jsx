


// export default function NotificationMenu() {
    
// }




























// // import { useEffect, useState, useRef } from "react";
// // import dayjs from "dayjs";
// // import { v4 as uuidv4 } from "uuid";

// // // ─── NotificationMenu ─────────────────────────────────────────────────────────
// // // AmniCare: MUI Badge + Menu + SignalR + Redux auth
// // // EduAdmit: Custom dropdown + localStorage auth + WebSocket hook-ready
// // //
// // // SignalR replaced with a WebSocket/polling stub — wire up your real
// // // notification service by calling addNotification(payload) from outside,
// // // or replace the useEffect stub with your own signalRService calls.
// // // ─────────────────────────────────────────────────────────────────────────────

// // // ── SVG Icons ─────────────────────────────────────────────────────────────────
// // const BellIcon     = ({ filled }) => (
// //   <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} width={20} height={20}>
// //     <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
// //     <path d="M13.73 21a2 2 0 01-3.46 0" />
// //   </svg>
// // );
// // const PersonIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx={12} cy={7} r={4} /></svg>;
// // const ClockIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></svg>;
// // const CheckAllIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><polyline points="1 12 5 16 13 8" /><polyline points="9 12 13 16 21 8" /></svg>;
// // const BackIcon     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><polyline points="15 18 9 12 15 6" /></svg>;
// // const TrashIcon    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>;

// // const formatDate = (date) => dayjs(date).format("MMM D, YYYY · h:mm a");

// // export default function NotificationMenu() {
// //   const [open, setOpen]                   = useState(false);
// //   const [selected, setSelected]           = useState(null);
// //   const [notifications, setNotifications] = useState([]);
// //   const menuRef                           = useRef(null);

// //   // Read role from localStorage (replaces Redux state.auth)
// //   const user       = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
// //   const token      = localStorage.getItem("token");
// //   const isCaregiver = user.role?.toLowerCase() === "caregiver";

// //   const unreadCount = notifications.filter(n => !n.isRead).length;

// //   // ── SignalR / WebSocket stub ──────────────────────────────────────────────
// //   // Replace this with your real signalRService calls, same as AmniCare:
// //   //   signalRService.startConnection(token)
// //   //   signalRService.on("MissedVisitAlert", handler)
// //   // ─────────────────────────────────────────────────────────────────────────
// //   useEffect(() => {
// //     if (!token || !isCaregiver) return;
// //     // TODO: wire up your signalRService here
// //     // Example:
// //     // signalRService.startConnection(token).then(() => {
// //     //   signalRService.on("MissedVisitAlert", (data) => addNotification(data));
// //     // });
// //     // return () => signalRService.off("MissedVisitAlert");
// //   }, [token, isCaregiver]);

// //   // Public helper — call this to push a notification from signalRService
// //   const addNotification = (data) => {
// //     setNotifications(prev => {
// //       const exists = prev.some(n => n.evvVisitId === data.evvVisitId && n.alertedAt === data.alertedAt);
// //       if (exists) return prev;
// //       return [{ id: uuidv4(), ...data, isRead: false }, ...prev];
// //     });
// //   };

// //   // Close dropdown on outside click
// //   useEffect(() => {
// //     const handler = (e) => {
// //       if (menuRef.current && !menuRef.current.contains(e.target)) {
// //         setOpen(false);
// //         setSelected(null);
// //       }
// //     };
// //     document.addEventListener("mousedown", handler);
// //     return () => document.removeEventListener("mousedown", handler);
// //   }, []);

// //   const handleNotificationClick = (n) => {
// //     setSelected(n);
// //     setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
// //   };

// //   const handleMarkAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

// //   const handleDelete = (id, e) => {
// //     e.stopPropagation();
// //     setNotifications(prev => prev.filter(n => n.id !== id));
// //   };

// //   return (
// //     <div className="position-relative" ref={menuRef}>

// //       {/* ── Bell button ── */}
// //       <button
// //         onClick={() => { setOpen(o => !o); setSelected(null); }}
// //         style={{
// //           background: "none", border: "none", cursor: "pointer",
// //           position: "relative", padding: 6, color: "#64748b",
// //           display: "flex", alignItems: "center", borderRadius: 8,
// //           transition: "transform 0.15s ease",
// //         }}
// //         onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
// //         onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
// //       >
// //         <BellIcon filled={unreadCount > 0} />
// //         {unreadCount > 0 && (
// //           <span style={{
// //             position: "absolute", top: 2, right: 2,
// //             background: "#e53e3e", color: "#fff",
// //             borderRadius: "50%", width: 17, height: 17,
// //             fontSize: 9, fontWeight: 700,
// //             display: "flex", alignItems: "center", justifyContent: "center",
// //             border: "2px solid #fff",
// //           }}>
// //             {unreadCount > 9 ? "9+" : unreadCount}
// //           </span>
// //         )}
// //       </button>

// //       {/* ── Dropdown panel ── */}
// //       {open && (
// //         <div style={{
// //           position: "absolute", top: "calc(100% + 6px)", right: 0,
// //           width: 380, maxHeight: 480,
// //           background: "#fff", borderRadius: 12,
// //           border: "1px solid #e5e9f0",
// //           boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
// //           display: "flex", flexDirection: "column",
// //           zIndex: 2000, overflow: "hidden",
// //           fontFamily: "'Outfit', sans-serif",
// //         }}>

// //           {!selected ? (
// //             /* ── List View ── */
// //             <>
// //               {/* Header */}
// //               <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f3f7", flexShrink: 0 }}>
// //                 <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
// //                   <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>Notifications</span>
// //                   {unreadCount > 0 && (
// //                     <span style={{ background: "#1a6fa8", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>
// //                       {unreadCount}
// //                     </span>
// //                   )}
// //                 </div>
// //                 {unreadCount > 0 && (
// //                   <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: "#1a6fa8", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "4px 6px", borderRadius: 6 }}>
// //                     <CheckAllIcon /> Mark all read
// //                   </button>
// //                 )}
// //               </div>

// //               {/* List */}
// //               <div style={{ overflowY: "auto", flex: 1 }}>
// //                 {notifications.length === 0 ? (
// //                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", gap: 8 }}>
// //                     <BellIcon filled={false} />
// //                     <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>No notifications</span>
// //                     <span style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>Nothing to display right now.</span>
// //                   </div>
// //                 ) : (
// //                   notifications.map((n, index) => (
// //                     <div key={n.id}>
// //                       <div
// //                         onClick={() => handleNotificationClick(n)}
// //                         style={{
// //                           padding: "12px 16px", cursor: "pointer",
// //                           display: "flex", gap: 10, alignItems: "flex-start",
// //                           background: n.isRead ? "transparent" : "rgba(26,111,168,0.05)",
// //                           borderLeft: `3px solid ${n.isRead ? "transparent" : "#1a6fa8"}`,
// //                           transition: "background 0.15s",
// //                         }}
// //                         onMouseEnter={e => (e.currentTarget.style.background = n.isRead ? "#fafbfc" : "rgba(26,111,168,0.09)")}
// //                         onMouseLeave={e => (e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(26,111,168,0.05)")}
// //                       >
// //                         {/* Unread dot */}
// //                         <div style={{ paddingTop: 4, flexShrink: 0 }}>
// //                           {!n.isRead
// //                             ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a6fa8" }} />
// //                             : <div style={{ width: 8, height: 8 }} />
// //                           }
// //                         </div>

// //                         <div style={{ flex: 1, minWidth: 0 }}>
// //                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
// //                             <span style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
// //                               Missed Visit Alert
// //                             </span>
// //                             <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
// //                               {formatDate(n.alertedAt)}
// //                             </span>
// //                           </div>

// //                           <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
// //                             <PersonIcon />
// //                             <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{n.caregiverName}</span>
// //                           </div>

// //                           <span style={{ fontSize: 11, color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
// //                             {n.message}
// //                           </span>
// //                         </div>

// //                         {/* Delete */}
// //                         <button onClick={(e) => handleDelete(n.id, e)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2, display: "flex", alignItems: "center", flexShrink: 0 }}>
// //                           <TrashIcon />
// //                         </button>
// //                       </div>
// //                       {index < notifications.length - 1 && <hr style={{ margin: "0 16px", borderColor: "#f0f3f7", opacity: 0.6 }} />}
// //                     </div>
// //                   ))
// //                 )}
// //               </div>
// //             </>

// //           ) : (
// //             /* ── Detail View ── */
// //             <>
// //               {/* Detail header */}
// //               <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f0f3f7", flexShrink: 0 }}>
// //                 <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}>
// //                   <BackIcon />
// //                 </button>
// //                 <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Notification Detail</span>
// //               </div>

// //               <hr style={{ margin: 0, borderColor: "#f0f3f7" }} />

// //               {/* Detail body */}
// //               <div style={{ padding: 20, overflowY: "auto" }}>
// //                 {/* Title + missed badge */}
// //                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
// //                   <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Missed Visit Alert</span>
// //                   <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid #fca5a5", color: "#991b1b", background: "#fff5f5" }}>Missed</span>
// //                 </div>

// //                 <hr style={{ borderColor: "#f0f3f7", marginBottom: 16 }} />

// //                 {/* Caregiver box */}
// //                 <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 8, background: "#f8fafc", marginBottom: 16 }}>
// //                   <PersonIcon />
// //                   <div>
// //                     <span style={{ fontSize: 11, color: "#94a3b8", display: "block", lineHeight: 1.2 }}>Caregiver</span>
// //                     <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{selected.caregiverName}</span>
// //                   </div>
// //                 </div>

// //                 {/* Message */}
// //                 <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, marginBottom: 16 }}>{selected.message}</p>

// //                 <hr style={{ borderColor: "#f0f3f7", marginBottom: 16 }} />

// //                 {/* Time details */}
// //                 <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
// //                   {[
// //                     { label: "Scheduled Start", value: formatDate(selected.scheduledStart) },
// //                     { label: "Scheduled End",   value: formatDate(selected.scheduledEnd)   },
// //                     { label: "Alerted At",       value: formatDate(selected.alertedAt)      },
// //                   ].map(({ label, value }) => (
// //                     <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
// //                       <div style={{ marginTop: 2, color: "#94a3b8", flexShrink: 0 }}><ClockIcon /></div>
// //                       <div>
// //                         <span style={{ fontSize: 11, color: "#94a3b8", display: "block", lineHeight: 1.2 }}>{label}</span>
// //                         <span style={{ fontSize: 12, fontWeight: 600, color: "#52637a" }}>{value}</span>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }