const { Map, List } = require("immutable");
const invariant = require("invariant");
const isFunc = require("is-function");

const maybe = (item, def) => {
  return item || def;
};

const throwIfNotMap = (maybeMap, funcName) => {
  // Really simple check to make sure we're only using maps
  invariant(
    Map.isMap(maybeMap),
    `Merchant's ${funcName} function requires you to use an Immutable Map.`
  );
};

/**
 * Adds an arbitrary amount of ledgers together.
 *
 * @example
 * const wallet = Map({GOLD: 0});
 * const expensesLedger = Map({GOLD: -5});
 * const profitsLedger = Map({GOLD: 10, Silver: 3 });
 *
 * const total = add(wallet, expensesLedger, profitsLedger);
 * total.get("GOLD");   // 5
 * total.get("SILVER"); // 3
 *
 * @example
 * const ledgers = [wallet, expenses, profits];
 * const total = add(...ledgers);
 *
 * @param {Array<immutable.Map>} ledgers
 * @return {immutable.Map} a ledger combining all values
 */
const add = (...ledgers) => {
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
 * const transportCost = Map({GOLD -2});
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

  return maybe(add(...ledgers).get(currency), 0);
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
 * const wallet = Map({ GOLD: 10 });
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

  // Check that the cost is a function
  invariant(
    isFunc(item.cost),
    `The item of type: "${
      item.type
    }" has a cost attribute that is not a function.`
  );

  const cost = item.cost(state);

  // Check that the cost actually returns an immutable Map
  invariant(
    Map.isMap(cost),
    `The item of type: "${
      item.type
    }" returns something other than an Immutable.js Map.`
  );

  return add(item.cost(state), wallet);
};

/**
 * Adds an item to the wallet
 * @param {Object} item
 * @param {immutable.Map} wallet
 * @param {Number} amount
 */
const addItem = (item, wallet, amount = 1) => {
  return add(wallet, Map({ [item.type]: amount }));
};

/**
 * For a collection of items, combines their "effect" functions into
 * one big ledger. This is useful for caching the onUpdate effects to your
 * wallet rather than computing them every time.
 *
 * @param {Array<Object>} items
 * @param {immutable.Map} wallet
 * @param {Object} state
 */
const pouchEffectsLedger = (items, wallet, state = {}) => {
  const ledgers = items
    .map(item => {
      if (!item.effect) return;
      return scale(item.effect(state), maybe(wallet.get(item.type), 0));
    })
    .filter(n => n);
  return add(...ledgers);
};

module.exports = {
  add,
  scale,
  inTheBlack,
  inTheRed,
  currencies,
  totalOf,
  buy,
  addItem,
  pouchEffectsLedger
};
