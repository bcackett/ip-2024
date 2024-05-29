import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Welcome() {

  const nav = useNavigate();

  const goToPlay = () => {
    nav("/play");
  }

  const goToTrain = () => {
    nav("/train");
  }

  const goToLogin = () => {
    nav("/login");
  }

  const goToSettings = () => {
    nav("/settings");
  }

  const openGuide = () => {
    window.open("/guide", "_blank")!.focus();
  }

  function isLoggedIn() {
    if (sessionStorage.getItem("userID")) {
      return true;
    } else {
      return false;
    }
  }

  if (!sessionStorage.getItem("userID")) {
    sessionStorage.setItem("fasterCalcs", "true");
    sessionStorage.setItem("lessonText", "true");
    sessionStorage.setItem("moveRetracing", "true");
  }

  return (
    <>
      <div className="logo-grid">
        <div className="logo-image" />
        <div className="logo-div">
          <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Welcome to GetPokerEd!</h1>
          <div>
            <label style={{display: "inline-block", color: "#f5f8e7", width: "45vw"}}>GetPokerEd aims to help anyone and everyone learn and improve at Texas Hold 'Em Poker.</label>
          </div>
          <div>
            <label style={{display: "inline-block", color: "#f5f8e7", width: "45vw"}}>This website offers 12 lessons with varying difficulty to help understand the basics, and a local multiplayer platform for practicing against your friends.</label>
          </div>
        </div>
      </div>
      
      <div className="relocate-grid">
        {/* <div className="dividing-line" /> */}
        <button className="relocate-button guide-button" onClick={openGuide}>
          Want a guide to this platform?
        </button>

        {/* <div className="dividing-line" /> */}
        <button className="relocate-button solo-button" onClick={goToTrain}>
          Ready to start solo training?
        </button>
        {/* <div className="dividing-line" /> */}
        <button className="relocate-button multiplayer-button" onClick={goToPlay}>
          Want to practice as a group?
        </button>
        {/* <div className="dividing-line" /> */}
        <button hidden={isLoggedIn()} className="relocate-button login-register-button" onClick={goToLogin}>
          Want to save your progress?
        </button>
        <button hidden={!isLoggedIn()} className="relocate-button settings-button" onClick={goToSettings}>
          Want to configure your personal settings?
        </button>
      </div>
      
    </>
  );
}

export default Welcome;