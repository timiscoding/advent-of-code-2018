const testData = require("./testData");
const { parseData } = require("./d15");
const { Goblin, Elf } = require("./Player");

test("When elf is equidistant to goblin, it moves to first goblin in read order", () => {
  let data = testData.equidistantGoblins;
  const { paths, players } = parseData(data);
  players.goblins.push(new Goblin([1, 1], players, paths));
  const { nextPos, enemyPos } = players.elves[0].move();
  expect(nextPos).toEqual([3, 1]);
  expect(enemyPos).toEqual([1, 1]);
});

test("When goblin is equidistant to elf, it moves to first elf in read order", () => {
  let data = testData.equidistantElves;
  const { paths, players } = parseData(data);
  players.elves.push(new Elf([1, 1], players, paths));
  const { nextPos, enemyPos } = players.goblins[0].move();
  expect(nextPos).toEqual([3, 1]);
  expect(enemyPos).toEqual([1, 1]);
});

test("When elf has multiple equidistant paths to a goblin, it moves to the square in read order", () => {
  data = testData.equidistantMove;
  const { players } = parseData(data);
  const { nextPos } = players.elves[0].move();
  expect(nextPos).toEqual([3, 1]);
});

test("When elf has multiple equidistant paths to a goblin, it moves to the square in read order #2", () => {
  data = testData.equidistantMove2;
  const { players } = parseData(data);
  const { nextPos } = players.elves[0].move();
  expect(nextPos).toEqual([3, 1]);
});
