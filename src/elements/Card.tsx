type CardValue = {
  /*
  The val variable gives both the suit and the rank of the card.
  val / 15 gives suit, val % 15 gives rank
  val / 15 = 0 -> Hearts, = 1 -> Diamonds, = 2 -> Clubs, = 3 -> Spades
  val % 15 = 1 or 14 -> Ace
  Eg: 22 (15 * 1 + 7) = Seven of Diamonds,
  Eg: 59 (15 * 3 + 14) = Ace (high) of Spades.
  */
  val: number;
};

function NumToRank(num: number) {
  // Converts a card value to the card's rank by using modulo.
  num = num % 15;
  if (num === 11) {
    return "J"; // Jack
  } else if (num === 12) {
    return "Q"; // Queen
  } else if (num === 13) {
    return "K"; // King
  } else if (num === 14 || num === 1) {
    return "A"; // Ace (both low and high, they are displayed using the same character)
  } else {
    return num.toString();
  }
}

function NumToSuit(num: number) {
  num = Math.floor(num / 15);
  if (num === 0) {
    return "\u2665"; // Hearts
  } else if (num === 1) {
    return "\u2666"; // Diamonds
  } else if (num === 2) {
    return "\u2663"; // Clubs
  } else {
    return "\u2660"; // Spades
  }
}

function Card({ val }: CardValue){
  // Returns a visual representation of a playing card based on its card value as defined above.
  if (val / 15 < 2) { // If value/15 < 2, the card is either a heart or diamond, both of which are red suits.
    return (
      <button id="card-face" type="button" style={{color: "rgba(125, 2, 2, 1)"}}>
        <div style={{position: "absolute", top: 0, left: 0, textAlign: "left"}}>
          {NumToRank(val)}
        </div>
        <div style={{position: "absolute", bottom: 0, right: 0, textAlign: "right"}}>
          {NumToRank(val)}
        </div>
        {NumToSuit(val)}
      </button>
    )
  } else { // Otherwise, the card is either a club or spade, both of which are black suits.
    return (
      <button id="card-face" type="button" style={{color: "rgba(4, 0, 26, 1)"}}>
        <div style={{position: "absolute", top: 0, left: 0, textAlign: "left"}}>
          {NumToRank(val)}
        </div>
        <div style={{position: "absolute", bottom: 0, right: 0, textAlign: "right"}}>
          {NumToRank(val)}
        </div>
        {NumToSuit(val)}
      </button>
    )
  }
}

export default Card;