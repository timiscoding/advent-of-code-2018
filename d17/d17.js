const fs = require("fs");
const path = require("path");
const { filename } = require("../utils");

function parseData() {
  const lines = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n");
  const clay = [];
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
      clay.push(axis === "x" ? [axisVal, i] : [i, axisVal]);
    }
  });
  return clay;
}

function drawOutput(points) {
  const ptToHtml = pt =>
    `<div class="clay" style="grid-column: ${pt[0] + 1}; grid-row: ${pt[1] +
      1}"></div>`;
  let pointMarkup = "";

  points.forEach(p => {
    pointMarkup += ptToHtml(p);
  });

  const template = htmlData => {
    const html = fs.readFileSync("./template.html").toString();
    const template = (strings, subst) => strings[0] + subst + strings[1];
    return eval(`template\`${html}\``);
  };

  const outputFile = `${path.basename(filename)}-output.html`;
  fs.writeFileSync(path.join(__dirname, outputFile), template(pointMarkup));
  console.log(`Output written. Open ${outputFile}`);
}

const clay = parseData();
const res = drawOutput(clay);
