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

  function isLoggedIn() {
    if (sessionStorage.getItem("userID")) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <>
      <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Welcome to GetPokerEd!</h1>
      <div>
        <label style={{display: "inline-block", color: "#f5f8e7", width: "45vw"}}>GetPokerEd aims to help anyone and everyone learn and improve at Texas Hold 'Em Poker.</label>
      </div>
      <div>
        <label style={{display: "inline-block", color: "#f5f8e7", width: "45vw"}}>This website offers 12 lessons with varying difficulty to help understand the basics, and a local multiplayer platform for practicing against your friends.</label>
      </div>
      <div className="dividing-line" />
      <div>
        <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Ready to start solo training?</h1>
        <button className="hollow-button" type="button" onClick={goToTrain}>
          Training Lessons
        </button>
      </div>
      <div className="dividing-line" />
      <div>
        <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Want to practice as a group?</h1>
        <button className="hollow-button" type="button" onClick={goToPlay}>
          Local Multiplayer
        </button>
      </div>
      <div className="dividing-line" />
      <div hidden={isLoggedIn()}>
        <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Want to save your progress?</h1>
        <button className="hollow-button" type="button" onClick={goToLogin}>
          Login/Register
        </button>
      </div>
      <div hidden={!isLoggedIn()}>
        <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Want to configure your personal settings?</h1>
        <button className="hollow-button" type="button" onClick={goToSettings}>
          Change Settings
        </button>
      </div>
    </>
  );
}

export default Welcome;