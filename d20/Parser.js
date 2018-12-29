const { idMaker } = require("../utils");
const { Tree, TreeVertex } = require("../d15/Tree");

const pathSymbol = { N: "N", E: "E", S: "S", W: "W", name: "PathSymbol" };

const pathId = idMaker();

class PathNode {
  constructor({ type = "path", path, distx, id = pathId() }) {
    this.id = id;
    this.type = type;
    this.path = path;
    this.distx = distx; // number of rooms to x
  }

  valueOf() {
    return this.id;
  }

  toString() {
    return `${this.path} ${this.type} ${this.distx}`;
  }
}

class Parser {
  constructor(regex, debug = false) {
    this.regex = regex.trim().split("");
    this.regexPtr = 0;
    this.tree = new Tree();
    this.rootNode = null;
    this.paths = [];
    this.depth = 0;
    this.last = [];
    this.lastSize = 10;
    this.debug = debug;

    if (this.debug) {
      this.path = this._logger.bind(this, this.path);
    }
  }

  parse() {
    this.fullPath();
  }

  maxPathLen() {
    let curNode = this.rootNode;
    const stack = [curNode];
    let maxLen = 0;
    const seen = new Set();
    const path = [];
    while (stack.length > 0) {
      curNode = stack.pop();
      if (!seen.has(curNode)) {
        seen.add(curNode);

        if (curNode.children.length > 0) {
          stack.push(curNode, ...curNode.children);
          path.push(curNode.value.path);
          continue;
        }

        let leafPath = path.join("") + curNode.value.path;
        if (leafPath.length > maxLen) {
          maxLen = leafPath.length;
        }
      } else {
        path.pop();
      }
    }

    return maxLen;
  }

  pathsWithMinLen(minLen) {
    let curNode = this.rootNode;
    const stack = [curNode];
    const seen = new Set();
    let paths = 0;
    curNode.value.distx = 1;
    while (stack.length > 0) {
      curNode = stack.pop();
      if (!seen.has(curNode)) {
        seen.add(curNode);

        if (curNode.value.distx >= minLen) {
          paths++;
        }
        if (curNode.children.length > 0) {
          curNode.children.forEach(
            c => (c.value.distx = c.parent.value.distx + 1)
          );

          stack.push(...curNode.children);
        }
      }
    }
    return paths;
  }

  getRooms() {
    let cur = this.rootNode;
    const stack = [cur];
    let rooms = "";
    while (stack.length) {
      cur = stack.pop();

      if (cur.children.length > 0) {
        stack.push(...cur.children.reverse());
      }
      rooms += cur.value.path;
    }
    return rooms;
  }

  _logger(fn) {
    const res = fn.call(this);
    if (res) {
      console.log(".".repeat(this.depth) + res);
    }
  }

  _matchCh(expected, errorMsg) {
    let match;
    if (typeof expected === "object") {
      match = !!expected[this.regex[this.regexPtr]];
    } else if (typeof expected === "string") {
      match = this.regex[this.regexPtr] === expected;
    } else {
      throw new Error(
        'Expected string or object arg when calling "cur(expected)"'
      );
    }

    const info = {
      expected: expected.name || expected,
      actual: this.regex[this.regexPtr],
      i: this.regexPtr
    };
    if (this.last.length < this.lastSize) {
      this.last.push(info);
    } else {
      this.last.shift();
      this.last.push(info);
    }

    if (!match && errorMsg) {
      this.error(errorMsg);
    }
    return match;
  }

  match(expected, errorMsg) {
    return this._matchCh(expected, errorMsg);
  }

  cur() {
    return this.regex[this.regexPtr];
  }

  nextToken() {
    this.regexPtr++;
  }

  matchEat(expected, errorMsg) {
    const match = this._matchCh(expected, errorMsg);
    this.regexPtr++;
    return match;
  }

  matchEatIf(expected, errorMsg) {
    const match = this._matchCh(expected, errorMsg);
    if (match) this.regexPtr++;
    return match;
  }

  error(msg) {
    console.log(
      "last matches for %s at index %d",
      this.regex
        .slice(this.regexPtr - this.lastSize, this.regexPtr + 1)
        .join(""),
      this.regexPtr - this.lastSize,
      this.last
    );
    throw new Error(
      `Expected ${msg} but got '${this.regex[this.regexPtr]}' at index ${
        this.regexPtr
      }`
    );
  }

  fullPath() {
    this.matchEat("^", "^ at start of FullPath");
    this.match(pathSymbol, "PathSymbol at start of FullPath");
    this.rootNode = this.advPath();
    this.matchEat("$", "$ at end of FullPath");
  }

  /* Advanced path is more complicated than a 'path' in that it can have
  0 or more branches appended to the end of it. An advanced path can have more
  advPaths appended to itself

  advPath = path? branch* advPath*
  */
  advPath(explode = true) {
    this.match(pathSymbol);
    const path = this.path();
    let node;
    if (path) {
      node = this.tree.addVertex(new PathNode({ path }));
    }

    let childNodes = [];
    const isBranch = this.branch(childNodes);

    let pathNodes;
    if (node && explode) {
      pathNodes = this.explodeNode(node);
    }
    if (isBranch) {
      if (node) {
        if (!pathNodes) pathNodes = this.explodeNode(node);
        childNodes.forEach(c => {
          const cNodes = this.explodeNode(c);
          this.tree.addEdge(pathNodes[pathNodes.length - 1], cNodes[0]);
        });

        const node2 = this.advPath();

        if (node2 instanceof TreeVertex) {
          const pathNodes2 = this.explodeNode(node2);
          this.tree.addEdge(pathNodes[pathNodes.length - 1], pathNodes2[0]);
        } else if (Array.isArray(node2) && node2.length) {
          node2.forEach(c => {
            const cNodes = this.explodeNode(c);
            this.tree.addEdge(pathNodes[pathNodes.length - 1], cNodes[0]);
          });
        }
      } else if (childNodes.length > 0) {
        node = childNodes;
      }
    }

    return node;
  }

  /* explode path node into separate nodes and link them up.
  ie. NSS node becomes N node -> S node -> S node */
  explodeNode(node) {
    const subPath = node.value.path.slice(1);
    node.value.path = node.value.path[0];
    const subPathNodes = subPath
      .split("")
      .map(p => this.tree.addVertex(new PathNode({ path: p })));
    const allNodes = [node, ...subPathNodes];
    allNodes.slice(1).forEach((n, i) => {
      this.tree.addEdge(allNodes[i], n);
    });
    return allNodes;
  }

  /* A branch is an advPath with 1 or more options appended to it

    branch = (advPath option+)
  */
  branch(nodes) {
    let isBranch = false;
    if (this.matchEatIf("(")) {
      this.depth++;

      this.match(pathSymbol, "PathSymbol at start of Branch");
      nodes.push(this.advPath(false));

      this.match("|", "| at Branch");
      this.option(nodes);

      while (this.match("|")) {
        this.option(nodes);
      }

      this.matchEat(")", ") at Branch");
      this.depth--;

      isBranch = true;
    }

    return isBranch;
  }

  /* An option is a pipe symbol with 0 or more advPaths

    option = |advPath*
  */
  option(nodes) {
    if (this.matchEatIf("|")) {
      if (this.match(")")) {
        nodes.forEach(n => {
          n.value.path = n.value.path.slice(0, n.value.path.length / 2);
        });
      } else if (this.match(pathSymbol)) {
        nodes.push(this.advPath(false));
      } else {
        this.error("empty or AdvPath in Option");
      }
    }
  }

  /* A path is a sequence of pathSymbols (N,E,W,S) */
  path() {
    let tokens = "";
    while (this.match(pathSymbol)) {
      tokens += this.cur();
      this.nextToken();
    }
    return tokens;
  }
}

module.exports = Parser;
