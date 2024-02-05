import { Link } from "react-router-dom"

function NavBar() {
  return (
    <nav className="nav-bar">
      <Link reloadDocument to="/">
        <h1>I.Poker</h1>
      </Link> 
      {
        <div className="links">
          <Link reloadDocument to="/play">
            Play Online
          </Link>
          <Link reloadDocument to="/train">
            Practice Lessons
          </Link>
        </div>
      }
    </nav>
  )
}

export default NavBar;