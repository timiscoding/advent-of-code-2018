const { timer } = require("../utils");
const assert = require("assert");

function getNewRecipes(sum) {
  const newRecipes = [];

  if (sum === 0) return [0];

  while (sum !== 0) {
    newRecipes.unshift(sum % 10);
    sum = Math.trunc(sum / 10);
  }

  return newRecipes;
}

function pickRecipe(curRecipes, scores) {
  return curRecipes.map(cur => {
    const curRecipe = scores[cur];
    const pickedRecipe = (cur + curRecipe + 1) % scores.length;
    return pickedRecipe;
  });
}

function next10(scoreCount) {
  const scores = [3, 7];
  const minScores = 10 + scoreCount;
  let curRecipes = [0, 1];

  while (scores.length < minScores) {
    const sum = curRecipes.reduce((sum, cur) => sum + scores[cur], 0);
    scores.push(...getNewRecipes(sum, curRecipes.length));
    curRecipes = pickRecipe(curRecipes, scores);
  }
  return scores.slice(scoreCount, scoreCount + 10).join("");
}

function indexOfSeq(seq, scores) {
  const lastSeq = scores.slice(-seq.length).join("");
  const lastLastSeq = scores.slice(-seq.length - 1, scores.length - 1).join("");
  if (lastSeq === seq) {
    return scores.length - seq.length;
  } else if (lastLastSeq === seq) {
    return scores.length - seq.length - 1;
  }

  return -1;
}

function recipesBefore(seq) {
  const scores = [3, 7];
  let curRecipe = [0, 1];

  while (true) {
    const sum = scores[curRecipe[0]] + scores[curRecipe[1]];
    const newRecipes = getNewRecipes(sum);

    scores.push(...newRecipes);

    const match = indexOfSeq(seq, scores);
    if (match !== -1) {
      return match;
    }

    curRecipe = pickRecipe(curRecipe, scores);
    if (scores.length % 100000 === 0) {
      console.log("\u001b[2J\u001b[0;0H"); // clears screen
      console.log(
        "Part 2 - scores computed:",
        Number(scores.length).toLocaleString()
      );
    }
  }
}

function testExamples() {
  // part 1
  assert.strictEqual(next10(5).toString(), "0124515891");
  assert.strictEqual(next10(9).toString(), "5158916779");
  assert.strictEqual(next10(18).toString(), "9251071085");
  assert.strictEqual(next10(2018).toString(), "5941429882");

  // part 2
  assert.strictEqual(recipesBefore("51589"), 9);
  assert.strictEqual(recipesBefore("01245"), 5);
  assert.strictEqual(recipesBefore("92510"), 18);
  assert.strictEqual(recipesBefore("59414"), 2018);
}

testExamples();

const input = 323081;
const inputfstr = Number(input).toLocaleString();
const [part1, part2] = timer(
  () => next10(input),
  () => recipesBefore(String(input))
);

console.table({
  [`Next 10 scores after ${inputfstr} recipes`]: part1,
  [`Number of recipes before score sequence ${inputfstr}`]: part2
});
