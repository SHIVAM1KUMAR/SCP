import { useState, useEffect } from "react";
import dayjs from "dayjs";

// ─── RealTimeClock ────────────────────────────────────────────────────────────
// AmniCare: MUI Typography variant="caption" with dayjs
// EduAdmit: Plain <span> with same dayjs format — drop-in replacement
// ─────────────────────────────────────────────────────────────────────────────

const RealTimeClock = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      style={{
        fontSize: 11,
        color: "#94a3b8",
        whiteSpace: "nowrap",
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: "0.2px",
      }}
    >
      {currentTime.format("MMM DD, YYYY | hh:mm:ss A")}
    </span>
  );
};

export default RealTimeClock;