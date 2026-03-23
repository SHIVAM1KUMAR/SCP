import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

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
        timestamp: new Date()
      });
    }, 1500);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT} with Socket.io`);
});