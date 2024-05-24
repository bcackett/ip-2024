import { useEffect } from "react";
import { Link } from "react-router-dom"

function NavBar() {

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
      <Link reloadDocument to="/">
        <button className="title">GetPokerEd</button>
      </Link>
      <Link reloadDocument to="/play">
        <button className="links">Play Locally</button>
      </Link> 
      <Link reloadDocument to="/train">
        <button className="links">Practice Lessons</button>
      </Link>
      <button className="links" onClick={openGuide}>Interactive Guide</button>
      <Link reloadDocument to="/settings">
        <button className="links">Settings</button>
      </Link>
      <Link reloadDocument to="/login">
        <button className="links">{logInButtonText()}</button>
      </Link>
    </nav>
  )
}

export default NavBar;