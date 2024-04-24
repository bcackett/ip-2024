import { useState } from "react"
import { supabase } from "../common/supabase";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const nav = useNavigate();

  const goToHome = () => {
    nav("/");
  }

  sessionStorage.clear();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === "" || password === "") {
      alert("Please enter both a username and a password");
    } else {
      const {data, error} = await supabase.from("logins").select("username").eq("username", username);
      if (error) throw error;
      if (data.length !== 0) {
        console.log(data.toString);
        alert("This username already exists. Please try again.");
      } else {
        const e1 = await supabase.from("logins").select("userID").order("userID", {ascending: false}).limit(1).single();
        if (e1.error) {
          throw e1.error;
        } else {
          let newUserID = e1.data.userID + 1;
          const e2 = await supabase.from("logins").insert({userID: newUserID, username: username, password: password});
          if (e2.error) {
            throw e2.error;
          } else {
            const e3 = await supabase.from("lessons").insert({userID: newUserID});
            if (e3.error) {
              throw e3.error;
            } else {
              alert("Account creation successful.");
              sessionStorage.setItem("userID", newUserID.toString());
              if (firstName.length > 0) {
                const e4 = await supabase.from("logins").update({firstName: firstName}).eq("userID", newUserID);
                if (e4.error) {throw e4.error};
              }
              goToHome();
            }
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
          <input type="text" value={password} onChange={(e) => setFirstName(e.target.value)}/>
        </div> 
        <div>
          <label style={{color:"rgb(248, 245, 231)"}}>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div> 
        <input type="submit" value="Register" className="hollow-button" style={{marginTop: "10px"}}/>
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