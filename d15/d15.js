const fs = require("fs");
const { filename } = require("../utils");
const { Game } = require("./Game");

const data = fs.readFileSync(filename).toString();
const g = new Game(data);
const outcome = g.play();
console.log("outcome: ", outcome);
