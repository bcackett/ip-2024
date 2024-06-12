import { useNavigate } from "react-router-dom";
import Board from "../elements/Board";
import { useState } from "react";
import ReactSlider from "react-slider";

function Play() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);

  function startGame() {
    // Handles the transition from setting the player count to displaying the game.
    setGameStarted(() => true);
  }

  if (gameStarted) { // Only begin the game once the number of players has been set.
    return (<Board totalPlayers={playerCount} computerPlayers={0}/>);
  } else { // If gameStarted is in its default state, provide the user with the chance to set the number of players.
    return (
      <div style={{background:"rgba(125, 2, 2, 1)", height:"17vw", minHeight:"150px", width:"32vw", display:"inline-block", marginTop:"3vw", borderRadius: "15px", border: "5px solid rgba(4, 0, 26, 1)"}}>
        <div style={{paddingBottom: "30px"}}>
          <h1 style={{color:"rgb(248, 245, 231)", marginTop:"3vw"}}>How many players are participating?</h1>
          <ReactSlider className="slider" trackClassName="sub-slider-track" thumbClassName="slider-thumb" min={2} max={8} defaultValue={2} value={playerCount} onChange={(value: number) => setPlayerCount(value)}/>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", marginBottom:"1vw"}}>{playerCount}</h1>
          <button className="hollow-button" onClick={() => startGame()}>Start Game</button>
        </div>
      </div>
    );
  }
}
export default Play;