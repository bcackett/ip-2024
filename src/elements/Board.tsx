import { start } from "repl";
import Card from "./Card";
import Deck from "./Deck";
import { useCallback, useState, useEffect, useReducer } from "react";
import Calculations from "./Calculations"
import { supabase } from "../common/supabase";
import { paste } from "@testing-library/user-event/dist/paste";
import LoadingOverlay from "react-loading-overlay-ts";
import TeachingText from "./TeachingText";
import StateEncoder from "./StateEncoder";
import { findSourceMap } from "module";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

// Creating a type that contains all of the input parameters required to create a Board.
type roomSize = {
  totalPlayers: number;
  computerPlayers: number;
  playerProfiles?: number[][];
  lessonNum?: number;
}

function Board({totalPlayers, computerPlayers, playerProfiles, lessonNum} : roomSize) {
  const nav = useNavigate();
  const deck: Deck = new Deck;
  const calcs: Calculations = new Calculations;
  const teachingText: TeachingText = new TeachingText;
  const stateEncoder: StateEncoder = new StateEncoder;
  const HANDS = ["High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush", "Royal Flush"];
  deck.Shuffle();
  const STARTBANK = 200;
  const BIGBLIND = 10;
  const [cards, setCards] = useState(deck.Deal(totalPlayers));
  const [startingPlayer, setStartingPlayer] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerBanks, setPlayerBanks] = useState(Array.from({length: totalPlayers}).map(bank=>STARTBANK));
  const [playerBets, setPlayerBets] = useState(new Array(totalPlayers).fill(0));
  const [playerPrompts, setPlayerPrompts] = useState(new Array(totalPlayers - computerPlayers).fill(""));
  const [currentBet, setCurrentBet] = useState(0);
  const [bestHandText, setBestHandText] = useState("");
  const [foldedtotalPlayers, setFoldedtotalPlayers] = useState(new Array(totalPlayers).fill(0));
  const [pot, setPot] = useState(0);
  const [potStartOfRound, setPotStartOfRound] = useState(0);
  const [bestHands, setBestHands] = useState(new Array(totalPlayers).fill(0));
  const [humanPredictedResults, setHumanPredictedResults] = useState(new Array(totalPlayers - computerPlayers).fill(0));
  const [currentPlayerPrediction, setCurrentPlayerPrediction] = useState(0);
  const [gameState, setGameState] = useState(-1); // 0 = preflop, 1 = flop, 2 = turn, 3 = river, 4 = winner, -1 = error
  const [loadingActive, setLoadingActive] = useState(false);
  const [winner, setWinner] = useState(0);
  const [p1InitialBank, setP1InitialBank] = useState(200)
  const [prevState, setPrevState] = useState("");
  const [startOfRoundStates, setStartOfRoundStates] = useState(new Array(5).fill(""));
  const [preAction, setPreAction] = useState(true);
  const handleLoadingFalse = useCallback(() => setLoadingActive(false), []);
  const handleLoadingTrue = useCallback(() => setLoadingActive(true), []);

  useEffect(() => {setCurrentPlayer(winner)}, [winner]); // This hook displays the cards of the winning player when this player is determined.

  // This hook ensures that the correct number of cards are displayed for the current game state, including if the game rewinded to a previous state.
  useEffect(() => {
    if (gameState >= 0) {
    } else {
      document.getElementById("hole-card-one")!.hidden = true;
      document.getElementById("hole-card-two")!.hidden = true; 
    }
    
    if (gameState >= 1) {
      document.getElementById("flop-card-one")!.hidden = false;
      document.getElementById("flop-card-two")!.hidden = false;
      document.getElementById("flop-card-three")!.hidden = false;
    } else {
      document.getElementById("flop-card-one")!.hidden = true;
      document.getElementById("flop-card-two")!.hidden = true;
      document.getElementById("flop-card-three")!.hidden = true;
    }

    if (gameState >= 2) {
      document.getElementById("turn-card")!.hidden = false;
    } else {
      document.getElementById("turn-card")!.hidden = true;
    }

    if (gameState >= 3) {
      document.getElementById("river-card")!.hidden = false;
    } else {
      document.getElementById("river-card")!.hidden = true;
    }
  }, [gameState]);

  const resetBets = useCallback(() => {console.log("MADE IT TO THE USEEFFECT!"); setPlayerBets(new Array(totalPlayers).fill(0))}, []); 
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  
  function HoleDeal(visibleCards: number[], playerNum: number) {
    // Begins the game and deals the hole cards by setting the game state to 0 and displaying any lesson text required at the beginning of the game.
    console.log(cards.toString());
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    document.getElementById("start-button")!.hidden = true;
    let bestHand = FindBestHand(visibleCards, playerNum);
    setGameState(0);

    // The lesson text displayed is dictated by the lesson number, if any, as well requiring the lesson text setting to be enabled if there is a logged in account.
    if (lessonNum && teachingText.returnTargetPrompt(lessonNum, 0) && playerNum <= totalPlayers - computerPlayers && sessionStorage.getItem("lessonText") === "true") {
      document.getElementById("bet-button")!.hidden = true;
      document.getElementById("raise-button")!.hidden = true;
      document.getElementById("fold-button")!.hidden = true;
      document.getElementById("info-text")!.innerText = teachingText.returnTargetPrompt(lessonNum, 0);
      if (lessonNum === 9 && playerProfiles![0][0] === 80) {
        document.getElementById("info-text")!.innerText += "This player is aggressive."
      } else if (lessonNum === 9 && playerProfiles![0][1] === 80) {
        document.getElementById("info-text")!.innerText += "This player is likely to bluff."
      } else if (lessonNum === 9 && playerProfiles![0][2] === 40)  {
        document.getElementById("info-text")!.innerText += "This player can be unpredictable, but is otherwise honest."
      } else if (lessonNum === 9) {
        document.getElementById("info-text")!.innerText += "This player is cautious."
      }
      document.getElementById("revert-button")!.hidden = true;
      document.getElementById("info-box")!.hidden = false;
      handleLoadingTrue();
    }
  }

  function FlopDeal(cards: number[], playerNum: number) {
    // Begins the second betting round and deals the flop cards by setting the game state to 1 and displaying any lesson text required at the beginning of this round.
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards, playerNum);
    setCurrentBet(0);
    setGameState(1);

    if (lessonNum && teachingText.returnTargetPrompt(lessonNum, 1) && playerNum <= totalPlayers - computerPlayers && sessionStorage.getItem("lessonText") === "true") {
      document.getElementById("bet-button")!.hidden = true;
      document.getElementById("raise-button")!.hidden = true;
      document.getElementById("fold-button")!.hidden = true;
      document.getElementById("info-text")!.innerText = teachingText.returnTargetPrompt(lessonNum, 1);
      document.getElementById("revert-button")!.hidden = true;
      document.getElementById("info-box")!.hidden = false;
      handleLoadingTrue();
    }
  }
  
  function TurnDeal(cards: number[], playerNum: number) {
    // Begins the third betting round and deals the flop cards by setting the game state to 2 and displaying any lesson text required at the beginning of this round.
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards, playerNum);
    setCurrentBet(0);
    setGameState(2);

    if (lessonNum && teachingText.returnTargetPrompt(lessonNum, 2) && playerNum <= totalPlayers - computerPlayers && sessionStorage.getItem("lessonText") === "true") {
      document.getElementById("bet-button")!.hidden = true;
      document.getElementById("raise-button")!.hidden = true;
      document.getElementById("fold-button")!.hidden = true;
      document.getElementById("info-text")!.innerText = teachingText.returnTargetPrompt(lessonNum, 2);
      document.getElementById("revert-button")!.hidden = true;
      document.getElementById("info-box")!.hidden = false;
      handleLoadingTrue();
    }
  }
  
  function RiverDeal(cards:number[], playerNum: number) {
    // Begins the final betting round and deals the flop cards by setting the game state to 3 and displaying any lesson text required at the beginning of this round.
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards, playerNum);
    setCurrentBet(0);
    setGameState(3);

    if (lessonNum && teachingText.returnTargetPrompt(lessonNum, 3) && playerNum <= totalPlayers - computerPlayers && sessionStorage.getItem("lessonText") === "true") {
      document.getElementById("bet-button")!.hidden = true;
      document.getElementById("raise-button")!.hidden = true;
      document.getElementById("fold-button")!.hidden = true;
      document.getElementById("info-text")!.innerText = teachingText.returnTargetPrompt(lessonNum, 3);
      document.getElementById("revert-button")!.hidden = true;
      document.getElementById("info-box")!.hidden = false;
      document.getElementById("ready-button")!.ariaDisabled = "true";
      handleLoadingTrue();
    }
  }
  
  
  function FindBestHand(cards: number[], playerNum: number) {
    /*Calls the Calculations class via the calcs constant in order to determine the best hand out of the known cards.
    Returns value of best hand (0 for high card -> 9 for royal flush), followed by values of cards in best hand.
    Eg: [9, 59, 58, 57, 56, 55] = royal flush with spades. */

    let cardsCopy: number[] = [];
    cards.forEach(card => {
      cardsCopy.push(card);
    });
    let bestHand = calcs.FindBestHand(cardsCopy);
    console.log("BEST HAND: " + bestHand);
    setBestHandText(HANDS[bestHand[0]]);
    let newBestHands = bestHands;
    newBestHands[playerNum - 1] = bestHand;
    setBestHands(newBestHands);
  }
  
  function Reset() {
    // Resets the visual components back to the state they should be in at the start of the next game.
    deck.Shuffle();

    let newPlayerBanks = playerBanks;
    for (let i = 0; i < newPlayerBanks.length; i++) {
      if (newPlayerBanks[i] <= 0) {
        newPlayerBanks[i] = STARTBANK;
      }
    }
    console.log("PLAYER BANKS ON RESET: " + newPlayerBanks);
    setPlayerBanks(newPlayerBanks);

    setP1InitialBank(newPlayerBanks[0]);
    setCards(deck.Deal(totalPlayers));
    setPlayerBets(new Array(totalPlayers).fill(0));
    console.log("Player Bets on Reset:" + playerBets);
    setFoldedtotalPlayers(new Array(totalPlayers).fill(0));
    setPlayerPrompts(new Array(totalPlayers - computerPlayers).fill(""));

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
    document.getElementById("warning-text")!.innerText = "";
    setBestHandText("");
    let newStartingPlayer = startingPlayer.valueOf() + 1; // Starting player is increased by 1 as opposed to reset as the beginning of play should be passed around the table between games.
    if (newStartingPlayer > totalPlayers) {
      newStartingPlayer = 1;
    }
    for (let i = 1; i <= totalPlayers; i++) {
      document.getElementById("p" + i + "-stats")?.classList.remove("glow");
      document.getElementById("p" + i + "-stats")?.classList.remove("winner-glow");
    }
    setStartingPlayer(newStartingPlayer);
    setCurrentPlayer(newStartingPlayer);
    setPotStartOfRound(0);
    setPreAction(true);
  }

  function ImmediateNewCard(newPlayerNum: number, nestedCurrentPlayer?: number, nestedCurrentBet?: number) {
    // Triggers the next betting round. This code is isolated as new rounds can begin at any time after every player has taken at least one action.
    resetBets();
    console.log("Player Bets on New Card:" + playerBets);
    let knownCards: number[] = [];
    if (nestedCurrentPlayer) {
      document.getElementById("p" + nestedCurrentPlayer +"-stats")!.classList.remove("glow");
    } else {
      document.getElementById("p" + currentPlayer +"-stats")!.classList.remove("glow");
    }
    document.getElementById("p" + newPlayerNum +"-stats")!.classList.add("glow");
    if (gameState === 0) {
      knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -2));
      FlopDeal(knownCards, newPlayerNum);
    } else if (gameState === 1) {
      knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -1));
      TurnDeal(cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -1)), newPlayerNum);
    } else if (gameState === 2) {
      knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, cards.length));
      RiverDeal(knownCards, newPlayerNum);
    } else {
      DisplayWinner(CalculateWinner(), nestedCurrentBet);
    }
    return knownCards;
  }

  async function ChangePlayer(nestedCurrentPlayer?: number, nestedCurrentBet?: number, lastPlayer?: number) {
    // Triggers a change in active player to be called after each player makes an action.
    setPreAction(true);
    if (foldedtotalPlayers.filter(p => p === 0).length === 1) { // If there is only one player left in the game that has not folded, they win by default.
      let winner = foldedtotalPlayers.indexOf(0) + 1;
      DisplayWinner([winner], nestedCurrentBet);
    } else if ((Array.from(new Set(playerBanks)).length === 1 && playerBanks[0] === 0)) { // If all players have bet their entire bank, the remaining cards are dealt and the winner is determined immediately.
      setGameState(4);
      for (let i = 1; i <= totalPlayers; i++) {
        FindBestHand(cards.slice(2 * (i - 1), 2 * (1 - 1) + 2).concat(cards.slice(-5, cards.length)), i);
      }
      let winner = CalculateWinner();
      console.log("GAME OVER - NESTED CURRENT BET: " + nestedCurrentBet);
      DisplayWinner(winner, nestedCurrentBet);
    } else { // In any other case, the game is only over if all betting rounds have been completed.
      let newPlayerNum: number;
      let oldPlayerNum: number;
      let newCurrentBet: number;

      // Nested variables are used as a failsafe in case the following code is executed before the states are updated.
      if (nestedCurrentBet) {
        newCurrentBet = nestedCurrentBet;
      } else {
        newCurrentBet = currentBet;
      }
      if (nestedCurrentPlayer) {
        oldPlayerNum = nestedCurrentPlayer;
        newPlayerNum = nestedCurrentPlayer + 1;
      } else {
        oldPlayerNum = currentPlayer;
        newPlayerNum = currentPlayer + 1;
      }

      console.log("Player Bet Sum: " + playerBets.reduce((x,y) => x + y));
      console.log("Starting Pot: " + potStartOfRound);

      // Collecting the bets of all players still in the game in preparation for checking if a betting round has ended.
      let firstPlayer = foldedtotalPlayers.indexOf(0) + 1;
      let foldedPlayerIndices = Array.from(foldedtotalPlayers.keys());
      let orderedFoldedPlayers = foldedPlayerIndices.slice(startingPlayer - 1).concat(foldedPlayerIndices.slice(0, startingPlayer - 2))
      let trueStartingPlayer = orderedFoldedPlayers[0] + 1; // True starting player is the game's starting player unless this person has folded, in which case it is the next player in the cycle
      let newCard = false;
      let cycleComplete = false;
      let betsNoFoldedPlayers = [];
      for (let i = 0; i < foldedtotalPlayers.length; i++) {
        if (foldedtotalPlayers[i] === 0) {
          betsNoFoldedPlayers.push(playerBets[i]);
        }
      }
      let uniqueBets = Array.from(new Set(betsNoFoldedPlayers));
      if (newPlayerNum === totalPlayers + 1) {
        newPlayerNum = firstPlayer;
      }

      console.log("TRUE STARTING PLAYER: " + trueStartingPlayer.toString());
      // If the next player to act is the true starting player, every player still in the game has had a chance to act at least once.
      if (newPlayerNum === trueStartingPlayer) {
        cycleComplete = true; 
      }

      while (foldedtotalPlayers[newPlayerNum - 1] === 1) {
        newPlayerNum++;
        if (newPlayerNum === totalPlayers + 1) {
          newPlayerNum = firstPlayer;
        }

        if (newPlayerNum === trueStartingPlayer) {
          cycleComplete = true;
        }
      }

      // A new betting round should begin if every player still in the game has acted at least once and every non-folded player has bet the same amount in this round.
      if (((newPlayerNum === trueStartingPlayer && uniqueBets[0] === 0 && cycleComplete === true) || uniqueBets[0] !== 0)  && uniqueBets.length === 1) {
        if (!(lastPlayer && lastPlayer === newPlayerNum)) {
          newCard = true;
        }
      }

      let knownCards: number[] = [];
      if (newCard === true) { // Start the next round of betting if the conditions required have been met.
        console.log("New card dealt!");
        newPlayerNum = startingPlayer;
        while (foldedtotalPlayers[newPlayerNum - 1] === 1) {
          newPlayerNum++;
          if (newPlayerNum === totalPlayers + 1) {
            newPlayerNum = firstPlayer;
          }
        }
        setPotStartOfRound(potStartOfRound + playerBets.reduce((x,y) => x + y));
        console.log("Next Round Starting Pot: " + potStartOfRound);
        knownCards = ImmediateNewCard(newPlayerNum, nestedCurrentPlayer, nestedCurrentBet);
      } else { // Otherwise the next player's cards and best hand should be displayed, along with any communal cards visible in the given round.
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
      if (knownCards.length !== 0) {
        setCurrentPlayer(newPlayerNum);
        hideCards(newPlayerNum);
        if (newPlayerNum <= totalPlayers - computerPlayers) {
          await sleep(5000); // Small delay implemented to allow users time to read suggested decision and pass to next player in local multiplayer games.
          setCurrentPlayerPrediction(humanSimCalc(newPlayerNum, knownCards, newCurrentBet));
        }
      }
    }
    if (totalPlayers - computerPlayers > 1) {
      document.getElementById("warning-text")!.hidden = true; // Hiding the suggested move so as to not give hints to other players.
    }
    handleLoadingFalse();
  }

  function humanSimCalc(playerNum: number, allCards: number[], newCurrentBet: number) {
    // Calculates the best decision the given player could have made given their known cards according to their effective hand strength using the Calculations class through the calcs constant.
    let playerCards = [allCards[0], allCards[1]];
    let communalCards: number[] = [];
    if (allCards.length > 2) {
      for (let i = 2; i < allCards.length; i++) {
        communalCards = communalCards.concat(allCards[i]);
      }
    }
    return calcs.decisionCalc(playerCards, communalCards);
  }

  function computerCalc(playerProfile: number[], allCards: number[], playerNum: number, newCurrentBet: number) {
    // Chooses the decision the given computer player will make given their known cards according to their effective hand strength and personality values.
    let playerCards = [allCards[0], allCards[1]];
    let communalCards: number[] = [];
    if (allCards.length > 2) {
      for (let i = 2; i < allCards.length; i++) {
        communalCards = communalCards.concat(allCards[i]);
      }
    }
    let randomDecisionValue = Math.random() * 100;
    if (randomDecisionValue < playerProfile[2]) { // Check for if a random decision should be made according to the player's randomness value.
      randomDecisionValue = Math.floor(Math.random() * 100);
      if (randomDecisionValue < (10 - playerProfile[0]/10) && gameState >= 2) {
        Fold(playerNum);
      } else if (randomDecisionValue < (50 - playerProfile[0]/10) || playerBanks[playerNum - 1] === 0) {
        Bet(playerNum, newCurrentBet);
      } else if (randomDecisionValue < (80 - playerProfile[0]/10)) {
        if (Math.min(newCurrentBet + 10, playerBets[playerNum - 1] + playerBanks[playerNum - 1]) === playerBets[playerNum - 1] + playerBanks[playerNum - 1]) {
          Bet(playerNum, newCurrentBet);
        } else {
          Raise(Math.min(newCurrentBet + 10, playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
        }
      } else {
        if (Math.min(newCurrentBet + 10 + (randomDecisionValue - 60), playerBets[playerNum - 1] + playerBanks[playerNum - 1]) === playerBets[playerNum - 1] + playerBanks[playerNum - 1]) {
          Bet(playerNum, newCurrentBet);
        } else {
          Raise(Math.min(newCurrentBet + 10 + (randomDecisionValue - 60), playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
        } 
      }
    } else if (playerBanks[playerNum - 1] === 0) { // If the player hs no money in their bank, they cannot act and only check.
      Bet(playerNum, newCurrentBet);
    } else {
      let effectiveHandScore = calcs.decisionCalc(playerCards, communalCards);
      console.log("EHS: " + effectiveHandScore);
      // let nashEquilibrium = Calculations.nashEq(cards);
      if (effectiveHandScore < (0.2 - (playerProfile[0] / 1000))) { // If not random, the decision made is based off of the player's aggression value.
        if (randomDecisionValue >= playerProfile[1] && gameState >= 2) {
          Fold(playerNum);
        } else if (randomDecisionValue >= playerProfile[1]) { // The deception value decides if the computer player should bluff by going against the suggested decision.
          Bet(playerNum);
        } else {
          if (Math.min(newCurrentBet + 30 + Math.floor(playerProfile[0] / 5), playerBets[playerNum - 1] + playerBanks[playerNum - 1]) === playerBets[playerNum - 1] + playerBanks[playerNum - 1]) {
            Bet(playerNum, newCurrentBet);
          } else {
            Raise(Math.min(newCurrentBet + 30 + Math.floor(playerProfile[0] / 5), playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
          }
        }
      } else if (effectiveHandScore > (0.75 - (playerProfile[0] / 200))) {
        if (Math.min(newCurrentBet + 10 + Math.floor(playerProfile[0] / 5), playerBets[playerNum - 1] + playerBanks[playerNum - 1]) === playerBets[playerNum - 1] + playerBanks[playerNum - 1]) {
          Bet(playerNum, newCurrentBet);
        } else {
          Raise(newCurrentBet + 10 + Math.floor(playerProfile[0] / 5), playerNum, newCurrentBet);
        }
        
      } else {
        if (randomDecisionValue >= playerProfile[1] || Math.min(newCurrentBet + 10 + Math.floor(playerProfile[0] / 5), playerBets[playerNum - 1] + playerBanks[playerNum - 1]) === playerBets[playerNum - 1] + playerBanks[playerNum - 1]) {
          Bet(playerNum, newCurrentBet);
        } else {
          Raise(Math.min(newCurrentBet + 10 + Math.floor(playerProfile[0] / 5), playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
        }
      }
    }
  }

  async function decisionToMessage(playerDecision: number) {
    let currentPlayerAbility = await calcs.moveSuggestionCalc(); // Retrieves the current player's ability compared to the rest of the platform's users using the Calculations class through the calcs constant.
    console.log("Current Player Ability: " + currentPlayerAbility);
    let strongestPlayerThreshold = 0;
    let weakestPlayerThreshold = 0;
    let output = [0, ""]; // The first element of the array represents the "cost" of the decision. 0 = bet/check, 1 = raise, -1 = fold.

    /* The prompt given to the user depends on:
        - their performance compared to all of the users on the platform and their recent performance (combined into currentPlayerAbility).
        - the decision calculated by the effective hand strength algorithm (currentPlayerPrediction).
        - how high the bet is currently (currentBet). */
    if (currentBet === 0){
      if (currentPlayerPrediction < 0.3) {
        if (currentPlayerAbility > 0.75 + (gameState * 0.05)) {
          output = [1,"It might be risky, but it's possible the other players don't have great cards here. You could raise here as a bluff to intimidate them, even though your hand isn't great."];
        } else {
          output = [0, "This hand isn't great, but since you can stay in the game without folding or adding money to the pot, you might as well. Checking is the best option here."];
        }
      } else if (currentPlayerPrediction < 0.7) {
        if (currentPlayerAbility > 0.6 + (gameState * 0.08)) {
          output = [1,"It might be risky, but it's possible the other players don't have great cards here. You could raise here as a bluff to intimidate them, even though your hand is average."];
        } else {
          output = [0, "This hand is OK, but since you can stay in the game without folding or adding money to the pot, you might as well. Checking is the best option here."];
        }
      } else {
        output = [1, "Your hand is very good! Raising the bet here might be a better plan, as it will put additional pressure on your opponents and increase possible winnings."];
      }
    } else {
      if (currentPlayerPrediction < 0.3) {
        if (gameState < 3 && currentBet > 3 * BIGBLIND) {
          if (currentPlayerAbility > 0.9 + (gameState * 0.05)) {
            output = [0, "It might be risky, but it's possible the other players don't have great cards here. You could bet here as a bluff to stay in the game, even though your hand isn't great."];
          } else {
            output = [-1, "This situation looks pretty rough. In this case, it might be a better idea to fold to avoid needing to add any more money to the pot."];
          }
        } else if (gameState < 3) {
          if (currentPlayerAbility > 0.8 + (gameState * 0.05)) {
            output = [1,"It might be risky, but it's possible the other players don't have great cards here. You could raise here as a bluff to intimidate them, even though your hand isn't great."];
          } else {
            output = [-1, "This situation looks pretty rough. In this case, it might be a better idea to fold to avoid needing to add any more money to the pot."];
          }
        } else {
          if (currentPlayerAbility > 0.95) {
            output = [0, "It might be risky, but it's possible the other players don't have great cards here. You could bet here as a bluff to stay in the game, even though your hand isn't great."];
          } else {
            output = [-1, "This situation looks pretty rough. In this case, it might be a better idea to fold to avoid needing to add any more money to the pot."];
          }
        }
      } else if (currentPlayerPrediction < 0.7) {
        if (currentBet > 3 * BIGBLIND) {
          if (currentPlayerAbility > 0.9 + (gameState * 0.025)) {
            output = [1, "This could be very risky, but you could raise the bet here. Matching the bet is also a good call, but this is a better opportunity than most to apply some pressure to your opponents."];
          } else if (currentPlayerAbility < 0.3 - (gameState * 0.05)){
            output = [-1, "This situation looks pretty rough. In this case, it might be a better idea to fold to avoid needing to add any more money to the pot."];
          } else {
            output = [0, "Your hand is OK, but the bet is already quite high. You definitely don't want to be out of the game, but increasing the bet too high could be risky. It's probably safest to to bet here."];
          }
        } else {
          if (currentPlayerAbility > 0.85 + (gameState * 0.05)) {
            output = [1, "This hand is very strong and the bet is not too high! This is a great opportunity to raise the bet and put some pressure on your opponents."];
          } else {
            output = [0, "You have a very strong hand, but the bet is quite high. Raising could be too big a risk to take, so matching the bet is recommended. You definitely want to stay in the game with this hand!"];
          }
        }
      } else {
        if (currentBet > 3 * BIGBLIND) {
          if (currentPlayerAbility > 0.85 + (gameState * 0.05)) {
            output = [1, "This hand is very strong! This is a great opportunity to raise the bet and put some pressure on your opponents. Don't raise by too much though, the bet is already quite high."];
          } else {
            output = [0, "You have a very strong hand, but the bet is quite high. Raising could be too big a risk to take, so matching the bet is recommended. You definitely want to stay in the game with this hand!"];
          }
        } else {
          output = [1, "This hand is very strong and the bet is not too high! This is a great opportunity to raise the bet and put some pressure on your opponents."];
        }
      }
    }
    console.log("Output pre-transform: " + output);
    if (output[0] === playerDecision) {
      return "Good decision!\n\n"; // Replace the warning message with a message of encouragement if the user's decision matched the algorithm's result.
    } else {
      return output[1] + "\n\n";
    }
  }

  async function SetWarningText(currentPlayerNum: number, decisionNum: number) {
    // Changes the text in the player's decision suggestions to match the current game state.
    let newPlayerPrompts = playerPrompts;
    newPlayerPrompts[currentPlayerNum - 1] += await decisionToMessage(decisionNum);
    setPlayerPrompts(newPlayerPrompts);
    document.getElementById("warning-text")!.innerText = newPlayerPrompts[currentPlayerNum - 1];
    document.getElementById("warning-reporter")!.scrollTop = document.getElementById("warning-reporter")!.scrollHeight;
  }

  async function Raise(raise?: number, playerNum?: number, nestedCurrentBet?: number) {
    // Handle the required actions for a player to match a raise.
    // The raise parameter specifically is optional as it is only required when the current player is a computer player.
    handleLoadingTrue();
    setPreAction(false);
    let currentPlayerNum: number;
    let newCurrentBet: number;
    if (playerNum) {
      currentPlayerNum = playerNum;
    } else {
      currentPlayerNum = currentPlayer;
    }
    if (nestedCurrentBet) {
      newCurrentBet = nestedCurrentBet;
    } else {
      newCurrentBet = currentBet;
    }
    let newBanks = playerBanks;
    let newBets = playerBets
    let amount = 0;
    let nullableAmount: string | null = "0";
    if (!raise) { // If there is no bet passed in, the user is human and must therefore be asked how much they want to raise the bet.
      if (playerBanks[currentPlayerNum - 1] !== 0) {
        nullableAmount = window.prompt("The bet is currently set at £" + newCurrentBet + ". What would you like to raise the bet to?");
        amount = Number(nullableAmount);
        while (nullableAmount !== null && (amount > (playerBanks[currentPlayerNum - 1] + playerBets[currentPlayerNum - 1]) || amount <= newCurrentBet)) {
          // Bets must fall between the current value of the bet and the maximum amount the user currently has in the bank.
          let windowText = "";
          if (amount <= newCurrentBet) {
            windowText = "You must raise the bet to a number higher than its current value. The bet is currently set at £" + newCurrentBet + ". What would you like to raise the bet to?";
          } else {
            windowText = "You cannot raise the bet to more than you currently have in your bank. The bet is currently set at £" + newCurrentBet + ". What would you like to raise the bet to?";
          }
          nullableAmount = window.prompt(windowText);
          amount = Number(nullableAmount);
        }
        if (nullableAmount !== null) {
          if (currentPlayerNum <= totalPlayers - computerPlayers) {
            await SetWarningText(currentPlayerNum, 1); // Ensure that the advice for the player updates before the game continues.
          }
        } else {
          handleLoadingFalse();
        }
      }
    } else { // Otherwise, simply set the amount to be raised by to the value passed in.
      amount = raise;
    }
    if (nullableAmount !== null) {
      newBanks[currentPlayerNum - 1] -= (amount - newBets[currentPlayerNum - 1]);
      newBets[currentPlayerNum - 1] += (amount - newBets[currentPlayerNum - 1]);
      document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " raised the bet to £" + amount +".\n\n";
      setCurrentBet(amount); // Increase the value of the current bet so that every player after this one must bet at least this new amount.
      setPlayerBanks(newBanks);
      setPlayerBets(newBets);
      setPot(potStartOfRound + newBets.reduce((x,y) => x + y));
      console.log("Player Bets on Raise:" + playerBets +". This was for player" + currentPlayerNum);
      document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
      if (lessonNum && gameState >= 0 && currentPlayerNum <= totalPlayers - computerPlayers) {
        handleLoadingTrue();
        reversionPrompt();
      } else if (Array.from(new Set(newBanks)).length === 1 && newBanks[0] === 0) {
        setGameState(4);
        for (let i = 1; i <= totalPlayers; i++) {
          FindBestHand(cards.slice(2 * (i - 1), 2 * (1 - 1) + 2).concat(cards.slice(-5, cards.length)), i);
        }
        let winner = CalculateWinner();
        DisplayWinner(winner, nestedCurrentBet);
        handleLoadingFalse();
      } else {
        ChangePlayer(currentPlayerNum, amount - newBets[currentPlayerNum - 1]);
      }
    }
  }

  async function Bet(playerNum?: number, bet?: number) {
    // Handle the required actions for a player to match a bet.
    handleLoadingTrue();
    setPreAction(false);
    let currentPlayerNum: number;
    let currentPlayerBet: number;
    if (playerNum) {
      currentPlayerNum = playerNum;
    } else {
      currentPlayerNum = currentPlayer;
    }
    if (bet) {
      currentPlayerBet = bet;
    } else {
      currentPlayerBet = currentBet;
    }
    let newBanks = playerBanks;
    let newBets = playerBets;
    // If the betting round has already completed a cycle, the player only needs to bet the difference between the money they have already contributed and the current value of the bet.
    let betDiff = currentPlayerBet - newBets[currentPlayerNum - 1]; 
    if (playerBanks[currentPlayerNum - 1] !== 0) { // If the player has money in their bank, the action depends slightly on the current value of the bet.
      console.log("Current Player Num: " + currentPlayerNum.toString())
      if (currentPlayerNum <= totalPlayers - computerPlayers) {
        await SetWarningText(currentPlayerNum, 0); // Ensure that the advice for the player updates before the game continues.
      }
      if (currentPlayerBet === 0) { // If nobody has added to the pot yet this round, betting continues this trend and no money is contributed. Known as "checking".
        document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " checked.\n\n";
      } else { // Otherwise the player contributes the minimum amount required, as dictated by previous betting rounds.
        newBanks[currentPlayerNum - 1] -= betDiff;
        newBets[currentPlayerNum - 1] += betDiff;
        setPlayerBanks(newBanks);
        setPlayerBets(newBets);
        setPot(potStartOfRound + newBets.reduce((x,y) => x + y));
        console.log("Player Bets on Bet:" + playerBets +". This was for player" + currentPlayerNum);
        document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " bet £" + currentPlayerBet + ".\n\n";
      }
    } else { // If the player has no money in their bank, they always check as they cannot contribute any further to the pot, regardless of the current bet.
      document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " checked.\n\n";
    }
    document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
    if (lessonNum && gameState >= 0 && currentPlayerNum <= totalPlayers - computerPlayers) {
      handleLoadingTrue();
      reversionPrompt();
    } else if (Array.from(new Set(newBanks)).length === 1 && newBanks[0] === 0) {
      setGameState(4);
      for (let i = 1; i <= totalPlayers; i++) {
        FindBestHand(cards.slice(2 * (i - 1), 2 * (1 - 1) + 2).concat(cards.slice(-5, cards.length)), i);
      }
      let winner = CalculateWinner();
      DisplayWinner(winner, betDiff);
      handleLoadingFalse();
    } else {
      console.log("CURRENT PLAYER AFTER BET: " + currentPlayerNum.toString());
      ChangePlayer(currentPlayerNum, currentPlayerBet);
    }
  }

  async function Fold(playerNum?: number) {
    // Handles the required actions for a player to fold.
    handleLoadingTrue();
    setPreAction(false);
    let currentPlayerNum: number;
    if (playerNum) {
      currentPlayerNum = playerNum;
    } else {
      currentPlayerNum = currentPlayer;
    }
    let newFoldedtotalPlayers = foldedtotalPlayers;
    let newBestHands = bestHands;
    if (currentPlayerNum <= totalPlayers - computerPlayers) {
      await SetWarningText(currentPlayerNum, -1);
    }
    newFoldedtotalPlayers[currentPlayerNum - 1] = 1; // Set the current player's folded status to 1 to indicate that they have folded.
    newBestHands[currentPlayerNum - 1] = new Array(6).fill(0); // Set the current player's best hand to all 0s, as this makes it impossible for them to win as all cards have value > 1.
    setFoldedtotalPlayers(newFoldedtotalPlayers);
    setBestHands(newBestHands);
    document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " folded.\n\n";
    document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
    if (lessonNum && gameState >= 0 && currentPlayerNum <= totalPlayers - computerPlayers) {
      // Provide a chance to take back the decision to fold if currently in a lesson with move retracing enabled.
      handleLoadingTrue();
      reversionPrompt();
    } else {
      if (playerNum) {
        ChangePlayer(playerNum);
      } else {
        ChangePlayer();
      }
    }
  }

  function SmallAndBigBlind(nextPlayer: number, nestedBanks?: number[]) {
    // Perform the small and big blind turns without requiring input from the user, as these always occur without any decisions being needed.
    if (nextPlayer <= 0) {
      // Ensures no underflow in player numbers by cycling back to the last player in the list.
      nextPlayer = totalPlayers;
    }
    let smallBlindPlayer = nextPlayer;
    document.getElementById("p" + nextPlayer + "-stats")?.classList.remove("glow");
    let newBanks = playerBanks;
    if (nestedBanks) {
      newBanks = nestedBanks;
    }
    let newBets = playerBets;
    document.getElementById("play-text")!.innerText += playerOrBotText(nextPlayer) + " bet £" + BIGBLIND/2 + " as the small blind.\n\n"
    newBanks[nextPlayer - 1] -= BIGBLIND / 2;
    newBets[nextPlayer - 1] += BIGBLIND / 2;
    nextPlayer += 1;
    if (nextPlayer > totalPlayers) {
      nextPlayer = 1;
    }
    document.getElementById("play-text")!.innerText += playerOrBotText(nextPlayer) + " bet £" + BIGBLIND + " as the big blind.\n\n"
    newBanks[nextPlayer - 1] -= BIGBLIND;
    newBets[nextPlayer - 1] += BIGBLIND;
    nextPlayer += 1;
    if (nextPlayer > totalPlayers) {
      nextPlayer = 1;
    }
    document.getElementById("p" + nextPlayer + "-stats")?.classList.add("glow");
    setCurrentPlayer(nextPlayer);
    setPlayerBanks(newBanks);
    setPlayerBets(newBets);
    console.log("Player Bets on Small & Big Blind:" + playerBets);
    setCurrentBet(BIGBLIND);
    let newPot = 0;
    newPot += pot + BIGBLIND + BIGBLIND/2;
    setPot((pot) => {return pot + BIGBLIND + BIGBLIND/2});
    console.log("Player Banks on Small & Big Blind: " + playerBanks.toString());
    hideCards(nextPlayer);
  }

  function HandsSearch(finalBestHand: number[][]) {
    // Finds all players with hands that are identical to the strongest hand in the game.
    for (let i = 0; i < bestHands.length; i++) {
      let isAMatch = true;
      for (let j = 0; j < bestHands[0].length; j++) {
        if (bestHands[i][j] !== finalBestHand[j]) {
          isAMatch = false;
          break; // If at any point the hand currently being checked doesn't match the strongest hand, it cannot be a match and no other values need checking.
        }
      }
      if (isAMatch) {
        return i + 1; // Player numbers are indexed from 1, but bestHands are indexed from 0.
      }
    }
    return -1;
  }
  
  function CalculateWinner() {
    // Determine mathematically who has the best hand at the end of the game, including possible tied games.
    console.log("BEST HANDS AT END OF GAME: " + bestHands);
    let finalBestHands = bestHands.map(function(hand) { return hand.slice(); });
    for (let i = 0; i < bestHands[0].length; i++) { // Sort on the rank of the best hand stored at index 0, then by each card which are already sorted descending by value.
      finalBestHands.sort((a, b) => (b[i] % 15) - (a[i] % 15));
      let bestHandValue = finalBestHands[0][i] % 15;
      finalBestHands = finalBestHands.filter(h => h[i] % 15 === bestHandValue); // Find all hands that match the highest value in the currently assessed index.
      if (finalBestHands.length === 1) {
        return [HandsSearch(finalBestHands[0])];
      }
      /* No return statement here as the result of the filter will always have a length of one during the final iteration of the loop as this signifies a tie,
      so the return statement within the if statement will always be called on the final iteration, if not before. */
    }
    let handIndices: number[] = [];
    finalBestHands.forEach(hand => {
      handIndices = handIndices.concat(HandsSearch(hand));
    });
    return handIndices;
  }

  async function DisplayWinner(playerNums: number[], finalActionBet?: number) {
    /* Makes the appropriate changes to the UI to display the winner of the game.
    The playerNums parameter contains the player numbers of every player that wins a share of the pot, usually just one player. 
    The finalActionBet parameter is passed in to ensure that the pot contains the correct amount at the end of the game to be given to the winner(s). */

    if (playerNums.length === 1 && bestHands[playerNums[0] - 1][0]) { // If a single player won the game and their best hand is already known.
      document.getElementById("play-text")!.innerText += playerOrBotText(playerNums[0]) + " wins the pot with a " + HANDS[bestHands[playerNums[0] - 1][0]] + "!\n";
    } else if (playerNums.length === 1) { // If a single player won the game and their best hand is currently unknown.
      let cardsCopy: number[] = [];
      cards.forEach(card => {
        cardsCopy.push(card);
      });
      let bestHand = HANDS[calcs.FindBestHand(cardsCopy.slice(2 * (playerNums[0] - 1), 2 * (playerNums[0] - 1) + 2))[0]];
      document.getElementById("play-text")!.innerText += "Player " + playerNums[0] + " wins the pot with a " + bestHand + "!\n";
    } else { // If multiple players tied the game.
      // Concatenate the player names/numbers for all of the winners into a single string.
      let winnersString = playerOrBotText(playerNums[0]) + " ";
      for (let i = 1; i < playerNums.length; i++) {
        if (i === playerNums.length - 1) {
          winnersString += "& " + playerOrBotText(playerNums[i]) + " split the pot with a " +  HANDS[bestHands[playerNums[0] - 1][0]] + " tie!\n"
        } else if (i === playerNums.length - 2) {
          winnersString += playerOrBotText(playerNums[i]) + " ";
        } else {
          winnersString += playerOrBotText(playerNums[i]) + ", ";
        }
      }
      document.getElementById("play-text")!.innerText += winnersString;
      document.getElementById("best-hand")!.innerText = HANDS[bestHands[playerNums[0] - 1][0]]; // Diplays the hand rank that the winner(s) finished with.
    }
   
    document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
    document.getElementById("reset-button")!.hidden = false;
    document.getElementById("full-reset-button")!.hidden = false;
    document.getElementById("bet-button")!.hidden = true;
    document.getElementById("raise-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    document.getElementById("ready-button")!.hidden = true;
    document.getElementById("revert-by-round-button")!.hidden = true;
    
    for (let i = 1; i <= totalPlayers; i++) {
      document.getElementById("p" + i +"-stats")!.classList.remove("glow");
      if (playerNums.includes(i)) {
        document.getElementById("p" + i +"-stats")!.classList.add("winner-glow"); // Adds a golden glow effect around the winner(s)'s bank text.
      }
    }
    let newBanks = playerBanks;
    console.log("Final Banks: " + newBanks.toString());
    let newPot = pot;
    if (finalActionBet) {
      newPot += finalActionBet; // Adds the final bet if money was added to the pot as the final action of the game.
    }
    playerNums.forEach(playerNum => {
      newBanks[playerNum - 1] += newPot/playerNums.length; // Split the pot as equally as possible between the winning players.
    });

    if (sessionStorage.getItem("userID") && (computerPlayers === 0 || (lessonNum && lessonNum >= 5 && sessionStorage.getItem("moveRetracing") === "false"))) {
      /* Update the database with the results of the game if it is considered "fair" and the user is logged in.
      A game is considered to be "fair" if:
      - the computer players are not considered to be unreasonably forgiving (this is any computer opponent in lesson 5 and beyond).
      - the user has chosen to disable the ability to rewind the game, or are playing in local multiplayer where this is disabled by default. */
      let e1 = await supabase.from("results").select("gameID").order("gameID", {ascending: false}).limit(1);
      if (e1.error) {
        throw e1.error;
      } else {
        let newGameID = 0;
        if (e1.data.map(x => x.gameID)[0] !== undefined) { 
          newGameID = e1.data.map(x => x.gameID)[0] + 1;
          console.log("Made it: " + e1.data.map(x => x.gameID)[0]);
        }
        let winnings = newBanks[0] - p1InitialBank;
        let e2 = await supabase.from("results").insert({userID: Number(sessionStorage.getItem("userID")), gameID: newGameID, result: winnings});
        if (e2.error) {throw e2.error};
        console.log("DONE");
      }
    }

    if (lessonNum && sessionStorage.getItem("userID")) {
      // If the current game is a lesson, update the database to indicate that this lesson has now been completed.
      let existingLessonsComplete = await supabase.from("lessons").select("completedLessons").eq("userID", Number(sessionStorage.getItem("userID"))).limit(1).single();
      if (existingLessonsComplete.error) {
        throw existingLessonsComplete.error;
      } else {
        let completedLessons = existingLessonsComplete.data.completedLessons;
        if (!completedLessons.includes(lessonNum)) {
          let newCompletedLessons = completedLessons.concat(lessonNum);
          let e = await supabase.from("lessons").update({completedLessons: newCompletedLessons}).eq("userID", Number(sessionStorage.getItem("userID")));
          if (e.error) {throw e.error};
        } 
      }
    }

    setPlayerBanks(newBanks);
    setPot(0);
    setWinner(playerNums[0]);
  }

  function betButtonText(): import("react").ReactNode {
    // Changes the text on the button to perform a bet to suit the current state of the game.
    if (currentBet === 0 || playerBanks[currentPlayer - 1] === 0) { 
      // If the bet is currently set to 0 or the player has no money in their bank, the user is betting a value of 0, known as "checking" The button text should reflect this.
      return "Check";
    } else {
      return "Call";
    }
  }

  function raiseButtonText(): import("react").ReactNode {
    // Changes the text on the button to perform a raise to suit the current state of the game.
    if (currentBet === 0) { // If the bet is currently set to 0, the user is not raising the bet, but setting its initial value. The button text should reflect this.
      return "Bet";
    } else {
      return "Raise";
    }
  }

  function hideCards(nextPlayer: number) {
    // Hides all information that other players should not be able to see, as well as decision buttons, so that no player is given an advantage between turns.
    document.getElementById("warning-text")!.hidden = false;
    document.getElementById("raise-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    document.getElementById("bet-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    document.getElementById("hole-card-one")!.hidden = true;
    document.getElementById("hole-card-two")!.hidden = true;
    document.getElementById("revert-by-round-button")!.hidden = true;
    document.getElementById("ready-button")!.hidden = false;

    // The next player much select that they are ready before information is revealed in order to ensure that no other players see their cards.
    setBestHandText(playerOrBotText(nextPlayer) + "'s Turn: Ready?");
  }

  function showCards() {
    // Shows the information that was previously hidden to the current player so that they can make their decision for this betting round.
    document.getElementById("warning-text")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    document.getElementById("hole-card-one")!.hidden = false;
    document.getElementById("hole-card-two")!.hidden = false;
    let knownCards = cards.slice(2 * (currentPlayer - 1), 2 * (currentPlayer - 1) + 2);;
    if (gameState > 0) {
      document.getElementById("flop-card-one")!.hidden = false;
      document.getElementById("flop-card-two")!.hidden = false;
      document.getElementById("flop-card-three")!.hidden = false;
      knownCards = knownCards.concat(cards.slice(-5, -2));
      if (lessonNum && sessionStorage.getItem("moveRetracing") === "true") {
        document.getElementById("revert-by-round-button")!.hidden = false;
      }
    }
    if (gameState > 1) {
      document.getElementById("turn-card")!.hidden = false;
      knownCards = knownCards.concat(cards.slice(-5, -2));
    }
    if (gameState > 2) {
      document.getElementById("river-card")!.hidden = false;
      knownCards = knownCards.concat(cards.slice(-5, -2));
    }
    document.getElementById("ready-button")!.hidden = true;
    setBestHandText(HANDS[bestHands[currentPlayer-1][0]]);
    if (currentPlayer <= totalPlayers - computerPlayers) {
      document.getElementById("warning-text")!.innerText = playerPrompts[currentPlayer - 1];
    }

    // If the current player is human, the current game is a lesson, and the user has move retracing enabled, the game state before the user's decision is made is saved.
    if (currentPlayer <= totalPlayers - computerPlayers && lessonNum && sessionStorage.getItem("moveRetracing") === "true") {
      let newState = stateEncoder.encode( // The state encoder ensures that the information is stored in such a way that it can rebuild the current game state at a later time.
        cards, foldedtotalPlayers, pot, potStartOfRound, playerBanks, playerBets, gameState, startingPlayer, currentPlayer, document.getElementById("play-text")!.innerText, playerPrompts);
      setPrevState(newState);
      if (startOfRoundStates[gameState] === "") {
        let newStartStates = startOfRoundStates;
        newStartStates[gameState] = newState;
        setStartOfRoundStates(newStartStates);
      }
    }
    
    if (currentPlayer > totalPlayers - computerPlayers) {
      computerCalc(playerProfiles![currentPlayer - ((totalPlayers - computerPlayers) + 1)], knownCards, currentPlayer, currentBet);
    }
  }

  function reversionPrompt() {
    // Displays the info box that appears after a human player has made their decision during lessons.
    let currentPlayerText = playerPrompts[currentPlayer - 1].split("\n\n");
    console.log("Prompt Array: " + currentPlayerText);
    document.getElementById("info-text")!.innerText = currentPlayerText[currentPlayerText.length - 2];
    if (sessionStorage.getItem("moveRetracing") === "true") {
      // The option to rewind the game to the before the user's decision was made should only be shown if the move retracing setting is enabled.
      document.getElementById("revert-button")!.hidden = false;
    }
    document.getElementById("info-box")!.hidden = false;
  }

  async function handlePromptBox() {
    // Dismissed the info box used to provide additional information to the user during lessons.
    document.getElementById("info-box")!.hidden = true;
    await sleep(1);

    //Ensurign that the correct cards are shown to the player.
    let knownCards = cards.slice(2 * (currentPlayer - 1), 2 * (currentPlayer - 1) + 2)
    if (gameState === 1) {
      knownCards.concat(cards.slice(-5, -2));
    } else if (gameState === 2) {
      knownCards.concat(cards.slice(-5, -1));
    } else if (gameState === 3) {
      knownCards.concat(cards.slice(-5, cards.length));
    }
    let bestHand = calcs.FindBestHand(knownCards);

    if (!preAction) { // If the current player has already made a decision during this turn, change players.
      ChangePlayer(currentPlayer);
    } else { // Otherwise, simply dismiss the info box and loading overlay to allow the user to act.
      handleLoadingFalse();
    }
  }

  function retrace(state: string) {
    // Changes the UI to represent the game state passed in as a parameter.

    /* In the specific case where, in a two player game with one human and one computer player,
    the computer player chooses to bet and immediately move the game to the flop round,
    the retracing button does not function without this first case. */
    if (gameState === 1 && state === "") { 
      setCards(cards);
      setFoldedtotalPlayers(new Array(totalPlayers).fill(0));
      setPot(0);
      setPotStartOfRound(0);
      setGameState(0);
      setStartingPlayer(startingPlayer);
      setCurrentPlayer(startingPlayer);
      setCurrentBet(0);
      document.getElementById("play-text")!.innerText = "";
      setPlayerPrompts(new Array(totalPlayers - computerPlayers).fill(""));
      setPreAction(true);
      hideCards(startingPlayer);
      handleLoadingFalse();
      SmallAndBigBlind(startingPlayer - 1, Array.from({length: totalPlayers}).map(bank=>STARTBANK));
    } else if (state !== "") {
      // Passing the string through the state encoder's decode function ensures that all the data required to display the new state is correctly formatted and the correct type.
      stateEncoder.decode(state);
      document.getElementById("info-box")!.hidden = true;

      // The new values for all of the required information can be retrieved from the state encoder's stored values.
      setCards(stateEncoder.getCards());
      setFoldedtotalPlayers(stateEncoder.getFoldedPlayers());
      setPot(stateEncoder.getPot());
      setPotStartOfRound(stateEncoder.getPotStartOfRound());
      setPlayerBanks(stateEncoder.getPlayerBanks());
      setPlayerBets(stateEncoder.getPlayerBets());
      setGameState(stateEncoder.getGameState());
      setStartingPlayer(stateEncoder.getStartingPlayer());
      setCurrentPlayer(stateEncoder.getCurrentPlayer());
      setCurrentBet(stateEncoder.getPlayerBets().reduce((x, y) => {if (x >= y) {return x} else {return y}}));
      document.getElementById("play-text")!.innerText = stateEncoder.getPlayText();
      setPlayerPrompts(stateEncoder.getWarningText());
      setPreAction(true);
      hideCards(currentPlayer);
      handleLoadingFalse();
    }
  }

  function loadingOverlayText() {
    // Changes the text on the loading overlay depending on if the user is in a lesson scenario or a local multiplayer game.
    if (lessonNum) {
      return "Next Player: " + playerOrBotText(currentPlayer);
    } else {
      return "Please pass to the next player...";
    }
  }

  function retraceText() {
    // Ensures that the button on the move retracing button is appropriate for the betting round that the game is currently in.
    let buttonText = "Back to ";
    let gameStateList = ["Preflop", "Flop", "Turn", "River"];
    if (gameState > 0) {
      buttonText += gameStateList[gameState - 1];
    }
    return buttonText;
  }

  function playerOrBotText(player: number) {
    // Determines whether or not the given player is a human player or computer and, if human, whether a name should be used in place of the generic player label.
    if (player === 1 && sessionStorage.getItem("name")) {
      return sessionStorage.getItem("name");
    } else if (player <= totalPlayers - computerPlayers) {
      return "Player " + player.toString();
    } else {
      return "BOT " + player.toString();
    }
  }

  function playerLabelText(player: number) {
    // Provides the text for the text associated with each player's bank.
    let output = playerOrBotText(player);
    output += ": £" + playerBanks[player - 1];
    return output;
  }

  function resetOrNextLesson() {
    /* Changes the function of a button on the UI. In a training lesson before the custom games, it will send the user to the next lesson.
    Otherwise, it will progress the game to the next round. */
    if (lessonNum && lessonNum < 11) {
      nav("/lessons/" + (lessonNum + 1).toString().padStart(2, "0"));
      window.location.reload();
    } else if (lessonNum && lessonNum === 11) {
      nav("/customgame");
    } else {
      Reset();
    }
  }

  function resetOrNextLessonText() {
    // Changes the text on the reset/next lesson button to match its purpose.
    if (lessonNum && lessonNum < 12) {
      return "Next Lesson";
    } else {
      return "Next Round";
    }
  }

  return (
    <LoadingOverlay active={loadingActive} text={loadingOverlayText()} spinner={false}>
      <div id="info-box" hidden={true}>
        <h2 id="info-text" style={{color: "#f5f8e7", display: "inline", margin:"0.5vw", fontSize:"calc(8px + 1vw)"}}></h2>
        <div>
          <button id="revert-button" className="hollow-button" type="button" hidden={true} onClick={() => retrace(prevState)}>Go Back</button>
          <button id="ok-button" className="hollow-button" type="button" onClick={() => handlePromptBox()}>OK</button>
        </div>
      </div>
      <div id="warning-reporter">
        <h1 id="warning-text" style={{padding:"0.5vw"}}/>
      </div>
      <div id="table">
        <button onClick={function() {HoleDeal(cards.slice(2 * (currentPlayer - 1), 2), startingPlayer); SmallAndBigBlind(startingPlayer - 1);}} className="solid-button" id="start-button" type="button">
          Start
        </button>
        <button onClick={() => resetOrNextLesson()} className="solid-button-no-dims" id="reset-button" type="button" hidden={true}>
          {resetOrNextLessonText()}
        </button>
        <button onClick={() => window.location.reload()} className="solid-button-no-dims" id="full-reset-button" type="button" hidden={true}>
          Restart Game
        </button>
        <button id="revert-by-round-button" className="hollow-button" type="button" hidden={true} onClick={() => retrace(startOfRoundStates[gameState - 1])}>{retraceText()}</button>
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
          {playerLabelText(1)}
        </h1>
        <h1 id="p2-stats" className=".player-stats">
          {playerLabelText(2)}
        </h1>
        <h1 id="p3-stats" className=".player-stats" hidden={playerBanks.length < 3}>
          {playerLabelText(3)}
        </h1>
        <h1 id="p4-stats" className=".player-stats" hidden={playerBanks.length < 4}>
          {playerLabelText(4)}
        </h1>
        <h1 id="p5-stats" className=".player-stats" hidden={playerBanks.length < 5}>
          {playerLabelText(5)}
        </h1>
        <h1 id="p6-stats" className=".player-stats" hidden={playerBanks.length < 6}>
          {playerLabelText(6)}
        </h1>
        <h1 id="p7-stats" className=".player-stats" hidden={playerBanks.length < 7}>
          {playerLabelText(7)}
        </h1>
        <h1 id="p8-stats" className=".player-stats" hidden={playerBanks.length < 8}>
          {playerLabelText(8)}
        </h1>
        <div id="decision-buttons">
          <button id="bet-button" className="solid-button" type="button" onClick={() => Bet()} hidden={true}>
            {betButtonText()}
          </button>
          <button id="raise-button" className="solid-button" type="button" onClick={() => Raise()} disabled={playerBanks[currentPlayer - 1] === 0} hidden={true}>
            {raiseButtonText()}
          </button>
          <button id="fold-button" className="solid-button" type="button" onClick={() => Fold()} disabled={playerBanks[currentPlayer - 1] === 0} hidden={true}>
            Fold
          </button>  
        </div>
        <h1 id="winner-text" hidden={true} style={{display:"inline-block", position:"absolute", left:"50px", bottom:"50px"}}/>
        <h1 id="pot">Pot = £{pot}</h1>
      </div>
      <div id="play-reporter">
        <h1 id="play-text" style={{padding:"0.5vw"}}></h1>
      </div>
      <div >
        <h1 id="best-hand" style={{color: "#f5f8e7", display: "inline"}}>{bestHandText} </h1>
        <button id="ready-button" hidden={true} className="hollow-button" type="button" onClick={() => showCards()} style={{marginLeft: "1vw"}}>Ready</button>
      </div>
    </LoadingOverlay>
  );
}

export default Board;