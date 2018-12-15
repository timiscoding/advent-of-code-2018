class Path {
  constructor(pt) {
    if (!Array.isArray(pt) || pt.length !== 2) {
      throw new Error("Arg must be an array [x,y]!");
    }
    if (!(typeof pt[0] === "number") || !typeof pt[1]) {
      throw new Error("Args x,y must be numbers!");
    }
    this.loc = pt;
    this.edges = [];
  }

  toString() {
    const edges = this.edges.map(e => `{${e.loc}}`).join(", ");
    return `Path { loc: [${this.loc}], edges: ${edges} }`;
  }
}

class StraightPath extends Path {}
class CurvePath extends Path {
  toString() {
    return "Curve" + super.toString();
  }
}
class BCurvePath extends CurvePath {
  toString() {
    return "Back" + super.toString();
  }
}
class FCurvePath extends CurvePath {
  toString() {
    return "Forward" + super.toString();
  }
}
class IntPath extends Path {
  toString() {
    return "Int" + super.toString();
  }
}
class VerPath extends StraightPath {
  toString() {
    return "Ver" + super.toString();
  }
}
class HorPath extends StraightPath {
  toString() {
    return "Hor" + super.toString();
  }
}

// const c = new CurvePath([1, 2]);
// const v = new VerPath([1, 2]);
// const h = new HorPath([1, 2]);
// console.log(c instanceof Path);
// console.log(v instanceof Path);
// console.log(h instanceof StraightPath);

class Graph {
  constructor() {
    this.paths = {};
    this.size = { x: 0, y: 0 };
  }

  addPath(path) {
    if (!(path instanceof Path)) {
      throw new Error("path arg must be a Path instance");
    }
    this.paths[path.loc] = path;

    if (path.loc[0] > this.size.x) {
      this.size.x = path.loc[0] + 1;
    }
    if (path.loc[1] > this.size.y) {
      this.size.y = path.loc[1] + 1;
    }
    return this;
  }

  addEdge(p1, p2) {
    const [path1, path2] = [p1, p2].map(p => {
      if (Array.isArray(p)) {
        const path = this.paths[p];

        if (!path) {
          throw new Error("Cannot find Path objects for either ${p1} or ${p2}");
        }
        return path;
      } else if (p instanceof Path) {
        return p;
      } else {
        throw new Error("Args p1, p2 must both be [x,y] or Path instances!");
      }
    });

    // make sure path nodes are in the graph
    if (!this.paths[path1.loc]) {
      this.addPath(path1);
    }

    if (!this.paths[path2.loc]) {
      this.addPath(path2);
    }

    if (!path1.edges.includes(path2)) {
      path1.edges.push(path2);
    }

    if (!path2.edges.includes(path1)) {
      path2.edges.push(path1);
    }
    return this;
  }

  getPath(pt) {
    if (!Array.isArray(pt)) {
      throw new Error("Arg must be an array [x,y]");
    }
    const path = this.paths[pt];
    if (!path) {
      return null;
    }
    return path;
  }

  getPaths() {
    return Object.values(this.paths);
  }

  toString() {
    let str = "";
    for (let node of Object.values(this.paths)) {
      str += node.toString() + "\n";
      // str += `Node {${loc}} edges ${edges.map(p => `{${p.loc}}`)}\n`;
    }
    return str;
  }
}

module.exports = {
  Graph,
  IntPath,
  HorPath,
  VerPath,
  FCurvePath,
  BCurvePath,
  CurvePath,
  StraightPath
};
