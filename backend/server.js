 const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

const app = express();
const server = http.createServer(app);

// Message schema
const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Messages", messageSchema);

// Track online users
let onlineUsers = [];

const io = new Server(server, {
  cors: { origin: "*" },
   methods: ["GET", "POST"]
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Register user
  socket.on("registerUser", async (username) => {
 socket.username = username;

    if (!onlineUsers.some(u => u.id === socket.id)) {
      onlineUsers.push({ id: socket.id, name: username });
    }

    const uniqueUsers = [...new Set(onlineUsers.map(u => u.name))];
    io.emit("onlineUsers", uniqueUsers);

     socket.broadcast.emit("userJoined", username);

    // Send old messages
    const oldMessages = await Message.find().sort({ createdAt: 1 });
    socket.emit("oldMessages", oldMessages);
  });

  // New message
  socket.on("sendMessage", async (msg) => {
    const message = new Message(msg);
    await message.save();
    io.emit("receiveMessage", message);
  });

  // ✅ CLEAR CHAT (THIS WAS YOUR BUG)
  socket.on("clearChat", async () => {
    await Message.deleteMany({});
    io.emit("oldMessages", []);
  });

 

   socket.on("disconnect", () => {
 if (socket.username) {
   console.log("DISCONNECT:", socket.username);
    socket.broadcast.emit("userLeft", socket.username); // ✅ ADD THIS
  }

    onlineUsers = onlineUsers.filter(u => u.id !== socket.id);
    const uniqueUsers = [...new Set(onlineUsers.map(u => u.name))];
    io.emit("onlineUsers", uniqueUsers);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
