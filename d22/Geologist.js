const types = {
  rocky: 0,
  wet: 1,
  narrow: 2,
  0: "rocky",
  1: "wet",
  2: "narrow"
};

class Geologist {
  constructor(depth, target) {
    this.depth = depth;
    this.target = target;
    this.erosion = {}; // erosion levels
    this.gi = {}; // geologic indices
  }

  getGI(x, y) {
    let index = this.gi[[x, y]];

    if (!index) {
      if (
        (x === 0 && y === 0) ||
        (x === this.target[0] && y === this.target[1])
      ) {
        index = 0;
      } else if (y === 0) {
        index = x * 16807;
      } else if (x === 0) {
        index = y * 48271;
      } else {
        index = this.getErosion(x - 1, y) * this.getErosion(x, y - 1);
      }
      this.gi[[x, y]] = index;
    }

    return index;
  }

  getErosion(x, y) {
    let level = this.erosion[[x, y]];

    if (!level) {
      let gi = this.gi[[x, y]];
      if (!gi) gi = this.getGI(x, y);
      level = (gi + this.depth) % 20183;
      this.erosion[[x, y]] = level;
    }

    return level;
  }

  riskLevel() {
    const [tx, ty] = this.target;
    let risk = 0;
    for (let y = 0; y <= ty; y++) {
      for (let x = 0; x <= tx; x++) {
        risk += this.getErosion(x, y) % 3;
      }
      y % 100 === 0 && console.log("y", y);
    }
    return risk;
  }
}

module.exports = Geologist;
