import { useState } from "react";
import { supabase } from "../common/supabase";
import { useNavigate } from "react-router-dom";
import VigenereCipher from "../elements/VigenereCipher";

function Settings() {

  const nav = useNavigate();

  const goToLogin = () => {
    // Redirect the user to the login page.
    nav("/login");
  }

  const goToHome = () => {
    // Return the user to the home page.
    nav("/");
  }

  // The states associated with each setting are initially set to the value currently stored in the database for the logged-in user.
  const [fasterCalcsStateTempState, setFasterCalcsTempState] = useState(sessionStorage.getItem("fasterCalcs"));
  const [moveRetracingTempState, setMoveRetracingTempState] = useState(sessionStorage.getItem("moveRetracing"));
  const [lessonTextTempState, setLessonTextTempState] = useState(sessionStorage.getItem("lessonText"));
  const [firstName, setFirstName] = useState(sessionStorage.getItem("name") || "");
  const cipher = new VigenereCipher;

  function handleFasterCalcsButton() {
    // Ensure that the state of the on/off button for the faster calculations setting matches that of the locally stored state.
    if (fasterCalcsStateTempState === "true") {
      setFasterCalcsTempState("false");
      document.getElementById("faster-calcs-button")!.classList.remove("complete-lesson");
    } else {
      setFasterCalcsTempState("true");
      document.getElementById("faster-calcs-button")!.classList.add("complete-lesson");
    }
  }

  function handleMoveRetracingButton() {
    // Ensure that the state of the on/off button for the move retracing setting matches that of the locally stored state.
    if (moveRetracingTempState === "true") {
      setMoveRetracingTempState("false");
      document.getElementById("move-retrace-button")!.classList.remove("complete-lesson");
    } else {
      setMoveRetracingTempState("true");
      document.getElementById("move-retrace-button")!.classList.add("complete-lesson");
    }
  }

  function handleLessonTextButton() {
    // Ensure that the state of the on/off button for the lesson text setting matches that of the locally stored state.
    if (lessonTextTempState === "true") {
      setLessonTextTempState("false");
      document.getElementById("lesson-text-button")!.classList.remove("complete-lesson");
    } else {
      setLessonTextTempState("true");
      document.getElementById("lesson-text-button")!.classList.add("complete-lesson");
    }
  }

  function getButtonText(settingName: string) {
    // Matches the text on the button for any setting to the value of the state.
    if (settingName === "fasterCalcs" && fasterCalcsStateTempState === "true") {
      return "ON";
    } else if (settingName === "moveRetracing" && moveRetracingTempState === "true") {
      return "ON";
    } else if (settingName === "lessonText" && lessonTextTempState === "true") {
      return "ON";
    } else {
      return "OFF";
    }
  }

  function getInitialButtonState(settingName: string) {
    // Ensures that the button's theme matches the setting's initial state upon first render.
    if (sessionStorage.getItem(settingName) === "true") {
      return("solid-button complete-lesson");
    } else {
      return("solid-button");
    }
  }

  async function saveSettings() {
    // Updates the values for all of the settings, both locally in session storage and on the database for the currently logged in user.
    sessionStorage.setItem("name", firstName);
    sessionStorage.setItem("fasterCalcs", fasterCalcsStateTempState!);
    sessionStorage.setItem("lessonText", lessonTextTempState!);
    sessionStorage.setItem("moveRetracing", moveRetracingTempState!);
    let e = await supabase.from("logins").update({faster_calculations: (fasterCalcsStateTempState! === "true"), lesson_text: (lessonTextTempState! === "true"), move_retracing: (moveRetracingTempState! === "true"), firstName: cipher.encrypt(firstName, "name")}).eq("userID", Number(sessionStorage.getItem("userID")!));
    if (e.error) {
      throw e.error;
    } else {
      goToHome();
    }
  }

  if (sessionStorage.getItem("userID")) { // The settings options are only displayed to logged-in users.
    return (
      <>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>{"Faster Calculations: "}</h1>
          <button style={{display:"inline-block"}} className={getInitialButtonState("fasterCalcs")} id="faster-calcs-button" onClick={() => handleFasterCalcsButton()}>
            {getButtonText("fasterCalcs")}
          </button>
          <div className="tooltip" style={{color:"rgb(248, 245, 231)"}}>{"\u24d8"}
            <span className="tooltip-text">Enabling this setting speeds up the calculations in the game substially, but sacrifices accuracy of suggested decisions.</span>       
          </div>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>Lesson Text: </h1>
          <button style={{display:"inline-block"}} className={getInitialButtonState("lessonText")} id="lesson-text-button" onClick={() => handleLessonTextButton()}>
            {getButtonText("lessonText")}
          </button>
          <div className="tooltip" style={{color:"rgb(248, 245, 231)"}}>{"\u24d8"}
            <span className="tooltip-text">With this setting disabled, the text at the start of each round in a lesson (if any) will be skipped. This does not skip the text with suggested moves at the end of each decision made.</span>       
          </div>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>Move Retracing: </h1>
          <button style={{display:"inline-block"}} className={getInitialButtonState("moveRetracing")} id="move-retrace-button" onClick={() => handleMoveRetracingButton()}>
            {getButtonText("moveRetracing")}
          </button>
          <div className="tooltip" style={{color:"rgb(248, 245, 231)"}}>{"\u24d8"}
            <span className="tooltip-text">Enabling this allows you to return to previous decisions and change your mind against computer opponents. However, training lessons will not contribute to your statistics when this is enabled.</span>       
          </div>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>Change Preferred Name: </h1>
          <input style={{marginLeft:"1vw", marginRight: "1vw"}} className="input-field" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
          <div className="tooltip" style={{color:"rgb(248, 245, 231)"}}>{"\u24d8"}
            <span className="tooltip-text">This is a cosmetic change that will display your name in any games you play. Make GetPokerEd a bit more personal and put yourself in the game!</span>       
          </div>
        </div>
        <button style={{width:"10vw"}} className="solid-button" onClick={() => saveSettings()}>Save Settings</button>
      </>
    )

  } else { // Otherwise the users are prompted to log in or register in order to gain access to the settings.
    return (
      <>
        <h1 style={{color:"rgb(248, 245, 231)", margin:"2vw"}}>Log in or register to access and save custom user settings.</h1>
        <button className="hollow-button" type="button" onClick={goToLogin}>
          Log In/Register
        </button>
      </>
    )
  }
}

export default Settings;