import { supabase } from "../common/supabase";
import { useNavigate } from "react-router-dom";

function Settings() {

  const nav = useNavigate();

  const goToLogin = () => {
    nav("/login");
  }

  const goToHome = () => {
    nav("/");
  }

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
    let e = await supabase.from("logins").update({faster_calculations: (sessionStorage.getItem("fasterCalcs") === "true"), lesson_text: (sessionStorage.getItem("lessonText") === "true"), move_retracing: (sessionStorage.getItem("moveRetracing") === "true")}).eq("userID", Number(sessionStorage.getItem("userID")!));
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
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>Lesson Text: </h1>
          <button style={{display:"inline-block"}} className={getInitialButtonState("lessonText")} id="lesson-text-button" onClick={() => handleSettingButton("lessonText", "lesson-text-button")}>
            {getButtonText("lessonText")}
          </button>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", display:"inline-block"}}>Move Retracing: </h1>
          <button style={{display:"inline-block"}} className={getInitialButtonState("moveRetracing")} id="move-retrace-button" onClick={() => handleSettingButton("moveRetracing", "move-retrace-button")}>
            {getButtonText("moveRetracing")}
          </button>
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