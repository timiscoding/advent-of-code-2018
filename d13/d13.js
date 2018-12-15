const fs = require("fs");
const { filename } = require("../utils");
const {
  Graph,
  HorPath,
  VerPath,
  IntPath,
  FCurvePath,
  BCurvePath
} = require("./Graph");
const { Cart, cartDirs } = require("./Cart");
const CartSim = require("./CartSim");

function parseData() {
  const carts = [];
  const g = new Graph();

  data = fs
    .readFileSync(filename)
    .toString()
    .trimEnd()
    .split("\n");

  data.forEach((line, y) => {
    line.split("").forEach((ch, x) => {
      let prevPaths = [];
      if (ch === "|") {
        prevPaths.push(g.getPath([x, y - 1]));
      } else if (ch === "/" || ch === "\\") {
        const [prev, above] = [g.getPath([x - 1, y]), g.getPath([x, y - 1])];
        if (prev && prev instanceof HorPath) {
          prevPaths.push(prev);
        }
        if (above && above instanceof VerPath) {
          prevPaths.push(above);
        }
      } else if (ch === "-") {
        prevPaths.push(g.getPath([x - 1, y]));
      } else if (ch === "<" || ch === ">") {
        prevPaths.push(g.getPath([x - 1, y]));
      } else if (ch === "+") {
        prevPaths.push(g.getPath([x - 1, y]), g.getPath([x, y - 1]));
      } else if (ch === "^" || ch === "v") {
        prevPaths.push(g.getPath([x, y - 1]));
      }
      prevPaths = prevPaths.filter(Boolean);

      if (ch === "-" || ch === "<" || ch === ">") {
        const curPath = new HorPath([x, y]);
        g.addPath(curPath);
        prevPaths.forEach(prevPath => g.addEdge(curPath, prevPath));
        if (ch === "<") {
          carts.push(new Cart(curPath, cartDirs.left));
        }
        if (ch === ">") {
          carts.push(new Cart(curPath, cartDirs.right));
        }
      } else if (ch === "\\") {
        g.addPath(new BCurvePath([x, y]));
        prevPaths.forEach(prevPath => g.addEdge([x, y], prevPath));
      } else if (ch === "/") {
        g.addPath(new FCurvePath([x, y]));
        prevPaths.forEach(prevPath => g.addEdge([x, y], prevPath));
      } else if (ch === "|" || ch === "^" || ch === "v") {
        const curPath = new VerPath([x, y]);
        g.addPath(curPath);
        prevPaths.forEach(prevPath => g.addEdge(curPath, prevPath));
        if (ch === "^") {
          carts.push(new Cart(curPath, cartDirs.up));
        }
        if (ch === "v") {
          carts.push(new Cart(curPath, cartDirs.down));
        }
      } else if (ch === "+") {
        const curPath = new IntPath([x, y]);
        g.addPath(curPath);
        prevPaths.forEach(prev => g.addEdge(curPath, prev));
      }
    });
  });
  return { graph: g, carts };
}

function main() {
  const { graph, carts } = parseData();
  const configs = {
    interactive: { interactive: true },
    animate: { delay: 1000, ticks: 3 },
    output: { ticks: 3 }
  };
  const sim = new CartSim(graph, carts, configs.output);
  // sim.play();
  sim.playFirstCrash();
  // sim.playLastCartStanding();
}

main();
