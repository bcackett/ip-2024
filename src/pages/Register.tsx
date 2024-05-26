import { useState } from "react"
import { supabase } from "../common/supabase";
import { Link, useNavigate } from "react-router-dom";
import VigenereCipher from "../elements/VigenereCipher";

function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("Register")
  const cipher = new VigenereCipher;
  const nav = useNavigate();

  const goToHome = () => {
    nav("/");
  }

  sessionStorage.clear();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    await setSubmitButtonText("...");
    event.preventDefault();
    if (username === "" || password === "") {
      alert("Please enter both a username and a password");
      await setSubmitButtonText("Register");
    } else {
      const {data, error} = await supabase.from("logins").select("username").eq("username", cipher.encode(username, "username"));
      if (error) throw error;
      if (data.length !== 0) {
        console.log(data.toString);
        alert("This username already exists. Please try again.");
        await setSubmitButtonText("Register");
      } else {
        let newUserID = 0;
        const e1 = await supabase.from("logins").select("userID").order("userID", {ascending: false}).limit(1).single();
        if (!e1.error) {
          newUserID = e1.data.userID + 1;
        }
        const e2 = await supabase.from("logins").insert({userID: newUserID, username: cipher.encode(username, "username"), password: cipher.encode(password, "password")});
          if (e2.error) {
            throw e2.error;
          } else {
            const e3 = await supabase.from("lessons").insert({userID: newUserID});
            if (e3.error) {
              throw e3.error;
            } else {
              alert("Account creation successful. You are now logged in as " + username + ".");
              sessionStorage.setItem("userID", newUserID.toString());
              sessionStorage.setItem("fasterCalcs", "false"); 
              sessionStorage.setItem("lessonText", "true"); 
              sessionStorage.setItem("moveRetracing", "true"); 
              if (firstName.length > 0) {
                const e4 = await supabase.from("logins").update({firstName: cipher.encode(firstName, "name")}).eq("userID", newUserID);
                if (e4.error) {throw e4.error};
                sessionStorage.setItem("name", firstName); 
              }
              goToHome();
            }
          }
      }
    }
  }

  return (
    <>
      <h1 style={{color:"rgb(248, 245, 231)"}}>Create an account to start improving today.</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label style={{color:"rgb(248, 245, 231)"}}>Username: </label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div>
          <label style={{color:"rgb(248, 245, 231)"}}>{"Preferred First Name \(optional\): "} </label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
        </div> 
        <div>
          <label style={{color:"rgb(248, 245, 231)"}}>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div> 
        <input type="submit" value={submitButtonText} className="hollow-button" style={{marginTop: "10px"}}/>
      </form>
      <div className="dividing-line" />
      <h1 style={{color:"rgb(248, 245, 231)", margin:"1vw"}}>Already have an account?</h1>
      <Link reloadDocument to="/login">
        <button className="hollow-button">Click here to log in!</button>
      </Link>
    </>
  )
}

export default Register;