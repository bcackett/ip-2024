import { useState } from "react"
import { supabase } from "../common/supabase";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const goToHome = () => {
    nav("/");
  }

  process.env.USER_ID = "-1"; 

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === "" || password === "") {
      alert("Please enter both a username and a password");
    } else {
      const {data, error} = await supabase.from("logins").select("userID").eq("username", username).eq("password", password);
      if (error) throw error;
      if (data.length !== 0) {
        alert("Login successful.")
        process.env.USER_ID = "1"; 
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
        <input type="submit" value="Log In"/>
      </form>
      <h1 style={{color:"rgb(248, 245, 231)", margin:"1vw"}}>Don't have an account yet?</h1>
      <Link reloadDocument to="/register">
      <button style={{color:"rgb(248, 245, 231)"}} className="links">Click here to register!</button>
      </Link>
    </>
  )
}

export default Login;