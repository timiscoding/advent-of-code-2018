const {
  StraightPath,
  BCurvePath,
  FCurvePath,
  IntPath,
  CurvePath
} = require("./Graph");
const { genId } = require("../utils");

class Cart {
  constructor(path, dir) {
    this.id = genId();
    this.path = path;
    this.dir = dir;
    this.intPathCount = 0;
  }

  getDir() {
    return this.dir;
  }

  setGraph(graph) {
    this.graph = graph;
  }

  move() {
    let nextPath;
    const { left, right, up, down } = Cart.prototype.dirs;

    const x = this.path.loc[0] + this.dir.value[0];
    const y = this.path.loc[1] + this.dir.value[1];
    nextPath = this.graph.getPath([x, y]);

    if (!nextPath) {
      throw new Error(
        `Cart moved onto a path that does not exist! Args: ${[x, y]}`
      );
    }

    if (
      (nextPath instanceof BCurvePath && this.dir === right) ||
      (nextPath instanceof FCurvePath && this.dir === left)
    ) {
      this.dir = down;
    } else if (
      (nextPath instanceof BCurvePath && this.dir === left) ||
      (nextPath instanceof FCurvePath && this.dir === right)
    ) {
      this.dir = up;
    } else if (
      (nextPath instanceof BCurvePath && this.dir === up) ||
      (nextPath instanceof FCurvePath && this.dir === down)
    ) {
      this.dir = left;
    } else if (
      (nextPath instanceof BCurvePath && this.dir === down) ||
      (nextPath instanceof FCurvePath && this.dir === up)
    ) {
      this.dir = right;
    } else if (nextPath instanceof IntPath) {
      const rules = {
        left: [down, left, up],
        right: [up, right, down],
        up: [left, up, right],
        down: [right, down, left]
      };
      this.dir = rules[this.dir.label][this.intPathCount];
      this.intPathCount = (this.intPathCount + 1) % 3;
    }
    this.path = nextPath;
  }

  toString() {
    return `Cart ${this.id} ${this.path} ${this.dir}`;
    // return `Cart ${this.path.loc} ${this.dir.label}`;
  }
}

Cart.prototype.dirs = {
  left: { value: [-1, 0], label: "left" },
  right: { value: [1, 0], label: "right" },
  up: { value: [0, -1], label: "up" },
  down: { value: [0, 1], label: "down" }
};

module.exports = {
  Cart,
  cartDirs: Cart.prototype.dirs
};
