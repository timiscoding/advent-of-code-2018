const equidistantGoblins = `
##########
#...E..G.#
#......#.#
#....G.#G#
##########`;

const equidistantElves = `
##########
#...G..E.#
#......#.#
#....E.#E#
##########`;

const equidistantMove = `
#######
#.E...#
#.....#
#...G.#
#######`;

const equidistantMove2 = `
#######
#...E.#
#...#.#
#...G.#
#######`;

const noMove = `
#######
#.....#
#..GE.#
#.....#
#######`;

const playerMoves = `
#######
#....E#
#G....#
#######`;

const playerMoves2 = `
#########
#G..G..G#
#.......#
#.......#
#G..E..G#
#.......#
#.......#
#G..G..G#
#########`;

const attackEnemyOnly = `
#######
#..G..#
#.GGG.#
#..E..#
#######`;

const attackNoone = `
#######
#..G..#
#.GGG.#
#..G..#
#######`;

const attackNoone2 = `
#######
#.....#
#..G..#
#.....#
#######`;

const attackWeakest = `
#######
#..E..#
#.EGE.#
#..E..#
#######`;

const attackSameHP = `
#######
#..E..#
#.EGE.#
#..E..#
#######`;

const attackSameHP2 = `
#######
#.....#
#.EGE.#
#..E..#
#######`;

const attackSameHP3 = `
#######
#.....#
#..GE.#
#..E..#
#######`;

const attack = `
#######
#..GE.#
#######`;

module.exports = {
  equidistantGoblins,
  equidistantElves,
  equidistantMove,
  equidistantMove2,
  playerMoves,
  playerMoves2,
  noMove,
  attackEnemyOnly,
  attackWeakest,
  attackNoone,
  attackNoone2,
  attackSameHP,
  attackSameHP2,
  attackSameHP3,
  attack
};
