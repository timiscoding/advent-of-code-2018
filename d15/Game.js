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
    for (let i = 0; i < 47; i++) {
      this.playRound();
      this.print();
    }
  }

  playRound() {
    let players = this.updatePlayerOrder();
    while (players.length) {
      const player = players.shift();
      __DEBUG &&
        console.log(
          "Turn: %s #%s",
          player instanceof Elf ? "Elf" : "Goblin",
          player.id
        );
      const { length, nextPos, enemyPos } = player.nextMove();
      if (length > 0 && length !== Infinity) {
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
  }

  removePlayer(player) {
    let players =
      player instanceof Elf ? this.players.elves : this.players.goblins;
    const index = players.findIndex(elf => elf.id === player.id);
    this.players.elves.splice(index, 1);

    this.players.pos.delete(this.paths.getVertex(player.pos));
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
