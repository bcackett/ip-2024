import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from './pages/NotFound';
import { useNavigate } from "react-router-dom";

function App() {
  return (
    <Routes>
      {/* <Route path="/train" element={<Training />} />
      <Route path="/play" element={<Play />} /> */}
      <Route path="/" element={<Home />} />
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
