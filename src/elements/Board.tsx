import { table } from "console";
import Card from "./Card"
import Deck from "./Deck"

type roomSize = {
  players: number;
}

function HoleDeal(cards: number[]) {
  document.getElementById("hole-button")!.hidden = true;
  document.getElementById("flop-button")!.hidden = false;
  document.getElementById("hole-card-one")!.hidden = false;
  document.getElementById("hole-card-two")!.hidden = false;
  let bestHand = FindBestHand(cards);
  
}

function FlopDeal(cards: number[]) {
  document.getElementById("flop-button")!.hidden = true;
  document.getElementById("turn-button")!.hidden = false;
  document.getElementById("flop-card-one")!.hidden = false;
  document.getElementById("flop-card-two")!.hidden = false;
  document.getElementById("flop-card-three")!.hidden = false;
  let bestHand = FindBestHand(cards);
}

function TurnDeal(cards: number[]) {
  document.getElementById("turn-button")!.hidden = true;
  document.getElementById("river-button")!.hidden = false;
  document.getElementById("turn-card")!.hidden = false;
  let bestHand = FindBestHand(cards);
}

function RiverDeal(cards:number[]) {
  document.getElementById("river-button")!.hidden = true;
  document.getElementById("hole-button")!.hidden = false;
  document.getElementById("river-card")!.hidden = false;
  let bestHand = FindBestHand(cards);
}

function CheckForSameSuit(cards: number[]) {
  let cardsOfSameSuit: number[] = [];
  let hearts = cards.filter(function(card) {return Math.floor(card / 15) === 0});
  let diamonds = cards.filter(function(card) {return Math.floor(card / 15) === 1});
  let clubs = cards.filter(function(card) {return Math.floor(card / 15) === 2});
  let spades = cards.filter(function(card) {return Math.floor(card / 15) === 3});
  let allSortedSuits = [hearts, diamonds, clubs, spades];
  let sortedSuitLengths = allSortedSuits.map(suit => suit.length);
  if (sortedSuitLengths.indexOf(Math.max(...sortedSuitLengths)) >= 5) {
    cardsOfSameSuit.concat([1], allSortedSuits[sortedSuitLengths.indexOf(Math.max(...sortedSuitLengths))]);
    //One added first to mark that the cards returned are the same suit.
  } else {
    cardsOfSameSuit.concat([0], cards); //Zero added first to mark that the cards returned are not the same suit.
  }
  return cardsOfSameSuit;
}

function CheckForConsecutivity(cards: number[]) {
  cards.sort(c => c % 15); 
  let cardValues: number[] = cards.map(c => c % 15); //Checks only for card value, not suit.
  let nonConsecutiveTally: number = 0;
  let consecutiveCards: number[] = [0, cards[0]];
  for (let i = 0; i < cardValues.length; i++) {
    if (cardValues[i + 1] != cardValues[i] + 1) {
      if (consecutiveCards.length >= 6) {
        consecutiveCards[0] = 1;
        return consecutiveCards;
      } else {
        nonConsecutiveTally++;
        consecutiveCards = [0, cards[i + 1]];
      }
    }
    if (nonConsecutiveTally > 2) {
      consecutiveCards = consecutiveCards.concat([0], cards); //Zero added first to mark that the cards returned are not consecutive.
      return consecutiveCards;
    } else {
      consecutiveCards.push(cards[i + 1])
    }
  }
  if (consecutiveCards.length >= 6) {
    consecutiveCards[0] = 1;
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
  let sameSuitCards = CheckForSameSuit(cards);
  let bestHand: number[] = [];
  if (sameSuitCards[0] === 1) {
    let consecutiveCards = CheckForConsecutivity(sameSuitCards.slice(1, sameSuitCards.length - 2));
    if(consecutiveCards[0] === 1) {
      if (CheckHighestCard(consecutiveCards) % 15 === 14) {
        bestHand = [9].concat(consecutiveCards.slice(0, consecutiveCards.length - 6)); //Royal Flush
      } else {
        bestHand = [8].concat(consecutiveCards.slice(0, consecutiveCards.length - 6)); //Straight Flush
      }
    } else {
      consecutiveCards.splice(0, 1).sort()
      bestHand = [5].concat(consecutiveCards.slice(0, consecutiveCards.length - 6)) //Flush
    }
  } else {
    let consecutiveCards = CheckForConsecutivity(cards);
    if (consecutiveCards[0] === 1) {
      bestHand = [4].concat(consecutiveCards.slice(0, consecutiveCards.length - 6)); //Straight
    } else {
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
  document.getElementById("best-hand")!.innerText = bestHand.toString();
  // document.getElementById("best-hand")!.innerText = hands[bestHand[0]];
  return bestHand.splice(1, 5);
}

function Board({players} : roomSize) {
  var deck: Deck = new Deck;
  deck.Shuffle();
  var cards = deck.Deal();
  return (
    <>
      <div id="table">
       <button onClick={() => HoleDeal(cards.slice(0, 2))} className="spaced-button" id="hole-button" type="button">
         Deal Hole
       </button>
       <button onClick={() => FlopDeal(cards.slice(0, 5))} className="spaced-button" id="flop-button" type="button" hidden={true}>
         Deal Flop
       </button>
       <button onClick={() => TurnDeal(cards.slice(0, 6))} className="spaced-button" id="turn-button" type="button" hidden={true}>
         Deal Turn
       </button>
       <button onClick={() => RiverDeal(cards.slice(0, 7))} className="spaced-button" id="river-button" type="button" hidden={true}>
         Deal River
       </button>
       {/* <div className="hole-cards"> */}
         <div id="hole-card-one" hidden={true}>
           <Card val={cards[0]}/>  
         </div> 
         <div id="hole-card-two" hidden={true}>
           <Card val={cards[1]}/>
         </div>   
       {/* </div> */}
       <div className="communal-cards">
         <div id="flop-card-one" hidden={true}style={{float:"left"}}>
           <Card val={cards[2]}/>
         </div>
         <div id="flop-card-two" hidden={true} style={{float:"left"}}>
           <Card val={cards[3]}/>
         </div>
         <div id="flop-card-three" hidden={true} style={{float:"left"}}>
           <Card val={cards[4]}/>
         </div>
         <div id="turn-card" hidden={true} style={{float:"left"}}>
           <Card val={cards[5]}/>
         </div>
         <div id="river-card" hidden={true} style={{float:"left"}}>
           <Card val={cards[6]}/>
         </div>
       </div>
     </div>
     <h1 id="best-hand"></h1>
    </>
  );
}

export default Board;