const fs = require("fs");
const { filename, timer } = require("../utils");

function parseData() {
  const data = fs.readFileSync(filename).toString();
  const starField = data
    .trim()
    .split("\n")
    .map(line => {
      const [, px, py, vx, vy] = line
        .match(/<\s*(-?\d+),\s+(-?\d+).+<\s*(-?\d+),\s+(-?\d+)/)
        .map(m => parseInt(m, 10));
      return [[px, py].toString(), { pos: [px, py], vel: [vx, vy] }];
    });
  return new Map(starField);
}

/* finds the min x/y, max x/y coords */
function boundingBox(pts) {
  return {
    x: {
      min: Math.min(...pts.map(p => p[0])),
      max: Math.max(...pts.map(p => p[0]))
    },
    y: {
      min: Math.min(...pts.map(p => p[1])),
      max: Math.max(...pts.map(p => p[1]))
    }
  };
}

function normalize(pts, [xOffset, yOffset]) {
  return pts.map(p => [p[0] + xOffset, p[1] + yOffset]);
}

/* given an origin point, find the neighbour stars (the 8 pts surrounding origin)
   and the neighbours neighbours, and so on.

   returns a cluster of stars that are all connected */
function findCluster(origin, starField, cluster) {
  if (!cluster) {
    cluster = new Map([[origin.toString(), origin]]);
  }
  let neighbours = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      if (x === 0 && y === 0) continue;
      const neighbour = [origin[0] + x, origin[1] + y];
      const neighbourStr = neighbour.toString();
      if (starField.has(neighbourStr) && !cluster.has(neighbourStr)) {
        cluster.set(neighbourStr, neighbour);
        neighbours.push(neighbour);
      }
    }
  }
  neighbours.forEach(n => findCluster(n, starField, cluster));
  return cluster;
}

/* Computes the new positions for each star based on the velocity

   The starfield key is based on [px, py] so one or more elements may merge
   because the velocities can cause stars to converge on the same point.
   When that occurs, map the value to an array of objects.

   Keys are based on position because it enables checking the neighbours
   in findCluster() fast
*/
function updateStarField(starField) {
  const update = new Map();
  starField.forEach(star => {
    star = Array.isArray(star) ? star : [star];
    star.forEach(({ pos: oldPos, vel }) => {
      const pos = [oldPos[0] + vel[0], oldPos[1] + vel[1]];
      const hash = pos.toString();
      if (update.has(hash)) {
        update.set(hash, [{ pos, vel }].concat(update.get(hash)));
      } else {
        update.set(hash, { pos, vel });
      }
    });
  });
  return update;
}

function printMessage(message) {
  console.log("\nThe message reads:\n");
  message.forEach(({ cluster, box }) => {
    for (let y = 0; y <= box.y.max; y++) {
      let str = "";
      for (let x = 0; x <= box.x.max; x++) {
        str += cluster.find(v => v[0] === x && v[1] === y) ? "#" : ".";
      }
      console.log(str);
    }
    console.log();
  });
}

/* Computes the star positions as they advance through time, and computes
   all the clusters found. A cluster is a connected group of stars without
   any space between them.

   returns the smallest set of clusters it can find, although that is not
   guaranteed as it could still be a local minima
*/
function maxStarClusters() {
  let starField = parseData();
  let clusters = [];
  let prevClusters = [];
  let prevPrevClusters = [];
  let timeSec = 0;

  while (true) {
    timeSec % 500 === 0 &&
      console.log(`Computing star field at time %ss`, timeSec);
    prevPrevClusters = prevClusters;
    prevClusters = clusters;
    clusters = [];
    for (let [hash, star] of starField.entries()) {
      if (clusters.some(c => c.has(hash))) continue;
      starPos = Array.isArray(star) ? star[0].pos : star.pos;
      const cluster = findCluster(starPos, starField);
      clusters.push(cluster);
    }
    /* arbitrarily assume the message to be max 50 letters to avoid finding
       local minima */
    if (
      prevClusters.length < clusters.length &&
      prevClusters.length < prevPrevClusters.length &&
      prevClusters.length < 50
    ) {
      break;
    }

    starField = updateStarField(starField);
    timeSec++;
  }
  return {
    clusters: prevClusters,
    timeSec: timeSec - 1 // timeSec includes the cluster passed the message appearing that was used to compute the minima
  };
}

function clusters2message(clusters) {
  let message = [];
  clusters.forEach(cluster => {
    message.push(Array.from(cluster.values()));
  });
  // make sure the symbols are in the right order
  messageSorted = message
    .map(cluster => ({
      cluster,
      box: boundingBox(cluster)
    }))
    .sort((a, b) => a.box.x.min - b.box.x.min);
  // remap each symbol with origin 0,0 for easy printing
  messageNorm = messageSorted.map(({ cluster, box }) => {
    if (box.x.min !== 0 || box.y.min !== 0) {
      const xOff = -box.x.min;
      const yOff = -box.y.min;
      cluster = normalize(cluster, [xOff, yOff]);
    }
    return {
      cluster,
      box: boundingBox(cluster)
    };
  });

  return messageNorm;
}

let message, timeSec;
const [execTime] = timer(() => {
  const maxClusters = maxStarClusters();
  timeSec = maxClusters.timeSec;
  message = clusters2message(maxClusters.clusters);
});

printMessage(message);
console.log("Message appeared at %ss", timeSec);
console.log("Execution took: %s", execTime.time);
