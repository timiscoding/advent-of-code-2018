/*
  find the max distance between 2 points and compute the midpoint between them.
  This will be the threshold used to stop the algorithm.

  Create a taxicab circle with origin centred at each data point of radius 1, 2, ..., until the
  threshold is reached. At each point on the circle, record the origin data point to that location.
  When a location has already been recorded, the midpoint between 2 data points is crossed.

  When the threshold is reached, we know any additional point added will extend to infinity which
  we don't care about.
*/

const fs = require("fs");
const { filename, timer } = require("../utils");

const data = fs.readFileSync(filename).toString();
const ptsNum = data
  .trim()
  .split("\n")
  .map(p => p.split(", ").map(s => Number(s)));

/* taxicab distance |x2-x1| + |y2-y1| */
function distance(p1, p2) {
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}

/* get the max distance of all points */
function maxDistance(pts) {
  let maxDist = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const p1 = pts[i];
      const p2 = pts[j];
      const dist = distance(p1, p2);

      if (dist > maxDist) {
        maxDist = dist;
      }
    }
  }
  return maxDist;
}

/* generates a list of points that form the taxcab circle centred at
origin `pt` with radius `r`. taxicab circle formula |x| + |y| = radius */
function circle([x, y], radius) {
  const pts = [];
  for (let i = -radius; i <= radius; i++) {
    const j = radius - Math.abs(i);
    pts.push([i + x, j + y]);
    if (j !== 0) {
      pts.push([i + x, -j + y]);
    }
  }
  return pts;
}

function isMidpoint(midpoint, p1, p2) {
  if (
    midpoint.toString() === p1.toString() ||
    midpoint.toString() === p2.toString() ||
    p1.toString() === p2.toString()
  ) {
    return false;
  }
  const mp = distance(p1, midpoint) === distance(p2, midpoint);
  return mp;
}

function getFiniteAreas() {
  const locations = ptsNum.reduce((res, p) => ({ ...res, [p]: [p] }), {});
  const ptAreas = ptsNum.reduce((res, p) => ({ ...res, [p]: [p] }), {});

  const maxRadius = Math.ceil(maxDistance(ptsNum) / 2);

  let finiteAreas = {};
  for (let r = 1; r <= maxRadius; r++) {
    for (let i = 0; i < ptsNum.length; i++) {
      const p = ptsNum[i];
      if (finiteAreas[p]) continue;

      let areaChanged = false;
      circle(p, r).forEach(cp => {
        if (!locations[cp] || (locations[cp] && locations[cp].length === 0)) {
          areaChanged = true;
          locations[cp] = (locations[cp] || []).concat([p]);
          ptAreas[p] = (ptAreas[p] || []).concat([cp]);
        } else if (
          locations[cp].length === 1 &&
          isMidpoint(cp, p, locations[cp][0])
        ) {
          ptAreas[locations[cp]].pop();
          locations[cp] = (locations[cp] || []).concat([p]);
        }
      });
      if (!areaChanged) {
        finiteAreas[p] = ptAreas[p];
      }
    }
    console.log("Done processing circles with radius %s of %s", r, maxRadius);
  }
  return finiteAreas;
}

function getMaxArea(areas) {
  let maxArea = 0;
  for (let [pt, area] of Object.entries(areas)) {
    if (area.length > maxArea) {
      maxArea = area.length;
      maxPt = pt;
    }
  }
  return { pt: maxPt, area: maxArea };
}

function getBoundingBox(dataPoints) {
  let [minX, maxX] = [Number.MAX_SAFE_INTEGER, 0];
  let [minY, maxY] = [Number.MAX_SAFE_INTEGER, 0];
  dataPoints.forEach(p => {
    if (p[0] > maxX) {
      maxX = p[0];
    }
    if (p[0] < minX) {
      minX = p[0];
    }
    if (p[1] > maxY) {
      maxY = p[1];
    }
    if (p[1] < minY) {
      minY = p[1];
    }
  });
  return [minX, minY, maxX, maxY];
}

function getRegion(maxDistSum = 10000) {
  const [minX, minY, maxX, maxY] = getBoundingBox(ptsNum);
  const region = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const location = [x, y];
      const distSum = ptsNum.reduce((sum, pt) => {
        return sum + distance(location, pt);
      }, 0);
      if (distSum < maxDistSum) {
        region.push(location);
      }
    }
  }
  return region;
}

const [part1, part2] = timer(
  () => {
    const finiteAreas = getFiniteAreas();
    return getMaxArea(finiteAreas);
  },
  () => getRegion().length
);

console.table({
  "Max area (part 1)": { time: part1.time, res: part1.res },
  "Region closest to points (part 2)": { time: part2.time, res: part2.res }
});
