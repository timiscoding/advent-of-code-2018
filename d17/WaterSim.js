const fs = require("fs");
const path = require("path");

const { Water, Clay } = require("./Matter");
const PointMap = require("./PointMap");

class WaterSim {
  constructor(input, spring = [15, 0]) {
    this.spring = spring;

    const parsed = this.parseData(input);
    this.grid = parsed.grid;
    this.ymin = parsed.rows.ymin;
    this.ymax = parsed.rows.ymax;
  }

  parseData(input) {
    const grid = new PointMap();
    let rows = { ymin: Infinity, ymax: -Infinity }; // rows to include when counting water. values are inclusive

    const lines = input.trim().split("\n");
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

  run() {
    let cur = new Water(this.spring);
    this.grid.set(cur.point, cur); // water spring location
    let downstream = true;
    while (cur) {
      if (downstream) {
        if (this.grid.isEmpty(cur.south())) {
          if (cur.point[1] >= this.ymax) {
            downstream = false;
            cur = cur.getParent();
          } else {
            const water = cur.addSouth();
            this.grid.set(water.point, water);
            cur = water;
          }
        } else if (
          (this.grid.has(cur.south()) && this.grid.get(cur.south()).isClay()) ||
          !this.grid.get(cur.south()).isFalls()
        ) {
          if (this.grid.isEmpty(cur.west())) {
            const water = cur.addWest();
            this.grid.set(water.point, water);
            cur = water;
          } else if (this.grid.isEmpty(cur.east())) {
            const water = cur.addEast();
            this.grid.set(water.point, water);
            cur = water;
          } else {
            downstream = false;
            cur.setFalls(false);
            cur = cur.getParent();
          }
        } else {
          downstream = false;
          cur = cur.getParent();
        }
      } else {
        if (
          this.grid.isEmpty(cur.east()) &&
          this.grid.has(cur.south()) &&
          this.grid.get(cur.south()).isClay()
        ) {
          const water = cur.addEast();
          this.grid.set(water.point, water);
          cur = water;
          downstream = true;
        } else if (
          this.grid.has(cur.south()) &&
          this.grid.get(cur.south()).isWater() &&
          cur.getSouthChild() &&
          !cur.getSouthChild().isFalls() &&
          (!this.grid.has(cur.east()) || !this.grid.has(cur.west()))
        ) {
          downstream = true;
        } else {
          if (cur.getChildren().length >= 2) {
            let child;
            if (
              cur.getEastChild() &&
              cur.getEastChild().isFalls() &&
              (cur.getWestChild() && !cur.getWestChild().isFalls())
            ) {
              child = cur.getWestChild();
            } else if (
              cur.getWestChild() &&
              cur.getWestChild().isFalls() &&
              (cur.getEastChild() && !cur.getEastChild().isFalls())
            ) {
              child = cur.getEastChild();
            }

            while (child) {
              child.setFalls(true);
              child = child.getChildren()[0];
            }
          }
          const waterFalls = cur.getChildren().some(water => water.isFalls());
          cur.setFalls(waterFalls);
          cur = cur.getParent();
        }
      }
    }
  }

  drawOutput() {
    const ptToHtml = (
      matter,
      [x, y] // css grid 'lines' are 1-indexed and matter instances are 0-indexed
    ) =>
      `<div class=${
        matter.isClay() ? "clay" : "water"
      } style="grid-column: ${x + 1}; grid-row: ${y + 1}"></div>\n`;
    let gridMarkup = "";

    this.grid.forEach((matter, pt) => {
      gridMarkup += ptToHtml(matter, pt);
    });

    const template = htmlData => {
      const html = fs.readFileSync("./template.html").toString();
      const template = (strings, subst) => strings[0] + subst + strings[1];
      return eval(`template\`${html}\``);
    };

    const outputFile = "day17-output.html";
    fs.writeFileSync(path.join(__dirname, outputFile), template(gridMarkup));
    console.log(`Output written. Open ${outputFile}`);
  }

  countWater() {
    let count = 0;
    for (let matter of this.grid.values()) {
      if (
        matter.isWater() &&
        matter.point[1] >= this.ymin &&
        matter.point[1] <= this.ymax
      ) {
        count++;
      }
    }
    console.log("water count", count);
    return count;
  }

  countUndrainedWater() {
    let count = 0;
    for (let matter of this.grid.values()) {
      if (
        matter.isWater() &&
        !matter.isFalls() &&
        matter.point[1] >= this.ymin &&
        matter.point[1] <= this.ymax
      ) {
        count++;
      }
    }
    console.log("undrained water count", count);
    return count;
  }
}

module.exports = WaterSim;
