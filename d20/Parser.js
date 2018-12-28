const pathSymbol = { N: "N", E: "E", S: "S", W: "W", name: "PathSymbol" };

class Parser {
  constructor(regex, debug = false) {
    this.regex = regex.trim().split("");
    this.regexPtr = 0;
    this.last = [];
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
    return this.fullPath();
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
    const maxPathLen = this.advPath();
    this.matchEat("$", "$ at end of FullPath");
    return maxPathLen;
  }

  /* Advanced path is more complicated than a 'path' in that it can have
  0 or more branches appended to the end of it. An advanced path can have more
  advPaths appended to itself

  advPath = path branch* advPath*
  */
  advPath() {
    this.match(pathSymbol);
    const pathLen = this.path().length;
    }
  }

  /* A branch is an advPath with 1 or more options appended to it

    branch = (advPath option+)
  */
  branch(nodes) {
    let res = { branchLen: 0 };
    const pathLens = [];
    if (this.matchEatIf("(")) {
      this.depth++;

      this.match(pathSymbol, "PathSymbol at start of Branch");
      pathLens.push(this.advPath());

      this.match("|", "| at Branch");
      res.isEmptyOption = this.option(pathLens);

      while (this.match("|")) {
        res.isEmptyOption = this.option(pathLens);
      }

      this.matchEat(")", ") at Branch");
      this.depth--;
      res.branchLen = Math.max(...pathLens);
    }
    return res;
  }

  /* An option is a pipe symbol with 0 or more advPaths

    option = |advPath*
  */
  option(pathLens) {
    let isEmptyOption = false;
    if (this.matchEatIf("|")) {
      if (this.match(")")) {
        isEmptyOption = true;
        this.debug && console.log(".".repeat(this.depth) + "^optional branch");
        pathLens.forEach((_, i) => (pathLens[i] = pathLens[i] / 2));
      } else if (this.match(pathSymbol)) {
        pathLens.push(this.advPath());
      } else {
        this.error("empty or AdvPath in Option");
      }
    }
    return isEmptyOption;
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
