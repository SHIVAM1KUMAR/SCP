import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

// Routes
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ─── Ensure uploads directory exists ─────────────────────────────────────────
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use("/uploads", express.static(path.resolve("uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/colleges", collegeRoutes);

io.on("connection", (socket) => {
  console.log("New client connected to chat:", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data.room);
  });

  socket.on("send_message", (data) => {
    // data shape: { room, sender, message, receiverCollege, timestamp }
    socket.to(data.room).emit("receive_message", data);

    // Simulated Auto-Responder for Demo
    setTimeout(() => {
      io.to(data.room).emit("receive_message", {
        sender: "Counselor",
        message: `Thanks for your interest! A counselor from ${data.receiverCollege} will properly review your query: "${data.message}" soon.`,
        timestamp: new Date(),
      });
    }, 1500);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

// ─── DB + Start ───────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
