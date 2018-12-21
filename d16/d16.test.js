const CPU = require("./CPU");
const { matchesInstr, getIntersect, getDifference } = require("./solvers");

describe("Instructions", () => {
  let cpu;
  beforeEach(() => {
    cpu = new CPU();
    cpu.setRegister(1, 2, 3, 4);
  });

  it("addr rc = ra + rb", () => {
    cpu.addr(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 5, 4]);
  });

  /* register c = register a + immediate value b */
  it("addi rc = ra + vb", () => {
    cpu.addi(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 4, 4]);
  });

  it("mulr rc = ra * rb", () => {
    cpu.mulr(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 6, 4]);
  });

  it("muli rc = ra * vb", () => {
    cpu.muli(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 4, 4]);
  });

  it("banr rc = ra AND rb", () => {
    cpu.banr(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 2, 4]);
  });

  it("bani rc = ra AND vb", () => {
    cpu.bani(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 2, 4]);
  });

  it("borr rc = ra OR rb", () => {
    cpu.borr(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 3, 4]);
  });

  it("bori rc = ra OR vb", () => {
    cpu.bori(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 2, 4]);
  });

  it("setr rc = ra", () => {
    cpu.setr(0, 0, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 1, 4]);
  });

  it("seti rc = va", () => {
    cpu.seti(12, 0, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 12, 4]);
  });

  it("gtir rc = va > rb ? 1 : 0", () => {
    cpu.gtir(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 0, 4]);
    cpu.gtir(3, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 1, 4]);
  });

  it("gtri rc = ra > vb ? 1 : 0", () => {
    cpu.gtri(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 0, 4]);
    cpu.gtri(3, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 1, 4]);
  });

  it("gtrr rc = ra > rb ? 1 : 0", () => {
    cpu.gtrr(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 0, 4]);
    cpu.gtrr(3, 1, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 1, 4]);
  });

  it("eqir rc = va === rb ? 1 : 0", () => {
    cpu.eqir(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 0, 4]);
    cpu.eqir(1, 0, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 1, 4]);
  });

  it("eqri rc = ra === vb ? 1 : 0", () => {
    cpu.eqri(1, 3, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 0, 4]);
    cpu.eqri(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 1, 4]);
  });

  it("eqrr rc = ra === rb ? 1 : 0", () => {
    cpu.eqrr(1, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 0, 4]);
    cpu.eqrr(2, 2, 2);
    expect(cpu.getRegister()).toEqual([1, 2, 1, 4]);
  });
});

describe("Solvers", () => {
  it("finds the number of instructions that match a sample", () => {
    const sample = {
      init: [3, 2, 1, 1],
      res: [3, 2, 2, 1],
      instrArgs: { op: 9, a: 2, b: 1, c: 2 }
    };
    const res = matchesInstr(sample);
    expect(res.size).toBe(3);
  });

  it("finds the intersection of sets", () => {
    const a = new Set(["a", "b", "c"]);
    const b = new Set(["b", "c", "d"]);
    const c = new Set(["b", "c", "d", "e"]);
    const res = getIntersect(a, b, c);
    expect([...res]).toEqual(["b", "c"]);
  });

  it("finds the difference of sets", () => {
    const barr = [];
    barr[9] = "c";
    barr[11] = "d";
    barr[1] = "e";
    const a = new Set(["a", "b", "c"]);
    const b = new Set(barr);
    const c = new Set(["b", "z"]);
    const res = getDifference(a, b, c);
    expect([...res]).toEqual(["a"]);
  });
});
