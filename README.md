# 💰 Merchant

Merchant is a system for creating programs that manage changing numbers over
time. It's especially useful for creating idle games (sometimes called
incremental games), but could potentially be used in other games or programs. It
works well with Redux, but doesn't require it. Functions return copies and don't
modify state. Since Merchant is built on `immutable`, most of it's key concepts
are stored as immuatble objects.

Merchant is really just a collection of patterns with some helpful functions.

# Overview

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

## Helpers

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

### Checking all values are negative

Similarly, you can check all values are negative with the `inTheRed` function:

```js
import { inTheRed } from "merchant.js"

inTheRed(Map({ GOLD: 2, SILVER: -10 }); // False
inTheRed(Map({ GOLD: -2, SILVER: -10 }); // True
```

### Getting Unqiue Currencies

If you would like the currencies defined in an arbitrary collection of ledgers,
you can use the `currencies` function:

```js
import { currencies } from "merchant.js";

currencies(ledgerOne, ledgerTwo, ledgerThree); // ["GOLD", "SILVER", "MAGIC_POWER"]
```

### Getting the total of a specific currency
