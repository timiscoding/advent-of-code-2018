const {
  StraightPath,
  BCurvePath,
  FCurvePath,
  HorPath,
  CurvePath
} = require("./Graph");

class Cart {
  constructor(path, dir) {
    this.path = path;
    this.dir = dir;
  }

  getDir() {
    return this.dir;
  }

  setGraph(graph) {
    this.graph = graph;
  }

  move() {
    let nextPath;

    if (this.path instanceof StraightPath || this.path instanceof CurvePath) {
      const x = this.path.loc[0] + this.dir.value[0];
      const y = this.path.loc[1] + this.dir.value[1];
      nextPath = this.graph.getPath([x, y]);

      if (!nextPath) {
        throw new Error(
          `Cart moved onto a path that does not exist! Args: ${[x, y]}`
        );
      }

      const { left, right, up, down } = Cart.prototype.dirs;
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
      }
    }
    this.path = nextPath;
  }

  toString() {
    return `Cart ${this.path} ${this.dir}`;
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
