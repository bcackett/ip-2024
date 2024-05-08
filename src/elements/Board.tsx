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
import { exec } from "child_process";

type roomSize = {
  totalPlayers: number;
  computerPlayers: number;
  playerProfiles?: number[][];
  lessonNum?: number;
}

function Board({totalPlayers, computerPlayers, playerProfiles, lessonNum} : roomSize) {
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
  const [pastPlayerPerformance, setPastPlayerPerformance] = useState(0);
  const [currentPlayerPrediction, setCurrentPlayerPrediction] = useState(0);
  const [gameState, setGameState] = useState(-1); //0 = preflop, 1 = flop, 2 = turn, 3 = river, 4 = winner, -1 = error
  const [loadingActive, setLoadingActive] = useState(false);
  const [winner, setWinner] = useState(0);
  const [p1InitialBank, setP1InitialBank] = useState(200)
  const [prevState, setPrevState] = useState("");
  const [startOfRoundStates, setStartOfRoundStates] = useState(new Array(5).fill(""));
  const [preAction, setPreAction] = useState(true);
  const handleLoadingFalse = useCallback(() => setLoadingActive(false), []);
  const handleLoadingTrue = useCallback(() => setLoadingActive(true), []);
  useEffect(() => {setCurrentPlayer(winner)}, [winner]);
  useEffect(() => {
    if (gameState >= 0) {
      // document.getElementById("hole-card-one")!.hidden = false;
      // document.getElementById("hole-card-two")!.hidden = false; 
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
  const resetBets = useCallback(() => {setPlayerBets(new Array(totalPlayers).fill(0))}, []); 
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // const [blindStage, setBlindStage] = useState(true);

  async function getPastPlayerPerformance() {
    if (sessionStorage.getItem("userID")) {
      const {data, error} = await supabase.from("results").select("result").eq("userID", Number(sessionStorage.getItem("userID")));
      if (error) throw error;
      if (data.length !== 0) {
        setPastPlayerPerformance(data.map(x => x.result).reduce((x,y) => x + y));
      }
    }
  }

  async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  
  getPastPlayerPerformance();

  
  function runLLM() {
    exec("python3 messageGen.py", (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
      } else if (stderr) {
        console.log(`stderr: ${stderr}`)
      } else {
        console.log(stdout);
      }
    })
  }

  function HoleDeal(visibleCards: number[], playerNum: number) {
    document.getElementById("hole-card-one")!.hidden = false;
    document.getElementById("hole-card-two")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    document.getElementById("start-button")!.hidden = true;
    let bestHand = FindBestHand(visibleCards, playerNum);
    setGameState(0);
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
    setGameState(1);
  }
  
  function TurnDeal(cards: number[], playerNum: number) {
    document.getElementById("turn-card")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards, playerNum);
    setCurrentBet(0);
    setGameState(2);
  }
  
  function RiverDeal(cards:number[], playerNum: number) {
    document.getElementById("river-card")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards, playerNum);
    setCurrentBet(0);
    setGameState(3);
  }
  
  function FindBestHand(cards: number[], playerNum: number) {
    /*Returns value of best hand (0 for high card -> 9 for royal flush), followed by values of cards in best hand.
    Eg: [9, 59, 58, 57, 56, 55] = royal flush with spades. */

    // document.getElementById("best-hand")!.innerText = bestHand.toString();
    // setBestHandText(bestHand.toString())
    // document.getElementById("best-hand")!.innerText = hands[bestHand[0]];
    let cardsCopy: number[] = [];
    cards.forEach(card => {
      cardsCopy.push(card);
    });
    let bestHand = calcs.FindBestHand(cardsCopy);
    setBestHandText(HANDS[bestHand[0]]);
    let newBestHands = bestHands;
    newBestHands[playerNum - 1] = bestHand;
    setBestHands(newBestHands);
  }
  
  function Reset() {
    deck.Shuffle();
    setP1InitialBank(playerBanks[0]);
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
    let newStartingPlayer = startingPlayer.valueOf() + 1;
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
    getPastPlayerPerformance();
  }

  function ImmediateNewCard(newPlayerNum: number, nestedCurrentPlayer?: number, nestedCurrentBet?: number) {
    resetBets();
    console.log("Player Bets on New Card:" + playerBets);
    let knownCards: number[] = [];
    if (nestedCurrentPlayer) {
      document.getElementById("p" + nestedCurrentPlayer +"-stats")!.classList.remove("glow");
    } else {
      document.getElementById("p" + currentPlayer +"-stats")!.classList.remove("glow");
    }
    document.getElementById("p" + newPlayerNum +"-stats")!.classList.add("glow");
    if (/*document.getElementById("flop-card-one")!.hidden === true*/gameState === 0) {
      knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -2));
      FlopDeal(knownCards, newPlayerNum);
    } else if (/*document.getElementById("turn-card")!.hidden === true*/gameState === 1) {
      knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -1));
      TurnDeal(cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -1)), newPlayerNum);
    } else if (/*document.getElementById("river-card")!.hidden === true*/gameState === 2) {
      knownCards = cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, cards.length));
      RiverDeal(knownCards, newPlayerNum);
    } else {
      DisplayWinner(CalculateWinner(), nestedCurrentBet);
    }
    return knownCards;
  }

  async function ChangePlayer(nestedCurrentPlayer?: number, nestedCurrentBet?: number, lastPlayer?: number) {
    handleLoadingTrue();
    setPreAction(true);
    if (foldedtotalPlayers.filter(p => p === 0).length === 1 || (Array.from(new Set(playerBanks)).length === 1 && playerBanks[0] === 0)) {
      let winner = foldedtotalPlayers.indexOf(0) + 1;
      DisplayWinner([winner], nestedCurrentBet);
    } else {
      let newPlayerNum: number;
      let oldPlayerNum: number;
      let newCurrentBet: number;
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
      let firstPlayer = foldedtotalPlayers.indexOf(0) + 1;
      let foldedPlayerIndices = Array.from(foldedtotalPlayers.keys());
      let orderedFoldedPlayers = foldedPlayerIndices.slice(startingPlayer - 1).concat(foldedPlayerIndices.slice(0, startingPlayer - 2))
      let trueStartingPlayer = orderedFoldedPlayers[0] + 1;
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

      if (((newPlayerNum === trueStartingPlayer && uniqueBets[0] === 0 && cycleComplete === true) || uniqueBets[0] !== 0)  && uniqueBets.length === 1) {
        if (!(lastPlayer && lastPlayer === newPlayerNum)) {
          newCard = true;
        }
      }

      let knownCards: number[] = [];
      if (newCard === true) {
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
      } else {
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
        // let glowing = document.getElementsByClassName("glow");
        // for (let i = 0; 9 < glowing.length; i++) {
        //   glowing[i].classList.remove("glow");
        // }
      }
      if (knownCards.length !== 0) {
        setCurrentPlayer(newPlayerNum);
        hideCards(newPlayerNum);
        if (newPlayerNum <= totalPlayers - computerPlayers) {
          await sleep(3000);
          setCurrentPlayerPrediction(humanSimCalc(newPlayerNum, knownCards, newCurrentBet));
        }
        // if (newPlayerNum > totalPlayers - computerPlayers) {
        //   computerCalc(playerProfiles![newPlayerNum - 2], knownCards, newPlayerNum, newCurrentBet);
        // } else {
        //   hideCards(newPlayerNum);
        //   await sleep(3000);
        //   setCurrentPlayerPrediction(humanSimCalc(newPlayerNum, knownCards, newCurrentBet));
        // }
      }
    }
    handleLoadingFalse();
  }

  function humanSimCalc(playerNum: number, allCards: number[], newCurrentBet: number) {
    console.log("Human player past performance: " + pastPlayerPerformance);
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
    console.log("GameState " + gameState);
    let playerCards = [allCards[0], allCards[1]];
    let communalCards: number[] = [];
    if (allCards.length > 2) {
      for (let i = 2; i < allCards.length; i++) {
        communalCards = communalCards.concat(allCards[i]);
      }
    }
    let randomDecisionValue = Math.random() * 100;
    if (randomDecisionValue < playerProfile[2]) {
      randomDecisionValue = Math.floor(Math.random() * 100);
      if (randomDecisionValue < (10 - playerProfile[0]/10) && gameState >= 1) {
        Fold(playerNum);
      } else if (randomDecisionValue < (50 - playerProfile[0]/10) || playerBanks[playerNum - 1] === 0) {
        Bet(playerNum, newCurrentBet);
      } else if (randomDecisionValue < (80 - playerProfile[0]/10)) {
        Raise(Math.min(newCurrentBet + 10, playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
      } else {
        Raise(Math.min(newCurrentBet + 10 + (randomDecisionValue - 60), playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
      }
    } else if (playerBanks[playerNum - 1] === 0) {
      Bet(playerNum, newCurrentBet);
    } else {
      let effectiveHandScore = calcs.decisionCalc(playerCards, communalCards);
      // let nashEquilibrium = Calculations.nashEq(cards);
      if (effectiveHandScore < (0.1 - playerProfile[0] / 1000)) {
        if (randomDecisionValue >= playerProfile[1] && gameState >= 1) {
          Fold(playerNum);
        } else {
          Raise(Math.min(newCurrentBet + 30 + Math.floor(playerProfile[0] / 5), playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
        }
      } else if (effectiveHandScore > (0.75 - playerProfile[0] / 1000)) {
        Raise(Math.min(newCurrentBet + 10 + Math.floor(playerProfile[0] / 5), playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
      } else {
        if (randomDecisionValue >= playerProfile[1]) {
          Bet(playerNum, newCurrentBet);
        } else {
          Raise(Math.min(newCurrentBet + 10 + Math.floor(playerProfile[0] / 5), playerBets[playerNum - 1] + playerBanks[playerNum - 1]), playerNum, newCurrentBet);
        }
      }
    }
  }

  function Raise(raise?: number, playerNum?: number, nestedCurrentBet?: number) {
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
    if (!raise) {
      if (playerBanks[currentPlayerNum - 1] !== 0) {
        nullableAmount = window.prompt("What would you like to raise the bet to?");
        amount = Number(nullableAmount);
        while (nullableAmount !== null && (amount > (playerBanks[currentPlayerNum - 1] + playerBets[currentPlayerNum - 1]) || amount <= newCurrentBet)) {
          nullableAmount = window.prompt("What would you like to raise the bet to?");
          amount = Number(nullableAmount);
        }
        if (nullableAmount !== null) {
          if (currentPlayerNum <= totalPlayers - computerPlayers) {
            let newPlayerPrompts = playerPrompts;
            if (document.getElementById("flop-card-one")!.hidden) {
              if (currentPlayerPrediction === 0) {
                newPlayerPrompts[currentPlayerNum - 1] += "Are you sure about this? It might be safer to fold on this hand.\n\n";
              } else if (currentPlayerPrediction === 0.5) {
                newPlayerPrompts[currentPlayerNum - 1] += "Raising could be risky here. Just calling might be safer.\n\n";
              } else {
                newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
              }
            } else if (pastPlayerPerformance < 0) {
              if (currentPlayerPrediction < 0.3) {
                newPlayerPrompts[currentPlayerNum - 1] += "Are you sure about this? It might be safer to fold on this hand.\n\n";
              } else if (currentPlayerPrediction < 0.8) {
                newPlayerPrompts[currentPlayerNum - 1] += "Are you sure about this? It might be safer to " + betButtonText()!.toString().toLowerCase() + ".\n\n";
              } else {
                newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
              }
            } else if (pastPlayerPerformance >= 50) {
              if (currentPlayerPrediction < 0.1) {
                newPlayerPrompts[currentPlayerNum - 1] += "This is a particularly weak hand. You could wait to see if it improves, but it could be worth folding this time.\n\n";
              } else if (currentPlayerPrediction < 0.5 && newCurrentBet > BIGBLIND) {
                newPlayerPrompts[currentPlayerNum - 1] += "The bet has already gone up. Your hand is ok, but is it worth risking betting any more? It might be safer to " + betButtonText()!.toString().toLowerCase() + "\n\n";
              } else if (currentPlayerPrediction < 0.7 && newCurrentBet > 3*BIGBLIND) {
                newPlayerPrompts[currentPlayerNum - 1] += "The bet is already quite high. You have a pretty strong hand, but are you sure you want to push it further?\n\n";
              } else {
                newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
              }
            } else {
              if (currentPlayerPrediction < 0.2) {
                newPlayerPrompts[currentPlayerNum - 1] += "This is a particularly weak hand. You could wait to see if it improves, but it could be worth folding this time.\n\n";
              } else if (currentPlayerPrediction < 0.5) {
                newPlayerPrompts[currentPlayerNum - 1] += "Your hand is ok, but is it worth risking betting any more? It might be safer to " + betButtonText()!.toString().toLowerCase() + "\n\n";
              } else if (currentPlayerPrediction < 0.7 && newCurrentBet > BIGBLIND) {
                newPlayerPrompts[currentPlayerNum - 1] += "The bet has already gone up. You have a pretty strong hand, but are you sure you want to push it further?\n\n";
              } else {
                newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
              }
            }
            runLLM();
            setPlayerPrompts(newPlayerPrompts);
            document.getElementById("warning-text")!.innerText = newPlayerPrompts[currentPlayerNum - 1];
            document.getElementById("warning-reporter")!.scrollTop = document.getElementById("warning-reporter")!.scrollHeight;
          }
          // amount = currentBet + newRaise;
        }
      }
    } else {
      amount = raise;
      // amount = nestedCurrentBet! + newRaise;
    }
    if (nullableAmount !== null) {
      // amount = newCurrentBet + newRaise;
      newBanks[currentPlayerNum - 1] -= (amount - newBets[currentPlayerNum - 1]);
      newBets[currentPlayerNum - 1] += (amount - newBets[currentPlayerNum - 1]);
      document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " raised the bet to £" + amount +".\n\n";
      setCurrentBet(amount);
      setPlayerBanks(newBanks);
      setPlayerBets(newBets);
      setPot(potStartOfRound + newBets.reduce((x,y) => x + y));
      console.log("Player Bets on Raise:" + playerBets +". This was for player" + currentPlayerNum);
      // setPot(pot + amount);
      document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
      if (lessonNum && gameState >= 0 && currentPlayerNum <= totalPlayers - computerPlayers) {
        handleLoadingTrue();
        reversionPrompt();
      } else {
        // if (playerNum) {
        //   ChangePlayer(playerNum, amount);
        // } else {
        //   ChangePlayer();
        // }
        ChangePlayer(currentPlayerNum, amount);
      }
    }
  }

  function Bet(playerNum?: number, bet?: number) {
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
    if (playerBanks[currentPlayerNum - 1] !== 0) {
      console.log("Current Player Num: " + currentPlayerNum.toString())
      if (currentPlayerNum <= totalPlayers - computerPlayers) {
        let newPlayerPrompts = playerPrompts;
        if (document.getElementById("flop-card-one")!.hidden) {
          if (currentPlayerPrediction === 0) {
            newPlayerPrompts[currentPlayerNum - 1] += "Are you sure about this? It might be safer to fold on this hand.\n\n";
          } else if (currentPlayerPrediction === 1) {
            newPlayerPrompts[currentPlayerNum - 1] += "Are you sure you don't want to raise? This is a very strong start.\n\n";
          } else {
            newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
          }
        } else if (pastPlayerPerformance < 0) {
          if (currentPlayerPrediction < 0.2) {
            newPlayerPrompts[currentPlayerNum - 1] += "Are you sure about this? It might be safer to fold on this hand.\n\n";
          } else if (currentPlayerPrediction >= 0.8) {
            newPlayerPrompts[currentPlayerNum - 1] += "Are you sure about this? You have a good hand, so you could " + raiseButtonText()!.toString().toLowerCase() + ".\n\n";
          } else {
            newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
          }
        } else if (pastPlayerPerformance >= 50) {
          console.log("Prediction: " + currentPlayerPrediction);
          if (currentPlayerPrediction < 0.1) {
            newPlayerPrompts[currentPlayerNum - 1] += "This is a particularly weak hand. You could wait to see if it improves, but it could be worth folding this time.\n\n";
          } else if (currentPlayerPrediction >= 0.7 && currentPlayerBet <= 1.5*BIGBLIND) {
            newPlayerPrompts[currentPlayerNum - 1] += "You have a very strong hand with an opportunity to " + raiseButtonText()!.toString().toLowerCase() + " big and put a lot of pressure on the other players. Are you sure you don't want to try that?\n\n";
          } else if (playerBets.find(x => x > 2*BIGBLIND) === -1) {
            newPlayerPrompts[currentPlayerNum - 1] += "You have an opportunity to " + raiseButtonText()!.toString().toLowerCase() + " as a bluff here if you want to take it!\n\n";
          } else {
            newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
          }
        } else {
          if (currentPlayerPrediction < 0.2) {
            newPlayerPrompts[currentPlayerNum - 1] += "This is a particularly weak hand. You could wait to see if it improves, but it could be worth folding this time.\n\n";
          } else if (currentPlayerPrediction >= 0.9 && currentPlayerBet <= 1.5*BIGBLIND) {
            newPlayerPrompts[currentPlayerNum - 1] += "You have a very strong hand with an opportunity to raise big and put a lot of pressure on the other players. Are you sure you don't want to try that?\n\n";
          } else if (currentPlayerPrediction >= 0.7 && currentPlayerBet <= BIGBLIND) {
            newPlayerPrompts[currentPlayerNum - 1] += "You could " + raiseButtonText()!.toString().toLowerCase() + " and go for some bigger winnings here. Are you sure you don't want to try that?\n\n";
          } else if (currentPlayerPrediction >= 0.5 && playerBets.find(x => x > 2*BIGBLIND) === -1) {
            newPlayerPrompts[currentPlayerNum - 1] += "You have an opportunity to " + raiseButtonText()!.toString().toLowerCase() + " as a bluff here if you want to take it!\n\n";          
          } else {
            newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
          }
        }
        runLLM();
        setPlayerPrompts(newPlayerPrompts);
        document.getElementById("warning-text")!.innerText = newPlayerPrompts[currentPlayerNum - 1];
        document.getElementById("warning-reporter")!.scrollTop = document.getElementById("warning-reporter")!.scrollHeight;
      }
      if (currentPlayerBet === 0) {
        document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " checked.\n\n";
      } else {
        let newBanks = playerBanks;
        let newBets = playerBets;
        let betDiff = currentPlayerBet - newBets[currentPlayerNum - 1];
        // if (blindStage && (currentPlayerNum === startingPlayer || totalPlayers === 2 && currentPlayerNum !== startingPlayer)) {
        //   currentPlayerBet -= BIGBLIND/2;  
        // }
        
        newBanks[currentPlayerNum - 1] -= betDiff;
        newBets[currentPlayerNum - 1] += betDiff;
        setPlayerBanks(newBanks);
        setPlayerBets(newBets);
        setPot(potStartOfRound + newBets.reduce((x,y) => x + y));
        console.log("Player Bets on Bet:" + playerBets +". This was for player" + currentPlayerNum);
        // setPot(pot + currentPlayerBet);
        document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " bet £" + currentPlayerBet + ".\n\n";
      }
    } else {
      document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " checked.\n\n";
    }
    document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
    if (lessonNum && gameState >= 0 && currentPlayerNum <= totalPlayers - computerPlayers) {
      handleLoadingTrue();
      reversionPrompt();
    } else {
      // if (playerNum) {
      //   ChangePlayer(playerNum, currentPlayerBet);
      // } else {
      //   ChangePlayer();
      // }
      console.log("CURRENT PLAYER AFTER BET: " + currentPlayerNum.toString());
      ChangePlayer(currentPlayerNum, currentPlayerBet);
    }
  }

  function Fold(playerNum?: number) {
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
      let newPlayerPrompts = playerPrompts;
      document.getElementById("warning-text")!.innerText += "Player " + currentPlayerNum + ": ";
      if (document.getElementById("flop-card-one")!.hidden) {
        if (currentPlayerPrediction === 0.5) {
          newPlayerPrompts[currentPlayerNum - 1] += "Are you sure about this? You could call and see how this plays out.\n\n";
        } else if (currentPlayerPrediction === 1) {
          newPlayerPrompts[currentPlayerNum - 1] += "Are you sure you don't want to raise? This is a very strong start.\n\n";
        } else {
          newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
        }
      } else if (pastPlayerPerformance < 0) {
        if (currentPlayerPrediction >= 0.2) {
          newPlayerPrompts[currentPlayerNum - 1] += "Folding could be a mistake here, you have a reasonable hand.\n\n";
        } else {
          newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
        }
      } else if (pastPlayerPerformance >= 50) {
        if (currentPlayerPrediction >= 0.1) {
          newPlayerPrompts[currentPlayerNum - 1] += "Folding could be a mistake here, you have a reasonable hand.\n\n";
        } else {
          newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
        }
      } else {
        if (currentPlayerPrediction >= 0.2) {
          newPlayerPrompts[currentPlayerNum - 1] += "Folding could be a mistake here, you have a reasonable hand.\n\n";
        } else {
          newPlayerPrompts[currentPlayerNum - 1] += "Good decision!\n\n";
        }
      }
      runLLM();
      setPlayerPrompts(newPlayerPrompts);
      document.getElementById("warning-text")!.innerText = newPlayerPrompts[currentPlayerNum - 1];
      document.getElementById("warning-reporter")!.scrollTop = document.getElementById("warning-reporter")!.scrollHeight;
    }
    newFoldedtotalPlayers[currentPlayerNum - 1] = 1;
    newBestHands[currentPlayerNum - 1] = new Array(6).fill(0);
    setFoldedtotalPlayers(newFoldedtotalPlayers);
    setBestHands(newBestHands);
    document.getElementById("play-text")!.innerText += playerOrBotText(currentPlayerNum) + " folded.\n\n";
    document.getElementById("play-reporter")!.scrollTop = document.getElementById("play-reporter")!.scrollHeight;
    if (lessonNum && gameState >= 0 && currentPlayerNum <= totalPlayers - computerPlayers) {
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

  function SmallAndBigBlind(nextPlayer: number) {
    if (nextPlayer <= 0) {
      nextPlayer = totalPlayers;
    }
    let smallBlindPlayer = nextPlayer;
    document.getElementById("p" + nextPlayer + "-stats")?.classList.remove("glow");
    let newBanks = playerBanks;
    let newBets = playerBets;
    document.getElementById("play-text")!.innerText += playerOrBotText(nextPlayer) + " bet " + BIGBLIND/2 + " as the small blind.\n\n"
    newBanks[nextPlayer - 1] -= BIGBLIND / 2;
    newBets[nextPlayer - 1] += BIGBLIND / 2;
    nextPlayer += 1;
    if (nextPlayer > totalPlayers) {
      nextPlayer = 1;
    }
    document.getElementById("play-text")!.innerText += playerOrBotText(nextPlayer) + " bet " + BIGBLIND + " as the big blind.\n\n"
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
    if (nextPlayer !== smallBlindPlayer) {
      setCurrentBet(BIGBLIND);
    } else {
      setCurrentBet(BIGBLIND);
    }
    let newPot = 0;
    newPot += pot + BIGBLIND + BIGBLIND/2;
    setPot((pot) => {return pot + BIGBLIND + BIGBLIND/2});
    console.log("Player Banks on Small & Big Blind: " + playerBanks.toString());
    hideCards(nextPlayer);
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

  async function DisplayWinner(playerNums: number[], finalActionBet?: number) {
    if (playerNums.length === 1 && bestHands[playerNums[0] - 1][0]) {
      document.getElementById("play-text")!.innerText += "Player " + playerNums[0] + " wins the pot with a " + HANDS[bestHands[playerNums[0] - 1][0]] + "!\n";
    } else if (playerNums.length === 1) {
      let cardsCopy: number[] = [];
      cards.forEach(card => {
        cardsCopy.push(card);
      });
      let bestHand = HANDS[calcs.FindBestHand(cardsCopy.slice(2 * (playerNums[0] - 1), 2 * (playerNums[0] - 1) + 2))[0]];
      document.getElementById("play-text")!.innerText += "Player " + playerNums[0] + " wins the pot with a " + bestHand + "!\n";
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
    document.getElementById("ready-button")!.hidden = true;
    document.getElementById("revert-by-round-button")!.hidden = true;
    
    for (let i = 1; i <= totalPlayers; i++) {
      document.getElementById("p" + i +"-stats")!.classList.remove("glow");
      if (playerNums.includes(i)) {
        document.getElementById("p" + i +"-stats")!.classList.add("winner-glow");
      }
    }
    let newBanks = playerBanks;
    console.log("Final Banks: " + newBanks.toString());
    let newPot = pot;
    if (finalActionBet) {
      newPot += finalActionBet;
    }
    playerNums.forEach(playerNum => {
      newBanks[playerNum - 1] += newPot/playerNums.length;
    });

    if (computerPlayers === 0 && sessionStorage.getItem("userID")) {
      let e1 = await supabase.from("results").select("gameID").order("gameID", {ascending: false}).limit(1).single();
      if (e1.error) {
        throw e1.error;
      } else {
        let winnings = newBanks[0] - p1InitialBank;
        let e2 = await supabase.from("results").insert({userID: Number(sessionStorage.getItem("userID")), gameID:e1.data.gameID + 1, result: winnings});
        if (e2.error) {throw e2.error};
      }
    }

    if (lessonNum && sessionStorage.getItem("userID")) {
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
    if (currentBet === 0 || playerBanks[currentPlayer - 1] === 0) {
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

  function hideCards(nextPlayer: number) {
    document.getElementById("warning-text")!.hidden = false;
    document.getElementById("raise-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    document.getElementById("bet-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    document.getElementById("hole-card-one")!.hidden = true;
    document.getElementById("hole-card-two")!.hidden = true;
    document.getElementById("revert-by-round-button")!.hidden = true;
    // document.getElementById("flop-card-one")!.hidden = true;
    // document.getElementById("flop-card-two")!.hidden = true;
    // document.getElementById("flop-card-three")!.hidden = true;
    // document.getElementById("turn-card")!.hidden = true;
    // document.getElementById("river-card")!.hidden = true;
    document.getElementById("ready-button")!.hidden = false;
    setBestHandText(playerOrBotText(nextPlayer) + "'s Turn: Ready?");
  }

  function showCards() {
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
      knownCards.concat(cards.slice(-5, -2));
      if (lessonNum && sessionStorage.getItem("moveRetracing") === "true") {
        document.getElementById("revert-by-round-button")!.hidden = false;
      }
    }
    if (gameState > 1) {
      document.getElementById("turn-card")!.hidden = false;
      knownCards.concat(cards[-1]);
    }
    if (gameState > 2) {
      document.getElementById("river-card")!.hidden = false;
      knownCards.concat(cards[cards.length]);
    }
    document.getElementById("ready-button")!.hidden = true;
    setBestHandText(HANDS[bestHands[currentPlayer-1][0]]);
    if (currentPlayer <= totalPlayers - computerPlayers) {
      document.getElementById("warning-text")!.innerText = playerPrompts[currentPlayer - 1];
    }

    if (currentPlayer <= totalPlayers - computerPlayers && lessonNum && sessionStorage.getItem("moveRetracing") === "true") {
      let newState = stateEncoder.encode(
        cards, foldedtotalPlayers, pot, potStartOfRound, playerBanks, playerBets, gameState, startingPlayer, currentPlayer, document.getElementById("play-text")!.innerText, playerPrompts);
      setPrevState(newState);
      if (startOfRoundStates[gameState] === "") {
        let newStartStates = startOfRoundStates;
        newStartStates[gameState] = newState;
        setStartOfRoundStates(newStartStates);
      }
    }
    
    if (lessonNum && teachingText.returnTargetPrompt(lessonNum, gameState) && currentPlayer <= totalPlayers - computerPlayers && sessionStorage.getItem("lessonText") === "true") {
      document.getElementById("bet-button")!.hidden = true;
      document.getElementById("raise-button")!.hidden = true;
      document.getElementById("fold-button")!.hidden = true;
      document.getElementById("info-text")!.innerText = teachingText.returnTargetPrompt(lessonNum, gameState);
      if (lessonNum === 9 && gameState === 0 && playerProfiles![0][0] === 80) {
        document.getElementById("info-text")!.innerText += "This player is aggressive."
      } else if (lessonNum === 9 && gameState === 0 && playerProfiles![0][1] === 80) {
        document.getElementById("info-text")!.innerText += "This player is likely to bluff."
      } else if (lessonNum === 9 && gameState === 0 && playerProfiles![0][2] === 40)  {
        document.getElementById("info-text")!.innerText += "This player can be unpredictable, but is otherwise honest."
      } else if (lessonNum === 9 && gameState === 0) {
        document.getElementById("info-text")!.innerText += "This player is cautious."
      }
      document.getElementById("revert-button")!.hidden = true;
      document.getElementById("info-box")!.hidden = false;
    } else if (currentPlayer > totalPlayers - computerPlayers) {
      computerCalc(playerProfiles![currentPlayer - 2], knownCards, currentPlayer, currentBet);
    }
  }

  function reversionPrompt() {
    let currentPlayerText = playerPrompts[0].split("\n\n");
    document.getElementById("info-text")!.innerText = currentPlayerText[currentPlayerText.length - 2];
    if (sessionStorage.getItem("moveRetracing") === "true") {
      document.getElementById("revert-button")!.hidden = false;
    }
    document.getElementById("info-box")!.hidden = false;
  }

  async function handlePromptBox() {
    document.getElementById("info-box")!.hidden = true;
    await sleep(1);
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    // let newPrevStates = prevStates;
    // newPrevStates[gameState] = stateEncoder.encode(cards, foldedtotalPlayers, pot, potStartOfRound, playerBanks, playerBets, gameState, startingPlayer, currentPlayer)
    // setPrevStates(newPrevStates);
    let knownCards = cards.slice(2 * (currentPlayer - 1), 2 * (currentPlayer - 1) + 2)
    if (gameState === 1) {
      knownCards.concat(cards.slice(-5, -2));
    } else if (gameState === 2) {
      knownCards.concat(cards.slice(-5, -1));
    } else if (gameState === 3) {
      knownCards.concat(cards.slice(-5, cards.length));
    }
    let bestHand = calcs.FindBestHand(knownCards);
    if (!preAction) {
      ChangePlayer(currentPlayer);
    } else {
      setBestHandText(HANDS[bestHand[0]]);
    }
  }

  function retrace(state: string) {
    if (state !== "") {
      stateEncoder.decode(state);
      document.getElementById("info-box")!.hidden = true;
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
      // let newPlayText = document.getElementById("play-text")!.innerText.split("\n\n");
      // let newPlayerPrompts = playerPrompts;
      // let changedPrompt = "";
      // let newWarningText = playerPrompts[currentPlayer - 1].split("\n\n")
      // document.getElementById("play-text")!.innerText = "";
      // document.getElementById("warning-text")!.innerText = "";
      // for (let i = 0; i < newPlayText.length - 2; i++) {
      //   document.getElementById("play-text")!.innerText += newPlayText[i] + "\n\n";
      // }
      // for (let i = 0; i < newWarningText.length - 2; i++) {
      //   changedPrompt += newWarningText[i] + "\n\n";
      // }
      // newPlayerPrompts[currentPlayer - 1] = changedPrompt;
      // if (setGameState(stateEncoder.getGameState())! < gameState) {
      //   let newStartOfRoundStates = startOfRoundStates;
      //   newStartOfRoundStates[gameState] = "";
      //   setStartOfRoundStates(newStartOfRoundStates);
      // }
      // setPlayerPrompts(newPlayerPrompts);
      setPreAction(true);
      hideCards(currentPlayer);
      handleLoadingFalse();
    }
  }

  function loadingOverlayText() {
    if (lessonNum) {
      return "Next Player: " + playerOrBotText(currentPlayer);
    } else {
      return "Please pass to the next player...";
    }
  }

  function retraceText() {
    let buttonText = "Back to ";
    let gameStateList = ["Preflop", "Flop", "Turn", "River"];
    if (gameState > 0) {
      buttonText += gameStateList[gameState - 1];
    }
    return buttonText;
  }

  function playerOrBotText(player: number) {
    if (player === 1 && sessionStorage.getItem("name")) {
      return sessionStorage.getItem("name");
    } else if (player <= totalPlayers - computerPlayers) {
      return "Player " + player.toString();
    } else {
      return "BOT " + player.toString();
    }
  }

  function playerLabelText(player: number) {
    let output = playerOrBotText(player);
    output += ": £" + playerBanks[player - 1];
    return output;
  }

  return (
    <LoadingOverlay active={loadingActive} text={loadingOverlayText()} spinner={false}>
      <div id="info-box" hidden={true}>
        <h2 id="info-text" style={{color: "#f5f8e7", display: "inline", margin:"0.5vw"}}></h2>
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
        <button onClick={() => Reset()} className="solid-button" id="reset-button" type="button" hidden={true}>
          Next Round
        </button>
        <button onClick={() => window.location.reload()} className="solid-button" id="full-reset-button" type="button" hidden={true}>
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
      {/* <h1 style={{color: "#f5f8e7"}}>{cards.map(card => {if (Math.floor(card / 15) === 0) {
    return card%15 + "H"; //Hearts
  } else if (Math.floor(card / 15) === 1) {
    return card%15 + "D"; //Diamonds
  } else if (Math.floor(card / 15) === 2) {
    return card%15 + "C"; //Clubs
  } else {
    return card%15 + "S"; //Spades
  }}).toString()}</h1> */}
      <div >
        <h1 id="best-hand" style={{color: "#f5f8e7", display: "inline"}}>{bestHandText} </h1>
        <button id="ready-button" hidden={true} className="hollow-button" type="button" onClick={() => showCards()} style={{marginLeft: "1vw"}}>Ready</button>
      </div>
    </LoadingOverlay>
  );
}

export default Board;