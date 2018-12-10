const { timer } = require("../utils");

const puts = (...args) => args.forEach(a => console.log(String(a)));

function marbleFactory(_i = 0) {
  function Marble(prev = null, next = null) {
    this.id = _i++;
    this.prev = prev;
    this.next = next;
  }

  Marble.prototype.toString = function MarbleToString() {
    return `{ id:${this.id} prev:${this.prev.id} next:${this.next.id} }`;
  };

  return Marble;
}

class LinkedList {
  constructor() {
    this.Marble = marbleFactory();
    const marble0 = new this.Marble();
    marble0.prev = marble0;
    marble0.next = marble0;
    this.curMarble = marble0;
    this.head = marble0;
  }

  getCur() {
    return this.curMarble;
  }

  getNext() {
    return (this.curMarble = this.curMarble.next);
  }

  getPrev() {
    return (this.curMarble = this.curMarble.prev);
  }

  add() {
    const newMarble = new this.Marble();
    const left = this.curMarble;
    const right = this.curMarble.next;
    left.next = newMarble;
    right.prev = newMarble;
    newMarble.prev = left;
    newMarble.next = right;
    this.curMarble = newMarble;
  }

  remove() {
    let removed = this.curMarble;
    const left = this.curMarble.prev;
    const right = this.curMarble.next;
    left.next = right;
    right.prev = left;
    this.curMarble = right;
    if (removed === this.head) {
      this.head = right;
    }
    removed = null;
  }

  toString() {
    let str = "";
    let marble = this.head;
    do {
      str += marble.id + (this.curMarble === marble ? "<" : " ");
      marble = marble.next;
    } while (marble !== this.head);
    return str;
  }
}

function playGame(numPlayers, numMarbles) {
  const l = new LinkedList();
  const scores = Array(numPlayers).fill(0);
  let turn = 0;
  let marblesPlayed = 1;

  while (marblesPlayed++ <= numMarbles) {
    const nextId = l.getCur().id + 1;
    if (nextId % 23 === 0) {
      let goBackTimes = 7;
      while (goBackTimes--) {
        l.getPrev();
      }
      lastRemovedId = l.getCur().id;
      l.remove();
      scores[turn] += new l.Marble().id + lastRemovedId;
    } else {
      l.getNext();
      l.add();
    }
    // puts(`[${turn}] ` + l);
    turn = (turn + 1) % numPlayers;
  }
  return Math.max(...scores);
}

const games = [
  { players: 10, marbles: 8317 },
  { players: 13, marbles: 146373 },
  { players: 17, marbles: 2764 },
  { players: 21, marbles: 54718 },
  { players: 30, marbles: 37305 },
  { players: 476, marbles: 71657 },
  { players: 476, marbles: 7165700 }
];

const res = timer(...games.map(g => () => playGame(g.players, g.marbles)));
console.table(
  Object.values(games).reduce(
    (r, v, i) => ({
      ...r,
      [`${v.players} players ${v.marbles} marbles`]: res[i]
    }),
    {}
  )
);
