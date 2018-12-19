const testData = require("./testData");
const { Game } = require("./Game");
const { Goblin, Elf } = require("./Player");

jest.mock("./common");

describe("Movement", () => {
  describe("When elf is equidistant to goblin", () => {
    it("it moves to first goblin in read order", () => {
      const g = new Game(testData.equidistantGoblins);
      g.players.goblins.push(new Goblin([1, 1], g.players, g.paths));
      const { nextPos, enemyPos } = g.players.elves[0].nextMove();
      expect(nextPos).toEqual([3, 1]);
      expect(enemyPos).toEqual([1, 1]);
    });

    it("same but with roles switched", () => {
      const g = new Game(testData.equidistantElves);
      g.players.elves.push(new Elf([1, 1], g.players, g.paths));
      const { nextPos, enemyPos } = g.players.goblins[0].nextMove();
      expect(nextPos).toEqual([3, 1]);
      expect(enemyPos).toEqual([1, 1]);
    });
  });

  describe("When elf has multiple equidistant paths to a goblin", () => {
    it("it moves to the square in read order", () => {
      const g = new Game(testData.equidistantMove);
      const { nextPos } = g.players.elves[0].nextMove();
      expect(nextPos).toEqual([3, 1]);
    });

    it("as above #2", () => {
      const g = new Game(testData.equidistantMove2);
      const { nextPos } = g.players.elves[0].nextMove();
      expect(nextPos).toEqual([3, 1]);
    });
  });

  it("When elf is right next to goblin, it doesn't move", () => {
    const g = new Game(testData.noMove);
    const { length } = g.players.elves[0].nextMove();
    expect(length).toBe(0);
  });

  describe("Multiple rounds", () => {
    it("When a player moves, its position updates", () => {
      const g = new Game(testData.playerMoves);
      let i = 3;
      let output = "\n";
      while (i--) {
        g.playRound();
        output += g.print({ silent: true }) + "\n";
      }
      expect(output).toMatchSnapshot();
    });

    it("as above #2", () => {
      const g = new Game(testData.playerMoves2);
      let i = 3;
      let output = "\n";
      while (i--) {
        g.playRound();
        output += g.print({ silent: true }) + "\n";
      }
      expect(output).toMatchSnapshot();
    });
  });
});

describe("Attack", () => {
  it("When player is adj to friends & enemies, it attacks enemy only", () => {
    const g = new Game(testData.attackEnemyOnly);
    const enemy = g.players.goblins[2].findAdjEnemy();
    expect(enemy).toBeInstanceOf(Elf);
  });

  it("When player is adj to friends, it doesn't attack", () => {
    const g = new Game(testData.attackNoone);
    const enemy = g.players.goblins[2].findAdjEnemy();
    expect(enemy).toBeNull();
  });

  it("When player is adj to noone, it doesn't attack", () => {
    const g = new Game(testData.attackNoone2);
    const enemy = g.players.goblins[0].findAdjEnemy();
    expect(enemy).toBeNull();
  });

  it("When player is adj to enemies, it attacks the weakest", () => {
    const g = new Game(testData.attackWeakest);
    g.players.elves[0].hp = 4;
    g.players.elves[1].hp = 3;
    g.players.elves[2].hp = 2;
    g.players.elves[3].hp = 4;
    const enemy = g.players.goblins[0].findAdjEnemy();
    expect(enemy).toBe(g.players.elves[2]);
  });

  it("When player is adj to enemies with same hp, it attacks the first in read order", () => {
    let g = new Game(testData.attackSameHP);
    let enemy = g.players.goblins[0].findAdjEnemy();
    expect(enemy).toBe(g.players.elves[0]);

    g = new Game(testData.attackSameHP2);
    enemy = g.players.goblins[0].findAdjEnemy();
    expect(enemy).toBe(g.players.elves[0]);

    g = new Game(testData.attackSameHP3);
    enemy = g.players.goblins[0].findAdjEnemy();
    expect(enemy).toBe(g.players.elves[0]);
  });

  it("When player attacks enemy, that enemy's hp reduces", () => {
    g = new Game(testData.attack);
    const elf = g.players.elves[0];
    const goblin = g.players.goblins[0];
    expect(elf.hp).toBe(200);
    expect(goblin.hp).toBe(200);
    g.playRound();
    expect(elf.hp).toBe(197);
    expect(goblin.hp).toBe(197);
  });

  describe("When player gets attacked", () => {
    it("and has 0 hp, that enemy should be removed from game", () => {
      g = new Game(testData.attack);
      const elf = g.players.elves[0];
      const goblin = g.players.goblins[0];
      elf.hp = 3;
      expect(elf.hp).toBe(3);
      expect(goblin.hp).toBe(200);
      g.playRound();
      expect(elf.hp).toBe(0);
      expect(goblin.hp).toBe(200);
      expect(g.players.elves).not.toContain(elf);
      expect(g.players.pos.has(g.paths.getVertex([elf.pos]))).toBe(false);
    });

    it("and has < 0 hp, it should be removed from game", () => {
      g = new Game(testData.attack);
      const elf = g.players.elves[0];
      const goblin = g.players.goblins[0];
      elf.hp = 1;
      expect(elf.hp).toBe(1);
      expect(goblin.hp).toBe(200);
      g.playRound();
      expect(elf.hp).toBe(-2);
      expect(goblin.hp).toBe(200);
      expect(g.players.elves).not.toContain(elf);
      expect(g.players.pos.has(g.paths.getVertex([elf.pos]))).toBe(false);
    });
  });

  describe("Outcomes", () => {
    it("Sample 1", () => {
      g = new Game(testData.testOutcome);
      const res = g.play();
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 27730, hpSum: 590, fullRounds: 47 });
    });

    it("Sample 2", () => {
      g = new Game(testData.testOutcome2);
      const res = g.play();
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 36334, hpSum: 982, fullRounds: 37 });
    });

    it("Sample 3", () => {
      g = new Game(testData.testOutcome3);
      const res = g.play();
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 39514, hpSum: 859, fullRounds: 46 });
    });

    it("Sample 4", () => {
      g = new Game(testData.testOutcome4);
      const res = g.play();
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 27755, hpSum: 793, fullRounds: 35 });
    });

    it("Sample 5", () => {
      g = new Game(testData.testOutcome5);
      const res = g.play();
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 28944, hpSum: 536, fullRounds: 54 });
    });

    it("Sample 6", () => {
      g = new Game(testData.testOutcome6);
      const res = g.play();
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 18740, hpSum: 937, fullRounds: 20 });
    });
  });

  describe("Help the elves win!", () => {
    it("Sample 1", () => {
      const data = testData.testHelpElvesWin;
      let res = { outcome: -1 };
      let g;
      let elfAp = 3;
      while (res.outcome === -1) {
        elfAp++;
        g = new Game(data);
        res = g.playBiased(elfAp);
      }
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 4988, hpSum: 172, fullRounds: 29 });
      expect(elfAp).toBe(15);
    });

    it("Sample 2", () => {
      const data = testData.testHelpElvesWin2;
      let res = { outcome: -1 };
      let g;
      let elfAp = 3;
      while (res.outcome === -1) {
        elfAp++;
        g = new Game(data);
        res = g.playBiased(elfAp);
      }
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 31284, hpSum: 948, fullRounds: 33 });
      expect(elfAp).toBe(4);
    });

    it("Sample 3", () => {
      const data = testData.testHelpElvesWin3;
      let res = { outcome: -1 };
      let g;
      let elfAp = 3;
      while (res.outcome === -1) {
        elfAp++;
        g = new Game(data);
        res = g.playBiased(elfAp);
      }
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 3478, hpSum: 94, fullRounds: 37 });
      expect(elfAp).toBe(15);
    });

    it("Sample 4", () => {
      const data = testData.testHelpElvesWin4;
      let res = { outcome: -1 };
      let g;
      let elfAp = 4;
      while (res.outcome === -1) {
        elfAp++;
        g = new Game(data);
        res = g.playBiased(elfAp);
      }
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 6474, hpSum: 166, fullRounds: 39 });
      expect(elfAp).toBe(12);
    });

    it("Sample 5", () => {
      const data = testData.testHelpElvesWin5;
      let res = { outcome: -1 };
      let g;
      let elfAp = 4;
      while (res.outcome === -1) {
        elfAp++;
        g = new Game(data);
        res = g.playBiased(elfAp);
      }
      expect(g.print()).toMatchSnapshot();
      expect(res).toEqual({ outcome: 1140, hpSum: 38, fullRounds: 30 });
      expect(elfAp).toBe(34);
    });
  });
});
