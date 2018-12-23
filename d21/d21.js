/* simulates the activation system assembly code
    vars a-f correspond to registers 0-5. 'b' and 'c' aren't needed as 'b' is the instruction pointer (not needed).
    'c' is skipped because its used only by 'd'

    getAllF: boolean. when true, returns the set of all unique register 5 values. else, return nothing.
    instrCount: the number of instructions executed when 'a's (register 0) value is given.
*/
function activationSpy({ getAllF = false, instrCount = false, a = 0 }) {
  let d = 0,
    e = 0,
    f = 123;

  while ((f & 456) !== 72) {}

  f = 0;
  const s = new Set();
  let i = 0; // instruction count
  do {
    e = f | 65536;
    f = 13284195;

    while (true) {
      d = e & 255;
      f = f + d;
      f = f & 16777215;
      f = f * 65899;
      f = f & 16777215;
      i++;
      if (e >= 256) {
        /* actual code does something like:
            for (d = 0; (c = 256 * (d + 1)) <= e; d++) {}
          but since we're only interested in the number of instructions being executed,
          we just calculate the end result
        */
        d = Math.floor(e / 256);
        i += d;
        e = d;
      } else {
        break;
      }
    }
    if (getAllF) {
      if (s.has(f)) {
        break;
      }
      s.add(f);
    }
    i++;
  } while (a !== f);

  const res = {};
  if (getAllF) res.allF = s;
  if (instrCount) res.instrCount = i;
  return res;
}
const { allF } = activationSpy({ getAllF: true });
console.log("There are %s unique Register 5 (or F) values", allF.size);

let maxInstr = -Infinity;
let minInstr = Infinity;
let bounds = {
  min: { instrCount: Infinity, regVal: Infinity },
  max: { instrCount: -Infinity, regVal: Infinity }
};
allF.forEach(f => {
  const { instrCount } = activationSpy({ instrCount: true, a: f });
  if (instrCount > bounds.max.instrCount) {
    bounds.max.instrCount = instrCount;
    bounds.max.regVal = f;
  } else if (instrCount === bounds.max.instrCount && f < bounds.max.regVal) {
    bounds.max.regVal = f;
  }

  if (instrCount < bounds.min.instrCount) {
    bounds.min.instrCount = instrCount;
    bounds.min.regVal = f;
  } else if (instrCount === bounds.min.instrCount && f < bounds.min.regVal) {
    bounds.min.regVal = f;
  }
});

/* the minimum executions value can also be found by running the assembly through
the day 19 solution and finding the F value after the first iteration of the outer loop */
console.table({
  "Minimum executing instructions": bounds.min,
  "Maximum executing instructions": bounds.max
});
