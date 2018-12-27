const fs = require("fs");
const { filename } = require("../utils");
const Parser = require("./Parser");

const data = fs.readFileSync(filename).toString();

const p = new Parser(data);
p.parse();
