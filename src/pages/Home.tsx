import { useNavigate } from "react-router-dom";

function Welcome() {
  const nav = useNavigate();

  const goToPlay = () => {
    nav("/play")
  }

  const goToTrain = () => {
    nav("/train")
  }
  return (
    <>
      <div className="name-frame">
        <h1>Welcome to I.Poker!</h1>
      </div>
      <div>
        <label>I.Poker is a one-site-fits-all solution to learning and improving at Texas Hold 'Em Poker!</label>
      </div>
      <div>
        <button className="spaced-button" type="button" onClick={goToTrain}>
          Training Lessons
        </button>
        <button className="spaced-button" type="button" onClick={goToPlay}>
          Play Online
        </button>
      </div>
    </>
  );
}

export default Welcome;