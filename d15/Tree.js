const { genId, idMaker } = require("../utils");

class TreeVertex {
  constructor(value, id = genId()) {
    this.value = value;
    this.id = id;
    this.children = [];
    this.parent = null;
  }

  getKey() {
    return this.value.valueOf();
  }

  toString() {
    return `TreeVertex { id: ${this.id} value: ${this.value} parent: ${
      this.parent ? this.parent.id : null
    } children: [${this.children.map(c => c.id).join(",")}]}`;
  }
}

class Tree {
  constructor(root) {
    this.genId = idMaker(root ? 1 : 0);
    this.vertices = {};

    this.root = root ? this.addVertex(root) : null;
  }

  addVertex(value) {
    let vertex;
    if (value instanceof TreeVertex) {
      vertex = value;
    } else {
      vertex = new TreeVertex(value, this.genId());
    }

    if (Object.keys(this.vertices).length === 0) {
      this.root = vertex;
    }

    this.vertices[vertex.getKey()] = vertex;
    return vertex;
  }

  getVertex(key) {
    const vertex = this.vertices[key];

    if (!vertex) {
      return null;
    }
    return vertex;
  }

  addEdge(parent, child) {
    if (!(parent instanceof TreeVertex) && !(child instanceof TreeVertex)) {
      throw new Error("Args parent, child must be TreeVertex instances");
    }

    if (!parent.children.includes(child)) {
      parent.children.push(child);
    }
    child.parent = parent;
  }

  getVertices() {
    return Object.values(this.vertices);
  }

  toString() {
    return (
      "Tree: \n" +
      this.getVertices()
        .map(v => v.toString())
        .join("\n")
    );
  }
}

module.exports = {
  Tree,
  TreeVertex
};

// const t = new Tree();
// const p = t.addVertex("root");
// const c = t.addVertex("child");
// const c2 = t.addVertex("child2");
// const c3 = t.addVertex("child2's child");
// t.addEdge(t.getVertex("root"), c);
// t.addEdge(p, c2);
// t.addEdge(c2, c3);
// console.log("" + t);
