import { useLocation } from "react-router-dom";
import Board from "../elements/Board";
import NotFound from "./NotFound";


function TrainingScenario() {

  //Player profiles are a 3 element array, with each value corresponding to the intensity % of aggression, deception (bluffing) & unpredictability (randomness)

  const state = useLocation(); // Uses the URL of the current page to determine which lesson to display.

  function generateTraitsFromSet() {
    // This array of traits is used to pseudo-randomly generate a computer opponent's personality values from a fixed set of possibilities.
    // Used in the known and unknown opponent lessons (9 & 10), when the behaviour of the computer player should not be fixed, but should be known in advance.
    let traits = [[80, 10, 10], [10, 80, 10], [10, 0, 10], [0, 0, 40]];
    return traits[Math.floor(Math.random() * 4)];
  }

  function generateRandomTraits() {
    // Generates a pseudo-random series of three values between 0 and 100 to make up a completely unique computer opponent.
    // Used in the larger table lesson (11) when the behaviour of the opponents does not need to be known in advance.
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
        <Board totalPlayers={4} computerPlayers={3} playerProfiles={[generateRandomTraits(), generateRandomTraits(), generateRandomTraits()]} lessonNum={11}/>
      );
    default: //Any edge cases
      return(<NotFound />);
  }
}
export default TrainingScenario;