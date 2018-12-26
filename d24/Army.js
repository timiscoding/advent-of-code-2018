const { Group } = require("./Group");
const { idMaker } = require("../utils");

function cloneArmy(army) {
  const newArmy = new Army({
    id: army.id
  });
  army
    .getGroups()
    .forEach(({ units, hp, ap, at, initiative, weak, immune }) => {
      newArmy.addGroup({
        units,
        hp,
        ap,
        at,
        initiative,
        weak: weak.slice(),
        immune: immune.slice()
      });
    });
  return newArmy;
}

class Army {
  constructor({ id, groups = [] }) {
    this.id = id;
    this.groups = groups;
    this.getNewId = idMaker(1);
    this.enemy = null;
  }

  isAlive() {
    return this.groups.some(g => !g.isDead());
  }

  getGroups() {
    return this.groups;
  }

  addGroup({ units, hp, ap, at, initiative, weak, immune }) {
    if (
      typeof units !== "number" ||
      typeof hp !== "number" ||
      typeof ap !== "number" ||
      typeof initiative !== "number"
    ) {
      throw new Error("Units/hp/ap/at/initiative need to be a number");
    }

    this.groups.push(
      new Group({
        id: this.getNewId(),
        army: this,
        units,
        hp,
        ap,
        at,
        initiative,
        weak,
        immune
      })
    );
  }

  setEnemy(army) {
    if (!(army instanceof Army)) {
      throw new Error("Arg must be Army instance when setting an enemy");
    }
    this.enemy = army;
  }

  toString() {
    return `Army id: ${this.id}, groups: [\n${this.groups
      .map(g => g.toString())
      .join("\n")}]`;
  }
}

module.exports = {
  cloneArmy,
  Army
};
