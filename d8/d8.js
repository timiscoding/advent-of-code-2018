const fs = require("fs");
const { filename, genId } = require("../utils");

const HEADER_SIZE = 2;

function parseData() {
  const data = fs.readFileSync(filename).toString();
  return data
    .trim()
    .split(/\s+/)
    .map(n => parseInt(n, 10));
}

function Node({
  id = genId(),
  nodeSize = null,
  metaSize = null,
  metadata = null,
  children = [],
  parent = null
} = {}) {
  this.id = id;
  this.nodeSize = nodeSize;
  this.metaSize = metaSize;
  this.metadata = metadata;
  this.children = children;
  this.parent = parent;
}

class Tree {
  constructor() {
    this.nodes = {};
  }

  addNode({ nodeSize, metaSize } = {}) {
    const id = genId();
    this.nodes[id] = new Node({ id, nodeSize, metaSize });
    return this.nodes[id];
  }

  addEdge(parentNode, childNode) {
    if (
      !parentNode ||
      !(parentNode instanceof Node) ||
      !childNode ||
      !(childNode instanceof Node)
    ) {
      throw Error("Args must be Node instances");
    }
    if (!parentNode.children.includes(childNode)) {
      parentNode.children.push(childNode);
    }
    childNode.parent = parentNode;
  }

  getNodes() {
    return Object.values;
  }

  print() {
    console.group("Nodes:");
    for (const [name, v] of Object.entries(this.nodes)) {
      console.log(
        `${name} parent:${v.parent && v.parent.id} children:${
          v.children.length ? v.children.map(n => n.id) : "[]"
        } node size:${v.nodeSize} meta size:${v.metaSize} meta data:${
          v.metadata
        }`
      );
    }
    console.groupEnd();
  }
}

/* builds metadata tree from license data. mimics a dfs */
function dfs(tree, node, licenseIndex) {
  const [nodeSize, metaSize] = license.slice(
    licenseIndex,
    licenseIndex + HEADER_SIZE
  );

  node.nodeSize = nodeSize;
  node.metaSize = metaSize;

  if (nodeSize === 0) {
    const metaEnd = licenseIndex + HEADER_SIZE + metaSize;
    node.metadata = license.slice(licenseIndex + HEADER_SIZE, metaEnd);

    return metaEnd;
  }

  for (let i = 0; i < nodeSize; i++) {
    const child = tree.addNode();
    tree.addEdge(node, child);
  }

  licenseIndex += HEADER_SIZE;
  node.children.forEach(c => {
    licenseIndex = dfs(tree, c, licenseIndex);
  });

  const metaEnd = licenseIndex + node.metaSize;
  node.metadata = license.slice(licenseIndex, metaEnd);
  // tree.print();
  return metaEnd;
}

function sumMetadata(node) {
  let sum = node.metadata.reduce((res, v) => res + v, 0);
  if (node.children.length === 0) {
    return node.metadata.reduce((res, v) => res + v, 0);
  }

  node.children.forEach(c => {
    sum += sumMetadata(c);
  });

  return sum;
}

function sumRootMetadata(node) {
  let sum = 0;
  if (node.children.length === 0) {
    return node.metadata.reduce((res, v) => res + v, 0);
  } else {
    const childIndices = node.metadata.map(val => val - 1);
    childIndices.forEach(i => {
      sum += node.children[i] ? sumRootMetadata(node.children[i]) : 0;
    });
  }

  return sum;
}

const t = new Tree();
const license = parseData();
const rootNode = t.addNode();
dfs(t, rootNode, 0);
const metadataSum = sumMetadata(rootNode);
console.log("Metadata sum:", metadataSum);

const rootMetadataSum = sumRootMetadata(rootNode);
console.log("Root node metadata sum:", rootMetadataSum);
