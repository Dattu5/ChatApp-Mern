 import './App.css';
import Main from './Components/Main';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import Hero from "./Components/Hero";
import "@fortawesome/fontawesome-free/css/all.min.css";



function App() {
   const [username, setUsername] = useState("");
   
  return (
      <Router>
      <Routes>
        <Route path="/" element={<Hero onStartChat={setUsername} />} />
        <Route path="/chat" element={<Main username={username} />} />
      </Routes>
    </Router>
  );
}

export default App;
