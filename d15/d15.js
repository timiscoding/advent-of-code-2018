const fs = require("fs");
const { filename } = require("../utils");
const { Game } = require("./Game");
const testData = require("./testData");

// const data = fs.readFileSync(filename).toString();
// const g = new Game(data);
// const outcome = g.play();
// console.log("Part 1 outcome: ", outcome);

// const data = fs.readFileSync(filename).toString();
const data = testData.testHelpElvesWin5;
// let outcome = -1;
// for (let elfAp = 4; outcome === -1; elfAp++) {
//   const g = new Game(data);
//   console.log(
//     "Elf count %s. Goblin count %s. Elf attack power %s",
//     g.players.elves.length,
//     g.players.goblins.length,
//     elfAp
//   );
//   outcome = g.playBiased(elfAp);
// }
// console.log("Outcome", outcome);

const g = new Game(data);
g.playBiased(16);
