const fs = require("fs");
const { filename } = require("../utils");
const WaterSim = require("./WaterSim");

const test = require("./test-data");

const input = fs.readFileSync(filename).toString();
// const input = test.sample;

const sim = new WaterSim(input, [500, 0]);
sim.run();
sim.countWater();
sim.countUndrainedWater();
sim.drawOutput();
