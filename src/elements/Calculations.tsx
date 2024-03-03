import Deck from "./Deck"

class Calculations {
  deck = new Deck;

  FindBestHand(cards: number[]) {
    let bestHand: number[] = [];
    let sameSuitCards = this.CheckForSameSuit(cards);
    if (sameSuitCards[0] === 1) {
      let consecutiveCards = this.CheckForConsecutivity(sameSuitCards.slice(1, sameSuitCards.length));
      if(consecutiveCards[0] === 1) {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        if (this.CheckHighestCard(consecutiveCards) % 15 === 14) {
          bestHand = [9].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); //Royal Flush
        } else {
          bestHand = [8].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); //Straight Flush
        }
      } else {
        sameSuitCards = sameSuitCards.slice(1, sameSuitCards.length).sort();
        bestHand = [5].concat(sameSuitCards.slice(sameSuitCards.length - 5, sameSuitCards.length)); //Flush
      }
    } else {
      let consecutiveCards = this.CheckForConsecutivity(cards);
      if (consecutiveCards[0] === 1) {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        bestHand = [4].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); //Straight
      } else {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        consecutiveCards.map(card => {if (card % 15 === 1 ) {card = card + 13}})
        let valueArray = Array.from(this.CheckMatchingValues(cards));
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
    return bestHand;
  }

  CheckForSameSuit(cards: number[]) {
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
  
  CheckForConsecutivity(cards: number[]) {
    let aceHighCards = cards;
    cards.forEach(card => {
      if (card % 15 === 1) {
        aceHighCards = aceHighCards.concat(card + 13);
      }
    });
    aceHighCards = aceHighCards.sort((a, b) => (b % 15) - (a % 15)); 
    let cardValues: number[] = aceHighCards.map(c => c % 15); //Checks only for card value, not suit.
    let nonConsecutiveCount: number = 0;
    let consecutiveCards: number[] = [0, cards[0]];
    for (let i = 0; i < cardValues.length; i++) {
      if (cardValues[i + 1] != cardValues[i] - 1) {
        if (consecutiveCards.length >= 6) { // 5 cards + result indicator
          consecutiveCards[0] = 1;
          return consecutiveCards;
        } else {
          nonConsecutiveCount++;
          consecutiveCards = [0, aceHighCards[i + 1]];
        }

        if (nonConsecutiveCount > aceHighCards.length - 5) {
          consecutiveCards = [0].concat(cards); //Zero added first to mark that the cards returned are not consecutive.
          return consecutiveCards;
        }
      } else {
        consecutiveCards = consecutiveCards.concat(aceHighCards[i + 1])
      }
    }
    if (consecutiveCards.length >= 6) {
      consecutiveCards[0] = 1;
    } else {
      consecutiveCards = [0].concat(cards);
    }
    return consecutiveCards;
  }

  CheckMatchingValues(cards: number[]) {
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

  CheckHighestCard(cards: number[]) {
    let aceHighCards = cards;
    cards.forEach(card => {
      if (card % 15 === 1) {
        aceHighCards = aceHighCards.concat(card + 13);
      }
    });
    return aceHighCards.sort((a, b) => (b % 15) - (a % 15))[0];
  }

  PreFlopBet(playerCards: number[]) {
    console.log("preflop");
    let cardValues = playerCards.map(c => {if (c % 15 === 1) {return 14} else {return c % 15}}).sort();
    let cardSuits = playerCards.map(c => c / 15);
    if ((cardValues[0] >= 10 && cardValues[1] >= 10)
      || (cardValues[0] >= 10 && cardValues[1] >= 8 && cardSuits[0] === cardSuits[1])
      || (cardValues[0] >= 8 && cardValues[1] >= 10 && cardSuits[0] === cardSuits[1])) {
        return 0;
    } else if (cardValues[0] === 14 || cardValues[1] === 14) {
      return 0;
    } else if (cardValues[0] === cardValues[1]) {
      return 1;
    } else if (cardValues.includes(13) && cardSuits[0] === cardSuits[1]) {
      return 1;
    } else if (cardSuits[0] === cardSuits[1] && cardValues[0] === cardValues[1] - 1 && cardValues[0] >= 4) {
      return 1;
    } else if (cardSuits[0] === cardSuits[1] && cardValues[0] === cardValues[1] - 2 && cardValues[0] >= 5) {
      return 1;
    } else if (cardValues.includes(9) && (cardValues[0] >= 12 || cardValues[1] >= 12)) {
      return 1;
    } else {
      return 2;
    }
  }

  oneHandIHR (playerBestHand: number[], oppHand: number[]) {
    let oppBestHand = this.FindBestHand(oppHand);
    if (playerBestHand[0] - oppBestHand[0] > 0) {
      return 0;
    } else if (playerBestHand[0] === oppBestHand[0]) {
      return 0.5;
    } else {
      return 1;
    }
  }

  ihr(playerCards: number[], communalCards: number[]) {
    let ihrArray = [0, 0, 0];
    let playerBestHand = this.FindBestHand(playerCards.concat(communalCards));
    let possibleOpponentCards = this.deck.cards.filter(c => !(playerCards.includes(c) || communalCards.includes(c)));
    for (let i = 0; i < possibleOpponentCards.length; i++) {
      console.log("ihr");
      for (let j = 0; j < possibleOpponentCards.length; j++) {
        if (i !== j) {
          ihrArray[this.oneHandIHR(playerBestHand, [possibleOpponentCards[i], possibleOpponentCards[j]])] += 1;
        }
      }
    }
    return (ihrArray[0] + ihrArray[1]/2) / (ihrArray[0] + ihrArray[1] + ihrArray[2]);
  }

  ehs (playerCards: number[], communalCards: number[]) {
    let ihrArray = [0, 0, 0];
    let ehsArray = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    let playerBestHand = this.FindBestHand(playerCards.concat(communalCards));
    let oppBestHand: number[] = [];
    let possibleOpponentCards = this.deck.cards.filter(c => !(playerCards.includes(c) || communalCards.includes(c)));
    for (let i = 0; i < possibleOpponentCards.length; i++) {
      console.log("ehs");
      for (let j = 0; j < possibleOpponentCards.length; j++) {
        if (i !== j) {
          let ihrIndex = this.oneHandIHR(playerBestHand, [possibleOpponentCards[i], possibleOpponentCards[j]].concat(communalCards))
          ihrArray[ihrIndex] += 1;
          if (communalCards.length < 5) {
            let possibleRiverCards = possibleOpponentCards.filter(c => !(c === possibleOpponentCards[i] || c === possibleOpponentCards[j]));
            for (let c1 = 0; c1 < possibleRiverCards.length; c1++) {
              if (communalCards.length < 4) {
                let possibleTurnCards = possibleRiverCards.filter(c => c !== possibleRiverCards[c1]);
                for (let c2 = 0; c2 < possibleTurnCards.length; c2++) {
                  if (communalCards.length === 0) {
                    let possibleFlopCards = possibleTurnCards.filter(c => c !== possibleTurnCards[c2]);
                    for (let c3 = 0; c3 < possibleFlopCards.length; c3++) {
                      for (let c4 = 0; c4 < possibleFlopCards.length; c4++) {
                        console.log("BOOM!");
                        for (let c5 = 0; c5 < possibleFlopCards.length; c5++) {
                          if (c3 !== c4 && c4 !== c5 && c3 !== c5) {
                            oppBestHand = this.FindBestHand(
                              [possibleOpponentCards[i], possibleOpponentCards[j], possibleRiverCards[c1], possibleTurnCards[c2], possibleFlopCards[c3], possibleFlopCards[c4], possibleFlopCards[c5]]);
                          }
                        }
                      }
                    }
                  } else {
                    oppBestHand = this.FindBestHand([possibleOpponentCards[i], possibleOpponentCards[j], possibleRiverCards[c1], possibleTurnCards[c2]].concat(communalCards));
                  }
                }
              } else {
                oppBestHand = this.FindBestHand([possibleOpponentCards[i], possibleOpponentCards[j], possibleRiverCards[c1]].concat(communalCards));
              }
            }
            if (playerBestHand[0] - oppBestHand[0] > 0) {
              ehsArray[ihrIndex][0] += 1;
            } else if (playerBestHand[0] === oppBestHand[0]) {
              ehsArray[ihrIndex][1] += 1;
            } else {
              ehsArray[ihrIndex][2] += 1;
            }

          }
        }
      }
    }
    let handStrength = (ihrArray[0] + ihrArray[1]/2) / (ihrArray[0] + ihrArray[1] + ihrArray[2]);
    if(communalCards.length === 5) {
      return handStrength;
    } else {
      let posPotential = (ehsArray[2][0] + ehsArray[2][1]/2 + ehsArray[1][0]/2) / (ihrArray[2] + ihrArray[1]);
      let negPotential = (ehsArray[0][2] + ehsArray[1][2]/2 + ehsArray[0][1]/2) / (ihrArray[0] + ihrArray[1]);
      return handStrength * (1 - negPotential) + (1 - handStrength) * posPotential;
    }
  }

  decisionCalc(playerCards: number[], communalCards: number[]) {
    let decisionVal = 0;
    if (communalCards.length === 0) {
      decisionVal = this.PreFlopBet(playerCards);
    } else if (communalCards.length === 5) {
      decisionVal = this.ihr(playerCards, communalCards);
    // } else if (communalCards.length === 4) {
    //   decisionVal = this.ehs(playerCards, communalCards);
    } else {
      decisionVal = this.ehs(playerCards, communalCards);
    }
    return decisionVal;
  }

  calcPlayground(playerCards: number[], communalCards: number[]) {
    const distinctCombinations = [1277, 2860, 858, 858, 10, 1277, 156, 156, 9, 1];
    const totalCombinations = [1302540, 1098240, 123552, 54912, 10200, 5108, 3744, 624, 36, 4];
    var winDrawLoss = [0, 0, 0];
    var ehsWinDrawLoss = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

    let playerBestHand = this.FindBestHand(playerCards.concat(communalCards));
    for (let i = 0; i < distinctCombinations.length; i++) {
      let ihrIndex: number;
      if (i < playerBestHand[0]) {
        ihrIndex = 0;
      } else if (i === playerBestHand[0]) {
        ihrIndex = 1;
      } else {
        ihrIndex = 2;  
      }
      winDrawLoss[ihrIndex] += totalCombinations[i];
      

      if (communalCards.length < 5) {
        let possibleRiverCards = this.deck.cards.filter(c => !(playerCards.includes(c) || communalCards.includes(c)));
        for (let c1 = 0; c1 < possibleRiverCards.length; c1++) {
          if (communalCards.length < 4) {
            let possibleTurnCards = possibleRiverCards.filter(c => c !== possibleRiverCards[c1]);
            for (let c2 = 0; c2 < possibleTurnCards.length; c2++) {
              playerBestHand = this.FindBestHand(playerCards.concat(communalCards, possibleRiverCards[c1], possibleTurnCards[c2]));
              let ehsIndex: number;
              if (i < playerBestHand[0]) {
                ehsIndex = 0;
              } else if (i === playerBestHand[0]) {
                ehsIndex = 1;
              } else {
                ehsIndex = 2;  
              }
              ehsWinDrawLoss[ihrIndex][ehsIndex] += totalCombinations[i]
            }
          }
        }
      }
    }
  }  
}

export default Calculations;