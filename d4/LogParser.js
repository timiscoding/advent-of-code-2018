/*

Parses all the lines and make sure it follows this repeating pattern:

Guard
sleep \
wake  / 0 or more times

Throws error if validation fails

Stores guard sleep times in the format:

  {
    guardId: [[sleepTime, wakeTime], ...]
  }
*/
class LogParser {
  constructor(logs) {
    this.logs = logs;
    this.lineNum = 0;
    this.guards = {}; // store list of sleep,wake times for all guards
    this.guard();
  }

  getText() {
    return this.logs[this.lineNum].text;
  }

  getTs() {
    return this.logs[this.lineNum].ts;
  }

  nextLine(fn) {
    this.lineNum++;

    if (this.lineNum >= this.logs.length) {
      return;
    }
    fn.call(this);
  }

  error(expected) {
    throw new Error(
      `Expected ${expected} at line ${this.lineNum +
        1} but got ${this.getText()}`
    );
  }

  guard() {
    if (this.getText().startsWith("Guard")) {
      this.curGuardId = this.getText().match(/#(\d+)/)[1];
      this.nextLine(this.sleep);
    } else {
      this.error("Guard | sleep");
    }
  }

  sleep() {
    if (this.getText().startsWith("falls")) {
      this.curSleepTime = this.getTs();
      this.nextLine(this.wake);
    } else {
      this.guard();
    }
  }

  wake() {
    if (this.getText().startsWith("wakes")) {
      this.curWakeTime = this.getTs();

      if (this.guards[this.curGuardId]) {
        this.guards[this.curGuardId].push([
          this.curSleepTime,
          this.curWakeTime
        ]);
      } else {
        this.guards[this.curGuardId] = [[this.curSleepTime, this.curWakeTime]];
      }
      this.nextLine(this.sleep);
    } else {
      this.error("wakes");
    }
  }
}

module.exports = LogParser;
