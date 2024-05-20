import { useState } from "react";
import { supabase } from "../common/supabase";
import { useNavigate } from "react-router-dom";
import VigenereCipher from "../elements/VigenereCipher";

function Settings() {

  const nav = useNavigate();

  const goToLogin = () => {
    nav("/login");
  }

  const goToHome = () => {
    nav("/");
  }

  const [firstName, setFirstName] = useState(sessionStorage.getItem("name") || "");
  const cipher = new VigenereCipher;

  function handleSettingButton(settingName: string, buttonID: string) {
    if (sessionStorage.getItem(settingName) === "true") {
      sessionStorage.setItem(settingName, "false");
      document.getElementById(buttonID)!.classList.remove("complete-lesson");
    } else {
      sessionStorage.setItem(settingName, "true");
      document.getElementById(buttonID)!.classList.add("complete-lesson");
    }
    document.getElementById(buttonID)!.innerText = getButtonText(settingName);
  }

  function getButtonText(settingName: string) {
    if (sessionStorage.getItem(settingName) === "true") {
      return "ON";
    } else {
      return "OFF";
    }
  }

  function getInitialButtonState(settingName: string) {
    if (sessionStorage.getItem(settingName) === "true") {
      return("solid-button complete-lesson");
    } else {
      return("solid-button");
    }
  }

  async function saveSettings() {
    sessionStorage.setItem("name", firstName);
    let e = await supabase.from("logins").update({faster_calculations: (sessionStorage.getItem("fasterCalcs") === "true"), lesson_text: (sessionStorage.getItem("lessonText") === "true"), move_retracing: (sessionStorage.getItem("moveRetracing") === "true"), firstName: cipher.encode(firstName, "name")}).eq("userID", Number(sessionStorage.getItem("userID")!));
    if (e.error) {
      throw e.error;
    } else {
      goToHome();
    }
  }

  if (sessionStorage.getItem("userID")) {
    return (
      <>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>{"Faster Calculations: "}</h1>
          <button style={{display:"inline-block"}} className={getInitialButtonState("fasterCalcs")} id="faster-calcs-button" onClick={() => handleSettingButton("fasterCalcs", "faster-calcs-button")}>
            {getButtonText("fasterCalcs")}
          </button>
          <div className="tooltip">{"\u24d8"}
            <span className="tooltip-text">Enabling this setting speeds up the calculations in the game substially, but sacrifices accuracy of suggested decisions.</span>       
          </div>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>Lesson Text: </h1>
          <button style={{display:"inline-block"}} className={getInitialButtonState("lessonText")} id="lesson-text-button" onClick={() => handleSettingButton("lessonText", "lesson-text-button")}>
            {getButtonText("lessonText")}
          </button>
          <div className="tooltip">{"\u24d8"}
            <span className="tooltip-text">With this setting disabled, the text at the start of each round in a lesson (if any) will be skipped. This does not skip the text with suggested moves at the end of each decision made.</span>       
          </div>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>Move Retracing: </h1>
          <button style={{display:"inline-block"}} className={getInitialButtonState("moveRetracing")} id="move-retrace-button" onClick={() => handleSettingButton("moveRetracing", "move-retrace-button")}>
            {getButtonText("moveRetracing")}
          </button>
          <div className="tooltip">{"\u24d8"}
            <span className="tooltip-text">Enabling this allows you to return to previous decisions and change your mind against computer opponents. However, training lessons will not contribute to your statistics when this is enabled.</span>       
          </div>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>Change Preferred Name: </h1>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
          <div className="tooltip">{"\u24d8"}
            <span className="tooltip-text">This is a cosmetic change that will display your name in any games you play. Make GetPokerEd a bit more personal and put yourself in the game!</span>       
          </div>
        </div>
        <button style={{width:"10vw"}} className="solid-button" onClick={() => saveSettings()}>Save Settings</button>
      </>
    )

  } else {
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