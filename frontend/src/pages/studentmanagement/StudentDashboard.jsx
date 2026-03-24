import { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { getColleges, toggleInterest } from "../../api/collegeApi";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || import.meta.env.VITE_API_URL);

export default function StudentDashboard() {
  const toast = useToast();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [search, setSearch] = useState("");
  
  const [messages, setMessages] = useState([]);
  const [currentMsg, setCurrentMsg] = useState("");
  
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const studentEmail = user?.email || "";

  useEffect(() => {
    fetchData();

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const fetchData = async () => {
    try {
      const data = await getColleges();
      // Assume we get raw colleges, we need to map if they are interested based on student's interested list?
      // Wait, the backend doesn't return student's interests in the college object natively yet. Let's just default to false for now locally.
      setColleges(data.map(c => ({ ...c, interested: false })));
    } catch {
      toast("Failed to load colleges", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async (id) => {
    try {
      const res = await toggleInterest(id, studentEmail);
      toast(res.message, "success");
      setColleges(prev => prev.map(c => 
        c._id === id ? { ...c, interested: !c.interested } : c
      ));
    } catch {
      toast("Error updating interest", "error");
    }
  };

  const handleChat = (college) => {
    setActiveChat(college);
    setChatOpen(true);
    setMessages([{
      sender: "Counselor",
      message: `Hello! I'm a counselor from ${college.collegeName}. How can I help you today?`,
      timestamp: new Date()
    }]);

    const room = `${studentEmail}_${college._id}`;
    socket.emit("join_room", { room });
  };

  const sendMessage = () => {
    if (!currentMsg.trim()) return;
    
    const room = `${studentEmail}_${activeChat._id}`;
    const msgData = { 
      room, 
      sender: "You", 
      message: currentMsg, 
      receiverCollege: activeChat.collegeName, 
      timestamp: new Date() 
    };
    
    socket.emit("send_message", msgData);
    setMessages(prev => [...prev, msgData]);
    setCurrentMsg("");
  };

  const filteredColleges = colleges.filter(c => c.collegeName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1e293b" }}>Welcome Student</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>Browse available colleges, express your interest, and chat with counselors.</p>
        </div>
        <input 
          placeholder="Search Colleges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250, height: 40, padding: "0 16px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {filteredColleges.map(c => (
          <div key={c._id} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e5e9f0", position: "relative" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#1e293b" }}>{c.collegeName}</h3>
            <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontFamily: "monospace", color: "#475569" }}>{c.collegeCode}</span>
            <p style={{ fontSize: 14, color: "#64748b", margin: "12px 0 20px 0" }}>Location: {c.location}</p>
            
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => handleInterest(c._id)}
                style={{ flex: 1, padding: "8px 0", borderRadius: 6, fontWeight: 600, fontSize: 13.5, cursor: "pointer", border: c.interested ? "1px solid #1a6fa8" : "none", background: c.interested ? "#e8f4fd" : "#1a6fa8", color: c.interested ? "#1a6fa8" : "#fff", transition: "all 0.2s" }}>
                {c.interested ? "✓ Interested" : "Express Interest"}
              </button>
              <button 
                onClick={() => handleChat(c)}
                style={{ flex: 1, padding: "8px 0", borderRadius: 6, fontWeight: 600, fontSize: 13.5, cursor: "pointer", border: "1px solid #1a6fa8", background: "#fff", color: "#1a6fa8" }}>
                Chat (Live)
              </button>
            </div>
          </div>
        ))}
        {filteredColleges.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "#94a3b8" }}>No colleges match your search.</div>
        )}
      </div>

      {chatOpen && activeChat && (
        <div style={{ position: "fixed", bottom: 20, right: 20, width: 320, background: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid #e2e8f0", zIndex: 1000, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: "#1a6fa8", color: "#fff", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Chat with {activeChat.collegeName}</span>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
          <div style={{ height: 250, background: "#f8fafc", padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", 
                background: msg.sender === "You" ? "#1a6fa8" : "#e2e8f0", 
                color: msg.sender === "You" ? "#fff" : "#333",
                padding: "8px 12px", 
                borderRadius: msg.sender === "You" ? "12px 12px 0 12px" : "12px 12px 12px 0", 
                fontSize: 13, 
                maxWidth: "85%" 
              }}>
                {msg.message}
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={currentMsg}
              onChange={(e) => setCurrentMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #e2e8f0", outline: "none", fontSize: 13 }} 
            />
            <button 
              onClick={sendMessage}
              style={{ background: "#1a6fa8", color: "#fff", border: "none", height: 32, width: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}><line x1={22} y1={2} x2={11} y2={13} /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
