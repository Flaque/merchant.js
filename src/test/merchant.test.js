const {
  add,
  scale,
  inTheBlack,
  inTheRed,
  currencies,
  totalOf,
  buy,
  addItem,
  pouchEffectsLedger
} = require("../index.js");
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

  test("currencies returns a list even if nothing is defined", () => {
    expect(List.isList(currencies())).toBe(true);
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

describe("totalOf", () => {
  test("totalOf will throw if it receives something that's not a Map", () => {
    expect(() => totalOf("HAHAHA", { NOTA: "ledger" })).toThrow();
  });

  test("totalOf will give you 0 if nothing is defined", () => {
    expect(totalOf()).toBe(0);
  });

  test("totalOf will give you 0 if the currency doesn't exist", () => {
    const one = Map({ GOLD: 5 });
    const two = Map({ SILVER: 5 });
    expect(totalOf("MAGIC_POWER", one, two)).toBe(0);
  });

  test("totalOf will add up a row correctly", () => {
    const one = Map({ GOLD: 5 });
    const two = Map({ SILVER: 5, GOLD: 2 });
    expect(totalOf("GOLD", one, two)).toBe(7);
  });
});

describe("buy", () => {
  const MagicSword = {
    type: "MagicSword",
    cost: () =>
      Map({
        GOLD: -5
      })
  };

  test("buy will return the same wallet if nothing is defined", () => {
    const wallet = Map({ Foo: 5 });
    expect(buy(null, wallet)).toBe(wallet);
  });

  test("buy will throw if it receives an item with a cost attribute that's not a function", () => {
    expect(() => buy({ cost: "ya", type: "ha" })).toThrow();
  });

  test("buy will reduce the amount of currency if our cost is a negative ledger", () => {
    const newWallet = buy(MagicSword, Map({ GOLD: 10 }));
    expect(newWallet.get("GOLD")).toBe(5);
  });

  test("buy will return a negative balance when we can't afford an item", () => {
    const wallet = buy(MagicSword, Map({ GOLD: 0 }));
    expect(inTheBlack(wallet)).toBe(false);
  });

  test("buy will return a positive balance when we can afford an item", () => {
    const wallet = buy(MagicSword, Map({ GOLD: 99999 }));
    expect(inTheBlack(wallet)).toBe(true);
  });
});

describe("addItem", () => {
  test("adding an item will update the wallet", () => {
    const wallet = addItem({ type: "MagicSword" }, Map({}));
    expect(wallet.get("MagicSword")).toBe(1);
  });

  test("adding more than one item updates the wallet", () => {
    const wallet = addItem({ type: "MagicSword" }, Map({}), 5);
    expect(wallet.get("MagicSword")).toBe(5);
  });
});

describe("pouchEffectsLedger", () => {
  test("pouchEffectsLedger returns an empty ledger if there are no items", () => {
    expect(pouchEffectsLedger([], Map({})).size).toBe(0);
  });

  test("pouchEffectsLedger returns an empty ledger if there are no items with 'effects'", () => {
    const MagicSword = {
      type: "MagicSword"
    };

    const ledger = pouchEffectsLedger(
      [MagicSword],
      Map({ MagicSword: 2, Charm: 1 })
    );

    expect(ledger.size).toBe(0);
  });

  test("pouchEffectsLedger returns a ledger with a combination of effects", () => {
    const MagicSword = {
      type: "MagicSword",
      effect: state => {
        return Map({ MAGIC: 2 });
      }
    };

    const Charm = {
      type: "Charm",
      effect: state => {
        return Map({ MAGIC: 1, GOLD: 2 });
      }
    };

    const ledger = pouchEffectsLedger(
      [MagicSword, Charm],
      Map({ MagicSword: 2, Charm: 1 })
    );

    expect(ledger.get("GOLD")).toBe(2);
    expect(ledger.get("MAGIC")).toBe(5);
  });
});
