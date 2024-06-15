import Card from "../elements/Card";

function Guide () {

  function handleWarningBoxText() {
    const warningText = "You have a very strong hand, but the bet is quite high. Raising could be too big a risk to take, so matching the bet is recommended. You definitely want to stay in the game with this hand!\n\nGood decision!";
    return warningText;
  }

  function handlePlayBoxText() {
    const playByPlay = "Player 3 bet £5 as the small blind.\n\nPlayer 4 bet £10 as the big blind.\n\nPlayer 1 raised the bet to £20.\n\nPlayer 2 bet £20.\n\nPlayer 3 bet £20.\n\nPlayer 4 bet £20.\n\nPlayer checked.\n\n";
    return playByPlay;
  }

  return (
    <>
      <h1 style={{color: "rgb(248, 245, 231)", paddingBottom: "1vw"}}>Hover over any component to see what it does!</h1>
      <div className="tooltip">
        <h1 className="tooltip-text">Prompts that appear here contain suggested moves. These will for each player after they have made a decision, and by logging in and enabling Move Retracing, you can choose whether you would like to continue with your decision or try what our algorithm offers.</h1>
        <div id="warning-reporter" className="tooltip">
          <h1 id="warning-text" className="tooltip" style={{padding:"0.5vw", whiteSpace:"pre-line"}}>{handleWarningBoxText()}</h1>
        </div>
      </div>
      <div id="table">
        <div className="tooltip">
          <h1 className="tooltip-text">This button will only be visible if you have Move Retracing enabled. If you wish to return to the previous betting round and change your mind, this button will allow you to do so.</h1>
          <button id="revert-by-round-button" className="hollow-button" type="button" disabled={true}>Back to Preflop</button>
        </div>
        {/* <button id="revert-by-round-button" className="hollow-button tooltip" type="button" disabled={true}>Back to Preflop
          <h1 className="tooltip-text">This button will only be visible if you have Move Retracing enabled. If you wish to return to the previous betting round and change your mind, this button will allow you to do so.</h1>
        </button> */}
        <div className="tooltip" id="hole-card-one">
          <h1 className="tooltip-text">These cards are your hole cards. Only you can see these cards, and you can use them in combination with the communal cards to try to make the best hand possible!</h1>
          <Card val={3}/>   
        <div id="hole-card-two" style={{display: "inline-block"}}>
          <Card val={58}/>
        </div>   
        </div>
        <div className="communal-cards tooltip">
          <h1 className="tooltip-text">These cards are the communal cards that every player can see. None are visible at the start of a game, but more are revealed during each betting round, up to the maximum of 5.</h1>
          <div id="flop-card-one" style={{float:"left"}}>
            <Card val={39}/>
          </div>
          <div id="flop-card-two" style={{float:"left"}}>
            <Card val={18}/>
          </div>
          <div id="flop-card-three" style={{float:"left"}}>
            <Card val={55}/>
          </div>
        </div>
        <div className="tooltip">
          <div>
            <h1 className="tooltip-text">These lines show how much money each player's bank. This is how much the player has left to bet.</h1>
            <h1 id="p1-stats" className=".player-stats">
              Player 1: £180
            </h1>
          </div>
          <div>
            <h1 id="p2-stats" className=".player-stats">
              Player 2: £180
            </h1>
          </div>
          <div>
            <h1 id="p3-stats" className=".player-stats">
              Player 3: £180
            </h1>
          </div>
          <div>
            <h1 id="p4-stats" className=".player-stats">
              Player 4: £180
            </h1>  
          </div>
        </div>
        <div id="decision-buttons">
          <div className="tooltip">
            <h1 className="tooltip-text">This button allows you to bet the smallest amount possible. When this button says "Check", it will bet nothing, but when it says "Bet", it will bet some of the money in your bank.</h1>
            <button id="bet-button" className="solid-button" type="button">Check </button>
          </div>
          <div className="tooltip">
            <h1 className="tooltip-text">This button allows you to increase the current bet so that every other player has to at least match the value you set it to. When this button says "Bet", the current bet is 0, but when it says "Raise", the current bet is already greater than 0.</h1>
            <button id="bet-button" className="solid-button" type="button">Bet </button>
          </div>
          <div className="tooltip">
            <h1 className="tooltip-text">This button allows you to remove yourself from the game. You will no longer have to add any money to the pot, but will also be unable to win anything in the current game if you choose this option.</h1>
            <button id="bet-button" className="solid-button" type="button">Fold </button>
          </div> 
        </div>
        <h1 id="pot" className="tooltip">Pot = £80
          <h1 className="tooltip-text">This is the Pot, which shows how much every player has bet over the course of a game. If you have the strongest hand or everyone else folds, you win all of the money shown here!</h1>
        </h1>
      </div>
      <div className="tooltip">
        <h1 className="tooltip-text-left">This window keeps track of a log that shows the decisions every player has made throughout the course of the current game.</h1>
        <div id="play-reporter">
          <h1 id="play-text" style={{padding:"0.5vw", whiteSpace:"pre-line"}}>{handlePlayBoxText()}</h1>
        </div>
      </div>
      <div>
        <h1 id="best-hand" className="tooltip" style={{color: "#f5f8e7", display: "inline"}}>Pair
          <h1 className="tooltip-text-top">This text will always display the best possible hand you currently have available. See if you can spot which cards make up the hand!</h1>
        </h1>
      </div>
    </>
  )
}

export default Guide;
