const icon = {
  tree: "|",
  open: ".",
  lumber: "#"
};

class Land {
  constructor(initLand) {
    this.acres = initLand
      .trim()
      .split("\n")
      .map(line => line.trim().split(""));
  }

  getSize() {
    return { width: this.acres[0].length, height: this.acres.length };
  }

  getNeighbours(x, y) {
    const window = [
      [x - 1, y - 1],
      [x, y - 1],
      [x + 1, y - 1],
      [x - 1, y],
      [x + 1, y],
      [x - 1, y + 1],
      [x, y + 1],
      [x + 1, y + 1]
    ];
    return window.reduce((res, pos) => {
      const acre = this.acres[pos[1]] ? this.acres[pos[1]][pos[0]] : null;
      if (acre) {
        res.push(acre);
      }
      return res;
    }, []);
  }

  has3TreesOrMore(acres) {
    return acres.filter(a => a === icon.tree).length >= 3;
  }

  has3LumbersOrMore(acres) {
    return acres.filter(a => a === icon.lumber).length >= 3;
  }

  hasMin1Lumber1Tree(acres) {
    return (
      acres.some(a => a === icon.lumber) && acres.some(a => a === icon.tree)
    );
  }

  getNewAcre(x, y) {
    const adjAcres = this.getNeighbours(x, y);
    const curAcre = this.acres[y][x];
    let newAcre = curAcre;

    if (curAcre === icon.open && this.has3TreesOrMore(adjAcres)) {
      newAcre = icon.tree;
    }

    if (curAcre === icon.tree && this.has3LumbersOrMore(adjAcres)) {
      newAcre = icon.lumber;
    }

    if (curAcre === icon.lumber && !this.hasMin1Lumber1Tree(adjAcres)) {
      newAcre = icon.open;
    }
    return newAcre;
  }

  nextMinute() {
    const counts = {
      trees: 0,
      lumber: 0
    };

    const newAcres = this.acres.map((row, y) => {
      return row.map((col, x) => {
        const newAcre = this.getNewAcre(x, y);
        if (newAcre === icon.tree) {
          counts.trees += 1;
        }
        if (newAcre === icon.lumber) {
          counts.lumber += 1;
        }
        return newAcre;
      });
    });

    this.acres = newAcres;
    return counts;
  }

  print() {
    let str = "";
    this.acres.forEach((row, y) => {
      row.forEach((col, x) => {
        str += col;
      });
      str += "\n";
    });
    console.log(str);
  }
}

module.exports = Land;
