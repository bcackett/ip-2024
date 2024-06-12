import { useState } from "react";

function GambleAwareBar() {

  // This displays a simple bar providing information for those feeling they are or someone they know is suffering from gambling addiction.

  return (
    <div id="gamble-bar" /*hidden={hiddenBar}*/ style={{marginBottom: "1vw"}}>
      <h2 className="gamble-warning">Gambling can be addictive and should be fun, not harmful. GetPokerEd does not and will never use any form of real currency, nor will it ever ask for payment information. However, play should still be self-regulated. Play to your limits. If you feel that you or someone you know needs help with gambling addiction, visit BeGambleAware.org.</h2>
      {/* <button className="hollow-button" onClick={() => hideBar()}>x</button>     */}
    </div>
  )
}

export default GambleAwareBar;