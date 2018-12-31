const Point = require("./Point");

class Matter extends Point {
  constructor(pt) {
    super(pt);
  }

  isWater() {
    return this instanceof Water;
  }

  isClay() {
    return this instanceof Clay;
  }
}

class Water extends Matter {
  constructor(pt) {
    super(pt);
    this.children = [];
    this.parent = null;
    this.falls = true;
  }

  getChildren() {
    return this.children;
  }

  getParent() {
    return this.parent;
  }

  isFalls() {
    return this.falls;
  }

  getWestChild() {
    const [x, y] = this.west();
    return this.children.find(
      water => water.point[0] === x && water.point[1] === y
    );
  }

  getEastChild() {
    const [x, y] = this.east();
    return this.children.find(
      water => water.point[0] === x && water.point[1] === y
    );
  }

  getSouthChild() {
    const [x, y] = this.south();
    return this.children.find(
      water => water.point[0] === x && water.point[1] === y
    );
  }

  setFalls(falls) {
    this.falls = falls;
  }

  setChildren(children) {
    if (!Array.isArray(children) || !children.every(c => c instanceof Matter)) {
      throw new Error("Children arg must be an array of Matter instances");
    }
    this.children = children;
  }

  addChild(child) {
    if (!(child instanceof Matter)) {
      throw new Error("Child arg must be a Matter instance");
    }
    if (!this.children.includes(child)) {
      this.children.push(child);
    }
  }

  addSouth() {
    const water = new Water(this.south());
    this.addChild(water);
    water.setParent(this);
    return water;
  }

  addEast() {
    const water = new Water(this.east());
    this.addChild(water);
    water.setParent(this);
    return water;
  }

  addWest() {
    const water = new Water(this.west());
    this.addChild(water);
    water.setParent(this);
    return water;
  }

  setParent(parent) {
    if (!(parent instanceof Matter)) {
      throw new Error("Parent arg must be Matter instance");
    }
    this.parent = parent;
  }
}

class Clay extends Matter {}

module.exports = { Matter, Water, Clay };
