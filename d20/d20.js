const fs = require("fs");
const { filename, puts } = require("../utils");
const Parser = require("./Parser");
const { reduceRooms, chunks } = require("./common");

const data = fs
  .readFileSync(filename)
  .toString()
  .trim();
// const data = "^NN(WS|N(NN|EE))$";
// const data = "^NW(E|S)$";
// const data = "^NEWS(EW|)S$";
// const data = "^N(E|N(N|W(SN|)E))$";
// const data = "^W(S|)E$";
// const data = "^ENNWSWW(NEWS|)SSSEEN(WNSE|)EE(SWEN|)NNN$";
// const data =
//   "^WSSEESWWWNW(S|NENNEEEENN(ESSSSW(NWSW|SSEN)|WSWWN(E|WWS(E|SS))))$";
// const data = "^N(SN|)(EES|W)$";

const p = new Parser(data);
p.parse();
// puts(p.tree);

// const treeRooms = p.getRooms();
// const rooms = reduceRooms(data);
// console.log("rooms equal", rooms === treeRooms);

// console.log(chunks(rooms, 10), "rooms");
// console.log(chunks(treeRooms, 10), "tree rooms");
// console.log(rooms, "rooms");
// console.log(treeRooms, "tree rooms");
// const len = p.tree.getVertices().length;
// console.log("len: ", len);
// puts(p.tree);
// const res2 = p.maxPathLen();
// console.log("res2: ", res2);
const res = p.pathsWithMinLen(1000);
console.log("res: ", res);

// 10120 too high
// 8552
// 8408
// 8514
