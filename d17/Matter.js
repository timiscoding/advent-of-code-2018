class Matter {
  constructor() {
    this.children = [];
    this.parent = null;
  }

  getChildren() {
    return this.children;
  }

  getParent() {
    return this.parent;
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
    this.children.push(child);
  }

  setParent(parent) {
    if (!(parent instanceof Matter)) {
      throw new Error("Parent arg must be Matter instance");
    }
    this.parent = parent;
  }

  isWater() {
    return this instanceof Water;
  }

  isClay() {
    return this instanceof Clay;
  }
}

class Water extends Matter {}
class Clay extends Matter {}

module.exports = { Matter, Water, Clay };
