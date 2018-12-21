const Land = require("./Land");
const data = require("./data");

function afterMin(min) {
  const land = new Land(data.puzzleData);
  let counts;
  for (let i = 0; i < min; i++) {
    counts = land.nextMinute();
  }
  // land.print();
  const { trees, lumber } = counts;
  return { trees, lumber };
}

const part1 = afterMin(10);
console.log("Part 1 - After 10 min, total resource value is:", part1);

/* Puzzle says '...for at least thousands of years' so lets see if there's a pattern every 1000 years

min     tree  lumber  resource value
1000    510   316     161160
2000    576   331     190656
3000    598   311     185978
4000    520   306     159120
5000    533   336     179088
6000    591   325     192075
7000    551   300     165300

8000    510   316     161160
9000    576   331     190656
10000   598   311     185978
11000   520   306     159120
12000   533   336     179088
13000   591   325     192075
14000   551   300     165300

15000   510   316     161160
16000   576   331     190656
17000   598   311     185978
18000   520   306     159120
19000   533   336     179088
20000   591   325     192075

ie. (min % 7000) / 1000 gives a value corr. to the first 7 resource values
*/
// const resValPattern = every1000Min(20);
function every1000Min(times) {
  const data = {};
  for (let i = 0; i < times; i++) {
    const min = 1000 + i * 1000;
    const { trees, lumber } = afterMin(min);
    data[min] = trees * lumber;
  }
  return data;
}

/* returns the resource value only for 1000 min multiples */
function resVal(thousandMinMultiple) {
  const pattern = [165300, 161160, 190656, 185978, 159120, 179088, 192075];
  return pattern[(thousandMinMultiple % 7000) / 1000];
}

const oneBillion = 1000000000;
console.log(
  "Part 2 - After a billion minutes, total resource value is:",
  resVal(oneBillion)
);
