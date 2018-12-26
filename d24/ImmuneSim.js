const { cloneArmy } = require("./Army");

class ImmuneSim {
  constructor(armies) {
    this.armies = Object.keys(armies).reduce(
      (res, army) => ({
        ...res,
        [army]: cloneArmy(armies[army])
      }),
      {}
    );

    const armyIds = Object.keys(this.armies);
    this.armies[armyIds[0]].setEnemy(this.armies[armyIds[1]]);
    this.armies[armyIds[1]].setEnemy(this.armies[armyIds[0]]);

    this.groups = Object.values(this.armies).reduce(
      (groups, army) => groups.concat(army.getGroups()),
      []
    );

    this.i = 0;
  }

  targetSelection() {
    this.i++;
    this.groups.sort((a, b) => {
      const powerDiff = b.getEffPower() - a.getEffPower();
      return powerDiff !== 0 ? powerDiff : b.initiative - a.initiative;
    });
    this.groups.forEach(group => {
      group.setTarget();
    });
  }

  fight() {
    this.groups.sort((a, b) => b.initiative - a.initiative);
    this.groups.forEach(group => {
      group.attack();
    });
  }

  boostImmune(ap) {
    this.armies["Immune System"].getGroups().forEach(g => g.setAp(g.ap + ap));
  }

  run() {
    while (Object.values(this.armies).every(a => a.isAlive())) {
      // this.print();
      this.targetSelection();
      this.fight();
    }
    this.print();
    console.log("Winning army remaining units", this.winner());
    return {
      winner: this.armies["Infection"].isAlive() ? "Infection" : "Immune",
      units: this.winner()
    };
  }

  winner() {
    const winner = this.armies["Infection"].isAlive()
      ? this.armies["Infection"]
      : this.armies["Immune System"];
    return winner.getGroups().reduce((sum, g) => sum + g.units, 0);
  }

  print() {
    const armyUnits = Object.keys(this.armies)
      .map(army => {
        const groupUnits = this.armies[army]
          .getGroups()
          .map(g => `Group ${g.id} contains ${g.units} units`)
          .join("\n");
        return `${army}:\n${groupUnits}`;
      })
      .join("\n");
    console.log(armyUnits);
  }
}

module.exports = ImmuneSim;
