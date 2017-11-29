const { add, scale, inTheBlack, inTheRed, currencies } = require("../index.js");
const { Map, List } = require("immutable");

describe("add", () => {
  test("add will throw if the ledger is not a map", () => {
    expect(() => {
      add({ cats: "dogs" });
    }).toThrow();
  });

  test("add returns a blank ledger if we add nothing", () => {
    const ledger = add();

    expect(ledger.size).toBe(0);
  });

  test("add returns a blank ledger if we add an empty array", () => {
    const ledger = add(...[]);

    expect(ledger.size).toBe(0);
  });

  test("add returns the same ledger if we only have one ledger", () => {
    const dummy = Map({ GOLD: 5 });
    const ledger = add(dummy);

    expect(ledger.equals(dummy)).toBe(true);
  });

  test("adding two ledgers will add both of their currencies together", () => {
    const one = Map({ GOLD: 5 });
    const two = Map({ GOLD: 2 });
    const ledger = add(one, two);

    expect(ledger.get("GOLD")).toBe(7);
  });

  test("adding two uneven ledgers maintains both their currencies", () => {
    const one = Map({ GOLD: 5 });
    const two = Map({ MAGIC_POWER: 2 });
    const ledger = add(one, two);

    expect(ledger.get("GOLD")).toBe(5);
    expect(ledger.get("MAGIC_POWER")).toBe(2);
  });
});

describe("scale", () => {
  test("scale will throw if passed something that's not a map", () => {
    expect(() => scale({ haha: "notmap" }, 4)).toThrow();
  });

  test("scale multiplies the currency of a single item.", () => {
    const ledger = Map({ GOLD: 5 });
    expect(scale(ledger, 5).get("GOLD")).toBe(25);
  });

  test("scale multiplies the currency of multiple items", () => {
    const ledger = Map({ GOLD: 5, SILVER: 2 });
    const scaledLedger = scale(ledger, 5);

    expect(scaledLedger.get("GOLD")).toBe(25);
    expect(scaledLedger.get("SILVER")).toBe(10);
  });
});

describe("inTheBlack", () => {
  test("inTheBlack will throw if passed something that's not a map", () => {
    expect(() => inTheBlack({ notA: "Map" })).toThrow();
  });

  test("inTheBlack will return true if all items are positive", () => {
    const ledger = Map({ GOLD: 5, SILVER: 4 });
    expect(inTheBlack(ledger)).toBe(true);
  });

  test("inTheBlack will return false if a single item is negative", () => {
    const ledger = Map({ GOLD: 5, SILVER: -5 });
    expect(inTheBlack(ledger)).toBe(false);
  });

  test("inTheBlack will return false if all items are negative", () => {
    const ledger = Map({ GOLD: -5, SILVER: -5 });
    expect(inTheBlack(ledger)).toBe(false);
  });
});

describe("inTheRed", () => {
  test("inTheRed will throw if passed something that's not a map", () => {
    expect(() => inTheRed({ NotA: "Map" })).toThrow();
  });

  test("inTheRed will return true if all items are negative", () => {
    const ledger = Map({ GOLD: -5, SILVER: -5 });
    expect(inTheRed(ledger)).toBe(true);
  });

  test("inTheRed will return false if any item is positive", () => {
    const ledger = Map({ GOLD: -5, SILVER: 5 });
    expect(inTheRed(ledger)).toBe(false);
  });

  test("inTheRed will return false if all items are positive", () => {
    const ledger = Map({ GOLD: 5, SILVER: 5 });
    expect(inTheRed(ledger)).toBe(false);
  });
});

describe("currencies", () => {
  test("currencies will throw if it receives something that's not a Map", () => {
    expect(() => currencies({ notA: "ledger" })).toThrow();
  });

  test("currencies returns a list", () => {
    const result = currencies(Map({ GOLD: "5" }));
    expect(List.isList(result)).toBe(true);
  });

  test("currencies will only return unique items", () => {
    const one = Map({ GOLD: 5 });
    const two = Map({ SILVER: 10, GOLD: 10 });
    const result = currencies(one, two);
    const sortedResult = result.sort();
    const sortedExpected = List(["GOLD", "SILVER"]).sort();

    expect(sortedResult.equals(sortedExpected)).toBe(true);
  });
});
