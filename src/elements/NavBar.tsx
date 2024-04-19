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

  var loggedInText = "Log In/Register"
  return (
    <nav className="nav-bar" style={{marginBottom: "1vw"}}>
      <Link reloadDocument to="/">
        <button className="title">PokerEdu</button>
      </Link>
      <Link reloadDocument to="/play">
        <button className="links">Play Locally</button>
      </Link> 
      <Link reloadDocument to="/train">
        <button className="links">Practice Lessons</button>
      </Link>
      <Link reloadDocument to="/login">
        <button className="links">{logInButtonText()}</button>
      </Link>
    </nav>
  )
}

export default NavBar;