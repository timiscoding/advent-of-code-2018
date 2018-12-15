const fs = require("fs");
const { filename, puts } = require("../utils");
const {
  Graph,
  HorPath,
  VerPath,
  IntPath,
  FCurvePath,
  BCurvePath
} = require("./Graph");
const { Cart, cartDirs } = require("./Cart");

function parseData() {
  const carts = [];
  const g = new Graph();

  data = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n");

  data.forEach((line, y) => {
    line.split("").forEach((ch, x) => {
      console.log("x,y of path", x, y, ch);
      let prevPath;
      if ((ch === "|" || ch === "V" || ch === "^") && y > 0) {
        prevPath = g.getPath([x, y - 1]);
      } else if (
        (ch === "/" || ch === "\\" || ch === "-" || ch === "<" || ch === ">") &&
        x > 0
      ) {
        prevPath = g.getPath([x - 1, y]);
      }

      if (ch === "-" || ch === "<" || ch === ">") {
        const curPath = new HorPath([x, y]);
        g.addPath(curPath);
        if (prevPath) g.addEdge(curPath, prevPath);
        if (ch === "<") {
          carts.push(new Cart(curPath, cartDirs.left));
        }
        if (ch === ">") {
          carts.push(new Cart(curPath, cartDirs.right));
        }
      } else if (ch === "\\") {
        g.addPath(new BCurvePath([x, y]));
        if (prevPath && prevPath instanceof HorPath) {
          g.addEdge([x, y], prevPath);
        }
      } else if (ch === "/") {
        g.addPath(new FCurvePath([x, y]));
        if (prevPath && prevPath instanceof HorPath) {
          g.addEdge([x, y], prevPath);
        }
      } else if (ch === "|" || ch === "^" || ch === "V") {
        const curPath = new VerPath([x, y]);
        g.addPath(curPath);
        if (prevPath) g.addEdge(curPath, prevPath);
        if (ch === "^") {
          carts.push(new Cart(curPath, cartDirs.up));
        }
        if (ch === "V") {
          carts.push(new Cart(curPath, cartDirs.down));
        }
      }
    });
  });
  console.log("" + g);
  return { graph: g, carts };
}

class CartSim {
  constructor(graph, carts) {
    this.graph = graph;
    this.carts = carts;
    this.tickCount = 0;
    this.carts.forEach(c => c.setGraph(this.graph));
  }

  play() {
    this.print();
    let cartCrash = false;
    while (!cartCrash) {
      cartCrash = sim.tick();
    }
    console.log("Crashed cart", cartCrash.path.loc);
  }

  tick() {
    this.tickCount++;
    let crashedCart;
    for (let cart of this.carts) {
      cart.move();
      if (this.crashed()) {
        crashedCart = cart;
        break;
      }
    }
    this.print(crashedCart && crashedCart.path.loc);
    return crashedCart;
  }

  crashed() {
    for (let i = 0; i < this.carts.length - 1; i++) {
      for (let j = i + 1; j < this.carts.length; j++) {
        const cart1 = this.carts[i];
        const cart2 = this.carts[j];
        if (cart1.path === cart2.path) {
          return true;
        }
      }
    }
    return false;
  }

  print(crashLoc) {
    const cartsMap = this.carts.reduce(
      (res, c) => ({
        ...res,
        [c.path.loc]: {
          [cartDirs.left.label]: "<",
          [cartDirs.right.label]: ">",
          [cartDirs.up.label]: "^",
          [cartDirs.down.label]: "V"
        }[c.dir.label]
      }),
      {}
    );
    let str = "";
    for (let y = 0; y < this.graph.size.y; y++) {
      for (let x = 0; x < this.graph.size.x; x++) {
        const path = this.graph.getPath([x, y]);
        if (crashLoc && crashLoc[0] === x && crashLoc[1] === y) {
          str += "X";
        } else if (cartsMap[[x, y]]) {
          str += cartsMap[[x, y]];
        } else if (path instanceof HorPath) {
          str += "-";
        } else if (path instanceof VerPath) {
          str += "|";
        } else if (path instanceof BCurvePath) {
          str += "\\";
        } else if (path instanceof FCurvePath) {
          str += "/";
        } else {
          str += " ";
        }
      }
      str += "\n";
    }
    console.log("Tick", this.tickCount);
    console.log(str);
  }
}

const { graph, carts } = parseData();
console.log("carts", "" + carts);
console.log("s: ", graph.size);
const sim = new CartSim(graph, carts);
sim.play();
