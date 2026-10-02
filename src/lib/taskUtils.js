// utilities specific to this app/task
import _ from "lodash";

// Simple seeded PRNG (mulberry32 algorithm)
const mulberry32 = (seed) => {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Fisher-Yates shuffle using seeded PRNG
const seededShuffle = (array, seed) => {
  const rand = mulberry32(seed);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// initialize starting conditions for each trial within a block
const generateStartingOpts = (blockSettings, seed = null) => {
  console.log("generateStartingOpts called:");
  console.log("  randomize_order:", blockSettings.randomize_order);
  console.log("  seed:", seed);
  console.log("  conditions length:", blockSettings.conditions.length);

  const startingOptions = blockSettings.conditions.map((c) => {
    return _.range(blockSettings.repeats_per_condition).map(() => c);
  });

  if (blockSettings.randomize_order) {
    const flattened = _.flatten(startingOptions);
    const result = seed !== null ? seededShuffle(flattened, seed) : _.shuffle(flattened);
    console.log("Full randomized order:", result.map((t, i) =>
      `${i + 1}: ${t.stimulus || 'no stimulus'} [${t.data?.condition || 'no condition'}]`
    ));
    return result;
  } else {
    return _.flatten(startingOptions);
  }
};

export { generateStartingOpts };
