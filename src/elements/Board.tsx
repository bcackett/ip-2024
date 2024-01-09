import { table } from "console";
import Card from "./Card"

type roomSize = {
  players: number;
}

function HoleDeal() {
  document.getElementById("hole-button")!.hidden = true;
  document.getElementById("flop-button")!.hidden = false;
}

function FlopDeal() {
  document.getElementById("flop-button")!.hidden = true;
  document.getElementById("turn-button")!.hidden = false;

}

function TurnDeal() {
  document.getElementById("turn-button")!.hidden = true;
  document.getElementById("river-button")!.hidden = false;
}

function RiverDeal() {
  document.getElementById("river-button")!.hidden = true;
  document.getElementById("hole-button")!.hidden = false;
}

function Board({players} : roomSize) {
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
    </div>
  );
}

export default Board;