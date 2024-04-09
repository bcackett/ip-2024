import { useEffect } from "react";
import { Link } from "react-router-dom"

function NavBar() {

  function logInButtonText() {
    if (process.env.USER_ID = "-1") {
      return "Log In/Register";
    } else {
      return "Log Out";
    }
  }

  var loggedInText = "Log In/Register"
  return (
    <nav className="nav-bar" style={{marginBottom: "1vw"}}>
      <Link reloadDocument to="/">
        <button className="title">I.Poker</button>
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