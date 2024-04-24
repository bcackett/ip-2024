import { useNavigate } from "react-router-dom";
import { supabase } from "../common/supabase";

function Training() {
  const nav = useNavigate();

  function goToScenario(id: number) {
    return () => {nav("/lessons/" + id.toString().padStart(2, "0"))};
  }

  function goToCustomGameSetup() {
    return () =>{nav("/customgame")};
  }

  async function getCompletedLessonData() {
    if (sessionStorage.getItem("userID")) {
      let {data, error} = await supabase.from("lessons").select("completedLessons").eq("userID", Number(sessionStorage.getItem("userID"))).limit(1).single();
      if (error) {
        throw error;
      } else if (data) {
        data.completedLessons.forEach(lessonNum => {
          document.getElementById("lesson-" + lessonNum.toString())!.innerText += "\n\nCompleted! \u2713";
          document.getElementById("lesson-" + lessonNum.toString())!.classList.add("complete-lesson");
        });
      }
    }
  } 

  getCompletedLessonData();

  return (
    <>
      <h1 style={{color: "rgb(248, 245, 231)"}}>The Basics</h1>
      <div className="lesson-grid">
        <button className="solid-button-no-dims" id="lesson-1" onClick={goToScenario(1)}>Technical Terms</button>
        <button className="solid-button-no-dims" id="lesson-2" onClick={goToScenario(2)}>Poker Hands</button>
        <button className="solid-button-no-dims" id="lesson-3" onClick={goToScenario(3)}>The Betting System</button>
        <button className="solid-button-no-dims" id="lesson-4" onClick={goToScenario(4)}>Bluffing</button>
      </div>
      <h1 style={{color: "rgb(248, 245, 231)"}}>Opponent Play Styles</h1>
      <div className="lesson-grid">
        <button className="solid-button-no-dims" id="lesson-5" onClick={goToScenario(5)}>Honest Opponents</button>
        <button className="solid-button-no-dims" id="lesson-6" onClick={goToScenario(6)}>Cautious Opponents</button>
        <button className="solid-button-no-dims" id="lesson-7" onClick={goToScenario(7)}>Aggresive Opponents</button>
        <button className="solid-button-no-dims" id="lesson-8" onClick={goToScenario(8)}>Unpredictable Opponents</button>
      </div>
      <h1 style={{color: "rgb(248, 245, 231)"}}>Playing Multiple Opponents</h1>
      <div className="lesson-grid">
        <button className="solid-button-no-dims" id="lesson-9" onClick={goToScenario(9)}>Known Opponents</button>
        <button className="solid-button-no-dims" id="lesson-10" onClick={goToScenario(10)}>Unknown Opponents</button>
        <button className="solid-button-no-dims" id="lesson-11" onClick={goToScenario(11)}>A Larger Table</button>
        <button className="solid-button-no-dims" id="lesson-12" onClick={goToCustomGameSetup()}>Custom Game</button>
      </div>
    </>
  )
}

export default Training;