 import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./Main.css";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";


 
function Main({ username }) {
  const socketRef = useRef(null);  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
 const messagesEndRef = useRef(null);
 const [snackOpen, setSnackOpen] = useState(false);
const [snackMsg, setSnackMsg] = useState("");
const [snackType, setSnackType] = useState("info");


 useEffect(() => {
  if (!username) return;

  if (!socketRef.current) {
    socketRef.current = io("http://localhost:5000");
  }

  const socket = socketRef.current;

  const register = () => {
    socket.emit("registerUser", username);
  };

  // ✅ If already connected (MOST IMPORTANT FIX)
  if (socket.connected) {
    register();
  }
 

  // ✅ If connects later
  socket.on("connect", register);

  socket.on("onlineUsers", setOnlineUsers);
  socket.on("oldMessages", setMessages);
  socket.on("receiveMessage", (data) =>
    setMessages((prev) => [...prev, data])
  );
socket.on("userJoined", (name) => {
  setSnackMsg(`${name} joined the chat`);
  setSnackType("info");
  setSnackOpen(true);
});

socket.on("userLeft", (name) => {
  setSnackMsg(`${name} left the chat`);
  setSnackType("warning");
  setSnackOpen(true);
});

  return () => {
    socket.off("connect", register);
    socket.off("onlineUsers");
    socket.off("oldMessages");
    socket.off("receiveMessage");
    socket.off("userJoined");
socket.off("userLeft");

  };
}, [username]);


const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
};
useEffect(() => {
  scrollToBottom();
}, [messages]);

 const sendMessage = () => {
  if (!message || !socketRef.current) return;

  socketRef.current.emit("sendMessage", {
    sender: username,
    text: message,
  });

  setMessage("");
};


  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

 const clearChat = () => {
  if (!socketRef.current) return; // ✅ prevent crash

  if (window.confirm("Are you sure you want to clear the chat?")) {
    socketRef.current.emit("clearChat");
  }
};

const formatTime = (createdAt) => {
  const date = new Date(createdAt);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0–23 to 1–12
  return `${hours}:${minutes} ${ampm}`;
};


  return (
    <> 
    <div className="chat">
       <div className="chat-header">
  <div className="chat-name">ChatUp</div>

  <div className="chat-online" onClick={handleClick}>
    <span className="online-dot"></span>Online
  </div>

  <button className="clear-btn" onClick={clearChat}>
    Clear Chat
  </button>



        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <div className="popover-content">
            {onlineUsers.length > 0 ? (
              onlineUsers.map((user, i) => (
                <div key={i} className="user-item">
                  <span className="online-dot"></span>
                  <Avatar className='A' sx={{ bgcolor: "#1976d2", width: 30, height: 30 }}>
                    {user?.[0]?.toUpperCase() || "?"}
                  </Avatar>
                  <span className="user-name">{user}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: "8px" }}>No users online</div>
            )}
          </div>
        </Popover>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
           <div
      className={`message ${m.sender === username ? "message" : "message-right"}`}
      key={i}
    >
            
            <div className="message-header">
              <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32 }}>
                {m.sender?.[0]?.toUpperCase() || "?"}
              </Avatar>
              <span className="sender">{`${m.sender === username ?'you' : m.sender}`}</span>
               <span className="time">{formatTime(m.createdAt)}</span>
            </div>
            <span className="text">{m.text}</span>
          </div>
        ))}
         <div ref={messagesEndRef} />

      </div>

      <div className="chat-input">
        <input
          value={message}
          placeholder="Type a message"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      
    </div>
    <Snackbar
  open={snackOpen}
  autoHideDuration={3000}
  onClose={() => setSnackOpen(false)}
  anchorOrigin={{ vertical: "top", horizontal: "right" }}
>
  <Alert severity={snackType} variant="filled">
    {snackMsg}
  </Alert>
</Snackbar>

    </>
  );
 }
export default Main;
