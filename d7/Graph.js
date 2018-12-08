/* adjacency list implementation of a graph */

function Node(name = "") {
  this.name = name;
  this.children = [];
  this.parents = [];
}

class Graph {
  constructor() {
    this.nodes = {};
  }

  addNode(name) {
    this.nodes[name] = this.nodes[name] || new Node(name);
    return this.nodes[name];
  }

  addEdge(parent, child) {
    if (!parent || !(parent instanceof Node)) {
      throw new Error("parent undefined or not Node instance");
    } else if (!child || !(child instanceof Node)) {
      throw new Error("child undefined or not Node instance");
    }

    if (!parent.children.includes(child)) {
      parent.children.push(child);
    }

    if (!child.parents.includes(parent)) {
      child.parents.push(parent);
    }
  }

  getChildren(name) {
    if (typeof name !== "string" && !this.nodes[name]) {
      throw Error(`Node with name '${name}' does not exist`);
    }
    return this.nodes[name].children;
  }

  getParents(name) {
    if (typeof name !== "string" && !this.nodes[name]) {
      throw Error(`Node with name '${name}' does not exist`);
    }
    return this.nodes[name].parents;
  }

  getNode(name) {
    if (!this.nodes[name]) {
      throw Error(`Node with name '${name}' does not exist`);
    }
    return this.nodes[name];
  }

  getNodes() {
    return Object.values(this.nodes);
  }

  print() {
    console.group("Nodes:");
    for (const [name, v] of Object.entries(this.nodes)) {
      console.log(
        `${name} parents:${
          v.parents.length ? v.parents.map(n => n.name) : "[]"
        } children:${v.children.length ? v.children.map(n => n.name) : "[]"}`
      );
    }
    console.groupEnd();
  }
}

module.exports.Node = Node;
module.exports.Graph = Graph;
