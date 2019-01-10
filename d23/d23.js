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

function dist(a, b) {
  return (
    Math.abs(a.pos[0] - b.pos[0]) +
    Math.abs(a.pos[1] - b.pos[1]) +
    Math.abs(a.pos[2] - b.pos[2])
  );
}

function maxSignalCount(bots) {
  const maxRadBot = bots.sort((a, b) => b.rad - a.rad)[0];
  return bots.filter(b => dist(b, maxRadBot) <= maxRadBot.rad).length;
}

/* signalsInBox chops the space given by `bounds` into 8 `boxSize` sized boxes and places every bot
   into 1 or more of these boxes.

   If the number of bots in a box is at least `minSignalCount`, the box is further subdivided until
   it is the size of a point and we can determine the precise number of signals within reach.

   bots: [{ pos: [x,y,z], rad: Number }...] - array of bots
   bounds: {
     x: { min: Number, max: Number },
     y: { min: Number, max: Number },
     z: { min: Number, max: Number },
    } - the bounds of the space to group bots in boxes
   boxSize: Number - size of the box
   minSignalCount: Number - the minimum number of signals we are looking for in a point

   returns an object { distOrigin: Number|null, signalsCount: Number|null } - distOrigin is the
   distance of the point from origin and signalsCount is the number of bot signals within reach.
   If it can't find a point with `minSignalsCount` signals, both props will be null.
*/
function signalsInBox(bots, bounds, boxSize, minSignalCount) {
  const subboxes = [];

  for (let x = bounds.x.min; x < bounds.x.max; x += boxSize) {
    for (let y = bounds.y.min; y < bounds.y.max; y += boxSize) {
      for (let z = bounds.z.min; z < bounds.z.max; z += boxSize) {
        const point = { pos: [x, y, z] };
        let signalCount;
        if (boxSize === 1) {
          signalCount = bots.filter(b => dist(point, b) <= b.rad).length;
        } else {
          /* approximately count the number of bot signals in a box. For the edge case where a bot is
          outside but the bots signal lies on the edge/s of this box, count it as well. We do
          this because signalCount determines whether we should look inside this box for a point having
          minSignalCount signals. The furthest point that a signal can still be touching a box is
          its opposite corner (if a box starts at (0,0,0) then the furthest point is (1,1,1) so we
          add 3 to allow for it to be included. Doing this can lead to including bots that don't
          have signals inside this box but we don't care since we'll get the real signal count if
          the box gets to the stage of being the size of a point */
          const signals = bots.filter(b => {
            return (dist(b, point) - b.rad) / boxSize <= 3;
          });
          signalCount = signals.length;
        }
        if (signalCount >= minSignalCount) {
          subboxes.push({
            x,
            y,
            z,
            signalCount,
            distOrigin: Math.abs(x) + Math.abs(y) + Math.abs(z)
          });
        }
      }
    }
  }

  let min = { distOrigin: Infinity, signalCount: null };
  while (subboxes.length) {
    subboxes.sort((a, b) => b.distOrigin - a.distOrigin); // search by the closest to origin first
    const subbox = subboxes.pop();
    if (boxSize === 1) {
      // box is the size of a single point which means the signalCount is now accurate
      return { distOrigin: subbox.distOrigin, signalCount: subbox.signalCount };
    }
    const newBounds = {
      x: { min: subbox.x, max: subbox.x + boxSize },
      y: { min: subbox.y, max: subbox.y + boxSize },
      z: { min: subbox.z, max: subbox.z + boxSize }
    };
    const { distOrigin, signalCount } = signalsInBox(
      bots,
      newBounds,
      boxSize / 2,
      minSignalCount
    );
    if (distOrigin < min.distOrigin) {
      // found the pt closest to origin with minSignalCount so exit early
      return { distOrigin, signalCount };
    }
  }
  return min;
}

/* Find the point closest to origin with the most bot signals

   Returns an object with the distance from the point to origin and the bot signals within reach.
   Props will be null if it can't find any.
   { distOrigin: Number|null, signalCount: Number|null}

   Original solution from:
   https://www.reddit.com/r/adventofcode/comments/a8s17l/2018_day_23_solutions/ecddus1/?st=jqpyivt9&sh=646e620a
*/
function maxSignalsPt(bots) {
  // choose initial bounds big enough that will ensure that all bots will be placed in a box
  const ranges = bots.reduce(
    (res, { pos: [x, y, z] }) => {
      res.x.min = Math.min(x, res.x.min);
      res.x.max = Math.max(x, res.x.max);
      res.y.min = Math.min(y, res.y.min);
      res.y.max = Math.max(y, res.y.max);
      res.z.min = Math.min(z, res.z.min);
      res.z.max = Math.max(z, res.z.max);
      return res;
    },
    {
      x: { min: Infinity, max: -Infinity },
      y: { min: Infinity, max: -Infinity },
      z: { min: Infinity, max: -Infinity }
    }
  );
  const maxRange = Math.max(
    ranges.x.max - ranges.x.min,
    ranges.y.max - ranges.y.min,
    ranges.z.max - ranges.z.min
  );
  // choose a binary number so that when we keep halving it, it will always give a whole number
  const maxBound = 2 ** Math.ceil(Math.log2(maxRange));
  const signalsRange = { min: 0, max: bots.length };
  let best = { distOrigin: null, signalCount: null };
  while (signalsRange.min <= signalsRange.max) {
    const signals = Math.floor((signalsRange.max + signalsRange.min) / 2);
    const { distOrigin, signalCount } = signalsInBox(
      bots,
      {
        x: { min: ranges.x.min, max: ranges.x.min + maxBound },
        y: { min: ranges.y.min, max: ranges.y.min + maxBound },
        z: { min: ranges.z.min, max: ranges.z.min + maxBound }
      },
      maxBound / 2,
      signals
    );
    if (signalCount === null) {
      signalsRange.max = signals - 1;
    } else if (typeof signalCount === "number") {
      signalsRange.min = signals + 1;
      best = { distOrigin, signalCount };
    }
  }
  return best;
}

function main() {
  const bots = parseData();
  console.log(
    "There are %d bots in range of the bot with the largest radius",
    maxSignalCount(bots)
  );
  const { signalCount, distOrigin } = maxSignalsPt(bots);
  console.log(
    "The most signals (%d) received was at %d distance to origin",
    signalCount,
    distOrigin
  );
}

main();
