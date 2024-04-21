import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Training from "./pages/Training";
import Play from "./pages/Play";
import Login from "./pages/Login";
import Register from './pages/Register';
import { useNavigate } from "react-router-dom";
import TrainingScenario from './pages/TrainingScenario';
import CustomSetup from "./pages/CustomSetup";

function App() {
  const regex = "([0-9]+)";
  return (
    <Routes>
      <Route path="/train" element={<Training />} />
      <Route path={`/lessons/:id`} element={<TrainingScenario />} />
      <Route path="/play" element={<Play />} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customgame" element= {<CustomSetup />} />
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
}

export default App;