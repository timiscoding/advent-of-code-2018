const fs = require("fs");
const { filename } = require("../utils");

const data = fs
  .readFileSync(filename)
  .toString()
  .trim();
// console.log(data);

/* This checks that both a & b are the same letter and that 1 is uppercase and
the other is lowercase or vice versa.

Difference between uppercase and lowercase of the same letter is 32 in unicode.
In binary, bit 2^5 is only different. By XORing, we can avoid doing arithmetic
*/
function willCancel(a = "_", b = "_") {
  return (a.charCodeAt() ^ b.charCodeAt()) === 32;
}

/* This checks that 'a' is either uppercase or lowercase of 'b'
   ORing 32 converts 'a' to lowercase
*/
function isSameLetter(a = "_", b = "_") {
  return (32 | a.charCodeAt()) === b.charCodeAt();
}

/* this recursive method used to solve part 1 */
function reduce(polymer) {
  let reduced = false;
  let newPolymer = "";

  for (let i = 0; i < polymer.length - 1; i++) {
    if (willCancel(...polymer.substr(i, 2))) {
      polymer = polymer.slice(0, i) + polymer.slice(i + 2);
      reduced = true;
    }
  }

  if (reduced) {
    return reduce(polymer);
  }
  return polymer;
}

/* idea 2 for solving part 2 is to use a divide and conquer strategy.
Break string in half, then break each half in half, and so on until we have either
a single unit or a pair. then it's easy to delete ignored letters and units that
cancel out.

Doing so avoids having to strip out the ignored unit from the polymer in the 1st
pass then reduce the polymer in the 2nd pass. */

function reduce2(polymer, ignoreUnit = "_") {
  if (polymer.length === 2) {
    if (willCancel(...polymer)) {
      return "";
    }
    return reduce2(polymer[0], ignoreUnit) + reduce2(polymer[1], ignoreUnit);
  } else if (polymer.length === 1) {
    return !isSameLetter(polymer, ignoreUnit) ? polymer : "";
  }

  const middle = Math.trunc(polymer.length / 2);
  const left = polymer.slice(0, middle);
  const right = polymer.slice(middle);

  const leftRes = reduce2(left, ignoreUnit);
  const rightRes = reduce2(right, ignoreUnit);

  if (leftRes.length === 0 || rightRes.length === 0) {
    return leftRes + rightRes;
  }

  /* check if the 2 letters when the 2 halves join will cancel out
     ie. left is BaCD, and right is dcZa, when joined will be BaCDdcZa
     Dd is cancelled, then Cc
  */
  let l, r;
  for (
    l = leftRes.length - 1, r = 0;
    l >= 0 && r < rightRes.length && willCancel(leftRes[l], rightRes[r]);
    l--, r++
  ) {}

  return leftRes.slice(0, l + 1) + rightRes.slice(r);
}

const ignoreUnits = "abcdefghijklmnopqrstuvwxyz";

console.time("Alg 1 part 1 took");
console.log("Part 1:", reduce(data).length);
console.timeEnd("Alg 1 part 1 took");

console.time("Alg 1 part 2 took");
const reactedLengths = ignoreUnits.split("").map(ignored => {
  const filtered = data.replace(new RegExp(ignored, "gi"), "");
  return reduce(filtered).length;
});
const shortestPolymer = Math.min(...reactedLengths);
console.log("reactedLengths: ", shortestPolymer);
console.timeEnd("Alg 1 part 2 took");

console.time("Alg 2 part 1 took");
console.log("Part 1:", reduce2(data).length);
console.timeEnd("Alg 2 part 1 took");

console.time("Alg 2 part 2 took");
const reactedLengths2 = ignoreUnits
  .split("")
  .map(ignoreUnit => reduce2(data, ignoreUnit).length);
const shortestPolymer2 = Math.min(...reactedLengths2);
console.log("Part 2:", shortestPolymer2);
console.timeEnd("Alg 2 part 2 took");
