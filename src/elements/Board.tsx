import { table } from "console";
import Card from "./Card"
import Deck from "./Deck"

type roomSize = {
  players: number;
}

function HoleDeal() {
  document.getElementById("hole-button")!.hidden = true;
  document.getElementById("flop-button")!.hidden = false;
  document.getElementById("hole-cards")!.hidden = false;
}

function FlopDeal() {
  document.getElementById("flop-button")!.hidden = true;
  document.getElementById("turn-button")!.hidden = false;
  document.getElementById("flop-cards")!.hidden = false;

}

function TurnDeal() {
  document.getElementById("turn-button")!.hidden = true;
  document.getElementById("river-button")!.hidden = false;
  document.getElementById("turn-card")!.hidden = false;
}

function RiverDeal() {
  document.getElementById("river-button")!.hidden = true;
  document.getElementById("hole-button")!.hidden = false;
  document.getElementById("river-card")!.hidden = false;
}

function Board({players} : roomSize) {
  var deck: Deck = new Deck;
  deck.Shuffle();
  var cards = deck.Deal();
  return (
    <div id="table">
      <button onClick={HoleDeal} className="spaced-button" id="hole-button" type="button">
        Deal Hole
      </button>
      <button onClick={FlopDeal} className="spaced-button" id="flop-button" type="button" hidden={true}>
        Deal Flop
      </button>
      <button onClick={TurnDeal} className="spaced-button" id="turn-button" type="button" hidden={true}>
        Deal Turn
      </button>
      <button onClick={RiverDeal} className="spaced-button" id="river-button" type="button" hidden={true}>
        Deal River
      </button>
      <div id="hole-cards" hidden={true}>
        <Card suit={cards[0].slice(-1)} rank={cards[0].slice(0,-1)}/>      
        <Card suit={cards[1].slice(-1)} rank={cards[1].slice(0,-1)}/>
      </div>
      <div className="communal-cards">
        <div id="flop-cards" hidden={true}style={{float:"left"}}>
          <Card suit={cards[2].slice(-1)} rank={cards[2].slice(0,-1)}/>
          <Card suit={cards[3].slice(-1)} rank={cards[3].slice(0,-1)}/>
          <Card suit={cards[4].slice(-1)} rank={cards[4].slice(0,-1)}/>
        </div>
        <div id="turn-card" hidden={true} style={{float:"left"}}>
          <Card suit={cards[5].slice(-1)} rank={cards[5].slice(0,-1)}/>
        </div>
        <div id="river-card" hidden={true} style={{float:"left"}}>
          <Card suit={cards[6].slice(-1)} rank={cards[6].slice(0,-1)}/>
        </div>
      </div>
    </div>
  );
}

export default Board;