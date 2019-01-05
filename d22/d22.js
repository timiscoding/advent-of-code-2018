const Geologist = require("./Geologist");

const g = new Geologist(510, [10, 10]);
// const g = new Geologist(4845, [6, 770]);
const riskLevel = g.riskLevel();
g.shortestPath();
console.log("Risk level", riskLevel);
