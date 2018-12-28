const fs = require("fs");
const { filename } = require("../utils");
const Parser = require("./Parser");

const data = fs.readFileSync(filename).toString();
// const data = "^ENNWSWW(NEWS|)SSSEEN(WNSE|)EE(SWEN|)NNN$";
// const data =
//   "^WSSEESWWWNW(S|NENNEEEENN(ESSSSW(NWSW|SSEN)|WSWWN(E|WWS(E|SS))))$";
const p = new Parser(data);
p.parse();
const res = p.maxPathLen();
console.log("res: ", res);
