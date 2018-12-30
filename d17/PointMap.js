class PointMap extends Map {
  constructor(...args) {
    super(...args);
    this.points = {};
  }

  get(x, y) {
    return super.get(this.points[[x, y]]);
  }

  has(x, y) {
    return super.has(this.points[[x, y]]);
  }

  set(x, y, val) {
    this.points[[x, y]] = [x, y];
    return super.set(this.points[[x, y]], val);
  }

  north(x, y) {
    return super.get(this.points[[x, y - 1]]);
  }

  south(x, y) {
    return super.get(this.points[[x, y + 1]]);
  }

  west(x, y) {
    return super.get(this.points[[x - 1, y]]);
  }

  east(x, y) {
    return super.get(this.points[[x + 1, y]]);
  }

  isEmpty(x, y) {
    return !super.has(this.points[[x, y]]);
  }
}

module.exports = PointMap;
