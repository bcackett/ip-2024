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
  sessionStorage.clear(); // Log out any previously logged in user when returning to this page.

  const goToHome = () => {
    // Redirects the user to the home page.
    nav("/");
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    // Handles the operations required to log in an existing user.
    await setSubmitButtonText("..."); // Change button text to indicate that an operation is occuring.
    event.preventDefault();
    if (username === "" || password === "") {
      // Without both a username and password, there is not enough information to ensure that the person attempting to access the account is the owner.
      alert("Please enter both a username and a password");
    } else {
      document.getElementById("submission-button")!.innerText = "...";
      const {data, error} = await supabase.from("logins").select("userID, firstName, faster_calculations, lesson_text, move_retracing").eq("username", cipher.encrypt(username, "username")).eq("password", cipher.encrypt(password, "password"));
      if (error) throw error;
      if (data.length !== 0) { // Log in the user if the username and password entered results in a hit on the database.
        alert("Login successful. You are now logged in as " + username + ".");
        // Set all of the session storage variables to the values retrieved from the database to be used in games.
        sessionStorage.setItem("userID", data.map(x => x.userID).toString()); 
        sessionStorage.setItem("fasterCalcs", data.map(x => x.faster_calculations).toString()); 
        sessionStorage.setItem("lessonText", data.map(x => x.lesson_text).toString()); 
        sessionStorage.setItem("moveRetracing", data.map(x => x.move_retracing).toString()); 
        if (data.map(x => x.firstName) !== null) {
          sessionStorage.setItem("name", cipher.decrypt(data.map(x => x.firstName).toString(), "name")); 
        }
        goToHome();
      } else { // If there is no matching combination found on the database, the user does not exist or the password is incorrect.
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