class Deck {
  // Maintains a list of card values (see the Card component) that make up a single deck, and manages fair and unobstructed shuffling of this deck.

  cards: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                    31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
                    46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];
                          
  Shuffle() { // Shuffles the order of the card values using modern Fisher-Yates shuffling algorithm
    let len = this.cards.length;
    while (len !== 0) {
      const i = Math.floor(Math.random() * len);
      len--;
      [this.cards[len], this.cards[i]] = [this.cards[i], this.cards[len]];
    }
  }

  Deal(players: number) { // Returns the appropriate number of cards for the number of players.
    let dealtCards = this.cards.slice(0, 2*players + 5); // Each player has two hole cards, and every game has five communal cards.
    return dealtCards;
  }

}

export default Deck;