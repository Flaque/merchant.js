const { maybe, throwIfCostNotFunc, throwIfNotMap } = require("../util");

test("throwIfCostNotFunc does not throw if there's no cost function", () => {
  throwIfCostNotFunc({ type: "MagicSword " });
  // If we get here, we didn't throw, so we pass
});
