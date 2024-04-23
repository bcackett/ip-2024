import { useState } from "react";
import { useNavigate } from "react-router-dom";

type UserDetails = {
  userID?: number;
}

function Welcome(id: UserDetails) {

  const nav = useNavigate();

  const goToPlay = () => {
    nav("/play")
  }

  const goToTrain = () => {
    nav("/train")
  }

  return (
    <>
      <h1 style={{padding: "20px 20px 20px 20px", color:"rgb(248, 245, 231)"}}>Welcome to GetPokerEd!</h1>
      <div>
        <label style={{color: "#f5f8e7"}}>GetPokerEd is a one-site-fits-all solution to learning and improving at Texas Hold 'Em Poker!</label>
      </div>
      <div>
        <button className="spaced-button" type="button" onClick={goToTrain}>
          Training Lessons
        </button>
        <button className="spaced-button" type="button" onClick={goToPlay}>
          Play Locally
        </button>
      </div>
    </>
  );
}

export default Welcome;