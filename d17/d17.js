const fs = require("fs");
const path = require("path");
const { filename } = require("../utils");
const PointMap = require("./PointMap");
const { Water, Clay } = require("./Matter");
const Point = require("./Point");

function parseData() {
  const grid = new PointMap();
  let rows = { ymin: Infinity, ymax: -Infinity }; // rows to include when counting water. values are inclusive

  const lines = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n");
  lines.forEach(line => {
    const [point, range] = line.split(", ");
    if (!/[xy]=\d+/.test(point)) {
      throw new Error(`first point not in form p=123. Found ${point}`);
    }
    if (!/[xy]=\d+\.\.\d+/.test(range)) {
      throw new Error(`second point not in form p=123..124. Found ${range}`);
    }

    const [axis, axisVal] = point
      .split("=")
      .map(v => (Number(v) ? Number(v) : v));
    const [, rangeStart, rangeEnd] = range.match(/(\d+)..(\d+)/).map(Number);

    for (let i = rangeStart; i <= rangeEnd; i++) {
      const pt = axis === "x" ? [axisVal, i] : [i, axisVal];
      const clay = new Clay(pt);
      grid.set(clay.point, clay);

      if (pt[1] > rows.ymax) {
        rows.ymax = pt[1];
      }
      if (pt[1] < rows.ymin) {
        rows.ymin = pt[1];
      }
    }
  });
  return { grid, rows };
}

function drawOutput(grid) {
  const ptToHtml = (
    matter,
    [x, y] // css grid 'lines' are 1-indexed and matter instances are 0-indexed
  ) =>
    `<div class=${matter.isClay() ? "clay" : "water"} style="grid-column: ${x +
      1}; grid-row: ${y + 1}"></div>\n`;
  let gridMarkup = "";

  grid.forEach((matter, pt) => {
    gridMarkup += ptToHtml(matter, pt);
  });

  const template = htmlData => {
    const html = fs.readFileSync("./template.html").toString();
    const template = (strings, subst) => strings[0] + subst + strings[1];
    return eval(`template\`${html}\``);
  };

  const outputFile = `${path
    .basename(filename)
    .replace("-data", "")}-output.html`;
  fs.writeFileSync(path.join(__dirname, outputFile), template(gridMarkup));
  console.log(`Output written. Open ${outputFile}`);
}

function waterSim(grid, { ymin, ymax }) {
  let cur = new Water([15, 0]);
  grid.set(cur.point, cur); // water spring location
  let tmp = 50;
  while (tmp--) {
const points = parseData();
points.set(3, 3, new Water());
const res = drawOutput(points);
    if (grid.isEmpty(cur.south())) {
      const water = cur.addSouth();
      grid.set(water.point, water);
      cur = water;
    } else if (grid.get(cur.south()).isClay() && grid.isEmpty(cur.west())) {
      const water = cur.addWest();
      grid.set(water.point, water);
      cur = water;
    }
  }
}

const { grid, rows } = parseData();
waterSim(grid, rows);
drawOutput(grid);

const clay = parseData();
const res = drawOutput(clay);
