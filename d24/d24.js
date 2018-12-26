const fs = require("fs");
const { filename } = require("../utils");
const { Army } = require("./Army");
const ImmuneSim = require("./ImmuneSim");

function parseData() {
  const armies = {};
  const data = fs
    .readFileSync(filename)
    .toString()
    .trim()
    .split("\n");

  let army;
  let line;
  while (data.length) {
    line = data.shift();
    if (!line) continue;
    if (line.startsWith("Immune System:")) {
      army = new Army({ id: "Immune System" });
      armies[army.id] = army;
    } else if (line.startsWith("Infection:")) {
      army = new Army({ id: "Infection" });
      armies[army.id] = army;
    } else {
      const [, units, hp, weakImmune, ap, at, initiative] = line
        .match(
          /(\d+) units each with (\d+) hit points( \(.+\))? with an attack that does (\d+) (\w+) damage at initiative (\d+)/
        )
        .map(v => (isNaN(Number(v)) ? v : Number(v)));

      let weak = [],
        immune = [];
      if (weakImmune) {
        weakImmune
          .trim()
          .replace(/^\(|\)$/g, "")
          .split(/;\s*/)
          .forEach(l => {
            const abilities = l
              .trim()
              .split(/(?:,|$)?\s+/)
              .splice(2);
            if (l.startsWith("weak")) {
              weak = abilities;
            }
            if (l.startsWith("immune")) {
              immune = abilities;
            }
          });
      }
      army.addGroup({
        units,
        hp,
        ap,
        at,
        initiative,
        weak,
        immune
      });
    }
  }

  if (Object.keys(armies).length === 2) {
    armies["Immune System"].setEnemy(armies["Infection"]);
    armies["Infection"].setEnemy(armies["Immune System"]);
  }
  return armies;
}

const armies = parseData();

// part 1
let sim = new ImmuneSim(armies);
sim.run();

/* part 2

this loops infinitely when the immune system ap is boosted by 30 and i thought
there was a bug but the reason is that the sim ends with immune group 6 fighting
infection group 5.

immune #6 does 22545 damage but infection #5 units have 46197 hp so it doesn't kill any units.
infection #5 attack type is fire but immune #6 is immune to it so it ends up in a deadlock. */

// let res = { winner: null };
// for (let extraAp = 1; res.winner !== "Immune"; extraAp++) {
//   sim = new ImmuneSim(armies);
//   sim.boostImmune(extraAp);
//   res = sim.run();
//   console.log("res", res, extraAp);
// }

sim = new ImmuneSim(armies);
sim.boostImmune(31);
sim.run();
