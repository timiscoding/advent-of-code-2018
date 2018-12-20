const { Tree, TreeVertex } = require("./Tree");
const Queue = require("../d11/Queue");
const { posCompare, __DEBUG } = require("./common");

class Player {
  constructor(pos, players, paths, id) {
    this.pos = pos;
    this.players = players;
    this.paths = paths;
    this.hp = 200; // hit points
    this.ap = 3; // attack power
    this.id = id;
    if (this instanceof Elf) {
      this.enemy = Goblin;
    } else {
      this.enemy = Elf;
    }
  }

  setAp(newAp) {
    this.ap = newAp;
  }

  nextMove() {
    let enemies =
      this.enemy === Goblin ? this.players.goblins : this.players.elves;
    const nextMove = enemies.reduce(
      (res, enemy) => {
        const { length, path } = this.shortestPath(enemy.pos);
        if (length === Infinity) return res;
        if (length === 0)
          return {
            length: 0,
            nextPos: null,
            enemyAdjPos: null,
            enemyPos: null
          };

        const enemyAdjPos = path[path.length - 1].pos;
        const nextPos = path[0].pos;
        if (
          length < res.length ||
          (length === res.length &&
            posCompare(res.enemyAdjPos, enemyAdjPos) > 0)
        ) {
          return {
            length,
            nextPos,
            enemyAdjPos,
            enemy
          };
        }
        return res;
      },
      {
        length: Infinity,
        nextPos: null,
        enemyAdjPos: null,
        enemy: null
      }
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

    let vertex;
    while ((vertex = layers.dequeue()) && vertex !== endVertex) {
      discovered.add(vertex);
      for (let neighbour of vertex.getEdges()) {
        if (
          !discovered.has(neighbour) &&
          (neighbour === endVertex || !this.players.pos.has(neighbour))
        ) {
          discovered.add(neighbour);
          let parent = bfsTree.getVertex(vertex.getKey());
          if (!parent) {
            parent = bfsTree.addVertex(new TreeVertex(vertex, vertex.id));
          }
          const child = bfsTree.addVertex(
            new TreeVertex(neighbour, neighbour.id)
          );
          bfsTree.addEdge(parent, child);
          layers.enqueue(neighbour);
        }
      }
    }

    let length = Infinity;
    const path = [];
    if (vertex === endVertex) {
      let cur = bfsTree.getVertex(endVertex.getKey()).parent;
      while (cur.value !== startVertex) {
        path.push(cur.value.value);
        cur = cur.parent;
      }
      length = path.length;
    }

    // console.log(
    //   "shortest path from %s to %s is %s of length %s",
    //   endVertex.value.pos,
    //   startVertex.value.pos,
    //   path.map(p => p.value.pos).join(" -> "),
    //   path.length
    // );
    return { length, path };
  }

  attack() {
    const enemy = this.findAdjEnemy();
    if (enemy) {
      enemy.damage(this.ap);
    }
    return enemy;
  }

  damage(ap) {
    this.hp -= ap;
  }

  findAdjEnemy() {
    const [x, y] = this.pos;
    let weak = null;
    [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]].forEach(p => {
      const path = this.paths.getVertex(p);
      if (path && this.players.pos.has(path)) {
        const player = this.players.pos.get(path);
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

class Elf extends Player {
  constructor(...args) {
    super(...args);
  }

  toString() {
    return `Elf { id: ${this.id} pos: ${this.pos} }`;
  }
}

class Goblin extends Player {
  constructor(...args) {
    super(...args);
  }

  toString() {
    return `Goblin { id: ${this.id} pos: ${this.pos} }`;
  }
}

module.exports = { Elf, Goblin };
