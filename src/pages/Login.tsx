import { useState } from "react"
import { supabase } from "../common/supabase";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  sessionStorage.clear();

  const goToHome = () => {
    nav("/");
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === "" || password === "") {
      alert("Please enter both a username and a password");
    } else {
      const {data, error} = await supabase.from("logins").select("userID, faster_calculations, lesson_text, move_retracing").eq("username", username).eq("password", password);
      if (error) throw error;
      if (data.length !== 0) {
        alert("Login successful.")
        sessionStorage.setItem("userID", data.map(x => x.userID).toString()); 
        sessionStorage.setItem("fasterCalcs", data.map(x => x.faster_calculations).toString()); 
        sessionStorage.setItem("lessonText", data.map(x => x.lesson_text).toString()); 
        sessionStorage.setItem("moveRetracing", data.map(x => x.move_retracing).toString()); 
        goToHome();
      } else {
        alert("Invalid username/password combination. Remember: passwords are case-sensitive!");
      }
    }
  }

  return (
    <>
      <h1 style={{color:"rgb(248, 245, 231)"}}>Log in to record your Poker progress.</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label style={{color:"rgb(248, 245, 231)"}}>Username: </label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div>
          <label style={{color:"rgb(248, 245, 231)"}}>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div> 
        <input type="submit" value="Log In" className="hollow-button" style={{marginTop: "10px"}}/>
      </form>
      <div className="dividing-line" />
      <h1 style={{color:"rgb(248, 245, 231)", margin:"1vw"}}>Don't have an account yet?</h1>
      <Link reloadDocument to="/register">
      <button className="hollow-button">Click here to register!</button>
      </Link>
    </>
  )
}

export default Login;