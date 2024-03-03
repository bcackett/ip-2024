import { useNavigate } from "react-router-dom";

function Training() {
  const nav = useNavigate();

  function goToScenario(id: number) {
    return () => {nav("/lessons/" + id.toString().padStart(2, "0"))};
  }

  return (
    <>
      <h1 style={{color: "rgb(248, 245, 231)"}}>The Basics</h1>
      <div className="lesson-grid">
        <button onClick={goToScenario(1)}>Technical Terms</button>
        <button onClick={goToScenario(2)}>Poker Hands</button>
        <button onClick={goToScenario(3)}>The Betting System</button>
        <button onClick={goToScenario(4)}>Bluffing</button>
      </div>
      <h1 style={{color: "rgb(248, 245, 231)"}}>Opponent Play Styles</h1>
      <div className="lesson-grid">
        <button onClick={goToScenario(5)}>Honest Opponents</button>
        <button onClick={goToScenario(6)}>Cautious Opponents</button>
        <button onClick={goToScenario(7)}>Aggresive Opponents</button>
        <button onClick={goToScenario(8)}>Unpredictable Opponents</button>
      </div>
      <h1 style={{color: "rgb(248, 245, 231)"}}>Playing Multiple Opponents</h1>
      <div className="lesson-grid">
        <button onClick={goToScenario(9)}>Known Opponents</button>
        <button onClick={goToScenario(10)}>Unknown Opponents</button>
        <button onClick={goToScenario(11)}>A Larger Table</button>
        <button onClick={goToScenario(12)}>Custom Game</button>
      </div>
    </>
  )
}

export default Training;