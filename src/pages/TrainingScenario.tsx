import { useLocation } from "react-router-dom";
import Board from "../elements/Board";
import NotFound from "./NotFound";


function TrainingScenario() {

  //Player profiles are a 3 element array, with each value corresponding to the intensity % of aggression, bluffing & randomness
  // const { search } = useLocation();
  // const idMatch = search.match(/id=(.*)/);
  // const id = idMatch?.[1].toString();

  const state = useLocation();

  function generateTraitsFromSet() {
    let traits = [[80, 10, 10], [10, 80, 10], [10, 0, 10], [0, 0, 40]];
    return traits[Math.floor(Math.random() * 4)];
  }

  function generateRandomTraits() {
    return [Math.floor(Math.random() * 101), Math.floor(Math.random() * 101), Math.floor(Math.random() * 101)]
  }

  var display;
  switch(state.pathname.substring(state.pathname.length - 2, state.pathname.length)) {
    case ("01"): //Technical terms lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]} lessonNum={1}/>
      );
    case ("02"): //Poker hands lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]} lessonNum={2}/>
      );
    case ("03"): //Betting system lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]} lessonNum={3}/>
      );
    case ("04"): //Bluffing lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 40, 0]]} lessonNum={4}/>
      );
    case ("05"): //Honest opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[30, 0, 0]]} lessonNum={5}/>
      );
    case ("06"): //Cautious opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[10, 0, 10]]} lessonNum={6}/>
      );
    case ("07"): //Aggressive opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[80, 10, 10]]} lessonNum={7}/>
      );
    case ("08"): //Unpredictable lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 100]]} lessonNum={8}/>
      );
    case ("09"): //Known opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[generateTraitsFromSet()]} lessonNum={9}/>
      );
    case ("10"): //Unknown opponents lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[generateTraitsFromSet()]} lessonNum={10}/>
      );
    case ("11"): //Larger table lesson
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[generateRandomTraits(), generateRandomTraits(), generateRandomTraits()]} lessonNum={11}/>
      );
    case ("12"): //Custom lesson STILL TO DO
      return (
        <Board totalPlayers={2} computerPlayers={1} playerProfiles={[[0, 0, 0]]} lessonNum={12}/>
      );
    default: //Any edge cases
      return(<NotFound />);
  }
}
export default TrainingScenario;