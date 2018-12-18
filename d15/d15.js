const { Elf, Goblin } = require("./Player");
const { Graph } = require("./Graph");

class Path {
  constructor(pos) {
    this.pos = pos;
  }

  toString() {
    return `[${this.pos}]`;
  }

  valueOf() {
    return this.pos;
  }
}

function parseData(data) {
  const g = new Graph();
  const players = {
    elves: [],
    goblins: [],
    pos: new Set()
  };

  data
    .trim()
    .split("\n")
    .forEach((row, y) => {
      row.split("").forEach((col, x) => {
        if (col === "." || col === "E" || col === "G") {
          // TODO need to add elf/goblin to this as it's a valid path too
          const cur = g.addVertex(new Path([x, y]));
          const left = g.getVertex([x - 1, y]);
          const above = g.getVertex([x, y - 1]);
          /* add edges in the order top, left, right, bottom. This is 'reading' order (ie. ordered top-bottom
        then left-right). By doing so, we can avoid doing more work when finding the shortest path */
          if (above) {
            g.addEdge(cur, above);
          }
          if (left) {
            g.addEdge(cur, left);
          }
          if (col === "E" || col === "G") {
            players.pos.add(g.getVertex([x, y]));
          }
          if (col === "E") {
            players.elves.push(new Elf([x, y], players, g));
          } else if (col === "G") {
            players.goblins.push(new Goblin([x, y], players, g));
          }
        }
      });
    });
  return { paths: g, players };
}

const data = `
##########
#...E..G.#
#......#.#
#....G.#G#
##########`;

// const { players, paths } = parseData(data);
// console.log("players" + players.goblins, "\n" + players.elves);
// players.elves[0].cats();

module.exports = { parseData };
