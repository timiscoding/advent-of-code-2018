const fs = require("fs");
const { filename } = require("../utils");

function parseData() {
  const data = fs.readFileSync(filename).toString();
  return data
    .trim()
    .split("\n")
    .map(line => {
      const [, x, y, z, r] = line
        .match(/(-?\d+),(-?\d+),(-?\d+).+r=(\d+)/)
        .map(Number);
      return {
        pos: [x, y, z],
        rad: r
      };
    });
}

function isBotInRange(a, b) {
  const dist =
    Math.abs(a.pos[0] - b.pos[0]) +
    Math.abs(a.pos[1] - b.pos[1]) +
    Math.abs(a.pos[2] - b.pos[2]);
  return dist <= b.rad;
}

const bots = parseData();
const maxRadBot = bots.reduce(
  (res, p) => {
    if (p.rad >= res.rad) {
      return p;
    }
    return res;
  },
  { pos: null, rad: 0 }
);

console.log("maxrad", maxRadBot);

function botsInRange(bot) {
  return bots.reduce((res, b) => {
    return isBotInRange(b, bot) ? res.concat(b) : res;
  }, []);
}

console.log(botsInRange(maxRadBot).length);

function lineIntersect(a, b) {
  return a[0] <= b[1] && a[1] >= b[0];
}

/* box is an array [xs, ys, zs, xe, ye, ze] where xs, ys, zs are the start coordinates and
xe, ye, ze are the end coordinates */
function isBoxIntersect(b1, b2) {
  const xB1 = [b1[0], b1[3]]; // x segment of box 1
  const yB1 = [b1[1], b1[4]]; // y segment of box 1
  const zB1 = [b1[2], b1[5]]; // z segment of box 1
  const xB2 = [b2[0], b2[3]];
  const yB2 = [b2[1], b2[4]];
  const zB2 = [b2[2], b2[5]];
  return (
    lineIntersect(xB1, xB2) &&
    lineIntersect(yB1, yB2) &&
    lineIntersect(zB1, zB2)
  );
}

/* given a bot with a pos and radius, returns the bounding box in the format [xs, ys, zs, xe, ye, ze] */
function boundBox(bot) {
  const { pos, rad } = bot;
  const xs = pos[0] - rad;
  const ys = pos[1] - rad;
  const zs = pos[2] - rad;
  const xe = pos[0] + rad;
  const ye = pos[1] + rad;
  const ze = pos[2] + rad;
  return [xs, ys, zs, xe, ye, ze];
}

const b1 = [-3, -4, 0, -1, -2, 0];
const b2 = [-1, -2, 0, 1, 2, 0];
console.log("sqo: ", isBoxIntersect(b1, b2));

// const p = { pos: [10, 12, 12], rad: 2 };
// const bb = boundBox(p.pos, p.rad);
// console.log("bb: ", bb);

// const testPts = [[0, 5], [3, 7], [2, 4], [8, 10], [10, 13]];

/* given 2 boxes, returns the intersecting box. if no intersect, returns null */
function intersect(b1, b2) {
  if (isBoxIntersect(b1, b2)) {
    const xs = Math.max(b1[0], b2[0]);
    const ys = Math.max(b1[1], b2[1]);
    const zs = Math.max(b1[2], b2[2]);

    const xe = Math.min(b1[3], b2[3]);
    const ye = Math.min(b1[4], b2[4]);
    const ze = Math.min(b1[5], b2[5]);
    return [xs, ys, zs, xe, ye, ze];
  }
  return null;
}

// const rangeOverlaps = [];
let maxOverlaps = [];
let overlapRegion = null;
const botsToProcess = [...bots];
while (botsToProcess.length) {
  let bot = boundBox(botsToProcess.pop());
  // console.log(bots[i], bot);
  const overlap = [bot];
  for (let b of botsToProcess) {
    const bot2 = boundBox(b);
    const box = intersect(bot, bot2);
    if (box) {
      bot = box;
      overlap.push(bot2);
    }
  }
  if (overlap.length > maxOverlaps.length) {
    maxOverlaps = [...overlap];
    overlapRegion = bot;
  }
  // rangeOverlaps.push(overlap);
}

console.log(
  "range overlaps",
  maxOverlaps.length,
  overlapRegion,
  overlapRegion[3] - overlapRegion[0],
  overlapRegion[4] - overlapRegion[1],
  overlapRegion[5] - overlapRegion[2]
);

const s = bots.reduce(
  (inRange, bot) =>
    isBotInRange(
      {
        pos: [12, 12, 12]
      },
      bot
    )
      ? inRange + 1
      : inRange,
  0
);

console.log("s", s);

// const mostRangeOverlaps = rangeOverlaps.reduce((res, overlap) => {
//   return res.length > overlap.length ? res : overlap;
// });

/* -12912460 to -9108258
-5933598 to 148909440
res
-5933598 to -9108258
/*

/* finds the overlapping region given a list of boxes
  It finds the highest start and the lowest end for x, y and z
*/
// const overlapRegion = mostRangeOverlaps.reduce(
//   (res, p) => {
//     if (res[0] > res[3] || p[0] > p[3]) {
//       console.log("wahhaha", res, p);
//     }
//     // console.log(res, p);
//     res[0] = Math.max(p[0], res[0]);
//     res[1] = Math.max(p[1], res[1]);
//     res[2] = Math.max(p[2], res[2]);

//     res[3] = Math.min(p[3], res[3]);
//     res[4] = Math.min(p[4], res[4]);
//     res[5] = Math.min(p[5], res[5]);
// if (p[3] < res[3]) {
//   res[3] = p[3]; // lowest x end point
// }
// if (p[4] < res[4]) {
//   res[4] = p[4]; // lowest y end point
// }
// if (p[5] < res[5]) {
//   res[5] = p[5]; // lowest z end point
// }
// if (p[0] > res[0]) {
//   res[0] = p[0]; // highest x start point
// }
// if (p[1] > res[1]) {
//   res[1] = p[1]; // highest y start point
// }
// if (p[2] > res[2]) {
//   res[2] = p[2]; // highest z start point
// }
//   return res;
// },
// [-Infinity, -Infinity, -Infinity, Infinity, Infinity, Infinity]
// );
// console.log("overlap region: ", overlapRegion);

// const corners = taxicabCorners(overlapRegion);
// console.log("centers", corners);

// const posWithMostInRange = corners.reduce(
//   (res, pos) => {
//     const inRange = bots.reduce(
//       (inRange, bot) =>
//         isBotInRange(
//           {
//             pos
//           },
//           bot
//         )
//           ? inRange + 1
//           : inRange,
//       0
//     );

//     if (inRange > res.maxInRange) {
//       return { maxInRange: inRange, pos };
//     }
//     return res;
//   },
//   { maxInRange: 0, pos: null }
// );

// console.log("cornersInRange", posWithMostInRange);
// const dist = posWithMostInRange.pos.reduce((sum, p) => sum + p, 0);
// console.log("dist: ", dist);

// /* given a bounding box, returns the taxicab 'circle' corners. ie. the center on each face of the box */
// function taxicabCorners(box) {
//   const midx = (box[0] + box[3]) / 2;
//   const midy = (box[1] + box[4]) / 2;
//   const midz = (box[2] + box[5]) / 2;
//   const xyFace1 = [midx, midy, box[2]];
//   const xyFace2 = [midx, midy, box[5]];
//   const yzFace1 = [box[0], midy, midz];
//   const yzFace2 = [box[3], midy, midz];
//   const xzFace1 = [midx, box[1], midz];
//   const xzFace2 = [midx, box[4], midz];
//   return [xyFace1, xyFace2, yzFace1, yzFace2, xzFace1, xzFace2];
// }

/*
 full radius 987 [ 51105926, 39748450, 19546294, 56332497, 56023570, 31654539 ] 5226571 16275120 12108245

 too high
 cornersInRange { maxInRange: 762, pos: [ 51105926, 58873222, 35288620 ] }
dist:  145267768
*/
