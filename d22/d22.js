const Geologist = require("./Geologist");

const g = new Geologist(4845, [6, 770]);
const res = g.riskLevel();
console.log("res: ", res);
