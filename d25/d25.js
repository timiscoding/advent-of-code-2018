const fs = require("fs");
const { filename } = require("../utils");
const Galaxy = require("./Galaxy");

function parseData() {
  const data = fs.readFileSync(filename).toString();
  const stars = data
    .trim()
    .split("\n")
    .map(line => {
      return line
        .trim()
        .split(",")
        .map(Number);
    });
  return stars;
}

function dist(star1, star2) {
  const [a1, b1, c1, d1] = star1;
  const [a2, b2, c2, d2] = star2;
  return (
    Math.abs(a2 - a1) +
    Math.abs(b2 - b1) +
    Math.abs(c2 - c1) +
    Math.abs(d2 - d1)
  );
}

function countClusters() {
  const stars = parseData();
  const g = new Galaxy();
  while (stars.length) {
    const star = stars.pop();
    for (let j = 0; j < stars.length; j++) {
      const star2 = stars[j];

      if (star === star2) continue;
      if (dist(star, star2) <= 3) {
        g.sameCluster(star, star2);
      } else {
        g.diffCluster(star, star2);
      }
    }
  }

  g.print();
  console.log("clusters", g.clusters.size);
}

countClusters();
