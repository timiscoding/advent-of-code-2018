const fs = require("fs");
const { filename, timer } = require("../utils");

class ListSet extends Set {
  constructor(arr = []) {
    super(arr);
    this.arr = arr;
  }

  add(int) {
    if (!super.has(int)) {
      this.arr.push(int);
      super.add(int);
    }
    return this;
  }

  first() {
    return this.arr[0];
  }

  last() {
    return this.arr[this.arr.length - 1];
  }

  clear() {
    super.clear();
    this.arr = [];
  }

  toString() {
    return this.arr.toString();
  }
}

function parseData() {
  const [initStateStr, , ...rulesStr] = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n");

  const initState = initStateStr
    .split(" ")[2]
    .split("")
    .reduce((res, char, i) => (char === "#" ? res.add(i) : res), new ListSet());

  const rules = rulesStr
    .filter(r => r.split(" ")[2] === "#")
    .map(r =>
      r
        .split(" ")[0]
        .split("")
        .reduce((res, char) => res.concat(char === "#" ? true : false), [])
    );

  return {
    initState,
    rules
  };
}

function printGens(gens) {
  const minPlantPos = gens.reduce(
    (min, g) => Math.min(min, Math.min(...g)),
    Infinity
  );
  const maxPlantPos = gens.reduce(
    (max, g) => Math.max(max, Math.max(...g)),
    -Infinity
  );
  console.log("Min plant pos: %s, max plant pos: %s", minPlantPos, maxPlantPos);
  gens.forEach(g => {
    let genStr = "";
    for (let i = minPlantPos - 1; i <= maxPlantPos + 1; i++) {
      genStr += g.has(i) ? "#" : ".";
    }
    console.log(genStr);
  });
}

function plantsAllGen(initState, rules, generations) {
  const gens = Array(generations + 1)
    .fill()
    .map((_, i) => (i === 0 ? initState : new ListSet()));
  const neighbours = [-2, -1, 0, 1, 2];

  for (let curGen = 1; curGen < gens.length; curGen++) {
    const lastGen = gens[curGen - 1];
    for (
      let plantPos = lastGen.first() - 2, lastIndex = lastGen.last() + 2;
      plantPos <= lastIndex;
      plantPos++
    ) {
      rules.some(rule => {
        if (rule.every((r, i) => lastGen.has(plantPos + neighbours[i]) === r)) {
          gens[curGen].add(plantPos);
          return true;
        }
      });
    }
  }

  return gens;
}

function plantsLastGen(initState, rules, generations) {
  let lastGen = initState;
  let curGen = new ListSet();
  const neighbours = [-2, -1, 0, 1, 2];
  console.log("Computing %s generations", generations);
  while (generations--) {
    if (generations % 100000 === 0) {
      console.log("%s gens remain to be processed.", generations);
    }

    for (
      let plantPos = lastGen.first() - 2, lastIndex = lastGen.last() + 2;
      plantPos <= lastIndex;
      plantPos++
    ) {
      rules.some(rule => {
        if (rule.every((r, i) => lastGen.has(plantPos + neighbours[i]) === r)) {
          curGen.add(plantPos);
          return true;
        }
      });
    }
    lastGen = curGen;
    curGen = new ListSet();
  }
  return lastGen;
}

function genSum(gen) {
  return [...gen].reduce((sum, plantPos) => sum + plantPos, 0);
}

/* took me waaaaaaayy too long to realise computing 50 billion generations
  would be infeasible!! So lets try to see if there's a pattern instead.

           500             22_620
         5_000            225_120
        50_000          2_250_120
       500_000         22_500_120
     5_000_000        225_000_120
50_000_000_000  2_250_000_000_120

part 2: 2250000000120
*/
function gen50B(initState, rules) {
  return [1, 2, 3, 4].map((_, i) => () => {
    const gens = 500 * 10 ** i;
    const gen = plantsLastGen(initState, rules, gens);
    return genSum(gen);
  });
}

function main() {
  const { initState, rules } = parseData();
  let all20gens;
  const [part1, ...part2] = timer(() => {
    all20gens = plantsAllGen(initState, rules, 20);
    return genSum(all20gens[all20gens.length - 1]);
  }, ...gen50B(initState, rules));

  console.log("20 generations:");
  printGens(all20gens);

  console.table({
    "Part 1 20th gen plant sum": part1,
    "Part 2 500 gen": part2[0],
    "Part 2 5_000 gen": part2[1],
    "Part 2 50_000 gen": part2[2],
    "Part 2 500_000 gen": part2[3]
  });
}

main();
