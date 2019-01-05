const PriorityQueue = require("./PriorityQueue");

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  neighbours() {
    const neighbours = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(
      ([dx, dy]) => new Point(this.x + dx, this.y + dy)
    );
    return neighbours.filter(({ x, y }) => x >= 0 && y >= 0);
  }

  toString() {
    return `{${this.x}, ${this.y}}`;
  }

  hash() {
    return this.x * 10000 + this.y;
  }
}

class Node {
  constructor(point, tool, cost) {
    this.point = point;
    this.tool = tool;
    this.cost = cost;
  }

  hash() {
    return this.point.hash() * 10 + this.tool;
  }

  toString() {
    return `${this.point},${this.tool},${this.cost}`;
  }
}

class Geologist {
  constructor(depth, target) {
    this.depth = depth;
    this.target = target;
    this.erosion = {}; // erosion levels
    this.gi = {}; // geologic indices
  }

  static get types() {
    return {
      rocky: 0,
      wet: 1,
      narrow: 2,
      0: ".",
      1: "=",
      2: "|"
    };
  }

  static get tools() {
    return {
      torch: 0,
      climbing: 1,
      neither: 2,
      0: "torch",
      1: "climbing",
      2: "neither"
    };
  }

  getGI(x, y) {
    let index = this.gi[[x, y]];

    if (!index) {
      if (x + y === 0 || (x === this.target[0] && y === this.target[1])) {
        index = 0;
      } else if (y === 0) {
        index = x * 16807;
      } else if (x === 0) {
        index = y * 48271;
      } else {
        index = this.getErosion(x - 1, y) * this.getErosion(x, y - 1);
      }
      this.gi[[x, y]] = index;
    }

    return index;
  }

  getErosion(x, y) {
    let level = this.erosion[[x, y]];

    if (!level) {
      let gi = this.gi[[x, y]];
      if (!gi) gi = this.getGI(x, y);
      level = (gi + this.depth) % 20183;
      this.erosion[[x, y]] = level;
    }

    return level;
  }

  getType(x, y) {
    return this.getErosion(x, y) % 3;
  }

  getTools(x, y) {
    const { climbing, torch, neither } = Geologist.tools;
    const { rocky, narrow, wet } = Geologist.types;
    const type = this.getType(x, y);
    if (type === rocky) {
      return [climbing, torch];
    }
    if (type === narrow) {
      return [torch, neither];
    }
    if (type === wet) {
      return [climbing, neither];
    }
  }

  changeTool(x, y, curTool) {
    return this.getTools(x, y).filter(t => t !== curTool)[0];
  }

  commonTools(pt, pt2) {
    const tools = new Set(this.getTools(pt.x, pt.y));
    return this.getTools(pt2.x, pt2.y).filter(t => tools.has(t));
  }

  riskLevel() {
    const [tx, ty] = this.target;
    let risk = 0;
    for (let y = 0; y <= ty; y++) {
      for (let x = 0; x <= tx; x++) {
        risk += this.getErosion(x, y) % 3;
      }
      y % 100 === 0 && console.log("Computing risk level for y at %s", y);
    }
    return risk;
  }

  printTypeField(size = 16) {
    let s = "";
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        s += Geologist.types[this.getType(x, y)];
      }
      s += "\n";
    }
    console.log(s);
  }

  /* implements Dijkstra's shortest path alg.

  This one is weird because we have to build up the graph as we walk the paths and also find the
  shortest paths on the fly. Solution inspired from reading

  https://todd.ginsberg.com/post/advent-of-code/2018/day22/
  https://github.com/fhinkel/AdventOfCode2018/blob/master/day22.js

  The way it works is that we start walking from the (0,0,torch,time) while building nodes
  (x,y,tool,time) as we go. The current node is where we're currently stopped at and we look at the
  immediate neighbours, adding the time it takes to get to that node from the current node. We only
  add nodes under 3 conditions:

  1. the neighbour path contains a compatible tool which we've equipped
  2. we change tools on the current path so as to allow the algorithm to determine a quicker path
  had we switched tools.
  3. when we arrive at a node, we have already found the shortest path for it so only do the above
  for those which we haven't traversed

  Graph wise, we connect neighbour nodes to the current node as we walk along the paths.
  So if we start at M and want to get to T:

  M=T.
  .==.
  ....

  we have 2 paths to investigate initially, down and right. going down incurs 1 minute. Going right
  we would have to change tools so 7 minutes. The algo chooses the smallest cost every time so we
  go down and do the same thing. At {0,1} we have 2 options, {0,2,Torch} with cost 2 and
  {0,1,Climbing} with cost 8. In this way we are essentially building nodes with edges from M to each
  coordinate while tracking the shortest path each time.

  To get this working in a shortish time, I use this priority queue impl

  https://github.com/trekhleb/javascript-algorithms/blob/master/src/data-structures/priority-queue/PriorityQueue.js

  but modified to use 'hashtable' to keep track of node positions. It results in a significant speed
  up due to going from linear searching to constant time lookup. Without hashtable takes 30 min
  but now it runs in about 2 min
  */
  shortestPath(printPath = false) {
    const startNode = new Node(new Point(0, 0), Geologist.tools.torch, 0);
    const heap = new PriorityQueue();
    heap.add(startNode);
    const done = new Set(); // nodes that we have already found the shortest path for

    while (!heap.isEmpty()) {
      let cur = heap.poll();
      const { point: curPoint, tool: curTool } = cur;
      const neighbourNodes = [];

      curPoint.y % 20 === 0 &&
        curPoint.x === 0 &&
        console.log(
          "Finding shortest paths for y at %s with %s",
          curPoint.y,
          Geologist.tools[curTool]
        );
      // reached target so we're done
      if (
        curPoint.x === this.target[0] &&
        curPoint.y === this.target[1] &&
        curTool === Geologist.tools.torch
      ) {
        if (printPath) {
          let n = cur;
          while (n) {
            console.log("prev", n.point, Geologist.tools[n.tool]);
            n = n.prev;
          }
        }
        console.log(
          "At %s with %s, min cost %s",
          cur.point,
          Geologist.tools[cur.tool],
          cur.cost
        );
        return;
      }

      // for all neighbour paths with the same tool as current path, add 1 to the current time cost
      for (let n of curPoint.neighbours()) {
        if (this.getTools(n.x, n.y).includes(curTool)) {
          neighbourNodes.push(new Node(n, curTool, cur.cost + 1));
        }
      }

      // change tools for every current path and add 7 to the time cost
      const newTool = this.changeTool(curPoint.x, curPoint.y, curTool);
      neighbourNodes.push(new Node(curPoint, newTool, cur.cost + 7));

      for (let n of neighbourNodes) {
        // only add nodes to the heap that we have not found the smallest time cost for yet
        if (done.has(n.hash())) {
          continue;
        }
        // we haven't seen a time cost for this path so just add it
        if (!heap.hasValue(n)) {
          n.prev = cur;
          heap.add(n, n.cost);
        } else {
          const indexOfN = heap.findByValue(n)[0];
          const node = heap.heapContainer[indexOfN];
          // update the smallest time cost if its smaller than the one we currently have
          if (node.cost > n.cost) {
            node.prev = cur;
            node.cost = n.cost;
            heap.changePriority(node, node.cost);
            // heap.remove(node);
            // heap.add(n, n.cost);
          }
        }
      }
      done.add(cur.hash()); // we've found the shortest path for this path so add it to the list
    }
  }
}

module.exports = Geologist;
