import { start } from "repl";
import Card from "./Card";
import Deck from "./Deck";
import { useState } from "react";
import Calculations from "./Calculations"

type roomSize = {
  totalPlayers: number;
  computerPlayers: number;
  playerProfiles?: number[][];
}

function Board({totalPlayers, computerPlayers, playerProfiles} : roomSize) {
  var deck: Deck = new Deck;
  var calcs: Calculations = new Calculations;
  const HANDS = ["High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush", "Royal Flush"];
  deck.Shuffle();
  const STARTBANK = 200;
  const BIGBLIND = 10;
  const [cards, setCards] = useState(deck.Deal(totalPlayers));
  const [startingPlayer, setStartingPlayer] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerBanks, setPlayerBanks] = useState(Array.from({length: totalPlayers}).map(bank=>STARTBANK));
  const [currentBet, setCurrentBet] = useState(0);
  const [bestHandText, setBestHandText] = useState("");
  const [foldedtotalPlayers, setFoldedtotalPlayers] = useState(new Array(totalPlayers).fill(0));
  const [pot, setPot] = useState(0);
  const [bestHands, setBestHands] = useState(new Array(totalPlayers).fill([0]));
  const [blindStage, setBlindStage] = useState(true);

  function HoleDeal(cards: number[], playerNum: number) {
    document.getElementById("hole-card-one")!.hidden = false;
    document.getElementById("hole-card-two")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    document.getElementById("start-button")!.hidden = true;
    let bestHand = FindBestHand(cards, playerNum);
  }
  
  function FlopDeal(cards: number[], playerNum: number) {
    document.getElementById("flop-card-one")!.hidden = false;
    document.getElementById("flop-card-two")!.hidden = false;
    document.getElementById("flop-card-three")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards, playerNum);
    setCurrentBet(0);
  }
  
  function TurnDeal(cards: number[], playerNum: number) {
    document.getElementById("turn-card")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards, playerNum);
    setCurrentBet(0);
  }
  
  function RiverDeal(cards:number[], playerNum: number) {
    document.getElementById("river-card")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards, playerNum);
    setCurrentBet(0);
  }
  
  function FindBestHand(cards: number[], playerNum: number) {
    /*Returns value of best hand (0 for high card -> 9 for royal flush), followed by values of cards in best hand.
    Eg: [9, 59, 58, 57, 56, 55] = royal flush with spades. */

    // document.getElementById("best-hand")!.innerText = bestHand.toString();
    // setBestHandText(bestHand.toString())
    // document.getElementById("best-hand")!.innerText = hands[bestHand[0]];
    let bestHand = calcs.FindBestHand(cards);
    setBestHandText(HANDS[bestHand[0]]);
    let newBestHands = bestHands;
    newBestHands[playerNum - 1] = bestHand;
    setBestHands(newBestHands);
  }
  
  function Reset() {
    deck.Shuffle();
    setCards(deck.Deal(totalPlayers));
    setFoldedtotalPlayers(new Array(totalPlayers).fill(0));
    document.getElementById("reset-button")!.hidden = true;
    document.getElementById("full-reset-button")!.hidden = true;
    document.getElementById("winner-text")!.innerText = "";
    document.getElementById("raise-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    document.getElementById("bet-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    document.getElementById("hole-card-one")!.hidden = true;
    document.getElementById("hole-card-two")!.hidden = true;
    document.getElementById("flop-card-one")!.hidden = true;
    document.getElementById("flop-card-two")!.hidden = true;
    document.getElementById("flop-card-three")!.hidden = true;
    document.getElementById("turn-card")!.hidden = true;
    document.getElementById("river-card")!.hidden = true;
    document.getElementById("start-button")!.hidden = false;
    document.getElementById("play-text")!.innerText = "";
    setBestHandText("");
    let newStartingPlayer = startingPlayer + 1;
    if (newStartingPlayer > totalPlayers) {
      newStartingPlayer = 1;
    }
    for (let i = 1; i <= totalPlayers; i++) {
      document.getElementById("p" + i + "-stats")?.classList.remove("glow");
      document.getElementById("p" + i + "-stats")?.classList.remove("winner-glow");
    }
    HoleDeal(cards.slice(2 * (currentPlayer - 1), 2), newStartingPlayer);
    setStartingPlayer(newStartingPlayer);
    setCurrentPlayer(newStartingPlayer);
    setBlindStage(true);
    SmallAndBigBlind(newStartingPlayer - 1);
  }

  function ChangePlayer(nestedCurrentPlayer?: number) {
    if (foldedtotalPlayers.filter(p => p === 0).length === 1) {
      let winner = foldedtotalPlayers.indexOf(0) + 1;
      DisplayWinner([winner]);
    } else {
      let newPlayerNum: number;
      if (nestedCurrentPlayer) {
        newPlayerNum = nestedCurrentPlayer + 1;
      } else {
        newPlayerNum = currentPlayer + 1;
      }
      let firstPlayer = foldedtotalPlayers.indexOf(0) + 1;
      let newCard = false;

      if (newPlayerNum === totalPlayers + 1) {
        newPlayerNum = firstPlayer;
        if (firstPlayer >= startingPlayer) {
          newCard = true;
        }
      } else if (newPlayerNum === startingPlayer || (newPlayerNum > startingPlayer && foldedtotalPlayers[startingPlayer - 1] === 1)) {
        newCard = true;
      }

      while (foldedtotalPlayers[newPlayerNum - 1] === 1) {
        newPlayerNum++;
        if (newPlayerNum === totalPlayers + 1) {
          newPlayerNum = firstPlayer;
          if (firstPlayer >= startingPlayer) {
            newCard = true;
          }
        } else if (newPlayerNum === startingPlayer || (newPlayerNum > startingPlayer && foldedtotalPlayers[startingPlayer - 1] === 1)) {
          newCard = true;
        }
      }

      let knownCards: number[] = [];
      if (newCard === true) {
        document.getElementById("p" + newPlayerNum +"-stats")!.classList.add("glow");
        if (nestedCurrentPlayer) {
          document.getElementById("p" + nestedCurrentPlayer +"-stats")!.classList.remove("glow");
        } else {
          document.getElementById("p" + currentPlayer +"-stats")!.classList.remove("glow");
        }
        if (blindStage === true) {
          setBlindStage(false);
          setCurrentBet(0);
        } else {
          if (blindStage === false) {
            if (document.getElementById("flop-card-one")!.hidden === true && currentBet === 0) {
              knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -2));
              FlopDeal(knownCards, newPlayerNum);
            } else if (document.getElementById("turn-card")!.hidden === true) {
              knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -1));
              TurnDeal(cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -1)), newPlayerNum);
            } else if (document.getElementById("river-card")!.hidden === true) {
              knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, cards.length));
              RiverDeal(knownCards, newPlayerNum);
            } else {
              DisplayWinner(CalculateWinner());
            }
          }
        }
      } else {
        if ((newPlayerNum === startingPlayer - 1 || (newPlayerNum === totalPlayers && startingPlayer === 1)) && blindStage === true) {
          setCurrentBet(currentBet - BIGBLIND / 2);
        }
        if (document.getElementById("flop-card-one")!.hidden === true) {
          knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2);
        } else if (document.getElementById("turn-card")!.hidden === true) {
          knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -2));
        } else if (document.getElementById("river-card")!.hidden === true) {
          knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -1));
        } else {
          knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, cards.length));
        }
        FindBestHand(knownCards, newPlayerNum);
        document.getElementById("p" + newPlayerNum +"-stats")!.classList.add("glow");
        if (nestedCurrentPlayer) {
          document.getElementById("p" + nestedCurrentPlayer +"-stats")!.classList.remove("glow");
        } else {
          document.getElementById("p" + currentPlayer +"-stats")!.classList.remove("glow");
        }
      }
      setCurrentPlayer(newPlayerNum);
      if (newPlayerNum > totalPlayers - computerPlayers) {
        computerCalc(playerProfiles![(newPlayerNum + 1) - computerPlayers], knownCards, newPlayerNum);
      }
    }
  }

  function computerCalc(playerProfile: number[], cards: number[], playerNum: number) {
    console.log(currentPlayer.toString);
    let playerCards = [cards[0], cards[1]];
    let communalCards: number[] = [];
    if (cards.length > 2) {
      for (let i = 2; i < cards.length; i++) {
        communalCards.concat(cards[i]);
      }
    }
    let effectiveHandScore = calcs.decisionCalc(playerCards, communalCards);
    // let nashEquilibrium = Calculations.nashEq(cards);
    if (effectiveHandScore < 0.1) {
      Fold(playerNum);
    } else if (effectiveHandScore > 0.75) {
      Raise(currentBet + 10, playerNum);
    } else {
      Bet(playerNum);
    }
  }

  function Raise(raise?: number, playerNum?: number) {
    let currentPlayerNum: number;
    if (playerNum) {
      currentPlayerNum = playerNum;
    } else {
      currentPlayerNum = currentPlayer;
    }
    let newBanks = playerBanks;
    let amount = 0
    if (!raise) {
      if (playerBanks[currentPlayerNum - 1] !== 0) {
        amount = Number(window.prompt("How much would you like to bet?"));
        while (amount < BIGBLIND || amount <= currentBet || amount > playerBanks[currentPlayerNum - 1]) {
          amount = Number(window.prompt("Invalid input. How much would you like to bet?"))
        }
      }
    } else {
      amount = raise
    }
    newBanks[currentPlayerNum - 1] -= amount;
    document.getElementById("play-text")!.innerText += "Player " + currentPlayerNum + " raised the bet to £" + amount +".\n\n";
    setCurrentBet(amount);
    setPlayerBanks(newBanks);
    setPot(pot + amount);
    if (playerNum) {
      ChangePlayer(playerNum);
      console.log(playerNum);
    } else {
      ChangePlayer();
      console.log(currentPlayer);
    }
  }

  function Bet(playerNum?: number) {
    let currentPlayerNum: number;
    if (playerNum) {
      currentPlayerNum = playerNum;
    } else {
      currentPlayerNum = currentPlayer;
    }
    if (playerBanks[currentPlayerNum - 1] !== 0) {
      if (currentBet === 0) {
        document.getElementById("play-text")!.innerText += "Player " + currentPlayerNum + " checked.\n\n";
      } else {
        let newBanks = playerBanks;
        newBanks[currentPlayerNum - 1] -= currentBet;
        setPlayerBanks(newBanks);
        setPot(pot + currentBet);
        document.getElementById("play-text")!.innerText += "Player " + currentPlayerNum + " bet £" + currentBet + ".\n\n";
      }
      document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
      if (playerNum) {
        ChangePlayer(playerNum);
        console.log(playerNum);
      } else {
        ChangePlayer();
        console.log(currentPlayer);
      }
    }
  }

  function Fold(playerNum?: number) {
    let currentPlayerNum: number;
    if (playerNum) {
      currentPlayerNum = playerNum;
    } else {
      currentPlayerNum = currentPlayer;
    }
    let newFoldedtotalPlayers = foldedtotalPlayers;
    let newBestHands = bestHands;
    newFoldedtotalPlayers[currentPlayerNum - 1] = 1;
    newBestHands[currentPlayerNum - 1] = new Array(6).fill(0);
    setFoldedtotalPlayers(newFoldedtotalPlayers);
    setBestHands(newBestHands);
    document.getElementById("play-text")!.innerText += "Player " + currentPlayerNum + " folded.\n\n";
    if (playerNum) {
      ChangePlayer(playerNum);
      console.log(playerNum);
    } else {
      ChangePlayer();
      console.log(currentPlayer);
    }
  }

  function SmallAndBigBlind(nextPlayer: number) {
    if (nextPlayer <= 0) {
      nextPlayer = totalPlayers;
    }
    let smallBlindPlayer = nextPlayer;
    document.getElementById("p" + nextPlayer + "-stats")?.classList.remove("glow");
    let newBanks = playerBanks;
    document.getElementById("play-text")!.innerText += "Player " + (nextPlayer) + " bet " + BIGBLIND/2 + " as the small blind.\n\n"
    newBanks[nextPlayer - 1] -= BIGBLIND / 2;
    nextPlayer += 1;
    if (nextPlayer > totalPlayers) {
      nextPlayer = 1;
    }
    document.getElementById("play-text")!.innerText += "Player " + nextPlayer + " bet " + BIGBLIND + " as the big blind.\n\n"
    newBanks[nextPlayer - 1] -= BIGBLIND;
    nextPlayer += 1;
    if (nextPlayer > totalPlayers) {
      nextPlayer = 1;
    }
    document.getElementById("p" + nextPlayer + "-stats")?.classList.add("glow");
    setCurrentPlayer(nextPlayer);
    setPlayerBanks(newBanks);
    if (nextPlayer === smallBlindPlayer) {
      setCurrentBet(BIGBLIND/2);
    } else {
      setCurrentBet(BIGBLIND);
    }
    setPot(pot + BIGBLIND/2 + BIGBLIND);
    if (nextPlayer > totalPlayers - computerPlayers) {
      computerCalc(playerProfiles![(nextPlayer + 1) - computerPlayers], cards.slice(2 * (nextPlayer - 1), 2 * (nextPlayer - 1) + 2), nextPlayer);
    }
  }

  function HandsSearch(finalBestHand: number[][]) {
    for (let i = 0; i < bestHands.length; i++) {
      let isAMatch = true;
      for (let j = 0; j < bestHands[0].length; j++) {
        if (bestHands[i][j] !== finalBestHand[j]) {
          isAMatch = false;
          break;
        }
      }
      if (isAMatch) {
        return i + 1;
      }
    }
    return -1;
  }
  
  function CalculateWinner() {
    let finalBestHands = bestHands.map(function(hand) { return hand.slice(); });
    for (let i = 0; i < bestHands[0].length; i++) {
      finalBestHands.sort((a, b) => (b[i] % 15) - (a[i] % 15));
      let bestHandValue = finalBestHands[0][i] % 15;
      finalBestHands = finalBestHands.filter(h => h[i] % 15 === bestHandValue);
      if (finalBestHands.length === 1) {
        return [HandsSearch(finalBestHands[0])];
      }
    }
    let handIndices: number[] = [];
    finalBestHands.forEach(hand => {
      handIndices = handIndices.concat(HandsSearch(hand));
    });
    return handIndices;
  }

  function DisplayWinner(playerNums: number[]) {
    if (playerNums.length === 1) {
      document.getElementById("play-text")!.innerText += "Player " + playerNums[0] + " wins the pot with a " + HANDS[bestHands[playerNums[0] - 1][0]] + "!\n";
    } else {
      let winnersString = "Players ";
      for (let i = 0; i < playerNums.length; i++) {
        if (i === playerNums.length - 1) {
          winnersString += "& " + playerNums[i] + " split the pot with a " +  HANDS[bestHands[playerNums[0] - 1][0]] + " tie!\n"
        } else if (i === playerNums.length - 2) {
          winnersString += playerNums[i] + " ";
        } else {
          winnersString += playerNums[i] + ", ";
        }
      }
      document.getElementById("play-text")!.innerText += winnersString;
    }
   
    document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
    document.getElementById("reset-button")!.hidden = false;
    document.getElementById("full-reset-button")!.hidden = false;
    document.getElementById("bet-button")!.hidden = true;
    document.getElementById("raise-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    for (let i = 1; i <= totalPlayers; i++) {
      document.getElementById("p" + i +"-stats")!.classList.remove("glow");
      if (playerNums.includes(i)) {
        document.getElementById("p" + i +"-stats")!.classList.add("winner-glow");
      }
    }
    let newBanks = playerBanks;
    playerNums.forEach(playerNum => {
      newBanks[playerNum - 1] += pot/playerNums.length;
    });
    setPlayerBanks(newBanks);
    setPot(0);
  }

  function betButtonText(): import("react").ReactNode {
    if (currentBet === 0) {
      return "Check";
    } else {
      return "Call";
    }
  }

  function raiseButtonText(): import("react").ReactNode {
    if (currentBet === 0) {
      return "Bet";
    } else {
      return "Raise";
    }
  }

  return (
    <>
      <div id="warning-reporter">
      </div>
      <div id="table">
        <button onClick={function() {HoleDeal(cards.slice(2 * (currentPlayer - 1), 2), startingPlayer); SmallAndBigBlind(startingPlayer - 1);}} className="reset-spaced-button" id="start-button" type="button">
          Start
        </button>
        <button onClick={() => Reset()} className="reset-spaced-button" id="reset-button" type="button" hidden={true}>
          Next Round
        </button>
        <button onClick={() => window.location.reload()} className="reset-spaced-button" id="full-reset-button" type="button" hidden={true}>
          Restart Game
        </button>
        <div id="hole-card-one" hidden={true}>
          <Card val={cards[2 * (currentPlayer - 1)]}/>  
        </div> 
        <div id="hole-card-two" hidden={true}>
          <Card val={cards[2 * (currentPlayer - 1) + 1]}/>
        </div>   
        <div className="communal-cards">
          <div id="flop-card-one" hidden={true}style={{float:"left"}}>
            <Card val={cards[cards.length - 5]}/>
          </div>
          <div id="flop-card-two" hidden={true} style={{float:"left"}}>
            <Card val={cards[cards.length - 4]}/>
          </div>
          <div id="flop-card-three" hidden={true} style={{float:"left"}}>
            <Card val={cards[cards.length - 3]}/>
          </div>
          <div id="turn-card" hidden={true} style={{float:"left"}}>
            <Card val={cards[cards.length - 2]}/>
          </div>
          <div id="river-card" hidden={true} style={{float:"left"}}>
            <Card val={cards[cards.length - 1]}/>
          </div>
        </div>
        <h1 id="p1-stats" className=".player-stats">
          Player 1: £{playerBanks[0]}
        </h1>
        <h1 id="p2-stats" className=".player-stats">
          Player 2: £{playerBanks[1]}
        </h1>
        <h1 id="p3-stats" className=".player-stats" hidden={playerBanks.length < 3}>
          Player 3: £{playerBanks[2]}
        </h1>
        <h1 id="p4-stats" className=".player-stats" hidden={playerBanks.length < 4}>
          Player 4: £{playerBanks[3]}
        </h1>
        <h1 id="p5-stats" className=".player-stats" hidden={playerBanks.length < 5}>
          Player 5: £{playerBanks[4]}
        </h1>
        <h1 id="p6-stats" className=".player-stats" hidden={playerBanks.length < 6}>
          Player 6: £{playerBanks[5]}
        </h1>
        <h1 id="p7-stats" className=".player-stats" hidden={playerBanks.length < 7}>
          Player 7: £{playerBanks[6]}
        </h1>
        <h1 id="p8-stats" className=".player-stats" hidden={playerBanks.length < 8}>
          Player 8: £{playerBanks[7]}
        </h1>
        <div id="decision-buttons">
          <button id="bet-button" className="spaced-button" type="button" onClick={() => Bet()} disabled={playerBanks[currentPlayer - 1] === 0} hidden={true}>
            {betButtonText()}
          </button>
          <button id="raise-button" className="spaced-button" type="button" onClick={() => Raise()} disabled={playerBanks[currentPlayer - 1] === 0} hidden={true}>
            {raiseButtonText()}
          </button>
          <button id="fold-button" className="spaced-button" type="button" onClick={() => Fold()} disabled={playerBanks[currentPlayer - 1] === 0} hidden={true}>
            Fold
          </button>  
        </div>
        <h1 id="winner-text" hidden={true} style={{display:"inline-block", position:"absolute", left:"50px", bottom:"50px"}}/>
        <h1 id="pot">Pot = £{pot}</h1>
      </div>
      <div id="play-reporter">
        <h1 id="play-text"></h1>
      </div>
      {/* <h1 style={{color: "#f5f8e7"}}>{cards.map(card => {if (Math.floor(card / 15) === 0) {
    return card%15 + "H"; //Hearts
  } else if (Math.floor(card / 15) === 1) {
    return card%15 + "D"; //Diamonds
  } else if (Math.floor(card / 15) === 2) {
    return card%15 + "C"; //Clubs
  } else {
    return card%15 + "S"; //Spades
  }}).toString()}</h1> */}
      <h1 id="best-hand" style={{color: "#f5f8e7"}}>{bestHandText}</h1>
    </>
  );
}

export default Board;