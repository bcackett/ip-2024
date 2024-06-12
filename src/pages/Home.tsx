import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GambleAwareBar from "../elements/GambleAwareBar";


function Welcome() {

  const nav = useNavigate();

  const goToPlay = () => {
    // Redirects the user to a local multiplayer game.
    nav("/play");
  }

  const goToTrain = () => {
    // Redirects the user to the training lesson selection page.
    nav("/train");
  }

  const goToLogin = () => {
    // Redirects the user to the login page.
    nav("/login");
  }

  const goToSettings = () => {
    // Redirects the user to the settings page.
    nav("/settings");
  }

  const openGuide = () => {
    // Opens the guide page in a new tab in the same browser.
    window.open("/guide", "_blank")!.focus();
  }

  function isLoggedIn() {
    // Checks if the data in session storage indicates that a user is currently logged into the platform.
    if (sessionStorage.getItem("userID")) {
      // If this item exists in session storage, the user has already logged in.
      return true;
    } else {
      return false;
    }
  }

  if (!sessionStorage.getItem("userID")) {
    // If no user is currently logged in, set the settings variables in session storage to their default values.
    sessionStorage.setItem("fasterCalcs", "true");
    sessionStorage.setItem("lessonText", "true");
    sessionStorage.setItem("moveRetracing", "true");
  }

  return (
    <>
      <GambleAwareBar /> 
      <div className="logo-grid">
        <div className="logo-image" />
        <div className="logo-div">
          <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Welcome to GetPokerEd!</h1>
          <div>
            <label className="intro-label">GetPokerEd aims to help anyone and everyone learn and improve at Texas Hold 'Em Poker.</label>
          </div>
          <div>
            <label className="intro-label"> </label>
          </div>
          <div>
            <label className="intro-label">This website offers 12 lessons with varying difficulty to help understand both the basics and more advanced strategies, and a local multiplayer platform for practicing against your friends.</label>
          </div>
          <div>
            <label className="intro-label"> </label>
          </div>
          <div>
            <label className="intro-label">Above all else, GetPokerEd offers you the opportunity to do something unique: turn back time. Revisit previous decisions and see how other scenarios could have played out mid-game!</label>
          </div>
          <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Good Luck and Enjoy!</h1>
        </div>
      </div>
      
      <div className="relocate-grid">
        <button className="relocate-button guide-button" onClick={openGuide}>
          Want a guide to this platform?
        </button>
        <button className="relocate-button solo-button" onClick={goToTrain}>
          Ready to start solo training?
        </button>
        <button className="relocate-button multiplayer-button" onClick={goToPlay}>
          Want to practice as a group?
        </button>
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