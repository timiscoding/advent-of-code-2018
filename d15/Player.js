const { Tree, TreeVertex } = require("./Tree");
const Queue = require("../d11/Queue");
const { idMaker } = require("../utils");

class Player {
  constructor(pos, players, paths) {
    this.pos = pos;
    this.players = players;
    this.paths = paths;
  }

  move() {
    let enemies;
    if (this instanceof Elf) {
      enemies = this.players.goblins;
    } else {
      enemies = this.players.elves;
    }
    const nextMove = enemies.reduce(
      (res, enemy) => {
        const { length, nextPos } = this.shortestPath(enemy.pos);
        if (
          length < res.length ||
          (length === res.length && posCompare(res.enemyPos, enemy.pos) > 0)
        ) {
          return {
            length,
            nextPos,
            enemyPos: enemy.pos
          };
        }
        return res;
      },
      { length: Infinity, nextPos: null, enemyPos: null }
    );
    console.log("nextMove", nextMove);
    return nextMove;
  }

  /* startVertex will be an in-range pos that the attacker wants to move to.
  endVertex is the position of the attacker as the shortest path will be 1 of the 4 possible moves
  that the attacker can make */
  shortestPath(pos) {
    const startVertex = this.paths.getVertex(pos);
    const endVertex = this.paths.getVertex(this.pos);
    const discovered = new Set();
    const layers = new Queue();
    const bfsTree = new Tree();
    layers.enqueue(startVertex);

    // console.log("layers" + layers);
    let vertex;
    while ((vertex = layers.dequeue()) && vertex !== endVertex) {
      discovered.add(vertex);
      for (let neighbour of vertex.getEdges()) {
        // console.log([...discovered].map(v => v.id));
        // puts("neigh", neighbour);
        if (
          !discovered.has(neighbour) &&
          (neighbour === endVertex || !this.players.pos.has(neighbour))
        ) {
          discovered.add(neighbour);
          // console.log("neighbour discovered");
          let parent = bfsTree.getVertex(vertex.getKey());
          if (!parent) {
            parent = bfsTree.addVertex(new TreeVertex(vertex, vertex.id));
          }
          const child = bfsTree.addVertex(
            new TreeVertex(neighbour, neighbour.id)
          );
          bfsTree.addEdge(parent, child);
          // console.log("parent %s child %s", parent.id, child.id);
          layers.enqueue(neighbour);
        }
      }
    }

    let length = Infinity;
    let nextPos;
    if (vertex === endVertex) {
      const path = [];
      let cur = bfsTree.getVertex(endVertex.getKey()).parent;
      nextPos = cur.value.value.pos;
      while (cur.value !== startVertex) {
        path.push(cur.value);
        cur = cur.parent;
      }
      console.log(
        "shortest path from %s to %s is %s of length %s",
        endVertex.value.pos,
        startVertex.value.pos,
        path.map(p => p.value.pos).join(" -> "),
        path.length
      );
      length = path.length;
    }

    return { length, nextPos };
  }
}

/* compares 2 positions [x,y] and returns
      < 0 if 'a' comes before 'b' in read order (top to bottom, left to right)
      0 if 'a' is equal to 'b'
      > 0 if 'a' comes after 'b' in read order
*/
function posCompare(a, b) {
  const yDiff = a[1] - b[1];
  if (yDiff !== 0) return yDiff;
  return a[0] - b[0];
}

const newElfId = idMaker();
const newGoblinId = idMaker();

class Elf extends Player {
  constructor(pos, players, paths) {
    super(pos, players, paths);
    this.id = newElfId();
  }

  toString() {
    return `Elf { id: ${this.id} pos: ${this.pos} }`;
  }
}

class Goblin extends Player {
  constructor(pos, players, paths) {
    super(pos, players, paths);
    this.id = newGoblinId();
  }

  toString() {
    return `Goblin { id: ${this.id} pos: ${this.pos} }`;
  }
}

module.exports = { Elf, Goblin };
