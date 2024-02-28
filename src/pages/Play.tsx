import Board from "../elements/Board";

function Play() {
  let amount = Number(window.prompt("How many players are participaing? Minimum 2, maximum 8."));
  while (amount < 2 || amount > 8) {
    amount = Number(window.prompt("How many players are participaing? Minimum 2, maximum 8."))
  }
  return (
    <Board totalPlayers={amount} computerPlayers={0}/>
  );
}
export default Play;