function reduceEmptyOption(str) {
  const res = str.replace(/\(([NEWS]+)\|\)/g, (_, m) => {
    // console.log("matched");
    if (m.length % 2 !== 0) {
      throw new Error("odd length empty option!");
    }
    const reducto = m.slice(0, m.length / 2);
    return `(${reducto})`;
  });
  // console.log("reducer", res);
  return res;
}

function reduceRooms(str) {
  const res = reduceEmptyOption(str)
    .replace(/[(|)^$]/g, "")
    .trim();
  // console.log("rooms", res.trim());
  return res;
}

function chunks(str, n) {
  let res = [];
  for (let i = 0; i < str.length; i += n) {
    res.push(str.slice(i, i + n));
  }
  res = res.join("\n");
  // console.log("chunks", res);
  return res;
}

module.exports = {
  reduceRooms,
  chunks
};
