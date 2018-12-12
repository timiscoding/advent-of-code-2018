const fs = require("fs");
const path = require("path");
const { Transform } = require("stream");

const dirname = path.dirname(process.argv[1]);

const getDataFiles = () => {
  const files = fs.readdirSync(dirname).filter(f => f.includes("data"));
  if (files.length === 0) return;

  const choice = process.argv.find(arg => Boolean(parseInt(arg))) || 0;
  let filename = files[choice];

  if (!process.argv.includes("-s")) {
    const fileStr = `
Data files:
${files.map((f, i) => `  ${i}: ${f} ${f === filename ? "✅" : ""}`).join("\n")}
`;
    console.log(fileStr);
  }

  return filename;
};

const dataFiles = getDataFiles();
module.exports.filename = dataFiles && path.join(dirname, dataFiles);

module.exports.logger = (
  { label, last = false, stream = true, loggerCb = () => {} },
  _chunk
) =>
  new Transform({
    objectMode: true,
    transform(chunk, enc, done) {
      if (stream) {
        console.log(label, chunk);
      } else {
        _chunk = chunk;
      }

      /* Care must be taken when using Transform streams in that data written
      to the stream can cause the Writable side of the stream to become paused
      if the output on the Readable side is not consumed.

      The important concept to remember is that a Readable will not generate data
      until a mechanism for either consuming or ignoring that data is provided.
      If the consuming mechanism is disabled or taken away, the Readable will
      attempt to stop generating the data.
      */
      !last && this.push(chunk);
      done();
    },
    // If there's no more data coming through a stream, each transformable calls a flush method
    flush(cb) {
      !stream && _chunk !== undefined && console.log(label, _chunk);
      loggerCb(_chunk);
      cb();
    }
  });

module.exports.timer = (...fns) =>
  fns.map(fn => {
    const start = process.hrtime();
    const res = fn();
    const [s, nanos] = process.hrtime(start);
    const millis = nanos / 1000000;
    return {
      time: `${s ? `${s}s ` : ""}${millis.toFixed(3)}ms`,
      res
    };
  });

const idMaker = (i = 0) => () => i++;
module.exports.genId = idMaker();

module.exports.puts = (...args) => console.log(...args.map(a => String(a)));
