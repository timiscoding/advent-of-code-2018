const fs = require("fs");
const { filename } = require("../utils");

function parseData() {
  const data = fs.readFileSync(filename).toString();
  const lines = data.trim().split("\n");
  return lines.map(l => ({ parent: l[5], child: l[36] }));
}

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

/* returns whether the node is ready for processing  */
function isStepReady(node, stepsDone) {
  return node.parents.every(p => stepsDone.has(p));
}

function topologicalSort() {
  const g = new Graph();

  parseData().forEach(({ parent, child }) => {
    const p = g.addNode(parent);
    const c = g.addNode(child);
    g.addEdge(p, c);
  });

  const done = new Set();
  let nextSteps = g
    .getNodes()
    .filter(n => n.parents.length === 0)
    .sort((a, b) => (a.name < b.name ? -1 : 1)); // maybe heap better

  let step;
  while (nextSteps.length) {
    step = nextSteps.shift();
    done.add(step);

    const newSteps = step.children.filter(c => isStepReady(c, done));
    nextSteps = newSteps
      .reduce((res, step) => {
        return res.includes(step) ? res : res.concat(step);
      }, nextSteps)
      .sort((a, b) => (a.name < b.name ? -1 : 1));
    console.log("done", [...done]);
    console.log("next", nextSteps);
  }
  return [...done].map(n => n.name).join("");
}

const sorted = topologicalSort();
console.log(sorted);

const taskTime = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  .split("")
  .reduce((res, c, i) => ({ ...res, [c]: i + 1 }), {});
console.log("taskTime: ", taskTime);
