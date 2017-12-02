const invariant = require("invariant");
const { Map, List } = require("immutable");
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

const throwIfCostNotFunc = item => {
  if (!item.cost) return; // It's okay to have no cost

  // Check that the cost is a function
  invariant(
    isFunc(item.cost),
    `The item of type: "${
      item.type
    }" has a cost attribute that is not a function.`
  );
};

module.exports = {
  maybe,
  throwIfNotMap,
  throwIfCostNotFunc
};
