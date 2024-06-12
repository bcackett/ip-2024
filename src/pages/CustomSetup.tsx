import { useState, useEffect } from "react";
import ReactSlider from "react-slider";
import Board from "../elements/Board";

function CustomSetup() {
  const [playerValsToRerender, setPlayerValsToRerender] = useState([-1, -1]);
  const [humanPlayers, setHumanPlayers] = useState(1);
  const [computerPlayers, setComputerPlayers] = useState(1);
  const [computerPlayerMax, setComputerPlayerMax] = useState(7);
  const [computerPlayerValues, setComputerPlayerValues] = useState([[0, 0, 0]]);
  const [currentlyDisplayedPlayer, setCurrentlyDisplayedPlayer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // The appropraite functions are called immediately when their respective value is changed using useEffects.
  useEffect(() => handleComputerPlayerNumChange(computerPlayers), [computerPlayers]);
  useEffect(() => handleHumanPlayerNumChange(humanPlayers), [humanPlayers])
  useEffect(() => handlePlayerValueChange(playerValsToRerender[0], playerValsToRerender[1]), [playerValsToRerender]);

  function handleComputerPlayerNumChange(length: number) {
    // Changes the number of computer players able to be edited to the value passed as a parameter.
    let newPlayerValues = computerPlayerValues.slice(0, length); // Removes excess computer players if the number has been reduced, does nothing if the number has been increased.
    while (newPlayerValues.length < length) { // Adds any additional players required to match the value passed in.
      newPlayerValues.push([0, 0, 0]);
    }
    setComputerPlayerValues(newPlayerValues);

    if (currentlyDisplayedPlayer > length - 1) { // Changes the currently displayed computer player settings if they are outside the bounds of the new number of computer players.
      setCurrentlyDisplayedPlayer(length - 1);
    }
  }

  function handleHumanPlayerNumChange(playerCount: number) {
    // Changes the maximum number of computer players possible to ensure that the total number of players never exceeds eight.
    let newMax = computerPlayerMax;
    newMax = 8 - playerCount;
    setComputerPlayerMax(newMax);
  }

  function handlePlayerValueChange(personalityNum: number, newVal: number) {
    // Changes the personality values of a given computer player to match the new input provided by the user.
    let newPlayerValues = computerPlayerValues;
    newPlayerValues[currentlyDisplayedPlayer][personalityNum] = newVal;
    setComputerPlayerValues(newPlayerValues);
  }

  function handlePlayerUnderflow(playerNum: number) {
    // Prevents underflow at CPU 1 on the computer player settings menu.
    if (playerNum - 1 < 0) {
      return computerPlayers - 1;
    } else {
      return playerNum - 1;
    }
  }

  function handlePlayerOverflow(playerNum: number) {
    // Prevents overflow at the maximum CPU number on the computer player settings menu.
    if (playerNum + 1 > computerPlayers - 1) {
      return 0;
    } else {
      return playerNum + 1;
    }
  }

  function handleLeftArrow() {
    // Changes the computer player menu on screen to one below the current player, or the final computer player if underflow would occur.
    let newDisplayedPlayer = handlePlayerUnderflow(currentlyDisplayedPlayer);
    setCurrentlyDisplayedPlayer(newDisplayedPlayer);
  }

  function handleRightArrow() {
    // Changes the computer player menu on screen to one above the current player, or the first computer player if overflow would occur.
    let newDisplayedPlayer = handlePlayerOverflow(currentlyDisplayedPlayer);
    setCurrentlyDisplayedPlayer(newDisplayedPlayer);
  }

  function startCustomGame() {
    // Handles the transition from setting the player count to displaying the game.
    setGameStarted(() => true);
  }

  if (gameStarted) {  // Only begin the game once the number of players has been set.
    console.log(computerPlayerValues.toString());
    return (
      <Board totalPlayers={computerPlayers + humanPlayers} computerPlayers={computerPlayers} playerProfiles={computerPlayerValues} lessonNum={12}/>
    )
  } else { // If gameStarted is in its default state, provide the user with the chance to set the number of both human and computer players.
    return (
      <>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)"}}>Number of people playing: {humanPlayers}</h1>
          <ReactSlider className="slider" trackClassName="slider-track" thumbClassName="slider-thumb" min={1} max={7} defaultValue={1} value={humanPlayers} onChange={(value) => setHumanPlayers(value)}/>
        </div>
        <div>
          <h1 style={{color:"rgb(248, 245, 231)", marginTop:"3vw"}}>Number of computer players: {computerPlayers}</h1>
          <ReactSlider className="slider" trackClassName="slider-track" thumbClassName="slider-thumb" min={1} max={computerPlayerMax} defaultValue={1} value={computerPlayers} onChange={(value) => setComputerPlayers(value)}/>
        </div>
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