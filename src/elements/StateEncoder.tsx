class StateEncoder {
  private cards: number[] = [];
  private foldedPlayers: number[] = [];
  private pot: number = 0;
  private playerBanks: number[] = [];
  private playerBets: number[] = [];
  private gameState: number = 0;
  private startingPlayer: number = 0;
  private currentPlayer: number = 0;
  private potStartOfRound: number = 0;

  encode(cards: number[], foldedPlayers: number[], pot: number, potStartOfRound: number,  playerBanks: number[], playerBets: number[], gameState: number, startingPlayer: number, currentPlayer: number) {
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
    result += "\n" + gameState.toString() + "," + startingPlayer.toString() + "," + currentPlayer.toString();
    return result;
  }

  decode(input: string) {
    let lines = input.split("\n");

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
      } else {
        let endData = line.map(x => Number(x));
        this.gameState = endData[0];
        this.startingPlayer = endData[1];
        this.currentPlayer = endData[2];
      }
    }
  }

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