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
    return `{GraphVertex id: ${this.id} value: ${
      this.value
    } edges: [${this.getEdges()
      .map(e => e.id)
      .join(",")}]}`;
  }

  valueOf() {
    return this.value.valueOf();
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

module.exports = {
  Graph,
  GraphVertex
};
