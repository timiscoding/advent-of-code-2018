const fs = require("fs");
const path = require("path");
const { filename } = require("../utils");
const PointMap = require("./PointMap");
const { Water, Clay } = require("./Matter");

function parseData() {
  const lines = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n");
  const points = new PointMap();
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
      const [x, y] = axis === "x" ? [axisVal, i] : [i, axisVal];
      points.set(x, y, new Clay());
    }
  });
  return points;
}

function drawOutput(points) {
  const ptToHtml = (
    matter,
    [x, y] // css grid 'lines' are 1-indexed and matter instances are 0-indexed
  ) =>
    `<div class=${matter.isClay() ? "clay" : "water"} style="grid-column: ${x +
      1}; grid-row: ${y + 1}"></div>\n`;
  let pointMarkup = "";

  points.forEach((matter, pt) => {
    pointMarkup += ptToHtml(matter, pt);
  });

  const template = htmlData => {
    const html = fs.readFileSync("./template.html").toString();
    const template = (strings, subst) => strings[0] + subst + strings[1];
    return eval(`template\`${html}\``);
  };

  const outputFile = `${path
    .basename(filename)
    .replace("-data", "")}-output.html`;
  fs.writeFileSync(path.join(__dirname, outputFile), template(pointMarkup));
  console.log(`Output written. Open ${outputFile}`);
}

const points = parseData();
points.set(3, 3, new Water());
const res = drawOutput(points);

const clay = parseData();
const res = drawOutput(clay);
