# Custom Rule Neural Network

A native macOS app containing a configurable neural network built from scratch in JavaScript. Every neuron uses `h(z) = sigmoid(z)`, and all weights and biases train locally with backpropagation.

The user defines correctness with a boolean function:

```js
function check(input, prediction) {
  return Math.round(prediction / 50) === input % 3;
}
```

`input` is the original number and `prediction` is the network output from 0 to 100. When the rule is applied, the app scans the accepted prediction ranges for every input, derives a training target inside each accepted range, resets the weights, and trains toward those targets.

The first layer uses binary encoding. An 8-bit input layer represents values from 0 to 255; a 14-bit input layer represents values from 0 to 16,383. Each first-layer neuron carries one binary digit into the network.

**+ Layer** appends a hidden layer. Every hidden layer has its own neuron-count field and delete button. There is no configured upper limit on layers or neurons; practical limits depend on available memory and processing power. Architecture changes initialize a new network because the weight matrix shapes change.

**Keep Training** continues indefinitely until **Stop Training** is pressed. No API, remote model, or internet connection is used.

**Train Until 100%** continues from the current weights, evaluates the complete training set as it runs, and stops automatically when every input passes `check()`. **Stop Training** can still cancel it early.
