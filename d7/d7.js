const fs = require("fs");
const { filename } = require("../utils");
const { Graph } = require("./Graph");
const Worker = require("./Worker");

function parseData() {
  const data = fs.readFileSync(filename).toString();
  const lines = data.trim().split("\n");
  return lines.map(l => ({ parent: l[5], child: l[36] }));
}

/* returns whether the node is ready for doing  */
function isStepReady(node, stepsDone) {
  return node.parents.every(p => stepsDone.has(p));
}

function topologicalSort() {
  const g = new Graph();

  parseData().forEach(({ parent, child }) => {
    const p = g.addNode(parent);
    const c = g.addNode(child);
    g.addEdge(p, c);
  });

  const done = new Set();
  let nextSteps = g
    .getNodes()
    .filter(n => n.parents.length === 0)
    .sort((a, b) => (a.name < b.name ? -1 : 1)); // maybe heap better

  let step;
  while (nextSteps.length) {
    step = nextSteps.shift();
    done.add(step);

    const newSteps = step.children.filter(c => isStepReady(c, done));
    nextSteps = newSteps
      .reduce((res, step) => {
        return res.includes(step) ? res : res.concat(step);
      }, nextSteps)
      .sort((a, b) => (a.name < b.name ? -1 : 1));
  }
  return [...done].map(n => n.name).join("");
}

function topologicalSortParallel(workersCount, taskTimes) {
  const g = new Graph();

  parseData().forEach(({ parent, child }) => {
    const p = g.addNode(parent);
    const c = g.addNode(child);
    g.addEdge(p, c);
  });

  const done = new Set();
  let nextSteps = g
    .getNodes()
    .filter(n => n.parents.length === 0)
    .sort((a, b) => (a.name < b.name ? -1 : 1)); // maybe heap better

  let time = 0;
  Worker.prototype.setTaskTimes(taskTimes);
  const workers = Array.from({ length: workersCount }, () => new Worker());
  const nodesCount = g.getNodes().length;

  do {
    time++;
    // console.group(`After ${time}s`);
    const doneSteps = workers
      .map(w => {
        if (w.getStatus() === "idle" && nextSteps.length) {
          w.assignTask(nextSteps.shift());
        }
        return w.doTask();
      })
      .filter(Boolean);

    doneSteps.forEach(task => {
      done.add(task);
    });

    const newSteps = doneSteps.reduce(
      (res, step) =>
        res.concat(step.children.filter(c => isStepReady(c, done))),
      []
    );
    nextSteps = newSteps
      .reduce((res, step) => {
        return res.includes(step) ? res : res.concat(step);
      }, nextSteps)
      .sort((a, b) => (a.name < b.name ? -1 : 1));
    // console.log("done", [...done]);
    // console.log("next", nextSteps);
    console.groupEnd();
  } while (
    done.size < nodesCount ||
    workers.some(w => w.getStatus() === "busy")
  );
  return time;
}

const sorted = topologicalSort();
console.log("Sorted steps:", sorted);

const taskTimes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  .split("")
  .reduce((res, c, i) => ({ ...res, [c]: i + 61 }), {});

const time = topologicalSortParallel(5, taskTimes);
console.log("Time for 5 workers to complete tasks: %ss", time);
