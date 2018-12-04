const fs = require("fs");
const { Transform } = require("stream");
const split2 = require("split2");
const { filename, logger } = require("../utils");

const unicodeA = "a".charCodeAt();

const countLettersInId = new Transform({
  objectMode: true,
  transform(chunk, enc, cb) {
    const letterCount = chunk
      .split("")
      .map(letter => letter.charCodeAt() - unicodeA)
      .reduce(
        (letters, l) => ((letters[l] = (letters[l] || 0) + 1), letters),
        []
      );

    cb(null, letterCount);
  }
});

const find2or3 = (_counts = []) =>
  new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      if (chunk.includes(2)) _counts[0] = (_counts[0] || 0) + 1;
      if (chunk.includes(3)) _counts[1] = (_counts[1] || 0) + 1;
      cb(null, _counts);
    }
  });

const checkSum = (_counts = []) =>
  new Transform({
    objectMode: true,
    transform(chunk, _, cb) {
      _counts = chunk;
      cb();
    },
    flush(cb) {
      this.push(_counts[0] * _counts[1]);
      cb();
    }
  });

function getChecksum() {
  console.time("Checksum took");
  fs.createReadStream(filename)
    .pipe(split2())
    .pipe(countLettersInId)
    // .pipe(logger({ label: "letters" }))
    .pipe(find2or3())
    // .pipe(logger({ label: "[2 count, 3 count]" }))
    .pipe(checkSum())
    .pipe(
      logger({
        label: "Checksum",
        loggerCb() {
          console.timeEnd("Checksum took");
        }
      })
    );
}

function strCmp(str1, str2) {
  let diff = 0;
  let diffIndex = -1;
  const isOffByOne = str1.split("").every((l, i) => {
    if (l === str2.charAt(i)) {
      return true;
    } else {
      diffIndex = i;
      diff++;
    }
    return diff <= 1;
  });

  return { offByOne: isOffByOne, diffIndex };
}

function offByOneletter() {
  console.time("Off by 1 letter took");
  const data = fs.readFileSync(filename, { encoding: "utf8" });
  const ids = data.trim().split("\n");

  out: for (let i = 0; i < ids.length - 1; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const id1 = ids[i];
      const id2 = ids[j];
      let res = strCmp(id1, id2);
      if (res.offByOne) {
        console.log(
          "Off by one letter at index %d: %s and %s",
          res.diffIndex,
          id1,
          id2
        );
        const commonLetters =
          id1.slice(0, res.diffIndex) + id1.slice(res.diffIndex + 1);
        console.log("Common letters are:", commonLetters);
        break out;
      }
    }
  }
  console.timeEnd("Off by 1 letter took");
}

getChecksum();
offByOneletter();
