import { useState, useEffect } from "react";
import ReactSlider from "react-slider";
import Board from "../elements/Board";

function CustomSetup() {

  const [playerValsToRerender, setPlayerValsToRerender] = useState([-1, -1]);
  const [computerPlayers, setComputerPlayers] = useState(1);
  const [computerPlayerValues, setComputerPlayerValues] = useState([[0, 0, 0]]);
  const [currentlyDisplayedPlayer, setCurrentlyDisplayedPlayer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  useEffect(() => handlePlayerNumChange(computerPlayers), [computerPlayers]);
  useEffect(() => handlePlayerValueChange(playerValsToRerender[0], playerValsToRerender[1]), [playerValsToRerender]);

  function handlePlayerNumChange(length: number) {
    let newPlayerValues = computerPlayerValues.slice(0, length);
    while (newPlayerValues.length < length) {
      newPlayerValues.push([0, 0, 0]);
    }
    setComputerPlayerValues(newPlayerValues);

    if (currentlyDisplayedPlayer > length - 1) {
      setCurrentlyDisplayedPlayer(length - 1);
    }
  }

  function handlePlayerValueChange(personalityNum: number, newVal: number) {
    let newPlayerValues = computerPlayerValues;
    newPlayerValues[currentlyDisplayedPlayer][personalityNum] = newVal;
    setComputerPlayerValues(newPlayerValues);
  }

  function handlePlayerUnderflow(playerNum: number) {
    if (playerNum - 1 < 0) {
      return computerPlayers - 1;
    } else {
      return playerNum - 1;
    }
  }

  function handlePlayerOverflow(playerNum: number) {
    if (playerNum + 1 > computerPlayers - 1) {
      return 0;
    } else {
      return playerNum + 1;
    }
  }

  function handleLeftArrow() {
    let newDisplayedPlayer = handlePlayerUnderflow(currentlyDisplayedPlayer);
    setCurrentlyDisplayedPlayer(newDisplayedPlayer);
  }

  function handleRightArrow() {
    let newDisplayedPlayer = handlePlayerOverflow(currentlyDisplayedPlayer);
    setCurrentlyDisplayedPlayer(newDisplayedPlayer);
  }

  function startCustomGame() {
    setGameStarted(() => true);
  }

  if (gameStarted) {
    return (
      <Board totalPlayers={computerPlayers + 1} computerPlayers={computerPlayers} playerProfiles={computerPlayerValues} lessonNum={12}/>
    )
  } else {
    return (
      <>
        <h1 style={{color:"rgb(248, 245, 231)"}}>Number of computer players: {computerPlayers}</h1>
        <ReactSlider className="slider" trackClassName="slider-track" thumbClassName="slider-thumb" min={1} max={7} defaultValue={1} value={computerPlayers} onChange={(value) => setComputerPlayers(value)}/>
        <div style={{background:"rgba(125, 2, 2, 1)", height:"55vh", minHeight:"290px", width:"32vw", display:"inline-block", marginTop:"3vw", borderRadius: "15px", border: "5px solid rgba(4, 0, 26, 1)"}}>
          <h1 style={{color:"rgb(248, 245, 231)"}}>CPU {currentlyDisplayedPlayer + 1}</h1>
          <div style={{marginTop:"auto"}}>
            <h2 style={{marginTop:"25px", display:"inline-block", color:"rgb(248, 245, 231)"}}>Aggression</h2>
            <ReactSlider marks className="sub-slider" trackClassName="sub-slider-track" thumbClassName="slider-thumb" min={0} max={100} defaultValue={0} value={computerPlayerValues[currentlyDisplayedPlayer][0]} onChange={(value) => setPlayerValsToRerender([0, value])}/>
            <label style={{marginTop:"25px", display:"inline-block", color:"rgb(248, 245, 231)", fontWeight:"bold"}}>{computerPlayerValues[currentlyDisplayedPlayer][0]}%</label>
          </div>
          <div style={{marginTop:"auto"}}>
            <h2 style={{marginTop:"25px", display:"inline-block", color:"rgb(248, 245, 231)"}}>Deception</h2>
            <ReactSlider marks className="sub-slider" trackClassName="sub-slider-track" thumbClassName="slider-thumb" min={0} max={100} defaultValue={0} value={computerPlayerValues[currentlyDisplayedPlayer][1]} onChange={(value) => setPlayerValsToRerender([1, value])}/>
            <label style={{marginTop:"25px", display:"inline-block", color:"rgb(248, 245, 231)", fontWeight:"bold"}}>{computerPlayerValues[currentlyDisplayedPlayer][1]}%</label>
          </div>
          <div style={{marginTop:"auto"}}>
            <h2 style={{marginTop:"25px", display:"inline-block", color:"rgb(248, 245, 231)"}}>Unpredictability</h2>
            <ReactSlider marks className="sub-slider" trackClassName="sub-slider-track" thumbClassName="slider-thumb" min={0} max={100} defaultValue={0} value={computerPlayerValues[currentlyDisplayedPlayer][2]} onChange={(value) => setPlayerValsToRerender([2, value])}/>
            <label style={{marginTop:"25px", display:"inline-block", color:"rgb(248, 245, 231)", fontWeight:"bold"}}>{computerPlayerValues[currentlyDisplayedPlayer][2]}%</label>
          </div>
        </div>
        <div style={{width:"32vw", margin: "auto", marginTop: "1vw"}}>
          <button className="links" style={{float: "left"}} onClick={() => handleLeftArrow()} hidden={computerPlayers <= 1}>To CPU {handlePlayerUnderflow(currentlyDisplayedPlayer) + 1}</button>
          <button className="links" style={{fontSize: "2vw"}} onClick={() => startCustomGame()}>Start Game</button>
          <button className="links" style={{float: "right"}} onClick={() => handleRightArrow()} hidden={computerPlayers <= 1}>To CPU {handlePlayerOverflow(currentlyDisplayedPlayer) + 1}</button>
        </div>
      </>
    )
  }
}

export default CustomSetup;