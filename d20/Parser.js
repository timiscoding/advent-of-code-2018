const { idMaker } = require("../utils");
const { Tree } = require("../d15/Tree");

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
    return `${this.path} ${this.type}`;
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

  maxPathLen(curNode = this.rootNode, path = "", maxLen = 0) {
    if (curNode.children.length === 0) {
      let endPath = "";
      if (curNode.value.type === "skip") {
        const pathLen = curNode.value.path.length / 2;
        endPath = path + curNode.value.path.slice(0, pathLen);
      } else {
        endPath = path + curNode.value.path;
      }

      if (endPath.length > maxLen) {
        maxLen = endPath.length;
      }
      return maxLen;
    }
    for (let child of curNode.children) {
      maxLen = this.maxPathLen(child, path + curNode.value.path, maxLen);
    }

    return maxLen;
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

  advPath = path branch* advPath*
  */
  advPath() {
    this.match(pathSymbol);
    const path = this.path();
    let node;
    if (path) {
      node = this.tree.addVertex(new PathNode({ path }));
    }

    let childNodes = [];
    const isBranch = this.branch(childNodes);

    let node2;
    if (isBranch) {
      childNodes.forEach(c => {
        node && this.tree.addEdge(node, c);
      });
      node2 = this.advPath();

      if (node2) {
        // node = this.joinNodes(node, node2);
        this.tree.addEdge(node, node2);
      }
    }

    return node;
  }

  joinNodes(node, node2) {
    if (node.children.length === 0 && node2.children.length === 0) {
      this.tree.addEdge(node, node2);
    } else if (node.children.length > 0) {
      if (node.children[0].value.type === "skip") {
        this.tree.addEdge(node, node2);
      } else {
        throw new Error(
          "TODO If this throws, handle cases like (N|S)E -> NE and SE nodes"
        );
        node.children.forEach(c => {
          this.tree.addEdge(c);
        });
      }
    }
    // return node2;
  }

  /* A branch is an advPath with 1 or more options appended to it

    branch = (advPath option+)
  */
  branch(nodes) {
    let isBranch = false;
    if (this.matchEatIf("(")) {
      this.depth++;

      this.match(pathSymbol, "PathSymbol at start of Branch");
      nodes.push(this.advPath());

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
        this.debug && console.log(".".repeat(this.depth) + "^optional branch");
        nodes.forEach(n => {
          n.value.type = "skip";
        });
      } else if (this.match(pathSymbol)) {
        nodes.push(this.advPath());
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
