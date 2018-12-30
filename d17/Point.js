class Point {
  constructor([x, y]) {
    this.pt = [x, y];
  }

  get point() {
    return this.pt;
  }

  south() {
    return [this.pt[0], this.pt[1] + 1];
  }

  north() {
    return [this.pt[0], this.pt[1] - 1];
  }

  east() {
    return [this.pt[0] + 1, this.pt[1]];
  }

  west() {
    return [this.pt[0] - 1, this.pt[1]];
  }

  moveSouth() {
    return (this.pt = this.south());
  }

  moveNorth() {
    return (this.pt = this.north());
  }

  moveEast() {
    return (this.pt = this.east());
  }

  moveWest() {
    return (this.pt = this.west());
  }
}

module.exports = Point;
