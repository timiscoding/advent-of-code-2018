const { terminalColours, colourStr } = require("../utils");
const { cartDirs } = require("./Cart");
const {
  HorPath,
  VerPath,
  IntPath,
  FCurvePath,
  BCurvePath
} = require("./Graph");

CartSimModes = {
  animate: "animate",
  interactive: "interactive",
  output: "output"
};

class CartSim {
  constructor(graph, carts, config = {}) {
    this.graph = graph;
    this.carts = carts;
    this.carts.forEach(c => c.setGraph(this.graph));
    this.tickCount = 0;
    this.crashes = [];

    const colours = Object.values(terminalColours);
    this.cartColours = this.carts.reduce(
      (res, c) => ({
        ...res,
        [c.id]: colours[c.id % this.carts.length]
      }),
      {}
    );

    this.setConfig(config);
  }

  _setupInteractive() {
    // without this, we would only get streams once enter is pressed
    process.stdin.setRawMode(true);

    // resume stdin in the parent process (node app won't quit all by itself
    // unless an error or process.exit() happens)
    process.stdin.resume();

    // i don't want binary, do you?
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", key => {
      // ctrl-c ( end of text )
      if (key === "\u0003") {
        process.exit();
      }
      //   // write the key to stdout all normal like
      this.interactiveCb && this.interactiveCb(key);
    });
  }

  _cleanupInteractive() {
    process.stdin.pause();
  }

  setConfig({ ticks, delay, interactive } = { interactive: true }) {
    if (interactive) {
      this.config = { mode: CartSimModes.interactive };
    } else if (ticks && delay) {
      this.config = { mode: CartSimModes.animate, ticks, delay };
    } else {
      this.config = { mode: CartSimModes.output, ticks };
    }
  }

  async play() {
    const { mode } = this.config;
    if (mode === CartSimModes.animate) {
      this.print();
      let ticks = this.config.ticks;
      while (ticks--) {
        await this.tick();
      }
    }

    if (mode === CartSimModes.interactive) {
      this.print();
      while (true) {
        await this.tick();
      }
    }

    if (mode === CartSimModes.output) {
      let ticks = this.config.ticks;
      while (ticks--) {
        await this.tick();
      }
      this.print();
    }
  }

  async playFirstCrash() {
    const { mode } = this.config;
    if (mode === CartSimModes.animate || mode === CartSimModes.interactive) {
      this.print();
    }

    while (this.crashes.length === 0) {
      if (this.tickCount === 153) {
        debugger;
      }
      await this.tick();
    }
    if (mode === CartSimModes.interactive) {
      this._cleanupInteractive();
    }
    if (mode === CartSimModes.output) {
      this.print();
    }
    console.log("Crashed cart", this.crashes[0].path.loc);
  }

  async playLastCartStanding() {
    const { mode } = this.config;

    if (mode === CartSimModes.interactive || mode === CartSimModes.animate) {
      this.print();
    }

    while (this.carts.length !== 1) {
      await this.tick();
      if (this.crashes.length) {
        this.carts = this.carts.filter(cart => {
          return !this.crashes.includes(cart);
        });
      }
    }
    if (mode === CartSimModes.output) {
      this.print();
    }
    console.log("Last standing cart", this.carts[0].path.loc);
  }

  _tick() {
    const { mode } = this.config;
    for (let cart of this.carts) {
      cart.move();
      const res = this.checkCrash();
      if (res.crashed) {
        this.crashes = res.carts;
      }
    }
    this.updateCartsOrder();
    if (mode === CartSimModes.animate || mode === CartSimModes.interactive) {
      this.print();
    }
  }

  tick() {
    const { mode, delay } = this.config;
    if (mode === CartSimModes.interactive && !this.interactiveCb) {
      this._setupInteractive();
    }
    this.tickCount++;
    if (mode === CartSimModes.animate) {
      return new Promise(resolve => {
        setTimeout(() => resolve(this._tick()), delay);
      });
    } else if (mode === CartSimModes.interactive) {
      console.log("Press any key for next tick. Ctrl-C to quit.");
      return new Promise(resolve => {
        this.interactiveCb = key => {
          resolve(this._tick());
        };
      });
    } else {
      return Promise.resolve(this._tick());
    }
  }

  checkCrash() {
    const carts = [];
    for (let i = 0; i < this.carts.length - 1; i++) {
      for (let j = i + 1; j < this.carts.length; j++) {
        const cart1 = this.carts[i];
        const cart2 = this.carts[j];
        if (cart1.path === cart2.path) {
          if (!carts.includes(cart1)) {
            carts.push(cart1);
          }
          if (!carts.includes(cart2)) {
            carts.push(cart2);
          }
        }
      }
    }

    return { crashed: carts.length ? true : false, carts };
  }

  updateCartsOrder() {
    this.carts = this.carts.sort((c1, c2) => {
      const cart1 = { x: c1.path.loc[0], y: c1.path.loc[1] };
      const cart2 = { x: c2.path.loc[0], y: c2.path.loc[1] };

      if (cart1.y !== cart2.y) {
        return cart1.y - cart2.y;
      }
      return cart1.x - cart2.x;
    });
  }

  print() {
    console.log("\u001b[2J\u001b[0;0H"); // clears screen
    const crashes = this.crashes.map(cart => cart.path.loc.toString());
    const cartsMap = this.carts.reduce((res, c) => {
      const dir = {
        [cartDirs.left.label]: "<",
        [cartDirs.right.label]: ">",
        [cartDirs.up.label]: "^",
        [cartDirs.down.label]: "v"
      };
      return {
        ...res,
        [c.path.loc]: colourStr(this.cartColours[c.id % 14], dir[c.dir.label])
      };
    }, {});
    const { x: xPaths, y: yPaths } = this.graph.getPathsSize();
    let str = "";
    for (let y = 0; y < yPaths; y++) {
      for (let x = 0; x < xPaths; x++) {
        const path = this.graph.getPath([x, y]);
        if (crashes && crashes.includes([x, y].toString())) {
          str += "X";
        } else if (cartsMap[[x, y]]) {
          str += cartsMap[[x, y]];
        } else if (path instanceof HorPath) {
          str += "-";
        } else if (path instanceof VerPath) {
          str += "|";
        } else if (path instanceof BCurvePath) {
          str += "\\";
        } else if (path instanceof FCurvePath) {
          str += "/";
        } else if (path instanceof IntPath) {
          str += "+";
        } else {
          str += " ";
        }
      }
      str += "\n";
    }
    console.log("Tick", this.tickCount);
    console.log(str);
  }
}

module.exports = CartSim;
