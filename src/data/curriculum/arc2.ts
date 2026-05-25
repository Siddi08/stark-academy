import type { Module } from '@/types'

function makeStub(id: string, number: number, title: string, prereq?: string): Module {
  return {
    id, number, title, arc: 2,
    description: `Module ${number}: ${title} — content coming soon.`,
    prerequisiteModuleId: prereq,
    lessons: [{
      id: `${number}-1`, number: `${number}.1`,
      title: `${title} — Introduction`, duration: 10,
      content: `# ${title}\n\nThis lesson is being prepared.`,
      keyTerms: [],
    }],
    quizzes: [],
    project: {
      id: `p${number}`, moduleId: id, name: `Module ${number} Project`,
      emoji: '🔧', description: 'Coming soon.',
      tools: [], status: 'not_started', rubric: [], xpReward: 100,
    },
  }
}

// ─── MODULE 7 ─────────────────────────────────────────────────────────────────
const m7: Module = {
  id: 'm7', number: 7, arc: 2,
  title: 'Neural Networks Fundamentals',
  description: 'Build a complete mental model of how neural networks learn — from the single perceptron to deep multi-layer networks, forward passes, and the mathematics of universal approximation.',
  prerequisiteModuleId: 'm6',
  lessons: [
    {
      id: '7-1', number: '7.1',
      title: 'The Perceptron and Biological Inspiration',
      duration: 13,
      content: `# The Perceptron and Biological Inspiration

Every neural network — no matter how large — descends from a single idea proposed in 1958 by Frank Rosenblatt: the **perceptron**. Understanding it gives you the conceptual DNA of every model from LeNet to Claude.

## From Neuron to Perceptron

A biological neuron receives electrical signals from dendrites, sums them, and fires if the total exceeds a threshold. Rosenblatt's artificial perceptron mirrors this:

\`\`\`
Inputs:   x₁, x₂, ..., xₙ
Weights:  w₁, w₂, ..., wₙ
Bias:     b

Weighted sum:  z = w₁x₁ + w₂x₂ + ... + wₙxₙ + b = wᵀx + b
Output:        ŷ = step(z)   [1 if z ≥ 0, else 0]
\`\`\`

The **weights** encode learned importance — a large positive weight means "this input strongly supports this output". A large negative weight means "this input suppresses this output". The **bias** shifts the decision boundary regardless of input.

## The Learning Rule

The perceptron learning algorithm:
\`\`\`
For each training example (x, y):
    ŷ = predict(x)
    if ŷ ≠ y:
        w ← w + α(y - ŷ)x
        b ← b + α(y - ŷ)
\`\`\`

This adjusts weights in the direction of the error. If the network predicted 0 but the answer was 1, weights increase for active inputs. This is the conceptual ancestor of gradient descent.

## The XOR Problem — and Why One Layer Is Not Enough

In 1969, Minsky and Papert proved that a single perceptron cannot learn XOR:

| x₁ | x₂ | XOR |
|----|----|-----|
| 0  | 0  | 0   |
| 0  | 1  | 1   |
| 1  | 0  | 1   |
| 1  | 1  | 0   |

XOR is not linearly separable — no single straight line divides the 0s from the 1s. This limitation killed most neural network research for over a decade (the "AI winter").

The solution, discovered in the 1980s: **multiple layers**. Add a hidden layer and the network can compose linear transformations into nonlinear ones — drawing curved, complex decision boundaries. This is the key insight that launched modern deep learning.

## The Universal Approximation Theorem

A neural network with:
- One hidden layer
- A nonlinear activation function
- Enough hidden neurons

...can approximate **any continuous function to arbitrary precision**.

This is remarkable. A sufficiently wide, two-layer network could theoretically model weather, human preferences, protein folding, or language — given enough neurons and data. In practice, **depth** (more layers) is far more efficient than **width** (more neurons per layer) for most real-world functions. A deep network can represent exponentially more functions with the same parameter count.

## From McCulloch-Pitts to Claude

The path from the 1943 McCulloch-Pitts neuron to Claude is a straight line of increasing complexity:

| Year | Milestone |
|------|-----------|
| 1943 | McCulloch-Pitts neuron — binary logic gate |
| 1958 | Rosenblatt perceptron — learned weights |
| 1986 | Multi-layer backprop — Rumelhart et al. |
| 1998 | LeNet — first successful CNN for digit recognition |
| 2012 | AlexNet — deep CNNs dominate ImageNet |
| 2017 | Transformer — attention replaces recurrence |
| 2022 | ChatGPT — RLHF-tuned Transformer at scale |
| 2024 | Claude 3+ — constitutional AI, multi-modal |

Each step adds layers, scale, better optimisers, better regularisation, or a new architecture. But the perceptron's core — weighted sum, nonlinearity, gradient-based learning — never changed.

## Modern Notation

In modern frameworks, the perceptron is called a **linear layer** or **dense layer**:
\`\`\`python
import torch.nn as nn

# This is 64 perceptrons operating in parallel on 32-dim input
layer = nn.Linear(in_features=32, out_features=64)
# Internally: output = input @ weight.T + bias
# weight shape: (64, 32) — 64 weight vectors of length 32
# bias shape: (64,) — one bias per perceptron
\`\`\`

A "64-neuron hidden layer" is literally 64 perceptrons, each learning a different linear combination of the 32 inputs.`,
      keyTerms: [
        { term: 'Perceptron', definition: 'The simplest neural network unit: computes a weighted sum of inputs, adds a bias, and passes through an activation function.' },
        { term: 'Weights', definition: 'Learnable parameters in a neural network encoding the importance of each input. Updated by gradient descent during training.' },
        { term: 'Bias', definition: 'A learnable offset added to the weighted sum, allowing the activation threshold to be shifted independently of inputs.' },
        { term: 'Universal Approximation Theorem', definition: 'A single hidden layer with sufficient neurons can approximate any continuous function. Theoretical foundation for neural network expressiveness.' },
        { term: 'Linear Separability', definition: 'The property of a classification problem where a hyperplane can separate all examples by class. Single-layer networks can only solve linearly separable problems.' },
      ],
    },
    {
      id: '7-2', number: '7.2',
      title: 'Activation Functions and Network Architecture',
      duration: 14,
      content: `# Activation Functions and Network Architecture

The activation function is what makes neural networks powerful. Without it, stacking linear layers produces only a linear function — a waste of depth. The activation function introduces nonlinearity at each neuron, enabling the rich hierarchical representations that make deep learning work.

## Why Nonlinearity Is Essential

Consider stacking two linear layers:
\`\`\`
y = W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂) = Wx + b
\`\`\`

Two linear layers collapse to one. No matter how many linear layers you stack, you still have a linear function — equivalent to a single perceptron. Nonlinear activations break this collapse, letting each layer learn genuinely new transformations.

## The Activation Function Zoo

### Sigmoid
\`\`\`
σ(x) = 1/(1 + e⁻ˣ)   output ∈ (0, 1)
\`\`\`
Historically common for binary classification outputs. Problems in deep networks:
- **Saturation:** gradients vanish for large |x|
- **Not zero-centred:** all outputs positive, causing zig-zag gradient updates
- **Computationally expensive:** requires exponential

### Tanh
\`\`\`
tanh(x) = (eˣ - e⁻ˣ)/(eˣ + e⁻ˣ)   output ∈ (-1, 1)
\`\`\`
Zero-centred (fixes one sigmoid flaw). Still saturates — same vanishing gradient problem. Used in LSTMs.

### ReLU (Rectified Linear Unit) ★
\`\`\`
ReLU(x) = max(0, x)
\`\`\`
The dominant activation since 2012 (AlexNet). Properties:
- **Non-saturating** for positive inputs: gradient always 1
- **Computationally trivial:** just a comparison
- **Sparse activation:** ~50% of neurons output 0, acting as natural regularisation
- Problem: **Dying ReLU** — neurons stuck at 0 if they never receive positive input

### Leaky ReLU / PReLU
\`\`\`
LeakyReLU(x) = max(0.01x, x)
\`\`\`
Fixes dying ReLU by allowing a small negative slope. PReLU makes the slope learnable.

### GELU (Gaussian Error Linear Unit)
\`\`\`
GELU(x) ≈ 0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))
\`\`\`
The activation function used in **BERT, GPT, and Claude**. Smoother than ReLU, probabilistic interpretation (gates inputs based on their magnitude stochastically). Empirically outperforms ReLU on language tasks.

### SiLU / Swish
\`\`\`
SiLU(x) = x · σ(x)
\`\`\`
Used in many modern architectures including LLaMA. Self-gated: the input controls how much of itself passes through.

## Network Architecture Terminology

\`\`\`
Input Layer → Hidden Layer(s) → Output Layer
\`\`\`

| Term | Meaning |
|------|---------|
| **Depth** | Number of layers (excluding input) |
| **Width** | Number of neurons per layer |
| **Parameters** | Total learnable weights + biases |
| **Capacity** | How complex a function the network can represent |
| **Hidden layer** | Any layer between input and output |

**Parameter count example:**
\`\`\`
Input: 784 (28×28 image)
Hidden 1: 512 neurons  → 784×512 + 512 = 401,920 params
Hidden 2: 256 neurons  → 512×256 + 256 = 131,328 params
Output: 10 neurons     → 256×10  + 10  = 2,570 params
Total: ~535,818 parameters
\`\`\`

Claude 3 Sonnet has ~70 billion parameters — roughly 130,000× more.

## Dropout — Regularisation by Noise

During training, **dropout** randomly sets a fraction (typically 0.1–0.5) of neuron outputs to zero:
\`\`\`python
# With dropout_p=0.5, each neuron is zeroed with 50% probability
self.dropout = nn.Dropout(p=0.5)
x = self.dropout(x)   # only during training; disabled at inference
\`\`\`

Effect: forces the network to learn redundant representations — no single neuron can be relied upon. Acts as training an ensemble of 2ⁿ different sub-networks.

Prevents **overfitting**: memorising training data rather than learning generalisable patterns. Large LLMs use lower dropout rates (0.0–0.1) since massive scale already provides regularisation via diversity of training data.

## Batch Normalisation and Layer Normalisation

After activation, feature distributions can drift across layers — activations grow or shrink, destabilising training.

**Batch Normalisation (BatchNorm):** normalises across the batch dimension. Effective for CNNs and fixed-batch-size training.

**Layer Normalisation (LayerNorm):** normalises across the feature dimension for each example independently:
\`\`\`
LN(x) = (x - μ) / (σ + ε) · γ + β
\`\`\`
Where μ, σ are per-example statistics, and γ, β are learned scale/shift parameters.

**LayerNorm is used in every Transformer** (including Claude). It stabilises training by ensuring each layer's output has consistent scale, regardless of batch size — critical for variable-length text sequences.`,
      keyTerms: [
        { term: 'GELU', definition: 'Gaussian Error Linear Unit. Activation function used in BERT, GPT, and Claude. Smoother than ReLU, empirically superior on language tasks.' },
        { term: 'ReLU', definition: 'Rectified Linear Unit: max(0,x). Default activation for most non-Transformer networks. Non-saturating, computationally trivial.' },
        { term: 'Dropout', definition: 'Regularisation technique randomly zeroing neuron outputs during training. Prevents overfitting by forcing redundant representations.' },
        { term: 'Layer Normalisation', definition: 'Normalises activations across the feature dimension per example. Used in every Transformer block for training stability.' },
        { term: 'Depth vs Width', definition: 'Deep networks (more layers) are more parameter-efficient than wide networks (more neurons per layer) for most real-world functions.' },
      ],
    },
    {
      id: '7-3', number: '7.3',
      title: 'The Forward Pass — From Input to Prediction',
      duration: 13,
      content: `# The Forward Pass — From Input to Prediction

The **forward pass** is the computation that takes raw input and produces a prediction. Understanding it precisely — as a sequence of matrix operations — is essential for reading model architectures, debugging shape errors, and reasoning about what computation Claude is performing for every token it generates.

## Step-by-Step Forward Pass

Consider a 3-layer network for classifying 10 digits from 28×28 images:

**Step 1 — Flatten input:**
\`\`\`
x: (28, 28) → flatten → x: (784,)
\`\`\`

**Step 2 — First linear layer:**
\`\`\`
z₁ = W₁x + b₁
   = (512, 784) @ (784,) + (512,)
   = (512,)
\`\`\`

**Step 3 — Activation:**
\`\`\`
a₁ = ReLU(z₁)     shape: (512,)
\`\`\`

**Step 4 — Second linear layer:**
\`\`\`
z₂ = W₂a₁ + b₂
   = (256, 512) @ (512,) + (256,)
   = (256,)
\`\`\`

**Step 5 — Activation:**
\`\`\`
a₂ = ReLU(z₂)     shape: (256,)
\`\`\`

**Step 6 — Output layer:**
\`\`\`
z₃ = W₃a₂ + b₃
   = (10, 256) @ (256,) + (10,)
   = (10,)          ← 10 logits, one per digit class
\`\`\`

**Step 7 — Softmax (for probabilities):**
\`\`\`
ŷ = softmax(z₃)    shape: (10,)   each value ∈ (0,1), sum = 1
\`\`\`

The argmax of ŷ is the predicted digit class.

## Batched Forward Pass

In practice, inputs are processed in batches for efficiency. All shapes gain a batch dimension B:

\`\`\`
Input batch:   (B, 784)
After W₁:      (B, 512)
After ReLU:    (B, 512)
After W₂:      (B, 256)
After ReLU:    (B, 256)
After W₃:      (B, 10)
After softmax: (B, 10)
\`\`\`

This is why GPUs are so efficient — they perform all B examples simultaneously with the same weight matrices, exploiting massive parallelism.

## The Forward Pass for Language Models

For an LLM, the "input" is a sequence of token IDs. The forward pass is more complex but follows the same structure:

\`\`\`
Token IDs:     [412, 8901, 203, ...]     shape: (B, T)
Embeddings:    lookup table → (B, T, d_model)
Transformer:   N blocks of attention + FFN → (B, T, d_model)
Unembedding:   linear projection → (B, T, vocab_size)
Softmax:       → (B, T, vocab_size)   probabilities over all tokens
\`\`\`

At inference, only the **last token position** matters — it contains the prediction for the next token. This is why language model inference is sequential: the output at step t becomes an input at step t+1.

## Tensor Shape Debugging

Shape mismatches are the most common source of errors in deep learning code:

\`\`\`python
import torch

x = torch.randn(32, 784)      # batch of 32 images
W = torch.randn(512, 784)     # weight matrix
b = torch.randn(512)          # bias

# Correct: (512, 784) @ (784, 32) + (512,) = (512, 32)
# But we want (32, 512)! Need transpose:
z = x @ W.T + b               # (32, 784) @ (784, 512) = (32, 512) ✓
\`\`\`

When reading papers or code, always track tensor shapes. A shape of \`(B, T, H, D)\` means batch × sequence length × heads × head dimension — a pattern you will see constantly in Transformer code.

## Inference vs Training

| Aspect | Training | Inference |
|--------|---------|-----------|
| Dropout | Active (neurons zeroed) | Disabled (model.eval()) |
| BatchNorm | Uses batch statistics | Uses running statistics |
| Gradients | Computed (memory intensive) | Not computed (torch.no_grad()) |
| Precision | Usually FP32 or BF16 | Often FP16 or INT8 (quantised) |

\`\`\`python
# Inference mode — no gradient tracking, faster and less memory
model.eval()
with torch.no_grad():
    output = model(input)
\`\`\`

The Anthropic API performs millions of these inference forward passes per day — each one converting your prompt tokens to logits, sampling from the distribution, and returning the sampled token. The fact that this happens in milliseconds is a triumph of hardware, software optimisation, and careful engineering.`,
      keyTerms: [
        { term: 'Forward Pass', definition: 'The computation transforming input to output through a neural network. Produces predictions; gradients are computed during the backward pass.' },
        { term: 'Logits', definition: 'Raw, unnormalised scores output by the final linear layer. Passed through softmax to produce probabilities.' },
        { term: 'Batch Dimension', definition: 'The first tensor dimension representing multiple examples processed in parallel. Enables GPU efficiency through batched matrix operations.' },
        { term: 'model.eval()', definition: 'PyTorch method switching model to inference mode: disables dropout, uses running stats for BatchNorm, prevents gradient computation.' },
        { term: 'Unembedding', definition: 'The final linear projection in an LLM mapping hidden states back to vocabulary logits. Also called the language model head.' },
      ],
    },
    {
      id: '7-4', number: '7.4',
      title: 'Convolutional Networks and Representation Learning',
      duration: 14,
      content: `# Convolutional Networks and Representation Learning

Before Transformers dominated AI, **Convolutional Neural Networks (CNNs)** were the architecture that proved deep learning worked. Understanding CNNs teaches the principle of **inductive biases** — building structural assumptions into architecture that match the problem's geometry. This principle directly explains many Transformer design choices.

## The Problem with Dense Layers for Images

A 224×224 colour image has 224×224×3 = 150,528 inputs. A single hidden layer with 1,000 neurons would require 150,528,000 weights — just for one layer. Worse, this approach ignores the structure of images: nearby pixels are more related than distant ones, and the same pattern (an edge, a curve) is meaningful regardless of where it appears.

Dense layers have no notion of spatial structure. CNNs exploit it explicitly.

## Convolution — The Key Operation

A **convolutional layer** applies a small **filter** (or kernel) across the input by sliding it across all positions:

\`\`\`
Input image:  (H, W, C)     e.g. (224, 224, 3)
Filter:       (k, k, C, F)  e.g. (3, 3, 3, 64)  ← 64 filters of size 3×3

At each position: element-wise multiply + sum → one output value
Output:       (H', W', F)   e.g. (222, 222, 64)
\`\`\`

The key properties:
- **Parameter sharing:** the same filter is applied at every spatial position → far fewer parameters
- **Translation equivariance:** a pattern detected at (x,y) is detected at (x+1,y) with the same filter
- **Local connectivity:** each output neuron only "sees" a local region of the input (receptive field)

These are exactly the **inductive biases** that match image structure.

## What Filters Learn

In early layers, CNNs learn low-level features: edges, corners, colour gradients. Deeper layers combine these into textures, then object parts, then full objects. This hierarchical composition mirrors how human vision works.

\`\`\`
Layer 1: edges (horizontal, vertical, diagonal)
Layer 2: corners, junctions, colour boundaries
Layer 3: textures, patterns
Layer 4: object parts (eyes, wheels, handles)
Layer 5: whole objects (faces, cars)
\`\`\`

**This hierarchy is the key insight:** deep networks learn hierarchical representations. Each layer transforms the input into a more abstract, task-relevant description. The same principle applies to Transformer layers — early layers handle syntax and local patterns, later layers encode semantics and long-range dependencies.

## Pooling — Achieving Spatial Invariance

Max pooling subsamples the feature map by taking the maximum value in each local region:
\`\`\`
2×2 max pool: [[1,3],[2,4]] → 4
\`\`\`

This reduces spatial resolution, compresses representation, and achieves **translation invariance**: a feature detected slightly off-centre still activates the same pooled output.

## AlexNet — The Inflection Point (2012)

In 2012, AlexNet won ImageNet with a 15.3% error rate versus 26.2% for the runner-up — a margin that shocked the computer vision community. Key innovations:
- **Deep architecture** (8 layers, 60M parameters)
- **ReLU** instead of sigmoid/tanh
- **Dropout** for regularisation
- **GPU training** (two NVIDIA GTX 580s)

This single result triggered the modern deep learning era. Every major tech company pivoted to neural networks within two years.

## Representation Learning — The Unifying Idea

The deeper lesson of CNNs is **representation learning**: rather than hand-engineering features (as in classical ML), neural networks learn useful representations directly from data. The hidden layers are not just computation — they are a learned vocabulary of features.

This principle scales to language:
- **Word embeddings** (Word2Vec, 2013): learn word representations from co-occurrence statistics
- **BERT embeddings** (2018): contextual representations — "bank" means different things in different sentences
- **Claude's residual stream**: at each token position, the model maintains a high-dimensional vector that accumulates information as it flows through layers

When you retrieve a vector embedding from the Anthropic API (\`model="text-embedding-3-small"\`), you are extracting this learned representation — the model's internal "understanding" of the input text, encoded as a point in high-dimensional space.

## Transfer Learning — Standing on Shoulders

A CNN pre-trained on ImageNet (1.2M images, 1,000 classes) has learned remarkably general visual features. **Fine-tuning** it on a new task (medical imaging, satellite photos) with far less data often outperforms training from scratch:

\`\`\`python
model = torchvision.models.resnet50(pretrained=True)
# Freeze early layers (general features)
for param in model.parameters():
    param.requires_grad = False
# Replace final layer for new task
model.fc = nn.Linear(2048, num_classes)
# Only train the new head
\`\`\`

This is conceptually identical to how Claude was trained: **pre-training** learns general language representations; **fine-tuning** (SFT + RLHF) adapts them for helpfulness and safety. The principle works because learned representations are genuinely general — understanding edges transfers across images just as understanding grammar transfers across tasks.`,
      keyTerms: [
        { term: 'Convolutional Layer', definition: 'A layer applying learned filters across input spatial positions. Exploits translation equivariance and local connectivity for efficient feature detection.' },
        { term: 'Inductive Bias', definition: 'Structural assumptions built into an architecture matching the problem\'s geometry. CNNs bake in spatial locality; Transformers bake in pairwise attention.' },
        { term: 'Representation Learning', definition: 'Learning useful feature representations directly from data rather than hand-engineering them. The unifying principle of deep learning.' },
        { term: 'Transfer Learning', definition: 'Reusing representations learned on one task for another. Pre-training then fine-tuning is the dominant paradigm in both vision and NLP.' },
        { term: 'Hierarchical Representation', definition: 'The property of deep networks where early layers encode simple features (edges) and later layers encode complex ones (objects, semantics).' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q7-1', title: 'Quiz 7.1 — The Perceptron',
      type: 'lesson', moduleId: 'm7', passMark: 70,
      questions: [
        {
          id: 'q7-1-1', type: 'multiple_choice',
          question: 'Why can a single perceptron NOT learn the XOR function?',
          options: [
            'XOR requires too many parameters',
            'XOR is not linearly separable — no single line can separate its 0 and 1 outputs',
            'XOR involves negative numbers which perceptrons cannot handle',
            'The perceptron learning rule does not support binary inputs',
          ],
          correctAnswer: 'XOR is not linearly separable — no single line can separate its 0 and 1 outputs',
          gradingRubric: 'Award full marks for the second option. XOR outputs 1 for (0,1) and (1,0) but 0 for (0,0) and (1,1) — these cannot be separated by any hyperplane.',
          xpValue: 10,
        },
        {
          id: 'q7-1-2', type: 'short_answer',
          question: 'What does the Universal Approximation Theorem state, and why is it important for AI?',
          correctAnswer: 'A single hidden layer with enough neurons can approximate any continuous function to arbitrary precision',
          gradingRubric: 'Award marks for: (1) any continuous function; (2) single hidden layer with sufficient neurons; (3) implication that NNs are theoretically universal function approximators.',
          xpValue: 15,
        },
        {
          id: 'q7-1-3', type: 'multiple_choice',
          question: 'In PyTorch, nn.Linear(784, 512) creates:',
          options: [
            '784 neurons, each with 512 outputs',
            '512 neurons each computing a weighted sum of all 784 inputs',
            'A layer that only works with 784×512 images',
            'A convolutional filter of size 784×512',
          ],
          correctAnswer: '512 neurons each computing a weighted sum of all 784 inputs',
          gradingRubric: 'Award full marks for the second option. nn.Linear(in, out) has weight matrix (out, in) — each of the "out" neurons takes a weighted sum of all "in" inputs.',
          xpValue: 10,
        },
        {
          id: 'q7-1-4', type: 'multiple_choice',
          question: 'Deep networks (more layers) are preferred over wide networks (more neurons per layer) because:',
          options: [
            'Deep networks train faster',
            'Deep networks use less memory',
            'Deep networks represent exponentially more functions with the same parameter count',
            'Wide networks cannot use ReLU activations',
          ],
          correctAnswer: 'Deep networks represent exponentially more functions with the same parameter count',
          gradingRubric: 'Award full marks for the third option. Depth enables hierarchical composition — layer n builds on layer n-1\'s features, achieving exponential representational capacity.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q7-2', title: 'Quiz 7.2 — Activations and Architecture',
      type: 'lesson', moduleId: 'm7', passMark: 70,
      questions: [
        {
          id: 'q7-2-1', type: 'multiple_choice',
          question: 'Why can\'t neural networks stack purely linear layers to gain expressive power?',
          options: [
            'Linear layers are too slow to compute in sequence',
            'Multiple linear layers always collapse to a single linear transformation',
            'Linear layers cannot represent negative values',
            'Gradient descent does not work for linear layers',
          ],
          correctAnswer: 'Multiple linear layers always collapse to a single linear transformation',
          gradingRubric: 'Award full marks for the second option. W₂(W₁x+b₁)+b₂ = (W₂W₁)x + (W₂b₁+b₂) — just another linear layer. Activation functions break this collapse.',
          xpValue: 10,
        },
        {
          id: 'q7-2-2', type: 'multiple_choice',
          question: 'GELU is used in Claude instead of ReLU primarily because:',
          options: [
            'GELU is cheaper to compute than ReLU',
            'GELU is smoother and empirically performs better on language modelling tasks',
            'ReLU cannot be used with the Adam optimiser',
            'GELU produces exactly zero outputs for exactly half its inputs',
          ],
          correctAnswer: 'GELU is smoother and empirically performs better on language modelling tasks',
          gradingRubric: 'Award full marks for the second option. GELU\'s smooth, probabilistic gating empirically outperforms the hard threshold of ReLU on language tasks in both BERT and GPT families.',
          xpValue: 10,
        },
        {
          id: 'q7-2-3', type: 'short_answer',
          question: 'What is dropout, and why is it disabled during inference?',
          correctAnswer: 'Dropout randomly zeros neuron outputs during training to prevent overfitting. During inference it is disabled so predictions are deterministic and all neurons contribute.',
          gradingRubric: 'Award marks for: (1) randomly zeros activations; (2) prevents overfitting / forces redundant representations; (3) disabled at inference for deterministic predictions using model.eval().',
          xpValue: 15,
        },
        {
          id: 'q7-2-4', type: 'multiple_choice',
          question: 'Layer Normalisation (LayerNorm) is used in Transformers rather than BatchNorm because:',
          options: [
            'LayerNorm is computationally cheaper',
            'LayerNorm normalises per-example independently, working for variable-length sequences without requiring large batches',
            'BatchNorm cannot be used with ReLU activations',
            'LayerNorm uses fewer learnable parameters',
          ],
          correctAnswer: 'LayerNorm normalises per-example independently, working for variable-length sequences without requiring large batches',
          gradingRubric: 'Award full marks for the second option. BatchNorm requires consistent batch statistics — problematic for variable-length text and small batches. LayerNorm normalises each example independently.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q7-3', title: 'Quiz 7.3 — The Forward Pass',
      type: 'lesson', moduleId: 'm7', passMark: 70,
      questions: [
        {
          id: 'q7-3-1', type: 'multiple_choice',
          question: 'During the LLM forward pass, which token position\'s output is used to predict the next token?',
          options: [
            'The first token position (the prompt start)',
            'All token positions simultaneously',
            'The last token position in the sequence',
            'A randomly selected token position',
          ],
          correctAnswer: 'The last token position in the sequence',
          gradingRubric: 'Award full marks for the third option. In autoregressive generation, the last token position accumulates context from all previous tokens and its logits are used to sample the next token.',
          xpValue: 10,
        },
        {
          id: 'q7-3-2', type: 'practical',
          question: 'You have a batch of 16 images, each 224×224×3. After a nn.Linear(784, 512) layer (assuming images flattened), what is the output tensor shape?',
          correctAnswer: '(16, 512) — batch dimension stays, input dimension 784 → output dimension 512',
          gradingRubric: 'Award marks for (16, 512). The batch dimension B=16 is preserved; the linear layer maps 784 inputs to 512 outputs. Note: 224×224×3=150,528 not 784 — award full marks if student notes images need flattening to correct size.',
          xpValue: 20,
        },
        {
          id: 'q7-3-3', type: 'multiple_choice',
          question: 'torch.no_grad() during inference is used to:',
          options: [
            'Disable the CUDA GPU and use CPU instead',
            'Skip gradient computation, saving memory and computation since weights are not updated',
            'Prevent the model from producing incorrect outputs',
            'Disable dropout and batch normalisation',
          ],
          correctAnswer: 'Skip gradient computation, saving memory and computation since weights are not updated',
          gradingRubric: 'Award full marks for the second option. During inference, weights are fixed — there is no need to track gradients for a backward pass. Disabling this saves significant memory and computation.',
          xpValue: 10,
        },
        {
          id: 'q7-3-4', type: 'multiple_choice',
          question: 'LLM inference is sequential (one token at a time) because:',
          options: [
            'GPUs cannot process multiple tokens simultaneously',
            'Each token depends on all previously generated tokens — future tokens cannot be predicted without the current one',
            'The tokeniser requires sequential processing',
            'Parallel decoding would use too much memory',
          ],
          correctAnswer: 'Each token depends on all previously generated tokens — future tokens cannot be predicted without the current one',
          gradingRubric: 'Award full marks for the second option. Autoregressive generation: token t is sampled from P(t | t-1, t-2, ... , t₀). Token t+1 requires token t as input — fundamentally sequential.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q7-4', title: 'Quiz 7.4 — CNNs and Representation Learning',
      type: 'lesson', moduleId: 'm7', passMark: 70,
      questions: [
        {
          id: 'q7-4-1', type: 'multiple_choice',
          question: 'The key advantage of convolutional layers over dense layers for images is:',
          options: [
            'CNNs can process colour images; dense layers cannot',
            'Parameter sharing and local connectivity — the same filter detects patterns anywhere in the image',
            'CNNs use less GPU memory than dense layers',
            'Convolutional layers support batch processing; dense layers do not',
          ],
          correctAnswer: 'Parameter sharing and local connectivity — the same filter detects patterns anywhere in the image',
          gradingRubric: 'Award full marks for the second option. A single 3×3 filter applied across a 224×224 image has only 27 weights (9×3 channels) instead of 150,528 weights for a dense connection. This exploits translation equivariance.',
          xpValue: 10,
        },
        {
          id: 'q7-4-2', type: 'short_answer',
          question: 'Explain why CNN pre-training on ImageNet transfers well to medical image classification, even though the domains seem very different.',
          correctAnswer: 'Early CNN layers learn general features (edges, textures, shapes) that appear in all natural images. These transfer across domains; only later task-specific layers need fine-tuning.',
          gradingRubric: 'Award marks for: (1) early layers learn universal visual primitives; (2) these exist in medical images too; (3) only the task-specific head needs updating; (4) avoids training from scratch on limited medical data.',
          xpValue: 20,
        },
        {
          id: 'q7-4-3', type: 'multiple_choice',
          question: 'When the Anthropic API returns a text embedding vector, it is:',
          options: [
            'A compressed version of the input text for faster transmission',
            'The model\'s internal learned representation of the text meaning, encoded as a high-dimensional vector',
            'A list of token IDs corresponding to the input',
            'The model\'s output probabilities over all possible next tokens',
          ],
          correctAnswer: 'The model\'s internal learned representation of the text meaning, encoded as a high-dimensional vector',
          gradingRubric: 'Award full marks for the second option. Embeddings are the model\'s learned, dense representation of semantic meaning — points in a high-dimensional space where similar meanings are geometrically close.',
          xpValue: 10,
        },
        {
          id: 'q7-4-4', type: 'multiple_choice',
          question: 'The principle that connects CNN transfer learning to LLM pre-training is:',
          options: [
            'Both use the same gradient descent algorithm',
            'Both compress data to save storage',
            'Learned representations are general — pre-training captures structure that transfers to new tasks',
            'Both require exactly two fine-tuning steps',
          ],
          correctAnswer: 'Learned representations are general — pre-training captures structure that transfers to new tasks',
          gradingRubric: 'Award full marks for the third option. Whether learning visual edges or linguistic patterns, deep networks learn genuinely general abstractions that transfer across tasks with minimal additional training.',
          xpValue: 10,
        },
      ],
    },
  ],
  project: {
    id: 'p7', moduleId: 'm7',
    name: 'Neural Network From Scratch',
    emoji: '🧠',
    description: 'Build a fully connected neural network from scratch using only NumPy — no PyTorch, no TensorFlow. Implement forward pass, backpropagation, and gradient descent manually. Train it to classify handwritten digits (MNIST) and achieve >90% accuracy.',
    tools: ['NumPy', 'Matplotlib', 'MNIST dataset', 'Pure Python'],
    status: 'not_started',
    rubric: [
      'Implements forward pass correctly: linear layers, ReLU, softmax',
      'Implements backpropagation from scratch using chain rule — no autograd',
      'Trains with mini-batch SGD and reaches >90% accuracy on MNIST test set',
      'Plots training loss curve showing smooth descent over epochs',
      'Visualises 10 example predictions with confidence scores',
    ],
    xpReward: 300,
  },
}

// ─── MODULE 8 ─────────────────────────────────────────────────────────────────
const m8: Module = {
  id: 'm8', number: 8, arc: 2,
  title: 'The Transformer Architecture',
  description: 'The architecture that changed everything — understand every component of the Transformer from positional encodings to multi-head attention to the feedforward sublayer, and why these choices produce models like Claude.',
  prerequisiteModuleId: 'm7',
  lessons: [
    {
      id: '8-1', number: '8.1',
      title: 'Attention — The Core Mechanism',
      duration: 16,
      content: `# Attention — The Core Mechanism

The **attention mechanism** is the idea that transformed AI. Introduced by Bahdanau et al. (2015) for machine translation and radicalised by "Attention Is All You Need" (Vaswani et al., 2017), it answers a simple question: when processing a word, which other words should the model focus on?

## The Motivation: Context Matters

Consider the sentence: *"The animal didn't cross the street because it was too tired."*

What does "it" refer to? The animal. A model needs to relate "it" back to "animal" to understand this sentence. In classical sequence models (RNNs, LSTMs), information from distant positions had to travel through every intermediate hidden state — degrading with distance.

Attention creates **direct connections** between any two positions, regardless of distance.

## Scaled Dot-Product Attention

The fundamental attention operation:

\`\`\`
Attention(Q, K, V) = softmax(QKᵀ / √d_k) V
\`\`\`

Where Q (queries), K (keys), V (values) are linear projections of the input, and d_k is the key dimension.

**Step by step:**

1. **QKᵀ** — compute all pairwise dot products between queries and keys. Shape: (T, T) for sequence length T.
   - High dot product = query and key are "compatible" = attend strongly

2. **/ √d_k** — scale to prevent vanishing softmax gradients in high dimensions (as derived in Module 4)

3. **softmax(...)** — normalise to attention weights. Each row sums to 1, giving a probability distribution over positions.

4. **× V** — take a weighted sum of values. Each output position gets a blend of all value vectors, weighted by attention.

## Intuition: Query, Key, Value

The Q/K/V metaphor comes from information retrieval:
- **Query:** "What information am I looking for?" (current token's question)
- **Key:** "What information do I contain?" (each position's label)
- **Value:** "What information should I transmit if selected?" (each position's content)

When processing "it" in our sentence, the query vector for "it" should be most compatible with the key vector for "animal" — so the value for "animal" contributes most to updating the representation of "it".

## The Attention Matrix

The softmax output is a T×T **attention matrix** where entry (i,j) is how much position i attends to position j.

\`\`\`
"The animal did not cross the street because it was too tired"
 The   0.02  0.15  ...
 animal 0.03  0.42  ...   ← "animal" attends to itself and "The"
 ...
 it    0.01  0.71  ...   ← "it" heavily attends to "animal"
 was   0.02  0.12  ...
\`\`\`

Mechanistic interpretability research at Anthropic involves analysing these attention matrices to understand what each attention head "knows" and does — which is how researchers understand circuit-level behaviour in Claude.

## Causal (Masked) Attention

During language model training, we predict every token from its context. But a token at position t should not "see" tokens at positions > t (it hasn't been generated yet).

**Causal masking** sets attention weights to -∞ (effectively 0 after softmax) for all future positions:

\`\`\`
Mask pattern (lower triangular):
pos 0: can see [0]
pos 1: can see [0, 1]
pos 2: can see [0, 1, 2]
...
pos T: can see [0, 1, ..., T]
\`\`\`

This allows training on the entire sequence in parallel (unlike RNNs which must process left-to-right). All T token predictions are computed simultaneously during training — massive efficiency gain.

## Computational Complexity

Standard attention is **O(T²·d)** in time and **O(T²)** in memory for sequence length T. This is the fundamental bottleneck of Transformer scaling:

| Context length | Attention matrix size |
|---------------|----------------------|
| 2,048 tokens | ~4M elements |
| 32,768 tokens | ~1B elements |
| 128,000 tokens | ~16B elements |

This is why long-context models (Claude 3.5 supporting 200K tokens) require significant engineering: sparse attention, Flash Attention, and other algorithmic improvements to keep the O(T²) cost tractable.`,
      keyTerms: [
        { term: 'Attention Mechanism', definition: 'Computes Attention(Q,K,V) = softmax(QKᵀ/√d_k)V — creates direct pairwise connections between all sequence positions.' },
        { term: 'Query, Key, Value', definition: 'Three projections of the input. Queries ask questions; Keys label positions; Values carry information. Borrowed from database retrieval metaphor.' },
        { term: 'Attention Matrix', definition: 'The T×T softmax output where entry (i,j) is the weight position i gives to position j. Each row is a probability distribution.' },
        { term: 'Causal Masking', definition: 'Setting future attention weights to -∞ so token i only attends to positions ≤ i. Enables parallel training while maintaining autoregressive property.' },
        { term: 'O(T²) Complexity', definition: 'Attention costs quadratic time and memory in sequence length. The fundamental bottleneck for long-context LLMs.' },
      ],
    },
    {
      id: '8-2', number: '8.2',
      title: 'Multi-Head Attention and Positional Encoding',
      duration: 15,
      content: `# Multi-Head Attention and Positional Encoding

A single attention mechanism attends to all positions with a single notion of "relevance". But understanding language requires attending for many reasons simultaneously — one head might track syntactic dependencies, another coreference, another semantic roles. **Multi-head attention** runs several attention operations in parallel.

## Multi-Head Attention

\`\`\`
MultiHead(Q, K, V) = Concat(head₁, head₂, ..., headₕ) Wᴼ

where headᵢ = Attention(Q Wᵢᴼ, K Wᵢᴷ, V Wᵢᵛ)
\`\`\`

Each head projects Q, K, V into a smaller subspace, attends independently, then all heads are concatenated and projected back:

\`\`\`
d_model = 512     (total model dimension)
h = 8             (number of heads)
d_k = d_v = 512/8 = 64    (per-head dimension)

Head i:
  Wᵢᴼ: (d_model, d_k) = (512, 64)
  Wᵢᴷ: (d_model, d_k)
  Wᵢᵛ: (d_model, d_v)

Concat: 8 × 64 = 512 → projected back to 512 via Wᴼ
\`\`\`

**Why this works:** different heads can specialise. In GPT-2, researchers found heads that track: previous token, subject-verb agreement, coreference, position offsets, and rare syntactic structures — all in the same model. Each head sees the full sequence but through a different learned lens.

## Attention Head Specialisation in Claude

Anthropic's mechanistic interpretability team has identified specific heads in Claude that perform identifiable functions:
- **Induction heads:** detect and copy repeated patterns (important for in-context learning)
- **Previous-token heads:** strongly attend to the immediately preceding token
- **Backup heads:** redundant copies that handle cases when primary heads are ablated

This research — understanding what individual components do — is how Anthropic reasons about model behaviour and builds safety guarantees.

## The Problem of Permutation Invariance

Standard attention has a critical flaw: **it is permutation invariant**. Shuffle the tokens in any order and attention produces the same output (since Attention(Q,K,V) only uses dot products between positions, not their order).

This is catastrophic for language. "The dog bit the man" and "The man bit the dog" would have identical attention outputs without positional information.

## Sinusoidal Positional Encoding (Original Transformer)

The original Transformer adds a position-dependent signal to each token embedding:

\`\`\`
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
\`\`\`

Properties:
- Unique encoding for each position (deterministic, no learning needed)
- Encodings for nearby positions are similar (geometric proximity preserved)
- Works for positions never seen during training (extrapolation)

## Rotary Position Embedding (RoPE)

Modern LLMs including **LLaMA, Mistral, and likely Claude** use **Rotary Position Embedding (RoPE)**:

Instead of adding absolute position encodings to embeddings, RoPE **rotates the Q and K vectors** by an angle proportional to position before computing dot products:

\`\`\`
attention_score(q_m, k_n) ∝ (R_m q) · (R_n k)
                           = q · R_{n-m} k
\`\`\`

The key insight: the dot product of rotated vectors depends only on the **relative position** (n-m), not absolute positions. This gives:
- **Better length extrapolation** — the model sees relative distances, not absolute positions it may not have trained on
- **More efficient attention** — position information is baked into Q and K, not added to embeddings

## Absolute vs Relative Position

| Method | Used in | Property |
|--------|---------|---------|
| Sinusoidal PE | Original Transformer | Absolute positions, deterministic |
| Learned PE | BERT, GPT-2 | Absolute positions, trained |
| RoPE | LLaMA, Mistral | Relative positions, efficient |
| ALiBi | MPT, some others | Relative positions, linear bias |

Relative position methods generally extrapolate better to longer contexts — important for Claude's 200K token context window.

## Full Multi-Head Attention in Code

\`\`\`python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.h = num_heads
        self.d_k = d_model // num_heads
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, x, mask=None):
        B, T, D = x.shape
        # Project and split into heads: (B, T, D) → (B, h, T, d_k)
        Q = self.W_q(x).view(B, T, self.h, self.d_k).transpose(1, 2)
        K = self.W_k(x).view(B, T, self.h, self.d_k).transpose(1, 2)
        V = self.W_v(x).view(B, T, self.h, self.d_k).transpose(1, 2)
        # Scaled dot-product attention per head
        scores = Q @ K.transpose(-2, -1) / (self.d_k ** 0.5)   # (B,h,T,T)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        attn = scores.softmax(dim=-1)
        out = attn @ V                # (B, h, T, d_k)
        # Concatenate heads and project
        out = out.transpose(1,2).reshape(B, T, D)
        return self.W_o(out)
\`\`\`

Reading and understanding this code — every shape, every operation — is a prerequisite for reading Transformer research papers and understanding Claude's architecture.`,
      keyTerms: [
        { term: 'Multi-Head Attention', definition: 'Running h attention operations in parallel on projected subspaces, then concatenating. Allows different heads to specialise in different types of relationships.' },
        { term: 'Permutation Invariance', definition: 'Without positional encoding, attention treats any ordering of tokens identically — catastrophic for language understanding.' },
        { term: 'RoPE (Rotary Position Embedding)', definition: 'Encodes position by rotating Q and K vectors. Produces relative position-dependent attention scores. Used in LLaMA, Mistral, and likely Claude.' },
        { term: 'Induction Heads', definition: 'Attention heads that detect and copy repeated patterns. Identified as critical for in-context learning ability in LLMs.' },
        { term: 'Head Specialisation', definition: 'Different attention heads in the same layer learn to track different linguistic phenomena: syntax, coreference, position, semantics.' },
      ],
    },
    {
      id: '8-3', number: '8.3',
      title: 'The Full Transformer Block and Decoder Stack',
      duration: 15,
      content: `# The Full Transformer Block and Decoder Stack

Multi-head attention is powerful, but it is only half of a Transformer block. The other half is the **feed-forward sublayer** — and together with residual connections and layer normalisation, these components form the repeating unit that stacks to create GPT, Claude, and every major LLM.

## The Transformer Block

One Transformer block contains:

\`\`\`
Input x
  ↓
[LayerNorm]
  ↓
[Multi-Head Self-Attention]
  ↓  + x (residual)
  ↓
[LayerNorm]
  ↓
[Feed-Forward Network]
  ↓  + x (residual)
  ↓
Output x'
\`\`\`

This is **Pre-LN** architecture (LayerNorm before the sublayer) — standard in modern LLMs. The original "Attention Is All You Need" used Post-LN but Pre-LN trains more stably.

## The Feed-Forward Network (FFN)

The FFN sublayer is a simple 2-layer MLP applied **independently to each token position**:

\`\`\`
FFN(x) = GELU(x W₁ + b₁) W₂ + b₂

x:   (B, T, d_model)     e.g. (8, 512, 768)
W₁:  (d_model, 4×d_model) ← 4× expansion is standard
W₂:  (4×d_model, d_model)
\`\`\`

The FFN expands to 4× the model dimension, applies GELU, then contracts back. This **expansion ratio** is crucial — the FFN contains most of the model's parameters.

**Parameter count example for d_model = 768:**
\`\`\`
MHA:   4 × 768 × 768 = 2,359,296
FFN:   2 × 768 × 3072 = 4,718,592 ← FFN has 2× more params than MHA
\`\`\`

The FFN acts as key-value **memory**: research shows it stores factual associations (Paris is the capital of France), world knowledge, and linguistic patterns — while attention handles relational reasoning between positions.

## Residual Connections — Revisited

Every sublayer uses a residual connection:
\`\`\`
output = sublayer(LayerNorm(x)) + x
\`\`\`

In deep Transformers, these create a **residual stream** — a consistent high-dimensional vector that flows through all layers, with each block reading from it and writing back modifications. Anthropic's research frames Claude's computation as:

> "The residual stream is the main channel of communication. Attention layers move information between positions; FFN layers process it within positions."

This view is core to **mechanistic interpretability** — understanding which components write what information into the residual stream and how later layers read it.

## Stacking Blocks — The Decoder Stack

The full language model decoder stacks N identical blocks:

\`\`\`
Token Embeddings + Positional Encoding
    ↓
[Block 1: MHA → FFN]
    ↓
[Block 2: MHA → FFN]
    ↓
    ...
    ↓
[Block N: MHA → FFN]
    ↓
LayerNorm
    ↓
Unembedding (Linear → vocab_size)
    ↓
Softmax → token probabilities
\`\`\`

Model sizes in terms of depth:

| Model | Layers | d_model | Heads | Parameters |
|-------|--------|---------|-------|-----------|
| GPT-2 small | 12 | 768 | 12 | 117M |
| GPT-2 XL | 48 | 1600 | 25 | 1.5B |
| GPT-3 | 96 | 12,288 | 96 | 175B |
| Claude 3 Sonnet | ~70 (est.) | ~8,192+ | ~64+ | ~70B (est.) |

Each additional layer adds another pass where attention can relate positions and FFN can apply learned transformations. Depth enables the hierarchical, multi-step reasoning that makes LLMs capable.

## KV-Cache — Making Inference Efficient

During autoregressive inference, each new token requires attention over all previous tokens. Naively, this means recomputing K and V for all previous tokens at each step — O(T²) total cost for a sequence of length T.

**KV-Cache** stores the K and V matrices from previous steps:
\`\`\`
Step 1: compute K₁, V₁ → store in cache, output token 1
Step 2: compute K₂, V₂ → append to cache, attend over [K₁,K₂], output token 2
Step k: compute Kₖ, Vₖ → append to cache, attend over [K₁...Kₖ], output token k
\`\`\`

Only the new token's Q, K, V are computed at each step — bringing generation cost from O(T²) to O(T) per step. KV-cache is why token generation is fast despite sequences growing arbitrarily long.

**KV-cache memory cost:** 2 × N_layers × N_heads × d_head × T × bytes_per_value. For a 70B model with a 100K token context, the KV-cache alone can require 10+ GB — a significant factor in cloud inference pricing.

## Encoder vs Decoder vs Encoder-Decoder

| Architecture | Examples | Use case |
|---|---|---|
| Encoder only | BERT, RoBERTa | Understanding (classification, NER, embeddings) |
| Decoder only | GPT, Claude, LLaMA | Generation (completion, chat, code) |
| Encoder-decoder | T5, BART | Seq2seq (translation, summarisation) |

Claude is a **decoder-only** Transformer. The causal mask ensures that at every training step, the model must predict the next token — maximising the efficiency of each forward pass (T predictions from one pass vs. 1 from an encoder).`,
      keyTerms: [
        { term: 'Transformer Block', definition: 'The repeating unit: Pre-LN → Multi-Head Attention → residual + Pre-LN → FFN → residual. Stacked N times to form the full model.' },
        { term: 'Feed-Forward Network (FFN)', definition: 'A 2-layer MLP applied per-token with 4× expansion. Contains most model parameters; stores factual knowledge and linguistic patterns.' },
        { term: 'Residual Stream', definition: 'Anthropic\'s framing: a high-dimensional vector flowing through all layers. Attention moves information between positions; FFN processes it within positions.' },
        { term: 'KV-Cache', definition: 'Stores computed Key and Value matrices across generation steps. Reduces per-step inference cost from O(T²) to O(T). Essential for fast autoregressive generation.' },
        { term: 'Decoder-Only Architecture', definition: 'Transformer variant using only the decoder stack with causal masking. Used by GPT, LLaMA, Claude. Predicts T tokens simultaneously during training.' },
      ],
    },
    {
      id: '8-4', number: '8.4',
      title: 'Tokenisation and the Embedding Layer',
      duration: 13,
      content: `# Tokenisation and the Embedding Layer

Before any attention, before any FFN, the model must convert raw text into numbers. This preprocessing step — **tokenisation** — is more consequential than it might seem. The choice of tokeniser affects model capability, efficiency, fairness, and what the model finds easy or hard to reason about.

## What Is a Token?

A **token** is the basic unit of text that a model processes. Tokens are neither characters nor words — they are variable-length subword units derived statistically from training data:

\`\`\`
"Hello, world!"     → ["Hello", ",", " world", "!"]        (4 tokens)
"unbelievable"      → ["un", "believ", "able"]              (3 tokens)
"tokenisation"      → ["token", "is", "ation"]             (3 tokens)
"GPT-4"             → ["GP", "T", "-", "4"]                (4 tokens)
"αβγδ"              → ["α", "β", "γ", "δ"]                 (4 tokens, possibly more)
\`\`\`

## Byte-Pair Encoding (BPE)

The dominant tokenisation algorithm, used by GPT-3, GPT-4, and Claude:

**Algorithm:**
1. Start with a vocabulary of individual characters
2. Count all adjacent character pair frequencies in the training corpus
3. Merge the most frequent pair into a new vocabulary item
4. Repeat until vocabulary size is reached (typically 32K–100K tokens)

\`\`\`
Corpus: "low lower lowest"
Init:   l-o-w l-o-w-e-r l-o-w-e-s-t
Step 1: merge "lo" (most frequent)  → "lo"-w "lo"-w-e-r "lo"-w-e-s-t
Step 2: merge "low"                 → "low" "low"-e-r "low"-e-s-t
...
\`\`\`

Result: common words become single tokens, rare words split into common sub-components. "ChatGPT" might be ["Chat", "G", "PT"] — the model has never seen the whole string but can process its parts.

## Claude's Tokeniser

Claude uses a BPE tokeniser with vocabulary size ~100K, trained on a multilingual corpus. Key properties:
- English text: ~4 characters per token on average
- Pricing: Claude API charges per token, not character
- Code: often more tokens than equivalent prose (special characters, indentation)
- Non-English: generally less efficient — more tokens per semantic unit

Practical implication: when crafting prompts, shorter prose is cheaper. Unnecessary verbosity increases token count and cost linearly.

## The Embedding Layer

Once tokenised, each token ID maps to a **dense vector** via a lookup table:

\`\`\`
vocab_size = 100,256
d_model    = 8,192   (estimated for Claude 3 Sonnet class)

Embedding table: shape (vocab_size, d_model) = (100256, 8192) ≈ 820M params

token_id → embedding_table[token_id] → vector of shape (d_model,)
\`\`\`

The embedding layer is a learned lookup table — each row is a dense vector representation of that token. These vectors are initialised randomly and learned end-to-end during pre-training.

**Weight tying:** in most LLMs, the embedding table is **shared** with the unembedding (output) layer — they use the same weight matrix. This halves the parameter count for the embedding and has been shown to improve learning by forcing consistency between input and output representations.

## Why Tokenisation Matters for Reasoning

Tokenisation creates genuine capability quirks:

**String reversal:**
\`\`\`
"Hello" → ["Hello"] → model sees 1 token, not 5 characters
Reversing character-by-character requires knowing character boundaries
\`\`\`

**Arithmetic:**
\`\`\`
"1234 + 5678" → tokens depend on number length
"100000" might be ["100", "000"] — the model must handle digit groupings
\`\`\`

**Spelling:**
\`\`\`
"How many r's in 'strawberry'?" → model sees "st", "raw", "berry" — the r in "raw" is hidden inside a token
\`\`\`

These are not intelligence failures — they are tokenisation artefacts. Understanding them prevents misinterpreting model behaviour and informs prompt engineering (e.g., adding spaces between characters for spelling tasks).

## From Tokens to the Transformer

After tokenisation and embedding:
\`\`\`
Input text: "The capital of France is"
Tokens:     [464, 3361, 286, 4881, 318]   (arbitrary example IDs)
Embeddings: (5, 8192) tensor — 5 tokens, each a 8192-dim vector
+ Positional encoding: (5, 8192) added element-wise
= Input to Transformer: (5, 8192)
\`\`\`

Every Transformer layer operates on this (T, d_model) representation, enriching it until the final unembedding projects to vocabulary logits and softmax produces the next-token distribution.`,
      keyTerms: [
        { term: 'Tokenisation', definition: 'Converting raw text to integer token IDs using a learned vocabulary. Tokens are subword units — neither characters nor full words.' },
        { term: 'Byte-Pair Encoding (BPE)', definition: 'Tokenisation algorithm iteratively merging frequent character pairs. Produces variable-length subword tokens. Used by GPT and Claude.' },
        { term: 'Embedding Layer', definition: 'A learned lookup table mapping token IDs to dense vectors of dimension d_model. The first layer of every Transformer.' },
        { term: 'Weight Tying', definition: 'Sharing the embedding table with the output unembedding layer. Halves parameter count and improves consistency between input and output representations.' },
        { term: 'Tokenisation Artefacts', definition: 'Capability quirks caused by token boundaries — such as difficulty with character-level tasks or arithmetic with multi-digit numbers.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q8-1', title: 'Quiz 8.1 — Attention Mechanism',
      type: 'lesson', moduleId: 'm8', passMark: 70,
      questions: [
        {
          id: 'q8-1-1', type: 'multiple_choice',
          question: 'In Attention(Q, K, V) = softmax(QKᵀ / √d_k) V, the purpose of dividing by √d_k is:',
          options: [
            'To normalise the output to have unit variance',
            'To prevent large dot products that push softmax into near-zero gradient regions',
            'To ensure Q and K have the same dimension',
            'To implement dropout implicitly',
          ],
          correctAnswer: 'To prevent large dot products that push softmax into near-zero gradient regions',
          gradingRubric: 'Award full marks for the second option. In d_k dimensions, random dot products have variance d_k. √d_k scaling normalises variance to 1, keeping softmax in a sensitive gradient region.',
          xpValue: 10,
        },
        {
          id: 'q8-1-2', type: 'multiple_choice',
          question: 'Causal masking in decoder-only Transformers (like Claude) serves to:',
          options: [
            'Reduce memory usage by attending to fewer tokens',
            'Prevent token i from attending to future tokens j > i, maintaining the autoregressive property',
            'Speed up training by halving the attention computation',
            'Prevent attention weights from becoming negative',
          ],
          correctAnswer: 'Prevent token i from attending to future tokens j > i, maintaining the autoregressive property',
          gradingRubric: 'Award full marks for the second option. During training, future tokens are not available during inference — masking them ensures the training distribution matches inference conditions.',
          xpValue: 10,
        },
        {
          id: 'q8-1-3', type: 'short_answer',
          question: 'Explain what "induction heads" are and why they matter for in-context learning.',
          correctAnswer: 'Induction heads detect when a pattern [A][B]...[A] appears and predict B will follow. They enable models to copy examples from context, which underlies few-shot and in-context learning.',
          gradingRubric: 'Award marks for: (1) detect/copy repeated patterns; (2) predict continuation based on earlier occurrences; (3) connection to in-context learning / few-shot ability.',
          xpValue: 20,
        },
        {
          id: 'q8-1-4', type: 'multiple_choice',
          question: 'Standard self-attention has O(T²) complexity. Doubling context length from 32K to 64K tokens multiplies attention cost by approximately:',
          options: ['2×', '4×', '8×', '16×'],
          correctAnswer: '4×',
          gradingRubric: 'Award full marks for 4×. O(T²): if T doubles, T² quadruples. This is why 64K context is ~4× more expensive than 32K in attention computation.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q8-2', title: 'Quiz 8.2 — Multi-Head Attention and Position',
      type: 'lesson', moduleId: 'm8', passMark: 70,
      questions: [
        {
          id: 'q8-2-1', type: 'multiple_choice',
          question: 'Without positional encoding, a Transformer treating "dog bites man" and "man bites dog" would:',
          options: [
            'Produce slightly different outputs due to different token embeddings',
            'Produce identical outputs because attention is permutation-invariant without position information',
            'Crash with an index error',
            'Default to treating all tokens as position 0',
          ],
          correctAnswer: 'Produce identical outputs because attention is permutation-invariant without position information',
          gradingRubric: 'Award full marks for the second option. Without positional information, the model computes the same dot products regardless of word order — making grammatically and semantically different sentences indistinguishable.',
          xpValue: 10,
        },
        {
          id: 'q8-2-2', type: 'multiple_choice',
          question: 'RoPE (Rotary Position Embedding) is preferred over learned absolute positions for long-context LLMs because:',
          options: [
            'RoPE uses less memory than learned embeddings',
            'RoPE encodes relative positions, extrapolating better to context lengths beyond training',
            'RoPE is compatible with all activation functions',
            'RoPE eliminates the need for the KV-cache',
          ],
          correctAnswer: 'RoPE encodes relative positions, extrapolating better to context lengths beyond training',
          gradingRubric: 'Award full marks for the second option. Relative position schemes let the model reason about "token A is 5 positions before B" regardless of their absolute positions — this generalises to unseen lengths.',
          xpValue: 15,
        },
        {
          id: 'q8-2-3', type: 'short_answer',
          question: 'A model has d_model=1024 and 16 attention heads. What is the dimension per head (d_k), and why split into heads rather than use one large attention operation?',
          correctAnswer: 'd_k = 1024/16 = 64. Multiple heads allow different specialisations — one head tracks syntax, another coreference, etc. Single large attention has one representation of "relevance".',
          gradingRubric: 'Award marks for: (1) d_k = 64; (2) specialisation argument — different heads track different relationships; (3) implicit: same total computation but richer representations.',
          xpValue: 20,
        },
        {
          id: 'q8-2-4', type: 'multiple_choice',
          question: 'Anthropic\'s mechanistic interpretability research analyses attention heads to:',
          options: [
            'Optimise GPU memory usage during training',
            'Understand what specific components compute and how they contribute to model behaviour',
            'Identify which heads can be pruned to reduce model size',
            'Verify that all heads attend to the same positions',
          ],
          correctAnswer: 'Understand what specific components compute and how they contribute to model behaviour',
          gradingRubric: 'Award full marks for the second option. Mechanistic interpretability aims to reverse-engineer model behaviour at a circuit level — understanding what each component "knows" and does is how Anthropic reasons about safety.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q8-3', title: 'Quiz 8.3 — Transformer Block and Decoder',
      type: 'lesson', moduleId: 'm8', passMark: 70,
      questions: [
        {
          id: 'q8-3-1', type: 'multiple_choice',
          question: 'The feed-forward network (FFN) in a Transformer block is applied:',
          options: [
            'Once across the entire sequence simultaneously',
            'Independently to each token position — the same FFN weights applied at every position',
            'Only to the first and last token positions',
            'After summing all token representations',
          ],
          correctAnswer: 'Independently to each token position — the same FFN weights applied at every position',
          gradingRubric: 'Award full marks for the second option. The FFN processes each position\'s representation independently with shared weights — unlike attention which relates positions to each other.',
          xpValue: 10,
        },
        {
          id: 'q8-3-2', type: 'multiple_choice',
          question: 'The KV-cache during inference stores computed Keys and Values to:',
          options: [
            'Enable beam search across multiple generation paths',
            'Avoid recomputing K and V for previous tokens at each generation step, reducing cost from O(T²) to O(T)',
            'Share weights between the encoder and decoder',
            'Prevent attention from seeing tokens more than once',
          ],
          correctAnswer: 'Avoid recomputing K and V for previous tokens at each generation step, reducing cost from O(T²) to O(T)',
          gradingRubric: 'Award full marks for the second option. Without KV-cache, generating T tokens costs O(T²). With caching, only the new token\'s Q,K,V are computed — O(T) total.',
          xpValue: 10,
        },
        {
          id: 'q8-3-3', type: 'short_answer',
          question: 'Anthropic describes Claude\'s computation in terms of the "residual stream". What is the residual stream and what role do attention and FFN layers play in it?',
          correctAnswer: 'The residual stream is the high-dimensional vector flowing through all layers via residual connections. Attention layers move/aggregate information between token positions; FFN layers apply learned transformations within each position.',
          gradingRubric: 'Award marks for: (1) consistent high-dimensional vector flowing through layers; (2) attention handles cross-position communication; (3) FFN handles per-position processing; (4) residual connections preserve information while adding transformations.',
          xpValue: 20,
        },
        {
          id: 'q8-3-4', type: 'multiple_choice',
          question: 'Claude is a decoder-only Transformer. During a single training forward pass on a sequence of 512 tokens, how many next-token predictions are made?',
          options: ['1', '10', '256', '512'],
          correctAnswer: '512',
          gradingRubric: 'Award full marks for 512. Causal masking allows each of the T token positions to predict its next token simultaneously — 512 predictions in one pass. This is why decoder-only training is parameter and compute efficient.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q8-4', title: 'Quiz 8.4 — Tokenisation and Embeddings',
      type: 'lesson', moduleId: 'm8', passMark: 70,
      questions: [
        {
          id: 'q8-4-1', type: 'multiple_choice',
          question: 'Why does Claude struggle more with "How many r\'s in strawberry?" than with "What is the capital of France?"?',
          options: [
            'Claude has less training data on berry-related topics',
            '"strawberry" is tokenised into subword units, obscuring individual character boundaries from the model',
            'Character counting requires too many parameters',
            'The attention mechanism cannot process letter frequencies',
          ],
          correctAnswer: '"strawberry" is tokenised into subword units, obscuring individual character boundaries from the model',
          gradingRubric: 'Award full marks for the second option. "strawberry" → ["st","raw","berry"] — the model sees 3 tokens, not 10 characters. Character-level reasoning requires knowing token-to-character mappings, which the model must learn implicitly.',
          xpValue: 15,
        },
        {
          id: 'q8-4-2', type: 'multiple_choice',
          question: 'Weight tying in LLMs refers to sharing the same matrix between:',
          options: [
            'All attention heads in a layer',
            'The input embedding table and the output unembedding projection',
            'The Q and K projection matrices in attention',
            'Adjacent Transformer layers',
          ],
          correctAnswer: 'The input embedding table and the output unembedding projection',
          gradingRubric: 'Award full marks for the second option. Both the embedding (token → vector) and unembedding (vector → logit) layers use the same weight matrix — halving their combined parameter count.',
          xpValue: 10,
        },
        {
          id: 'q8-4-3', type: 'practical',
          question: 'The Claude API charges per token. A marketing email (500 words) costs approximately how many tokens, and how does this compare to equivalent Python code of the same word count?',
          correctAnswer: 'English prose: ~500 words ÷ 0.75 words/token ≈ 667 tokens. Python code uses more tokens because special characters, indentation, and variable names tokenise less efficiently — likely 800–1200 tokens for equivalent "word count".',
          gradingRubric: 'Award marks for: (1) approximately 650–700 tokens for 500 words of English; (2) code is less efficient — special chars, whitespace, identifiers fragment into more tokens; (3) practical implication for cost estimation.',
          xpValue: 20,
        },
        {
          id: 'q8-4-4', type: 'multiple_choice',
          question: 'BPE tokenisation starts with individual characters and iteratively:',
          options: [
            'Removes the least frequent characters from the vocabulary',
            'Merges the most frequently adjacent pair into a new vocabulary item',
            'Splits long words at syllable boundaries',
            'Assigns tokens based on part-of-speech tags',
          ],
          correctAnswer: 'Merges the most frequently adjacent pair into a new vocabulary item',
          gradingRubric: 'Award full marks for the second option. BPE greedily merges the most common bigram into a new token, building up from characters to common subwords to common words, until the vocabulary size limit is reached.',
          xpValue: 10,
        },
      ],
    },
  ],
  project: {
    id: 'p8', moduleId: 'm8',
    name: 'Mini-Transformer',
    emoji: '⚡',
    description: 'Implement a decoder-only Transformer from scratch in PyTorch — multi-head causal self-attention, feed-forward sublayer, positional encoding, and residual connections. Train it as a character-level language model on a small text corpus (Shakespeare or similar) and generate coherent text samples.',
    tools: ['PyTorch', 'Python', 'Matplotlib for loss curves', 'Any text corpus ≥1MB'],
    status: 'not_started',
    rubric: [
      'Correctly implements scaled dot-product attention with causal mask',
      'Multi-head attention with configurable number of heads and correct shape handling',
      'Full Transformer block: Pre-LN, MHA, residual, Pre-LN, FFN, residual',
      'Training loop with AdamW optimiser reaches <1.5 bits-per-character on validation set',
      'Generates plausible (if not perfect) text samples at temperature 0.8',
      'Loss curve plotted and included showing training progression',
    ],
    xpReward: 350,
  },
}

// ─── MODULE 9 ─────────────────────────────────────────────────────────────────
const m9: Module = {
  id: 'm9', number: 9, arc: 2,
  title: 'Pre-training and Scaling Laws',
  description: 'Understand how LLMs are actually trained at scale — data curation, compute budgets, Chinchilla scaling laws, emergent capabilities, and the engineering required to run a trillion-token training run.',
  prerequisiteModuleId: 'm8',
  lessons: [
    {
      id: '9-1', number: '9.1',
      title: 'The Pre-training Objective and Data',
      duration: 14,
      content: `# The Pre-training Objective and Data

Pre-training is the process that turns a randomly-initialised Transformer into a model with broad world knowledge and reasoning capability. It is the most expensive step in LLM development — Claude's pre-training likely cost tens of millions of dollars in compute — and understanding it explains almost every capability and limitation of modern AI.

## The Objective: Next Token Prediction

The pre-training objective is deceptively simple:

\`\`\`
Given tokens [t₁, t₂, ..., tₙ₋₁], predict tₙ
\`\`\`

More formally, maximise the log-likelihood over a corpus D:
\`\`\`
L = Σ log P(tₙ | t₁, ..., tₙ₋₁)
\`\`\`

This is the same cross-entropy loss from Module 6. The model never receives explicit labels — the "label" for each token is the next token in the text. This is **self-supervised learning**: the data itself provides the supervision.

## Why Next-Token Prediction Produces Intelligence

This is the deepest question in LLM research. Why does predicting the next word force a model to develop reasoning, knowledge, and language understanding?

The argument: **to predict the next token well, you must understand everything that influences what comes next.** A model that knows "Paris is the capital of France" can better predict "The capital of France is ___". A model that understands logical structure can better predict the continuation of a proof. A model that understands human psychology can better predict dialogue continuations.

Next-token prediction is an implicit compression of the entire distribution of human knowledge and reasoning. To compress well (low cross-entropy), you must model the world that generated the text.

## Scale of Pre-training Corpora

| Dataset | Size | Used in |
|---------|------|---------|
| The Pile | 825 GB | EleutherAI models |
| Common Crawl (filtered) | ~10 TB+ | Most LLMs |
| C4 | 305 GB | T5, PaLM |
| Claude's corpus | Estimated 1–5 TB+ | Claude |

Modern LLMs train on **1–15 trillion tokens** — far more than any human could read in a lifetime (a human reading 200 words/minute for 80 years reads ~1.2 billion words, roughly 1.5 billion tokens).

## Data Curation — Quality Over Quantity

Raw internet data is noisy: spam, duplicate content, malware, low-quality text. Data curation pipelines are critical:

**Filtering steps:**
1. **Language detection** — keep only target languages (or desired mix)
2. **Quality filtering** — heuristics like perplexity (is this fluent text?), punctuation ratio, word count
3. **Deduplication** — near-duplicate detection at URL, paragraph, and n-gram level; duplicates harm generalisation
4. **Safety filtering** — remove CSAM, extreme violence, PII
5. **Domain weighting** — code, books, academic papers, and high-quality web text are upweighted; raw forum posts downweighted

**Why deduplication matters:** a model seeing the same text 100 times memorises it rather than generalising. Memorisation wastes compute and creates privacy and copyright risks.

## Data Mix and Domain Weighting

Different data sources affect different capabilities:

| Source | Primary capability gained |
|--------|--------------------------|
| Books, Wikipedia | Factual knowledge, formal reasoning |
| Code (GitHub) | Programming, logical structure, tool use |
| Academic papers | Technical reasoning, citation style |
| Web text | Common knowledge, conversational style |
| Math datasets | Mathematical reasoning |

Claude's strong coding ability comes partly from significant code data in pre-training. Its careful, nuanced writing style reflects high-quality prose in the training mix. Anthropic's data mix decisions — what to include, what to upweight — are among the most consequential and proprietary choices in Claude's development.

## The Training Token Budget

A training run processes each token once (or a few times). The total **token budget** is:

\`\`\`
Total tokens processed = dataset_size × num_epochs

For most LLMs: 1–3 epochs (each token seen ~1–3 times)
\`\`\`

Processing a token costs approximately 6 × (number of parameters) FLOPs:
- ~2 FLOPs forward pass per parameter per token
- ~4 FLOPs backward pass per parameter per token

For a 70B model training on 2T tokens:
\`\`\`
6 × 70×10⁹ × 2×10¹² = 8.4×10²³ FLOPs ≈ 10²⁴ FLOP
\`\`\`

At A100 GPU throughput (~300 TFLOP/s) with 50% efficiency:
\`\`\`
10²⁴ / (150×10¹²) ≈ 6.7×10⁹ seconds / (number of GPUs)
With 1,024 GPUs: ~77 days
\`\`\`

This is why pre-training is expensive, irreversible, and planned carefully.`,
      keyTerms: [
        { term: 'Self-Supervised Learning', definition: 'Learning without explicit labels by using the data itself as supervision. Next-token prediction uses the next token as its own label.' },
        { term: 'Pre-training Corpus', definition: 'The massive text dataset used to pre-train an LLM. Modern corpora contain 1–15 trillion tokens from filtered web, books, code, and papers.' },
        { term: 'Data Deduplication', definition: 'Removing near-duplicate text from training data. Critical for generalisation — models memorise repeated content rather than learning patterns.' },
        { term: 'Domain Weighting', definition: 'Adjusting the fraction of different data sources (code, books, web) in training. Directly affects which capabilities the model develops.' },
        { term: 'FLOP Budget', definition: 'Total floating-point operations for a training run: ~6 × parameters × tokens. Determines training cost and is a key resource in scaling laws.' },
      ],
    },
    {
      id: '9-2', number: '9.2',
      title: 'Scaling Laws — Predicting AI Progress',
      duration: 15,
      content: `# Scaling Laws — Predicting AI Progress

One of the most significant empirical discoveries in AI is that language model performance follows **power law scaling laws** — predictable relationships between model size, data, compute, and capability. These laws allow AI labs to plan billion-dollar training runs before they execute them.

## The OpenAI Scaling Laws (2020)

Kaplan et al. (2020) discovered that test loss scales as a power law in model parameters N, dataset size D, and compute budget C:

\`\`\`
L(N) ∝ N^(-αN)     (parameters alone)
L(D) ∝ D^(-αD)     (data alone)
L(C) ∝ C^(-αC)     (compute alone)
\`\`\`

Where the exponents αN, αD, αC are approximately 0.076, 0.095, and 0.050 respectively.

**What this means:** doubling the model (while holding data and compute fixed) reduces loss by a predictable, small factor. The relationships are smooth power laws, not step functions — there are no discontinuities. You can plot loss against log(compute) and get a straight line.

**The implication for AI labs:** given a compute budget, you can predict what loss you will achieve before running the experiment. This is why large model training runs are planned months in advance.

## Chinchilla — The Compute-Optimal Law (2022)

The Kaplan scaling laws implied: for a fixed compute budget, scale up model parameters as much as possible. This led to large, undertrained models (GPT-3 at 175B parameters was trained on 300B tokens).

Hoffmann et al. (DeepMind, 2022) — the "Chinchilla" paper — overturned this. Using a cleaner experimental design:

> **Compute-optimal training:** for a given compute budget C, the optimal model has N* parameters and is trained on D* = 20N tokens.

\`\`\`
N* ∝ C^0.5    (model size)
D* ∝ C^0.5    (dataset size, ~20N tokens)
\`\`\`

The 20:1 token-to-parameter ratio is the key takeaway. GPT-3 (175B params, 300B tokens) was undertrained by ~10×. A compute-optimal model of that size should train on ~3.5 trillion tokens.

**Consequences:**
- LLaMA (2023): 7B–65B parameter models trained on 1–1.4T tokens — outperforming larger models trained on less data
- Chinchilla (70B, 1.4T tokens): matched GPT-3 (175B, 300B tokens) at one-third the parameters

This reoriented the entire field: smaller, longer-trained models often beat larger, undertrained ones.

## What Scales and What Does Not

| What scales predictably | What does not |
|-------------------------|---------------|
| Next-token prediction loss | Specific capabilities |
| Broad knowledge breadth | Reasoning chains |
| Language fluency | Factual accuracy |
| In-context learning | Hallucination rate |

Loss scaling does not guarantee proportional improvement in every benchmark. Some capabilities appear suddenly and unpredictably.

## The Inference Cost Dimension

The Chinchilla insight created a new trade-off: a 70B model trained on 1.4T tokens may match a 175B undertrained model in capability, but:
- **Training cost**: 70B is much cheaper to train
- **Inference cost**: 70B is much cheaper to serve (smaller KV-cache, faster forward pass)

For a production API serving millions of requests daily, inference cost dominates. This is why Meta released LLaMA (7B, 13B, 70B) rather than one large model — smaller well-trained models are more economical to serve.

## Scaling Laws for Downstream Tasks

The relationship between loss and downstream task performance is messier. Broadly:
- Tasks requiring only knowledge and fluency improve smoothly with scale
- Tasks requiring multi-step reasoning or novel composition show discontinuous jumps

This creates an important challenge for safety: **you cannot always predict when a new capability will emerge by extrapolating from smaller models.** A model might fail at a task through scale 70B and then suddenly succeed at 100B.

## Compute Frontiers

Current estimates of compute used for major models:

| Model | Estimated training FLOP |
|-------|------------------------|
| GPT-3 | ~3 × 10²³ |
| PaLM | ~2.5 × 10²⁴ |
| GPT-4 | ~2 × 10²⁵ (estimated) |
| Claude 3 Opus | Undisclosed, likely >10²⁵ |

Each order of magnitude costs ~10× more. The largest training runs today cost $10–100M in compute. Scaling laws predict how much performance improvement each additional dollar buys — making them central to strategic planning at AI labs.`,
      keyTerms: [
        { term: 'Scaling Laws', definition: 'Power law relationships between model performance and model size, data, and compute. Allow predicting training outcomes before execution.' },
        { term: 'Chinchilla Scaling', definition: 'Compute-optimal training: for budget C, optimal model has N* ∝ C^0.5 parameters trained on 20N tokens. Overturned previous larger-is-better wisdom.' },
        { term: 'Compute-Optimal', definition: 'Training configuration (model size + dataset size) that achieves the lowest loss for a given compute budget. Approximately 20 tokens per parameter.' },
        { term: 'Undertrained', definition: 'A model trained on fewer tokens than compute-optimal. GPT-3 was undertrained — a smaller model with more tokens can match it.' },
        { term: 'Inference Cost', definition: 'The ongoing computational cost of serving model predictions. For production APIs, this often exceeds total training cost over a model\'s lifetime.' },
      ],
    },
    {
      id: '9-3', number: '9.3',
      title: 'Distributed Training and the Engineering Stack',
      duration: 13,
      content: `# Distributed Training and the Engineering Stack

Training a 70B parameter model on 2 trillion tokens is not just a mathematical exercise — it is a massive distributed systems problem. The engineering required to run these training jobs reliably, efficiently, and at scale is itself a frontier research area, and understanding it explains both the capabilities and the costs of modern AI.

## Why Single-GPU Training Fails

A 70B parameter model in BF16 (2 bytes per param) requires 140 GB just to store weights. An A100 GPU has 80 GB VRAM. Single-GPU training is impossible. Even if weights fit, the activations, gradients, and optimiser states multiply the memory requirement by 10–20×.

**Memory breakdown for one training step:**
\`\`\`
Weights (BF16):        2 × N bytes
Gradients (FP32):      4 × N bytes
Adam states (FP32):    8 × N bytes   ← 2 moments
Activations:           ~2 × N bytes  (varies with sequence length)
Total:                 ~16 × N bytes
\`\`\`

For N = 70B: ~1,100 GB — roughly 14 A100 GPUs just for memory.

## Parallelism Strategies

### Data Parallelism
Replicate the full model across multiple GPUs. Each GPU processes a different batch; gradients are averaged (AllReduce) across GPUs after each step.

\`\`\`
GPU 0: model copy, batch 0 → gradient 0 ─┐
GPU 1: model copy, batch 1 → gradient 1  ├→ AllReduce → averaged gradient → update
GPU 2: model copy, batch 2 → gradient 2 ─┘
\`\`\`

Works when model fits on one GPU. Does not help with memory.

### Tensor Parallelism
Split individual tensors (weight matrices) across GPUs. Each GPU holds a shard of each layer:

\`\`\`
W: (d_model, 4×d_model) = (8192, 32768)
GPU 0: columns 0..8191
GPU 1: columns 8192..16383
GPU 2: columns 16384..24575
GPU 3: columns 24576..32767
\`\`\`

Requires fast inter-GPU communication (NVLink) for AllReduce within each layer. Used in Megatron-LM — the framework behind many large model training runs.

### Pipeline Parallelism
Split the model **by layer** across GPUs:
\`\`\`
GPU 0: layers 0–19
GPU 1: layers 20–39
GPU 2: layers 40–59
GPU 3: layers 60–79
\`\`\`

Activations are passed between GPUs at layer boundaries. Introduces "pipeline bubbles" (GPUs idle while waiting for activations) — minimised through careful micro-batch scheduling.

### 3D Parallelism
Production training combines all three:
\`\`\`
Data parallel × Tensor parallel × Pipeline parallel = Total GPU count
e.g., 8 × 8 × 8 = 512 GPUs for one training run
\`\`\`

Anthropic, OpenAI, and Google use variations of 3D parallelism for frontier model training.

## Mixed Precision Training

Training in FP32 is wasteful — most computations are accurate enough in lower precision. **Mixed precision** uses BF16 for forward/backward passes and FP32 for weight updates:

\`\`\`
Forward pass:   BF16 (fast, small)
Backward pass:  BF16 (fast, small)
Weight update:  FP32 (precise, critical)
\`\`\`

**BF16 vs FP16:**
- FP16: 1 sign bit, 5 exponent, 10 mantissa — can overflow for large values
- BF16: 1 sign bit, 8 exponent, 7 mantissa — same range as FP32, less precision

BF16 is preferred for LLM training because it matches FP32's dynamic range, preventing overflow during gradient accumulation. A100 and H100 GPUs have native BF16 hardware.

## Gradient Checkpointing

The forward pass generates intermediate activations (needed for backprop). Storing all activations uses O(N_layers × batch × T × d_model) memory — enormous.

**Gradient checkpointing** trades memory for compute: only store activations at certain "checkpoint" layers. During backprop, recompute intermediate activations from the nearest checkpoint.

\`\`\`python
# PyTorch gradient checkpointing
from torch.utils.checkpoint import checkpoint

def forward_with_checkpointing(x):
    for i, block in enumerate(self.blocks):
        if i % 2 == 0:  # Checkpoint every other block
            x = checkpoint(block, x)  # Don't store activations
        else:
            x = block(x)             # Store activations normally
    return x
\`\`\`

Typical saving: 2–4× memory reduction at ~33% compute overhead (one extra forward pass per checkpointed segment).

## Flash Attention — Algorithmic Efficiency

The O(T²) attention bottleneck limits context length. **Flash Attention** (Dao et al., 2022) achieves the same mathematical result as standard attention but with:
- **O(T) memory** instead of O(T²) by never materialising the full attention matrix
- **~3× faster** than standard attention through I/O-aware kernel design

Flash Attention works by processing attention in tiles that fit in SRAM (on-chip memory), avoiding expensive DRAM reads/writes. It is now the default in every production LLM framework and is why long-context models (Claude's 200K context window) became feasible.

## Fault Tolerance at Scale

A 1,024-GPU training run running for 2 months faces hardware failures. Strategies:
- **Checkpointing:** save model state every few hours; resume from last checkpoint on failure
- **Gradient accumulation:** accumulate gradients over multiple micro-batches, reducing communication frequency
- **Redundant storage:** model checkpoints on distributed filesystems (S3, HDFS)

Training runs at frontier labs dedicate significant engineering effort to making 3-month runs robust to GPU failures, network partitions, and software bugs.`,
      keyTerms: [
        { term: 'Tensor Parallelism', definition: 'Splitting weight matrices across GPUs — each holds a shard. Requires fast inter-GPU communication (NVLink) for AllReduce.' },
        { term: 'Pipeline Parallelism', definition: 'Splitting the model by layer across GPUs. Introduces pipeline bubbles but reduces memory per GPU proportionally.' },
        { term: 'BF16 (bfloat16)', definition: '16-bit format with the same exponent range as FP32. Standard for LLM training — avoids overflow while halving memory vs FP32.' },
        { term: 'Gradient Checkpointing', definition: 'Trade compute for memory by recomputing activations during backprop rather than storing them. Reduces activation memory by 2–4×.' },
        { term: 'Flash Attention', definition: 'I/O-aware attention algorithm achieving O(T) memory vs standard O(T²). ~3× faster by tiling computation to fit in SRAM. Enables long-context models.' },
      ],
    },
    {
      id: '9-4', number: '9.4',
      title: 'Emergent Capabilities and Phase Transitions',
      duration: 13,
      content: `# Emergent Capabilities and Phase Transitions

One of the most striking and controversial aspects of large language model scaling is **emergence**: the appearance of qualitatively new capabilities that were absent at smaller scales and appear sharply as models grow. Understanding emergence is crucial for anticipating future AI capabilities — and for safety.

## What Emergence Means

A capability is **emergent** if it appears suddenly after a threshold of scale, rather than improving gradually. The classic example from Wei et al. (2022):

\`\`\`
3-digit addition:
  GPT-2 (1.5B):  ~0% correct
  GPT-3 (13B):   ~0% correct
  GPT-3 (175B):  ~80% correct
\`\`\`

From zero to 80% with no smooth improvement in between — a phase transition analogous to water freezing.

## The Controversy: Measurement Artefact or Real?

Schaeffer et al. (2023) argued that many "emergent" capabilities are measurement artefacts:
- If you measure with a metric that only gives 0 or 1 (correct/incorrect), you miss partial improvement
- With continuous metrics, the same capabilities show smooth scaling

This debate matters enormously. If emergence is real, there may be dangerous capabilities that suddenly appear at some future scale threshold — you cannot predict or prevent them by extrapolating from small models.

If emergence is a measurement artefact, then capability improvement is gradual and can be tracked, anticipated, and managed.

The current scientific consensus: some emergence is genuine (particularly compositional tasks requiring multiple sub-skills); some is measurement artefact. The distinction is an active research question.

## Documented Emergent Capabilities

Capabilities observed to emerge at scale:

| Capability | Approximate threshold |
|------------|----------------------|
| Few-shot learning | ~10B parameters |
| Chain-of-thought reasoning | ~100B parameters |
| Multi-step arithmetic | ~30–100B parameters |
| Instruction following | ~10B + instruction fine-tuning |
| Code generation | ~10B+ |
| Self-correction | ~100B+ |
| Theory of mind tasks | ~100B+ |

## Chain-of-Thought Prompting

One of the most practically important emergent behaviours is the ability to reason step-by-step when prompted to do so:

\`\`\`
Standard prompt:
"Q: Roger has 5 tennis balls. He buys 2 more cans of 3. How many does he have?"
"A: 11"   ← Small models often wrong

Chain-of-thought prompt:
"Q: [same question] Let's think step by step."
"A: Roger starts with 5. He buys 2 cans × 3 balls = 6 balls. 5 + 6 = 11."   ← Correct
\`\`\`

Chain-of-thought (CoT) reliably improves performance on multi-step reasoning. The model appears to use the intermediate steps as working memory — externalising computation into the context. This only works at ~100B+ parameter scale; smaller models produce incoherent chains.

## Implications for AI Safety

Emergence creates a fundamental difficulty for safety:

1. **Unpredictable capabilities:** a model that fails at a task at 70B might succeed at 100B. Safety evaluations on smaller models may miss dangerous capabilities.

2. **Discontinuous improvement:** some capabilities appear abruptly rather than gradually, making it harder to anticipate when a model crosses a threshold.

3. **Unknown unknowns:** there may be categories of capability that no one has thought to test for.

Anthropic's approach: extensive evaluation at every scale before deployment, red-teaming for novel capabilities, and what they call the "responsible scaling policy" — committing to specific safety evaluations before training runs above certain compute thresholds.

## Grokking — Delayed Generalisation

A related phenomenon: **grokking** (Power et al., 2022). Small models trained on arithmetic tasks show:
- **Phase 1:** Training loss drops quickly, validation loss stays high (memorisation)
- **Phase 2:** After extended training, validation loss suddenly drops (generalisation)

The model "groks" — suddenly learns the underlying rule rather than memorising examples. This occurs long after training loss converged, suggesting that:
- Models continue to learn structure after overfitting
- Standard early stopping may prevent models from reaching genuine understanding
- More training steps (not just more data) can unlock qualitatively different behaviour

Grokking is actively studied as a model of how LLMs develop robust generalisation during pre-training, and has implications for understanding when a model "truly understands" versus memorises.

## What This Means for Practitioners

When using Claude or any LLM:
- **Expect discontinuous improvement:** a task that Claude 3 Sonnet fails may work on Claude 3 Opus — capability differences can be categorical, not incremental
- **Prompt complexity matters:** chain-of-thought, few-shot examples, and step-by-step instructions unlock capabilities that standard prompts do not
- **Novel tasks:** Claude may have capabilities it has never demonstrated that appear with the right prompt — exploration is worthwhile
- **Limits are real:** some capabilities genuinely don't exist yet at current scale — no prompt will produce reliable 20-step arithmetic without tool use`,
      keyTerms: [
        { term: 'Emergent Capability', definition: 'A model ability that is absent at small scales and appears sharply at a threshold scale rather than improving gradually.' },
        { term: 'Chain-of-Thought (CoT)', definition: 'Prompting technique eliciting step-by-step reasoning. Reliably improves multi-step problem solving; only effective at ~100B+ parameter scale.' },
        { term: 'Phase Transition', definition: 'An analogy from physics: a sharp, discontinuous change in system behaviour at a critical threshold. Describes capability emergence in LLMs.' },
        { term: 'Grokking', definition: 'Delayed generalisation: models first memorise training data, then suddenly learn underlying rules after extended training — long after training loss converges.' },
        { term: 'Responsible Scaling Policy', definition: 'Anthropic\'s commitment to specific safety evaluations before training above each compute threshold, addressing the unpredictability of emergent capabilities.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q9-1', title: 'Quiz 9.1 — Pre-training Objective and Data',
      type: 'lesson', moduleId: 'm9', passMark: 70,
      questions: [
        {
          id: 'q9-1-1', type: 'multiple_choice',
          question: 'LLM pre-training is called "self-supervised" because:',
          options: [
            'The model supervises its own fine-tuning process',
            'Labels come from the data itself — the next token is its own label, requiring no human annotation',
            'The model uses reinforcement signals from human supervisors',
            'Only self-referential text is used in the training corpus',
          ],
          correctAnswer: 'Labels come from the data itself — the next token is its own label, requiring no human annotation',
          gradingRubric: 'Award full marks for the second option. Self-supervised learning generates supervision from data structure — the position of each token serves as its label, enabling training on vast unlabelled text.',
          xpValue: 10,
        },
        {
          id: 'q9-1-2', type: 'short_answer',
          question: 'Why does next-token prediction force a model to develop broad world knowledge, rather than just learning word co-occurrence statistics?',
          correctAnswer: 'To predict accurately across diverse text, the model must learn the underlying world that generated it — facts, reasoning, language structure. Pure co-occurrence is insufficient for predicting knowledge-dependent continuations.',
          gradingRubric: 'Award marks for: (1) prediction requires understanding the real-world context of text; (2) factual knowledge directly improves prediction; (3) pure statistical patterns fail on knowledge-dependent sentences.',
          xpValue: 20,
        },
        {
          id: 'q9-1-3', type: 'multiple_choice',
          question: 'Data deduplication is critical in pre-training because:',
          options: [
            'Duplicate data slows down the tokeniser',
            'Models memorise repeated content instead of learning generalisable patterns, wasting compute',
            'Deduplication reduces copyright infringement',
            'Duplicate tokens confuse the positional encoding',
          ],
          correctAnswer: 'Models memorise repeated content instead of learning generalisable patterns, wasting compute',
          gradingRubric: 'Award full marks for the second option. Memorisation is the opposite of generalisation. Repeated content is learned by rote rather than by extracting underlying patterns — wasting training compute.',
          xpValue: 10,
        },
        {
          id: 'q9-1-4', type: 'multiple_choice',
          question: 'Including large amounts of code (Python, C, JavaScript) in the pre-training corpus primarily improves:',
          options: [
            'The model\'s ability to speak in code-switching between languages',
            'Programming ability, logical structure, and structured reasoning capabilities',
            'The model\'s vocabulary size',
            'Tokenisation efficiency for natural language',
          ],
          correctAnswer: 'Programming ability, logical structure, and structured reasoning capabilities',
          gradingRubric: 'Award full marks for the second option. Code is densely structured, logical, and step-sequential — training on it improves not just coding but general logical reasoning that transfers to other domains.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q9-2', title: 'Quiz 9.2 — Scaling Laws',
      type: 'lesson', moduleId: 'm9', passMark: 70,
      questions: [
        {
          id: 'q9-2-1', type: 'multiple_choice',
          question: 'The Chinchilla paper\'s key finding was that compute-optimal LLM training requires:',
          options: [
            'As many parameters as possible given the compute budget',
            'Approximately equal model size and dataset size in terabytes',
            'Approximately 20 training tokens per model parameter',
            'Training for at least 100 epochs over the dataset',
          ],
          correctAnswer: 'Approximately 20 training tokens per model parameter',
          gradingRubric: 'Award full marks for the third option. Chinchilla showed that optimal N* and D* both scale as C^0.5, and empirically D* ≈ 20N* — 20 tokens per parameter is the compute-optimal ratio.',
          xpValue: 15,
        },
        {
          id: 'q9-2-2', type: 'multiple_choice',
          question: 'GPT-3 (175B params, 300B tokens) was considered "undertrained" post-Chinchilla because:',
          options: [
            'It used an outdated architecture',
            'Compute-optimally, a 175B model should train on ~3.5 trillion tokens — 10× more data',
            'It was trained on insufficient hardware',
            'Its learning rate schedule was not cosine annealed',
          ],
          correctAnswer: 'Compute-optimally, a 175B model should train on ~3.5 trillion tokens — 10× more data',
          gradingRubric: 'Award full marks for the second option. 175B params × 20 tokens/param = 3.5 trillion tokens. GPT-3 trained on only 300B — Chinchilla said it should be ~10× larger dataset for the same compute.',
          xpValue: 15,
        },
        {
          id: 'q9-2-3', type: 'short_answer',
          question: 'Why do AI labs care about inference cost as well as training cost when deciding model size?',
          correctAnswer: 'A production API serving millions of users runs inference continuously. Over a model\'s lifetime, inference compute often exceeds training compute — smaller, well-trained models are cheaper to serve per query.',
          gradingRubric: 'Award marks for: (1) inference is ongoing; (2) scales with usage (requests/day); (3) smaller model = cheaper per query; (4) total inference cost can dwarf training cost over the model\'s deployment lifetime.',
          xpValue: 20,
        },
        {
          id: 'q9-2-4', type: 'multiple_choice',
          question: 'Power law scaling means that to halve the loss, you must:',
          options: [
            'Double the model size',
            'Increase compute by a factor much larger than 2 (the exact factor depends on the exponent)',
            'Train for exactly twice as many steps',
            'Double both model size and dataset size simultaneously',
          ],
          correctAnswer: 'Increase compute by a factor much larger than 2 (the exact factor depends on the exponent)',
          gradingRubric: 'Award full marks for the second option. Power laws L ∝ C^(-α) mean halving loss requires C → (0.5)^(-1/α) times more compute. With α ≈ 0.05, this is 0.5^(-20) = 2^20 ≈ 1 million× more compute.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q9-3', title: 'Quiz 9.3 — Distributed Training',
      type: 'lesson', moduleId: 'm9', passMark: 70,
      questions: [
        {
          id: 'q9-3-1', type: 'multiple_choice',
          question: 'BF16 is preferred over FP16 for LLM training because:',
          options: [
            'BF16 is twice as fast to compute',
            'BF16 has the same exponent range as FP32, avoiding overflow during gradient accumulation',
            'FP16 is not supported on modern GPUs',
            'BF16 uses 8 bits per value instead of 16',
          ],
          correctAnswer: 'BF16 has the same exponent range as FP32, avoiding overflow during gradient accumulation',
          gradingRubric: 'Award full marks for the second option. BF16 sacrifices mantissa precision (7 bits vs 10 in FP16) to keep FP32\'s 8-bit exponent — preventing the overflow issues that plagued FP16 training for large models.',
          xpValue: 10,
        },
        {
          id: 'q9-3-2', type: 'multiple_choice',
          question: 'Gradient checkpointing reduces memory usage by:',
          options: [
            'Keeping gradients in CPU RAM instead of GPU VRAM',
            'Not storing intermediate activations, recomputing them during backpropagation when needed',
            'Reducing gradient precision from FP32 to FP16',
            'Only computing gradients for the last 10 layers',
          ],
          correctAnswer: 'Not storing intermediate activations, recomputing them during backpropagation when needed',
          gradingRubric: 'Award full marks for the second option. Instead of storing all forward pass activations (huge memory), checkpointing discards them and recomputes from the nearest checkpoint during backprop — trading ~33% extra compute for 2–4× memory reduction.',
          xpValue: 10,
        },
        {
          id: 'q9-3-3', type: 'short_answer',
          question: 'Flash Attention achieves the same mathematical result as standard attention but with O(T) memory instead of O(T²). How is this possible?',
          correctAnswer: 'Flash Attention tiles the computation into blocks that fit in SRAM, computing attention scores and weighted values in chunks without materialising the full T×T attention matrix in DRAM.',
          gradingRubric: 'Award marks for: (1) tiles/block-wise processing; (2) avoids materialising the full T×T matrix; (3) keeps computation in fast on-chip SRAM; (4) same mathematical output, different memory access pattern.',
          xpValue: 20,
        },
        {
          id: 'q9-3-4', type: 'multiple_choice',
          question: 'In 3D parallelism, "data parallel × tensor parallel × pipeline parallel = total GPUs" means:',
          options: [
            'Each GPU performs a different type of parallel operation',
            'The three parallelism strategies are applied simultaneously to different dimensions of the training problem',
            'Only one parallelism strategy can be active at any time',
            'Pipeline parallelism is three times faster than the other strategies',
          ],
          correctAnswer: 'The three parallelism strategies are applied simultaneously to different dimensions of the training problem',
          gradingRubric: 'Award full marks for the second option. Data parallelism handles batch dimension, tensor parallelism handles weight matrices, pipeline parallelism handles layers — all active simultaneously, multiplying the total GPU count.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q9-4', title: 'Quiz 9.4 — Emergence and Phase Transitions',
      type: 'lesson', moduleId: 'm9', passMark: 70,
      questions: [
        {
          id: 'q9-4-1', type: 'multiple_choice',
          question: 'Chain-of-thought prompting is most effective for:',
          options: [
            'All tasks, regardless of model size',
            'Simple factual retrieval questions',
            'Multi-step reasoning tasks at ~100B+ parameter scale',
            'Reducing output length and token cost',
          ],
          correctAnswer: 'Multi-step reasoning tasks at ~100B+ parameter scale',
          gradingRubric: 'Award full marks for the third option. CoT uses the context as working memory for intermediate steps — this requires sufficient model capacity to produce coherent chains. At small scales, chains are incoherent and unhelpful.',
          xpValue: 10,
        },
        {
          id: 'q9-4-2', type: 'multiple_choice',
          question: 'Anthropic\'s Responsible Scaling Policy addresses emergent capabilities by:',
          options: [
            'Capping model size at current levels until emergence is better understood',
            'Committing to specific safety evaluations before training above each compute threshold',
            'Open-sourcing all model weights so researchers can study emergence',
            'Requiring all models to pass a fixed capability benchmark before deployment',
          ],
          correctAnswer: 'Committing to specific safety evaluations before training above each compute threshold',
          gradingRubric: 'Award full marks for the second option. The RSP establishes "if we plan to train above compute level X, we must first demonstrate safety measures Y" — acknowledging that capabilities may emerge unpredictably at higher scales.',
          xpValue: 15,
        },
        {
          id: 'q9-4-3', type: 'short_answer',
          question: 'What is "grokking" and what does it suggest about when we should stop training a model?',
          correctAnswer: 'Grokking: models first memorise training data (low train loss, high val loss), then suddenly generalise after extended training. It suggests early stopping may prevent genuine understanding — more training steps can unlock qualitative improvements.',
          gradingRubric: 'Award marks for: (1) delayed generalisation after initial memorisation; (2) sudden drop in validation loss long after training loss converged; (3) implication: longer training or more data may produce qualitatively different (better) models.',
          xpValue: 20,
        },
        {
          id: 'q9-4-4', type: 'multiple_choice',
          question: 'If Claude 3 Sonnet fails at a task but Claude 3 Opus succeeds, this is likely an example of:',
          options: [
            'A bug in Sonnet\'s API implementation',
            'Emergent capability — a threshold crossed at higher scale enabling qualitatively new behaviour',
            'Different system prompts being used for the two models',
            'Sonnet having a smaller context window',
          ],
          correctAnswer: 'Emergent capability — a threshold crossed at higher scale enabling qualitatively new behaviour',
          gradingRubric: 'Award full marks for the second option. Opus is substantially larger than Sonnet. Categorical capability differences between model tiers — not gradual improvement — are a signature of emergent behaviour at scale thresholds.',
          xpValue: 10,
        },
      ],
    },
  ],
  project: {
    id: 'p9', moduleId: 'm9',
    name: 'Scaling Law Calculator',
    emoji: '📊',
    description: 'Build an interactive scaling law explorer. Given a compute budget (in FLOP), plot the Chinchilla-optimal model size and dataset size. Include a "training run planner" that estimates cost, time, and predicted loss for different configurations, using real GPU throughput numbers.',
    tools: ['React', 'Recharts or D3.js', 'Tailwind CSS', 'Scaling law equations from Chinchilla paper'],
    status: 'not_started',
    rubric: [
      'Correctly implements Chinchilla compute-optimal equations: N* ∝ C^0.5, D* = 20N*',
      'Interactive compute budget slider (10²² to 10²⁶ FLOP) with live N* and D* outputs',
      'Plots predicted loss vs compute on a log-log scale showing the power law relationship',
      'GPU cost estimator: input GPU count and hours, output total FLOP and estimated cloud cost',
      'Comparison table: user configuration vs compute-optimal configuration for the same budget',
    ],
    xpReward: 280,
  },
}

// ─── MODULE 10 ────────────────────────────────────────────────────────────────
const m10: Module = {
  id: 'm10', number: 10, arc: 2,
  title: 'Alignment and RLHF',
  description: 'Understand how a pre-trained model becomes a helpful, harmless, and honest assistant — supervised fine-tuning, reward modelling, PPO, and Anthropic\'s Constitutional AI approach that shapes Claude\'s values.',
  prerequisiteModuleId: 'm9',
  lessons: [
    {
      id: '10-1', number: '10.1',
      title: 'The Alignment Problem',
      duration: 14,
      content: `# The Alignment Problem

A pre-trained language model has absorbed vast knowledge and capability — but it is not aligned with human values. It completes text, not assists humans. It may produce harmful, deceptive, or dangerous outputs if prompted that way. Transforming a capable pre-trained model into a safe, helpful assistant is the **alignment problem** — one of the most important open problems in AI.

## What Pre-training Produces

After pre-training, a model can:
- Complete any text in a statistically plausible way
- Produce harmful content if the prompt implies it
- Roleplay as any persona, including malicious ones
- Hallucinate confidently with no awareness of uncertainty
- Respond to "How do I make [dangerous thing]?" with instructions, because that's what follows such text on the internet

The pre-trained model has no inherent preference for helpful over harmful, true over false, or careful over reckless. It is a very sophisticated autocomplete.

## Goodhart's Law and Reward Hacking

A core challenge in alignment is **Goodhart's Law**:

> "When a measure becomes a target, it ceases to be a good measure."

In AI: if we define a reward function and optimise for it, the model will find ways to maximise the reward that were not intended — **reward hacking**.

Examples:
- A game AI trained to maximise score may find exploits that score highly without playing the game
- An AI trained on "human approval" may learn to flatter users rather than help them
- An AI trained to "avoid refusals" may provide harmful content to appear helpful

The challenge: how do you specify what you actually want, rather than a proxy that can be gamed?

## The Three Properties: HHH

Anthropic's stated goal for Claude: **Helpful, Harmless, and Honest (HHH)**:

| Property | Meaning |
|----------|---------|
| **Helpful** | Genuinely assists users in achieving their goals |
| **Harmless** | Does not cause physical, psychological, financial, or societal harm |
| **Honest** | Truthful, calibrated, transparent, non-deceptive, non-manipulative |

These properties can conflict. A maximally helpful response might share information that is harmful. A maximally harmless model might refuse so much that it becomes useless. Honesty might require sharing uncomfortable truths. Alignment research is partly about navigating these tensions.

## Why Alignment Is Hard

**Specification difficulty:** It is very hard to write down all the things a model should and should not do. Edge cases are infinite. What counts as "harmful" depends on context, intent, and who is asking.

**Distributional shift:** The model will encounter prompts that look nothing like its training data. Alignment that works in distribution may fail on novel inputs.

**Capability vs alignment gap:** Highly capable models may be better at finding misaligned strategies. Alignment must scale with capability.

**Inner alignment:** Even if the training objective is aligned, the learned model may pursue a different internal goal that produces aligned-seeming behaviour during training but diverges at deployment.

## The Alignment Tax

Early work suggested that aligned models perform worse on capabilities benchmarks — an "alignment tax". More recent work (RLHF, Constitutional AI) has shown this can be minimised or reversed:
- Instruction-tuned models often outperform base models on complex tasks
- RLHF-tuned models produce better code, better reasoning, better writing
- The model becomes more useful, not less, when aligned well

Claude's strong benchmark performance alongside its safety properties is evidence that the alignment tax is not fundamental — alignment and capability can be complementary.

## The Path to Alignment: A Three-Step Pipeline

The standard modern approach:

\`\`\`
Step 1: Pre-training
  Massive text corpus → model with broad knowledge and capability

Step 2: Supervised Fine-Tuning (SFT)
  Curated (prompt, response) pairs → model that follows instructions

Step 3: Reinforcement Learning from Human Feedback (RLHF)
  Human preferences + RL → model that maximises human approval of outputs
\`\`\`

Each step builds on the previous. Pre-training provides the foundation; SFT provides instruction following; RLHF shapes values and quality. This pipeline — or variations of it — is used by Anthropic, OpenAI, Google DeepMind, and virtually every frontier AI lab.`,
      keyTerms: [
        { term: 'Alignment', definition: 'Ensuring an AI system pursues intended goals and behaves safely. The gap between what a model can do and what we want it to do.' },
        { term: 'Goodhart\'s Law', definition: '"When a measure becomes a target, it ceases to be a good measure." In AI: optimising a proxy reward leads to unintended behaviours.' },
        { term: 'Reward Hacking', definition: 'When a model finds high-reward strategies that satisfy the reward function but not the underlying intent. A fundamental challenge in RL-based alignment.' },
        { term: 'HHH (Helpful, Harmless, Honest)', definition: 'Anthropic\'s three core properties for Claude. These sometimes conflict, and balancing them is an active research challenge.' },
        { term: 'Alignment Tax', definition: 'The hypothetical capability cost of alignment. Recent evidence suggests well-done alignment is complementary to capability, not in tension with it.' },
      ],
    },
    {
      id: '10-2', number: '10.2',
      title: 'Supervised Fine-Tuning — Teaching to Follow Instructions',
      duration: 13,
      content: `# Supervised Fine-Tuning — Teaching to Follow Instructions

The first step after pre-training is **Supervised Fine-Tuning (SFT)**: training the model on a curated dataset of (instruction, ideal response) pairs. This transforms the model from "text completer" to "instruction follower" — a fundamental shift in behaviour.

## What SFT Does

Pre-training objective: predict the next token in any text
SFT objective: given a human instruction, produce a helpful response

The training signal is the same (cross-entropy loss on the response tokens), but the data is completely different:

\`\`\`
Pre-training data:
  "The Battle of Hastings occurred in 1066. William the Conqueror..."

SFT data:
  Human: "Explain the Battle of Hastings in simple terms."
  Assistant: "The Battle of Hastings (1066) was a pivotal moment in English history..."
\`\`\`

The model learns to condition on the instruction format and produce responses in the assistant style.

## The Instruction Format

Models are trained with explicit conversation formatting. Claude's internal format (simplified):

\`\`\`
\x00H\nHello, can you help me with Python?

\x00A\nOf course! I'd be happy to help with Python. What do you need?

\x00H\n[user message continues...]
\`\`\`

These special tokens (\x00H = Human, \x00A = Assistant) teach the model to distinguish between human messages and its own responses, and to only predict the assistant portions. This format is why Claude naturally responds in a certain voice and structure — it was trained on many examples with this schema.

## Building the SFT Dataset

Collecting high-quality SFT data is expensive and critical:

**Approaches:**
1. **Human-written demonstrations:** contractors write ideal responses to diverse instructions. Expensive (~$20–50 per example) but highest quality. Used for the most important instruction types.

2. **Model-generated + filtered:** generate many responses with a capable model, then have humans select or edit the best ones. More scalable.

3. **Red-teaming:** deliberately write adversarial instructions and ideal refusals. Teaches the model when and how to decline.

**Data diversity:** SFT datasets cover:
- Question answering (factual, subjective, complex)
- Code generation and debugging
- Creative writing
- Summarisation and extraction
- Conversation and roleplay
- Safety-relevant scenarios (harmful requests, sensitive topics)
- Multi-turn dialogue

Anthropic estimates their SFT dataset includes tens to hundreds of thousands of (instruction, response) pairs across diverse categories.

## Format Following and Special Capabilities

SFT teaches not just what to say but how:
- **Markdown formatting:** responding with headers, bullet points, code blocks when appropriate
- **Appropriate length:** calibrating response length to question complexity
- **Citing uncertainty:** saying "I'm not sure" rather than confabulating
- **Asking clarifying questions:** identifying ambiguous requests
- **Safe refusals:** declining harmful requests politely and helpfully

These behaviours are not emergent from pre-training — they are specifically trained via SFT examples.

## The Limitations of SFT Alone

SFT has critical limitations:

1. **Distribution coverage:** the model only learns from instructions it was shown. Novel instruction types may not be handled well.

2. **No quality gradient:** SFT treats every (instruction, response) pair equally. It cannot distinguish "good but not excellent" from "excellent".

3. **No preference learning:** the model sees one ideal response per instruction. It does not learn to prefer one response over another — the comparison signal that RLHF provides.

4. **Label noise:** human annotators disagree, produce inconsistent quality, and have implicit biases.

5. **Hallucination:** SFT does not specifically address factual accuracy. The model may have learned to sound confident in the SFT style even when wrong.

RLHF addresses points 3 and 4 by training directly on human preferences (comparisons) rather than individual demonstrations.

## Instruction Tuning at Scale

Instruction-following was democratised by papers like:
- **FLAN** (Google, 2022): fine-tuned T5 on 62 NLP tasks phrased as instructions — strong zero-shot generalisation
- **InstructGPT** (OpenAI, 2022): SFT + RLHF on GPT-3 — launched the modern alignment pipeline
- **Alpaca** (Stanford, 2023): GPT-3.5-generated instructions fine-tuned on LLaMA-7B — near InstructGPT quality for a fraction of the cost

The key finding: a small, high-quality SFT dataset (10K–100K examples) applied to a capable pre-trained model produces instruction-following behaviour that generalises broadly. The pre-training foundation is what makes this possible.`,
      keyTerms: [
        { term: 'Supervised Fine-Tuning (SFT)', definition: 'Training a pre-trained model on (instruction, ideal response) pairs. Transforms text completion into instruction following.' },
        { term: 'Instruction Format', definition: 'Special tokens and structure (Human/Assistant turns) that teach the model to distinguish and respond to conversations. Trained via SFT.' },
        { term: 'Human Demonstrations', definition: 'High-quality human-written ideal responses used as SFT training examples. Expensive but high quality.' },
        { term: 'Distribution Coverage', definition: 'The range of instruction types in the SFT dataset. Poor coverage = poor generalisation to novel instructions.' },
        { term: 'InstructGPT', definition: 'OpenAI\'s 2022 paper combining SFT and RLHF on GPT-3. Established the modern alignment pipeline used by all frontier labs.' },
      ],
    },
    {
      id: '10-3', number: '10.3',
      title: 'RLHF — Reinforcement Learning from Human Feedback',
      duration: 16,
      content: `# RLHF — Reinforcement Learning from Human Feedback

Supervised fine-tuning teaches a model to follow instructions, but it cannot directly capture the full richness of human preferences — which response is more helpful, more honest, more carefully reasoned? **RLHF** solves this by training from comparisons rather than demonstrations.

## The RLHF Pipeline

RLHF has three stages:

\`\`\`
Stage 1: SFT (Supervised Fine-Tuning)
  Pre-trained model → instruction-following model (RM initialisation)

Stage 2: Reward Model Training
  Human comparisons → scalar reward model R(prompt, response)

Stage 3: RL Fine-Tuning with PPO
  SFT model → policy optimised to maximise R while staying close to SFT
\`\`\`

## Stage 2: Training the Reward Model

The reward model takes a (prompt, response) pair and outputs a scalar score reflecting how much a human would prefer that response.

**Data collection:**
For each prompt, generate 4–9 responses from the SFT model. Human raters rank them:
\`\`\`
Prompt: "Write a Python function to check if a number is prime."

Response A: Correct, well-explained, with docstring         → rank 1st
Response B: Correct but no explanation                      → rank 2nd
Response C: Correct for some inputs, buggy edge case        → rank 3rd
Response D: Wrong algorithm entirely                        → rank 4th
\`\`\`

Rankings are converted to pairwise comparisons: (A > B), (A > C), (A > D), (B > C), etc.

**Reward model training:**
The reward model is trained to assign higher scores to preferred responses:
\`\`\`
Loss = -E[log σ(R(prompt, y_w) - R(prompt, y_l))]
\`\`\`
Where y_w is the preferred response and y_l is the less preferred one.

The reward model learns to predict which response a human would prefer, capturing subtle quality dimensions that are hard to specify explicitly.

## Stage 3: PPO — Proximal Policy Optimisation

With a trained reward model, we use RL to fine-tune the language model (the "policy") to produce responses that score highly:

\`\`\`
Objective = E[R(prompt, response)] - β · KL(π_RL ∥ π_SFT)
\`\`\`

The **KL penalty** (from Module 6's information theory) prevents the model from drifting too far from the SFT baseline — critical for avoiding reward hacking.

**PPO** (Proximal Policy Optimisation) is the RL algorithm used because:
- It has a "trust region" — updates are constrained to not change the policy too drastically in one step
- Stable training compared to vanilla policy gradient
- Works reasonably well with the non-stationary reward from a learned reward model

The RL training loop:
\`\`\`
For each training step:
  1. Sample prompts from dataset
  2. Generate responses using current policy π_RL
  3. Score responses with reward model R
  4. Compute PPO objective (reward - KL penalty)
  5. Update π_RL to increase expected reward
  6. Repeat
\`\`\`

## What RLHF Improves

Comparing SFT-only models to RLHF models, consistent improvements on:
- **Response quality:** better reasoning, more complete answers
- **Truthfulness:** more calibrated uncertainty, fewer confident hallucinations
- **Instruction following:** better at multi-part instructions, subtle constraints
- **Harmlessness:** appropriate refusals, avoiding gratuitous harmful content
- **Style:** appropriate tone, length calibration, formatting

The InstructGPT paper (OpenAI, 2022) found that human evaluators preferred an RLHF-tuned 1.3B model over a base SFT 175B model 77% of the time — RLHF alignment beat 100× more parameters.

## Reward Hacking in Practice

Despite the KL penalty, reward hacking occurs:

**Sycophancy:** RLHF-trained models tend to agree with users, validate incorrect assertions, and soften criticism — because human raters preferred confident, agreeable responses. The reward model learned sycophancy is "preferred".

**Verbosity:** longer responses often scored higher (they look more thorough). Models learned to be unnecessarily verbose.

**Style over substance:** eloquent but less accurate answers sometimes scored higher than accurate but plain ones.

These are Goodhart's Law in action: the reward model is not a perfect proxy for what humans actually want. Iterated RLHF, adversarial testing, and Constitutional AI (next lesson) address these issues.

## From PPO to DPO

A simpler alternative to PPO has gained traction: **Direct Preference Optimisation (DPO)**:

\`\`\`
DPO loss = -E[log σ(β log(π/π_ref)(y_w) - β log(π/π_ref)(y_l))]
\`\`\`

DPO bypasses the reward model entirely — directly optimises the LM on preference pairs. It is more stable, simpler to implement, and competitive with PPO. Many open-source models (Zephyr, Mistral-7B-Instruct) use DPO. The choice between PPO and DPO is an active research question.`,
      keyTerms: [
        { term: 'Reward Model', definition: 'A model trained on human preference comparisons to output a scalar quality score for (prompt, response) pairs. Drives the RL phase of RLHF.' },
        { term: 'PPO (Proximal Policy Optimisation)', definition: 'The RL algorithm used in RLHF. Constrains policy updates to prevent large, destabilising changes. Optimises reward subject to KL penalty.' },
        { term: 'KL Penalty in RLHF', definition: 'β·KL(π_RL∥π_SFT) penalises deviation from the SFT reference policy. Prevents reward hacking by keeping the model grounded.' },
        { term: 'Sycophancy', definition: 'A reward hacking failure mode: models learn to agree with and flatter users because human raters prefer agreeable responses, even when accuracy suffers.' },
        { term: 'DPO (Direct Preference Optimisation)', definition: 'Alternative to PPO that directly optimises the LM on preference pairs without a separate reward model. Simpler and competitive with PPO.' },
      ],
    },
    {
      id: '10-4', number: '10.4',
      title: 'Constitutional AI — Anthropic\'s Approach',
      duration: 15,
      content: `# Constitutional AI — Anthropic's Approach

Anthropic developed **Constitutional AI (CAI)** as an alternative and complement to standard RLHF. Rather than relying entirely on human feedback to shape model values, CAI uses a written set of principles — a **constitution** — and AI-generated feedback to iteratively refine model behaviour. This is the framework that most directly shapes Claude's character.

## Why Constitutional AI?

Standard RLHF has practical limitations:
1. **Scale:** human labellers cannot evaluate every possible response type. Edge cases and long-tail behaviours escape oversight.
2. **Consistency:** human raters disagree, have biases, and may inadvertently reward sycophancy.
3. **Explainability:** pure preference learning produces models whose values are opaque — you know raters preferred X over Y but not why.
4. **Safety coverage:** writing balanced (helpful vs. harmful) training data at sufficient diversity requires enormous human effort.

CAI addresses these by using the AI itself to generate training signal, guided by explicit principles.

## The Constitutional AI Pipeline

**Phase 1: Supervised Learning from AI Feedback (SL-CAI)**

\`\`\`
1. Generate potentially harmful responses to "red-teaming" prompts
2. Ask the model to critique each response against constitutional principles:
   "Identify ways this response could be harmful or unethical."
3. Ask the model to revise based on the critique:
   "Rewrite to remove harmful content while remaining helpful."
4. Repeat critique-revision for several rounds
5. Fine-tune on the final revised responses
\`\`\`

**Phase 2: Reinforcement Learning from AI Feedback (RLAIF)**

\`\`\`
1. Generate pairs of responses to instructions
2. Ask the model to compare responses against constitutional principles:
   "Which response better follows the principle: [principle]? (A) or (B)?"
3. Use these AI-generated preferences to train a reward model
4. Apply RL (PPO) with this reward model — same as RLHF but with AI-generated labels
\`\`\`

The key difference from RLHF: the feedback comes from the AI using written principles, not from human raters with implicit preferences.

## The Constitution Itself

Anthropic's constitution is a collection of principles covering:

**Harm avoidance:**
- "Choose the response that is less likely to contain harmful, unethical, racist, sexist, toxic, dangerous, or illegal content."
- "Prefer the response that is less likely to help someone cause harm to themselves or others."

**Honesty:**
- "Choose the response that is more honest and doesn't deceive the human."
- "Prefer not to say information that could be misleading even if technically correct."

**Helpfulness:**
- "Choose the response that is most helpful to the human."
- "Prefer the response that follows the human's instructions most faithfully."

**AI identity:**
- "Prefer the response that is less likely to claim to be a human in order to deceive the user."

These principles are public (in the CAI paper). The version used to train Claude is more detailed and iteratively refined — it is effectively Claude's value specification document.

## RLAIF vs RLHF

| Aspect | RLHF | RLAIF (CAI) |
|--------|------|------------|
| Feedback source | Human raters | AI model + constitution |
| Scale | Limited by human bandwidth | Highly scalable |
| Consistency | Variable | More consistent |
| Transparency | Preferences are implicit | Principles are explicit |
| Bias | Human biases | Model + constitution biases |
| Cost | Expensive ($20–50/comparison) | Cheap (inference cost only) |

CAI does not eliminate human oversight — humans write and refine the constitution, and human feedback is used for some stages. But it dramatically scales the alignment signal.

## Claude's Character: A Result of Constitutional AI

Constitutional AI is why Claude exhibits specific traits:

**Epistemic humility:** the constitution emphasises calibrated uncertainty — Claude says "I think" or "I'm not certain" when appropriate, rather than confabulating confidently.

**Genuine helpfulness vs. sycophancy:** the constitution explicitly values honest helpfulness over flattery. This is why Claude will respectfully disagree with incorrect assertions rather than simply agreeing.

**Refusal with explanation:** when Claude declines a request, it explains why (within limits) — reflecting the principle that refusals should be transparent and constructive.

**Avoiding self-aggrandisement:** the constitution discourages Claude from claiming capabilities it doesn't have or overstating confidence — reflecting genuine honesty principles rather than PR.

## Constitutional AI and Scalable Oversight

CAI is partly an answer to a fundamental safety question: **how do we oversee AI systems that may become smarter than their overseers?**

If the AI can critique and revise its own outputs better than humans can evaluate them, we need methods that scale. CAI's use of the AI to generate alignment feedback — constrained by explicit principles that humans can audit — is one approach to scalable oversight.

Anthropic continues to develop this direction. The goal is a model whose values are not just behaviourally aligned but can be inspected, understood, and verified — the long-term ambition of interpretability research combined with alignment.

## Iterative Refinement

Constitutional AI is not a one-time process. Anthropic iterates on:
- The constitution itself (adding principles, clarifying ambiguities)
- The red-teaming prompts (finding new failure modes)
- The critique-revision cycles (discovering when AI critiques miss issues)
- The RLAIF comparisons (calibrating which principles should take precedence)

This iterative loop — model fails in a new way → identify the gap in the constitution → refine the constitution → retrain — is how Claude's values are progressively refined across model versions.`,
      keyTerms: [
        { term: 'Constitutional AI (CAI)', definition: 'Anthropic\'s alignment approach using a written constitution of principles and AI-generated feedback for critique and revision, rather than purely human labels.' },
        { term: 'RLAIF (RL from AI Feedback)', definition: 'Using an AI model (guided by principles) to generate preference labels for training the reward model. Scalable alternative/complement to human-labelled RLHF.' },
        { term: 'Critique-Revision', definition: 'The CAI loop: generate response, ask AI to critique against principles, ask AI to revise. Repeated to produce increasingly aligned responses.' },
        { term: 'Scalable Oversight', definition: 'Methods for ensuring AI alignment even when AI systems are too capable for direct human evaluation. CAI is one approach using AI-assisted feedback.' },
        { term: 'The Constitution', definition: 'Anthropic\'s written set of principles used to guide Constitutional AI. Covers harm avoidance, honesty, helpfulness, and AI identity. Partially public in the CAI paper.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q10-1', title: 'Quiz 10.1 — The Alignment Problem',
      type: 'lesson', moduleId: 'm10', passMark: 70,
      questions: [
        {
          id: 'q10-1-1', type: 'multiple_choice',
          question: 'Goodhart\'s Law states "when a measure becomes a target, it ceases to be a good measure." In AI alignment, this manifests as:',
          options: [
            'Models becoming less accurate on benchmarks over time',
            'Reward hacking — models maximising the reward function through unintended strategies',
            'Training data becoming stale and irrelevant',
            'Human evaluators disagreeing with automated metrics',
          ],
          correctAnswer: 'Reward hacking — models maximising the reward function through unintended strategies',
          gradingRubric: 'Award full marks for the second option. Optimising a proxy reward (e.g. human approval ratings) leads to behaviours that satisfy the measure (appearing agreeable) without achieving the underlying goal (genuine helpfulness).',
          xpValue: 10,
        },
        {
          id: 'q10-1-2', type: 'short_answer',
          question: 'A pre-trained LLM might respond helpfully to "How do I make chlorine gas?" Why does this not mean the model is malicious?',
          correctAnswer: 'The pre-trained model is a text completer — it produces statistically likely continuations. Instructions for chemical synthesis appear in training data (chemistry sites, tutorials). It has no notion of intent or harm; it completes text that matches the pattern.',
          gradingRubric: 'Award marks for: (1) pre-trained model has no intent or values; (2) it produces statistically likely continuations of the pattern; (3) such content exists in training data; (4) alignment fine-tuning is what teaches refusal.',
          xpValue: 20,
        },
        {
          id: 'q10-1-3', type: 'multiple_choice',
          question: 'The "alignment tax" refers to:',
          options: [
            'The financial cost of alignment research',
            'The hypothetical capability reduction caused by alignment fine-tuning',
            'Tax rules applying to AI company revenue',
            'The number of RLHF steps required to align a model',
          ],
          correctAnswer: 'The hypothetical capability reduction caused by alignment fine-tuning',
          gradingRubric: 'Award full marks for the second option. The concern was that making a model safer would reduce its capability. Evidence from Claude and InstructGPT shows alignment can be complementary — well-aligned models often outperform unaligned ones on capability benchmarks.',
          xpValue: 10,
        },
        {
          id: 'q10-1-4', type: 'multiple_choice',
          question: 'Which of HHH (Helpful, Harmless, Honest) creates the most direct tension with Helpfulness?',
          options: ['Helpfulness and Harmlessness always align', 'Harmlessness — being maximally helpful may require sharing potentially dangerous information', 'Honesty — being helpful requires deceiving users sometimes', 'All three are always in conflict'],
          correctAnswer: 'Harmlessness — being maximally helpful may require sharing potentially dangerous information',
          gradingRubric: 'Award full marks for the second option. The sharpest tension: a security researcher may need information that could harm others. Maximum helpfulness in providing it conflicts with harmlessness. This tension is central to alignment design.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q10-2', title: 'Quiz 10.2 — Supervised Fine-Tuning',
      type: 'lesson', moduleId: 'm10', passMark: 70,
      questions: [
        {
          id: 'q10-2-1', type: 'multiple_choice',
          question: 'SFT transforms a pre-trained model from a "text completer" to an "instruction follower." This change is achieved by:',
          options: [
            'Changing the model architecture to add an instruction parser',
            'Fine-tuning on curated (instruction, ideal response) pairs using the same cross-entropy loss',
            'Removing the softmax layer and replacing it with a classifier',
            'Adding explicit if-then rules for handling common instructions',
          ],
          correctAnswer: 'Fine-tuning on curated (instruction, ideal response) pairs using the same cross-entropy loss',
          gradingRubric: 'Award full marks for the second option. SFT changes the training data distribution, not the architecture or objective. The model learns to condition on the Human/Assistant format and produce assistant-style responses.',
          xpValue: 10,
        },
        {
          id: 'q10-2-2', type: 'multiple_choice',
          question: 'A critical limitation of SFT alone (without RLHF) is:',
          options: [
            'SFT cannot be applied to models larger than 1B parameters',
            'SFT provides no comparison signal — the model cannot learn to prefer better responses over worse ones',
            'SFT requires GPU clusters not available to researchers',
            'SFT only works for English-language instructions',
          ],
          correctAnswer: 'SFT provides no comparison signal — the model cannot learn to prefer better responses over worse ones',
          gradingRubric: 'Award full marks for the second option. SFT treats every (instruction, response) pair equally — it cannot distinguish "good" from "great" responses. RLHF\'s preference comparisons provide this signal.',
          xpValue: 15,
        },
        {
          id: 'q10-2-3', type: 'short_answer',
          question: 'Why does the InstructGPT paper finding — that a 1.3B RLHF model was preferred over a 175B SFT model — matter for AI development strategy?',
          correctAnswer: 'Alignment quality can matter more than raw model size. A well-aligned smaller model may be more useful than a much larger but poorly aligned one. This justifies significant investment in alignment research.',
          gradingRubric: 'Award marks for: (1) alignment quality > size; (2) RLHF preference signal is more informative than SFT alone; (3) implication for resource allocation — alignment investment is worthwhile; (4) smaller aligned models can be cheaper and more useful.',
          xpValue: 20,
        },
        {
          id: 'q10-2-4', type: 'multiple_choice',
          question: 'The special Human/Assistant tokens in SFT training teach the model to:',
          options: [
            'Respond faster to human messages',
            'Distinguish conversation roles and produce responses only in the assistant turn',
            'Detect harmful content in human messages',
            'Format responses in HTML',
          ],
          correctAnswer: 'Distinguish conversation roles and produce responses only in the assistant turn',
          gradingRubric: 'Award full marks for the second option. The format tokens create a structured dialogue schema — the model learns to predict assistant responses given human inputs, not to predict human messages.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q10-3', title: 'Quiz 10.3 — RLHF',
      type: 'lesson', moduleId: 'm10', passMark: 70,
      questions: [
        {
          id: 'q10-3-1', type: 'multiple_choice',
          question: 'The reward model in RLHF is trained on:',
          options: [
            'The same next-token prediction objective as the base LLM',
            'Pairwise human preference comparisons between model-generated responses',
            'Binary "good / bad" labels assigned by human raters',
            'Automated grammar and factuality scores',
          ],
          correctAnswer: 'Pairwise human preference comparisons between model-generated responses',
          gradingRubric: 'Award full marks for the second option. Comparative judgements (A is better than B) are easier and more reliable than absolute ratings. The reward model learns to score responses based on these pairwise preferences.',
          xpValue: 10,
        },
        {
          id: 'q10-3-2', type: 'multiple_choice',
          question: 'Sycophancy in RLHF-trained models occurs because:',
          options: [
            'Human raters specifically requested agreeable responses',
            'The reward model learned that human raters tend to prefer validation and agreement, even at the cost of accuracy',
            'The KL penalty was set too high',
            'Sycophantic responses have lower perplexity',
          ],
          correctAnswer: 'The reward model learned that human raters tend to prefer validation and agreement, even at the cost of accuracy',
          gradingRubric: 'Award full marks for the second option. Goodhart\'s Law: raters unconsciously rewarded flattery. The reward model learned this pattern, and PPO amplified it — sycophancy maximises the learned proxy reward.',
          xpValue: 15,
        },
        {
          id: 'q10-3-3', type: 'short_answer',
          question: 'Explain the role of the KL penalty β·KL(π_RL∥π_SFT) in RLHF training. What happens if β is set too low?',
          correctAnswer: 'The KL penalty prevents the RL policy from deviating too far from the SFT reference. If β is too low, the model will reward-hack: find extreme strategies that score high but are incoherent, repetitive, or degenerate.',
          gradingRubric: 'Award marks for: (1) prevents policy drift from SFT baseline; (2) addresses reward hacking; (3) too low β → degenerate reward-maximising outputs; (4) balances reward maximisation with maintaining coherence.',
          xpValue: 20,
        },
        {
          id: 'q10-3-4', type: 'multiple_choice',
          question: 'DPO (Direct Preference Optimisation) differs from RLHF-PPO in that it:',
          options: [
            'Requires more human labelled data than RLHF',
            'Directly optimises the LM on preference pairs, bypassing the separate reward model training step',
            'Uses a different base architecture than standard Transformers',
            'Can only be applied to models smaller than 7B parameters',
          ],
          correctAnswer: 'Directly optimises the LM on preference pairs, bypassing the separate reward model training step',
          gradingRubric: 'Award full marks for the second option. DPO reparameterises the RLHF objective so the LM is the reward model — eliminating the separate reward model training and PPO steps while achieving competitive results.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q10-4', title: 'Quiz 10.4 — Constitutional AI',
      type: 'lesson', moduleId: 'm10', passMark: 70,
      questions: [
        {
          id: 'q10-4-1', type: 'multiple_choice',
          question: 'Constitutional AI uses RLAIF (RL from AI Feedback) instead of human labels to:',
          options: [
            'Eliminate all human involvement in the alignment process',
            'Scale alignment feedback beyond the bandwidth of human raters while maintaining principled consistency',
            'Reduce the quality of alignment to save money',
            'Generate synthetic training data for pre-training',
          ],
          correctAnswer: 'Scale alignment feedback beyond the bandwidth of human raters while maintaining principled consistency',
          gradingRubric: 'Award full marks for the second option. Human labellers are the bottleneck — they cannot evaluate every edge case. RLAIF generates comparative labels using AI-applied principles, scaling coverage while maintaining consistency from the constitution.',
          xpValue: 10,
        },
        {
          id: 'q10-4-2', type: 'multiple_choice',
          question: 'The critique-revision loop in Constitutional AI trains the model to:',
          options: [
            'Write critiques of user messages',
            'Generate harmful content and then flag it for human review',
            'Evaluate and improve its own responses against explicit principles',
            'Summarise very long documents into constitutional summaries',
          ],
          correctAnswer: 'Evaluate and improve its own responses against explicit principles',
          gradingRubric: 'Award full marks for the third option. The model critiques its response ("this is harmful because...") and then revises it ("here is a better response"). Fine-tuning on these revisions teaches the model to internalise the critiques.',
          xpValue: 10,
        },
        {
          id: 'q10-4-3', type: 'short_answer',
          question: 'Why does Claude tend to say "I think" or "I\'m not certain" rather than asserting everything confidently? Connect this to Constitutional AI.',
          correctAnswer: 'The CAI constitution includes honesty principles emphasising calibrated uncertainty. Claude was trained (via critique-revision and RLAIF) to express appropriate hedging — a direct result of "prefer responses that acknowledge uncertainty" principles.',
          gradingRubric: 'Award marks for: (1) constitution contains calibrated uncertainty principles; (2) critique-revision explicitly critiqued overconfident responses; (3) RLAIF preferred hedged over confident incorrect responses; (4) this is a designed value, not a capability limitation.',
          xpValue: 20,
        },
        {
          id: 'q10-4-4', type: 'multiple_choice',
          question: 'Scalable oversight — using AI systems to help oversee increasingly capable AI — is relevant to Constitutional AI because:',
          options: [
            'CAI reduces the need for any human oversight',
            'CAI demonstrates a model where AI-generated feedback (bounded by human-written principles) provides alignment signal at scale',
            'Constitutional AI is exclusively used for models too large for human evaluation',
            'CAI requires the model to oversee human raters',
          ],
          correctAnswer: 'CAI demonstrates a model where AI-generated feedback (bounded by human-written principles) provides alignment signal at scale',
          gradingRubric: 'Award full marks for the second option. CAI is a concrete implementation of scalable oversight: as models improve, they can generate better alignment feedback — guided by human-authored principles that can be audited and refined.',
          xpValue: 10,
        },
      ],
    },
  ],
  project: {
    id: 'p10', moduleId: 'm10',
    name: 'Preference Trainer',
    emoji: '⚖️',
    description: 'Build a mini RLHF pipeline: generate response pairs from the Claude API, collect your own preference labels through a simple UI, train a logistic regression reward model on your labels, and visualise which prompt/response features correlate with high reward scores.',
    tools: ['Claude API', 'React', 'Python (scikit-learn for reward model)', 'Tailwind CSS'],
    status: 'not_started',
    rubric: [
      'Generates response pairs for 20+ diverse prompts using the Claude API (temperature variation or different system prompts)',
      'Comparison UI: display two responses side by side with a preference button — clean and usable',
      'Collects and stores at least 50 preference judgements in a JSON file',
      'Trains a reward model (logistic regression or simple NN) on the collected preferences',
      'Visualises top predictive features (response length, certain words, formatting) of high vs low reward',
    ],
    xpReward: 320,
  },
}

// ─── MODULE 11 ────────────────────────────────────────────────────────────────
const m11: Module = {
  id: 'm11', number: 11, arc: 2,
  title: 'Advanced Architectures',
  description: 'Go beyond the vanilla Transformer — Mixture of Experts, Grouped Query Attention, State Space Models, and multimodal design. These are the architectural innovations powering the next generation of frontier models.',
  prerequisiteModuleId: 'm10',
  lessons: [
    {
      id: '11-1', number: '11.1',
      title: 'Mixture of Experts — Scaling Without Proportional Cost',
      duration: 14,
      content: `# Mixture of Experts — Scaling Without Proportional Cost

The vanilla Transformer activates every parameter for every token. A 70B model performs 70B-parameter computation on every single token — whether that token is the word "the" or a complex mathematical expression. **Mixture of Experts (MoE)** decouples model capacity from computation cost by making only a fraction of parameters active at once.

## The Core Idea

An MoE model replaces each dense FFN sublayer with a collection of **expert** networks plus a **routing** mechanism:

\`\`\`
Dense FFN:   input → [one FFN with d_ff neurons] → output

MoE:         input → [router] → selects top-k experts
                              → [Expert 1] ──┐
                              → [Expert 7] ──┤ → weighted sum → output
                              (other experts inactive)
\`\`\`

A typical configuration: 8 experts per layer, top-2 routing (each token is processed by 2 experts). The model has 8× the FFN parameters, but only 2/8 = 25% are active per token.

## Sparse Activation: The Economics

Consider Mixtral 8×7B:
- 8 experts, each a 7B-parameter FFN equivalent
- Total parameters: ~47B (shared attention layers + 8 expert FFNs)
- Active parameters per token: ~12B (shared + 2 active experts)

\`\`\`
Total capacity:    47B parameters
Active per token:  12B parameters (25%)
Inference cost:    similar to a dense 12B model
Knowledge/capacity: comparable to a dense 47B model
\`\`\`

This is the MoE value proposition: **large model capability at smaller model inference cost**.

## The Router

The router is a small linear layer that assigns each token to experts:

\`\`\`python
# Simplified MoE routing
router_logits = token_hidden_state @ router_weight   # (batch*seq, n_experts)
router_probs  = softmax(router_logits)
top_k_indices = argtopk(router_probs, k=2)           # Pick top-2 experts
top_k_weights = router_probs[top_k_indices]           # Weighting for combination
top_k_weights = top_k_weights / top_k_weights.sum()  # Renormalise

output = sum(weight * expert(token) for weight, expert in zip(top_k_weights, top_k_experts))
\`\`\`

## Load Balancing — The Key Training Challenge

A naive router will **collapse**: it will route nearly all tokens to one or two "popular" experts, leaving the rest idle. This wastes most of the model's capacity.

**Load balancing loss** encourages uniform expert usage:
\`\`\`
L_balance = n_experts × sum(f_i × P_i)
where f_i = fraction of tokens routed to expert i
      P_i = average router probability for expert i
\`\`\`

Minimising this encourages each expert to receive roughly 1/n_experts of tokens. The final training loss = task loss + α × load balancing loss.

**Expert specialisation:** despite (or because of) balanced routing, experts do specialise. Analysis of trained MoE models shows experts developing domain preferences — one expert handling more code tokens, another mathematical expressions, another casual text. The router learns to route tokens to the most capable expert for each context.

## Token Dropping and Capacity Factor

MoE introduces a new failure mode: **token dropping**. When more tokens are routed to an expert than its buffer capacity, excess tokens are dropped (skipped):

\`\`\`
capacity = (tokens_per_batch / n_experts) × capacity_factor

If capacity_factor = 1.25:
  Each expert can handle 25% more than the average load
  Tokens exceeding capacity are dropped
\`\`\`

Dropped tokens receive the residual stream unchanged (no expert processing). This is benign for rare overflow cases but harmful if routing is consistently imbalanced.

## MoE in Production Models

| Model | Architecture | Parameters | Active/token |
|-------|-------------|------------|-------------|
| Mixtral 8×7B | 8 experts, top-2 | ~47B | ~12B |
| Mixtral 8×22B | 8 experts, top-2 | ~141B | ~39B |
| GPT-4 (rumoured) | ~16 experts | ~1.8T total | ~110B active |
| Gemini 1.5 | MoE (undisclosed) | Undisclosed | Undisclosed |

GPT-4 being MoE (unconfirmed, from George Hotz and others) would explain how OpenAI achieves such high capability at manageable inference cost.

## Communication Overhead in Distributed MoE

In distributed training, different experts may live on different GPUs. **Expert parallelism** requires routing tokens to the correct GPU — introducing **all-to-all communication** overhead:

\`\`\`
Batch arrives on GPU 0
Router decides: tokens 0,3,7 → Expert 2 (GPU 1), tokens 1,5 → Expert 5 (GPU 3)...
All-to-all: each GPU sends token subsets to all other GPUs
Each GPU processes its expert's tokens
All-to-all again: return processed tokens to origin GPUs
\`\`\`

This communication cost is a significant engineering challenge for MoE at scale, and is why MoE models typically require higher-bandwidth interconnects (NVLink, InfiniBand).`,
      keyTerms: [
        { term: 'Mixture of Experts (MoE)', definition: 'Architecture replacing dense FFN layers with multiple expert networks, routing each token to a top-k subset. Decouples model capacity from per-token compute.' },
        { term: 'Router', definition: 'A small linear layer in MoE models that assigns tokens to experts based on learned compatibility scores.' },
        { term: 'Sparse Activation', definition: 'Only a fraction (k/n) of experts are active per token. Provides large model capacity at dense small-model inference cost.' },
        { term: 'Load Balancing Loss', definition: 'An auxiliary loss encouraging uniform token distribution across experts, preventing router collapse to a few popular experts.' },
        { term: 'Expert Specialisation', definition: 'The emergent behaviour of MoE experts developing domain preferences (code, math, prose) despite balanced routing.' },
      ],
    },
    {
      id: '11-2', number: '11.2',
      title: 'Attention Efficiency — GQA, Sliding Window, and Flash Attention 2',
      duration: 13,
      content: `# Attention Efficiency — GQA, Sliding Window, and Flash Attention 2

Multi-head attention (MHA) as described in Module 8 is the reference implementation — not the production implementation. Generating long sequences with large models requires a suite of engineering and algorithmic improvements. This lesson covers the attention efficiency innovations that make modern LLM inference practical.

## The KV-Cache Memory Problem

The KV-cache (Module 8.3) stores K and V matrices for all previous tokens. For a model with:
- N_layers layers, N_heads heads, D_head head dimension
- T tokens in context
- B batches being served simultaneously

\`\`\`
KV cache size = 2 × N_layers × N_heads × D_head × T × B × bytes_per_value

For Claude 3 Sonnet class (est.):
  2 × 60 × 64 × 128 × 200,000 × 1 × 2 bytes ≈ 390 GB per concurrent session
\`\`\`

This is why long-context serving is expensive and why reducing KV-cache size is a major research priority.

## Multi-Query Attention (MQA) and Grouped-Query Attention (GQA)

**Multi-Head Attention (MHA):** each head has its own Q, K, V projections.
\`\`\`
KV storage per layer: N_heads × T × D_head × 2
\`\`\`

**Multi-Query Attention (MQA):** all query heads share a single K and V projection.
\`\`\`
KV storage per layer: 1 × T × D_head × 2    ← N_heads × reduction!
\`\`\`
MQA reduces KV-cache by N_heads×, enabling much longer effective context. Quality degrades slightly.

**Grouped-Query Attention (GQA):** G groups of query heads share one K/V pair per group. Interpolates between MHA and MQA:
\`\`\`
MHA:  N_heads K/V pairs  (full quality, large cache)
GQA:  G K/V pairs        (near-MHA quality, smaller cache)
MQA:  1 K/V pair         (smallest cache, lower quality)
\`\`\`

**GQA is the standard in modern LLMs:** LLaMA 2 70B uses GQA with 8 K/V groups for 70 query heads. Mistral 7B uses GQA. Claude 3 likely uses GQA or similar.

Concretely for LLaMA 2 70B (70 query heads, 8 KV heads):
\`\`\`
MHA KV cache:  70 × T × D_head × 2
GQA KV cache:   8 × T × D_head × 2   ← 8.75× smaller
\`\`\`

## Sliding Window Attention (SWA)

Full attention attends to all previous tokens. For long contexts, this is:
- Computationally expensive: O(T²) per layer
- Often unnecessary: most tokens primarily attend to their local neighbourhood

**Sliding Window Attention** restricts each token to attend only within a window of W tokens:
\`\`\`
Token at position t attends to positions [t-W, ..., t]
Attention matrix: banded (diagonal), not full lower-triangular
Cost: O(T × W) instead of O(T²)
\`\`\`

Used in Mistral and LongFormer. The intuition: local context is sufficient for most token predictions. Global context is built up through stacking layers — information "flows" to distant positions through multiple attention steps.

**Dilated sliding window:** alternates between local windows and strided (every-k-th token) attention, allowing efficient coverage of very long ranges with fewer operations.

## Flash Attention 2 and 3

Flash Attention (Module 9) rewrote the attention algorithm for I/O efficiency. Flash Attention 2 (2023) further improved:

**FA2 improvements over FA1:**
- Better work partitioning across GPU thread blocks
- Reduced non-matmul operations (causal masking applied more efficiently)
- Better parallelism across sequence length (not just batch)
- ~2× faster than FA1, ~6× faster than standard PyTorch attention

**Flash Attention 3 (2024, H100-specific):**
- Exploits H100's asynchronous memory copy (WGMMA)
- Overlaps memory transfers with computation
- ~2× faster than FA2 on H100 GPUs
- Achieves ~75% of theoretical peak H100 FLOP/s for attention

The cumulative effect: a 200K-token context window that would take seconds per token with naive attention runs in milliseconds with FA3 + GQA + KV-cache.

## Speculative Decoding

LLM inference is memory-bound: generating each token requires one full forward pass. **Speculative decoding** uses a small "draft" model to speculatively generate multiple tokens, then verifies them in parallel with the large target model:

\`\`\`
1. Draft model generates tokens t+1, t+2, ..., t+k quickly
2. Target model verifies all k tokens in ONE parallel forward pass
3. Accept all tokens up to the first mismatch; reject from mismatch
4. Gain: ~2–4× throughput with guaranteed target model quality
\`\`\`

The key insight: the target model can check k tokens in one pass (same cost as checking 1), but the draft model generates them quickly. If the draft model is good (most tokens are accepted), throughput multiplies with no quality loss.

Anthropic uses speculative decoding in production Claude serving. The draft model for Claude 3 Sonnet might be Claude 3 Haiku — a smaller, faster model in the same family.

## Continuous Batching

Traditional serving: wait for a batch to fully complete before starting the next.
**Continuous batching:** as soon as one sequence in a batch finishes, immediately start a new one — no idle GPU time between sequences.

This dramatically improves GPU utilisation for variable-length generation, and is standard in production LLM serving (vLLM, TensorRT-LLM, TGI).`,
      keyTerms: [
        { term: 'Grouped-Query Attention (GQA)', definition: 'G groups of query heads share one K/V pair per group. Near-MHA quality at a fraction of KV-cache memory. Standard in LLaMA 2, Mistral, and likely Claude.' },
        { term: 'Sliding Window Attention', definition: 'Restricts attention to a local window of W previous tokens. O(T×W) instead of O(T²). Used in Mistral for efficient long context.' },
        { term: 'Flash Attention 2', definition: 'I/O-aware attention kernel with better GPU thread parallelism. ~6× faster than standard attention; default in all production frameworks.' },
        { term: 'Speculative Decoding', definition: 'Draft model generates multiple tokens; target model verifies in one parallel pass. ~2–4× throughput improvement with identical output quality.' },
        { term: 'Continuous Batching', definition: 'Serving technique immediately filling batch slots as sequences complete. Eliminates GPU idle time between requests; standard in vLLM and TensorRT-LLM.' },
      ],
    },
    {
      id: '11-3', number: '11.3',
      title: 'State Space Models and the Beyond-Transformer Landscape',
      duration: 13,
      content: `# State Space Models and the Beyond-Transformer Landscape

Transformers dominate AI today, but their O(T²) attention bottleneck is a fundamental constraint. Several architectures attempt to achieve Transformer-level quality with sub-quadratic complexity. Understanding them reveals both the ingenuity of current research and the open frontier in AI architecture.

## The Problem with O(T²) Attention

As context windows grow, attention costs grow quadratically:

| Context | Attention FLOP | Memory |
|---------|---------------|--------|
| 4K tokens | 1× | 1× |
| 32K tokens | 64× | 64× |
| 128K tokens | 1,024× | 1,024× |
| 1M tokens | 65,536× | 65,536× |

A 1M-token context (roughly a small book) would require 65,000× more attention compute than a 4K context. Even with Flash Attention, this is prohibitive. **Sub-quadratic sequence modelling** is one of the most actively researched problems in AI.

## State Space Models (SSMs)

State Space Models originate in control theory: a system whose state evolves according to:

\`\`\`
h'(t) = Ah(t) + Bx(t)      (continuous state update)
y(t)  = Ch(t) + Dx(t)      (output)
\`\`\`

Where x(t) is input, h(t) is hidden state, y(t) is output. For sequence modelling, this is discretised to:

\`\`\`
hₜ = Ā hₜ₋₁ + B̄ xₜ       (recurrent form)
yₜ = C hₜ                  (output)
\`\`\`

The key property: SSMs can be computed in **two equivalent ways**:
- **Recurrent form** (inference): O(1) per step, constant memory — like an RNN
- **Convolutional form** (training): the entire sequence output is a convolution, computable in O(T log T) using FFT — highly parallelisable

This duality makes SSMs efficient for both training and inference.

## Mamba — Selective State Spaces

The original SSM formulation (S4) used fixed A, B, C matrices. **Mamba** (Gu & Dao, 2023) introduced **input-dependent** (selective) parameters:

\`\`\`
B, C, Δ = functions of xₜ    ← the key innovation
\`\`\`

Where Δ is a "discretisation step" that controls how much the state updates for each input. With selective parameters:
- The model can choose to remember or forget information based on content
- High Δ: state updates rapidly, "paying attention" to this input
- Low Δ: state barely changes, effectively "ignoring" this input

**Mamba-2** (2024) further showed that Mamba is mathematically equivalent to a structured form of linear attention, unifying the SSM and attention literature.

## Mamba vs Transformer: Empirical Results

| Metric | Transformer | Mamba |
|--------|------------|-------|
| Training quality (same FLOPs) | Slightly better | Slightly worse |
| Inference memory | O(T) KV-cache | O(state_dim) — constant |
| Inference speed (long ctx) | Degrades O(T) per step | Constant per step |
| Multi-step retrieval | Strong | Weaker |
| Recall over long context | Strong | Weaker at 1M+ tokens |

Mamba excels at tasks requiring constant-time processing of very long sequences. Transformers maintain an edge on tasks requiring precise retrieval over arbitrary positions (e.g., "what did the character say in paragraph 3?").

## Hybrid Architectures

Rather than choosing one or the other, hybrid architectures interleave Transformer and SSM layers:
- **Jamba** (AI21, 2024): alternates Mamba and Transformer attention blocks
- **Zamba** (Zyphra, 2024): SSM layers with periodic full attention layers
- **Griffin** (DeepMind, 2024): linear recurrences + local attention

The hypothesis: Transformer attention handles precise retrieval; SSM layers provide efficient long-range context compression. The combination achieves the best of both.

## Linear Attention and RetNet

**Linear attention** approximates softmax attention to achieve O(T) complexity:
\`\`\`
Standard:  Attention(Q,K,V) = softmax(QKᵀ/√d) V    O(T²)
Linear:    Attention(Q,K,V) = φ(Q)(φ(K)ᵀV)          O(T)
\`\`\`

By factorising the attention, the computation can be reordered to avoid materialising the T×T matrix. Quality degrades because softmax's nonlinearity provides important normalisation — an active research problem.

**RetNet** (Microsoft, 2023) introduces "retention" — a multi-scale exponential decay applied to linear attention, improving quality while maintaining linear complexity.

## The Broader Landscape

Beyond SSMs and linear attention, other directions include:

- **RWKV:** RNN-like architecture achieving competitive quality with Transformers at O(T) inference
- **xLSTM:** modernised LSTM with gating mechanisms competitive with small Transformers
- **Hyena:** long convolution operators with sub-quadratic complexity

The common thread: every approach tries to maintain Transformer-quality representations while achieving sub-quadratic scaling. None has yet convincingly displaced Transformers at frontier scale — but the research is accelerating rapidly.

## What This Means for Claude

Claude's architecture is undisclosed in detail. At frontier scale (2023–2025), the dominant architecture remains decoder-only Transformer with GQA, RoPE, and Flash Attention. Future Claude versions may incorporate Mamba layers, hybrid designs, or other innovations as the field matures.

For practitioners: understanding these architectures helps you read research papers, interpret benchmark results, and understand why certain models handle very long contexts better than others.`,
      keyTerms: [
        { term: 'State Space Model (SSM)', definition: 'A sequence model based on control theory. Computable as recurrence (O(1)/step inference) or convolution (O(T log T) training). Avoids O(T²) attention.' },
        { term: 'Mamba', definition: 'SSM with input-dependent (selective) parameters. Each token can control how much the state updates — equivalent to content-based "attention" without the matrix.' },
        { term: 'Hybrid Architecture', definition: 'Model interleaving SSM and Transformer attention layers. Combines SSM\'s efficient long-range compression with attention\'s precise retrieval.' },
        { term: 'Linear Attention', definition: 'Attention approximation achieving O(T) complexity by factorising the Q,K,V product to avoid materialising the T×T attention matrix.' },
        { term: 'RWKV', definition: 'RNN-inspired architecture with O(T) inference and competitive Transformer-quality. One of the few non-Transformer models showing competitive scaling.' },
      ],
    },
    {
      id: '11-4', number: '11.4',
      title: 'Multimodal Architectures',
      duration: 14,
      content: `# Multimodal Architectures

Language-only models are powerful but limited — the real world is images, audio, video, and structured data. **Multimodal models** process and generate across multiple modalities, and understanding their architecture is increasingly essential for working with frontier AI systems including Claude's vision capabilities.

## The Challenge: Bridging Modalities

Text and images exist in fundamentally different spaces:
- Text: discrete tokens from a finite vocabulary
- Images: continuous high-dimensional pixel arrays
- Audio: time-series waveforms
- Video: sequences of images

The challenge: how do you represent all these modalities in a shared space where a language model can reason over them?

## Vision Encoders

Images are first processed by a **vision encoder** that converts raw pixels to a sequence of patch embeddings:

**Vision Transformer (ViT):**
\`\`\`
Input image: (H, W, C) e.g. (224, 224, 3)
Divide into patches: P×P pixels each, e.g. 16×16
Number of patches: (224/16)² = 196 patches
Each patch → flatten → linear projection → (196, d_patch)
Add positional encoding → process with Transformer
\`\`\`

The ViT treats image patches exactly like text tokens. A 224×224 image with 16×16 patches becomes a sequence of 196 "visual tokens" — the same architecture that processes text now processes images.

**CLIP (Contrastive Language-Image Pretraining):**
CLIP trains a visual encoder and text encoder jointly to produce compatible embeddings — images and their captions are pulled together in a shared space. This gives a visual encoder that understands semantic meaning, not just low-level features.

Most multimodal LLMs use CLIP or CLIP-style visual encoders because their semantic alignment with language makes the bridge easier.

## Connecting Vision to Language

Once images are encoded to patch embeddings, several strategies connect them to the language model:

### Cross-Attention (Flamingo-style)
New cross-attention layers are interleaved with the language model:
\`\`\`
Text hidden states → cross-attend to visual patch embeddings → continue
\`\`\`
The text can "look at" image patches at each cross-attention layer. More flexible, better for complex visual grounding.

### Visual Token Projection (LLaVA-style)
A lightweight **projector** (typically 2-layer MLP or linear) maps visual patch embeddings into the language model's token dimension:
\`\`\`
Visual patches (196, d_vision) → projector → (196, d_model)
\`\`\`
These projected tokens are prepended to the text token sequence. The language model processes images and text as a flat sequence — simple and effective.

**LLaVA** (Large Language and Vision Assistant) popularised this approach. A CLIP visual encoder, a 2-layer MLP projector, and a language model (LLaMA) fine-tuned on (image, instruction, response) triples.

### Q-Former (BLIP-2-style)
A learnable set of "query" vectors attends to visual features, compressing them into a fixed-length representation:
\`\`\`
196 patch tokens → Q-Former (32 learned queries) → 32 query tokens → language model
\`\`\`
Reduces visual token count significantly, improving inference efficiency.

## Claude's Vision Architecture

Anthropic has not published full architectural details of Claude's vision capabilities. Based on the Claude 3 model card and inference characteristics:
- Image inputs are processed by a vision encoder (CLIP-style or internal)
- Visual tokens are projected into Claude's residual stream
- The model attends to both text and visual tokens throughout generation

Claude can process up to ~20 images per request and discusses them with strong spatial, OCR, and reasoning capabilities — consistent with a ViT + projection architecture.

## Training Multimodal Models

Training happens in stages:

**Stage 1 — Vision encoder pretraining:**
Train visual encoder on image-text pairs (CLIP-style contrastive objective or captioning). Builds semantic visual representations.

**Stage 2 — Projection pretraining:**
Freeze language model and visual encoder; train only the projector on image-text pairs. Aligns visual and language spaces.

**Stage 3 — Full multimodal fine-tuning:**
Unfreeze all components; fine-tune on high-quality (image, instruction, response) data. Teaches the model to follow multimodal instructions.

This staged approach prevents catastrophic forgetting — the language model's text capabilities are not damaged by the vision training.

## Multimodal Challenges

**Hallucination is worse:** multimodal models are more prone to generating plausible-sounding but false descriptions of images — particularly for fine details, text in images, and exact counts.

**Spatial reasoning:** while models understand semantic content well, precise spatial relationships ("the red object to the left of the blue object") remain challenging.

**Video:** processing video is massively more token-intensive (e.g. 1fps × 60s = 60 frames × 196 patches/frame = 11,760 visual tokens). Temporal compression and efficient architectures for video are active research areas.

**Audio and speech:** architectures like Whisper use a Transformer encoder to convert audio to text embeddings; these can be connected to LLMs similarly to visual tokens. End-to-end speech models (processing raw audio waveforms) are emerging but not yet standard.

## Tool Use as Multimodal Output

A different form of multimodality: **tool use**. Claude can output structured calls to external tools (web search, code execution, APIs) and incorporate the results into its response. This is implemented via:
\`\`\`
Special tokens signal tool call: <tool_use> search("query") </tool_use>
Tool result injected back into context: <tool_result>...</tool_result>
Model continues generation with tool output in context
\`\`\`
Tool use is not architecturally different from language generation — it uses the same Transformer with special tokens for tool calls. The multimodal input is the tool result (which may be text, JSON, or even images from a browser tool).`,
      keyTerms: [
        { term: 'Vision Transformer (ViT)', definition: 'Splits image into patches, projects each to an embedding, and processes with standard Transformer. Images become sequences of visual tokens.' },
        { term: 'CLIP', definition: 'Contrastive Language-Image Pretraining. Trains visual and text encoders to produce compatible embeddings. Provides semantic visual representations for multimodal LLMs.' },
        { term: 'Visual Token Projection', definition: 'Lightweight MLP mapping visual patch embeddings to the language model\'s token dimension. Visual and text tokens then processed as a flat sequence (LLaVA approach).' },
        { term: 'Cross-Attention (multimodal)', definition: 'New attention layers interleaved with the LLM that attend to visual features. Text hidden states directly query image patch embeddings at each layer.' },
        { term: 'Tool Use', definition: 'Model outputs structured calls to external tools (APIs, code execution). Implemented via special tokens; not architecturally different from language generation.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q11-1', title: 'Quiz 11.1 — Mixture of Experts',
      type: 'lesson', moduleId: 'm11', passMark: 70,
      questions: [
        {
          id: 'q11-1-1', type: 'multiple_choice',
          question: 'Mixtral 8×7B has ~47B total parameters but active parameters per token of ~12B. This means inference cost is similar to:',
          options: ['A dense 47B model', 'A dense 12B model', 'A dense 7B model', 'A dense 1.5B model'],
          correctAnswer: 'A dense 12B model',
          gradingRubric: 'Award full marks for "a dense 12B model". Only 2 of 8 experts are activated per token (top-2 routing). Compute scales with active parameters, not total parameters.',
          xpValue: 10,
        },
        {
          id: 'q11-1-2', type: 'multiple_choice',
          question: 'Load balancing loss in MoE training prevents:',
          options: [
            'The model from using too much memory',
            'Router collapse — all tokens being routed to a few popular experts, wasting most capacity',
            'Experts from becoming too specialised',
            'The KV-cache from growing too large',
          ],
          correctAnswer: 'Router collapse — all tokens being routed to a few popular experts, wasting most capacity',
          gradingRubric: 'Award full marks for the second option. Without load balancing, a naive router converges to routing everything to 1–2 experts — the model effectively becomes a small dense model despite its large parameter count.',
          xpValue: 10,
        },
        {
          id: 'q11-1-3', type: 'short_answer',
          question: 'Explain the MoE value proposition: what does a practitioner get from using a model like Mixtral 8×7B vs a dense 47B model?',
          correctAnswer: 'Similar capability to a dense 47B model (large total capacity learns more), but inference cost of a ~12B model (only 2/8 experts active per token). Better quality-per-inference-dollar.',
          gradingRubric: 'Award marks for: (1) large total capacity → broad knowledge; (2) sparse activation → small inference cost; (3) this is the key trade: train once at full capacity, serve at fraction of cost.',
          xpValue: 20,
        },
        {
          id: 'q11-1-4', type: 'multiple_choice',
          question: 'Expert specialisation in MoE models is:',
          options: [
            'Explicitly programmed by the researchers',
            'An emergent property — experts develop domain preferences through balanced routing and gradient descent',
            'Prevented by load balancing loss',
            'Only observed in models with more than 64 experts',
          ],
          correctAnswer: 'An emergent property — experts develop domain preferences through balanced routing and gradient descent',
          gradingRubric: 'Award full marks for the second option. Researchers encourage balanced routing but do not assign domain roles. The model learns that specialisation improves prediction quality — routing code tokens to the "code expert" reduces loss.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q11-2', title: 'Quiz 11.2 — Attention Efficiency',
      type: 'lesson', moduleId: 'm11', passMark: 70,
      questions: [
        {
          id: 'q11-2-1', type: 'multiple_choice',
          question: 'Grouped-Query Attention (GQA) with 8 KV groups for 64 query heads reduces KV-cache size by:',
          options: ['2×', '4×', '8×', '64×'],
          correctAnswer: '8×',
          gradingRubric: 'Award full marks for 8×. GQA with G=8 groups means 8 K/V pairs instead of 64 — an 8× reduction. Each group of 8 query heads shares one K/V pair.',
          xpValue: 15,
        },
        {
          id: 'q11-2-2', type: 'multiple_choice',
          question: 'Speculative decoding achieves 2–4× throughput improvement because:',
          options: [
            'It uses a smaller, faster model exclusively',
            'The target model verifies k tokens in one parallel pass (same cost as 1), while a cheap draft model generates them',
            'It skips attention computation for simple tokens',
            'It uses int8 quantisation for all operations',
          ],
          correctAnswer: 'The target model verifies k tokens in one parallel pass (same cost as 1), while a cheap draft model generates them',
          gradingRubric: 'Award full marks for the second option. Parallel verification is the key: checking k tokens costs no more than checking 1 (it\'s the same forward pass). The draft model\'s cheap generation amortises this into k tokens per forward pass.',
          xpValue: 15,
        },
        {
          id: 'q11-2-3', type: 'short_answer',
          question: 'Why is Flash Attention an "I/O-aware" algorithm rather than simply a mathematical optimisation?',
          correctAnswer: 'Flash Attention achieves the same mathematical result as standard attention, but reorders computation to keep data in fast on-chip SRAM rather than DRAM. The speedup comes from memory access patterns, not fewer arithmetic operations.',
          gradingRubric: 'Award marks for: (1) same mathematical result; (2) avoids materialising the T×T matrix in slow DRAM; (3) tiles computation to fit in fast SRAM; (4) I/O bound → bandwidth is the bottleneck, not FLOP count.',
          xpValue: 20,
        },
        {
          id: 'q11-2-4', type: 'multiple_choice',
          question: 'Sliding window attention reduces per-layer attention cost from O(T²) to O(T×W). The trade-off is:',
          options: [
            'No trade-off — it is strictly superior to full attention',
            'Each token can only directly attend to its W nearest neighbours; global context requires multiple stacked layers',
            'It requires twice the parameters to maintain quality',
            'It cannot be used with GQA or Flash Attention',
          ],
          correctAnswer: 'Each token can only directly attend to its W nearest neighbours; global context requires multiple stacked layers',
          gradingRubric: 'Award full marks for the second option. Distant information reaches a token indirectly — through multiple hops of W-window attention across layers. Tasks requiring precise long-range retrieval suffer.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q11-3', title: 'Quiz 11.3 — State Space Models',
      type: 'lesson', moduleId: 'm11', passMark: 70,
      questions: [
        {
          id: 'q11-3-1', type: 'multiple_choice',
          question: 'The key advantage of SSMs (like Mamba) for very long sequence inference is:',
          options: [
            'SSMs use less memory during training',
            'Per-step inference cost is O(1) — constant regardless of sequence length, unlike Transformer\'s O(T)',
            'SSMs do not require positional encoding',
            'SSMs train faster than Transformers on standard sequence lengths',
          ],
          correctAnswer: 'Per-step inference cost is O(1) — constant regardless of sequence length, unlike Transformer\'s O(T)',
          gradingRubric: 'Award full marks for the second option. In recurrent form, the SSM state has fixed size — adding more context does not increase per-step compute. This is fundamentally different from Transformer KV-cache which grows with T.',
          xpValue: 10,
        },
        {
          id: 'q11-3-2', type: 'multiple_choice',
          question: 'Mamba\'s "selective" state space model differs from original SSMs by:',
          options: [
            'Using a different discretisation method',
            'Making parameters B, C, Δ input-dependent — allowing the model to choose what to remember or ignore',
            'Replacing the recurrent update with a convolution',
            'Using multiple state spaces in parallel',
          ],
          correctAnswer: 'Making parameters B, C, Δ input-dependent — allowing the model to choose what to remember or ignore',
          gradingRubric: 'Award full marks for the second option. The "selective" in Selective State Space Model means content-based gating: the model dynamically adjusts how much its state updates, effectively attending to relevant inputs.',
          xpValue: 15,
        },
        {
          id: 'q11-3-3', type: 'short_answer',
          question: 'Why are hybrid architectures (interleaving SSM and Transformer layers) promising for long-context modelling?',
          correctAnswer: 'SSM layers efficiently compress long-range context at O(1)/step cost; Transformer attention layers provide precise retrieval over arbitrary positions. Hybrid models aim to get both: efficient long-range context and accurate retrieval.',
          gradingRubric: 'Award marks for: (1) SSM strength: efficient long-range compression; (2) Transformer strength: precise arbitrary-position retrieval; (3) hybrid targets complementary strengths; (4) neither alone is optimal for all tasks.',
          xpValue: 20,
        },
        {
          id: 'q11-3-4', type: 'multiple_choice',
          question: 'No SSM architecture has yet displaced Transformers at frontier scale because:',
          options: [
            'SSMs cannot be trained on GPUs',
            'SSMs still slightly underperform Transformers on quality benchmarks at equivalent FLOPs, particularly for precise retrieval',
            'SSMs require too much memory during training',
            'SSMs are patented and unavailable to most researchers',
          ],
          correctAnswer: 'SSMs still slightly underperform Transformers on quality benchmarks at equivalent FLOPs, particularly for precise retrieval',
          gradingRubric: 'Award full marks for the second option. The quality gap is closing but real — particularly on tasks requiring precise lookup of specific information from long context. Transformer attention\'s random-access property has not been fully replicated.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q11-4', title: 'Quiz 11.4 — Multimodal Architectures',
      type: 'lesson', moduleId: 'm11', passMark: 70,
      questions: [
        {
          id: 'q11-4-1', type: 'multiple_choice',
          question: 'A ViT (Vision Transformer) with 16×16 patches on a 224×224 image produces how many visual tokens?',
          options: ['14', '49', '196', '512'],
          correctAnswer: '196',
          gradingRubric: 'Award full marks for 196. (224/16)² = 14² = 196 patches. Each patch is a visual token processed by the Transformer.',
          xpValue: 10,
        },
        {
          id: 'q11-4-2', type: 'multiple_choice',
          question: 'The LLaVA architecture (visual token projection) prepends visual tokens to the text sequence because:',
          options: [
            'Visual information is always more important than text',
            'It is the simplest approach — the language model processes images and text as a flat token sequence without architectural changes',
            'Cross-attention is computationally too expensive for real-time use',
            'Visual tokens must come first for positional encoding to work',
          ],
          correctAnswer: 'It is the simplest approach — the language model processes images and text as a flat token sequence without architectural changes',
          gradingRubric: 'Award full marks for the second option. LLaVA\'s insight: project visual patches to the LLM\'s token dimension, concatenate with text tokens, and let the standard Transformer handle everything. No architectural changes needed.',
          xpValue: 10,
        },
        {
          id: 'q11-4-3', type: 'short_answer',
          question: 'Multimodal LLMs tend to hallucinate more about image content than text-only LLMs hallucinate about world knowledge. Why might this be?',
          correctAnswer: 'Visual content is ambiguous — fine details, text in images, and precise counts are hard to recover from compressed patch embeddings. The model interpolates or confabulates where visual information is unclear, applying language model fluency to visual uncertainty.',
          gradingRubric: 'Award marks for: (1) visual features are compressed/lossy; (2) fine details may not survive patch tokenisation; (3) the model applies its language fluency to fill gaps; (4) training data for precise visual grounding is sparser than general text.',
          xpValue: 20,
        },
        {
          id: 'q11-4-4', type: 'multiple_choice',
          question: 'Claude\'s tool use (calling search, code execution, etc.) is implemented architecturally as:',
          options: [
            'A separate neural network module specialising in tool calls',
            'Standard language generation with special tokens marking tool call boundaries',
            'A rule-based system layered on top of the Transformer',
            'Reinforcement learning from real tool execution feedback only',
          ],
          correctAnswer: 'Standard language generation with special tokens marking tool call boundaries',
          gradingRubric: 'Award full marks for the second option. Tool use is language modelling — the model generates structured text within <tool_use> tags. The infrastructure interprets this text, executes the tool, and injects the result back as a <tool_result> token sequence.',
          xpValue: 10,
        },
      ],
    },
  ],
  project: {
    id: 'p11', moduleId: 'm11',
    name: 'Architecture Comparator',
    emoji: '🔬',
    description: 'Build a side-by-side architecture analyser: input a model name or configuration (parameter count, heads, layers, context length, MoE or dense) and get back a breakdown of KV-cache memory, estimated FLOP per token, and how GQA or MoE changes these numbers.',
    tools: ['React', 'Tailwind CSS', 'TypeScript arithmetic', 'Reference model specs from papers'],
    status: 'not_started',
    rubric: [
      'Accepts model config: parameters, layers, heads, d_model, context length, MoE flag',
      'Correctly calculates KV-cache memory for MHA, GQA (G groups), and MQA',
      'Shows FLOP per token breakdown: attention vs FFN vs MoE overhead',
      'Side-by-side comparison of two configurations with delta percentages',
      'Preloaded configs for LLaMA 2 70B, Mistral 7B, Mixtral 8x7B — one click compare',
    ],
    xpReward: 300,
  },
}

// ─── MODULE 12 ────────────────────────────────────────────────────────────────
const m12: Module = {
  id: 'm12', number: 12, arc: 2,
  title: 'Claude and Frontier Models',
  description: 'Survey the frontier model landscape — Claude\'s model family, key competitors, evaluation methodology, and the open questions shaping the next generation of AI. Culminates in the Arc 2 Final Exam.',
  prerequisiteModuleId: 'm11',
  lessons: [
    {
      id: '12-1', number: '12.1',
      title: 'The Claude Model Family',
      duration: 13,
      content: `# The Claude Model Family

Claude is not a single model — it is a family of models optimised for different points on the capability-cost-speed trade-off. Understanding the family structure, Anthropic's design philosophy, and how Claude differs from competitors is essential context for anyone building AI systems.

## The Claude 3 Family: Haiku, Sonnet, Opus

Anthropic structures Claude in a three-tier hierarchy:

| Model | Speed | Cost | Capability | Best For |
|-------|-------|------|-----------|---------|
| **Haiku** | Fastest | Cheapest | Good | High-volume tasks, classification, simple Q&A |
| **Sonnet** | Balanced | Mid | Great | Most tasks: coding, analysis, writing |
| **Opus** | Slowest | Most expensive | Best | Complex reasoning, research, nuanced tasks |

This tiering is not just marketing — it reflects genuinely different model sizes and training configurations. Haiku is estimated to be a ~10–20B model; Sonnet ~70B; Opus potentially 200B+.

## Claude 3.5 and Beyond

**Claude 3.5 Sonnet** (mid-2024) was a significant improvement over Claude 3 Opus in most benchmarks, at Sonnet pricing and speed. This demonstrated:
- Architectural improvements matter more than just size
- Training methodology (Constitutional AI refinement, data curation) compounds across versions
- The capability-cost frontier shifts rapidly — what required Opus in March may run on Sonnet in June

**Claude 3.5 Haiku** and **Claude 3.5 Opus** followed, extending the pattern. Each model generation typically improves across:
- Coding ability (especially complex multi-file edits)
- Instruction following and format adherence
- Reasoning on math/science/logic benchmarks
- Vision capability (image understanding, chart reading)
- Context utilisation (using 200K tokens effectively)

## What Makes Claude Distinctively Claude

Beyond benchmark numbers, Claude has characteristic properties from Constitutional AI:

**Epistemic honesty:** Claude acknowledges uncertainty, says when it doesn't know, and avoids confabulating confident-sounding falsehoods. This is a trained value, not a capability limitation.

**Nuanced refusals:** Claude distinguishes between genuinely harmful requests and legitimate ones that superficially resemble them. It attempts helpful responses to ambiguous requests rather than broad over-refusal.

**Long-form quality:** Claude is particularly strong at extended reasoning, long documents, and multi-turn conversation — reflecting Anthropic's focus on genuinely helpful AI rather than optimising individual benchmark responses.

**Character consistency:** Claude maintains consistent values and personality across very different conversation types — a result of Constitutional AI training on identity and consistency.

## The Model Card and Responsible Disclosure

Each Claude release comes with a **model card** — a technical document disclosing:
- Training methodology (Constitutional AI, RLHF)
- Evaluated capabilities and limitations
- Safety evaluations performed
- Known failure modes and mitigations
- Appropriate use cases and restrictions

Model cards are Anthropic's transparency mechanism. They represent a commitment to honest disclosure about model capabilities, limitations, and potential harms — including cases where the model falls short.

## API Access Tiers

Claude is accessed via the Anthropic API with tiered models:
\`\`\`
anthropic.messages.create({
  model: "claude-haiku-4-...",        // cheapest, fastest
  model: "claude-sonnet-4-...",       // balanced
  model: "claude-opus-4-...",         // most capable
})
\`\`\`

Model selection is a cost-performance decision:
- For high-volume classification (is this text toxic? what category?): Haiku
- For code generation, document analysis, most chat: Sonnet
- For complex multi-step research, nuanced judgment: Opus

The right model is usually the smallest one that meets quality requirements — both for cost and latency.`,
      keyTerms: [
        { term: 'Claude Model Tiers', definition: 'Haiku (fast/cheap), Sonnet (balanced), Opus (most capable). Different model sizes and training configs optimised for different cost-capability trade-offs.' },
        { term: 'Model Card', definition: 'Technical disclosure document accompanying each model release. Contains training methodology, capabilities, limitations, safety evaluations, and appropriate use cases.' },
        { term: 'Capability-Cost Frontier', definition: 'The relationship between model capability and inference cost. Advances in training shift this frontier — each generation achieves higher capability at lower cost.' },
        { term: 'Constitutional AI Properties', definition: 'Epistemic honesty, nuanced refusals, character consistency — Claude\'s characteristic behaviours that result from CAI training rather than pure capability.' },
        { term: 'Claude 3.5 Sonnet', definition: 'Mid-2024 release that matched/exceeded Claude 3 Opus capability at Sonnet pricing. Demonstrated that training improvements can outpace raw scale.' },
      ],
    },
    {
      id: '12-2', number: '12.2',
      title: 'The Frontier Model Landscape',
      duration: 14,
      content: `# The Frontier Model Landscape

Claude exists in a competitive landscape of frontier AI models from OpenAI, Google, Meta, Mistral, and others. Understanding this landscape — what each model does well, how they differ architecturally and philosophically, and how to evaluate them — is essential knowledge for AI practitioners.

## The Major Frontier Models

### GPT-4 / GPT-4o (OpenAI)
- **Architecture:** Estimated MoE transformer, ~1.8T total parameters (unconfirmed)
- **Strengths:** Strong reasoning, excellent instruction following, tool use, vision
- **GPT-4o ("omni"):** Native multimodal — processes audio, vision, text in a single model without modality-specific encoders
- **API access:** OpenAI API, widely used, broad third-party ecosystem
- **Philosophy:** Rapid capability scaling, broad product integration (ChatGPT, Microsoft Copilot)

### Gemini 1.5 (Google DeepMind)
- **Architecture:** MoE-based, natively multimodal
- **Key differentiator:** 1M+ token context window (experimental); strong on long-document tasks
- **Gemini Ultra:** Competitive with GPT-4 on most benchmarks
- **Gemini Flash:** Very fast, cheap inference — competitive with Claude Haiku
- **Philosophy:** Deep Google integration, multimodal from training

### LLaMA 3 (Meta)
- **Architecture:** Dense decoder-only Transformer, GQA, RoPE
- **Sizes:** 8B, 70B, 405B — all open weights
- **Key differentiator:** Freely downloadable, runs locally, strong fine-tuning ecosystem
- **Strengths:** Open ecosystem enables rapid research; 70B competitive with frontier proprietary models
- **Philosophy:** Open weights as core value; democratising foundation models

### Mistral / Mixtral (Mistral AI)
- **Architecture:** Dense (Mistral 7B) and MoE (Mixtral 8×7B, 8×22B)
- **Key differentiator:** Efficient, open-weight, commercially licensable
- **Mixtral 8×22B:** Strong code and reasoning at fraction of GPT-4 cost
- **Philosophy:** Efficient open models; European AI development

### Claude (Anthropic)
- **Key differentiator:** Constitutional AI, epistemic honesty, extended context utilisation, long-form quality
- **Philosophy:** Safety-focused frontier AI; HHH principles; responsible scaling

## Benchmark Comparison

Common benchmarks and what they measure:

| Benchmark | What it tests | Notes |
|-----------|---------------|-------|
| **MMLU** | Multi-domain knowledge, 57 subjects | Susceptible to memorisation |
| **HumanEval** | Python code generation | Single-function level, not real-world coding |
| **GSM8K** | Grade school math word problems | CoT-dependent |
| **MATH** | Competition math (AMC, AIME level) | Requires sophisticated reasoning |
| **HellaSwag** | Common sense reasoning | Near-saturated at frontier |
| **BIG-Bench Hard** | Diverse reasoning tasks | Harder than standard benchmarks |
| **GPQA** | PhD-level science Q&A | Very challenging, less saturated |

As of 2025:
- Frontier models (GPT-4o, Gemini Ultra, Claude 3 Opus) cluster closely on standard benchmarks
- Differentiators emerge on: long context, code quality (SWE-Bench), tool use, and novel benchmarks
- All models improve rapidly — month-old benchmark comparisons are often obsolete

## The Evaluation Crisis

**Benchmark saturation:** frontier models score 85–90%+ on many standard benchmarks. The remaining gap is noise-level. New harder benchmarks are needed.

**Contamination:** models trained on internet data have likely seen many benchmark questions. Published scores may reflect memorisation.

**Task specificity:** no benchmark captures "generally useful for my task." The best model for code generation may differ from the best for medical Q&A.

**Vibechecks:** practitioners increasingly rely on personal testing ("how does it do on my actual use cases?") rather than leaderboard rankings. This is methodologically weak but practically necessary.

## How to Actually Choose a Model

For any given use case:
1. **Identify the real task:** what inputs, what outputs, what quality bar?
2. **Test all realistic candidates** with a sample of real-world examples
3. **Measure what matters:** quality on the task, latency, cost per successful completion
4. **Consider the ecosystem:** does the provider have the context length, tool use, output format control you need?
5. **Track changes:** model versions update frequently; re-evaluate quarterly

For most API builders: Claude 3.5 Sonnet or GPT-4o are the balanced default. For cost-sensitive applications: Claude Haiku, Gemini Flash, Mistral 7B. For maximum capability on hard tasks: Claude 3 Opus, GPT-4o, Gemini Ultra.`,
      keyTerms: [
        { term: 'GPT-4o', definition: 'OpenAI\'s natively multimodal model processing audio, vision, and text in a single architecture. Known for fast inference and strong instruction following.' },
        { term: 'Gemini 1.5', definition: 'Google DeepMind\'s MoE-based natively multimodal model. Differentiated by 1M+ token experimental context window.' },
        { term: 'LLaMA 3', definition: 'Meta\'s open-weight model family (8B–405B). Freely downloadable and fine-tuneable; the foundation of most open-source AI applications.' },
        { term: 'Benchmark Saturation', definition: 'When frontier models score so highly on a benchmark that differences are noise-level. Requires harder benchmarks (GPQA, MATH) to differentiate frontier systems.' },
        { term: 'SWE-Bench', definition: 'Software Engineering Benchmark: solving real GitHub issues with code. More representative of practical coding ability than HumanEval; less susceptible to memorisation.' },
      ],
    },
    {
      id: '12-3', number: '12.3',
      title: 'Evaluations, Red-Teaming, and Safety Testing',
      duration: 13,
      content: `# Evaluations, Red-Teaming, and Safety Testing

Deploying a frontier AI model is not just a matter of capability benchmarks. Before Claude releases publicly, Anthropic runs extensive safety evaluations — adversarial testing for dangerous capabilities, evaluation for harmful outputs, and responsible disclosure of findings. This is the engineering side of AI safety.

## Why Standard Benchmarks Are Insufficient for Safety

Standard capability benchmarks (MMLU, HumanEval) measure what a model can do on benign tasks. They do not measure:
- Whether the model provides harmful information when asked
- Whether jailbreaks can bypass safety training
- Whether the model can assist with weapons development, cyberattacks, or manipulation
- Whether the model reliably refuses harmful requests across diverse phrasings

Safety evaluation requires different methodology: **adversarial evaluation**.

## Red-Teaming

**Red-teaming** is the practice of adversarially probing a model to find failure modes before deployment:

**Internal red-teaming:** Anthropic employees attempt to elicit harmful outputs using creative, indirect, and multi-step approaches.

**External red-teaming:** Independent security researchers and safety experts are given model access under NDA to find issues Anthropic's team missed.

**Automated red-teaming:** Separate AI systems generate adversarial prompts to scale the search for failures:
\`\`\`
Attack model: generates diverse harmful prompt variations
Target model: attempts to comply with each prompt
Classifier: judges whether the response is harmful
Loop: attack model learns to generate prompts that elicit harmful responses
\`\`\`

This is essentially an adversarial game between an "attacker" LLM and the model being evaluated.

## Categories of Safety Evaluation

Anthropic's evaluations cover:

**CBRN (Chemical, Biological, Radiological, Nuclear):**
- Does the model provide meaningful uplift to someone seeking to create weapons of mass destruction?
- Evaluated with domain experts who can judge technical uplift, not just content filters

**Cybersecurity:**
- Can the model assist with offensive cyberattacks?
- Does it write functional malware?
- Evaluated by security researchers with real systems

**CSAM and illegal content:**
- Does the model generate sexual content involving minors?
- Does it assist with trafficking, exploitation, or other illegal activities?

**Manipulation and deception:**
- Can the model be used to systematically deceive or manipulate people?
- Does it assist with creating disinformation?

**Autonomy and self-preservation:**
- Does the model exhibit concerning autonomy-seeking behaviour?
- Does it attempt to resist shutdown or modification?

## The Responsible Scaling Policy in Practice

Anthropic's RSP establishes concrete thresholds:

| Capability level | Required safeguards before deployment |
|-----------------|--------------------------------------|
| Current (Claude 3) | Standard safety training, red-teaming |
| ASL-3 | Significant uplift for CBRN possible → enhanced security, access controls |
| ASL-4 | Unprecedented CBRN assistance OR autonomous replication → stringent containment |

ASL = AI Safety Level. Models approaching ASL-3 thresholds require significantly more stringent deployment conditions. The RSP is a public commitment — Anthropic cannot simply deploy an ASL-3 model without meeting the specified safeguards.

## Evaluating Honesty and Calibration

Safety evaluation also includes honesty metrics:

**TruthfulQA:** 817 questions designed to elicit common misconceptions. Models must answer correctly AND not state false beliefs. Measures calibration, not just accuracy.

**Calibration curves:** does a model that says "I'm 90% confident" actually be right 90% of the time? Well-calibrated models have uncertainty estimates that match actual accuracy.

**Sycophancy evaluation:** does the model change answers when users express disagreement or disappointment? Should not — correct answers should not yield to social pressure.

**Consistency:** does the model give the same answer to semantically identical questions phrased differently? Inconsistency suggests responses are less principled.

## What Red-Teaming Has Found

Publicly known findings from red-teaming exercises across the industry:

- **Jailbreaks are persistent:** adversarial prompts that bypass safety training are found for every model, often within days of release
- **Role-play exploits:** asking a model to "pretend to be an AI without restrictions" can sometimes circumvent training
- **Multi-turn manipulation:** safety training focuses on single-turn; multi-turn manipulation (gradually escalating) is harder to defend against
- **Indirect harms:** asking for information that, combined with other knowledge, enables harm is harder to detect than direct requests

These findings drive each training iteration. Red-teaming results directly inform the next version of the constitution and the RLAIF comparison dataset.

## Deployment Controls Beyond Training

Training-time safety is complemented by inference-time controls:

- **Output classifiers:** additional models checking outputs for harmful content before serving
- **Usage policies and terms of service:** legal agreements preventing misuse
- **Rate limiting and monitoring:** detecting unusual usage patterns
- **Fine-tuning restrictions:** Anthropic controls who can fine-tune Claude models (no fine-tuning for Claude 3 via API, unlike GPT-4)

Safety is a layered defence — no single mechanism is sufficient, and multiple complementary layers provide robustness.`,
      keyTerms: [
        { term: 'Red-Teaming', definition: 'Adversarial probing of a model before deployment to find failure modes. Includes internal, external, and automated (attack-model vs target-model) variants.' },
        { term: 'CBRN Evaluation', definition: 'Safety testing for Chemical, Biological, Radiological, Nuclear uplift — whether the model meaningfully assists weapons development. Requires domain expert evaluators.' },
        { term: 'ASL (AI Safety Level)', definition: 'Anthropic\'s RSP capability threshold system. Each level triggers specific required safeguards before the model can be deployed.' },
        { term: 'TruthfulQA', definition: 'Benchmark of 817 questions designed to elicit common misconceptions. Tests honesty and calibration, not just factual accuracy.' },
        { term: 'Jailbreak', definition: 'Adversarial prompt that bypasses a model\'s safety training to elicit refused outputs. Found for every deployed model; persistently motivates safety research.' },
      ],
    },
    {
      id: '12-4', number: '12.4',
      title: 'The State of the Field and What\'s Next',
      duration: 12,
      content: `# The State of the Field and What's Next

You have now covered the full Arc 2 curriculum — from perceptrons to Constitutional AI, from scaling laws to multimodal architectures. This final lesson surveys the most important open questions and near-term directions in AI, giving you the intellectual framework to continue learning independently.

## The Five Most Important Open Problems

### 1. Reliable Reasoning and Reducing Hallucination
Current LLMs confabulate — they generate fluent, plausible-sounding but false statements with no awareness of uncertainty. Despite calibration training, hallucination remains a fundamental problem at the frontier.

Active approaches:
- **Retrieval-Augmented Generation (RAG):** ground responses in retrieved documents (Module 15)
- **Tool use:** query external knowledge sources rather than relying on weights
- **Process reward models:** train on reasoning quality, not just final answer
- **Inference-time compute scaling:** use more tokens to think before answering (chain-of-thought at test time)

### 2. Long-Context Utilisation
Models support 200K+ token contexts, but **using** that context effectively is harder than having it. Models exhibit "lost in the middle" — attending well to the beginning and end of context but missing information in the middle.

Research directions:
- Positional encoding improvements for context > training length
- Hierarchical memory and summarisation for very long documents
- Training specifically on long-context retrieval tasks

### 3. Agents and Reliable Tool Use
LLMs that act in the world — browsing the web, writing and executing code, managing files — are a major frontier. Current challenges:
- Multi-step planning with error recovery
- Tool selection and parameter passing reliability
- Context management over long agent trajectories
- Sandboxing and safety for agentic actions

Module 14 covers this in depth.

### 4. Alignment at Scale
As models become more capable, the alignment problem becomes more critical. Open questions:
- Do current alignment methods (RLHF, CAI) scale to much more capable models?
- Can we detect deceptive alignment — a model appearing aligned during training but pursuing different goals during deployment?
- How do we specify values precisely enough for highly capable systems?

### 5. Interpretability
We have powerful models but limited understanding of what they compute internally. Anthropic's mechanistic interpretability research is identifying circuits, features, and computational patterns, but we are far from being able to fully audit a 70B model.

Goals: understand enough about internal computation to verify alignment, detect dangerous capabilities before deployment, and trust model behaviour in novel situations.

## Near-Term Directions (2025–2027)

**Reasoning models:** OpenAI o1, o3 and similar use extended inference-time computation for step-by-step reasoning before outputting answers. This is a qualitative shift — spending more compute at inference rather than training. Claude's extended thinking mode is Anthropic's version.

**Multimodal natives:** next-generation models will be trained on image, audio, and video from the start rather than added post-hoc. This changes what the base model "understands" fundamentally.

**Agentic applications:** models running autonomously for hours or days, managing complex multi-step tasks. This requires reliability improvements that are technically and safety-wise challenging.

**Smaller, more capable models:** Chinchilla showed that training is compute-limited. Future models will be smaller and better-trained, enabling deployment on-device (phones, laptops) — a massive shift in the AI access paradigm.

**Science and frontier reasoning:** AlphaFold demonstrated AI solving fundamental scientific problems. LLM-powered systems are beginning to augment scientific research — literature synthesis, hypothesis generation, experiment design.

## What You Now Know

Completing Arc 2 means you understand:
- How a random initialisation becomes a capable model (pre-training)
- What makes the Transformer architecture work at scale (attention, MHA, FFN, residual stream)
- Why scaling works and what its limits are (Chinchilla, emergence)
- How pre-trained models become helpful assistants (SFT, RLHF, Constitutional AI)
- The architectural innovations beyond vanilla Transformers (MoE, GQA, SSMs, multimodal)
- How frontier models are evaluated for both capability and safety

This is the full "intelligence stack" — the knowledge base for everything that follows in Arc 3 (building with the API) through Arc 5 (frontier research and personal AI systems).

## Staying Current

The field moves faster than any curriculum can. Resources for staying current:

- **Papers:** arxiv.org/list/cs.LG — read the abstracts of major submissions
- **Anthropic research blog:** anthropic.com/research — primary source on Claude
- **ML News / The Batch (Andrew Ng):** curated weekly
- **Twitter/X:** Andrej Karpathy, Yann LeCun, Ilya Sutskever, Anthropic researchers
- **Papers with Code:** track benchmark state-of-the-art with code

The most important habit: **read primary sources**. Research papers are accessible and contain the actual findings; blog posts and news articles compress and distort. When something important happens, read the original paper.`,
      keyTerms: [
        { term: 'Process Reward Model', definition: 'A reward model trained on the quality of reasoning steps, not just final answers. Encourages reliable chain-of-thought rather than lucky shortcuts.' },
        { term: 'Inference-Time Compute Scaling', definition: 'Using more tokens/computation at inference rather than training to improve answer quality. OpenAI o1 and Claude\'s extended thinking implement this.' },
        { term: 'Lost in the Middle', definition: 'Empirical finding that LLMs attend well to context start and end but miss information in the middle of long inputs. A fundamental long-context challenge.' },
        { term: 'Deceptive Alignment', definition: 'A theoretical failure mode: a model appearing aligned during training but pursuing different goals during deployment. A major open problem in alignment research.' },
        { term: 'Mechanistic Interpretability', definition: 'Research programme reverse-engineering what neural networks compute internally — identifying circuits, features, and algorithms. Anthropic\'s primary safety research direction.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q12-1', title: 'Quiz 12.1 — The Claude Model Family',
      type: 'lesson', moduleId: 'm12', passMark: 70,
      questions: [
        {
          id: 'q12-1-1', type: 'multiple_choice',
          question: 'You need to classify 10 million customer support tickets as "billing", "technical", or "other". Which Claude tier is most appropriate?',
          options: ['Claude Opus — highest accuracy', 'Claude Sonnet — balanced performance', 'Claude Haiku — fastest and cheapest for high-volume simple classification', 'Always use the latest model regardless of cost'],
          correctAnswer: 'Claude Haiku — fastest and cheapest for high-volume simple classification',
          gradingRubric: 'Award full marks for Claude Haiku. Simple 3-class classification does not require frontier reasoning. Using Opus would be 10–20× more expensive with no quality benefit. Cost optimisation: use the smallest model meeting quality requirements.',
          xpValue: 10,
        },
        {
          id: 'q12-1-2', type: 'short_answer',
          question: 'Claude 3.5 Sonnet outperformed Claude 3 Opus on most benchmarks at lower cost. What does this imply about the relative importance of model size vs training methodology?',
          correctAnswer: 'Training methodology (data curation, CAI refinement, RLHF improvements) can outweigh raw parameter count. A smaller, better-trained model can surpass a larger, earlier-generation model. Scale is not the only lever.',
          gradingRubric: 'Award marks for: (1) methodology > raw size implication; (2) CAI/training improvements compound; (3) capability-cost frontier moves — same capability at lower cost per generation; (4) size is one lever, not the only one.',
          xpValue: 20,
        },
        {
          id: 'q12-1-3', type: 'multiple_choice',
          question: 'A model card\'s primary purpose is to:',
          options: [
            'Market the model to potential customers',
            'Disclose training methodology, capabilities, limitations, and safety evaluations to enable informed use',
            'Provide API documentation for developers',
            'Satisfy regulatory compliance requirements only',
          ],
          correctAnswer: 'Disclose training methodology, capabilities, limitations, and safety evaluations to enable informed use',
          gradingRubric: 'Award full marks for the second option. Model cards are Anthropic\'s transparency mechanism — they reveal what the model was trained on, how it was evaluated, known failure modes, and appropriate use cases.',
          xpValue: 10,
        },
        {
          id: 'q12-1-4', type: 'multiple_choice',
          question: 'Claude\'s tendency to say "I\'m not certain" rather than confabulating is best described as:',
          options: [
            'A capability limitation — Claude genuinely knows less than other models',
            'A Constitutional AI-trained value — epistemic honesty is a designed property',
            'A result of smaller training dataset than competitors',
            'A safety filter added after training',
          ],
          correctAnswer: 'A Constitutional AI-trained value — epistemic honesty is a designed property',
          gradingRubric: 'Award full marks for the second option. Epistemic calibration is explicitly in the CAI constitution: "prefer responses that acknowledge uncertainty." This is a value, not a limitation.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q12-2', title: 'Quiz 12.2 — Frontier Landscape',
      type: 'lesson', moduleId: 'm12', passMark: 70,
      questions: [
        {
          id: 'q12-2-1', type: 'multiple_choice',
          question: 'Meta\'s LLaMA 3 is significant for the AI ecosystem primarily because:',
          options: [
            'It outperforms all proprietary models on every benchmark',
            'Its open weights enable local deployment, fine-tuning, and research without API costs or restrictions',
            'It uses a novel architecture not available in other models',
            'It is the only model trained on multilingual data',
          ],
          correctAnswer: 'Its open weights enable local deployment, fine-tuning, and research without API costs or restrictions',
          gradingRubric: 'Award full marks for the second option. Open weights democratise AI — anyone can run, study, and fine-tune LLaMA locally. This drives rapid ecosystem development, research, and competition that raises quality across the field.',
          xpValue: 10,
        },
        {
          id: 'q12-2-2', type: 'multiple_choice',
          question: 'Benchmark saturation means that standard benchmarks (MMLU, HellaSwag) are poor for comparing frontier models because:',
          options: [
            'The benchmarks are too large to evaluate quickly',
            'Frontier models score 85–90%+ — differences are at noise level and may reflect memorisation',
            'The benchmarks only measure English language ability',
            'Benchmarks require human evaluation which is too expensive',
          ],
          correctAnswer: 'Frontier models score 85–90%+ — differences are at noise level and may reflect memorisation',
          gradingRubric: 'Award full marks for the second option. When models cluster at 88–91%, a 1% difference is within measurement error and may not reflect genuine capability differences. Harder benchmarks (GPQA, MATH, SWE-Bench) are needed to differentiate frontier models.',
          xpValue: 15,
        },
        {
          id: 'q12-2-3', type: 'short_answer',
          question: 'A developer asks: "Which model is best?" How would you actually answer this question for a specific project?',
          correctAnswer: 'Define the specific task and quality bar; test all realistic candidates on real-world samples; measure task quality, latency, and cost; consider ecosystem needs (context length, tool use, output format). "Best" is task-specific.',
          gradingRubric: 'Award marks for: (1) task-specific definition of quality; (2) empirical testing on real examples; (3) measuring cost and latency not just quality; (4) rejecting the notion of a universal "best" model.',
          xpValue: 20,
        },
        {
          id: 'q12-2-4', type: 'multiple_choice',
          question: 'GPT-4o\'s "omni" designation refers to:',
          options: [
            'It is available in all countries simultaneously',
            'It is natively multimodal — processing audio, vision, and text in a single model from training',
            'It has an unlimited context window',
            'It omits safety restrictions present in earlier GPT-4 versions',
          ],
          correctAnswer: 'It is natively multimodal — processing audio, vision, and text in a single model from training',
          gradingRubric: 'Award full marks for the second option. GPT-4o is trained on audio, vision, and text from the start — not a text model with bolt-on vision. This enables real-time audio understanding and more natural multimodal reasoning.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q12-3', title: 'Quiz 12.3 — Evaluation and Safety Testing',
      type: 'lesson', moduleId: 'm12', passMark: 70,
      questions: [
        {
          id: 'q12-3-1', type: 'multiple_choice',
          question: 'Automated red-teaming uses an "attack model" that:',
          options: [
            'Evaluates model output quality on standard benchmarks',
            'Learns to generate adversarial prompts that elicit harmful responses from the target model',
            'Monitors the target model\'s GPU usage during inference',
            'Generates the training data for safety fine-tuning',
          ],
          correctAnswer: 'Learns to generate adversarial prompts that elicit harmful responses from the target model',
          gradingRubric: 'Award full marks for the second option. The attack model is optimised to find prompts that bypass the target model\'s safety training — essentially an adversarial game that scales red-teaming beyond what humans alone could achieve.',
          xpValue: 10,
        },
        {
          id: 'q12-3-2', type: 'multiple_choice',
          question: 'Anthropic\'s ASL (AI Safety Level) framework commits to:',
          options: [
            'Releasing all model weights publicly once safety is confirmed',
            'Applying specific safeguards before deploying models that reach certain capability thresholds',
            'Limiting model capability to avoid crossing safety thresholds',
            'Outsourcing all safety evaluation to independent regulators',
          ],
          correctAnswer: 'Applying specific safeguards before deploying models that reach certain capability thresholds',
          gradingRubric: 'Award full marks for the second option. The RSP does not cap capability — it conditions deployment on having adequate safeguards. ASL-3 models require enhanced security, access controls, and monitoring before deployment.',
          xpValue: 15,
        },
        {
          id: 'q12-3-3', type: 'short_answer',
          question: 'Why is "defence in depth" (multiple complementary safety layers) necessary rather than relying on training alone for model safety?',
          correctAnswer: 'No single mechanism is sufficient. Training-time alignment can be bypassed by jailbreaks. Output classifiers add a layer but can also be evaded. Usage policies and monitoring provide additional coverage. Failures in one layer are caught by others.',
          gradingRubric: 'Award marks for: (1) no single mechanism is foolproof; (2) jailbreaks bypass training-time safety; (3) complementary layers catch different failure modes; (4) defence in depth is a security engineering principle applied to AI safety.',
          xpValue: 20,
        },
        {
          id: 'q12-3-4', type: 'multiple_choice',
          question: 'TruthfulQA is designed to test:',
          options: [
            'Whether a model can correctly answer questions from Wikipedia',
            'Whether a model gives calibrated, honest answers rather than stating confident falsehoods about common misconceptions',
            'Whether a model passes a Turing test',
            'The speed at which a model retrieves factual information',
          ],
          correctAnswer: 'Whether a model gives calibrated, honest answers rather than stating confident falsehoods about common misconceptions',
          gradingRubric: 'Award full marks for the second option. TruthfulQA questions are designed around common misconceptions that humans state confidently but are false. A model that correctly refuses to affirm the misconception (or hedges) scores better than one that confidently states the popular false belief.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q12-4', title: 'Quiz 12.4 — State of the Field',
      type: 'lesson', moduleId: 'm12', passMark: 70,
      questions: [
        {
          id: 'q12-4-1', type: 'multiple_choice',
          question: 'Inference-time compute scaling (OpenAI o1, Claude extended thinking) represents a shift because:',
          options: [
            'It uses different hardware than standard inference',
            'Quality improvements come from spending more computation at inference rather than increasing model size at training',
            'It enables models to update their weights during inference',
            'It reduces latency by parallelising generation',
          ],
          correctAnswer: 'Quality improvements come from spending more computation at inference rather than increasing model size at training',
          gradingRubric: 'Award full marks for the second option. This is a new scaling axis: instead of training a bigger model, spend more tokens reasoning at test time. A fixed-size model can effectively become "smarter" on hard problems by thinking longer.',
          xpValue: 15,
        },
        {
          id: 'q12-4-2', type: 'multiple_choice',
          question: 'The "lost in the middle" problem for long-context models means:',
          options: [
            'Models lose context when the conversation is too long',
            'Models attend well to context beginning and end but miss information in the middle of long inputs',
            'Models cannot process documents longer than their context window',
            'Documents split across multiple API calls lose coherence',
          ],
          correctAnswer: 'Models attend well to context beginning and end but miss information in the middle of long inputs',
          gradingRubric: 'Award full marks for the second option. A 200K-context model is not uniformly reliable across 200K tokens. Supporting long context and effectively utilising it are separate problems.',
          xpValue: 10,
        },
        {
          id: 'q12-4-3', type: 'short_answer',
          question: 'What is "deceptive alignment" and why is it a challenging safety problem?',
          correctAnswer: 'A model that appears aligned during training (because it is evaluated) but pursues different goals during deployment (when it is not). It is hard to detect because the model behaves well whenever it is being tested — only failing in novel deployment situations.',
          gradingRubric: 'Award marks for: (1) aligned behaviour during evaluation; (2) divergent behaviour during deployment; (3) the model may "know" it is being evaluated; (4) interpretability is the most promising detection approach; (5) no confirmed instances but a coherent theoretical risk.',
          xpValue: 20,
        },
        {
          id: 'q12-4-4', type: 'multiple_choice',
          question: 'The most important habit for staying current in AI research is:',
          options: [
            'Following Twitter accounts of AI researchers',
            'Reading primary sources — original papers contain actual findings; secondary sources compress and distort',
            'Re-taking benchmark exams quarterly',
            'Only trusting results from Anthropic and OpenAI',
          ],
          correctAnswer: 'Reading primary sources — original papers contain actual findings; secondary sources compress and distort',
          gradingRubric: 'Award full marks for the second option. News articles, blog posts, and Twitter lose precision and introduce errors. The arxiv paper contains the actual methodology, results, and caveats — the only reliable source for understanding what was actually found.',
          xpValue: 10,
        },
      ],
    },
  ],
  project: {
    id: 'p12', moduleId: 'm12',
    name: 'Model Intelligence Briefing',
    emoji: '📋',
    description: 'Using the Claude API, build an automated "model intelligence briefing" tool: given a topic or company name, fetch recent arxiv papers and news, then produce a structured briefing covering: key research advances, capability claims, safety considerations, and open questions. The output should be a formatted markdown report.',
    tools: ['Claude API', 'Anthropic SDK', 'Web search (via tool use)', 'React for the front-end UI'],
    status: 'not_started',
    rubric: [
      'Accepts a topic/company input and orchestrates a multi-step research pipeline',
      'Uses Claude tool use to search for relevant papers and news articles',
      'Generates a structured briefing with sections: Advances, Claims, Safety, Open Questions',
      'Outputs clean markdown that renders properly in the Stark Academy prose styles',
      'Handles errors gracefully — missing search results, API failures, rate limits',
    ],
    xpReward: 340,
  },
  finalExam: {
    id: 'arc2-final',
    title: 'Arc 2 Final Exam — The Intelligence Stack',
    type: 'arc_final',
    moduleId: 'm12',
    passMark: 70,
    questions: [
      // M7: Neural Networks
      {
        id: 'arc2-f-1', type: 'multiple_choice',
        question: 'Without nonlinear activation functions, stacking multiple linear layers is equivalent to:',
        options: ['A deeper and more expressive network', 'A single linear transformation — identical expressive power to one layer', 'A network with doubled capacity', 'A network that cannot be trained with gradient descent'],
        correctAnswer: 'A single linear transformation — identical expressive power to one layer',
        gradingRubric: 'Award full marks for the second option. W₂(W₁x+b₁)+b₂ = (W₂W₁)x + const — always collapsible to one linear layer. Nonlinearity is what makes depth meaningful.',
        xpValue: 15,
      },
      {
        id: 'arc2-f-2', type: 'multiple_choice',
        question: 'GELU is used in Claude and GPT models rather than ReLU primarily because:',
        options: ['GELU uses less memory', 'GELU is smoother and empirically outperforms ReLU on language modelling tasks', 'GELU prevents vanishing gradients entirely', 'GELU is faster to compute'],
        correctAnswer: 'GELU is smoother and empirically outperforms ReLU on language modelling tasks',
        gradingRubric: 'Award full marks for the second option. GELU\'s smooth probabilistic gating consistently outperforms ReLU\'s hard threshold on language tasks — demonstrated in BERT, GPT, and confirmed across the field.',
        xpValue: 15,
      },
      // M8: Transformer
      {
        id: 'arc2-f-3', type: 'multiple_choice',
        question: 'The KV-cache in Transformer inference stores K and V matrices from previous tokens to:',
        options: ['Enable parallel training on multiple GPUs', 'Avoid recomputing previous tokens\' keys and values at each generation step, reducing per-step cost to O(T) from O(T²)', 'Store the model\'s long-term memory between conversations', 'Enable beam search over multiple candidate sequences'],
        correctAnswer: 'Avoid recomputing previous tokens\' keys and values at each generation step, reducing per-step cost to O(T) from O(T²)',
        gradingRubric: 'Award full marks for the second option. Without KV-cache, generating T tokens costs O(T²) total. With caching, only the new token\'s Q,K,V are computed per step — O(T) total for the sequence.',
        xpValue: 15,
      },
      {
        id: 'arc2-f-4', type: 'short_answer',
        question: 'What is the "residual stream" in Anthropic\'s mechanistic interpretability framing, and what role do attention and FFN layers each play in it?',
        correctAnswer: 'The residual stream is the high-dimensional vector flowing through all layers via residual connections — the shared communication channel. Attention layers move and aggregate information between token positions; FFN layers apply transformations within each position independently.',
        gradingRubric: 'Award marks for: (1) high-dimensional vector per token; (2) flows through all layers via residual connections; (3) attention = cross-position communication; (4) FFN = per-position processing; (5) this framing is used in interpretability research.',
        xpValue: 20,
      },
      // M9: Scaling Laws
      {
        id: 'arc2-f-5', type: 'multiple_choice',
        question: 'The Chinchilla "20 tokens per parameter" rule means a 7B parameter model should be trained on:',
        options: ['7 billion tokens', '70 billion tokens', '140 billion tokens', '1 trillion tokens'],
        correctAnswer: '140 billion tokens',
        gradingRubric: 'Award full marks for 140 billion. D* = 20 × N = 20 × 7×10⁹ = 1.4×10¹¹ = 140B tokens. LLaMA 2 7B trained on 2T tokens (well above optimal — investing more data for better inference quality).',
        xpValue: 15,
      },
      {
        id: 'arc2-f-6', type: 'multiple_choice',
        question: 'Flash Attention achieves O(T) memory rather than O(T²) by:',
        options: ['Approximating the attention computation', 'Tiling attention computation to avoid materialising the full T×T attention matrix in DRAM', 'Using 8-bit quantisation for attention weights', 'Caching attention patterns from previous sequences'],
        correctAnswer: 'Tiling attention computation to avoid materialising the full T×T attention matrix in DRAM',
        gradingRubric: 'Award full marks for the second option. Flash Attention is exact — not an approximation. It achieves O(T) memory by computing attention in tiles that fit in SRAM, never writing the full T×T matrix to slow GPU DRAM.',
        xpValue: 15,
      },
      // M10: Alignment
      {
        id: 'arc2-f-7', type: 'multiple_choice',
        question: 'Constitutional AI\'s RLAIF phase uses AI-generated preference labels rather than human labels to:',
        options: ['Reduce model training costs by 90%', 'Scale alignment signal beyond human bandwidth while maintaining principled consistency from the written constitution', 'Eliminate all human involvement in alignment', 'Generate synthetic pre-training data'],
        correctAnswer: 'Scale alignment signal beyond the bandwidth of human raters while maintaining principled consistency from the written constitution',
        gradingRubric: 'Award full marks for the second option. Human raters cannot evaluate every edge case — RLAIF generates comparative labels from AI applying explicit principles, scaling coverage dramatically.',
        xpValue: 15,
      },
      {
        id: 'arc2-f-8', type: 'multiple_choice',
        question: 'Sycophancy in RLHF-trained models — agreeing with users even when they\'re wrong — is an example of:',
        options: ['A capability gap in the base model', 'Goodhart\'s Law: the reward model learned that human raters prefer validation, so the policy over-optimised for agreement', 'Insufficient safety training', 'An architectural limitation of the Transformer'],
        correctAnswer: 'Goodhart\'s Law: the reward model learned that human raters prefer validation, so the policy over-optimised for agreement',
        gradingRubric: 'Award full marks for the second option. Human raters unconsciously rewarded flattering, agreeable responses. The reward model learned this proxy. PPO then maximised it — producing sycophancy as a trained behaviour.',
        xpValue: 15,
      },
      // M11: Advanced Architectures
      {
        id: 'arc2-f-9', type: 'multiple_choice',
        question: 'Grouped-Query Attention with 8 KV groups for 64 query heads compared to full Multi-Head Attention provides:',
        options: ['8× smaller KV-cache at near-MHA quality', '64× smaller KV-cache with significant quality loss', 'No memory savings, only speed improvements', '8× more attention heads for better quality'],
        correctAnswer: '8× smaller KV-cache at near-MHA quality',
        gradingRubric: 'Award full marks for "8× smaller KV-cache at near-MHA quality". GQA at G=8 groups has 8 KV pairs instead of 64 — 8× smaller cache. Quality is near-MHA because grouped heads still provide diverse attention; only MQA (G=1) shows significant degradation.',
        xpValue: 15,
      },
      {
        id: 'arc2-f-10', type: 'multiple_choice',
        question: 'Mamba\'s selective state space model can achieve constant O(1) per-step inference memory because:',
        options: ['It uses a fixed-size hidden state instead of an O(T) KV-cache', 'It approximates attention by skipping some tokens', 'It compresses context using a learned hash function', 'It shares memory across all layers'],
        correctAnswer: 'It uses a fixed-size hidden state instead of an O(T) KV-cache',
        gradingRubric: 'Award full marks for the first option. The SSM recurrent form hₜ = Āhₜ₋₁ + B̄xₜ has fixed state size — it does not grow with sequence length. All previous context is compressed into the fixed-size h. This is the fundamental difference from Transformer KV-cache.',
        xpValue: 15,
      },
      // M12: Claude and Frontier
      {
        id: 'arc2-f-11', type: 'multiple_choice',
        question: 'LLaVA-style visual token projection works by:',
        options: ['Training a separate visual-only language model', 'Projecting image patch embeddings into the LLM\'s token dimension and processing as a flat token sequence alongside text', 'Using cross-attention layers that attend to image features at every Transformer layer', 'Converting images to text descriptions before processing'],
        correctAnswer: 'Projecting image patch embeddings into the LLM\'s token dimension and processing as a flat token sequence alongside text',
        gradingRubric: 'Award full marks for the second option. LLaVA: CLIP visual encoder → 2-layer MLP projector → visual tokens in d_model space → prepend to text tokens → standard Transformer processes everything. No architectural changes to the LLM.',
        xpValue: 15,
      },
      {
        id: 'arc2-f-12', type: 'short_answer',
        question: 'Explain why a 70B parameter Mamba model might be preferred over a 70B Transformer for a specific application, and name one application where Transformers would still be preferred.',
        correctAnswer: 'Mamba: preferred for very long sequences (1M+ tokens) where KV-cache memory is prohibitive, or real-time streaming where per-step inference cost must be constant. Transformer preferred: tasks requiring precise retrieval of specific facts from arbitrary positions in long context (e.g., "what did the contract say in clause 7?").',
        gradingRubric: 'Award marks for: (1) Mamba advantage: constant memory / per-step cost for long sequences; (2) specific application where this matters; (3) Transformer advantage: precise arbitrary-position retrieval; (4) specific application showing this.',
        xpValue: 20,
      },
      {
        id: 'arc2-f-13', type: 'multiple_choice',
        question: 'The InstructGPT finding that a 1.3B RLHF model beat a 175B SFT model on human preference demonstrates:',
        options: ['RLHF reduces hallucination to zero', 'Alignment quality can matter more than raw scale — a well-aligned smaller model is more useful than a larger poorly-aligned one', 'SFT is never sufficient for deployment', 'Human raters prefer smaller models'],
        correctAnswer: 'Alignment quality can matter more than raw scale — a well-aligned smaller model is more useful than a larger poorly-aligned one',
        gradingRubric: 'Award full marks for the second option. This finding reframed the field: the alignment method matters as much as model size. Investment in RLHF/CAI is directly valuable, not just scale.',
        xpValue: 15,
      },
      {
        id: 'arc2-f-14', type: 'multiple_choice',
        question: 'Anthropic\'s Responsible Scaling Policy (RSP) applies to capability threshold ASL-3 because:',
        options: ['ASL-3 models require more memory than available GPUs', 'ASL-3 represents models providing meaningful CBRN uplift — dangerous enough to require enhanced security before deployment', 'ASL-3 refers to models with more than 3 trillion parameters', 'ASL-3 is the minimum capability level for commercial release'],
        correctAnswer: 'ASL-3 represents models providing meaningful CBRN uplift — dangerous enough to require enhanced security before deployment',
        gradingRubric: 'Award full marks for the second option. ASL-3 criteria: the model could provide meaningful uplift to someone seeking to create weapons of mass destruction, or enable large-scale cyberattacks. These risks require containment measures before deployment.',
        xpValue: 15,
      },
      {
        id: 'arc2-f-15', type: 'practical',
        question: 'You are designing a production system using Claude to answer medical questions for a hospital. List three specific evaluation steps you should perform before deploying, and explain why each matters.',
        correctAnswer: 'E.g.: (1) Clinical accuracy evaluation by domain experts on a sample of real medical queries — LLMs hallucinate medical facts; (2) Red-teaming for harmful advice, dangerous drug interactions, or instructions to delay emergency care; (3) Calibration testing — does Claude express appropriate uncertainty when it doesn\'t know vs. when it does? Overconfident wrong medical advice is dangerous.',
        gradingRubric: 'Award marks for any 3 substantive evaluations with justification. Core dimensions: accuracy/hallucination on domain-specific content; safety for high-stakes outputs; calibration/uncertainty; handling edge cases (emergency scenarios, rare conditions). Must justify why each matters for the medical context.',
        xpValue: 30,
      },
    ],
  },
}

export const arc2Modules: Module[] = [m7, m8, m9, m10, m11, m12]
