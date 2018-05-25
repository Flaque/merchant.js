const { Map, List } = require("immutable");
const invariant = require("invariant");
const { maybe, throwIfCostNotFunc, throwIfNotMap } = require("./util");

/**
 * Adds an arbitrary amount of ledgers together.
 *
 * @example
 * const wallet = Map({GOLD: 0});
 * const expensesLedger = Map({GOLD: -5});
 * const profitsLedger = Map({GOLD: 10, Silver: 3 });
 *
 * const total = sum(wallet, expensesLedger, profitsLedger);
 * total.get("GOLD");   // 5
 * total.get("SILVER"); // 3
 *
 * @example
 * const ledgers = [wallet, expenses, profits];
 * const total = sum(...ledgers);
 *
 * @param {Array<immutable.Map>} ledgers
 * @return {immutable.Map} a ledger combining all values
 */
const sum = (...ledgers) => {
  if (!ledgers || ledgers.length === 0) {
    return Map({});
  }

  // Really simple check to make sure we're only using maps
  throwIfNotMap(ledgers[0], "add");

  if (ledgers.length === 1) {
    return ledgers[0];
  }

  return ledgers[0].mergeWith((one, two) => one + two, ...ledgers.slice(1));
};

/**
 * Multiplies all currency values in a ledger by the scale. This is quite
 * useful for when you want to multiply the effects of an item by the amount
 * of that item.
 *
 * @example
 * const incomeFromSalesfolk = Map({GOLD: 2, INFLUENCE: 5});
 * const newIncome = scale(incomeFromSalesFolk, state.numOfSalesfolk);
 *
 * newIncome.get("GOLD");     // 2 * state.numOfSalesfolk
 * newIncome.get("INFLUENCE") // 5 * state.numOfSalesfolk
 *
 * @param {immutable.Map} ledger
 * @param {Number} scale
 * @return {immutable.Map} the updated ledger
 */
const scale = (ledger, scale) => {
  throwIfNotMap(ledger, "scale");
  return ledger.map(x => x * scale);
};

/**
 * Returns true if all items in the ledger are positive.
 * @param {immutable.Map} ledger
 * @return {Boolean}
 *
 */
const inTheBlack = ledger => {
  throwIfNotMap(ledger, "inTheBlack");
  return ledger.every(val => val >= 0);
};

/**
 * Returns true if all items in the ledger are negative.
 * @param {immutable.Map} ledger
 * @return {Boolean}
 */
const inTheRed = ledger => {
  throwIfNotMap(ledger, "inTheRed");
  return ledger.every(val => val < 0);
};

/**
 * Returns all unique currencies defined in several ledgers
 * @param {Array<immutable.Map>} ledger
 * @return {immutable.List}
 */
const currencies = (...ledgers) => {
  if (!ledgers || ledgers.length === 0) {
    return List();
  }
  throwIfNotMap(ledgers[0], "currencies");

  if (ledgers.length === 1) {
    return ledgers[0].keySeq().toList();
  }

  const mergedLedgers = ledgers[0].merge(...ledgers.slice(1));
  return mergedLedgers.keySeq().toList();
};

/**
 * Gets the currency value of a particular currency given several ledgers.
 * This is useful for finding the cost of something spread over several different
 * ledgers.
 *
 * @example
 * const materialCost = Map({GOLD: -5, SILVER: -2});
 * const transportCost = Map({GOLD: -2});
 * const goldCost = totalOf("GOLD", materialCost, transportCost); // -7
 *
 * @param {String} currency
 * @param {Array<immutable.Map>} ledgers
 */
const totalOf = (currency, ...ledgers) => {
  if (!ledgers || ledgers.length === 0) {
    return 0;
  }
  throwIfNotMap(ledgers[0], "totalOf");

  return maybe(sum(...ledgers).get(currency), 0);
};

/**
 * Given an item, run it's cost function and return the result.
 * @param {Object} item
 * @param {Object} state
 * @return {immutable.Map} a ledger
 */
const cost = (item, state = {}) => {
  if (!item || !item.cost) {
    return Map();
  }

  throwIfCostNotFunc(item);
  return item.cost(state);
};

/**
 * Given a bunch of items, figure out all their costs and return it
 * as an immutable Map
 * @param {immutable.Map | Object} items
 * @param {Object} state
 * @return {immutable.Map} a Map of ledgers where the key is the `item.type`
 */
const allCosts = (items, state = {}) => {
  if (!Map.isMap(items) && typeof items === "object") {
    items = Map(items);
  }

  return items.map(item => {
    return cost(item, state);
  });
};

/**
 * Buy returns a new wallet after an item is purchased.
 * If the item is free, it just returns the same wallet.
 *
 * @example
 * const MagicSword = {
 *   type: "MagicSword",
 *   cost: state => Map({ GOLD: -(5 + state.marketPrice) })
 * }
 *
 * const wallet = new Map({ GOLD: 10 });
 * const state = { marketPrice : 1 };
 *
 * const newWallet = buy(MagicSword, wallet, state); // Gold => 4
 * const canBuy = inTheBlack(newWallet); // true
 *
 * @param {Object} item has at least a "cost" that returns a ledger.
 * @param {immutable.Map} wallet the current sum of ledgers
 * @param {Object} state a state object that will be passed to the cost to determine the type
 */
const buy = (item, wallet, state = {}) => {
  if (!item || !item.cost) {
    return wallet;
  }

  throwIfCostNotFunc(item);

  const cost = item.cost(state);

  // Check that the cost actually returns an immutable Map
  invariant(
    Map.isMap(cost),
    `The item of type: "${
      item.type
    }" returns something other than an Immutable.js Map.`
  );

  return sum(item.cost(state), wallet);
};

/**
 * Adds an item to the wallet
 * @param {Object} item
 * @param {immutable.Map} wallet
 * @param {Number} amount
 *
 * @example
 * const MagicSword = {
 *   type: "MagicSword"
 * }
 * const wallet = new Map({GOLD: 10})
 *
 * add(MagicSword, wallet);    // Map({GOLD: 10, MagicSword: 1})
 * add(MagicSword, wallet, 3); // Map({GOLD: 10, MagicSword: 3})
 */
const add = (item, wallet, amount = 1) => {
  return sum(wallet, Map({ [item.type]: amount }));
};

/**
 * For a collection of items, combines their "effect" functions into
 * one big ledger. This is useful for caching the onUpdate effects to your
 * wallet rather than computing them every time.
 *
 * @param {Array<Object>} items
 * @param {immutable.Map} wallet
 * @param {Object} state
 *
 * @example
 * const pouch = {
 *   MagicSword: {
 *     type: "MagicSword",
 *     effect: state => doSomething(state)
 *   },
 *   // ...
 * }
 *
 * const ledger = effects(pouch, wallet, state);
 */
const effects = (items, wallet, state = {}) => {
  const ledgers = items
    .map(item => {
      if (!item.effect) return;
      return scale(item.effect(state), maybe(wallet.get(item.type), 0));
    })
    .filter(n => n);
  return sum(...ledgers);
};

module.exports = {
  sum,
  scale,
  inTheBlack,
  inTheRed,
  currencies,
  totalOf,
  buy,
  add,
  effects,
  cost,
  allCosts
};
