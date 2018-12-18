const { Tree, TreeVertex } = require("./Tree");
const Queue = require("../d11/Queue");
const { idMaker } = require("../utils");
const { posCompare, __DEBUG } = require("./common");

class Player {
  constructor(pos, players, paths) {
    this.pos = pos;
    this.players = players;
    this.paths = paths;
    this.hp = 200; // hit points
    this.ap = 3; // attack power
    if (this instanceof Elf) {
      this.enemy = Goblin;
    } else {
      this.enemy = Elf;
    }
  }

  nextMove() {
    let enemies =
      this.enemy === Goblin ? this.players.goblins : this.players.elves;
    const nextMove = enemies.reduce(
      (res, enemy) => {
        const { length, nextPos } = this.shortestPath(enemy.pos);
        if (
          length < res.length ||
          (length !== Infinity &&
            length === res.length &&
            posCompare(res.enemyPos, enemy.pos) > 0)
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
    __DEBUG &&
      console.log(
        "%s #%s moves to %s",
        this instanceof Elf ? "Elf" : "Goblin",
        this.id,
        nextMove.nextPos
      );
    return nextMove;
  }

  /* Finds the shortest path to 'pos' from this player's position.
     Length will be Infinity if it can't find one and 0 if it is next to 'pos'.
     Uses a variant of BFS but stops searching as soon as target is found.
      Args: pos [x,y] is the target path
      Returns: {
        length: the number of steps to be adjacent to 'pos'
        nextPos: where this player should move next [x,y] to walk along the shortest path
      }
   */
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
      // console.log(
      //   "shortest path from %s to %s is %s of length %s",
      //   endVertex.value.pos,
      //   startVertex.value.pos,
      //   path.map(p => p.value.pos).join(" -> "),
      //   path.length
      // );
      length = path.length;
    }

    return { length, nextPos };
  }

  attack() {
    const enemy = this.findAdjEnemy();
    if (enemy) {
      __DEBUG &&
        console.log(
          "%s #%s attacks %s #%s",
          this instanceof Elf ? "Elf" : "Goblin",
          this.id,
          this.enemy === Elf ? "Elf" : "Goblin",
          enemy.id
        );
      enemy.damage(this.ap);
    }
    return enemy;
  }

  damage(ap) {
    this.hp -= ap;
    __DEBUG &&
      console.log(
        "%s #%s damaged hp left",
        this instanceof Elf ? "Elf" : "Goblin",
        this.id,
        this.hp
      );
  }

  findAdjEnemy() {
    const [x, y] = this.pos;
    let weak = null;
    [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]].forEach(p => {
      const path = this.paths.getVertex(p);
      if (path && this.players.pos.has(path)) {
        const player = this.players.pos.get(path);
        // console.log("here" + player);
        if (player instanceof this.enemy) {
          if (weak === null || player.hp < weak.hp) {
            weak = player;
          } else if (
            player.hp === weak.hp &&
            posCompare(weak.pos, player.pos) > 0
          ) {
            weak = player;
          }
        }
      }
    });
    return weak;
  }
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
