//VERSION=3

function setup() {
  return {
    input: [{ bands: ["HH", "dataMask"] }],
    output: { bands: 4 },
    mosaicking: "ORBIT"
  };
}

function toDb(v) {
  if (!isFinite(v) || v <= 0) return -40;
  return 10 * Math.log(v) / Math.LN10;
}

function norm(db, lo, hi) {
  var x = (db - lo) / (hi - lo);
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function evaluatePixel(samples, scenes) {
  if (!samples || samples.length === 0) return [0, 0, 0, 0];

  var idx = [];
  for (var i = 0; i < samples.length; i++) {
    if (samples[i] && isFinite(samples[i].HH) && samples[i].HH > 0) idx.push(i);
  }
  if (idx.length === 0) return [0, 0, 0, 0];

  idx.sort(function(a, b) {
    return new Date(scenes.orbits[a].dateFrom) - new Date(scenes.orbits[b].dateFrom);
  });

  var iEarly = idx[0];
  var iLate = idx[idx.length - 1];
  var iMid = idx[Math.floor((idx.length - 1) / 2)];

  // HH Arctic default stretch
  var LO = -25.0;
  var HI = -5.0;

  var r = norm(toDb(samples[iLate].HH), LO, HI);   // latest
  var g = norm(toDb(samples[iMid].HH), LO, HI);    // middle
  var b = norm(toDb(samples[iEarly].HH), LO, HI);  // earliest

  var a = samples[iLate].dataMask ? 1 : 0;
  return [r, g, b, a];
}


