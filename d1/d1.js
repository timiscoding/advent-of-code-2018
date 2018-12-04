const fs = require("fs");
const { Transform, pipeline } = require("stream");
const util = require("util");
const split2 = require("split2");
const { filename, logger } = require("../utils");
const pipelinePromise = util.promisify(pipeline);

/* bug in code: chunk ended with `-` which pushed a non integer so when the next
pipe tried to convert it to a number, it converted it to NaN. Using split2 as it
ensures chunks are broken by newline always.
*/
const numSplitter = () =>
  new Transform({
    readableObjectMode: true,
    transform(chunk, enc, done) {
      chunk
        .toString()
        .trim()
        .split("\n")
        .forEach(f => {
          this.push(tmp2);
        });
      done();
    }
  });

const summer = (initFreq = 0) => {
  let curFreq = initFreq;
  return new Transform({
    objectMode: true,
    transform(change, enc, done) {
      curFreq += parseInt(change);
      done(null, curFreq);
    }
  });
};

const firstDupFreq = (initFreq = 0, freqs) => {
  let foundDup = false;
  return new Transform({
    objectMode: true,
    transform(curFreq, enc, done) {
      if (foundDup) return done();

      if (freqs[curFreq]) {
        this.push({ curFreq, dupFreq: curFreq });
        this.push(null);
        foundDup = true;
      } else {
        this.push({ curFreq });
        freqs[curFreq] = true;
      }
      done();
    }
  });
};

function finalFreq() {
  console.time("Final freq took");

  fs.createReadStream(filename)
    .pipe(split2())
    .pipe(summer())
    .pipe(
      logger({
        label: `Final freq`,
        last: true,
        stream: false,
        loggerCb() {
          console.timeEnd("Final freq took");
        }
      })
    );
}

async function findDup() {
  console.time("Find dup took");

  let initFreq = 0;
  let dupFound = false;
  const freqSeen = {};
  let it = 1;

  while (!dupFound) {
    freqSeen[initFreq] = true;
    await pipelinePromise(
      fs.createReadStream(filename),
      split2(),
      summer(initFreq),
      // logger({ label: 'curFreq', stream: true }),
      firstDupFreq(initFreq, freqSeen),
      logger({
        label: it++,
        last: true,
        stream: false,
        loggerCb(data) {
          initFreq = data.curFreq;
          dupFound = Number.isInteger(data.dupFreq);
        }
      })
    );
  }
  console.timeEnd("Find dup took");
}

finalFreq();
findDup();
