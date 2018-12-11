const { timer } = require("../utils");

function powerGrid(serial, gridSize) {
  return Array.from({ length: gridSize }, (_, i) =>
    Array.from({ length: gridSize }, (_, j) => {
      const x = j + 1;
      const y = i + 1;
      const rackId = x + 10;
      const power = (rackId * y + serial) * rackId;
      const hundreds = Math.trunc(power / 100) % 10;
      const finalPower = hundreds - 5;
      return finalPower;
    })
  );
}

/* x,y fuel cells start at 1,1 */
function getPowerLevel(x, y, levels) {
  return levels[y - 1][x - 1];
}

/* create a window with top left 0,0 */
function window(size) {
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => ({ x, y }))
  );
}

function filterGrid(window, grid) {
  return Array.from({ length: grid.length }, (_, y) =>
    Array.from({ length: grid.length }, (_, x) => {
      if (x > grid.length - window.length || y > grid.length - window.length)
        return 0;

      const powerSum = window.reduce((rowSum, row) => {
        return (
          rowSum +
          row.reduce((colSum, win) => {
            return colSum + grid[y + win.y][x + win.x];
          }, 0)
        );
      }, 0);
      return powerSum;
    })
  );
}

/* returns a slice of a grid at x,y. for fuel cells, subtract 1 from the value to get x/y */
function gridSlice(grid, x, y, size) {
  return grid.slice(y, y + size).map(row => row.slice(x, x + size));
}

function maxPower(grid) {
  let x, y;
  let maxPower = -Infinity;
  grid.forEach((row, i) => {
    row.forEach((power, j) => {
      if (power > maxPower) {
        maxPower = power;
        x = j + 1; // need to add 1 as fuel cells are 1-indexed
        y = i + 1;
      }
    });
  });
  return {
    maxPower,
    x,
    y
  };
}

function maxPowerAnyWindow() {
  const levels = powerGrid(7400, 300);
  const windowSizes = Array.from({ length: 300 }, (_, i) => i + 1);
  const res = windowSizes.reduce(
    (res, winSize) => {
      console.log("Computing max power for window size %s", winSize);
      const win = window(winSize);
      const powerSums = filterGrid(win, levels);
      const { maxPower: curMax, x, y } = maxPower(powerSums);
      if (curMax > res.max) {
        return { max: curMax, x, y, winSize };
      } else {
        return res;
      }
    },
    { max: -Infinity, x: 0, y: 0, window: 0 }
  );
  return res;
}

const [part1, part2] = timer(
  () => {
    const levels = powerGrid(7400, 300);
    const win = window(3);
    const powerSums = filterGrid(win, levels);
    return maxPower(powerSums);
  },
  () => maxPowerAnyWindow()
);

console.log("serial: 7400, 3x3 window. Res:", part1.res, part1.time);
console.log(
  "serial: 7400, [1..300]x[1..300] window. Res:",
  part2.res,
  part2.time
);
