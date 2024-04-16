class TeachingText {
  prompts: Map<number, Array<string>> = new Map([
    [1, ["Poker has a lot of technical terms that will be referenced in all of the other lessons. Here, the cards only you can see (at the bottom of the screen) are called \"hole cards\".",
      "The cards everyone can see (at the top of the screen) are called \"communal cards\". The turn where the first three are dealt is called the \"flop\".",
      "The turn where the fourth communal card is dealt is called the \"turn\". The amount of money everyone has bet (in the middle of the screen) is called \"the pot\".",
      "Knowing these terms you learn in this lesson, you're ready to use PokerEdu to its fullest! Enjoy!"
    ]],
    [2, ["The way to win Poker is by having the strongest hand at the end of each round, or by having every other player fold. There are 10 total hands, with the worst being High Card and the best being Royal Flush.",
      "As more community cards are dealt, you get a better idea of how strong your hand is. You can see your best current hand at the bottom of the board!",
      "The ten possible hands from best to worst are: Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, Pair, High Card.",
      "Your best hand is the best combination of 5 cards you can make using your hole cards and any known communal cards. Once all five communal cards are known, your best hand cannot improve any further."
    ]],
    [3, ["Betting involves three actions: matching the current bet (called \"checking\" if the current bet is 0), raising the bet, or folding (removing yourself from the game)",
      "Each betting round continues until every player (except those that have folded) have bet the same amount. At this point, a new card is dealt and play returns to the first player.",
      "If a player chooses to fold, they no longer contribute any money to the pot, but can no longer participate in this round. This usually happens when the bet is high and a player's hand is weak.",
      "If a player runs out of money before the end of a round, they can only fold or check. If they have no money in the bank and they lose the round, they can no longer participate."
    ]],
    [4, ["Bluffing is the art of tricking opponents into thinking your hand is better or worse than it actually is. It is often achieved by betting high with low cards to pressure opponents into folding. Try it on this opponent!",
      "Bluffing can be risky, but is a good opportunity to win a game in a situation where no player has particularly strong cards. It's also worth remembering that an opponent betting high could also be bluffing.",
      "Some players may also choose not to bet high, even with a strong hand, in order to keep as many players in the game as possible if they think they will win more this way. This is not used as often though.",
      "If a player \"calls your bluff\" and stays in the game, it's possible bluffing could leave you losing more than you gain. Remember, bluffing is risky, so try it out against our computers before using it on your friends!"
    ]],
    [5, ["In this lesson you'll learn how to play against the easiest kind of opponent. This player will always bet honestly according to their hand. Try to figure out how good their hand is just from their bets!"]],
    [6, ["In this lesson you'll learn how to play against opponents that play cautiously. They will rarely bet high, and will likely fold if you apply some pressure. Try it out!"]],
    [7, ["In this lesson you'll learn how to play against aggresive opponents. These players are likely to raise bets, even as a bluff if they have a weak hand. See if you can figure out when to call their bluff!"]],
    [8, ["In this lesson you'll learn how to play against the hardest kind of opponent: unpredictable players. These players make decisions more randomly, making them harder to read. See if you can outplay this tough computer!"]],
    [9, ["From here, lessons get more challenging. You'll be playing against an opponent with less exaggerated personalities, but this time we'll tell you how they'll act. "]],
    [10, ["The computer player is still more well-rounded in this lesson, but at this point we won't tell you how they're going to act. Time to put everything you've learned into action!"]],
    [11, ["So far you've only been playing against a single opponent. This is known as \"Heads-Up Poker\". Now it's time to try playing at a larger table of different players with different approaches. Good luck!"]],
    [12, ["These computer players are your own creations! This is a great chance to practice against different balances of play styles. Play against these players for as long as you like, then leave the page when you want to reset them."]]
  ]);

  returnTargetPrompt(lessonNum: number, roundNum: number) {
    let promptList = this.prompts.get(lessonNum);
    if (promptList) {
      return this.prompts.get(lessonNum)![roundNum];
    }
    return "Error: no target prompt found.";
  }
}

export default TeachingText;