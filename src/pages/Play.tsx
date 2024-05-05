import { useNavigate } from "react-router-dom";
import Board from "../elements/Board";

function Play() {
  let nullableAmount = window.prompt("How many players are participating? Minimum 2, maximum 8.");
  let amount = Number(nullableAmount);
  while ((amount < 2 || amount > 8) && nullableAmount !== null) {
    nullableAmount = window.prompt("How many players are participating? Minimum 2, maximum 8.");
    amount = Number(nullableAmount);
  }

  if (nullableAmount === null) {
    window.location.assign(window.location.href.slice(0, -4));
    return (null);
  } else {
    return (
      <Board totalPlayers={amount} computerPlayers={0}/>
    );
  }
}
export default Play;