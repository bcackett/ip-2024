import { useLocation } from "react-router-dom";
import Board from "../elements/Board";
import NotFound from "./NotFound";


function TrainingScenario() {

  //Player profiles are a 3 element array, with each value corresponding to the intensity % of aggression, bluffing & randomness
  // const { search } = useLocation();
  // const idMatch = search.match(/id=(.*)/);
  // const id = idMatch?.[1].toString();

  const state = useLocation();

  var display;
  switch(state.pathname.substring(state.pathname.length - 2, state.pathname.length)) {
    case ("01"): //Technical terms lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("02"): //Poker hands lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("03"): //Betting system lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("04"): //Bluffing lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("05"): //Honest opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("06"): //Cautious opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("07"): //Aggressive opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("08"): //Unpredictable lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]}/>
      );
    case ("09"): //Known opponents lesson
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
      return(<NotFound />);
  }
}
export default TrainingScenario;