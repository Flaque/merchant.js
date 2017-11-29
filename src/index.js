const { Map } = require("immutable");

const add = (...ledgers) => {
  if (!ledgers || ledgers.length === 0) {
    return Map({});
  }
};

module.exports = {
  add
};
