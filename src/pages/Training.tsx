function Training() {
  return (
    <>
      <h1 style={{color: "rgb(248, 245, 231)"}}>The Basics</h1>
      <div className="lesson-grid">
        <button>Technical Terms</button>
        <button>Poker Hands</button>
        <button>The Betting System</button>
        <button>Bluffing</button>
      </div>
      <h1 style={{color: "rgb(248, 245, 231)"}}>Opponent Play Styles</h1>
      <div className="lesson-grid">
        <button>Honest Opponents</button>
        <button>Cautious Opponents</button>
        <button>Aggresive Opponents</button>
        <button>Unpredictable Opponents</button>
      </div>
      <h1 style={{color: "rgb(248, 245, 231)"}}>Playing Multiple Opponents</h1>
      <div className="lesson-grid">
        <button>Known Opponents</button>
        <button>Unknown Opponents</button>
        <button>A Larger Table</button>
        <button>Custom Game</button>
      </div>
    </>
  )
}

export default Training;