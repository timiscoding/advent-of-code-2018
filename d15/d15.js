const fs = require("fs");
const { filename, timer } = require("../utils");
const { Game } = require("./Game");
const testData = require("./testData");

// play simple example. Enable __DEBUG in common.js to see board steps
// const g = new Game(testData.playerMoves2);
// g.play();

const data = fs.readFileSync(filename).toString();
const [part1, part2] = timer(
  () => {
    console.log("Computing part 1");
    const g = new Game(data);
    const { outcome, hpSum, fullRounds } = g.play();
    return `Outcome:${outcome}, HP Sum:${hpSum}, Full Rounds:${fullRounds}`;
  },
  () => {
    console.log("Computing part 2");
    let res = { outcome: -1 };
    let elfAp = 3;
    let g;
    while (res.outcome === -1) {
      elfAp++;
      g = new Game(data);
      res = g.playBiased(elfAp);
      g.print();
      console.log("Elves %s AP", elfAp, res);
    }
    return `Outcome:${res.outcome}, HP Sum:${res.hpSum}, Full Rounds:${
      res.fullRounds
    }, Elf AP:${elfAp}`;
  }
);

console.table({ "Part 1": part1, "Part 2": part2 });
