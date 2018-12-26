function cloneGroup(group) {
  const { id, army, units, hp, ap, at, initiative, weak, immune } = group;
  return new Group({
    id,
    army,
    units,
    hp,
    ap,
    at,
    initiative,
    weak: weak.slice(),
    immune: immune.slice()
  });
}

class Group {
  constructor({
    id,
    army,
    units,
    hp,
    ap,
    at,
    initiative,
    weak = [],
    immune = []
  }) {
    this.id = id;
    this.army = army;
    this.units = units;
    this.hp = hp;
    this.ap = ap;
    this.at = at;
    this.initiative = initiative;
    this.weak = weak;
    this.immune = immune;
    this.target = null;
    this.attackable = true;
  }

  getEffPower() {
    return this.units * this.ap;
  }

  setTarget() {
    if (this.isDead()) return;

    const defenders = this.army.enemy.getGroups();

    const { defender } = defenders.reduce(
      (res, defender) => {
        if (defender.isDead() || !defender.isAttackable()) return res;

        let damage = this.getEffPower();
        if (defender.immune.includes(this.at)) {
          damage = 0;
        } else if (defender.weak.includes(this.at)) {
          damage = 2 * damage;
        }

        if (damage === 0) return res;
        if (damage > res.damage) {
          return { defender, damage };
        } else if (damage === res.damage) {
          if (res.defender.getEffPower() < defender.getEffPower()) {
            return { defender, damage };
          } else if (
            res.defender.getEffPower() === defender.getEffPower() &&
            res.defender.initiative < defender.initiative
          ) {
            return { defender, damage };
          }
        }

        return res;
      },
      { defender: null, damage: 0 }
    );

    if (defender) {
      defender.setAttackable(false);
    }

    this.target = defender;
  }

  attack() {
    if (this.isDead() || !this.target) return;
    if (this.target.immune.includes(this.at))
      throw new Error(
        "Target immune to attack. This attack should not have happened"
      );
    let mult = this.target.weak.includes(this.at) ? 2 : 1;
    this.target.damage(this.getEffPower() * mult);
    const attacked = `${this.target.army.id} ${this.target.id}`;
    this.target = null;
    return attacked;
  }

  setAttackable(attackable) {
    this.attackable = attackable;
  }

  damage(hp) {
    const killed = Math.min(this.units, Math.floor(hp / this.hp));
    this.units -= killed;
    if (this.isDead() && this.target) {
      this.target.setAttackable(true);
      this.target = null;
    }
    this.setAttackable(true);
    return killed;
  }

  isDead() {
    return this.units <= 0;
  }

  isAttackable() {
    return this.attackable;
  }

  toString() {
    return `  { Group id: ${this.id}, army: ${this.army.id}, enemy: ${
      this.army.enemy.id
    }, units: ${this.units}, hp: ${this.hp}, weak: [${this.weak.join(
      ","
    )}], immune: [${this.immune.join(",")}], ap: ${this.ap}, at: ${
      this.at
    }, initiative: ${this.initiative}, effPower: ${this.getEffPower()}}`;
  }

  setAp(ap) {
    this.ap = ap;
  }
}

module.exports = {
  Group
};
