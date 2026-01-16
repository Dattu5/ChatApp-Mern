 import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

function Hero({ onStartChat }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (!name) return;
    onStartChat(name);   
    navigate("/chat");  
  };

  return (
    <div className="hero-container">
      <nav className="hero-nav">
        <h2>ChatUp</h2>
      </nav>

      <div className="hero-content">
        <h1>Welcome to ChatUp</h1>
        <p>Connect instantly with your friends in real-time chat. Fast, simple, and fun!</p>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={handleStart}>Let's Chat</button>
        
<p style={{ color: "red", marginTop: "10px", fontSize: "14px" ,backgroundColor: 'rgba(0,0,0,0.2)',padding:'6px 14px'}}>
  Note: Please clear chat after your session
</p>
      </div>
    </div>
  );
}

export default Hero;
