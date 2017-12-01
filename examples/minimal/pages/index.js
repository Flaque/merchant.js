import React from "react";
import { Map } from "immutable";
import { add, buy, inTheBlack, addItem, pouchEffectsLedger } from "merchant.js";

// Currencies
const cuddles = "cuddles";

// Items
const pouch = {
  doggo: {
    type: "Doggo",
    cost: () => {
      return Map({ [cuddles]: -1 });
    },
    effect: () => {
      return Map({ [cuddles]: 100 });
    }
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wallet: Map(),
      ledger: Map()
    };

    this.cuddle = this.cuddle.bind(this);
    this.buyDoggo = this.buyDoggo.bind(this);
    this.update = this.update.bind(this);

    setInterval(this.update, 200);
  }

  update() {
    this.setState({
      wallet: add(this.state.wallet, this.state.ledger)
    });
  }

  cuddle() {
    const wallet = add(this.state.wallet, Map({ [cuddles]: 1 }));
    this.setState({
      wallet
    });
  }

  buyDoggo() {
    const walletWithCostsApplied = buy(pouch.doggo, this.state.wallet);
    if (!inTheBlack(walletWithCostsApplied)) {
      return;
    }

    const wallet = addItem(pouch.doggo, walletWithCostsApplied);
    const ledger = pouchEffectsLedger(Object.values(pouch), wallet);

    this.setState({
      wallet,
      ledger
    });
  }

  render() {
    return (
      <div>
        <h1> Cuddles {this.state.wallet.get(cuddles) || 0} </h1>
        <button onClick={this.cuddle}>Cuddle Pupper</button>

        <h1> 🐶 Doggos: {this.state.wallet.get(pouch.doggo.type) || 0} </h1>
        <button onClick={this.buyDoggo}>Getchaself a good ol' doggo</button>

        <p>{(this.state.ledger.get(cuddles) || 0) / 5} cuddles per second</p>
      </div>
    );
  }
}

export default () => <App />;
