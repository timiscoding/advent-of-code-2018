function Node(val) {
  this.val = val;
  this.next = null;
}

Node.prototype.toString = function() {
  return this.val;
};

module.exports = class Queue {
  constructor(node) {
    if (node) {
      this.head = node;
      this.tail = node;
    }
  }

  getHead() {
    return this.head;
  }

  *it() {
    let cur = this.head;
    while (cur) {
      yield cur.val;
      cur = cur.next;
    }
  }

  enqueue(val) {
    const node = new Node(val);
    if (this.tail) {
      this.tail.next = node;
      this.tail = node;
    } else {
      this.head = this.tail = node;
    }
    return val;
  }

  dequeue() {
    let node = null;
    if (this.head) {
      node = this.head;
      if (this.head.next) {
        this.head = this.head.next;
      } else {
        this.head = this.tail = null;
      }
    }
    return node ? node.val : null;
  }

  toString() {
    let str = "";
    for (let cur = this.head; cur !== null; cur = cur.next) {
      str += `${cur.val} `;
    }
    return str;
  }
};
