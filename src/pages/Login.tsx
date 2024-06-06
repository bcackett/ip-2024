import { useState } from "react"
import { supabase } from "../common/supabase";
import { Link, useNavigate } from "react-router-dom";
import VigenereCipher from "../elements/VigenereCipher";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("Log In")
  const nav = useNavigate();
  const cipher = new VigenereCipher
  sessionStorage.clear();

  const goToHome = () => {
    nav("/");
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    await setSubmitButtonText("...");
    event.preventDefault();
    if (username === "" || password === "") {
      alert("Please enter both a username and a password");
    } else {
      document.getElementById("submission-button")!.innerText = "...";
      const {data, error} = await supabase.from("logins").select("userID, firstName, faster_calculations, lesson_text, move_retracing").eq("username", cipher.encode(username, "username")).eq("password", cipher.encode(password, "password"));
      if (error) throw error;
      if (data.length !== 0) {
        alert("Login successful. You are now logged in as " + username + ".");
        sessionStorage.setItem("userID", data.map(x => x.userID).toString()); 
        sessionStorage.setItem("fasterCalcs", data.map(x => x.faster_calculations).toString()); 
        sessionStorage.setItem("lessonText", data.map(x => x.lesson_text).toString()); 
        sessionStorage.setItem("moveRetracing", data.map(x => x.move_retracing).toString()); 
        if (data.map(x => x.firstName) !== null) {
          sessionStorage.setItem("name", cipher.decode(data.map(x => x.firstName).toString(), "name")); 
        }
        goToHome();
      } else {
        alert("Invalid username/password combination. Remember: passwords are case-sensitive!");
        await setSubmitButtonText("Log In");
      }
    }
  }


  return (
    <>
      <h1 style={{color:"rgb(248, 245, 231)", marginBottom: "1vh"}}>Log in to record your Poker progress.</h1>
      <form onSubmit={handleLogin}>
        <div>
          <h2 style={{color:"rgb(248, 245, 231)"}}>Username: </h2>
          <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div>
          <h2 style={{color:"rgb(248, 245, 231)"}}>Password: </h2>
          <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div> 
        <input type="submit" value={submitButtonText} className="hollow-button" id="submission-button" style={{marginTop: "10px"}}/>
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