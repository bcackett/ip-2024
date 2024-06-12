class StateEncoder {
  // This class is responsible for encoding and decoding game states into and out of a CSV-adjacent format.
  // All variables are private as they should not be changed outside of this class, as this would risk corrupting the saved state.
  // Characters other than new lines and commas could have been used, but these characters make it easier to read and would make adding import/export functionality much easier in a future update.
  private cards: number[] = [];
  private foldedPlayers: number[] = [];
  private pot: number = 0;
  private playerBanks: number[] = [];
  private playerBets: number[] = [];
  private gameState: number = 0;
  private startingPlayer: number = 0;
  private currentPlayer: number = 0;
  private potStartOfRound: number = 0;
  private playText: string = "";
  private warningText: string[] = new Array();

  encode(cards: number[], foldedPlayers: number[], pot: number, potStartOfRound: number,  playerBanks: number[], playerBets: number[], gameState: number, startingPlayer: number, currentPlayer: number, playText: string, warningText: string[]) {
    // Encodes all of the variables necessary to exactly recreate a game state into a single string separated by commas and new lines.
    let result = "";
    let i: number;
    for (i = 0; i < cards.length; i++) {
      result += cards[i].toString();
      if (i !== cards.length - 1) {
        result += ",";
      }
    }
    result += "\n";
    for (i = 0; i < foldedPlayers.length; i++) {
      result += foldedPlayers[i].toString();
      if (i !== foldedPlayers.length - 1) {
        result += ",";
      }
    }
    result += "\n" + pot.toString() + "," + potStartOfRound.toString() + ",";
    for (i = 0; i < playerBanks.length; i++) {
      result += playerBanks[i].toString();
      if (i !== playerBanks.length - 1) {
        result += ",";
      }
    }
    result += "\n";
    for (i = 0; i < playerBets.length; i++) {
      result += playerBets[i].toString();
      if (i !== playerBets.length - 1) {
        result += ",";
      }
    }
    result += "\n" + playText.replaceAll("\n\n", "|").replaceAll(",", "/"); // New line characters and commas are replaced as these characters are reserved for the formatting of the overall string.
    for (i = 0; i < warningText.length; i++) {
      result += "\n" + warningText[i].replaceAll("\n\n", "|").replaceAll(",", "/");
    }
    result += "\n" + gameState.toString() + "," + startingPlayer.toString() + "," + currentPlayer.toString();
    return result;
  }

  decode(input: string) {
    // Encodes all of the variables necessary to exactly recreate a game state into a single string separated by commas and new lines.
    let lines = input.split("\n");
    let warningTextIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].split(",");
      if (i === 0) {
        this.cards = line.map(x => Number(x));
      } else if (i === 1) {
        this.foldedPlayers = line.map(x => Number(x));
      } else if (i === 2) {
        this.playerBanks = line.map(x => Number(x));
        this.pot = this.playerBanks.shift()!;
        this.potStartOfRound = this.playerBanks.shift()!;
      } else if (i === 3) {
        this.playerBets = line.map(x => Number(x));
      } else if (i === 4) {
        this.playText = line[0].replaceAll("|", "\n\n").replaceAll("/", ","); // The other separation characters are reverted back to new lines and commas.
      } else if ( i < lines.length - 1) {
        this.warningText[warningTextIndex] = line[0].replaceAll("|", "\n\n").replaceAll("/", ",");
        warningTextIndex++;
      }
      else {
        let endData = line.map(x => Number(x));
        this.gameState = endData[0];
        this.startingPlayer = endData[1];
        this.currentPlayer = endData[2];
      }
      console.log(this.warningText);
    }
  }

  // All functions beyond this point retrieve individual pieces of data stored in this instance of the StateEncoder.
  // These functions ensure that the variables in this class can remain private and will never be edited in other files.

  getCards() {
    return this.cards;
  }

  getFoldedPlayers() {
    return this.foldedPlayers;
  }

  getPot() {
    return this.pot;
  }

  getPotStartOfRound() {
    return this.potStartOfRound;
  }

  getPlayerBanks() {
    return this.playerBanks;
  }

  getPlayerBets() {
    return this.playerBets;
  }

  getPlayText() {
    return this.playText;
  }

  getWarningText() {
    return this.warningText;
  }

  getGameState() {
    return this.gameState;
  }

  getStartingPlayer() {
    return this.startingPlayer;
  }

  getCurrentPlayer() {
    return this.currentPlayer
  }
}

export default StateEncoder;