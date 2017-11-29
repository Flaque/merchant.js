const { Map, List } = require("immutable");
const invariant = require("invariant");

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

module.exports = {
  add,
  scale,
  inTheBlack,
  inTheRed,
  currencies
};
