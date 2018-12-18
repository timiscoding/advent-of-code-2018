const { Game } = require("./Game");

const data = `
#########
#G..G..G#
#.......#
#.......#
#G..E..G#
#.......#
#.......#
#G..G..G#
#########`;

const g = new Game(data);
g.play();
