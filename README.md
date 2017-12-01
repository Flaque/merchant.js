# 💰 Merchant

Merchant is a system for creating programs that manage changing numbers over
time. It's especially useful for creating idle games (sometimes called
incremental games), but could potentially be used in other games or programs. It
works well with Redux, but doesn't require it. Functions return copies and don't
modify state. Since Merchant is built on `immutable`, most of it's key concepts
are stored as immuatble objects.

Merchant is really just a collection of patterns with some helpful functions.

[Docs here.](https://flaque.github.io/merchant.js/)

# Concepts

## Currencies

A currency is a string label for some number in the system. You can define these
yourself like you normally would:

```js
const GOLD = "GOLD";
const SILVER = "SILVER";
const MAGIC_POWER = "MAGIC_POWER";
```

## Ledgers

A Ledger in Merchant is an `immutable` `Map` object where the keys are
currencies and the values are numbers.

```js
const { Map } = require("immutable");
const ledger = Map({ GOLD: 5, SILVER: 10 });
```

Ledger values can be either positive or negative.

```js
const ledger = Map({ GOLD: -5, SILVER: 10 });
```

## Wallet

A Wallet is a special ledger that keeps your main state. It's generally computed
by adding several ledgers together.

You can generally think of all other ledgers as "updates" to your wallet.

## Items

An item is something that can be bought and can effect the main ledger. They're
generally JSON defined in a `pouch` file:

```js
// pouch.js
import { GOLD, POWER } from "./currencies";

export const MagicSword = {
  type: "MagicSword",
  cost: () => {
    return Map({ [GOLD]: -5 });
  }
  effect: (state) => {
    return Map({ [POWER]: state.currentPowerLevel });
  }
};
```

An item _must_ have a `type` attribute. It's useful to give it the same name as
the item itself, but not required.

An item _can_ have a `cost` function that returns a ledger. This is used by the
`buy` function to determine the cost. Note that value should be negative if you
want to subtract from your wallet.

An item _can_ have a `effect` function that's used by the `pouchEffectsLedger`
function to generate an effects ledger.

Both of these functions can take in the "state" if you would like. If you're
using redux, you can treat these like mini reducers. This is pretty useful if
you want to make the cost variable over time or a function of how many items you
own.

To pass the state in, you can just throw it in the `merchant` functions:

```js
const newWallet = buy(MagicSword, wallet, state);
const newLedger = pouchEffectsLedger(pouch, wallet, state);
```

Also note that there's no "amount" or "count" attribute in here, nor is this a
class with a constructor. Items should not be instantiated. They should not
store or contain state. They're blueprints, not objects.

The "amount" of the item can be stored in the wallet. So I can have a wallet
that looks like this:

```js
const wallet = Map({
  GOLD: 5,
  MagicSword: 2
});
```

We do this so that calculating a per-tick case without having to run through 10k
"cost" functions.

# Helpful Merchant Functions

### Adding Ledgers Together

With Merchant, you can add an arbitrary number of ledgers together.

```js
import { add } from "merchant.js";

// ...

const ledger = add(ledgerOne, ledgerTwo, ledgerThree);
```

### Scaling Ledgers

If you would like to multiply all currencies by a number, you can use the
`scale` function:

```js
import { scale } from "merchant.js";

const ledger = Map({ GOLD: 2, SILVER: -10 });
const scaledLedger = scale(ledger, 2);

scaledLedger.get(GOLD); // 4
scaledLedger.get(SILVER); // -20
```

### Checking all values are positive

You can check if all currencies in a ledger are positive with the `inTheBlack`
function:

```js
import { inTheBlack } from "merchant.js";

inTheBlack(Map({ GOLD: 2, SILVER: -10 })); // False
inTheBlack(Map({ GOLD: 2, SILVER: 10 })); // True
```

### Getting Unqiue Currencies

If you would like the currencies defined in an arbitrary collection of ledgers,
you can use the `currencies` function:

```js
import { currencies } from "merchant.js";

currencies(ledgerOne, ledgerTwo, ledgerThree); // ["GOLD", "SILVER", "MAGIC_POWER"]
```

### Buying items

You can charge the wallet with the cost of an item with the `buy` function:

```js
import { buy } from "merchant.js";

const newWallet = buy(MagicSword, wallet);
```

Note that you can also pass in your total state too.

```js
import { buy } from "merchant.js";

const newWallet = buy(MagicSword, wallet, state);
```

---

Made with ❤️ by [@flaqueeau](https://twitter.com/flaqueeau).
