const { Game } = require("./Game");

const data = `
#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######`;

const g = new Game(data);
g.play();
