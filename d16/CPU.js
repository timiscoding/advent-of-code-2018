class CPU {
  constructor(opCodeMap) {
    this.r = [0, 0, 0, 0]; //register
    this.opCodeMap = opCodeMap;
  }

  setRegister(a, b, c, d) {
    this.r = [a, b, c, d];
  }

  execute(op, a, b, c) {
    this[this.opCodeMap[op]](a, b, c);
    return this;
  }

  getRegister() {
    return this.r;
  }

  getInstr() {
    return [
      this.addr,
      this.addi,
      this.bani,
      this.banr,
      this.bori,
      this.borr,
      this.mulr,
      this.muli,
      this.setr,
      this.seti,
      this.gtir,
      this.gtri,
      this.gtrr,
      this.eqir,
      this.eqri,
      this.eqrr
    ];
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
