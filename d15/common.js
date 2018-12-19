const chalk = require("chalk");
/* compares 2 positions [x,y] and returns
      < 0 if 'a' comes before 'b' in read order (top to bottom, left to right)
      0 if 'a' is equal to 'b'
      > 0 if 'a' comes after 'b' in read order
*/
function posCompare(a, b) {
  const yDiff = a[1] - b[1];
  if (yDiff !== 0) return yDiff;
  return a[0] - b[0];
}

const __DEBUG = true; // enable to print game board and info

let chalkInstance;
const getChalkInstance = (enabled = true) => {
  if (chalkInstance) return chalkInstance;
  chalkInstance = new chalk.constructor({ enabled });
  return chalkInstance;
};

module.exports = { posCompare, __DEBUG, getChalkInstance };
