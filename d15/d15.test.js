const testData = require("./testData");
const { Game } = require("./Game");
const { Goblin, Elf } = require("./Player");

test("When elf is equidistant to goblin, it moves to first goblin in read order", () => {
  const g = new Game(testData.equidistantGoblins);
  g.players.goblins.push(new Goblin([1, 1], g.players, g.paths));
  const { nextPos, enemyPos } = g.players.elves[0].nextMove();
  expect(nextPos).toEqual([3, 1]);
  expect(enemyPos).toEqual([1, 1]);
});

test("When goblin is equidistant to elf, it moves to first elf in read order", () => {
  const g = new Game(testData.equidistantElves);
  g.players.elves.push(new Elf([1, 1], g.players, g.paths));
  const { nextPos, enemyPos } = g.players.goblins[0].nextMove();
  expect(nextPos).toEqual([3, 1]);
  expect(enemyPos).toEqual([1, 1]);
});

test("When elf has multiple equidistant paths to a goblin, it moves to the square in read order", () => {
  const g = new Game(testData.equidistantMove);
  const { nextPos } = g.players.elves[0].nextMove();
  expect(nextPos).toEqual([3, 1]);
});

test("When elf has multiple equidistant paths to a goblin, it moves to the square in read order #2", () => {
  const g = new Game(testData.equidistantMove2);
  const { nextPos } = g.players.elves[0].nextMove();
  expect(nextPos).toEqual([3, 1]);
});

test("When elf is right next to goblin, it doesn't move", () => {
  const g = new Game(testData.noMove);
  const { length } = g.players.elves[0].nextMove();
  expect(length).toBe(0);
});

test("When a player moves, its position updates", () => {
  const g = new Game(testData.playerMoves);
  let i = 3;
  let output = "\n";
  while (i--) {
    g.playRound();
    output += g.print({ silent: true }) + "\n";
  }
  expect(output).toMatchSnapshot();
});

test("When a player moves, its position updates #2", () => {
  const g = new Game(testData.playerMoves2);
  let i = 3;
  let output = "\n";
  while (i--) {
    g.playRound();
    output += g.print({ silent: true }) + "\n";
  }
  expect(output).toMatchSnapshot();
});
