const { Node } = require("./Graph");
const { genId } = require("../utils");

class Worker {
  constructor() {
    this.status = Worker.prototype.status.idle;
    this.curTask = null;
    this.id = genId();
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    if (!Worker.prototype.status[status]) {
      throw Error(`Can not set status ${status} for worker`);
    }
    this.status = Worker.prototype.status[status];
  }

  assignTask(node) {
    if (!(node instanceof Node)) {
      throw Error("Arg must be Node instance");
    }
    this.setStatus("busy");
    this.curTask = {
      node,
      timeLeft: Worker.prototype.taskTimes[node.name]
    };
  }

  doTask() {
    if (this.curTask) {
      this.curTask.timeLeft--;
      // console.log(
      //   `Worker ${this.id} did task ${this.curTask.node.name} and has ${
      //     this.curTask.timeLeft
      //   }s left`
      // );
      if (this.curTask.timeLeft === 0) {
        const node = this.curTask.node;
        this.curTask = null;
        this.setStatus("idle");
        return node;
      }
    }
  }
}

Worker.prototype.status = {
  idle: "idle",
  busy: "busy"
};

Worker.prototype.setTaskTimes = times => (Worker.prototype.taskTimes = times);

module.exports = Worker;
