const fs = require("fs");
const { filename, puts } = require("../utils");
const Parser = require("./Parser");

const data = fs.readFileSync(filename).toString();

const p = new Parser(data);
const res = p.maxPathLen();
console.log("res: ", res);
