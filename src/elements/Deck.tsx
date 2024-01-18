class Deck {
  cards: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                    31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
                    46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];
                          
  Shuffle() {
    let len = this.cards.length;
    while (len !== 0) {
      const i = Math.floor(Math.random() * len);
      len--;
      [this.cards[len], this.cards[i]] = [this.cards[i], this.cards[len]];
    }
  }

  Deal() {
    let dealtCards = this.cards.slice(0, 7);
    return dealtCards;
  }

}

export default Deck;