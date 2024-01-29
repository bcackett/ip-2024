import { table } from "console";
import Card from "./Card";
import Deck from "./Deck";
import { useState } from "react";

type roomSize = {
  players: number;
}

function Board({players} : roomSize) {
  var deck: Deck = new Deck;
  deck.Shuffle();
  const STARTBANK = 200;
  // const [cards, setCards] = useState(deck.Deal(players));
  const [cards, setCards] = useState(deck.Deal(players));
  const [startingPlayer, setStartingPlayer] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const[playerBanks, setPlayerBanks] = useState(Array.from({length: players}).map(bank=>STARTBANK));
  const [currentBet, setCurrentBet] = useState(10);
  const [bestHandText, setBestHandText] = useState("");
  const [foldedPlayers, setFoldedPlayers] = useState(new Array(players).fill(0));
  const [pot, setPot] = useState(0);

  function HoleDeal(cards: number[]) {
    document.getElementById("hole-card-one")!.hidden = false;
    document.getElementById("hole-card-two")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    document.getElementById("start-button")!.hidden = true;
    let bestHand = FindBestHand(cards);
    setCurrentBet(10);
  }
  
  function FlopDeal(cards: number[]) {
    document.getElementById("flop-card-one")!.hidden = false;
    document.getElementById("flop-card-two")!.hidden = false;
    document.getElementById("flop-card-three")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards);
    setCurrentBet(10);
  }
  
  function TurnDeal(cards: number[]) {
    document.getElementById("turn-card")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards);
    setCurrentBet(10);
  }
  
  function RiverDeal(cards:number[]) {
    document.getElementById("river-card")!.hidden = false;
    document.getElementById("bet-button")!.hidden = false;
    document.getElementById("raise-button")!.hidden = false;
    document.getElementById("fold-button")!.hidden = false;
    let bestHand = FindBestHand(cards);
    setCurrentBet(10);
  }
  
  function CheckForSameSuit(cards: number[]) {
    let cardsOfSameSuit: number[] = [];
    let hearts = cards.filter(function(card) {return Math.floor(card / 15) === 0});
    let diamonds = cards.filter(function(card) {return Math.floor(card / 15) === 1});
    let clubs = cards.filter(function(card) {return Math.floor(card / 15) === 2});
    let spades = cards.filter(function(card) {return Math.floor(card / 15) === 3});
    let allSortedSuits = [hearts, diamonds, clubs, spades];
    let sortedSuitLengths = allSortedSuits.map(suit => suit.length);
    if (sortedSuitLengths[sortedSuitLengths.indexOf(Math.max(hearts.length, diamonds.length, clubs.length, spades.length))] >= 5) {
      cardsOfSameSuit = [1].concat(allSortedSuits[sortedSuitLengths.indexOf(Math.max(hearts.length, diamonds.length, clubs.length, spades.length))]);
      //One added first to mark that the cards returned are the same suit.
    } else {
      cardsOfSameSuit = [0].concat(cards); //Zero added first to mark that the cards returned are not the same suit.
    }
    return cardsOfSameSuit;
  }
  
  function CheckForConsecutivity(cards: number[]) {
    cards = cards.sort(c => c % 15); 
    let cardValues: number[] = cards.map(c => c % 15); //Checks only for card value, not suit.
    let nonConsecutiveCount: number = 0;
    let consecutiveCards: number[] = [0, cards[0]];
    for (let i = 0; i < cardValues.length; i++) {
      if (cardValues[i + 1] != cardValues[i] + 1) {
        if (consecutiveCards.length >= 6) { // 5 cards + result indicator
          consecutiveCards[0] = 1;
          return consecutiveCards;
        } else {
          // console.log(cards[i + 1]);
          nonConsecutiveCount++;
          consecutiveCards = [0, cards[i + 1]];
        }

        if (nonConsecutiveCount > 2) {
          consecutiveCards = [0].concat(cards); //Zero added first to mark that the cards returned are not consecutive.
          return consecutiveCards;
        }
      } else {
        consecutiveCards = consecutiveCards.concat(cards[i + 1])
      }
    }
    if (consecutiveCards.length >= 6) {
      consecutiveCards[0] = 1;
    } else {
      consecutiveCards = [0].concat(cards);
    }
    return consecutiveCards;
  }
  
  function CheckHighestCard(cards: number[]) {
    return cards.sort(c => c % 15)[cards.length - 1];
  }
  
  function CheckMatchingValues(cards: number[]) {
    let valueMap = new Map<number, number>();
    cards.forEach(card => {
      if (Array.from(valueMap.keys()).includes(card % 15)) {
        valueMap.set(card % 15, valueMap.get(card % 15)! + 1);
      } else {
        valueMap.set(card % 15, 1);
      }
    });
    return valueMap;
  }
  
  function FindBestHand(cards: number[]) {
    /*Returns value of best hand (0 for high card -> 9 for royal flush), followed by values of cards in best hand.
    Eg: [9, 59, 58, 57, 56, 55] = royal flush with spades. */
    let bestHand: number[] = [];
    let sameSuitCards = CheckForSameSuit(cards);
    if (sameSuitCards[0] === 1) {
      let consecutiveCards = CheckForConsecutivity(sameSuitCards.slice(1, sameSuitCards.length));
      if(consecutiveCards[0] === 1) {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        if (CheckHighestCard(consecutiveCards) % 15 === 14) {
          bestHand = [9].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); //Royal Flush
        } else {
          bestHand = [8].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); //Straight Flush
        }
      } else {
        sameSuitCards = sameSuitCards.slice(1, sameSuitCards.length).sort();
        bestHand = [5].concat(sameSuitCards.slice(sameSuitCards.length - 5, sameSuitCards.length)); //Flush
      }
    } else {
      let consecutiveCards = CheckForConsecutivity(cards);
      if (consecutiveCards[0] === 1) {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        bestHand = [4].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); //Straight
      } else {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        let valueArray = Array.from(CheckMatchingValues(cards));
        if (valueArray.map(p => p[1]).includes(4)) {
          let fourOfAKindValue = valueArray[valueArray.map(p => p[1]).indexOf(4)][0];
          let fourOfAKind = cards.filter(c => c % 15 === fourOfAKindValue);
          let highestOtherCard = cards.filter(c => c % 15 != fourOfAKindValue).sort((a, b) => (b % 15) - (a % 15))[0];
          bestHand = [7].concat(fourOfAKind, [highestOtherCard]); //Four of a Kind
        } else if (valueArray.map(p => p[1]).includes(3)) {
          let threeOfAKindValues = valueArray.filter(p => p[1] === 3).map(p => p[0]).sort();
          let threeOfAKind = cards.filter(c => c % 15 === threeOfAKindValues[threeOfAKindValues.length - 1]);
          if (valueArray.map(p => p[1]).includes(2)) {
            let pairValues = valueArray.filter(p => p[1] === 2).map(p => p[0]).sort();
            let pair = cards.filter(c => c % 15 === pairValues[pairValues.length - 1]);
            bestHand = [6].concat(threeOfAKind, pair); //Full House
          } else {
            let highestOtherCards = cards.filter(c => c % 15 != threeOfAKindValues[threeOfAKindValues.length - 1]).sort((a, b) => (b % 15) - (a % 15)).slice(0, 2);
            bestHand = [3].concat(threeOfAKind, highestOtherCards); //Three of a Kind
          }
        } else if (valueArray.map(p => p[1]).includes(2)) {
          let pairValues = valueArray.filter(p => p[1] === 2).map(p => p[0]).sort();
          let pair = cards.filter(c => c % 15 === pairValues[pairValues.length - 1]);
          if (pairValues.length > 1) {
            let pairTwo = cards.filter(c => c % 15 === pairValues[pairValues.length - 2]);
            let otherCards = cards.filter(c => c % 15 != pairValues[pairValues.length - 1] && c % 15 != pairValues[pairValues.length - 2]);
            let highestOtherCard = otherCards.sort((a, b) => (b % 15) - (a % 15))[0];
            bestHand = [2].concat(pair, pairTwo, highestOtherCard); //Two Pair
          } else {
            let highestOtherCards = cards.filter(c => c % 15 != pairValues[pairValues.length - 1]).sort((a, b) => (b % 15) - (a % 15)).slice(0, 3);
            bestHand = [1].concat(pair, highestOtherCards);
          }
        } else {
          bestHand = [0].concat(cards.sort((a, b) => (b % 15) - (a % 15)).splice(0, 5).reverse()); //High Card
  
        }
      }
    }
    let hands = ["High Card", "Pair", "Two Pair", "Three of a Kind", "Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush", "Royal Flush"];
    // document.getElementById("best-hand")!.innerText = bestHand.toString();
    setBestHandText(bestHand.toString())
    // document.getElementById("best-hand")!.innerText = hands[bestHand[0]];
    // setBestHandText(hands[bestHand[0]]);
    return bestHand.splice(1, 5);
  }
  
  function Reset() {
    deck.Shuffle();
    setCards(deck.Deal(players));
    setFoldedPlayers(new Array(players).fill(0));
    HoleDeal(cards.slice(2 * (currentPlayer - 1), 2));
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
    setBestHandText("");
    let newStartingPlayer = startingPlayer + 1;
    if (newStartingPlayer > players) {
      newStartingPlayer = 1;
    }
    setStartingPlayer(newStartingPlayer);
    setCurrentPlayer(newStartingPlayer);
  }

  function FullReset() {
    document.getElementById("full-reset-button")!.hidden = true;
    setPlayerBanks(Array.from({length: players}).map(bank=>STARTBANK));
    Reset();
  }

  function ChangePlayer() {
    if (foldedPlayers.filter(p => p === 0).length === 1) {
      let winner = foldedPlayers.indexOf(0) + 1;
      DisplayWinner(winner);
    } else {
      let newPlayerNum = currentPlayer + 1;
      let firstPlayer = foldedPlayers.indexOf(0) + 1;
      let newCard = false;

      if (newPlayerNum === players + 1) {
        newPlayerNum = firstPlayer;
        newCard = true;
      }

      while (foldedPlayers[newPlayerNum - 1] === 1) {
        newPlayerNum++;
        if (newPlayerNum === players + 1) {
          newPlayerNum = firstPlayer;
          newCard = true;
        }
      }

      if (newCard === true) {
        setCurrentPlayer(firstPlayer);
        if (document.getElementById("flop-card-one")!.hidden === true) {
          FlopDeal(cards.slice(0, 2).concat(cards.slice(-5, -2)))
        } else if (document.getElementById("turn-card")!.hidden === true) {
          TurnDeal(cards.slice(0, 2).concat(cards.slice(-5, -1)))
        } else if (document.getElementById("river-card")!.hidden === true) {
          RiverDeal(cards.slice(0, 2).concat(cards.slice(-5, cards.length)))
        } else {
          DisplayWinner(1);
        }
      } else {
        if (document.getElementById("flop-card-one")!.hidden === true) {
          FindBestHand(cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2))
        } else if (document.getElementById("turn-card")!.hidden === true) {
          FindBestHand(cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -2)))
        } else if (document.getElementById("river-card")!.hidden === true) {
          FindBestHand(cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, -1)))
        } else {
          FindBestHand(cards.slice(2 * (newPlayerNum - 1), 2 * (newPlayerNum - 1) + 2).concat(cards.slice(-5, cards.length)))
        }
        setCurrentPlayer(newPlayerNum);
      }
    }
  }

  function Raise() {
    if (playerBanks[currentPlayer - 1] !== 0) {
      let amount = Number(window.prompt("How much would you like to bet?"));
      while (amount <= 0 || amount > playerBanks[currentPlayer - 1]) {
        amount = Number(window.prompt("Invalid input. How much would you like to bet?"))
      }
      let newBanks = playerBanks;
      newBanks[currentPlayer - 1] -= amount;
      setCurrentBet(amount);
      setPlayerBanks(newBanks);
      setPot(pot + currentBet);
      ChangePlayer();
    }
  }

  function Bet() {
    if (playerBanks[currentPlayer - 1] !== 0) {
      let newBanks = playerBanks;
      newBanks[currentPlayer - 1] -= currentBet;
      setPlayerBanks(newBanks);
      setPot(pot + currentBet);
      ChangePlayer();
    }
  }

  function Fold() {
    let newFoldedPlayers = foldedPlayers;
    newFoldedPlayers[currentPlayer - 1] = 1;
    setFoldedPlayers(newFoldedPlayers);
    ChangePlayer();
  }

  function DisplayWinner(playerNum: number) {
    document.getElementById("winner-text")!.innerText = "Player " + playerNum + " wins the pot!";
    document.getElementById("reset-button")!.hidden = false;
    document.getElementById("full-reset-button")!.hidden = false;
    document.getElementById("bet-button")!.hidden = true;
    document.getElementById("raise-button")!.hidden = true;
    document.getElementById("fold-button")!.hidden = true;
    let newBanks = playerBanks;
    newBanks[playerNum - 1] += pot;
    setPlayerBanks(newBanks);
    setPot(0);
  }

  return (
    <>
      <div id="table">
        <button onClick={() => HoleDeal(cards.slice(2 * (currentPlayer - 1), 2))} className="spaced-button" id="start-button" type="button">
          Start Game
        </button>
        <button onClick={() => Reset()} className="spaced-button" id="reset-button" type="button" hidden={true}>
          Reset
        </button>
        <button onClick={() => FullReset()} className="spaced-button" id="full-reset-button" type="button" hidden={true}>
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
        <button id="bet-button" className="spaced-button" type="button" onClick={() => Bet()} disabled={playerBanks[currentPlayer - 1] === 0} hidden={true}>
          Bet
        </button>
        <button id="raise-button" className="spaced-button" type="button" onClick={() => Raise()} disabled={playerBanks[currentPlayer - 1] === 0} hidden={true}>
          Raise
        </button>
        <button id="fold-button" className="spaced-button" type="button" onClick={() => Fold()} disabled={playerBanks[currentPlayer - 1] === 0} hidden={true}>
          Fold
        </button>
        <h1 id="winner-text" hidden={true} style={{display:"inline-block", position:"absolute", left:"50px", bottom:"50px"}}/>
        <h1 id="pot">Pot = {pot}</h1>
      </div>
      <h1 id="best-hand">{bestHandText}</h1>
    </>
  );
}

export default Board;