const { Elf, Goblin } = require("./Player");
const { Graph } = require("./Graph");
const { posCompare, __DEBUG } = require("./common");

class Path {
  constructor(pos) {
    this.pos = pos;
  }

  toString() {
    return `[${this.pos}]`;
  }

  valueOf() {
    return this.pos;
  }
}

class Game {
  constructor(data) {
    this.paths = new Graph();
    this.players = { elves: [], goblins: [], pos: new Map() };
    this.rounds = 0;
    this.parseData(data);
  }

  parseData(data) {
    const rows = data.trim().split("\n");
    this.pathsSize = { x: rows[0].length, y: rows.length };

    rows.forEach((row, y) => {
      row.split("").forEach((col, x) => {
        if (col === "." || col === "E" || col === "G") {
          const cur = this.paths.addVertex(new Path([x, y]));
          const left = this.paths.getVertex([x - 1, y]);
          const above = this.paths.getVertex([x, y - 1]);
          /* add edges in the order top, left, right, bottom. This is 'reading' order (ie. ordered top-bottom
        then left-right). By doing so, we can avoid doing more work when finding the shortest path */
          if (above) {
            this.paths.addEdge(cur, above);
          }
          if (left) {
            this.paths.addEdge(cur, left);
          }
          if (col === "E" || col === "G") {
            let player;
            if (col === "E") {
              player = new Elf([x, y], this.players, this.paths);
              this.players.elves.push(player);
            } else if (col === "G") {
              player = new Goblin([x, y], this.players, this.paths);
              this.players.goblins.push(player);
            }
            this.players.pos.set(this.paths.getVertex([x, y]), player);
          }
        }
      });
    });
  }

  play() {
    this.print();
    let lastRoundComplete = false;
    while (!this.isBattleWon()) {
      lastRoundComplete = this.playRound();
      __DEBUG && this.print();
    }

    return this.getOutcome(lastRoundComplete);
  }

  isBattleWon() {
    return this.players.elves.length === 0 || this.players.goblins.length === 0;
  }

  /* returns a boolean whether a full round was played */
  playRound() {
    let players = this.updatePlayerOrder();
    while (players.length && !this.isBattleWon()) {
      const player = players.shift();
      __DEBUG &&
        console.log(
          "Turn: %s #%s",
          player instanceof Elf ? "Elf" : "Goblin",
          player.id
        );
      const { length, nextPos, enemyPos } = player.nextMove();
      if (length > 0 && length !== Infinity) {
        __DEBUG &&
          console.log(
            "%s #%s moves to %s to attack %s at %s",
            player instanceof Elf ? "Elf" : "Goblin",
            player.id,
            nextPos.toString(),
            player.enemy === Elf ? "Elf" : "Goblin",
            enemyPos.toString()
          );
        this.players.pos.delete(this.paths.getVertex(player.pos));
        this.players.pos.set(this.paths.getVertex(nextPos), player);
        player.pos = nextPos;
      }

      const enemyAttacked = player.attack();
      if (enemyAttacked && enemyAttacked.hp <= 0) {
        players = players.filter(p => p !== enemyAttacked);
        this.removePlayer(enemyAttacked);
      }
    }

    this.rounds++;
    return players.length > 0 ? false : true;
  }

  getOutcome(lastRoundComplete) {
    const playersRemaining = [...this.players.elves, ...this.players.goblins];
    const hpSum = playersRemaining.reduce((sum, p) => sum + p.hp, 0);
    const fullRounds = lastRoundComplete ? this.rounds : this.rounds - 1;
    const outcome = hpSum * fullRounds;
    __DEBUG &&
      console.log(
        "hpSum %s, full rounds %s, outcome: %s",
        hpSum,
        fullRounds,
        outcome
      );
    return outcome;
  }

  removePlayer(deadPlayer) {
    let players =
      deadPlayer instanceof Elf ? this.players.elves : this.players.goblins;
    const index = players.findIndex(player => player.id === deadPlayer.id);
    players.splice(index, 1);
    this.players.pos.delete(this.paths.getVertex(deadPlayer.pos));
  }

  updatePlayerOrder() {
    const players = [...this.players.elves, ...this.players.goblins];
    return players.sort((a, b) => posCompare(a.pos, b.pos));
  }

  print({ silent = false } = {}) {
    !silent && console.log("After %s rounds\n", this.rounds);
    let str = "";
    for (let y = 0; y < this.pathsSize.y; y++) {
      for (let x = 0; x < this.pathsSize.x; x++) {
        const path = this.paths.getVertex([x, y]);
        const player = path ? this.players.pos.get(path) : null;

        if (player && player instanceof Elf) {
          str += "E";
        } else if (player && player instanceof Goblin) {
          str += "G";
        } else if (path) {
          str += ".";
        } else {
          str += "#";
        }
      }
      str += "\n";
    }
    !silent && console.log(str);
    !silent && this.printPlayerInfo();
    return str;
  }

  printPlayerInfo() {
    let str =
      this.players.elves
        .map(elf => `Elf #${elf.id} pos: ${elf.pos} hp: ${elf.hp}`)
        .join("\n") +
      "\n" +
      this.players.goblins
        .map(
          goblin => `Goblin #${goblin.id} pos: ${goblin.pos} hp: ${goblin.hp}`
        )
        .join("\n") +
      "\n";
    console.log(str);
  }
}

module.exports = { Game };
