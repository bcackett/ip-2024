import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Routes } from "react-router-dom";
// import Home from "./pages/Home";
import NotFound from './pages/NotFound';
import { useNavigate } from "react-router-dom";

function App() {
  const nav = useNavigate();

  const goToPlay = () => {
    nav("/play")
  }

  const goToTrain = () => {
    nav("/train")
  }

  return (
    <>
      <div className="name-frame">
        <h1>Welcome to I.Poker!</h1>
      </div>
      <div>
        <label>I.Poker is a one-site-fits-all solution to learning and improving at Texas Hold 'Em Poker!</label>
      </div>
      <div>
        <button className="spaced-button" type="button" onClick={goToTrain}>
          "Training Lessons"
        </button>
        <button className="spaced-button" type="button" onClick={goToPlay}>
          "Play Online"
        </button>
      </div>
    </>
    // <Routes>
    //   {/* <Route path="/train" element={<Training />} />
    //   <Route path="/play" element={<Play />} /> */}
    //   <Route path="/" element={<Home />} />
    //   <Route path="/*" element={<NotFound />} />
    // </Routes>
  );
}

export default App;
