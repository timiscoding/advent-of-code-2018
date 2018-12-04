const fs = require("fs");
const { filename } = require("../utils");

const grid = [];
const GRID_WIDTH = 1000;

function parseData() {
  const data = fs.readFileSync(filename, { encoding: "utf8" });
  const re = /#(\d+)\s+@\s+(\d+),(\d+):\s+(\d+)x(\d+)/;
  const claims = data
    .trim()
    .split("\n")
    .map(claim => {
      const matches = claim.match(re);
      const [id, x, y, w, h] = matches.slice(1).map(v => parseInt(v, 10));
      return {
        id,
        offset: { x, y },
        size: { w, h }
      };
    });
  return claims;
}

/* Populates grid with the bounding box from c (x,y) with size (w,h).
c(x,y) is offset from top left corner.
Eg. c(2,1) size(3,4) would set coordinates (2,1), (2,2) and (2,3)
*/
function claimFabric(c, size, id) {
  gridIterator(c, size, (square, index) => {
    if (square === "x") {
      return;
    } else if (typeof square === "number" && square !== id) {
      grid[index] = "x";
    } else {
      grid[index] = id;
    }
  });
}

/* selects elements in 'grid' specified by 'c' and 'size' and runs an iteratee
function 'fn' that provides the element and index.
If the iteratee function returns true, the iterator will exit early. Similar
to Array.some
*/
function gridIterator(c, size, fn) {
  for (let x = c.x; x < c.x + size.w; x++) {
    for (let y = c.y; y < c.y + size.h; y++) {
      // Convert 2d coord to 1d coord to make it easier to do array indexing
      const index = y * GRID_WIDTH + x;
      const square = grid[index];
      const exitEarly = fn(square, index);
      if (exitEarly) return;
    }
  }
}

function getOverlap() {
  return grid.reduce((res, square) => (square === "x" ? res + 1 : res), 0);
}

function isOverlap(c, size) {
  let overlap = false;
  gridIterator(c, size, square => {
    if (square === "x") {
      overlap = true;
      return true;
    }
  });
  return overlap;
}

function getNoOverlapId() {
  let noOverlapId;
  claims.some(c => {
    if (!isOverlap(c.offset, c.size)) {
      noOverlapId = c.id;
      return true;
    }
    return false;
  });
  console.log("No overlap id:", noOverlapId);
}

const claims = parseData();

console.time("non overlap took");
console.time("Overlap took");
claims.forEach(c => claimFabric(c.offset, c.size, c.id));
console.timeEnd("Overlap took");

console.log("Overlapped squares:", getOverlap());

getNoOverlapId();
console.timeEnd("non overlap took");
console.log(grid.length);
