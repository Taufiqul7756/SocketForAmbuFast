import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

const port = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Handle socket.io events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Notify other users that a new user has joined
  socket.broadcast.emit("user-joined", `${socket.id} has joined the chat`);

  // Listen for incoming messages
  socket.on("message", (data) => {
    console.log(`Message from ${socket.id}: ${data}`);
    io.emit("receive-msg", { id: socket.id, message: data });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("user-left", `${socket.id} has left the chat`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
