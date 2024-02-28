import Board from "../elements/Board";
import NotFound from "./NotFound";
import { useLocation } from "react-router-dom";


function TrainingScenario() {
  //Player profiles are a 3 element array, with each value corresponding to the intensity % of aggression, bluffing & randomness
  const { search } = useLocation();
  const idMatch = search.match(/id=(.*)/);
  const id = idMatch?.[1].toString();

  var display;
  switch(id) {
    case ("1"): //Technical terms lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("2"): //Poker hands lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("3"): //Betting system lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("4"): //Bluffing lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("5"): //Honest opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("6"): //Cautious opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("7"): //Aggressive opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("8"): //Unpredictable lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("9"): //Known opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("10"): //Unknown opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("11"): //Larger table lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("12"): //Custom lesson STILL TO DO
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    default: //Any edge cases
      return ( <NotFound /> );
  }
}
export default TrainingScenario;