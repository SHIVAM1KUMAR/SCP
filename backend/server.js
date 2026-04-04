import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/student/studentRoutes.js";
import collegeRoutes from "./routes/college/collegeRoutes.js";
import subscriptionRoutes from "./routes/subscription/subscriptionRoutes.js";
import counsellingRoutes from "./routes/counselling/counsellingRoutes.js";
import testRoutes from "./routes/tests/testRoutes.js";

import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ✅ Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Socket ─────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ─── Ensure uploads directory exists ───────────────────────────
// Keep upload storage aligned with the route multer destination.
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ IMPORTANT FIX (ONLY ONE TIME)
app.use("/uploads", express.static(uploadsPath));

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/counselling", counsellingRoutes);
app.use("/api/tests", testRoutes);

app.set("io", io);

// ─── Socket Logic ─────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data.room);
  });

  socket.on("join_notifications", (data = {}) => {
    const { role, collegeId, studentId } = data;
    const normalizedRole = String(role || "").toLowerCase();

    if (normalizedRole === "superadmin") {
      socket.join("counselling:superadmin");
      return;
    }

    if ((normalizedRole === "college" || normalizedRole === "counsellor") && collegeId) {
      socket.join(`counselling:college:${collegeId}`);
      return;
    }

    if (normalizedRole === "student" && studentId) {
      socket.join(`counselling:student:${studentId}`);
    }
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);

    setTimeout(() => {
      io.to(data.room).emit("receive_message", {
        sender: "Counselor",
        message: `Thanks! ${data.receiverCollege} will review: "${data.message}"`,
        timestamp: new Date(),
      });
    }, 1500);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ─── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ─── DB + Start ───────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
