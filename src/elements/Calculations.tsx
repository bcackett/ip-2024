import Deck from "./Deck"
import { supabase } from "../common/supabase";

class Calculations {
  // Maintains and isolates all of the calculations used multiple times throughout a game.
  deck = new Deck;

  FindBestHand(cards: number[]) { // Determines the best possible combination of cards out of those available, and the rank of the resulting hand, as efficiently as possible.
    let bestHand: number[] = [];
    let sameSuitCards = this.CheckForSameSuit(cards);
    if (sameSuitCards[0] === 1) {
      let consecutiveCards = this.CheckForConsecutivity(sameSuitCards.slice(1, sameSuitCards.length));
      if(consecutiveCards[0] === 1) {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        if (this.CheckHighestCard(consecutiveCards) % 15 === 14) {
          bestHand = [9].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); // Royal Flush - 10, J, Q, K, A of the same suit.
        } else {
          bestHand = [8].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); // Straight Flush - any 5 consecutive cards of the same suit.
        }
      } else {
        sameSuitCards = sameSuitCards.slice(1, sameSuitCards.length).sort();
        bestHand = [5].concat(sameSuitCards.slice(sameSuitCards.length - 5, sameSuitCards.length)); // Flush - any 5 cards of the same suit.
      }
    } else {
      let consecutiveCards = this.CheckForConsecutivity(cards);
      if (consecutiveCards[0] === 1) {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        bestHand = [4].concat(consecutiveCards.slice(consecutiveCards.length - 5, consecutiveCards.length)); // Straight - any 5 consecutive cards.
      } else {
        consecutiveCards = consecutiveCards.slice(1, consecutiveCards.length);
        let aceHighCards: number[] = [];
        consecutiveCards.forEach(card => {
          if (card % 15 === 1) {
            aceHighCards = aceHighCards.concat(card + 13);
          } else {
            aceHighCards = aceHighCards.concat(card);
          }
        });
        let valueArray = Array.from(this.CheckMatchingValues(aceHighCards));
        if (valueArray.map(p => p[1]).includes(4)) {
          let fourOfAKindValue = valueArray[valueArray.map(p => p[1]).indexOf(4)][0];
          let fourOfAKind = aceHighCards.filter(c => c % 15 === fourOfAKindValue);
          let highestOtherCard = aceHighCards.filter(c => c % 15 != fourOfAKindValue).sort((a, b) => (b % 15) - (a % 15))[0];
          bestHand = [7].concat(fourOfAKind, [highestOtherCard]); // Four of a Kind - 4 cards with the same value.
        } else if (valueArray.map(p => p[1]).includes(3)) {
          let threeOfAKindValues = valueArray.filter(p => p[1] === 3).map(p => p[0]).sort();
          let threeOfAKind = aceHighCards.filter(c => c % 15 === threeOfAKindValues[threeOfAKindValues.length - 1]);
          if (valueArray.map(p => p[1]).includes(2)) {
            let pairValues = valueArray.filter(p => p[1] === 2).map(p => p[0]).sort();
            let pair = aceHighCards.filter(c => c % 15 === pairValues[pairValues.length - 1]);
            bestHand = [6].concat(threeOfAKind, pair); // Full House - one pair and one three of a kind simultaneously.
          } else {
            let highestOtherCards = aceHighCards.filter(c => c % 15 != threeOfAKindValues[threeOfAKindValues.length - 1]).sort((a, b) => (b % 15) - (a % 15)).slice(0, 2);
            bestHand = [3].concat(threeOfAKind, highestOtherCards); // Three of a Kind - 3 cards with the same value.
          }
        } else if (valueArray.map(p => p[1]).includes(2)) {
          let pairValues = valueArray.filter(p => p[1] === 2).map(p => p[0]).sort();
          let pair = aceHighCards.filter(c => c % 15 === pairValues[pairValues.length - 1]);
          if (pairValues.length > 1) {
            let pairTwo = cards.filter(c => c % 15 === pairValues[pairValues.length - 2]);
            let otherCards = aceHighCards.filter(c => c % 15 != pairValues[pairValues.length - 1] && c % 15 != pairValues[pairValues.length - 2]);
            let highestOtherCard = otherCards.sort((a, b) => (b % 15) - (a % 15))[0];
            bestHand = [2].concat(pair, pairTwo, highestOtherCard); // Two Pair - two different sets of two cards with the same value.
          } else {
            let highestOtherCards = aceHighCards.filter(c => c % 15 != pairValues[pairValues.length - 1]).sort((a, b) => (b % 15) - (a % 15)).slice(0, 3);
            bestHand = [1].concat(pair, highestOtherCards); // Pair - 2 cards with the same value.
          }
        } else {
          bestHand = [0].concat(aceHighCards.sort((a, b) => (b % 15) - (a % 15)).splice(0, 5).reverse()); // High Card - None of the above.
        }
      }
    }
    return bestHand;
  }

  CheckForSameSuit(cards: number[]) {
    // Returns the set of 5 cards out of those given as a parameter all with the same suit, or the entire array of cards if no such set of 5 exists.
    // Same suit only matters for Flush, Straight Flush and Royal Flush, all of which require 5 cards, so any less does not provide any useful contribution to the best hand.
    let cardsOfSameSuit: number[] = [];

    // Checks only each suit, not value.
    let hearts = cards.filter(function(card) {return Math.floor(card / 15) === 0});
    let diamonds = cards.filter(function(card) {return Math.floor(card / 15) === 1});
    let clubs = cards.filter(function(card) {return Math.floor(card / 15) === 2});
    let spades = cards.filter(function(card) {return Math.floor(card / 15) === 3});
    let allSortedSuits = [hearts, diamonds, clubs, spades];
    let sortedSuitLengths = allSortedSuits.map(suit => suit.length);
    if (sortedSuitLengths[sortedSuitLengths.indexOf(Math.max(hearts.length, diamonds.length, clubs.length, spades.length))] >= 5) {
      cardsOfSameSuit = [1].concat(allSortedSuits[sortedSuitLengths.indexOf(Math.max(hearts.length, diamonds.length, clubs.length, spades.length))]);
      // One added first to mark that the cards returned are the same suit.
    } else {
      cardsOfSameSuit = [0].concat(cards); // Zero added first to mark that the cards returned are not the same suit.
    }
    return cardsOfSameSuit;
  }
  
  CheckForConsecutivity(cards: number[]) {
    // Returns the set of 5 cards out of those given as a parameter that are all consecutive in value, or the entire array of cards if no such set of 5 exists.
    // Consecutivity only matters for Straight, Straight Flush and Royal Flush, all of which require 5 cards, so any less does not provide any useful contribution to the best hand.
    let aceHighCards = cards;
    cards.forEach(card => {
      if (card % 15 === 1) {
        aceHighCards = aceHighCards.concat(card + 13); // Adds high Ace cards to the list of cards without removing the low Ace cards, such that both can be considered for high and low straights.
      }
    });
    aceHighCards = aceHighCards.sort((a, b) => (b % 15) - (a % 15)); // Sorts the cards in descending order.
    let cardValues: number[] = aceHighCards.map(c => c % 15); // Checks only for card value, not suit.
    let nonConsecutiveCount: number = 0;
    let consecutiveCards: number[] = [0, cards[0]];
    for (let i = 0; i < cardValues.length; i++) {
      if (cardValues[i + 1] != cardValues[i] - 1) { // If the next card in the array is not one less than the one before it, the chain of consecutivity is broken.
        if (consecutiveCards.length >= 6) { // 5 cards + result indicator
          consecutiveCards[0] = 1;
          return consecutiveCards;
        } else {
          nonConsecutiveCount++; // Increment the number of times the consecutivity chain has been broken with no successful chain of 5 found.
          consecutiveCards = [0, aceHighCards[i + 1]];
        }

        // If the number of times the consecutivity chain is broken exceeds the number of cards in the list - 5, it becomes impossible to find a complete chain of 5 consecutive cards.
        if (nonConsecutiveCount > aceHighCards.length - 5) { 
          consecutiveCards = [0].concat(cards); //Zero added first to mark that the cards returned are not consecutive.
          return consecutiveCards;
        }
      } else { // If the next card in the array is one less that the one before it, continue the chain.
        consecutiveCards = consecutiveCards.concat(aceHighCards[i + 1])
      }
    }
    if (consecutiveCards.length >= 6) {
      consecutiveCards[0] = 1; // Change the value at index 0 to a 1 to indicate that the cards are consecutive.
    } else {
      consecutiveCards = [0].concat(cards); // Return all of the cards with 0 at index 0 to indicate that the check failed.
    }
    return consecutiveCards;
  }

  CheckMatchingValues(cards: number[]) {
    // Checks if there are any sets of cards in the array provided as input with matching values.

    // Creates a dictionary where the keys are values on cards in the array and the dictionary values are the number of times that value appears in the set of cards.
    let valueMap = new Map<number, number>(); 
    cards.forEach(card => {
      if (Array.from(valueMap.keys()).includes(card % 15)) { // If the card's value is already a key in the dictionary, increment the value that corresponds to this key by 1.
        valueMap.set(card % 15, valueMap.get(card % 15)! + 1);
      } else { // Otherwise add the card value as a new key in the dictionary with a value of 1, as this is the first instance of this card value.
        valueMap.set(card % 15, 1);
      }
    });
    return valueMap;
  }

  CheckHighestCard(cards: number[]) {
    // Returns the highest card in the list of cards given as input.
    let aceHighCards = cards;
    cards.forEach(card => {
      if (card % 15 === 1) { // In all cases where the highest card is checked, mostly tiebreaker situations, Aces rae always considered high.
        aceHighCards = aceHighCards.concat(card + 13);
      }
    });
    return aceHighCards.sort((a, b) => (b % 15) - (a % 15))[0];
  }

  PreFlopBet(playerCards: number[]) {
    // Determines the best action to take during the preflop round by using the cards currently available and logic used by over-the-table players.
    // See Figure 5.2 in the report for the diagram used for this logic.
    console.log("preflop");
    let cardValues = playerCards.map(c => {if (c % 15 === 1) {return 14} else {return c % 15}}).sort((a, b) => b - a);
    let cardSuits = playerCards.map(c => c / 15);
    
    // The diagram is divided into sections so as to cover as many cases as fast as possible.
    // Return 1 = raise, return 0.5 = bet and return 0 = fold.
    if (cardValues[0] >= 10 && (cardValues[1] >= 10 || (cardValues[1] >= 8 && cardSuits[0] === cardSuits[1]))) {
      return 1;
    } else if (cardValues[0] === cardValues[1]) {
      return 1;
    } else if (cardValues[0] === 14 && (cardSuits[0] === cardSuits[1] || cardValues[1] >= 7)) {
      return 1;
    } else if (cardSuits[0] === cardSuits[1] && cardValues[0] + cardValues[1] >= 19) {
      return 1;
    } else if (cardSuits[0] !== cardSuits[1]) {
      if (cardValues[0] <= 11 && cardValues[0] - cardValues[1] >= 4) {
        return 0;
      } else if ((cardValues[0] === 13 || cardValues[0] === 12) && cardValues[0] + cardValues[1] <= 19) {
        return 0;
      } else if (cardValues[0] <= 6 && cardValues[1] <= 3) {
        return 0;
      } else if (cardValues[0] === 7 && cardValues[1] === 4) {
        return 0;
      } else {
        console.log("0.5");
        return 0.5;
      }
    } else {
      console.log("0.5");
      return 0.5;
    }
  }

  oneHandIHR (playerBestHand: number[], oppHand: number[]) {
    // Calculates the immediate hand rank for a single possible opponent hand.
    let oppBestHand = this.FindBestHand(oppHand);
    // Returns the index to be used during immediate hand rank and effective hand strength calculations (see below).
    if (playerBestHand[0] - oppBestHand[0] > 0) {
      return 0;
    } else if (playerBestHand[0] === oppBestHand[0]) {
      return 1;
    } else {
      return 2;
    }
  }

  ihr(playerCards: number[], communalCards: number[]) {
    // Calculates the overall immediate hand rank of the player's hand compared to all possible opponent hands.
    // Immediate hand rank assumes that all of the communal cards are known.

    let ihrArray = [0, 0, 0]; // Element at index 0 = number of times the player's hand beats the opponent's, index 1 = the hands tie, index 2 = the player's hand loses.
    let playerBestHand = this.FindBestHand(playerCards.concat(communalCards));
    let possibleOpponentCards = this.deck.cards.filter(c => !(playerCards.includes(c) || communalCards.includes(c)));
    for (let i = 0; i < possibleOpponentCards.length; i++) {
      console.log("ihr");
      for (let j = 0; j < possibleOpponentCards.length; j++) {
        if (i !== j) {
          // Uses the oneHandIHR function to obtain the index based on the outcome of the matchup of the hands.
          ihrArray[this.oneHandIHR(playerBestHand, [possibleOpponentCards[i], possibleOpponentCards[j]].concat(communalCards))] += 1;
        }
      }
    }
    console.log(ihrArray.toString())
    // The final result of the IHR calculation indicates the strength of the hand. See Section 3.1.3 in the report for details.
    return (ihrArray[0] + ihrArray[1]/2) / (ihrArray[0] + ihrArray[1] + ihrArray[2]);
  }

  ehs (playerCards: number[], communalCards: number[]) {
    // Calculates the effective hand strength of the player's hand compared to all possible opponent hands.
    // Immediate hand rank does not assume that all of the communal cards are known.

    let ihrArray = [0, 0, 0]; // ihrArray works the same way as it did in the ihr function.

    // Indexing in the main ehsArray works the same way as it does in the ihrArray. Indexing in each sub-array also works the same way.
    // When combined, this indexing system allows for both current and predicted values to be stored. E.g: element at [0][1] shows how many hands are currently winning, but will eventually tie.
    let ehsArray: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    let playerBestHand = this.FindBestHand(playerCards.concat(communalCards));
    let oppBestHand: number[] = [];
    let possibleOpponentCards = this.deck.cards.filter(c => !(playerCards.includes(c) || communalCards.includes(c))); // Removes currently known cards from the possible cards in the opponent's hand.
    
    // The following series of for loops finds every possible hand that could be formed out of the currently unknown cards.
    for (let i = 0; i < possibleOpponentCards.length; i++) {
      console.log("ehs");
      for (let j = 0; j < possibleOpponentCards.length; j++) {
        if (i !== j) {
          let ihrIndex = this.oneHandIHR(playerBestHand, [possibleOpponentCards[i], possibleOpponentCards[j]].concat(communalCards));
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

            // This if-else block increments the appropriate value in ehsArray based on the result of the for loops.
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
    return this.handStrengthCalculation(ihrArray, ehsArray, communalCards.length === 5);
  }

  ehsRandomSample (playerCards: number[], communalCards: number[]) {
    // Calcuates effective hadn strength using a random sample of possible hands as opposed to every possibility.
    // Used when the faster calculations setting is enabled.
    let ihrArray = [0, 0, 0];
    let ehsArray: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    let playerBestHand = this.FindBestHand(playerCards.concat(communalCards));
    let oppBestHand: number[] = [];
    let possibleOpponentCards = this.deck.cards.filter(c => !(playerCards.includes(c) || communalCards.includes(c)));
    console.log("fast ehs");
    // This for loop performs the same operations in the series of for loops in the ehs function, but randomly samples 50000 unique hands as opposed to looping through every possibility.
    for (let i = 0; i < 50000; i++) {
      let newPossibleOpponentCards = possibleOpponentCards.sort(() => Math.random() - 0.5);
      let possibleOpponentHole = newPossibleOpponentCards.slice(0, 2);
      let ihrIndex = this.oneHandIHR(playerBestHand, possibleOpponentHole.concat(communalCards));
      ihrArray[ihrIndex] += 1;
      let opponentCards = communalCards.concat(newPossibleOpponentCards.slice(0, 7 - communalCards.length));
      let oppBestHand = this.FindBestHand(opponentCards);
      if (playerBestHand[0] - oppBestHand[0] > 0) {
        ehsArray[ihrIndex][0] += 1;
      } else if (playerBestHand[0] === oppBestHand[0]) {
        ehsArray[ihrIndex][1] += 1;
      } else {
        ehsArray[ihrIndex][2] += 1;
      }
    }
    return this.handStrengthCalculation(ihrArray, ehsArray, communalCards.length === 5);
  }

  handStrengthCalculation(ihrArray: number[], ehsArray: number[][], allCommunalCardsKnown: boolean) {
    // Performs the final steps of effective hand strength. See section 3.1.3 in the report for more details.
    let handStrength = (ihrArray[0] + ihrArray[1]/2) / (ihrArray[0] + ihrArray[1] + ihrArray[2]);
    if(allCommunalCardsKnown) {
      return handStrength;
    } else {
      let posPotential = (ehsArray[2][0] + ehsArray[2][1]/2 + ehsArray[1][0]/2) / (ihrArray[2] + ihrArray[1]);
      let negPotential = (ehsArray[0][2] + ehsArray[1][2]/2 + ehsArray[0][1]/2) / (ihrArray[0] + ihrArray[1]);
      return handStrength * (1 - negPotential) + (1 - handStrength) * posPotential;
    }
  }

  decisionCalc(playerCards: number[], communalCards: number[]) {
    // Returns the value from the appropriate caculation to use for the current betting round.
    let decisionVal = 0;
    if (communalCards.length === 0) { // If no communal cards are known, the game is in the preflop round, so the PreFlopBet function should be used.
      decisionVal = this.PreFlopBet(playerCards);
    } else if (communalCards.length === 5) { // If 5 communal cards are known, the game is in the river round and no more cards will be revealed, so the ihr function should be used.
      decisionVal = this.ihr(playerCards, communalCards);
    } else if (sessionStorage.getItem("fasterCalcs") === "false") { // In any other case, effective hand strength should be used, so the only other check is if faster calculations is enabled.
      decisionVal = this.ehs(playerCards, communalCards);
      console.log(decisionVal);
    } else {
      decisionVal = this.ehsRandomSample(playerCards, communalCards);
      console.log(decisionVal.toString() + "but this was done faster.");
    }
    console.log("Decision Value: " + decisionVal.toString());
    return decisionVal;
  }

  async moveSuggestionCalc() {
    // Performs statistical analysis in order to return a measure of the current player's ability.
    let currentDivision = 300; // Default value is the middle division - exactly average.
    const e1 = await supabase.from("results").select("result"); // Retrieve every game on the platform's result.
    if (e1.error) throw e1.error;
    if (e1.data.length !== 0) {
      // Model the data as a normal distribution, the find the average and standard deviation of the results.
      let dataMapped = e1.data.map(x => x.result);
      let dataSize = dataMapped.length;
      let dataSum = dataMapped.reduce((x,y) => x + y);
      let averageWinnings = dataSum / dataSize;
      let stdDev = 0;
      for (let i = 0; i < dataSize; i++) {
        stdDev += Math.pow(dataMapped[i] - averageWinnings, 2);
      }
      stdDev = Math.sqrt(stdDev / dataSize);

      let divisionSize = 0.06 * stdDev; //Each standard deviation consists of 100 divisions, for a total of 600 divisions across 6 standard deviations.
      const e2 = await supabase.from("results").select("result").eq("userID", Number(sessionStorage.getItem("userID"))); // Retieve the results of every game completed by the user.
      if (e2.error) throw e2.error;
      if (e2.data.length !== 0) {
        let playerDataMapped = e2.data.map(x => x.result);
        let playerDataSize = playerDataMapped.length;
        let playerDataSum = playerDataMapped.reduce((x,y) => x + y);
        let playerAverageWinnings = playerDataSum / playerDataSize; // Find the average of the user's games.
        let i = 0;

        // The following if-else block determines the exact division the player's average performance places them in compared to the average result.
        if (playerAverageWinnings < averageWinnings) {
          while (playerAverageWinnings < averageWinnings - i) {
            currentDivision -= 1;
            i += divisionSize;
          }
        } else if(playerAverageWinnings > averageWinnings) {
          while (playerAverageWinnings > averageWinnings + i) {
            currentDivision += 1;
            i += divisionSize;
          }
        }

        // The folowing if-else if block determines if the user's final division should be adjusted based on if they have won or lost a lot of their recent games.
        // If found to be the case, the divisions are increased/decreased by 60 divisions, or one-tenth of the overall distribution.
        if (playerDataMapped.slice(-10).filter(x => x < 0).length > 7 && currentDivision >= 60) {
          currentDivision -= 60;
        } else if (playerDataMapped.slice(-10).filter(x => x < 0).length > 7) {
          currentDivision = 0;
        } else if (playerDataMapped.slice(-10).filter(x => x > 0).length > 7 && currentDivision <= 540) {
          currentDivision += 60;
        } else if (playerDataMapped.slice(-10).filter(x => x > 0).length > 7) {
          currentDivision = 600;
        }
      }
    }

    // Converts the division into a value between -5 and 5, and maps this value into a final score between 1 and -1 using a sigmoid function.
    console.log("Current division after conversion: " + (currentDivision/60 - 5).toString());
    console.log( 1 / (1 + Math.exp(-((currentDivision/60) - 5))));
    return 1 / (1 + Math.exp(-((currentDivision/60) - 5)));
  }  
}

export default Calculations;