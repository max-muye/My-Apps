const MINI_BATCH = 32;

const els = {
  rate: document.querySelector("#learningRate"),
  rateValue: document.querySelector("#rateValue"),
  epochs: document.querySelector("#trainingEpochs"),
  epochsValue: document.querySelector("#epochsValue"),
  train: document.querySelector("#train"),
  trainUntilPerfect: document.querySelector("#trainUntilPerfect"),
  keepTraining: document.querySelector("#keepTraining"),
  stopTraining: document.querySelector("#stopTraining"),
  reset: document.querySelector("#reset"),
  addLayer: document.querySelector("#addLayer"),
  layerEditor: document.querySelector("#layerEditor"),
  architectureText: document.querySelector("#architectureText"),
  architectureSummary: document.querySelector("#architectureSummary"),
  layerLabels: document.querySelector("#layerLabels"),
  parameterCount: document.querySelector("#parameterCount"),
  status: document.querySelector("#status"),
  networkCanvas: document.querySelector("#networkCanvas"),
  lossCanvas: document.querySelector("#lossCanvas"),
  numberInput: document.querySelector("#numberInput"),
  numberInputLabel: document.querySelector("#numberInputLabel"),
  decrease: document.querySelector("#decrease"),
  increase: document.querySelector("#increase"),
  binaryValue: document.querySelector("#binaryValue"),
  probability: document.querySelector("#probability"),
  probabilityRing: document.querySelector("#probabilityRing"),
  prediction: document.querySelector("#prediction"),
  expected: document.querySelector("#expected"),
  epochCount: document.querySelector("#epochCount"),
  accuracy: document.querySelector("#accuracy"),
  loss: document.querySelector("#loss"),
  progressLabel: document.querySelector("#progressLabel"),
  exampleGrid: document.querySelector("#exampleGrid"),
  examplesDescription: document.querySelector("#examplesDescription"),
  checkEditor: document.querySelector("#checkEditor"),
  checkStatus: document.querySelector("#checkStatus"),
  applyCheck: document.querySelector("#applyCheck"),
  resetCheck: document.querySelector("#resetCheck")
};

const DEFAULT_CHECK_SOURCE = `function check(input, prediction) {
  return Math.round(prediction / 50) === input % 3;
}`;

let randomState = 20260925;
let inputSize = 8;
let hiddenSizes = [64, 32];
let hiddenWeights;
let hiddenBiases;
let outputWeights;
let outputBias;
let learnedEpochs = 0;
let lossHistory = [];
let animationFrame = null;
let customCheck = (input, prediction) => Math.round(prediction / 50) === input % 3;
let trainingTargets = [];

function random() {
  randomState = (1664525 * randomState + 1013904223) >>> 0;
  return randomState / 4294967296;
}

function sigmoid(value) {
  if (value >= 0) {
    const exp = Math.exp(-value);
    return 1 / (1 + exp);
  }
  const exp = Math.exp(value);
  return exp / (1 + exp);
}

function h(value) {
  return sigmoid(value);
}

function matrix(rows, columns, scale = 0) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => scale ? (random() * 2 - 1) * scale : 0)
  );
}

function vector(length, scale = 0) {
  return Array.from({ length }, () => scale ? (random() * 2 - 1) * scale : 0);
}

function targetFor(number) {
  return trainingTargets[number] / 100;
}

function trainingSize() {
  return 2 ** inputSize;
}

function binaryInput(number) {
  return Array.from({ length: inputSize }, (_, index) =>
    Math.floor(number / 2 ** (inputSize - index - 1)) % 2
  );
}

function buildCheck(source) {
  const candidate = Function(`"use strict"; return (${source});`)();
  if (typeof candidate !== "function") throw new Error("check must be a function");
  return candidate;
}

function deriveTrainingTargetsForSize(candidate, size) {
  const targets = [];
  const step = 0.5;
  for (let input = 0; input < size; input += 1) {
    const ranges = [];
    let rangeStart = null;
    for (let prediction = 0; prediction <= 100; prediction += step) {
      const accepted = candidate(input, prediction);
      if (typeof accepted !== "boolean") throw new Error("check must return true or false");
      if (accepted && rangeStart === null) rangeStart = prediction;
      if (!accepted && rangeStart !== null) {
        ranges.push([rangeStart, prediction - step]);
        rangeStart = null;
      }
    }
    if (rangeStart !== null) ranges.push([rangeStart, 100]);
    if (ranges.length === 0) throw new Error(`check accepts no prediction for input ${input}`);

    const widest = ranges.reduce((best, range) =>
      range[1] - range[0] > best[1] - best[0] ? range : best
    );
    if (widest[0] === 0) targets.push(0);
    else if (widest[1] === 100) targets.push(100);
    else targets.push((widest[0] + widest[1]) / 2);
  }
  return targets;
}

function deriveTrainingTargets(candidate) {
  return deriveTrainingTargetsForSize(candidate, trainingSize());
}

function isCorrect(input, prediction) {
  try {
    return customCheck(input, prediction) === true;
  } catch {
    return false;
  }
}

function applyCustomCheck(save = true) {
  try {
    const candidate = buildCheck(els.checkEditor.value);
    const targets = deriveTrainingTargets(candidate);
    customCheck = candidate;
    trainingTargets = targets;
    if (save) localStorage.setItem("modulo3-check-percent", els.checkEditor.value);
    initializeNetwork();
    els.checkStatus.textContent = "Custom check active · training targets rebuilt";
    if (save) els.status.textContent = "Rule applied · network reset";
    render();
  } catch (error) {
    els.checkStatus.textContent = `Error: ${error.message}`;
  }
}

function initializeNetwork() {
  randomState = 20260925;
  hiddenWeights = [matrix(inputSize, hiddenSizes[0], Math.sqrt(6 / (inputSize + hiddenSizes[0])))];
  for (let layer = 1; layer < hiddenSizes.length; layer += 1) {
    hiddenWeights.push(matrix(
      hiddenSizes[layer - 1],
      hiddenSizes[layer],
      Math.sqrt(6 / (hiddenSizes[layer - 1] + hiddenSizes[layer]))
    ));
  }
  hiddenBiases = hiddenSizes.map((size) => vector(size));
  const lastSize = hiddenSizes.at(-1);
  outputWeights = vector(lastSize, Math.sqrt(6 / (lastSize + 1)));
  outputBias = 0;
  learnedEpochs = 0;
  lossHistory = [];
}

function forward(inputIndex) {
  const hidden = [];
  const inputs = binaryInput(inputIndex);
  const first = new Array(hiddenSizes[0]);
  for (let neuron = 0; neuron < hiddenSizes[0]; neuron += 1) {
    let sum = hiddenBiases[0][neuron];
    for (let input = 0; input < inputSize; input += 1) {
      sum += inputs[input] * hiddenWeights[0][input][neuron];
    }
    first[neuron] = h(sum);
  }
  hidden.push(first);

  for (let layer = 1; layer < hiddenSizes.length; layer += 1) {
    const activation = new Array(hiddenSizes[layer]);
    for (let neuron = 0; neuron < hiddenSizes[layer]; neuron += 1) {
      let sum = hiddenBiases[layer][neuron];
      for (let previous = 0; previous < hiddenSizes[layer - 1]; previous += 1) {
        sum += hidden[layer - 1][previous] * hiddenWeights[layer][previous][neuron];
      }
      activation[neuron] = h(sum);
    }
    hidden.push(activation);
  }

  let outputSum = outputBias;
  const last = hidden.at(-1);
  for (let neuron = 0; neuron < last.length; neuron += 1) outputSum += last[neuron] * outputWeights[neuron];
  return { inputIndex, inputs, hidden, output: h(outputSum) };
}

function trainEpoch(rate) {
  const gradientInput = matrix(inputSize, hiddenSizes[0]);
  const gradientWeights = hiddenSizes.map((size, layer) =>
    layer === 0 ? null : matrix(hiddenSizes[layer - 1], size)
  );
  const gradientBiases = hiddenSizes.map((size) => vector(size));
  const gradientOutput = vector(hiddenSizes.at(-1));
  let gradientOutputBias = 0;

  for (let sample = 0; sample < MINI_BATCH; sample += 1) {
    const number = Math.floor(random() * trainingSize());
    const target = targetFor(number);
    const cache = forward(number);
    const outputDelta = cache.output - target;
    const deltas = new Array(hiddenSizes.length);
    const lastLayer = hiddenSizes.length - 1;

    gradientOutputBias += outputDelta;
    deltas[lastLayer] = new Array(hiddenSizes[lastLayer]);
    for (let neuron = 0; neuron < hiddenSizes[lastLayer]; neuron += 1) {
      gradientOutput[neuron] += outputDelta * cache.hidden[lastLayer][neuron];
      const activation = cache.hidden[lastLayer][neuron];
      deltas[lastLayer][neuron] = outputWeights[neuron] * outputDelta * activation * (1 - activation);
    }

    for (let layer = lastLayer - 1; layer >= 0; layer -= 1) {
      deltas[layer] = new Array(hiddenSizes[layer]);
      for (let neuron = 0; neuron < hiddenSizes[layer]; neuron += 1) {
        let propagated = 0;
        for (let next = 0; next < hiddenSizes[layer + 1]; next += 1) {
          propagated += hiddenWeights[layer + 1][neuron][next] * deltas[layer + 1][next];
        }
        const activation = cache.hidden[layer][neuron];
        deltas[layer][neuron] = propagated * activation * (1 - activation);
      }
    }

    for (let layer = 0; layer < hiddenSizes.length; layer += 1) {
      for (let neuron = 0; neuron < hiddenSizes[layer]; neuron += 1) {
        gradientBiases[layer][neuron] += deltas[layer][neuron];
      }
      if (layer > 0) {
        for (let previous = 0; previous < hiddenSizes[layer - 1]; previous += 1) {
          for (let neuron = 0; neuron < hiddenSizes[layer]; neuron += 1) {
            gradientWeights[layer][previous][neuron] += deltas[layer][neuron] * cache.hidden[layer - 1][previous];
          }
        }
      }
    }

    for (let input = 0; input < inputSize; input += 1) {
      for (let neuron = 0; neuron < hiddenSizes[0]; neuron += 1) {
        gradientInput[input][neuron] += deltas[0][neuron] * cache.inputs[input];
      }
    }
  }

  const step = rate / MINI_BATCH;
  for (let inputIndex = 0; inputIndex < inputSize; inputIndex += 1) {
    for (let neuron = 0; neuron < hiddenSizes[0]; neuron += 1) {
      hiddenWeights[0][inputIndex][neuron] -= step * gradientInput[inputIndex][neuron];
    }
  }
  for (let layer = 0; layer < hiddenSizes.length; layer += 1) {
    for (let neuron = 0; neuron < hiddenSizes[layer]; neuron += 1) {
      hiddenBiases[layer][neuron] -= step * gradientBiases[layer][neuron];
    }
    if (layer > 0) {
      for (let previous = 0; previous < hiddenSizes[layer - 1]; previous += 1) {
        for (let neuron = 0; neuron < hiddenSizes[layer]; neuron += 1) {
          hiddenWeights[layer][previous][neuron] -= step * gradientWeights[layer][previous][neuron];
        }
      }
    }
  }
  for (let neuron = 0; neuron < outputWeights.length; neuron += 1) {
    outputWeights[neuron] -= step * gradientOutput[neuron];
  }
  outputBias -= step * gradientOutputBias;
  learnedEpochs += 1;
}

function evaluateNetwork(full = false) {
  let correct = 0;
  let loss = 0;
  const epsilon = 1e-12;
  const examples = trainingSize();
  const parameterBudget = Math.max(64, Math.floor(8000000 / trainableParameterCount()));
  const indexes = full || examples <= parameterBudget
    ? Array.from({ length: examples }, (_, number) => number)
    : sampledIndexes(examples, parameterBudget);
  for (const number of indexes) {
    const target = targetFor(number);
    const output = Math.min(1 - epsilon, Math.max(epsilon, forward(number).output));
    if (isCorrect(number, output * 100)) correct += 1;
    loss -= target * Math.log(output) + (1 - target) * Math.log(1 - output);
  }
  return { accuracy: correct / indexes.length, loss: loss / indexes.length, exact: indexes.length === examples };
}

function positions(count, x, height, padding) {
  if (count === 1) return [{ x, y: height / 2 }];
  return Array.from({ length: count }, (_, index) => ({
    x,
    y: padding + index * (height - padding * 2) / (count - 1)
  }));
}

function drawConnections(ctx, from, to, weights, maxWeight) {
  for (let i = 0; i < from.length; i += 1) {
    for (let j = 0; j < to.length; j += 1) {
      const weight = Array.isArray(weights[i]) ? weights[i][j] : weights[i];
      const strength = Math.min(1, Math.abs(weight) / maxWeight);
      ctx.strokeStyle = weight >= 0
        ? `rgba(22,112,94,${0.035 + strength * 0.34})`
        : `rgba(213,133,57,${0.035 + strength * 0.34})`;
      ctx.lineWidth = 0.4 + strength * 1.2;
      ctx.beginPath();
      ctx.moveTo(from[i].x, from[i].y);
      ctx.lineTo(to[j].x, to[j].y);
      ctx.stroke();
    }
  }
}

function sampledIndexes(size, maximum = 48) {
  if (size <= maximum) return Array.from({ length: size }, (_, index) => index);
  return Array.from({ length: maximum }, (_, index) =>
    Math.round(index * (size - 1) / (maximum - 1))
  );
}

function drawNetwork(cache) {
  const canvas = els.networkCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f7f9f8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const inputIndexes = sampledIndexes(inputSize, 48);
  const hiddenIndexes = hiddenSizes.map((size) => sampledIndexes(size));
  const displayedInputWeights = inputIndexes.map((inputIndex) =>
    hiddenIndexes[0].map((neuron) => hiddenWeights[0][inputIndex][neuron])
  );
  const layerCount = hiddenSizes.length + 2;
  const horizontalGap = (canvas.width - 140) / (layerCount - 1);
  const layers = [positions(inputIndexes.length, 70, canvas.height, 35)];
  hiddenIndexes.forEach((indexes, index) => {
    layers.push(positions(indexes.length, 70 + (index + 1) * horizontalGap, canvas.height, indexes.length > 40 ? 18 : 26));
  });
  layers.push(positions(1, canvas.width - 70, canvas.height, 42));

  const visualWeights = [displayedInputWeights];
  for (let layer = 1; layer < hiddenSizes.length; layer += 1) {
    visualWeights.push(hiddenIndexes[layer - 1].map((previous) =>
      hiddenIndexes[layer].map((neuron) => hiddenWeights[layer][previous][neuron])
    ));
  }
  visualWeights.push(hiddenIndexes.at(-1).map((neuron) => outputWeights[neuron]));
  for (let layer = 0; layer < visualWeights.length; layer += 1) {
    const values = Array.isArray(visualWeights[layer][0]) ? visualWeights[layer].flat() : visualWeights[layer];
    const maximum = Math.max(0.1, ...values.map(Math.abs));
    drawConnections(ctx, layers[layer], layers[layer + 1], visualWeights[layer], maximum);
  }

  const displayedHiddenActivations = cache.hidden.map((activation, layer) =>
    hiddenIndexes[layer].map((neuron) => activation[neuron])
  );
  const activations = [inputIndexes.map((index) => cache.inputs[index]), ...displayedHiddenActivations, [cache.output]];
  layers.forEach((layer, layerIndex) => {
    layer.forEach((position, index) => {
      const activation = activations[layerIndex][index];
      const radius = layer.length > 48 ? 3.2 : layer.length > 24 ? 5 : layer.length > 16 ? 6 : 10;
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${Math.round(232 - activation * 202)}, ${Math.round(172 - activation * 55)}, ${Math.round(92 + activation * 2)})`;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.95)";
      ctx.lineWidth = 2;
      ctx.stroke();
      if (layerIndex === 0) {
        ctx.fillStyle = activation ? "#fff" : "#3c2d1c";
        ctx.font = "700 9px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(activation), position.x, position.y);
      }
    });
  });
}

function drawLossGraph() {
  const canvas = els.lossCanvas;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f3f6f4";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (lossHistory.length < 2) return;
  const maxLoss = Math.max(0.7, ...lossHistory);
  ctx.beginPath();
  lossHistory.forEach((value, index) => {
    const x = index / (lossHistory.length - 1) * canvas.width;
    const y = canvas.height - 12 - value / maxLoss * (canvas.height - 24);
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#16705e";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function renderExamples() {
  els.exampleGrid.innerHTML = "";
  for (let number = 0; number < Math.min(16, trainingSize()); number += 1) {
    const output = forward(number).output;
    const targetPercent = trainingTargets[number];
    const passed = isCorrect(number, output * 100);
    const item = document.createElement("div");
    item.className = `example ${passed ? "correct" : "wrong"}`;
    item.innerHTML = `<strong>${number}</strong><span>${passed ? "PASS" : "MISS"}</span><small>${Math.round(output * 100)}% / ${targetPercent.toFixed(1)}%</small>`;
    els.exampleGrid.append(item);
  }
}

function selectedNumber() {
  const parsed = Number.parseInt(els.numberInput.value, 10);
  return Math.max(0, Math.min(trainingSize() - 1, Number.isFinite(parsed) ? parsed : 0));
}

function trainableParameterCount() {
  let total = inputSize * hiddenSizes[0] + hiddenSizes[0];
  for (let layer = 1; layer < hiddenSizes.length; layer += 1) {
    total += hiddenSizes[layer - 1] * hiddenSizes[layer] + hiddenSizes[layer];
  }
  total += hiddenSizes.at(-1) + 1;
  return total;
}

function renderArchitecture() {
  const parameters = trainableParameterCount();
  const editingDisabled = animationFrame !== null;
  els.architectureText.textContent = `${inputSize} → ${hiddenSizes.join(" → ")} → 1`;
  els.architectureSummary.textContent = `${parameters.toLocaleString()} trainable parameters`;
  els.parameterCount.textContent = parameters.toLocaleString();
  const labels = [`${inputSize} binary inputs`, ...hiddenSizes.map((size) => `${size} neurons`), "0–100 output"];
  els.layerLabels.style.gridTemplateColumns = `repeat(${labels.length}, 1fr)`;
  els.layerLabels.innerHTML = labels.map((label) => `<span>${label}</span>`).join("");
  els.layerEditor.innerHTML = `
    <div class="layer-row">
      <span>Input</span>
      <input type="number" min="1" step="1" value="${inputSize}" data-input-size aria-label="Binary input bits" ${editingDisabled ? "disabled" : ""}>
      <span>bits</span>
      <span aria-hidden="true"></span>
    </div>
  ` + hiddenSizes.map((size, index) => `
    <div class="layer-row">
      <span>H${index + 1}</span>
      <input type="number" min="1" step="1" value="${size}" data-layer-size="${index}" aria-label="Neurons in hidden layer ${index + 1}" ${editingDisabled ? "disabled" : ""}>
      <span>neurons</span>
      <button type="button" class="layer-delete" data-delete-layer="${index}" aria-label="Delete hidden layer ${index + 1}" title="Delete layer" ${editingDisabled || hiddenSizes.length === 1 ? "disabled" : ""}>×</button>
    </div>
  `).join("");
}

function render() {
  const number = selectedNumber();
  els.numberInput.value = String(number);
  const binary = number.toString(2).padStart(inputSize, "0");
  const cache = forward(number);
  const networkOutput = cache.output;
  const percent = Math.round(networkOutput * 100);
  const targetPercent = trainingTargets[number];
  const checkPassed = isCorrect(number, networkOutput * 100);
  const evaluation = evaluateNetwork();

  els.binaryValue.textContent = binary;
  els.numberInput.max = String(trainingSize() - 1);
  els.numberInputLabel.textContent = `Number from 0 to ${(trainingSize() - 1).toLocaleString()}`;
  els.examplesDescription.textContent = `Check results for the first ${Math.min(16, trainingSize())} numbers from the ${trainingSize().toLocaleString()}-example training set.`;
  els.probability.textContent = `${percent}%`;
  els.probabilityRing.style.setProperty("--probability", `${percent * 3.6}deg`);
  els.prediction.textContent = `${percent}%`;
  els.prediction.classList.toggle("incorrect", !checkPassed);
  els.expected.textContent = `Training target: ${targetPercent.toFixed(1)}% · check: ${checkPassed ? "true" : "false"}`;
  els.epochCount.textContent = learnedEpochs.toLocaleString();
  els.accuracy.textContent = `${evaluation.exact ? "" : "~"}${(evaluation.accuracy * 100).toFixed(1)}%`;
  els.loss.textContent = evaluation.loss.toFixed(4);
  els.progressLabel.textContent = learnedEpochs ? `${evaluation.exact ? "" : "~"}${(evaluation.accuracy * 100).toFixed(1)}% accurate` : "Not trained";
  renderArchitecture();
  drawNetwork(cache);
  drawLossGraph();
  renderExamples();
  return evaluation;
}

function setTrainingControls(isTraining) {
  els.train.disabled = isTraining;
  els.trainUntilPerfect.disabled = isTraining;
  els.keepTraining.disabled = isTraining;
  els.stopTraining.disabled = !isTraining;
  els.reset.disabled = isTraining;
  els.rate.disabled = isTraining;
  els.epochs.disabled = isTraining;
  els.addLayer.disabled = isTraining;
  els.checkEditor.disabled = isTraining;
  els.applyCheck.disabled = isTraining;
  els.resetCheck.disabled = isTraining;
  els.layerEditor.querySelectorAll("input, button").forEach((control) => { control.disabled = isTraining; });
}

function addLayer() {
  if (animationFrame !== null) return;
  hiddenSizes.push(Math.max(8, Math.floor(hiddenSizes.at(-1) / 2)));
  initializeNetwork();
  setTrainingControls(false);
  els.status.textContent = `Layer added · ${hiddenSizes.length} hidden layers`;
  render();
}

function deleteLayer(index) {
  if (animationFrame !== null || hiddenSizes.length <= 1) return;
  hiddenSizes.splice(index, 1);
  initializeNetwork();
  setTrainingControls(false);
  els.status.textContent = `Layer deleted · ${hiddenSizes.length} hidden layer${hiddenSizes.length === 1 ? "" : "s"}`;
  render();
}

function resetNetwork() {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  initializeNetwork();
  setTrainingControls(false);
  els.status.textContent = "Network ready";
  render();
}

function trainNetwork(fresh, continuous = false, untilPerfect = false) {
  if (animationFrame !== null) return;
  if (fresh) initializeNetwork();
  const requestedEpochs = Number(els.epochs.value);
  const rate = Number(els.rate.value);
  const desiredStepsPerFrame = Math.max(1, Math.ceil(requestedEpochs / 120));
  const safeStepsPerFrame = Math.max(1, Math.floor(4000000 / (trainableParameterCount() * MINI_BATCH)));
  const epochsPerFrame = Math.min(desiredStepsPerFrame, safeStepsPerFrame);
  let completed = 0;
  let frameCount = 0;
  let verificationIndex = null;
  setTrainingControls(true);

  function frame() {
    try {
    if (untilPerfect && verificationIndex !== null) {
      const verificationChunk = Math.max(1, Math.floor(12000000 / trainableParameterCount()));
      const end = Math.min(trainingSize(), verificationIndex + verificationChunk);
      for (; verificationIndex < end; verificationIndex += 1) {
        const output = forward(verificationIndex).output * 100;
        if (!isCorrect(verificationIndex, output)) {
          verificationIndex = null;
          els.status.textContent = "Full check found a miss · training resumed";
          animationFrame = requestAnimationFrame(frame);
          return;
        }
      }
      if (verificationIndex >= trainingSize()) {
        animationFrame = null;
        setTrainingControls(false);
        const evaluation = render();
        els.status.textContent = `Reached 100% · ${learnedEpochs.toLocaleString()} steps`;
        return;
      }
      els.status.textContent = `Verifying all inputs · ${Math.round(verificationIndex / trainingSize() * 100)}%`;
      animationFrame = requestAnimationFrame(frame);
      return;
    }

    const runsIndefinitely = continuous || untilPerfect;
    const batch = runsIndefinitely ? epochsPerFrame : Math.min(epochsPerFrame, requestedEpochs - completed);
    for (let epoch = 0; epoch < batch; epoch += 1) trainEpoch(rate);
    completed += batch;
    frameCount += 1;

    if (!runsIndefinitely || frameCount % 4 === 0) {
      const evaluation = evaluateNetwork();
      lossHistory.push(evaluation.loss);
      if (lossHistory.length > 300) lossHistory.shift();
      els.status.textContent = untilPerfect
        ? `Training until 100% · ${(evaluation.accuracy * 100).toFixed(1)}% accurate`
        : continuous
          ? `Training continuously · ${learnedEpochs.toLocaleString()} steps`
          : `Learning ${Math.min(100, Math.round(completed / requestedEpochs * 100))}%`;
      render();
      if (untilPerfect && evaluation.accuracy === 1) {
        if (evaluation.exact) {
          animationFrame = null;
          setTrainingControls(false);
          els.status.textContent = `Reached 100% · ${learnedEpochs.toLocaleString()} steps`;
          return;
        }
        verificationIndex = 0;
        els.status.textContent = "Sample reached 100% · verifying all inputs";
      }
    }

    if (runsIndefinitely || completed < requestedEpochs) {
      animationFrame = requestAnimationFrame(frame);
    } else {
      animationFrame = null;
      setTrainingControls(false);
      const evaluation = render();
      els.status.textContent = `Trained · ${(evaluation.accuracy * 100).toFixed(1)}% accurate`;
    }
    } catch (error) {
      animationFrame = null;
      setTrainingControls(false);
      els.status.textContent = `Training error · ${error.message}`;
    }
  }
  animationFrame = requestAnimationFrame(frame);
}

function stopTraining() {
  if (animationFrame === null) return;
  cancelAnimationFrame(animationFrame);
  animationFrame = null;
  setTrainingControls(false);
  const evaluation = render();
  els.status.textContent = `Stopped · ${learnedEpochs.toLocaleString()} steps · ${(evaluation.accuracy * 100).toFixed(1)}% accurate`;
}

function changeNumber(amount) {
  els.numberInput.value = String(Math.max(0, Math.min(trainingSize() - 1, selectedNumber() + amount)));
  render();
}

els.rate.addEventListener("input", () => { els.rateValue.value = Number(els.rate.value).toFixed(2); });
els.epochs.addEventListener("input", () => { els.epochsValue.value = els.epochs.value; });
els.train.addEventListener("click", () => trainNetwork(true, false));
els.trainUntilPerfect.addEventListener("click", () => trainNetwork(false, false, true));
els.keepTraining.addEventListener("click", () => trainNetwork(false, true));
els.stopTraining.addEventListener("click", stopTraining);
els.reset.addEventListener("click", resetNetwork);
els.addLayer.addEventListener("click", addLayer);
els.layerEditor.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-delete-layer]");
  if (button) deleteLayer(Number(button.dataset.deleteLayer));
});
els.layerEditor.addEventListener("change", (event) => {
  const inputLayer = event.target.closest("input[data-input-size]");
  if (inputLayer && animationFrame === null) {
    const size = Number.parseInt(inputLayer.value, 10);
    if (!Number.isFinite(size) || size < 1) {
      inputLayer.value = String(inputSize);
      return;
    }
    try {
      if (size > 20) throw new Error("binary training is limited to 20 bits");
      const targets = deriveTrainingTargetsForSize(customCheck, 2 ** size);
      inputSize = size;
      trainingTargets = targets;
      initializeNetwork();
      setTrainingControls(false);
      els.status.textContent = `Binary input resized · ${size.toLocaleString()} bits`;
      render();
    } catch (error) {
      inputLayer.value = String(inputSize);
      els.status.textContent = `Could not resize input layer · ${error.message}`;
    }
    return;
  }
  const input = event.target.closest("input[data-layer-size]");
  if (!input || animationFrame !== null) return;
  const size = Number.parseInt(input.value, 10);
  if (!Number.isFinite(size) || size < 1) {
    input.value = String(hiddenSizes[Number(input.dataset.layerSize)]);
    return;
  }
  const layer = Number(input.dataset.layerSize);
  hiddenSizes[layer] = size;
  initializeNetwork();
  setTrainingControls(false);
  els.status.textContent = `Layer ${layer + 1} resized · ${size.toLocaleString()} neurons`;
  render();
});
els.numberInput.addEventListener("input", render);
els.decrease.addEventListener("click", () => changeNumber(-1));
els.increase.addEventListener("click", () => changeNumber(1));
els.applyCheck.addEventListener("click", () => applyCustomCheck(true));
els.resetCheck.addEventListener("click", () => {
  els.checkEditor.value = DEFAULT_CHECK_SOURCE;
  localStorage.removeItem("modulo3-check-percent");
  applyCustomCheck(false);
  els.checkStatus.textContent = "Default check active";
});

initializeNetwork();
els.checkEditor.value = localStorage.getItem("modulo3-check-percent") || DEFAULT_CHECK_SOURCE;
applyCustomCheck(false);

// Independent 0-9 drawing classifier: 256 pixels -> 48 sigmoid neurons -> 10 outputs.
const DIGIT_SIDE = 16;
const DIGIT_INPUTS = DIGIT_SIDE * DIGIT_SIDE;
const DIGIT_HIDDEN = 48;
const digitCanvas = document.querySelector("#digitCanvas");
const digitContext = digitCanvas.getContext("2d", { willReadFrequently: true });
const digitTrainingStatus = document.querySelector("#digitTrainingStatus");
const digitPrediction = document.querySelector("#digitPrediction");
const digitConfidence = document.querySelector("#digitConfidence");
const digitScores = document.querySelector("#digitScores");
const clearDigitButton = document.querySelector("#clearDigit");
const trainDigitButton = document.querySelector("#trainDigit");
const addDigitSampleButton = document.querySelector("#addDigitSample");
const digitLabel = document.querySelector("#digitLabel");
const digitSampleCount = document.querySelector("#digitSampleCount");
const digitSampleCanvas = document.createElement("canvas");
const digitSampleContext = digitSampleCanvas.getContext("2d", { willReadFrequently: true });
const digitDownsampleCanvas = document.createElement("canvas");
const digitDownsampleContext = digitDownsampleCanvas.getContext("2d", { willReadFrequently: true });

digitSampleCanvas.width = 64;
digitSampleCanvas.height = 64;
digitDownsampleCanvas.width = DIGIT_SIDE;
digitDownsampleCanvas.height = DIGIT_SIDE;

let digitRandomState = 731942;
let digitInputWeights;
let digitHiddenBiases;
let digitOutputWeights;
let digitOutputBiases;
let digitDataset = [];
let userDigitSamples = 0;
let userDigitDataset = [];
let digitTrainingFrame = null;
let digitSteps = 0;
let isDrawingDigit = false;

function digitRandom() {
  digitRandomState = (1664525 * digitRandomState + 1013904223) >>> 0;
  return digitRandomState / 4294967296;
}

function initializeDigitNetwork() {
  digitRandomState = 731942;
  digitInputWeights = Array.from({ length: DIGIT_INPUTS }, () =>
    Array.from({ length: DIGIT_HIDDEN }, () => (digitRandom() * 2 - 1) * 0.12)
  );
  digitHiddenBiases = Array(DIGIT_HIDDEN).fill(0);
  digitOutputWeights = Array.from({ length: DIGIT_HIDDEN }, () =>
    Array.from({ length: 10 }, () => (digitRandom() * 2 - 1) * 0.22)
  );
  digitOutputBiases = Array(10).fill(0);
  digitSteps = 0;
}

function digitPixelsFromCanvas(source) {
  digitDownsampleContext.fillStyle = "white";
  digitDownsampleContext.fillRect(0, 0, DIGIT_SIDE, DIGIT_SIDE);
  digitDownsampleContext.drawImage(source, 0, 0, DIGIT_SIDE, DIGIT_SIDE);
  const data = digitDownsampleContext.getImageData(0, 0, DIGIT_SIDE, DIGIT_SIDE).data;
  return centerDigitInput(Array.from({ length: DIGIT_INPUTS }, (_, index) => 1 - data[index * 4] / 255));
}

function centerDigitInput(input) {
  let mass = 0;
  let weightedX = 0;
  let weightedY = 0;
  for (let index = 0; index < input.length; index += 1) {
    const value = input[index];
    mass += value;
    weightedX += (index % DIGIT_SIDE) * value;
    weightedY += Math.floor(index / DIGIT_SIDE) * value;
  }
  if (mass < 0.01) return input;
  const shiftX = Math.round((DIGIT_SIDE - 1) / 2 - weightedX / mass);
  const shiftY = Math.round((DIGIT_SIDE - 1) / 2 - weightedY / mass);
  const centered = Array(DIGIT_INPUTS).fill(0);
  for (let y = 0; y < DIGIT_SIDE; y += 1) {
    for (let x = 0; x < DIGIT_SIDE; x += 1) {
      const destinationX = x + shiftX;
      const destinationY = y + shiftY;
      if (destinationX >= 0 && destinationX < DIGIT_SIDE && destinationY >= 0 && destinationY < DIGIT_SIDE) {
        centered[destinationY * DIGIT_SIDE + destinationX] = input[y * DIGIT_SIDE + x];
      }
    }
  }
  return centered;
}

function makeDigitSample(label) {
  const fonts = ["Helvetica", "Arial Rounded MT Bold", "Avenir Next", "Chalkboard", "Marker Felt"];
  const ctx = digitSampleContext;
  ctx.save();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 64, 64);
  ctx.translate(32 + (digitRandom() - 0.5) * 9, 33 + (digitRandom() - 0.5) * 8);
  ctx.rotate((digitRandom() - 0.5) * 0.3);
  ctx.scale(0.8 + digitRandom() * 0.28, 0.82 + digitRandom() * 0.25);
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${38 + Math.floor(digitRandom() * 17)}px ${fonts[Math.floor(digitRandom() * fonts.length)]}`;
  ctx.fillText(String(label), 0, 0);
  ctx.restore();
  return digitPixelsFromCanvas(digitSampleCanvas);
}

function buildDigitDataset() {
  digitDataset = [];
  for (let label = 0; label < 10; label += 1) {
    for (let sample = 0; sample < 25; sample += 1) {
      digitDataset.push({ input: makeDigitSample(label), label });
    }
  }
}

function digitForward(input) {
  const activePixels = [];
  for (let pixel = 0; pixel < DIGIT_INPUTS; pixel += 1) {
    if (input[pixel] > 0.01) activePixels.push(pixel);
  }
  const hidden = new Array(DIGIT_HIDDEN);
  for (let neuron = 0; neuron < DIGIT_HIDDEN; neuron += 1) {
    let sum = digitHiddenBiases[neuron];
    for (const pixel of activePixels) sum += input[pixel] * digitInputWeights[pixel][neuron];
    hidden[neuron] = sigmoid(sum);
  }
  const logits = new Array(10);
  for (let output = 0; output < 10; output += 1) {
    let sum = digitOutputBiases[output];
    for (let neuron = 0; neuron < DIGIT_HIDDEN; neuron += 1) sum += hidden[neuron] * digitOutputWeights[neuron][output];
    logits[output] = sum;
  }
  const maximum = Math.max(...logits);
  const exponents = logits.map((value) => Math.exp(value - maximum));
  const total = exponents.reduce((sum, value) => sum + value, 0);
  return { hidden, probabilities: exponents.map((value) => value / total) };
}

function trainDigitStep(rate = 0.08) {
  const sample = digitDataset[Math.floor(digitRandom() * digitDataset.length)];
  const cache = digitForward(sample.input);
  const outputDeltas = cache.probabilities.slice();
  outputDeltas[sample.label] -= 1;
  const hiddenDeltas = new Array(DIGIT_HIDDEN);

  for (let neuron = 0; neuron < DIGIT_HIDDEN; neuron += 1) {
    let propagated = 0;
    for (let output = 0; output < 10; output += 1) propagated += digitOutputWeights[neuron][output] * outputDeltas[output];
    hiddenDeltas[neuron] = propagated * cache.hidden[neuron] * (1 - cache.hidden[neuron]);
  }
  for (let neuron = 0; neuron < DIGIT_HIDDEN; neuron += 1) {
    for (let output = 0; output < 10; output += 1) {
      digitOutputWeights[neuron][output] -= rate * outputDeltas[output] * cache.hidden[neuron];
    }
  }
  for (let output = 0; output < 10; output += 1) digitOutputBiases[output] -= rate * outputDeltas[output];
  for (let pixel = 0; pixel < DIGIT_INPUTS; pixel += 1) {
    if (sample.input[pixel] === 0) continue;
    for (let neuron = 0; neuron < DIGIT_HIDDEN; neuron += 1) {
      digitInputWeights[pixel][neuron] -= rate * hiddenDeltas[neuron] * sample.input[pixel];
    }
  }
  for (let neuron = 0; neuron < DIGIT_HIDDEN; neuron += 1) digitHiddenBiases[neuron] -= rate * hiddenDeltas[neuron];
  digitSteps += 1;
}

function digitTrainingAccuracy() {
  let correct = 0;
  for (let index = 0; index < digitDataset.length; index += 9) {
    const probabilities = digitForward(digitDataset[index].input).probabilities;
    const prediction = probabilities.indexOf(Math.max(...probabilities));
    if (prediction === digitDataset[index].label) correct += 1;
  }
  return correct / Math.ceil(digitDataset.length / 9);
}

function renderDigitPrediction() {
  const input = digitPixelsFromCanvas(digitCanvas);
  const ink = input.reduce((sum, value) => sum + value, 0);
  if (ink < 1.5) {
    digitPrediction.textContent = "?";
    digitConfidence.textContent = "Draw one digit";
    digitScores.innerHTML = Array.from({ length: 10 }, (_, digit) => `
      <div class="digit-score"><span>${digit}</span><div class="digit-score-track"><div class="digit-score-fill" style="width:0%"></div></div><output>0%</output></div>
    `).join("");
    return;
  }
  const probabilities = digitForward(input).probabilities;
  const best = probabilities.indexOf(Math.max(...probabilities));
  digitPrediction.textContent = String(best);
  digitConfidence.textContent = `${Math.round(probabilities[best] * 100)}% confidence`;
  digitScores.innerHTML = probabilities.map((probability, digit) => `
    <div class="digit-score"><span>${digit}</span><div class="digit-score-track"><div class="digit-score-fill" style="width:${probability * 100}%"></div></div><output>${Math.round(probability * 100)}%</output></div>
  `).join("");
}

function trainDigitAI(additionalSteps = 3000) {
  if (digitTrainingFrame !== null || digitDataset.length === 0) return;
  const target = digitSteps + additionalSteps;
  trainDigitButton.disabled = true;
  function frame() {
    for (let step = 0; step < 20 && digitSteps < target; step += 1) trainDigitStep();
    digitTrainingStatus.textContent = `Training locally · ${digitSteps.toLocaleString()} steps`;
    if (digitSteps < target) {
      digitTrainingFrame = setTimeout(frame, 8);
    } else {
      digitTrainingFrame = null;
      trainDigitButton.disabled = false;
      const accuracy = digitTrainingAccuracy();
      digitTrainingStatus.textContent = `Ready · ${(accuracy * 100).toFixed(1)}% sample accuracy`;
      renderDigitPrediction();
    }
  }
  digitTrainingFrame = setTimeout(frame, 0);
}

function clearDigitCanvas() {
  digitContext.fillStyle = "white";
  digitContext.fillRect(0, 0, digitCanvas.width, digitCanvas.height);
  renderDigitPrediction();
}

function addUserDigitSample() {
  const input = digitPixelsFromCanvas(digitCanvas);
  const ink = input.reduce((sum, value) => sum + value, 0);
  if (ink < 1.5) {
    digitTrainingStatus.textContent = "Draw a digit before adding a sample";
    return;
  }
  const label = Number(digitLabel.value);
  const sample = { input: input.slice(), label };
  digitDataset.push(sample);
  userDigitDataset.push(sample);
  userDigitSamples += 1;
  digitSampleCount.textContent = `${userDigitSamples} user sample${userDigitSamples === 1 ? "" : "s"}`;
  digitTrainingStatus.textContent = `Added drawing as ${label} · train to learn it`;
  trainDigitButton.disabled = false;
  clearDigitCanvas();
}

function digitPoint(event) {
  const rect = digitCanvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * digitCanvas.width / rect.width,
    y: (event.clientY - rect.top) * digitCanvas.height / rect.height
  };
}

digitCanvas.addEventListener("pointerdown", (event) => {
  isDrawingDigit = true;
  digitCanvas.setPointerCapture(event.pointerId);
  const point = digitPoint(event);
  digitContext.beginPath();
  digitContext.moveTo(point.x, point.y);
});
digitCanvas.addEventListener("pointermove", (event) => {
  if (!isDrawingDigit) return;
  const point = digitPoint(event);
  digitContext.strokeStyle = "black";
  digitContext.lineWidth = 22;
  digitContext.lineCap = "round";
  digitContext.lineJoin = "round";
  digitContext.lineTo(point.x, point.y);
  digitContext.stroke();
  renderDigitPrediction();
});
digitCanvas.addEventListener("pointerup", () => { isDrawingDigit = false; renderDigitPrediction(); });
digitCanvas.addEventListener("pointercancel", () => { isDrawingDigit = false; });
clearDigitButton.addEventListener("click", clearDigitCanvas);
trainDigitButton.addEventListener("click", () => trainDigitAI(8000));
addDigitSampleButton.addEventListener("click", addUserDigitSample);

initializeDigitNetwork();
clearDigitCanvas();
if (Array.isArray(window.IMPORTED_DIGIT_SAMPLES)) {
  digitDataset = window.IMPORTED_DIGIT_SAMPLES.map((sample) => ({
    label: Number(sample.label),
    input: centerDigitInput(sample.input.slice())
  }));
  userDigitDataset = digitDataset.slice();
  userDigitSamples = digitDataset.length;
  digitSampleCount.textContent = `${userDigitSamples} imported user samples`;
  digitTrainingStatus.textContent = `${userDigitSamples} MNIST user samples ready · press Train Digit AI`;
  trainDigitButton.disabled = digitDataset.length === 0;
} else {
  digitTrainingStatus.textContent = "Add user samples to begin";
}
