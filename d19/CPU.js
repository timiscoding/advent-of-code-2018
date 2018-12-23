class CPU {
  constructor() {
    this.r = [0, 0, 0, 0, 0, 0]; //register
    this.ip = null; // instruction pointer stores the register index it is bound to
  }

  setRegister(a, b, c, d, e, f) {
    this.r = [a, b, c, d, e, f];
  }

  executeInstr(op, a, b, c) {
    this[op](a, b, c);
    return this;
  }

  executeProgram() {
    if (!this.program) {
      throw new Error("Program has not been loaded yet");
    }

    let instr;
    while ((instr = this.program[this.r[this.ip]])) {
      this.executeInstr(...instr);
      this.r[this.ip]++;
    }
  }

  getRegister() {
    return this.r;
  }

  load(program) {
    const lines = program.trim().split("\n");
    this.ip = Number(lines.shift().split(" ")[1]);
    this.program = lines.map(l => {
      const [op, a, b, c] = l.split(" ");
      return [op, Number(a), Number(b), Number(c)];
    });
  }

  addr(a, b, c) {
    this.r[c] = this.r[a] + this.r[b];
  }

  addi(a, b, c) {
    this.r[c] = this.r[a] + b;
  }

  mulr(a, b, c) {
    this.r[c] = this.r[a] * this.r[b];
  }

  muli(a, b, c) {
    this.r[c] = this.r[a] * b;
  }

  banr(a, b, c) {
    this.r[c] = this.r[a] & this.r[b];
  }

  bani(a, b, c) {
    this.r[c] = this.r[a] & b;
  }

  borr(a, b, c) {
    this.r[c] = this.r[a] | this.r[b];
  }

  bori(a, b, c) {
    this.r[c] = this.r[a] | b;
  }

  setr(a, _, c) {
    this.r[c] = this.r[a];
  }

  seti(a, _, c) {
    this.r[c] = a;
  }

  gtir(a, b, c) {
    this.r[c] = a > this.r[b] ? 1 : 0;
  }

  gtri(a, b, c) {
    this.r[c] = this.r[a] > b ? 1 : 0;
  }

  gtrr(a, b, c) {
    this.r[c] = this.r[a] > this.r[b] ? 1 : 0;
  }

  eqir(a, b, c) {
    this.r[c] = a === this.r[b] ? 1 : 0;
  }

  eqri(a, b, c) {
    this.r[c] = this.r[a] === b ? 1 : 0;
  }

  eqrr(a, b, c) {
    this.r[c] = this.r[a] === this.r[b] ? 1 : 0;
  }
}

module.exports = CPU;
