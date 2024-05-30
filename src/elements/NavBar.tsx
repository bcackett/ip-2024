import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

function NavBar() {

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

  const goToHome = () => {
    nav("/");
  }

  function logInButtonText() {
    if (sessionStorage.getItem("userID")) {
      return "Log Out";
    } else {
      return "Log In/Register";
    }
  }

  const openGuide = () => {
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