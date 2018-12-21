const CPU = require("./CPU");

/* given a sample, returns a set of instructions that are valid
  returns: Set of instruction names eg. 'addr', 'muli'
*/
function matchesInstr({ init, res, instrArgs }) {
  const cpu = new CPU();
  const { a, b, c } = instrArgs;
  return cpu.getInstr().reduce((matches, instr) => {
    cpu.setRegister(...init);
    instr.call(cpu, a, b, c);
    if (cpu.getRegister().toString() === res.toString()) {
      matches.add(instr.name);
    }
    return matches;
  }, new Set());
}

/* given a list of samples, returns an array of samples grouped by opcode
  returns: [[sample1, sample2 ...], [sample1, sample2 ...]] where each index
  is an opcode 0..15
*/
function groupByOp(samples) {
  return samples.reduce((res, s) => {
    res[s.instrArgs.op] = (res[s.instrArgs.op] || []).concat(s);
    return res;
  }, []);
}

/* given a number of Sets, returns a set with the overlapping elements */
function getIntersect(...sets) {
  return sets.reduce((res, set) => {
    return new Set([...res].filter(item => set.has(item)));
  });
}

/* given a number of Sets, returns a set with elements that are in A but
not in B and does so with each successive set */
function getDifference(...sets) {
  return sets.reduce(
    (res, set) => new Set([...res].filter(item => !set.has(item)))
  );
}

/* given samples, returns an array mapping opCode number to instruction name.
Instruction name maps directly to CPU class functions */
function getOpCodeMap(samples) {
  const opCodes = []; // maps opcode to instruction name
  let unsureOpCodes = []; // maps opcode to a set of possible instruction names

  groupByOp(samples).forEach((opSamples, opCode) => {
    const validInstr = opSamples.map(sample => matchesInstr(sample));
    const instrInCommon = getIntersect(...validInstr);
    if (instrInCommon.size === 1) {
      opCodes[opCode] = [...instrInCommon][0];
    } else {
      unsureOpCodes[opCode] = instrInCommon;
    }
  });

  while (opCodes.filter(Boolean).length !== 16) {
    unsureOpCodes.forEach((unsure, opCode) => {
      const filterSures = getDifference(unsure, new Set(opCodes));
      if (filterSures.size === 1) {
        opCodes[opCode] = [...filterSures][0];
      } else {
        unsureOpCodes[opCode] = filterSures;
      }
    });
  }
  return opCodes;
}

function executeProgram(instructions, opCodeMap) {
  return instructions
    .reduce((cpu, args) => cpu.execute(...args), new CPU(opCodeMap))
    .getRegister();
}

module.exports = {
  matchesInstr,
  groupByOp,
  getIntersect,
  getDifference,
  getOpCodeMap,
  executeProgram
};
