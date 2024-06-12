import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

function NavBar() {

  const nav = useNavigate();

  const goToPlay = () => {
    // Redirects the user to the local multiplayer page.
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

  const goToHome = () => {
    // Redirects the user to the home page.
    nav("/");
  }

  function logInButtonText() {
    // Ensures that the the text on the link to the login page matches whether or not a user is logged in.
    if (sessionStorage.getItem("userID")) {
      return "Log Out";
    } else {
      return "Log In/Register";
    }
  }

  const openGuide = () => {
    // Opens the guide page on in a new tab in the current window.
    window.open("/guide", "_blank")!.focus();
  }

  var loggedInText = "Log In/Register"
  return (
    <nav className="nav-bar" style={{marginBottom: "1vw"}}>
      <button className="title" onClick={goToHome}>GET POKER ED</button>
      <button className="links" onClick={goToPlay}>Play Locally</button>
      <button className="links" onClick={goToTrain}>Practice Lessons</button>
      <button className="links" onClick={openGuide}>Interactive Guide</button>
      <button className="links" onClick={goToSettings}>Settings</button>
      <button className="links" onClick={goToLogin}>{logInButtonText()}</button>
    </nav>
  )
}

export default NavBar;