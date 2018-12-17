const Queue = require("../d11/Queue");
const { Tree, TreeVertex } = require("./Tree");
const { idMaker, genId, puts } = require("../utils");

function assertVertex(vertex) {
  if (!(vertex instanceof GraphVertex)) {
    throw new Error("Arg vertex must be a Vertex instance");
  }
}

class GraphVertex {
  constructor(value, id = genId()) {
    this.id = id;
    this.value = value;
    this.edges = [];
  }

  getKey() {
    return this.value.valueOf();
  }

  addEdge(vertex) {
    assertVertex(vertex);
    if (!this.edges.includes(vertex)) {
      this.edges.push(vertex);
    }
    return this;
  }

  getEdges() {
    return this.edges;
  }

  hasEdge(vertex) {
    assertVertex(vertex);
    return this.edges.includes(vertex);
  }

  toString() {
    return `{V id: ${this.id} value: ${this.value} edges: [${this.getEdges()
      .map(e => e.id)
      .join(",")}]}`;
  }
}

class Graph {
  constructor() {
    this.genId = idMaker();
    this.vertices = {};
  }

  getVertex(key) {
    const vertex = this.vertices[key];
    if (!vertex) {
      return null;
    }
    return vertex;
  }

  addVertex(value) {
    let vertex;
    if (value instanceof GraphVertex) {
      vertex = value;
    } else {
      vertex = new GraphVertex(value, this.genId());
    }
    assertVertex(vertex);
    this.vertices[vertex.getKey()] = vertex;
    return vertex;
  }

  getEdges(vertex) {
    assertVertex(vertex);
    return vertex.getEdges();
  }

  addEdge(vertex1, vertex2, isDirected) {
    assertVertex(vertex1);
    assertVertex(vertex2);

    if (isDirected) {
      vertex1.addEdge(vertex2);
    } else {
      vertex1.addEdge(vertex2);
      vertex2.addEdge(vertex1);
    }
  }

  getVertices() {
    return Object.values(this.vertices);
  }

  toString() {
    return (
      "Graph:\n" +
      this.getVertices()
        .map(v => v.toString())
        .join("\n")
    );
  }
}

class Path {
  constructor(pos) {
    this.pos = pos;
  }

  toString() {
    return `[${this.pos}]`;
  }

  valueOf() {
    return this.pos;
  }
}

/* startVertex will be an in-range pos that the attacker wants to move to.
endVertex is the position of the attacker as the shortest path will be 1 of the 4 possible moves
that the attacker can make */
function shortestPath(startVertex, endVertex) {
  const discovered = new Set();
  const layers = new Queue();
  const bfsTree = new Tree();
  layers.enqueue(startVertex);

  console.log("layers" + layers);
  let vertex;
  while ((vertex = layers.dequeue())) {
    // && vertex !== endVertex
    discovered.add(vertex);
    for (let neighbour of vertex.getEdges()) {
      // console.log([...discovered].map(v => v.id));
      // puts(neighbour);
      if (!discovered.has(neighbour)) {
        // TODO check neighbour isn't an elf/goblin as those aren't valid paths
        discovered.add(neighbour);

        let parent = bfsTree.getVertex(vertex.value.pos);
        if (!parent) {
          parent = bfsTree.addVertex(
            new TreeVertex(vertex.value.pos, vertex.id)
          );
        }
        const child = bfsTree.addVertex(
          new TreeVertex(neighbour.value.pos, neighbour.id)
        );
        bfsTree.addEdge(parent, child);
        // console.log("parent %s child %s", parent.id, child.id);
        layers.enqueue(neighbour);
      }
    }
  }

  console.log("" + bfsTree);
  // if (vertex === endVertex) {
  //   const path = [endVertex];
  //   const cur = bfsTree.getVertex(endVertex.getKey());
  //   let parent = cur.getEdges()[0];
  //   while (parent !== startVertex) {

  //     parent = cur.getEdges()[0];
  //   }
  // }
}

const data = `....
....
....`;

const g = new Graph();
data.split("\n").forEach((row, y) => {
  row.split("").forEach((col, x) => {
    if (col === ".") {
      // TODO need to add elf/goblin to this as it's a valid path too
      const cur = g.addVertex(new Path([x, y]));
      const left = g.getVertex([x - 1, y]);
      const above = g.getVertex([x, y - 1]);
      /* add edges in the order top, left, right, bottom. This is 'reading' order (ie. ordered top-bottom
      then left-right). By doing so, we can avoid doing more work when finding the shortest path */
      if (above) {
        g.addEdge(cur, above);
      }
      if (left) {
        g.addEdge(cur, left);
      }
    }
  });
});

// g.getVertices().forEach(v => {
//   const {
//     pos: [x, y]
//   } = v.value;
//   [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]].forEach(pt => {
//     const neighbour = g.getVertex(pt);
//     if (neighbour) g.addEdge(v, neighbour);
//   });
// });

console.log("" + g);
shortestPath(g.getVertex([3, 2]));
