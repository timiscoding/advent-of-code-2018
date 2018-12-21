const fs = require("fs");
const CPU = require("./CPU");
const { matchesInstr, getOpCodeMap, executeProgram } = require("./solvers");

function parseSamplesData(filename = "./part1-data") {
  const data = fs.readFileSync(filename).toString();

  const samples = [];
  let sample = {};
  data
    .trim()
    .split("\n")
    .filter(Boolean)
    .forEach(line => {
      if (line.startsWith("Before") || line.startsWith("After")) {
        const [, r0, r1, r2, r3] = line
          .match(/(\d+),\s+(\d+),\s+(\d+),\s+(\d+)/)
          .map(Number);

        if (line.startsWith("Before")) {
          sample.init = [r0, r1, r2, r3];
        } else {
          sample.res = [r0, r1, r2, r3];
          samples.push(sample);
          sample = {};
        }
      } else {
        const [op, a, b, c] = line.split(" ").map(Number);
        sample.instrArgs = { op, a, b, c };
      }
    });
  return samples;
}

function parseProgramData(filename = "./part2-data") {
  const data = fs.readFileSync(filename).toString();
  return data
    .trim()
    .split("\n")
    .map(line =>
      line
        .trim()
        .split(" ")
        .map(Number)
    );
}

const samples = parseSamplesData();
const part1 = samples.reduce(
  (res, sample) => (matchesInstr(sample).size >= 3 ? res + 1 : res),
  0
);

console.log(
  "Part 1: There are %s/%s samples that match 3 or more instructions",
  part1,
  samples.length
);

const program = parseProgramData();
const opCodeMap = getOpCodeMap(samples);
const resRegister = executeProgram(program, opCodeMap);

console.log("After executing program, the register contents are", resRegister);
