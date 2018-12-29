const fs = require("fs");
const { filename } = require("../utils");

const data = fs.readFileSync(filename).toString();

const dir = { N: "N", S: "S", E: "E", W: "W" };
const move = {
  [dir.N]: p => [p[0], p[1] + 1],
  [dir.S]: p => [p[0], p[1] - 1],
  [dir.E]: p => [p[0] + 1, p[1]],
  [dir.W]: p => [p[0] - 1, p[1]]
};

/* Ohhhhhh boy.... went down a massive rabbit hole with my own part 2 solution
using a tree (see prev commits lolz) which ended up not even working so I found
https://todd.ginsberg.com/post/advent-of-code/2018/day20/
and implemented it once I understood how it worked. I think I didn't
understand the problem and started tackling it from the perspective that I'd have
to find the shortest/longest path so I was needlessly making things harder for myself */
function map(regex) {
  let curLoc = [0, 0];
  const dist = { [curLoc]: 0 }; // location [x,y] mapped to distance to X
  const prevLocs = [];
  regex.split("").forEach(c => {
    if (dir[c]) {
      const newLoc = move[c](curLoc);
      if (!dist[newLoc]) dist[newLoc] = dist[curLoc] + 1;
      curLoc = newLoc;
    }
    if (c === "(") {
      prevLocs.push(curLoc);
    }
    if (c === ")") {
      curLoc = prevLocs.pop();
    }
    if (c === "|") {
      curLoc = prevLocs[prevLocs.length - 1];
    }
  });
  return dist;
}

const distances = map(data);

const pt1 = Math.max(...Object.values(distances));
const pt2 = Object.values(distances).reduce(
  (rooms, loc) => rooms + Number(loc >= 1000),
  0
);
console.log("pt1: ", pt1);
console.log("pt2: ", pt2);
