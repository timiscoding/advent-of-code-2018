class Cluster {
  constructor() {
    this.stars = {};
  }

  addStar(star) {
    this.stars[star] = star;
  }

  concat(cluster) {
    const res = new Cluster();
    [...Object.values(cluster.stars), ...Object.values(this.stars)].forEach(
      s => {
        res.addStar(s); // keep the existing star array refs for Galaxy cluster map
      }
    );
    return res;
  }

  toString() {
    return `Cluster [ ${Object.values(this.stars)
      .map(s => `[${s}]`)
      .join(", ")} ]`;
  }
}

class Galaxy {
  constructor() {
    this.clusters = new Set();
    this.cluster = new Map();
  }

  diffCluster(star, star2) {
    if (this.cluster.has(star) && !this.cluster.has(star2)) {
      const cluster = new Cluster();
      cluster.addStar(star2);
      this.cluster.set(star2, cluster);
      this.clusters.add(cluster);
    } else if (this.cluster.has(star2) && !this.cluster.has(star)) {
      const cluster = new Cluster();
      cluster.addStar(star);
      this.cluster.set(star, cluster);
      this.clusters.add(cluster);
    } else if (!this.cluster.has(star) && !this.cluster.has(star2)) {
      const cluster1 = new Cluster();
      cluster1.addStar(star);
      this.cluster.set(star, cluster1);

      const cluster2 = new Cluster();
      cluster2.addStar(star2);
      this.cluster.set(star2, cluster2);

      this.clusters.add(cluster1);
      this.clusters.add(cluster2);
    }
  }

  sameCluster(star, star2) {
    let cluster;

    if (this.cluster.has(star) && !this.cluster.has(star2)) {
      cluster = this.cluster.get(star);
      this.cluster.set(star2, cluster);
    } else if (this.cluster.has(star2) && !this.cluster.has(star)) {
      cluster = this.cluster.get(star2);
      this.cluster.set(star, cluster);
    } else if (!this.cluster.has(star) && !this.cluster.has(star2)) {
      cluster = new Cluster();
      this.cluster.set(star, cluster);
      this.cluster.set(star2, cluster);
      this.clusters.add(cluster);
    } else if (this.cluster.has(star) && this.cluster.has(star2)) {
      if (this.cluster.get(star) === this.cluster.get(star2)) return;

      // both stars belong to separate clusters so we need to join them
      const cluster1 = this.cluster.get(star);
      const cluster2 = this.cluster.get(star2);
      cluster = cluster1.concat(cluster2);
      Object.values(cluster.stars).forEach(s => {
        this.cluster.set(s, cluster); //assign all stars to new combined cluster
      });
      this.clusters.delete(cluster1);
      this.clusters.delete(cluster2);
      this.clusters.add(cluster);
    }
    cluster.addStar(star);
    cluster.addStar(star2);
  }

  toString() {
    return `Galaxy { clusters (${this.clusters.size}): [\n${[...this.clusters]
      .map(c => c.toString())
      .join("\n")}] }`;
  }

  print() {
    console.log("" + this);
  }
}

module.exports = Galaxy;
