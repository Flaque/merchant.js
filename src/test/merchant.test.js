const { add, scale, inTheBlack, inTheRed, currencies } = require("../index.js");
const { Map } = require("immutable");

describe("add returns a blank ledger if we add nothing", () => {
  const ledger = add();

  expect(ledger.size).toBe(0);
});

describe("add returns a blank ledger if we add an empty array", () => {
  const ledger = add([]);

  expect(ledger.size).toBe(0);
});

describe("add returns the same ledger if we only have one ledger", () => {
  const dummy = Map({ GOLD: 5 });
  const ledger = add(dummy);

  expect(ledger.equals(dummy)).toBe(true);
});

describe("adding two ledgers will add both of their currencies together", () => {
  const one = Map({ GOLD: 5 });
  const two = Map({ GOLD: 2 });
  const ledger = add(one, two);

  expect(ledger.get("GOLD")).toBe(7);
});

describe("adding two uneven ledgers maintains both their currencies", () => {
  const one = Map({ GOLD: 5 });
  const two = Map({ MAGIC_POWER: 2 });
  const ledger = add(one, two);

  expect(ledger.get("GOLD")).toBe(5);
  expect(ledger.get("MAGIC_POWER")).toBe(2);
});
