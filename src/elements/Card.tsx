type CardValue = {
  suit: string;
  rank: string;
};

function Card({ suit, rank }: CardValue){
  if (suit == "H") {
    return (
      <div id="card-face" style={{color: "rgba(125, 2, 2, 1)"}}>
        <div style={{position: "absolute", top: 0, left: 0, textAlign: "left"}}>
          {rank}
        </div>
        <div style={{position: "absolute", bottom: 0, right: 0, textAlign: "right"}}>
          {rank}
        </div>
        {"\u2665"}
      </div>
    )
  }
  else if (suit == "D") {
    return (
      <div id="card-face" style={{color: "rgba(125, 2, 2, 1)"}}>
        <div style={{position: "absolute", top: 0, left: 0, textAlign: "left"}}>
          {rank}
        </div>
        <div style={{position: "absolute", bottom: 0, right: 0, textAlign: "right"}}>
          {rank}
        </div>
        {"\u2666"}
      </div>
    )
  }
  else if (suit == "C") {
    return (
      <div id="card-face" style={{color: "rgba(4, 0, 26, 1)"}}>
        <div style={{position: "absolute", top: 0, left: 0, textAlign: "left"}}>
          {rank}
        </div>
        <div style={{position: "absolute", bottom: 0, right: 0, textAlign: "right"}}>
          {rank}
        </div>
        {"\u2663"}
      </div>
    )
  }
  else {
    return (
      <div id="card-face" style={{color: "rgba(4, 0, 26, 1)"}}>
        <div style={{position: "absolute", top: 0, left: 0, textAlign: "left"}}>
          {rank}
        </div>
        <div style={{position: "absolute", bottom: 0, right: 0, textAlign: "right"}}>
          {rank}
        </div>
        {"\u2660"}
      </div>
    )
  }
}

export default Card;