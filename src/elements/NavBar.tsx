import { Link } from "react-router-dom"

function NavBar() {
  return (
    <nav className="nav-bar" style={{marginBottom: "1vw"}}>
      <Link reloadDocument to="/play">
        <button className="links">Play Locally</button>
      </Link>
      <Link reloadDocument to="/">
        <button className="title">I.Poker</button>
      </Link> 
      <Link className="links" reloadDocument to="/train">
        <button className="links">Practice Lessons</button>
      </Link>
    </nav>
  )
}

export default NavBar;