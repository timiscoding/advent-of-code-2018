const Parser = require("./Parser");

describe("Parser", () => {
  it("Simple regex", () => {
    const p = new Parser("^NSWE$");
    expect(() => p.parse()).not.toThrow();
  });

  it("Branch", () => {
    const p = new Parser("^ENWWW(NEEE|SSE(EE|N))$");
    expect(() => p.parse()).not.toThrow();
  });

  it("Empty options branch", () => {
    const p = new Parser("^ENNWSWW(NEWS|)SSSEEN(WNSE|)EE(SWEN|)NNN$");
    expect(() => p.parse()).not.toThrow();
  });

  it("Nested Path Branch Path", () => {
    const p = new Parser(
      "^N(E|N(N|W(S|)E(W|N(S|)E(N(S(E|S)|W(N(N|)S|E))|E))))$"
    );
    expect(() => p.parse()).not.toThrow();
  });

  it("Sibling branching", () => {
    const p = new Parser("^N(E|W)(N|S)$");
    expect(() => p.parse()).not.toThrow();
  });

  it("Multiple branch", () => {
    const p = new Parser("^ESE(N|SS|E)$");
    expect(() => p.parse()).not.toThrow();
  });
});
