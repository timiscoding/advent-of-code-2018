const fs = require("fs");
const { filename } = require("../utils");
const LogParser = require("./LogParser");

function parseData() {
  const data = fs.readFileSync(filename, { encoding: "utf8" });
  const re = /\[(\d+-\d+-\d+ \d+:\d+)\] (.+)/;
  const tsRe = /(\d+)-(\d+)-(\d+) (\d+):(\d+)/;
  const logs = data
    .trim()
    .split("\n")
    .map(log => {
      const [_, ts, text] = log.match(re);
      const [, y, m, d, h, min] = ts.match(tsRe);
      return {
        ts: new Date(Date.UTC(y, m - 1, d, h, min)), // month is 0 indexed
        text
      };
    })
    .sort((a, b) => (a.ts < b.ts ? -1 : 1));
  return logs;
}

function toMinutes(ms) {
  return ms / 60000;
}

function getMaxSleeper() {
  let maxSleepSum = 0;
  let maxSleeper;
  for (let [id, sleeps] of Object.entries(guards)) {
    const sleepSum = sleeps.reduce(
      (sleepSum, interval) => sleepSum + toMinutes(interval[1] - interval[0]),
      0
    );
    if (sleepSum > maxSleepSum) {
      maxSleeper = { id, sleepSum };
      maxSleepSum = sleepSum;
    }
    console.log("id: %s sleep sum: %s", id, sleepSum);
  }
  console.log("maxSleeper", maxSleeper);
  return maxSleeper;
}

function sleepOverlap(sleeps) {
  const minutes = Array(60).fill(0);
  sleeps.forEach(s => {
    const sleepStart = s[0].getUTCMinutes();
    const sleepEnd = s[1].getUTCMinutes();

    for (let i = sleepStart; i < sleepEnd; i++) {
      minutes[i] = (minutes[i] || 0) + 1;
    }
  });
  return minutes;
}

function getMaxMinute(id) {
  const overlap = sleepOverlap(guards[id]);
  const maxOverlap = Math.max(...overlap);
  return {
    freq: maxOverlap,
    minute: overlap.findIndex(v => v === maxOverlap)
  };
}

function maxSleepOverlap() {
  let maxOverlap = 0;
  let maxId;
  let maxMinute;

  for (let [id, sleeps] of Object.entries(guards)) {
    const { freq: overlap, minute } = getMaxMinute(id);
    if (overlap > maxOverlap) {
      maxMinute = minute;
      maxOverlap = overlap;
      maxId = id;
    }
  }
  console.log(
    "Most frequently slept %s times on the same minute %s",
    maxOverlap,
    maxMinute
  );
  return { maxId, maxMinute, maxOverlap };
}

const logs = parseData();
const { guards } = new LogParser(logs);
console.log(guards);

const maxSleeper = getMaxSleeper();
const { minute, freq } = getMaxMinute(maxSleeper.id);
console.log("Slept the most (%s times) at min: %s", freq, minute);
console.log("Strategy 1:", maxSleeper.id * minute);

const { maxId: maxMinuteSleeper, maxOverlap, maxMinute } = maxSleepOverlap();
console.log(
  "Guard #%s slept most frequently (%s times) on minute %s",
  maxMinuteSleeper,
  maxOverlap,
  maxMinute
);
console.log("Strategy 2:", maxMinuteSleeper * maxMinute);
