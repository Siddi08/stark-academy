import type { Module } from '@/types'

function makeStub(id: string, number: number, title: string, prereq?: string): Module {
  return {
    id, number, title, arc: 1,
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

// ─── MODULE 1 ─────────────────────────────────────────────────────────────────
const m1: Module = {
  id: 'm1', number: 1, arc: 1,
  title: 'How Computers Think in Binary',
  description: 'From transistors to bytes — understand the language all computers speak and why it shapes everything from memory layouts to neural network precision.',
  prerequisiteModuleId: undefined,
  lessons: [
    {
      id: '1-1', number: '1.1',
      title: 'Binary and the Basis of All Computing',
      duration: 12,
      content: `# Binary and the Basis of All Computing

Every piece of data in a computer — text, images, audio, and the neural network weights inside Claude — ultimately reduces to sequences of **1s and 0s**. This is not arbitrary: it emerges from the physics of transistors.

## Why Binary?

A **transistor** is a microscopic switch that can be either **on** (conducting current) or **off** (not conducting). This two-state physical reality maps perfectly to binary digits: 1 for on, 0 for off. A modern CPU contains billions of these transistors. We could theoretically build a decimal computer distinguishing ten voltage levels, but that is far less robust against electrical noise — which is why binary has dominated computing since the 1940s.

## Bits, Bytes, and the Number System

A single binary digit is a **bit**. Eight bits form a **byte**, which can represent 2⁸ = 256 different values (0–255).

| Unit | Bytes |
|------|-------|
| Kilobyte (KB) | 1,024 |
| Megabyte (MB) | 1,048,576 |
| Gigabyte (GB) | 1,073,741,824 |

## Reading Binary Numbers

Binary is **base-2**: each bit position represents a power of 2, reading right to left.

**Example:** \`01001101\` = 64 + 8 + 4 + 1 = **77 decimal**

To convert decimal → binary, divide by 2 repeatedly and read the remainders upward. For 77: 77÷2=38 R**1**, 38÷2=19 R**0**, 19÷2=9 R**1**, 9÷2=4 R**1**, 4÷2=2 R**0**, 2÷2=1 R**0**, 1÷2=0 R**1**. Reading bottom-up: **01001101**.

## Hexadecimal: Binary's Shorthand

**Hexadecimal** (base-16) uses digits 0–9 and A–F, where each hex digit represents exactly 4 bits:

| Decimal | Binary | Hex |
|---------|--------|-----|
| 10 | 1010 | A |
| 15 | 1111 | F |
| 255 | 11111111 | FF |

You see hex everywhere: memory addresses, CSS colours (\`#5456F5\` is Stark Academy's spark accent), and file headers. Prefixed with \`0x\` in code.

## Why This Matters for AI

Neural network **weights** are stored as floating-point numbers defined by the IEEE 754 standard — binary representations of decimals. This is why \`0.1 + 0.2 ≠ 0.3\` in most languages: 0.1 has no exact binary representation.

**Quantisation** reduces weights from 32-bit (FP32) to 8-bit (INT8) or 4-bit (INT4), cutting memory usage by 4–8× with acceptable accuracy loss. A 70B parameter FP16 model requires 70 × 10⁹ × 2 bytes ≈ **140 GB** of RAM. Quantisation to INT4 brings that to ~35 GB — fitting on a single high-end GPU.

> **Key insight:** Every optimisation trick in modern LLM deployment — quantisation, mixed precision, bfloat16 — is fundamentally about choosing how many bits to use to represent numbers.`,
      keyTerms: [
        { term: 'Bit', definition: 'The smallest unit of data — a single binary digit, either 0 or 1.' },
        { term: 'Byte', definition: 'A group of 8 bits, capable of representing 256 distinct values (0–255).' },
        { term: 'Binary', definition: 'A base-2 number system using only 0 and 1, matching the two states of transistors.' },
        { term: 'Hexadecimal', definition: 'A base-16 number system using 0–9 and A–F. Each hex digit represents exactly 4 bits.' },
        { term: 'Transistor', definition: 'A microscopic semiconductor switch in an on (1) or off (0) state — the physical basis of all digital computing.' },
        { term: 'Quantisation', definition: 'Reducing the bit-width of neural network weights (e.g., FP32 → INT8) to decrease memory usage and speed up inference.' },
        { term: 'IEEE 754', definition: 'The international standard for floating-point number representation in binary, including FP32 and FP16 formats.' },
        { term: 'Nibble', definition: 'Four bits — half a byte. Exactly one hexadecimal digit.' },
      ],
    },
    {
      id: '1-2', number: '1.2',
      title: 'Logic Gates and Boolean Algebra',
      duration: 10,
      content: `# Logic Gates and Boolean Algebra

Transistors combine into **logic gates** — circuits that implement Boolean operations and form the computational backbone of every processor, from a microcontroller to an H100 GPU.

## The Six Fundamental Gates

**NOT (Inverter):** Flips the input. NOT 1 = 0, NOT 0 = 1.

**AND:** Output is 1 only if *both* inputs are 1.

| A | B | AND |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

**OR:** Output is 1 if at least one input is 1.

**XOR (Exclusive OR):** Output is 1 only if inputs *differ*. XOR is the building block of addition circuits and appears in checksums and encryption.

**NAND:** AND then NOT. Output is 0 only if both inputs are 1. **NAND is universal** — any logic circuit can be built from NAND gates alone. This is why NAND flash memory (used in SSDs) dominates storage manufacturing.

**NOR:** OR then NOT. Also universal.

## Boolean Algebra Laws

Boolean algebra lets engineers reason about and simplify circuits mathematically:

- **Identity:** A AND 1 = A, A OR 0 = A
- **Null:** A AND 0 = 0, A OR 1 = 1
- **Complement:** A AND (NOT A) = 0
- **De Morgan's First Law:** NOT(A AND B) = (NOT A) OR (NOT B)
- **De Morgan's Second Law:** NOT(A OR B) = (NOT A) AND (NOT B)

De Morgan's Laws let engineers swap between AND/OR forms to minimise gate counts and reduce chip power consumption.

## From Gates to Arithmetic

Chain logic gates and you get arithmetic circuits. A **half adder** computes the sum of two single bits:
- **Sum** = A XOR B
- **Carry** = A AND B

Chain 64 full adders (each handling one bit position plus a carry input) and you have a 64-bit integer adder — the core of your CPU's ALU.

## Connection to Neural Networks

The earliest neural networks — **perceptrons**, proposed by Frank Rosenblatt in 1958 — were directly inspired by Boolean logic gates. A perceptron computes a weighted sum of inputs and fires if that sum exceeds a threshold, analogous to a weighted AND gate.

Modern activation functions like ReLU and sigmoid "soften" this hard binary threshold into smooth differentiable curves — essential for gradient-based training. But the conceptual lineage from Boolean logic gates to artificial neurons is direct and foundational.

The connection runs deeper: neural networks are often described as **universal function approximators** — a property analogous to NAND universality in logic circuits.`,
      keyTerms: [
        { term: 'Logic Gate', definition: 'A physical circuit implementing a Boolean operation (AND, OR, NOT, etc.) on binary inputs to produce a binary output.' },
        { term: 'Truth Table', definition: 'A table listing all possible input combinations and the corresponding output of a logic gate or circuit.' },
        { term: 'NAND Gate', definition: 'AND followed by NOT. Produces 0 only when both inputs are 1. Universal — any circuit can be built from NAND gates alone.' },
        { term: 'Boolean Algebra', definition: 'Mathematics of binary variables using AND, OR, and NOT operations, used to analyse and simplify logic circuits.' },
        { term: "De Morgan's Laws", definition: 'Two identities: NOT(A AND B) = (NOT A) OR (NOT B), and NOT(A OR B) = (NOT A) AND (NOT B). Used to simplify circuits.' },
        { term: 'XOR', definition: 'Exclusive OR — outputs 1 when inputs differ. Used in addition circuits, checksums, and encryption.' },
        { term: 'Half Adder', definition: 'A circuit that adds two single-bit numbers, producing a sum (XOR) and carry (AND) output.' },
        { term: 'ALU', definition: 'Arithmetic Logic Unit — the CPU component that performs integer arithmetic and bitwise logical operations.' },
      ],
    },
    {
      id: '1-3', number: '1.3',
      title: 'Memory, Storage and the Hierarchy',
      duration: 11,
      content: `# Memory, Storage and the Hierarchy

A computer does not have one type of memory — it has a carefully engineered **hierarchy** trading speed, capacity, and cost at each level. Understanding this hierarchy is essential for reasoning about why LLM inference is often memory-bound, not compute-bound.

## The Hierarchy

From fastest/smallest to slowest/largest:

| Level | Typical Size | Access Time | Notes |
|-------|-------------|-------------|-------|
| Registers | < 1 KB | ~0.3 ns | Inside CPU cores |
| L1 Cache | 32–64 KB/core | ~1 ns | On-chip, per core |
| L2 Cache | 256 KB–1 MB | ~5 ns | On-chip, per core |
| L3 Cache | 8–64 MB | ~20 ns | On-chip, shared |
| RAM (DRAM) | 16–256 GB | ~100 ns | Off-chip |
| NVMe SSD | 256 GB–4 TB | ~0.1 ms | ~1000× slower than RAM |
| HDD | 1–20 TB | ~10 ms | ~100,000× slower than RAM |

**Registers** sit directly inside CPU cores — the smallest and fastest storage, holding the operands of every active instruction.

**Cache** exists because RAM is far too slow to keep a modern CPU fed. The CPU automatically copies frequently accessed data into cache. A **cache hit** (data found in cache) takes ~1 ns; a **cache miss** (must fetch from RAM) takes ~100 ns — a 100× penalty.

## Memory Addressing

Every byte in RAM has a unique **memory address** — a number (usually in hex) identifying its location. Programs use **virtual addresses**, which the CPU's MMU (Memory Management Unit) translates to physical RAM addresses. This abstraction lets multiple programs share RAM safely.

**Endianness:** Multi-byte values can be stored least-significant-byte first (**little-endian**, used by x86/x64) or most-significant-byte first (**big-endian**, used in many network protocols). Matters when parsing binary file formats or network packets.

## Why This Matters for LLM Inference

A 70B parameter FP16 model requires ~140 GB — exceeding most single GPU VRAM (24–80 GB). Engineers handle this with:

1. **Quantisation:** reducing weight bit-width (140 GB → 35 GB at INT4)
2. **Model sharding:** splitting the model across multiple GPUs
3. **CPU offloading:** keeping some layers in system RAM, swapping to GPU for compute
4. **Flash Attention:** an algorithm redesigned around GPU memory hierarchy to reduce HBM reads

**Memory bandwidth** often limits inference more than raw FLOPS. NVIDIA H100 provides 3.35 TB/s HBM3 bandwidth. Getting data from GPU memory to compute units fast enough is frequently the real bottleneck.`,
      keyTerms: [
        { term: 'Memory Hierarchy', definition: 'The layered storage system in a computer: registers → L1/L2/L3 cache → RAM → SSD → HDD, trading speed for capacity at each level.' },
        { term: 'Cache Hit', definition: 'When data requested by the CPU is found in cache, avoiding a slow RAM access (~1 ns vs ~100 ns).' },
        { term: 'Cache Miss', definition: 'When requested data is not in cache, requiring a fetch from slower memory — typically 100× more expensive than a cache hit.' },
        { term: 'RAM', definition: 'Random Access Memory — the main working memory of a computer. Fast (~100 ns), volatile (data lost when powered off), and off-chip.' },
        { term: 'Virtual Memory', definition: 'An OS abstraction where each process sees a private address space, with the CPU\'s MMU translating virtual addresses to physical RAM locations.' },
        { term: 'Endianness', definition: 'The byte ordering of multi-byte values. Little-endian stores the least significant byte first; big-endian stores the most significant byte first.' },
        { term: 'Memory Bandwidth', definition: 'The rate at which data can be read from or written to memory (GB/s or TB/s). Often the primary bottleneck in LLM inference.' },
        { term: 'Flash Attention', definition: 'An attention algorithm that tiles computation to fit within GPU SRAM (fast cache), dramatically reducing slow HBM reads during transformer inference.' },
      ],
    },
    {
      id: '1-4', number: '1.4',
      title: 'How a CPU Executes a Program',
      duration: 13,
      content: `# How a CPU Executes a Program

When you run a Python script, billions of microscopic operations happen every second. Understanding the **fetch-decode-execute cycle** and Von Neumann architecture demystifies performance bottlenecks and the fundamental difference between CPU and GPU workloads.

## Von Neumann Architecture

The **Von Neumann architecture** (1945) underpins nearly every computer since. Its key insight: store programs and data in the *same* memory, making computers reprogrammable without hardware changes.

Key components:
- **CPU:** ALU (arithmetic), control unit (coordination), registers (scratchpad)
- **Memory (RAM):** Stores both program instructions and data
- **I/O devices:** Keyboard, display, storage, network
- **Bus:** Interconnect linking all components

## The Fetch-Decode-Execute Cycle

Every instruction goes through three stages, billions of times per second:

1. **Fetch:** The control unit reads the next instruction from RAM using the **Program Counter (PC)** register, which always holds the address of the next instruction.

2. **Decode:** The instruction is decoded: what operation (\`ADD\`, \`MOV\`, \`JMP\`)? What data locations (registers or memory addresses)?

3. **Execute:** The ALU or relevant unit performs the operation. Results are written to registers or memory. The PC advances.

## Registers and the ALU

**Registers** are the CPU's ultra-fast working storage. x86-64 CPUs have 16 general-purpose 64-bit registers (RAX, RBX, RCX, RDX, RSP, RBP, RSI, RDI, R8–R15). All computation operates on register contents.

The **ALU** performs integer arithmetic and bitwise operations. For floating-point, SIMD extensions like AVX-512 can compute on 512-bit vectors — processing 16 FP32 values simultaneously.

## Pipelining and Superscalar Execution

**Pipelining** overlaps the fetch/decode/execute stages of different instructions — like an assembly line where multiple cars are at different stages simultaneously. At 3 GHz, this means 3 billion pipeline cycles per second.

**Superscalar** CPUs have multiple execution units and complete more than one instruction per cycle — modern CPUs achieve 4–6 effective instructions per cycle.

## CPU vs GPU: The Core Difference

CPUs optimise for **latency** — completing a single thread as fast as possible, with complex branch prediction, out-of-order execution, and large caches.

GPUs optimise for **throughput** — executing thousands of simple operations in parallel. An NVIDIA H100 has 18,432 CUDA cores.

Matrix multiplication — the dominant operation in transformers — involves millions of independent multiply-accumulate operations. This maps perfectly to GPU parallelism. CPUs achieve ~1 TFLOP on such workloads; the H100 achieves ~2,000 TFLOPS in FP8.

> **The punchline:** Every forward pass through a transformer is billions of multiply-add operations on floating-point matrices. The CPU's instruction-at-a-time mental model is the wrong one for deep learning. Think in parallel, think in matrices.`,
      keyTerms: [
        { term: 'Von Neumann Architecture', definition: 'The computer design model where CPU, memory, and I/O connect via a bus, with programs and data stored in the same memory.' },
        { term: 'Fetch-Decode-Execute', definition: 'The three-stage cycle every CPU instruction undergoes: fetch from memory, decode the operation, execute it.' },
        { term: 'Program Counter (PC)', definition: 'A CPU register holding the memory address of the next instruction to be fetched.' },
        { term: 'Pipeline', definition: 'A CPU technique that overlaps the fetch/decode/execute stages of multiple instructions to increase throughput.' },
        { term: 'Clock Speed', definition: 'The rate at which a CPU completes cycles, measured in GHz. A 3 GHz CPU does 3 billion cycles per second.' },
        { term: 'SIMD', definition: 'Single Instruction, Multiple Data — CPU/GPU extensions that apply one operation to multiple data elements simultaneously (e.g., AVX-512).' },
        { term: 'Throughput', definition: 'Work completed per unit time. GPUs optimise for throughput; CPUs optimise for single-thread latency.' },
        { term: 'TFLOPS', definition: 'Teraflops — trillions of floating-point operations per second. A key measure of GPU computational capacity.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q1-1', title: 'Quiz 1.1 — Binary Systems',
      type: 'lesson', moduleId: 'm1', passMark: 70,
      questions: [
        {
          id: 'q1-1-1', type: 'multiple_choice',
          question: 'What is the decimal value of the binary number 11010?',
          options: ['18', '22', '26', '30'],
          correctAnswer: '26',
          gradingRubric: 'Award full marks for 26. Calculation: 16+8+2 = 26.',
          xpValue: 10,
        },
        {
          id: 'q1-1-2', type: 'short_answer',
          question: 'Explain why computers use binary (base-2) rather than decimal (base-10). What physical property of transistors makes binary the natural choice?',
          gradingRubric: 'Award marks for: (1) transistors have exactly two states — on/off; (2) two states are far more reliable/noise-resistant than ten; (3) any mention of electrical noise or manufacturing reliability.',
          xpValue: 15,
        },
        {
          id: 'q1-1-3', type: 'multiple_choice',
          question: 'A 70B parameter model stored in FP16 (2 bytes per parameter) requires approximately how much RAM?',
          options: ['35 GB', '70 GB', '140 GB', '280 GB'],
          correctAnswer: '140 GB',
          gradingRubric: 'Award full marks for 140 GB. Calculation: 70×10⁹ × 2 bytes = 140 GB.',
          xpValue: 10,
        },
        {
          id: 'q1-1-4', type: 'short_answer',
          question: 'What is quantisation in the context of AI models, and what trade-off does it make?',
          gradingRubric: 'Award marks for: (1) reducing bit-width of weights (FP32 → INT8/INT4); (2) reduces memory usage; (3) some accuracy loss is accepted. Bonus for specific examples.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q1-2', title: 'Quiz 1.2 — Logic Gates',
      type: 'lesson', moduleId: 'm1', passMark: 70,
      questions: [
        {
          id: 'q1-2-1', type: 'multiple_choice',
          question: 'What output does an XOR gate produce when both inputs are 1?',
          options: ['0', '1', 'Undefined', 'Depends on voltage'],
          correctAnswer: '0',
          gradingRubric: 'Award full marks for 0. XOR outputs 1 only when inputs differ.',
          xpValue: 10,
        },
        {
          id: 'q1-2-2', type: 'short_answer',
          question: 'What does it mean for NAND gates to be "universal"? Why is this practically significant?',
          gradingRubric: 'Award marks for: (1) any logic circuit can be built using only NAND gates; (2) manufacturers only need to optimise one gate type — reduces fabrication complexity.',
          xpValue: 15,
        },
        {
          id: 'q1-2-3', type: 'multiple_choice',
          question: "Apply De Morgan's First Law. Which expression equals NOT(A AND B)?",
          options: ['NOT A AND NOT B', 'NOT A OR NOT B', 'A OR B', 'NOT(A OR B)'],
          correctAnswer: 'NOT A OR NOT B',
          gradingRubric: "Award full marks for NOT A OR NOT B. De Morgan's First Law: NOT(A AND B) = (NOT A) OR (NOT B).",
          xpValue: 10,
        },
        {
          id: 'q1-2-4', type: 'short_answer',
          question: 'How do logic gates connect historically to neural networks? What is a perceptron and how does it relate to a Boolean gate?',
          gradingRubric: 'Award marks for: (1) perceptrons inspired by Boolean gates (Rosenblatt 1958); (2) perceptron computes weighted sum with threshold — like a weighted AND; (3) modern activations (ReLU/sigmoid) soften the threshold for differentiability.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q1-3', title: 'Quiz 1.3 — Memory Hierarchy',
      type: 'lesson', moduleId: 'm1', passMark: 70,
      questions: [
        {
          id: 'q1-3-1', type: 'multiple_choice',
          question: 'Which memory level has the fastest access time?',
          options: ['L3 Cache', 'L1 Cache', 'RAM', 'Registers'],
          correctAnswer: 'Registers',
          gradingRubric: 'Award full marks for Registers (~0.3 ns vs ~1 ns for L1 cache).',
          xpValue: 10,
        },
        {
          id: 'q1-3-2', type: 'short_answer',
          question: 'Why is memory bandwidth often the primary bottleneck in LLM inference rather than raw compute (FLOPS)?',
          gradingRubric: 'Award marks for: (1) weights must be loaded from GPU memory to compute units; (2) this data movement is slower than the actual matrix multiply; (3) any mention of bandwidth constraint or memory-bound vs compute-bound distinction.',
          xpValue: 15,
        },
        {
          id: 'q1-3-3', type: 'multiple_choice',
          question: 'What is a cache miss?',
          options: [
            'An arithmetic error in the CPU',
            'When requested data is not in cache, requiring a slower RAM fetch',
            'When a program crashes due to a memory error',
            'When the cache is full and must be cleared',
          ],
          correctAnswer: 'When requested data is not in cache, requiring a slower RAM fetch',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q1-3-4', type: 'short_answer',
          question: 'Name two techniques engineers use to run a 140 GB model on GPUs with only 80 GB VRAM. Explain how each works.',
          gradingRubric: 'Award marks for any two with explanations: quantisation (reduces bit-width → smaller model); model sharding (splits across multiple GPUs); CPU offloading (RAM holds some layers, swaps to GPU); layer streaming. Each technique must be explained to receive marks.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q1-4', title: 'Quiz 1.4 — CPU Architecture',
      type: 'lesson', moduleId: 'm1', passMark: 70,
      questions: [
        {
          id: 'q1-4-1', type: 'multiple_choice',
          question: 'What is the role of the Program Counter (PC) register?',
          options: [
            'Counts total instructions executed',
            'Holds the address of the next instruction to fetch',
            'Stores the result of the most recent computation',
            'Controls memory allocation',
          ],
          correctAnswer: 'Holds the address of the next instruction to fetch',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q1-4-2', type: 'short_answer',
          question: 'Why do GPUs dramatically outperform CPUs for matrix multiplication? What architectural difference explains this?',
          gradingRubric: 'Award marks for: (1) GPUs have thousands of simple parallel cores; (2) matrix multiply involves millions of independent multiply-accumulate operations — perfectly parallel; (3) CPUs optimise for latency, GPUs for throughput.',
          xpValue: 20,
        },
        {
          id: 'q1-4-3', type: 'multiple_choice',
          question: 'What is CPU pipelining?',
          options: [
            'Running multiple programs simultaneously',
            'Overlapping fetch/decode/execute stages of different instructions to increase throughput',
            'Compressing data to reduce memory usage',
            'Connecting multiple CPUs together',
          ],
          correctAnswer: 'Overlapping fetch/decode/execute stages of different instructions to increase throughput',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q1-4-4', type: 'practical',
          question: 'Open your system task manager (Windows: Ctrl+Shift+Esc, macOS: Activity Monitor, Linux: htop). Note your CPU core count and clock speed. In 3–5 sentences, explain what these numbers mean in terms of the fetch-decode-execute cycle and parallelism.',
          gradingRubric: 'Award marks for: (1) correctly noting their CPU specs; (2) each core runs its own independent fetch-decode-execute cycle; (3) multiple cores enable true parallelism across threads; (4) clock speed = cycles per second per core.',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p1', moduleId: 'm1',
    name: 'Binary Visualiser', emoji: '🔢',
    description: 'Build an interactive web tool that converts numbers between binary, decimal, and hexadecimal, visualises individual bits in a byte, and shows how ASCII text encodes to binary.',
    tools: ['html', 'css', 'javascript', 'claude-code'],
    status: 'not_started',
    rubric: [
      'Converts decimal → binary → hexadecimal correctly for any positive integer up to 255',
      'Displays a visual 8-bit representation with labelled bit positions (128, 64, 32...)',
      'Allows clicking/toggling individual bits and updates the decimal value live',
      'Converts ASCII text to binary (one byte per character, space-separated)',
      'Handles edge cases: 0, 255, values > 255 displayed as multi-byte',
      'Clean, usable UI with labels explaining each number base',
      'Deployed or runnable via a single HTML file (no build step required)',
    ],
    xpReward: 100,
  },
}

// ─── MODULE 2 ─────────────────────────────────────────────────────────────────
const m2: Module = {
  id: 'm2', number: 2, arc: 1,
  title: 'Algorithms and Data Structures',
  description: 'Big-O complexity, arrays, hash maps, trees, graphs, and sorting — the vocabulary every engineer uses to reason about performance.',
  prerequisiteModuleId: 'm1',
  lessons: [
    {
      id: '2-1', number: '2.1',
      title: 'Big-O Notation and Algorithm Complexity',
      duration: 11,
      content: `# Big-O Notation and Algorithm Complexity

Writing code that *works* is step one. Writing code that *scales* — still performing acceptably when input grows from 100 items to 100 million — requires understanding **algorithmic complexity**.

## What Big-O Measures

**Big-O notation** describes how an algorithm's runtime (or memory usage) grows as input size *n* increases. It focuses on the **dominant term** and ignores constants, because at scale constants become irrelevant.

Common complexities, fastest to slowest:

| Notation | Name | Example | n=1,000 ops |
|----------|------|---------|-------------|
| O(1) | Constant | Array index lookup | 1 |
| O(log n) | Logarithmic | Binary search | ~10 |
| O(n) | Linear | Scan an array | 1,000 |
| O(n log n) | Linearithmic | Merge sort | ~10,000 |
| O(n²) | Quadratic | Bubble sort | 1,000,000 |
| O(2ⁿ) | Exponential | Brute-force chess | 10³⁰⁰ |

At n = 1,000,000: O(log n) ≈ 20 operations; O(n²) = 10¹² operations. The difference between a millisecond query and one that takes years.

## Time vs Space Complexity

**Time complexity** measures operations; **space complexity** measures memory. Many algorithms trade one for the other. **Memoisation** (caching computed results) reduces time at the cost of space — a foundational pattern in both dynamic programming and ML inference (the KV cache).

## Best, Worst, and Average Case

Big-O typically describes the **worst case**. Algorithms also have **best case** (Ω, omega) and **average case** (Θ, theta):

Quicksort: O(n²) worst case, O(n log n) average — which is why it dominates in practice.

## Why This Matters for AI

**Transformer attention** is O(n²) in sequence length. A 128K token context needs 128,000² ≈ 16 billion attention score computations *per layer*. This is why long-context models are expensive and why Flash Attention (which reduces memory I/O without changing the O(n²) complexity) is so important.

**Vector similarity search** for RAG systems is O(n) naively on a million embeddings. Vector databases use ANN (Approximate Nearest Neighbour) algorithms like HNSW that achieve O(log n) by trading exactness for speed.

**Data preprocessing pipelines** hit O(n²) bottlenecks regularly — tokenisation, deduplication, and nearest-neighbour deduplication of training data are all active research areas precisely because dataset sizes have scaled to trillions of tokens.`,
      keyTerms: [
        { term: 'Big-O Notation', definition: 'Mathematical notation describing the upper bound of how an algorithm\'s resource usage grows with input size n.' },
        { term: 'Time Complexity', definition: 'How the number of operations an algorithm performs scales with input size.' },
        { term: 'Space Complexity', definition: 'How the memory an algorithm uses scales with input size.' },
        { term: 'O(1)', definition: 'Constant time — execution time does not depend on input size. Example: array index access.' },
        { term: 'O(log n)', definition: 'Logarithmic time — input is halved each step. Example: binary search. Very efficient at scale.' },
        { term: 'O(n²)', definition: 'Quadratic time — runtime scales with the square of input size. Typical of naive nested loops; becomes impractical for large n.' },
        { term: 'Memoisation', definition: 'Caching the results of expensive function calls to avoid recomputing them — trades space for time.' },
        { term: 'ANN', definition: 'Approximate Nearest Neighbour — algorithms like HNSW that find near-exact nearest neighbours in O(log n) by trading perfect accuracy for speed.' },
      ],
    },
    {
      id: '2-2', number: '2.2',
      title: 'Arrays, Linked Lists, Stacks and Queues',
      duration: 10,
      content: `# Arrays, Linked Lists, Stacks and Queues

The choice of data structure determines which operations are fast and which are slow. Four fundamental structures — **arrays, linked lists, stacks, and queues** — appear throughout systems software, compilers, and ML frameworks.

## Arrays

An **array** stores elements in **contiguous memory**. Because addresses are sequential, index access is O(1): to find element 1000, compute \`base_address + (1000 × element_size)\` directly.

| Operation | Time |
|-----------|------|
| Access by index | O(1) |
| Search (unsorted) | O(n) |
| Insert at end | O(1) amortised |
| Insert in middle | O(n) — must shift elements |
| Delete in middle | O(n) — must shift elements |

Arrays are the internal structure of Python lists, NumPy arrays, and PyTorch tensors. The **contiguous memory layout** makes them cache-friendly — sequential access triggers hardware prefetching, keeping L1 cache hit rates high. This is a major reason NumPy operations are fast even in Python.

## Linked Lists

A **linked list** is a chain of **nodes**, each holding a value and a pointer to the next node. Nodes can be scattered anywhere in memory.

| Operation | Time |
|-----------|------|
| Access by index | O(n) — must traverse |
| Insert at known position | O(1) — change pointers |
| Delete at known position | O(1) — change pointers |

A **doubly linked list** has pointers in both directions. Used internally in Python's \`collections.deque\` and OS scheduler queues.

## Stacks

A **stack** is **LIFO** (Last In, First Out). Elements are pushed to and popped from the "top."

The **call stack** is the most important stack in computing: when function A calls function B, B's return address and local variables are pushed. When B returns, they are popped. Infinite recursion = call stack overflow. Stack frames are why deeply nested recursion is dangerous.

## Queues

A **queue** is **FIFO** (First In, First Out). Elements enter at the back, leave from the front.

A **deque** (double-ended queue) supports push/pop at both ends — O(1) — and is used in BFS traversal, sliding window algorithms, and work-stealing thread schedulers.

## Connection to LLMs

The **KV cache** in transformer inference is conceptually an array growing by one entry per generated token. Its O(n) memory growth as context extends is a fundamental cost. This is the motivation for architectures like Mamba (O(1) state size) and for techniques like sliding window attention that cap KV cache size at O(window) rather than O(sequence length).`,
      keyTerms: [
        { term: 'Array', definition: 'A data structure storing elements in contiguous memory locations, enabling O(1) index access but O(n) middle insert/delete.' },
        { term: 'Linked List', definition: 'A sequence of nodes where each holds a value and pointer to the next, enabling O(1) insertion at known positions but O(n) index access.' },
        { term: 'Stack', definition: 'A LIFO (Last In, First Out) data structure. Push adds to top, pop removes from top. Underlies function call management in CPUs.' },
        { term: 'Queue', definition: 'A FIFO (First In, First Out) data structure. New elements join the back, removals happen from the front.' },
        { term: 'LIFO', definition: 'Last In, First Out — the access pattern of a stack. The most recently added element is removed first.' },
        { term: 'FIFO', definition: 'First In, First Out — the access pattern of a queue. The earliest added element is removed first.' },
        { term: 'Cache-friendly', definition: 'Data layout (e.g., contiguous arrays) that maximises CPU cache hit rates by enabling sequential memory access and hardware prefetching.' },
        { term: 'KV Cache', definition: 'In transformer inference, the cached key-value pairs from previous tokens, enabling each new token to attend to past context without recomputation. Grows O(n) with sequence length.' },
      ],
    },
    {
      id: '2-3', number: '2.3',
      title: 'Hash Maps, Trees and Graphs',
      duration: 12,
      content: `# Hash Maps, Trees and Graphs

Three structures power the majority of sophisticated algorithms: **hash maps** for O(1) lookup, **trees** for sorted hierarchical data, and **graphs** for networks of any kind.

## Hash Maps

A **hash map** maps keys to values in O(1) average time using a **hash function** that converts a key to a storage index.

**How it works:**
1. Call \`hash(key)\` → integer
2. Compute \`index = hash % table_size\`
3. Store/retrieve value at that index

**Collisions** occur when two keys hash to the same index. Resolution strategies:
- **Chaining:** Each slot holds a linked list of entries sharing that hash
- **Open addressing:** Probe the next empty slot

Python's \`dict\`, JavaScript objects, and Java's \`HashMap\` all use hash table internals. The O(1) average lookup is what makes token vocabulary lookups, feature caches, and embedding store indices fast.

## Trees

A **binary search tree (BST)** stores nodes with at most two children, maintaining: *left subtree values < node value < right subtree values*. Search, insert, delete: O(log n).

**Balanced trees** maintain height balance to guarantee O(log n) even in worst case:
- **AVL trees:** Strict balance — fast lookups, slower inserts
- **Red-Black trees:** Relaxed balance — used in Linux kernel, C++ \`std::map\`
- **B-trees:** Many children per node — minimise disk reads. Used in SQLite, PostgreSQL indexes, and most file systems

## Graphs

A **graph** is a set of **nodes** (vertices) connected by **edges**. Graphs model road networks, social graphs, dependency chains, and knowledge bases.

- **Directed:** Edges have direction (A→B doesn't imply B→A)
- **Weighted:** Edges have costs (distances, probabilities)
- **DAG (Directed Acyclic Graph):** No cycles — the structure of computation in neural networks

**Traversals:**
- **BFS (Breadth-First Search):** Visits nodes level by level — finds shortest paths in unweighted graphs. O(V+E).
- **DFS (Depth-First Search):** Dives deep before backtracking — used in topological sorting (dependency resolution) and cycle detection. O(V+E).

## Connection to AI

Neural network computation is a **DAG**: each operation depends on previous ones, with no cycles (during forward pass). Frameworks like PyTorch build this DAG dynamically for automatic differentiation.

**Knowledge graphs** represent facts as node-edge-node triples and are used in RAG systems to augment retrieval with structured reasoning. **Graph Neural Networks (GNNs)** directly operate on graph-structured data — crucial for molecular property prediction and recommendation systems.`,
      keyTerms: [
        { term: 'Hash Map', definition: 'A data structure mapping keys to values using a hash function, enabling O(1) average lookup, insert, and delete.' },
        { term: 'Hash Function', definition: 'A function that converts a key to an integer index, determining where it is stored in a hash map.' },
        { term: 'Collision', definition: 'When two different keys hash to the same index in a hash map, requiring a resolution strategy like chaining or open addressing.' },
        { term: 'Binary Search Tree', definition: 'A tree where each node has at most two children and left subtree values < node value < right subtree values. O(log n) search/insert/delete.' },
        { term: 'Balanced Tree', definition: 'A BST that maintains height balance to guarantee O(log n) operations in the worst case (e.g., AVL, Red-Black, B-tree).' },
        { term: 'Graph', definition: 'A data structure of nodes (vertices) connected by edges, modelling networks, dependencies, and relationships.' },
        { term: 'BFS', definition: 'Breadth-First Search — graph traversal visiting nodes level by level. Finds shortest paths in unweighted graphs. O(V+E) time.' },
        { term: 'DAG', definition: 'Directed Acyclic Graph — a directed graph with no cycles. The structure of neural network computation and dependency graphs.' },
      ],
    },
    {
      id: '2-4', number: '2.4',
      title: 'Sorting Algorithms and Recursion',
      duration: 11,
      content: `# Sorting Algorithms and Recursion

Sorting is the canonical algorithmic challenge: arrange a collection in order. Studying sorting teaches the most powerful algorithm design patterns: **divide-and-conquer**, the importance of pivot selection, and the elegance of **recursion**.

## Simple Sorts: O(n²)

**Bubble sort** repeatedly swaps adjacent out-of-order elements. Simple to understand, never used in production.

**Selection sort** finds the minimum each pass and places it at the front. Also O(n²).

**Insertion sort** builds the sorted array one element at a time, inserting each into its correct position. Excellent for **nearly-sorted data** — approaches O(n) when almost sorted. Used as the base case in Python's Timsort (the built-in sort).

## Efficient Sorts: O(n log n)

**Merge sort** divides in half, recursively sorts each half, then **merges** the sorted halves:

\`\`\`
mergesort(arr):
  if len(arr) <= 1: return arr          # base case
  mid = len(arr) // 2
  left = mergesort(arr[:mid])           # recursive case
  right = mergesort(arr[mid:])
  return merge(left, right)
\`\`\`

Guaranteed O(n log n). Requires O(n) extra memory. **Stable** (preserves equal elements' order).

**Quicksort** picks a **pivot**, partitions into "less than" and "greater than" groups, recursively sorts each:

\`\`\`
quicksort(arr):
  if len(arr) <= 1: return arr
  pivot = arr[len(arr)//2]
  left = [x for x in arr if x < pivot]
  right = [x for x in arr if x > pivot]
  return quicksort(left) + [pivot] + quicksort(right)
\`\`\`

Average O(n log n), worst case O(n²) with bad pivot choices. In-place variants use O(log n) stack space. Usually faster than merge sort in practice due to cache locality.

## Recursion

**Recursion** is when a function calls itself on a smaller sub-problem. Every recursive solution needs:
1. **Base case:** When to stop (e.g., array of size 0 or 1)
2. **Recursive case:** Call on a smaller problem

Each call adds a **stack frame** to the call stack. Recursion too deep → stack overflow. **Tail recursion** (where the recursive call is the last operation) can be optimised by compilers to avoid stack growth.

## Dynamic Programming

**Dynamic programming (DP)** extends recursion with memoisation — store results of sub-problems to avoid recomputation. DP reduces exponential brute-force to polynomial time for many problems.

In LLM generation: **beam search** maintains the top-k most probable sequences at each step, effectively using DP to track the best partial sequences. In bioinformatics: sequence alignment algorithms (used in genomic archaeology) are classic O(nm) DP problems.`,
      keyTerms: [
        { term: 'Merge Sort', definition: 'A divide-and-conquer sorting algorithm. Splits the array in half, recursively sorts, then merges. Guaranteed O(n log n), stable, requires O(n) extra memory.' },
        { term: 'Quicksort', definition: 'A sorting algorithm that picks a pivot, partitions elements, and recursively sorts partitions. Average O(n log n), in-place, typically fastest in practice.' },
        { term: 'Recursion', definition: 'A technique where a function calls itself on a smaller sub-problem, with a base case that terminates the calls.' },
        { term: 'Base Case', definition: 'The condition in a recursive function that stops further recursion and returns a direct result.' },
        { term: 'Call Stack', definition: 'The stack of active function calls in a program. Each recursive call adds a frame; too many levels causes a stack overflow.' },
        { term: 'Divide and Conquer', definition: 'An algorithm design paradigm: split the problem into smaller sub-problems, solve each recursively, combine results. Used in merge sort, quicksort, FFT.' },
        { term: 'Dynamic Programming', definition: 'Breaking a problem into overlapping sub-problems and caching results (memoisation) to avoid redundant computation. Reduces exponential problems to polynomial.' },
        { term: 'Pivot', definition: 'In quicksort, the element chosen to partition the array into "less than" and "greater than" groups. Poor pivot selection leads to O(n²) worst case.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q2-1', title: 'Quiz 2.1 — Big-O Complexity',
      type: 'lesson', moduleId: 'm2', passMark: 70,
      questions: [
        {
          id: 'q2-1-1', type: 'multiple_choice',
          question: 'What is the time complexity of accessing an element in an array by its index?',
          options: ['O(log n)', 'O(n)', 'O(1)', 'O(n²)'],
          correctAnswer: 'O(1)',
          gradingRubric: 'Award full marks for O(1). Array index access computes the address directly: base + index × size.',
          xpValue: 10,
        },
        {
          id: 'q2-1-2', type: 'short_answer',
          question: "Transformer attention is O(n²) in sequence length. What are the practical implications of this for a model with a 128K token context window?",
          gradingRubric: 'Award marks for: (1) 128K² = ~16 billion attention score computations per layer; (2) this makes long-context models expensive in compute and memory; (3) bonus for mentioning Flash Attention or sparse attention as mitigations.',
          xpValue: 15,
        },
        {
          id: 'q2-1-3', type: 'multiple_choice',
          question: 'An algorithm takes 2ms for n=1,000 and 20ms for n=10,000. What is its Big-O complexity?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          correctAnswer: 'O(n)',
          gradingRubric: 'Award full marks for O(n). Time scales linearly: 10× input → 10× time.',
          xpValue: 10,
        },
        {
          id: 'q2-1-4', type: 'short_answer',
          question: 'What is the difference between time complexity and space complexity? Describe one real algorithm that trades one for the other.',
          gradingRubric: 'Award marks for: (1) time = operations; space = memory; (2) example trade-off — memoisation reduces time at cost of space; merge sort uses O(n) extra space for O(n log n) time; KV cache trades memory for avoiding recomputation of attention.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q2-2', title: 'Quiz 2.2 — Data Structures',
      type: 'lesson', moduleId: 'm2', passMark: 70,
      questions: [
        {
          id: 'q2-2-1', type: 'multiple_choice',
          question: 'What is the time complexity of inserting a node at the beginning of a singly linked list (given a pointer to the head)?',
          options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
          correctAnswer: 'O(1)',
          gradingRubric: 'Award full marks for O(1). Simply update two pointers: new_node.next = head, head = new_node.',
          xpValue: 10,
        },
        {
          id: 'q2-2-2', type: 'short_answer',
          question: 'What is a stack (LIFO)? Describe one concrete use of a stack in a real computer system.',
          gradingRubric: 'Award marks for: (1) Last In First Out — push/pop to same end; (2) any real example: call stack (function returns), browser back history, undo in editors, expression parsing in compilers.',
          xpValue: 15,
        },
        {
          id: 'q2-2-3', type: 'multiple_choice',
          question: 'Why are arrays more cache-friendly than linked lists for sequential access?',
          options: [
            'Arrays use less memory overall',
            'Array elements are stored contiguously, enabling hardware prefetching',
            'Arrays are always sorted',
            'Linked list pointer dereferences are cached automatically',
          ],
          correctAnswer: 'Array elements are stored contiguously, enabling hardware prefetching',
          gradingRubric: 'Award full marks for the second option. Contiguous memory → sequential access → hardware prefetcher loads upcoming elements into L1 cache.',
          xpValue: 10,
        },
        {
          id: 'q2-2-4', type: 'short_answer',
          question: 'How does the KV cache in transformer inference relate to the array data structure? Why does it become a memory problem for long contexts?',
          gradingRubric: 'Award marks for: (1) KV cache is an array growing by one entry per generated token; (2) O(n) memory growth as sequence extends; (3) at 128K tokens with large models, this can be tens of GB per request; (4) bonus for sliding window or quantised KV cache as mitigations.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q2-3', title: 'Quiz 2.3 — Hash Maps, Trees & Graphs',
      type: 'lesson', moduleId: 'm2', passMark: 70,
      questions: [
        {
          id: 'q2-3-1', type: 'multiple_choice',
          question: 'What is the average-case time complexity of a hash map lookup?',
          options: ['O(log n)', 'O(1)', 'O(n)', 'O(n²)'],
          correctAnswer: 'O(1)',
          gradingRubric: 'Award full marks for O(1). Hash function computes the index directly; retrieve is O(1) when collisions are minimal.',
          xpValue: 10,
        },
        {
          id: 'q2-3-2', type: 'short_answer',
          question: 'What is a hash collision, and what are two strategies for resolving it?',
          gradingRubric: 'Award marks for: (1) two keys produce the same hash index; (2) chaining — linked list at each slot; (3) open addressing — probe for next empty slot (linear probing, quadratic probing).',
          xpValue: 15,
        },
        {
          id: 'q2-3-3', type: 'multiple_choice',
          question: 'In which use case is BFS (Breadth-First Search) preferred over DFS?',
          options: [
            'Finding all connected components',
            'Finding the shortest path in an unweighted graph',
            'Topological sorting of a DAG',
            'Cycle detection',
          ],
          correctAnswer: 'Finding the shortest path in an unweighted graph',
          gradingRubric: 'Award full marks for shortest path. BFS explores level by level, guaranteeing shortest path in unweighted graphs.',
          xpValue: 10,
        },
        {
          id: 'q2-3-4', type: 'short_answer',
          question: 'Why is neural network computation represented as a DAG (Directed Acyclic Graph)? What property of DAGs makes automatic differentiation (backpropagation) possible?',
          gradingRubric: 'Award marks for: (1) each operation depends on previous outputs — directed; (2) no cycles in the forward pass — acyclic; (3) DAG structure lets PyTorch/JAX trace the computation graph; (4) topological sort of the DAG gives the order to apply chain rule in backprop.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q2-4', title: 'Quiz 2.4 — Sorting & Recursion',
      type: 'lesson', moduleId: 'm2', passMark: 70,
      questions: [
        {
          id: 'q2-4-1', type: 'multiple_choice',
          question: "What is merge sort's guaranteed time complexity?",
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          correctAnswer: 'O(n log n)',
          gradingRubric: 'Award full marks for O(n log n). Merge sort always splits in half and merges — guaranteed in all cases.',
          xpValue: 10,
        },
        {
          id: 'q2-4-2', type: 'short_answer',
          question: 'What are the two required components of every correct recursive function? What happens when a base case is missing?',
          gradingRubric: 'Award marks for: (1) base case — terminates the recursion; (2) recursive case — calls itself on a smaller input; (3) missing base case → infinite recursion → call stack overflow.',
          xpValue: 15,
        },
        {
          id: 'q2-4-3', type: 'multiple_choice',
          question: "Quicksort's worst case is O(n²). Under what condition does this occur?",
          options: [
            'When the array is randomly shuffled',
            'When the array is already sorted and the first element is always chosen as pivot',
            'When the array contains only unique elements',
            'When n is a power of 2',
          ],
          correctAnswer: 'When the array is already sorted and the first element is always chosen as pivot',
          gradingRubric: 'Award full marks for the second option. Sorted input + first-element pivot → one partition always empty → O(n) levels of recursion instead of O(log n).',
          xpValue: 10,
        },
        {
          id: 'q2-4-4', type: 'short_answer',
          question: 'What is dynamic programming, and how does beam search in LLM text generation use a similar principle?',
          gradingRubric: 'Award marks for: (1) DP solves overlapping sub-problems by caching results (memoisation); (2) beam search maintains top-k partial sequences at each step; (3) previously computed token probabilities are reused rather than recomputed; (4) bonus for noting beam search explores O(k × vocab_size) paths per step vs exponential brute force.',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p2', moduleId: 'm2',
    name: 'Algorithm Visualiser', emoji: '📊',
    description: 'Build an interactive web app that animates bubble sort, merge sort, and quicksort on a bar chart. Show each step with highlighted comparisons and swaps, and display real-time operation counts.',
    tools: ['html', 'css', 'javascript', 'claude-code'],
    status: 'not_started',
    rubric: [
      'Animates all three sorts (bubble, merge, quicksort) with step-by-step visualisation',
      'Highlights elements being compared and swapped in different colours',
      'Displays a live operation counter that increments with each comparison',
      'Allows user to control animation speed (at least 3 speeds)',
      'Shows the final operation count for each algorithm on the same input',
      'Generates random arrays of configurable size (10–100 elements)',
      'Correctly implements all three algorithms (produces sorted output)',
      'README explains Big-O complexity of each algorithm with evidence from the visualiser',
    ],
    xpReward: 100,
  },
}

// ─── MODULE 3 ─────────────────────────────────────────────────────────────────
const m3: Module = {
  id: 'm3', number: 3, arc: 1,
  title: 'Networking: From Packets to APIs',
  description: 'How data moves across the internet — from the OSI model through TCP/DNS/HTTP to the REST APIs and streaming connections you use daily with the Anthropic SDK.',
  prerequisiteModuleId: 'm2',
  lessons: [
    {
      id: '3-1', number: '3.1',
      title: 'The OSI Model and How Networks Work',
      duration: 11,
      content: `# The OSI Model and How Networks Work

Every time Claude responds to a message, data traverses a complex stack of protocols. The **OSI model** (Open Systems Interconnection) provides a seven-layer framework for understanding this journey — each layer handling a specific concern, each hiding its complexity from the layers above and below.

## The Seven Layers

Working from the physical medium up to your application:

| Layer | Name | What it Does | Protocols |
|-------|------|-------------|-----------|
| 7 | Application | User-facing communication | HTTP, HTTPS, WebSocket |
| 6 | Presentation | Encryption, encoding, compression | TLS/SSL, JPEG, gzip |
| 5 | Session | Connection lifecycle management | NetBIOS, RPC |
| 4 | Transport | End-to-end delivery, port addressing | TCP, UDP |
| 3 | Network | Routing across networks | IP, ICMP |
| 2 | Data Link | Node-to-node transfer on same segment | Ethernet, Wi-Fi |
| 1 | Physical | Electrical/optical/radio signals | Cables, fibre, radio |

## Encapsulation and Decapsulation

When your app sends data, each layer **wraps** (encapsulates) it with its own header as data travels *down* the stack. The receiving machine **unwraps** (decapsulates) in reverse as data travels *up*. Think of it as nested envelopes — Layer 7 data is the letter; Layer 4 adds an envelope with port numbers; Layer 3 adds an outer envelope with IP addresses; Layer 2 adds routing info for the local segment.

## IP Addresses vs MAC Addresses

Every device has two addresses that serve different scopes:

**IP address (Layer 3):** Logical, software-assigned address. IPv4 uses 32 bits (e.g., \`192.168.1.42\`); IPv6 uses 128 bits. Used for routing *between* networks.

**MAC address (Layer 2):** Hardware address burned into the network interface (e.g., \`00:1A:2B:3C:4D:5E\`). Used for delivery *within* a local network segment. When your packet reaches a router, the router strips the Layer 2 frame (rewriting MAC addresses for the next hop) while preserving the Layer 3 IP packet inside.

## How a Packet Travels to api.anthropic.com

1. **DNS** resolves \`api.anthropic.com\` to an IP address
2. OS creates a **TCP segment** (Layer 4) with source/destination ports
3. Wrapped in an **IP packet** (Layer 3) with source/destination IPs
4. Wrapped in an **Ethernet frame** (Layer 2) addressed to your router's MAC
5. Transmitted as **electrical signals** (Layer 1) over your NIC

Each router along the internet path operates at Layer 3: reads the destination IP, consults its routing table, strips and rewrites the Layer 2 frame for the next hop, and forwards.

## Why This Matters for Debugging AI APIs

Understanding the OSI model helps you interpret errors correctly:
- **DNS failure** (Layer 3/4): \`ENOTFOUND api.anthropic.com\` — name can't resolve
- **TCP timeout** (Layer 4): connection refused or firewall blocking port 443
- **TLS error** (Layer 6): certificate invalid or expired
- **HTTP 429** (Layer 7): application-level rate limiting

Corporate proxies, VPNs, and firewalls operate at different layers — knowing which layer they intercept helps you configure them correctly for LLM API access.`,
      keyTerms: [
        { term: 'OSI Model', definition: 'A seven-layer conceptual framework describing how data travels across a network, from physical signals to application protocols.' },
        { term: 'Encapsulation', definition: 'Adding a protocol header at each OSI layer as data travels down the stack for transmission.' },
        { term: 'IP Address', definition: 'A logical Layer 3 address (IPv4: 32-bit, IPv6: 128-bit) used for routing packets between networks.' },
        { term: 'MAC Address', definition: 'A hardware Layer 2 address burned into a network interface, used for delivery within a local network segment.' },
        { term: 'TCP', definition: 'Transmission Control Protocol — Layer 4 protocol providing reliable, ordered, connection-oriented data delivery.' },
        { term: 'UDP', definition: 'User Datagram Protocol — Layer 4 protocol providing fast, connectionless delivery without guaranteed ordering or delivery.' },
        { term: 'TLS', definition: 'Transport Layer Security — Layer 6 protocol providing encryption, integrity, and authentication for network connections.' },
        { term: 'Router', definition: 'A network device that operates at Layer 3, forwarding IP packets between networks based on routing tables.' },
      ],
    },
    {
      id: '3-2', number: '3.2',
      title: 'TCP, DNS and HTTP',
      duration: 12,
      content: `# TCP, DNS and HTTP

Three protocols power virtually every web request: **DNS** resolves hostnames, **TCP** delivers data reliably, and **HTTP** structures the conversation between client and server. Together they form the foundation you build on when calling the Anthropic API.

## DNS: The Internet's Directory

The **Domain Name System** translates hostnames (e.g., \`api.anthropic.com\`) to IP addresses (e.g., \`99.80.142.58\`). Without DNS, you would need to memorise IPs for every service.

**Resolution process:**
1. Browser checks its local DNS cache (entries have a TTL, often 300s)
2. Queries your OS resolver (checks \`/etc/hosts\` or Windows hosts file)
3. Queries your ISP's or organisation's recursive resolver
4. Resolver walks the DNS hierarchy: **root nameservers** → **\`.com\` TLD nameservers** → **Anthropic's authoritative nameservers**
5. Returns the A/AAAA record; browser caches it

**CDNs** use DNS geographically: Cloudflare's authoritative nameserver returns different IPs based on your location, directing you to the nearest point of presence.

## TCP: Reliable Delivery

**TCP** provides ordered, reliable, error-checked delivery over the unreliable IP layer.

**Three-way handshake** to open a connection:
1. Client → Server: **SYN** (I want to connect; here's my sequence number)
2. Server → Client: **SYN-ACK** (Acknowledged; here's mine)
3. Client → Server: **ACK** (Connection open)

This adds one round-trip time (RTT) of latency *before the first byte of data*. A London → Sydney request (RTT ~280ms) wastes 280ms on the handshake alone before the TLS handshake even begins.

**TCP guarantees:** ordered delivery (segments reassembled in order), retransmission of lost packets, flow control (receiver advertises how much data it can accept), congestion control (backs off when the network is saturated).

**UDP** skips all guarantees — connectionless, no handshake, no retransmission. Ideal for DNS queries (tiny, can retry), video calls (a dropped frame is better than a late one), and online gaming.

## HTTP: The Web's Language

**HTTP** defines request-response structure. A request has a method, URL, headers, and optional body. A response has a status code, headers, and body.

**HTTP/1.1:** One outstanding request per TCP connection (pipelining was flawed). Multiple connections opened in parallel to work around this.

**HTTP/2:** Multiplexes multiple requests over one TCP connection simultaneously using binary framing — eliminates the parallel connection hack.

**HTTP/3:** Replaces TCP with **QUIC** (a UDP-based transport with built-in TLS and stream multiplexing). Eliminates TCP's head-of-line blocking: one lost packet no longer stalls all streams.

**HTTPS = HTTP + TLS.** TLS adds a handshake (1 additional RTT minimum) to negotiate encryption keys, verify server certificates, and derive session keys. Once established, all HTTP data is encrypted. **Never send API keys over plain HTTP** — they appear in plaintext, in server logs, and in proxy caches.`,
      keyTerms: [
        { term: 'DNS', definition: 'Domain Name System — translates hostnames (api.anthropic.com) to IP addresses via a hierarchy of nameservers.' },
        { term: 'Three-Way Handshake', definition: 'TCP connection setup: SYN → SYN-ACK → ACK. Establishes reliable session but adds one RTT of latency.' },
        { term: 'Round Trip Time (RTT)', definition: 'The time for a packet to travel from sender to receiver and back. Determines minimum latency for any protocol handshake.' },
        { term: 'HTTP/2', definition: 'HTTP version supporting request multiplexing over one TCP connection, binary framing, and header compression.' },
        { term: 'QUIC', definition: 'UDP-based transport protocol underlying HTTP/3, providing built-in TLS and multiplexed streams without TCP\'s head-of-line blocking.' },
        { term: 'HTTPS', definition: 'HTTP over TLS — encrypts all request/response data, authenticates the server, and ensures message integrity.' },
        { term: 'TTL', definition: 'Time To Live — in DNS, how long a record can be cached before re-querying. In IP packets, the hop count limit before discarding.' },
        { term: 'CDN', definition: 'Content Delivery Network — uses geographically distributed servers and DNS-based routing to serve users from nearby locations.' },
      ],
    },
    {
      id: '3-3', number: '3.3',
      title: 'REST APIs: Design and Usage',
      duration: 10,
      content: `# REST APIs: Design and Usage

A **REST API** (Representational State Transfer) is the dominant pattern for web services — including the Anthropic API. Understanding REST lets you debug calls, handle errors correctly, and design your own APIs for AI-powered applications.

## REST Principles

REST is an architectural *style*, not a protocol. Key constraints:

- **Stateless:** Each request contains all information the server needs — no session state on the server side. This enables horizontal scaling (any server can handle any request).
- **Uniform interface:** Resources identified by URLs; manipulated via standard HTTP verbs.
- **Client-server separation:** Frontend and backend evolve independently.
- **Cacheable:** Responses declare whether they can be cached, enabling CDN and browser caching.

## HTTP Methods

| Method | Purpose | Idempotent | Body |
|--------|---------|-----------|------|
| GET | Retrieve a resource | ✅ | No |
| POST | Create a resource | ❌ | Yes |
| PUT | Replace a resource entirely | ✅ | Yes |
| PATCH | Partially update a resource | ✅ | Yes |
| DELETE | Remove a resource | ✅ | No |

**Idempotent** means calling the endpoint multiple times has the same effect as calling it once. GET, PUT, DELETE are idempotent; POST is not — each POST to \`/messages\` sends a new message.

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 OK | Success | Process response |
| 201 Created | Resource created | Use the new resource |
| 400 Bad Request | Invalid input | Fix your request |
| 401 Unauthorized | Missing/invalid auth | Check API key |
| 403 Forbidden | Insufficient permission | Check account tier |
| 404 Not Found | Resource doesn't exist | Check URL/ID |
| 429 Too Many Requests | Rate limited | Back off and retry |
| 500 Internal Server Error | Server-side failure | Retry with backoff |
| 529 Overloaded | Server overloaded | Retry with backoff |

**Rate limiting** for AI APIs involves both **RPM** (requests per minute) and **TPM** (tokens per minute). Headers like \`x-ratelimit-remaining-requests\` show your remaining quota. Never retry 429s immediately — use **exponential backoff with jitter**: wait 1s, then 2s, then 4s (plus random jitter to prevent thundering herd).

## Authentication

Most APIs use Bearer tokens in the \`Authorization\` header:

\`\`\`http
POST /v1/messages HTTP/2
Authorization: Bearer sk-ant-api03-...
Content-Type: application/json
\`\`\`

The Anthropic SDK also accepts \`x-api-key\`. **Never** embed API keys in URLs (they appear in server logs) or commit them to version control (use environment variables or secret managers).

## Pagination and Rate Limits

Large collections use **cursor-based pagination** — the API returns a page plus a cursor for the next. Always handle pagination; never assume all results fit in one response. In production AI systems, log every API call's token usage to forecast costs and detect runaway prompts.`,
      keyTerms: [
        { term: 'REST', definition: 'Representational State Transfer — an architectural style for stateless, resource-oriented web APIs using standard HTTP methods.' },
        { term: 'Stateless', definition: 'Each API request contains all information the server needs; no session state is stored server-side. Enables horizontal scaling.' },
        { term: 'Idempotent', definition: 'An operation that can be called multiple times with the same result. GET, PUT, DELETE are idempotent; POST is not.' },
        { term: 'HTTP Status Code', definition: 'A 3-digit code in every HTTP response indicating success (2xx), client error (4xx), or server error (5xx).' },
        { term: 'Rate Limiting', definition: 'Restrictions on requests per minute (RPM) or tokens per minute (TPM) to protect API services from overload.' },
        { term: 'Exponential Backoff', definition: 'A retry strategy that doubles the wait time between attempts, preventing thundering herd problems when APIs are overloaded.' },
        { term: 'Bearer Token', definition: 'An API authentication method where the token is sent in the Authorization header: "Bearer <token>".' },
        { term: 'Pagination', definition: 'Splitting large API responses into pages with cursors or offsets to avoid returning too much data in a single response.' },
      ],
    },
    {
      id: '3-4', number: '3.4',
      title: 'WebSockets and Streaming',
      duration: 10,
      content: `# WebSockets and Streaming

Token-by-token AI responses, live dashboards, and collaborative editors all need the server to push data to clients continuously — not wait for a new request. Two technologies handle this: **Server-Sent Events** (one-way) and **WebSockets** (bidirectional).

## Server-Sent Events (SSE)

**SSE** is a one-way, server-to-client channel over a standard HTTP connection. Simple, HTTP/2-native, and with built-in reconnection.

The server sends newline-delimited text events:

\`\`\`
event: content_block_delta
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}

event: content_block_delta
data: {"type":"content_block_delta","delta":{"type":"text_delta","text":", world"}}

event: message_stop
data: {"type":"message_stop"}
\`\`\`

**This is exactly the Anthropic streaming API.** When you call \`client.messages.stream({ ... })\`, the SDK opens an SSE connection. Each \`content_block_delta\` event contains one or more tokens. \`message_stop\` signals completion.

\`\`\`typescript
const stream = await client.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Explain tensors' }],
})
for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
    process.stdout.write(chunk.delta.text)
  }
}
\`\`\`

The progressive appearance of tokens in Claude's UI is SSE events being rendered in real time.

## WebSockets

**WebSockets** establish a persistent, **full-duplex** connection — either side can send messages at any time, with very low overhead per message after the initial upgrade.

Connection opens with an HTTP upgrade:
\`\`\`http
GET /chat HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
\`\`\`

After the server responds with \`101 Switching Protocols\`, the connection becomes a persistent binary-framed WebSocket. Use cases: collaborative editing, multiplayer games, financial tickers, voice streaming.

## SSE vs WebSockets

| | SSE | WebSockets |
|--|-----|-----------|
| Direction | Server → Client only | Full duplex |
| Protocol | HTTP/HTTPS | ws:// wss:// |
| Auto-reconnect | Built-in | Manual |
| HTTP/2 | Native | Separate connection |
| Overhead | Low | Very low |

**For AI applications:** SSE is almost always the right choice for streaming model responses. Choose WebSockets when the client also needs to push high-frequency data simultaneously (e.g., real-time voice input + voice output streaming).

## Chunked Transfer Encoding

Under the hood, HTTP streaming uses **chunked transfer encoding** — data is sent in size-prefixed chunks without specifying total \`Content-Length\` upfront. Each chunk is preceded by its byte size in hex, followed by \`\\r\\n\`.

This enables the server to begin streaming output before knowing the total response length — which is exactly the situation in autoregressive LLM generation, where each token is only known after the previous one is produced.`,
      keyTerms: [
        { term: 'Server-Sent Events (SSE)', definition: 'A one-way HTTP channel for server-to-client streaming, using newline-delimited text events. Used by the Anthropic streaming API.' },
        { term: 'WebSocket', definition: 'A full-duplex persistent connection initiated via HTTP upgrade, enabling both client and server to send messages at any time.' },
        { term: 'Streaming API', definition: 'An API that returns data incrementally as it is generated, rather than waiting for the complete response. Reduces time-to-first-token.' },
        { term: 'Chunked Transfer Encoding', definition: 'An HTTP feature for streaming data in variable-size chunks without knowing the total response length upfront.' },
        { term: 'content_block_delta', definition: 'The Anthropic streaming API event type that carries each partial text token as it is generated by the model.' },
        { term: 'Full-duplex', definition: 'A communication channel where both parties can send and receive simultaneously, as opposed to half-duplex (one at a time).' },
        { term: 'Time-to-First-Token', definition: 'The latency from sending a request to receiving the first token of the response — a key UX metric for streaming AI applications.' },
        { term: 'HTTP Upgrade', definition: 'An HTTP mechanism where the client requests switching to a different protocol (e.g., WebSocket) on the same TCP connection.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q3-1', title: 'Quiz 3.1 — OSI Model',
      type: 'lesson', moduleId: 'm3', passMark: 70,
      questions: [
        {
          id: 'q3-1-1', type: 'multiple_choice',
          question: 'At which OSI layer does TLS/SSL encryption operate?',
          options: ['Layer 7 — Application', 'Layer 6 — Presentation', 'Layer 4 — Transport', 'Layer 3 — Network'],
          correctAnswer: 'Layer 6 — Presentation',
          gradingRubric: 'Award full marks for Layer 6 — Presentation. TLS handles encryption, decryption, and certificate authentication at the Presentation layer.',
          xpValue: 10,
        },
        {
          id: 'q3-1-2', type: 'short_answer',
          question: 'What is the difference between an IP address and a MAC address? At which OSI layer does each operate, and when is each used?',
          gradingRubric: 'Award marks for: (1) IP = Layer 3, logical/software-assigned, used for routing between networks; (2) MAC = Layer 2, hardware-burned, used for delivery within a local segment; (3) routers rewrite MAC addresses at each hop while preserving the IP packet.',
          xpValue: 15,
        },
        {
          id: 'q3-1-3', type: 'multiple_choice',
          question: 'What is encapsulation in the context of network protocols?',
          options: [
            'Encrypting data for security',
            'Wrapping data with protocol headers at each OSI layer as it travels down the stack',
            'Compressing data to reduce packet size',
            'Converting data to binary format for transmission',
          ],
          correctAnswer: 'Wrapping data with protocol headers at each OSI layer as it travels down the stack',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q3-1-4', type: 'short_answer',
          question: 'An API call to api.anthropic.com times out with "ECONNREFUSED". At which OSI layer does this error originate, and what are two possible causes?',
          gradingRubric: 'Award marks for: (1) Layer 4 (Transport) — TCP connection refused; (2) causes: a firewall blocking port 443, the server not listening on that port, wrong IP address resolved by DNS, corporate proxy blocking outbound connections.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q3-2', title: 'Quiz 3.2 — TCP, DNS & HTTP',
      type: 'lesson', moduleId: 'm3', passMark: 70,
      questions: [
        {
          id: 'q3-2-1', type: 'multiple_choice',
          question: 'What does the TCP three-way handshake accomplish?',
          options: [
            'Encrypts the connection using TLS',
            'Establishes a reliable connection by synchronising sequence numbers between client and server',
            'Resolves the domain name to an IP address',
            'Authenticates the server\'s SSL certificate',
          ],
          correctAnswer: 'Establishes a reliable connection by synchronising sequence numbers between client and server',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q3-2-2', type: 'short_answer',
          question: 'HTTP/3 uses QUIC (UDP-based) instead of TCP. What specific problem does this solve, and why does it matter for API performance?',
          gradingRubric: 'Award marks for: (1) TCP head-of-line blocking — one lost packet stalls all streams; (2) QUIC provides independent streams, so one lost packet only delays that stream; (3) especially valuable on lossy mobile networks; (4) bonus: QUIC also has built-in TLS 1.3 reducing handshake RTTs.',
          xpValue: 15,
        },
        {
          id: 'q3-2-3', type: 'multiple_choice',
          question: 'HTTP/2 introduced multiplexing. What does this mean?',
          options: [
            'Running the same server on multiple machines simultaneously',
            'Multiple HTTP requests can share a single TCP connection simultaneously',
            'Encrypting multiple data streams in parallel',
            'Load balancing requests across server clusters',
          ],
          correctAnswer: 'Multiple HTTP requests can share a single TCP connection simultaneously',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q3-2-4', type: 'short_answer',
          question: 'Why does the Anthropic API require HTTPS? What specific security properties does TLS provide, and what happens if you use plain HTTP?',
          gradingRubric: 'Award marks for: (1) encryption — API key and request body are encrypted in transit; (2) integrity — ensures data is not tampered with; (3) authentication — verifies you are talking to the real Anthropic server; (4) plain HTTP exposes API key in plaintext to any network observer, proxy, or ISP.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q3-3', title: 'Quiz 3.3 — REST APIs',
      type: 'lesson', moduleId: 'm3', passMark: 70,
      questions: [
        {
          id: 'q3-3-1', type: 'multiple_choice',
          question: 'You receive HTTP 429 from the Anthropic API. What is the correct response?',
          options: [
            'Immediately retry the request',
            'Retry after an exponential backoff delay with random jitter',
            'Switch to a different API key',
            'Reduce your max_tokens parameter',
          ],
          correctAnswer: 'Retry after an exponential backoff delay with random jitter',
          gradingRubric: 'Award full marks for exponential backoff with jitter. Immediate retry worsens the overload; jitter prevents thundering herd when many clients retry simultaneously.',
          xpValue: 10,
        },
        {
          id: 'q3-3-2', type: 'short_answer',
          question: 'What does "stateless" mean in REST, and why is this property valuable for scaling AI API backends?',
          gradingRubric: 'Award marks for: (1) each request contains all information the server needs — no stored session state; (2) enables horizontal scaling — any server instance can handle any request; (3) simplifies load balancing; (4) failures are isolated — losing a server loses no state.',
          xpValue: 15,
        },
        {
          id: 'q3-3-3', type: 'multiple_choice',
          question: 'Where should an Anthropic API key be placed in an HTTP request?',
          options: [
            'As a URL query parameter: ?api_key=sk-ant-...',
            'In the Authorization or x-api-key header',
            'In the JSON request body',
            'In a browser cookie',
          ],
          correctAnswer: 'In the Authorization or x-api-key header',
          gradingRubric: 'Award full marks for the Authorization/x-api-key header. URL query params appear in server logs and browser history; cookies are browser-only and CSRF-vulnerable.',
          xpValue: 10,
        },
        {
          id: 'q3-3-4', type: 'short_answer',
          question: 'Explain the difference between idempotent and non-idempotent HTTP methods. Why does it matter for building reliable AI applications with retry logic?',
          gradingRubric: 'Award marks for: (1) idempotent = same result whether called once or many times; (2) GET/PUT/DELETE are idempotent; POST is not; (3) in retry logic, retrying a POST to /messages could send duplicate messages/charges; (4) safe to auto-retry idempotent calls; POST retries need deduplication keys.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q3-4', title: 'Quiz 3.4 — Streaming & WebSockets',
      type: 'lesson', moduleId: 'm3', passMark: 70,
      questions: [
        {
          id: 'q3-4-1', type: 'multiple_choice',
          question: 'When you call client.messages.stream() with the Anthropic SDK, which underlying protocol delivers the tokens?',
          options: ['WebSocket', 'Server-Sent Events (SSE)', 'Long polling', 'HTTP/2 push'],
          correctAnswer: 'Server-Sent Events (SSE)',
          gradingRubric: 'Award full marks for SSE. The Anthropic API uses SSE (content_block_delta events) for streaming.',
          xpValue: 10,
        },
        {
          id: 'q3-4-2', type: 'short_answer',
          question: 'Compare SSE and WebSockets: what are the key differences, and for which AI application scenarios would you choose each?',
          gradingRubric: 'Award marks for: SSE = server→client only, HTTP-native, auto-reconnect; WebSocket = full-duplex, persistent, lower per-message overhead. SSE: streaming LLM responses, live dashboards. WebSocket: real-time voice input+output, multiplayer AI games, collaborative editing where client pushes changes.',
          xpValue: 15,
        },
        {
          id: 'q3-4-3', type: 'multiple_choice',
          question: 'Why does autoregressive text generation naturally align with chunked transfer encoding?',
          options: [
            'Both process data in fixed-size blocks',
            'Both start sending output before knowing the total size — tokens arrive one at a time',
            'Both require a persistent connection',
            'Both compress data before transmission',
          ],
          correctAnswer: 'Both start sending output before knowing the total size — tokens arrive one at a time',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q3-4-4', type: 'practical',
          question: 'Write TypeScript pseudocode that streams a response from the Anthropic API and accumulates the full text, printing each token as it arrives and the total token count at the end.',
          gradingRubric: 'Award marks for: (1) using client.messages.stream() or equivalent; (2) iterating over stream events with for-await-of; (3) checking chunk.type === "content_block_delta"; (4) accumulating text in a string; (5) printing or logging token count (usage.output_tokens) from final event or stream.finalMessage().',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p3', moduleId: 'm3',
    name: 'API Inspector', emoji: '🔍',
    description: 'Build a web app that lets you construct and send Anthropic API requests, inspect the raw HTTP request/response headers and body, visualise streaming token arrival in real time, and display token usage and cost estimation.',
    tools: ['typescript', 'vite', 'anthropic-sdk', 'claude-code'],
    status: 'not_started',
    rubric: [
      'Sends requests to the Anthropic Messages API with configurable model, max_tokens, and system prompt',
      'Displays raw response headers including x-ratelimit-* headers',
      'Shows streaming tokens appearing in real time with per-token timing',
      'Displays total input/output tokens from usage object',
      'Calculates and displays estimated cost based on current pricing',
      'Handles and displays error responses (401, 429, 500) with human-readable explanations',
      'Includes a retry-with-backoff demonstration for 429 responses',
    ],
    xpReward: 100,
  },
}

// ─── MODULE 4 ─────────────────────────────────────────────────────────────────
const m4: Module = {
  id: 'm4', number: 4, arc: 1,
  title: 'Linear Algebra for Machine Learning',
  description: 'Vectors, matrices, eigenvalues, and tensors — the mathematical backbone of every neural network operation from a simple linear layer to multi-head attention.',
  prerequisiteModuleId: 'm3',
  lessons: [
    {
      id: '4-1', number: '4.1',
      title: 'Vectors and Vector Spaces',
      duration: 11,
      content: `# Vectors and Vector Spaces

A **vector** is an ordered list of numbers. Simple to define, vast in application: word embeddings, attention queries, model weights, and every intermediate activation in a transformer are vectors. Linear algebra is the language of machine learning.

## What Is a Vector?

Formally, a vector is an element of a **vector space** — a set closed under addition and scalar multiplication. Practically: a list of floating-point numbers.

\`\`\`
embedding = [0.23, -0.81, 0.54, 0.12, ..., 0.07]  # 1536 dimensions
\`\`\`

In ML, vectors represent **features** — numerical encodings of data. Every token, every image patch, and every audio frame is ultimately represented as a vector before a model processes it.

## Core Vector Operations

**Addition:** Add element-wise. \`[1, 2] + [3, 4] = [4, 6]\`. Geometrically: place vectors head-to-tail.

**Scalar multiplication:** Multiply every element by a constant. \`3 × [1, 2] = [3, 6]\`. Scales the magnitude without changing direction.

**Dot product:** Multiply element-wise and sum. \`[1, 2] · [3, 4] = 1×3 + 2×4 = 11\`.

Geometrically, the dot product equals \`|a| × |b| × cos(θ)\` where θ is the angle between vectors. When θ = 90°, cos(θ) = 0, so orthogonal vectors have dot product 0 — they share no common direction.

## Cosine Similarity

Normalise the dot product by both vectors' magnitudes:

\`\`\`
cosine_similarity(a, b) = (a · b) / (||a|| × ||b||)
\`\`\`

Result ranges from -1 (opposite directions) to 0 (perpendicular) to 1 (identical direction).

**This is the core operation in semantic search.** When you query a vector database — "find documents similar to this question" — you're computing cosine similarity between your query embedding and every stored document embedding, returning the highest scores.

Claude's embedding model encodes meaning geometrically: "The ocean expedition discovered ancient amphorae" and "Maritime archaeologists found clay pots on the seabed" will have cosine similarity close to 1, because they describe the same concept.

## Unit Vectors and Normalisation

A **unit vector** has magnitude (L2 norm) = 1. Normalise by dividing by the magnitude:

\`\`\`
||v|| = sqrt(v[0]² + v[1]² + ... + v[n]²)
unit_v = v / ||v||
\`\`\`

Most embedding models return unit vectors by default, so cosine similarity simplifies to just the dot product — a single multiply-accumulate pass with no division.

## Vector Spaces in Transformers

In a transformer, every token position in the sequence is represented as a vector in a **d-dimensional vector space** (d is the model's hidden size — 768 for BERT, 12,288 for GPT-4 class models). Attention is the mechanism by which token vectors **communicate** — updating each other based on relevance. The attention mechanism is fundamentally a weighted sum of value vectors, where weights are determined by the dot product similarity between query and key vectors.`,
      keyTerms: [
        { term: 'Vector', definition: 'An ordered list of numbers representing a point or direction in a multi-dimensional space.' },
        { term: 'Dot Product', definition: 'Sum of element-wise products of two vectors: a·b = Σ(aᵢ × bᵢ). Geometrically equals |a||b|cos(θ).' },
        { term: 'Cosine Similarity', definition: 'The dot product of two normalised vectors, measuring the cosine of the angle between them. Ranges from -1 to 1.' },
        { term: 'L2 Norm', definition: 'The Euclidean length (magnitude) of a vector: ||v|| = sqrt(Σvᵢ²). Used for normalisation.' },
        { term: 'Unit Vector', definition: 'A vector with L2 norm = 1, obtained by dividing a vector by its magnitude.' },
        { term: 'Embedding', definition: 'A dense vector representation of discrete data (text, images, etc.) learned so that semantic similarity maps to geometric proximity.' },
        { term: 'Vector Space', definition: 'A mathematical set of vectors that is closed under addition and scalar multiplication, defining a consistent coordinate system.' },
        { term: 'Hidden Size (d_model)', definition: 'The dimensionality of the vector space in a transformer — the size of every token\'s representation. Ranges from 768 (small) to 14,336+ (frontier models).' },
      ],
    },
    {
      id: '4-2', number: '4.2',
      title: 'Matrices and Matrix Operations',
      duration: 12,
      content: `# Matrices and Matrix Operations

A **matrix** is a 2D array of numbers. Matrix multiplication is the single most important computational operation in deep learning: every linear layer, every attention score, and every weight update is a matrix multiply.

## Matrix Basics

An **m×n matrix** has m rows and n columns:

\`\`\`
W = [[0.1, -0.3, 0.7],    # shape: (2, 3)
     [0.5,  0.2, -0.4]]
\`\`\`

In ML, matrices have concrete meanings:
- **Weight matrix** W of shape (d_in, d_out): projects d_in-dimensional inputs to d_out-dimensional outputs
- **Attention score matrix** of shape (seq_len, seq_len): every pair of token attention weights
- **Batch of embeddings** of shape (batch_size, hidden_dim): multiple sequences processed together

## Matrix Multiplication

To multiply A (m×n) by B (n×p): **inner dimensions must match**. Result is (m×p).

\`\`\`
C[i][j] = Σₖ A[i][k] × B[k][j]
\`\`\`

Each element of C is the dot product of row i of A with column j of B.

**Concrete transformer example:** A linear (fully connected) layer computes \`y = x @ W + b\`.

\`\`\`
x shape:  (32, 512)     # batch_size=32, input_dim=512
W shape:  (512, 2048)   # input_dim × output_dim
b shape:  (2048,)       # bias vector
y shape:  (32, 2048)    # batch_size × output_dim
\`\`\`

This single matrix multiply transforms 32 sequences from 512 to 2048 dimensions simultaneously — GPU-parallelised to run in microseconds.

## Transpose

The **transpose** of A (m×n) is Aᵀ (n×m): flip rows and columns. \`Aᵀ[i][j] = A[j][i]\`.

In attention: \`scores = Q @ Kᵀ\` computes the compatibility between every query-key pair. If Q has shape (batch, seq, d_k) and K has shape (batch, seq, d_k), then \`Kᵀ\` has shape (batch, d_k, seq), and scores has shape (batch, seq, seq) — the full attention matrix.

## Why Matrix Multiply Powers Everything

A neural network forward pass is a **chain of matrix multiplications**. A large transformer with 96 layers, 12,288 hidden dimensions, and 96 attention heads performs thousands of matrix multiplies per forward pass.

This is why:
1. **GPUs with tensor cores** fuse multiply-add operations in 4×4 or 8×8 matrix tiles — matching the hardware to the computation
2. **BLAS libraries** (cuBLAS on NVIDIA, MKL on Intel) are the bedrock of every ML framework
3. **Flash Attention** avoids materialising the full n×n attention matrix by tiling computation
4. **LoRA** (Low-Rank Adaptation) approximates a large weight update ΔW as \`A @ B\` where A:(d, r) and B:(r, d), with r << d — turning one big matrix multiply into two smaller ones`,
      keyTerms: [
        { term: 'Matrix', definition: 'A 2D array of numbers with m rows and n columns, written as an (m×n) matrix.' },
        { term: 'Matrix Multiplication', definition: 'Operation combining A (m×n) and B (n×p) to produce C (m×p), where each C[i][j] is the dot product of row i of A with column j of B.' },
        { term: 'Transpose', definition: 'Flipping a matrix so rows become columns. An (m×n) matrix transposed becomes (n×m).' },
        { term: 'Weight Matrix', definition: 'A learned matrix that transforms input vectors from one dimension to another in a neural network linear layer.' },
        { term: 'Tensor Core', definition: 'Specialised GPU hardware unit that performs 4×4 or 8×8 matrix multiply-accumulate in a single clock cycle, massively accelerating deep learning.' },
        { term: 'BLAS', definition: 'Basic Linear Algebra Subprograms — a library specification for common matrix operations. Implemented by cuBLAS (GPU) and MKL (CPU).' },
        { term: 'LoRA', definition: 'Low-Rank Adaptation — fine-tuning technique that adds a low-rank update A@B (with rank r << d) to frozen weight matrices, dramatically reducing trainable parameters.' },
        { term: 'Attention Score Matrix', definition: 'The (seq_len × seq_len) matrix of dot products Q@Kᵀ in self-attention, representing how much each token attends to every other token.' },
      ],
    },
    {
      id: '4-3', number: '4.3',
      title: 'Eigenvalues, Eigenvectors and PCA',
      duration: 11,
      content: `# Eigenvalues, Eigenvectors and PCA

An **eigenvector** of a matrix A is a special vector v that, when multiplied by A, only *scales* — it doesn't rotate. The scaling factor is the **eigenvalue** λ:

\`\`\`
A · v = λ · v
\`\`\`

This seemingly abstract equation underlies dimensionality reduction, understanding attention behaviour, and the mathematical motivation for efficient fine-tuning techniques like LoRA.

## Geometric Intuition

Think of a matrix A as a linear transformation — it rotates and stretches vectors in space. Most vectors both rotate *and* stretch when multiplied by A. **Eigenvectors are exceptional:** they only stretch (if λ > 1), shrink (if λ < 1), flip (if λ < 0), or stay put (if λ = 1). They point along the "natural axes" of the transformation.

**Example:** A matrix that doubles x-coordinates and triples y-coordinates has eigenvectors [1,0] and [0,1] with eigenvalues 2 and 3. These vectors don't rotate — they only scale.

## Principal Component Analysis (PCA)

**PCA** finds the directions of maximum variance in data — the eigenvectors of the **covariance matrix**. These directions are the **principal components**.

**Steps:**
1. Centre the data (subtract the mean of each feature)
2. Compute the covariance matrix: C = (1/n) × XᵀX
3. Compute eigenvectors and eigenvalues of C
4. Sort eigenvectors by eigenvalue (largest = most variance)
5. Project data onto top-k eigenvectors → k-dimensional representation

**Application:** Claude's text embeddings live in 1536-dimensional space. To visualise them, PCA projects to 2D while preserving the directions of maximum variance. Semantically similar texts cluster together even in 2D — this is what you'll explore in Module 4's project.

## Eigenvalues in Neural Networks

**Low-rank structure in weight matrices:** Research (Hu et al., 2021 — the LoRA paper) found that the weight matrices of pre-trained LLMs have a small number of large eigenvalues and many near-zero ones. The intrinsic dimensionality of the update needed for fine-tuning is much lower than the full matrix rank.

This is why LoRA works: instead of updating the full W (d×d), you learn W + ΔW where ΔW = A×B with A:(d, r) and B:(r, d), and r=8 or r=16 instead of d=4096. The low-rank decomposition captures the subspace of meaningful updates.

**Gradient matrices** during training also have a heavily skewed eigenvalue spectrum — a few large eigenvalues, many tiny ones. This is why adaptive optimisers like **Adam** (which estimates the second moment of gradients, related to eigenvalue magnitudes) outperform plain SGD.`,
      keyTerms: [
        { term: 'Eigenvector', definition: 'A special vector v of matrix A that only scales when multiplied by A: Av = λv. Points along the "natural axes" of the transformation.' },
        { term: 'Eigenvalue', definition: 'The scalar λ in Av = λv that represents how much an eigenvector is scaled by the matrix transformation.' },
        { term: 'PCA', definition: 'Principal Component Analysis — finds the directions of maximum variance in data by computing eigenvectors of the covariance matrix. Used for dimensionality reduction.' },
        { term: 'Principal Component', definition: 'An eigenvector of the data\'s covariance matrix, representing a direction of maximum variance. First PC captures the most variance.' },
        { term: 'Covariance Matrix', definition: 'A symmetric matrix C = XᵀX/n that captures how features vary together. Its eigenvectors are the principal components.' },
        { term: 'Explained Variance', definition: 'The proportion of total data variance captured by a principal component, equal to its eigenvalue divided by the sum of all eigenvalues.' },
        { term: 'Low-Rank Matrix', definition: 'A matrix whose column space has low dimensionality — most of its eigenvalues are near zero. Weight updates in fine-tuning often have this structure.' },
        { term: 'Adam Optimiser', definition: 'Adaptive Moment Estimation — an optimiser that adjusts learning rates based on first and second moment estimates of gradients, adapting to the curvature of the loss landscape.' },
      ],
    },
    {
      id: '4-4', number: '4.4',
      title: 'Tensors: N-Dimensional Arrays',
      duration: 10,
      content: `# Tensors: N-Dimensional Arrays

A **tensor** is the generalisation of scalars, vectors, and matrices to any number of dimensions. In ML frameworks like PyTorch and JAX, tensors are the fundamental data structure — every input, weight, gradient, and activation is a tensor.

## Tensor Ranks

| Rank | Name | ML Example | Shape |
|------|------|-----------|-------|
| 0 | Scalar | A single loss value | \`()\` |
| 1 | Vector | One token embedding | \`(768,)\` |
| 2 | Matrix | Weight matrix | \`(768, 3072)\` |
| 3 | 3D tensor | Batch of sequences | \`(32, 512, 768)\` |
| 4 | 4D tensor | Batch of images | \`(32, 3, 224, 224)\` |

The canonical transformer shape is **(batch_size, sequence_length, hidden_dim)**. A batch of 16 sequences, 512 tokens, in a 768-dimensional model = a tensor of shape (16, 512, 768) = ~6.3 million float32 values = ~25 MB for a single activation.

## Common Tensor Operations

**Element-wise ops:** Applied independently to each element. ReLU(x), exp(x), x + y (same-shape tensors).

**Reduction:** Collapse one or more dimensions. \`torch.mean(x, dim=-1)\` averages the last dimension, reducing shape (32, 512, 768) → (32, 512).

**Matrix multiply (\`@\`):** Contracts the last two dimensions, broadcasting over batch dims.

\`\`\`python
# Attention: Q @ Kᵀ
# Q: (batch, heads, seq, d_k)
# K: (batch, heads, seq, d_k)
# Kᵀ: (batch, heads, d_k, seq)   [transpose last two dims]
scores = Q @ K.transpose(-2, -1)
# scores: (batch, heads, seq, seq) — full attention matrix
\`\`\`

## Broadcasting

**Broadcasting** allows operations between tensors of different shapes by automatically expanding size-1 dimensions. This eliminates explicit loops:

\`\`\`python
x    = torch.randn(32, 512, 768)  # batch of sequences
bias = torch.zeros(1, 1, 768)    # one bias vector
out  = x + bias                  # broadcasts to (32, 512, 768)
\`\`\`

Broadcasting rules (from the right): dimensions are compatible if they are equal or one of them is 1.

## Autograd and the Computation Graph

PyTorch builds a **computation graph** (DAG) as you perform tensor operations with \`requires_grad=True\`. When you call \`loss.backward()\`, it traverses this DAG in reverse order (topological sort), applying the **chain rule** at each node to compute gradients.

\`\`\`python
loss.backward()
# Now model.weight.grad contains ∂loss/∂weight — a tensor the same shape as weight
optimiser.step()   # updates weight using its .grad tensor
optimiser.zero_grad()  # clears .grad for next batch
\`\`\`

Every parameter tensor's \`.grad\` attribute holds the gradient — a tensor of identical shape containing how much each weight should change to reduce the loss. The entire training loop — forward pass (tensor ops), backward pass (autograd), update (optimiser step) — is a sequence of tensor transformations.`,
      keyTerms: [
        { term: 'Tensor', definition: 'An N-dimensional array generalising scalars (0D), vectors (1D), and matrices (2D) to arbitrary rank. The fundamental data structure in ML frameworks.' },
        { term: 'Rank (tensor)', definition: 'The number of dimensions of a tensor. Rank 0 = scalar, rank 1 = vector, rank 2 = matrix, rank 3+ = higher-order tensor.' },
        { term: 'Shape', definition: 'The tuple of dimension sizes of a tensor, e.g. (32, 512, 768) for a batch of 32 sequences of length 512 with 768-dim embeddings.' },
        { term: 'Broadcasting', definition: 'Automatic expansion of size-1 dimensions to match another tensor\'s shape, enabling element-wise operations without explicit loops.' },
        { term: 'Autograd', definition: 'PyTorch\'s automatic differentiation engine that tracks tensor operations to build a computation graph and compute gradients via backpropagation.' },
        { term: 'Gradient Tensor', definition: 'A tensor stored in param.grad of the same shape as param, containing the partial derivative of the loss with respect to each parameter.' },
        { term: 'Reduction', definition: 'A tensor operation that collapses one or more dimensions by aggregating values (e.g., sum, mean, max) along a specified axis.' },
        { term: 'Computation Graph', definition: 'The DAG of tensor operations built by autograd during the forward pass, traversed in reverse during backward() to compute gradients.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q4-1', title: 'Quiz 4.1 — Vectors',
      type: 'lesson', moduleId: 'm4', passMark: 70,
      questions: [
        {
          id: 'q4-1-1', type: 'multiple_choice',
          question: 'Two text embeddings have cosine similarity of 0.97. What does this indicate?',
          options: [
            'The texts are exactly 97 words apart',
            'The texts are semantically very similar — their embedding vectors point in nearly the same direction',
            'One text is 97% of the length of the other',
            'The dot product of the embeddings is 0.97',
          ],
          correctAnswer: 'The texts are semantically very similar — their embedding vectors point in nearly the same direction',
          gradingRubric: 'Award full marks for the second option. Cosine similarity close to 1 means vectors are nearly parallel — high semantic similarity.',
          xpValue: 10,
        },
        {
          id: 'q4-1-2', type: 'short_answer',
          question: 'Explain how semantic search in a RAG system uses vector operations. Walk through the full pipeline from query text to retrieved documents.',
          gradingRubric: 'Award marks for: (1) query text → embedding model → query vector; (2) all document vectors pre-stored in vector database; (3) compute cosine similarity (or dot product for normalised vectors) between query vector and all stored vectors; (4) return top-k highest-similarity documents.',
          xpValue: 15,
        },
        {
          id: 'q4-1-3', type: 'multiple_choice',
          question: 'What is the dot product of a vector with itself (v · v)?',
          options: ['Always 0', 'Always 1', 'The squared magnitude ||v||²', 'The magnitude ||v||'],
          correctAnswer: 'The squared magnitude ||v||²',
          gradingRubric: 'Award full marks for ||v||². v · v = Σ(vᵢ × vᵢ) = Σvᵢ² = ||v||².',
          xpValue: 10,
        },
        {
          id: 'q4-1-4', type: 'short_answer',
          question: 'Why do embedding models typically return normalised (unit) vectors? What mathematical and computational advantage does this provide?',
          gradingRubric: 'Award marks for: (1) normalised vectors have magnitude 1; (2) cosine similarity = (a·b)/(||a||·||b||) simplifies to just a·b when both are unit vectors; (3) eliminates two sqrt computations and one division per comparison; (4) at billion-vector scale, this is a significant speed-up.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q4-2', title: 'Quiz 4.2 — Matrices',
      type: 'lesson', moduleId: 'm4', passMark: 70,
      questions: [
        {
          id: 'q4-2-1', type: 'multiple_choice',
          question: 'Matrix A has shape (4, 3) and matrix B has shape (3, 7). What is the shape of A @ B?',
          options: ['(3, 3)', '(4, 7)', '(7, 4)', 'Cannot be computed — shapes incompatible'],
          correctAnswer: '(4, 7)',
          gradingRubric: 'Award full marks for (4, 7). Inner dimensions match (3 = 3), result is (outer dim of A) × (outer dim of B) = (4, 7).',
          xpValue: 10,
        },
        {
          id: 'q4-2-2', type: 'short_answer',
          question: 'In a transformer, the attention computation includes Q @ Kᵀ. If Q and K each have shape (batch=8, heads=12, seq=512, d_k=64), what is the shape of Q @ Kᵀ, and what does each element represent?',
          gradingRubric: 'Award marks for: (1) shape = (8, 12, 512, 512); (2) each element [b, h, i, j] is the dot product of query i with key j for head h in batch b; (3) represents how much token i should attend to token j; (4) this is the raw attention score before softmax.',
          xpValue: 20,
        },
        {
          id: 'q4-2-3', type: 'multiple_choice',
          question: 'What is the mathematical motivation behind LoRA (Low-Rank Adaptation)?',
          options: [
            'Weight matrices are sparse, so most values can be set to zero',
            'Weight updates during fine-tuning have low intrinsic rank — they live in a small subspace of the full matrix space',
            'Smaller matrices are faster to load from disk',
            'Lower-rank matrices have smaller eigenvalues',
          ],
          correctAnswer: 'Weight updates during fine-tuning have low intrinsic rank — they live in a small subspace of the full matrix space',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q4-2-4', type: 'short_answer',
          question: 'Explain why GPUs are so effective at neural network training, specifically referencing matrix multiplication and hardware design.',
          gradingRubric: 'Award marks for: (1) neural network training dominated by matrix multiplies; (2) matrix multiply is embarrassingly parallel — each output element independent; (3) GPU tensor cores perform fused multiply-add on 4×4 or 8×8 sub-matrices in one cycle; (4) thousands of CUDA cores = thousands of simultaneous operations; (5) bonus: memory hierarchy (registers → shared memory → HBM) matches matrix tile sizes.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q4-3', title: 'Quiz 4.3 — Eigenvalues & PCA',
      type: 'lesson', moduleId: 'm4', passMark: 70,
      questions: [
        {
          id: 'q4-3-1', type: 'multiple_choice',
          question: 'In PCA, what do the eigenvectors of the data covariance matrix represent?',
          options: [
            'The mean values of each feature',
            'The directions of maximum variance in the data (principal components)',
            'The distances between individual data points',
            'The correlation coefficients between feature pairs',
          ],
          correctAnswer: 'The directions of maximum variance in the data (principal components)',
          gradingRubric: 'Award full marks for the second option.',
          xpValue: 10,
        },
        {
          id: 'q4-3-2', type: 'short_answer',
          question: 'How does the eigenvalue structure of pre-trained weight matrices motivate LoRA as a fine-tuning technique? Why does this reduce trainable parameters dramatically?',
          gradingRubric: 'Award marks for: (1) pre-trained weight matrices have few large eigenvalues and many near-zero eigenvalues (low effective rank); (2) this means the "interesting" subspace is small; (3) LoRA exploits this: ΔW = A×B with rank r << d; (4) instead of d² parameters, only 2×d×r parameters needed; (5) for d=4096, r=16: 4096² = 16M params → 2×4096×16 = 131K — 99% reduction.',
          xpValue: 20,
        },
        {
          id: 'q4-3-3', type: 'multiple_choice',
          question: 'You apply PCA to 500 text embeddings in 1536 dimensions, keeping the top 2 principal components for visualisation. What information is lost?',
          options: [
            'Nothing — PCA is lossless',
            'The variance in all dimensions beyond the top 2 — typically 80–95% of total variance',
            'Only noise is removed; semantic structure is fully preserved',
            'The original text strings',
          ],
          correctAnswer: 'The variance in all dimensions beyond the top 2 — typically 80–95% of total variance',
          gradingRubric: 'Award full marks for the second option. 2 dimensions of 1536 capture very little total variance, but may be enough to show gross semantic clustering.',
          xpValue: 10,
        },
        {
          id: 'q4-3-4', type: 'practical',
          question: 'Describe (in pseudocode or prose) how you would use the Anthropic embeddings API and PCA to visualise whether embeddings for "ancient Greek ships", "Roman amphorae", "maritime archaeology", and "deep sea diving" cluster together in 2D space.',
          gradingRubric: 'Award marks for: (1) call embeddings API for each text to get 1536-dim vectors; (2) stack into (4, 1536) matrix; (3) apply PCA to reduce to (4, 2); (4) plot 2D scatter with labels; (5) semantically related terms (maritime, archaeology, ancient) should cluster together; (6) bonus: compute cosine similarities as quantitative check.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q4-4', title: 'Quiz 4.4 — Tensors',
      type: 'lesson', moduleId: 'm4', passMark: 70,
      questions: [
        {
          id: 'q4-4-1', type: 'multiple_choice',
          question: 'A transformer\'s hidden states have shape (batch=16, seq=512, hidden=768). How many float32 values does this tensor contain?',
          options: ['16 × 512 = 8,192', '512 × 768 = 393,216', '16 × 512 × 768 = 6,291,456', '16 × 768 = 12,288'],
          correctAnswer: '16 × 512 × 768 = 6,291,456',
          gradingRubric: 'Award full marks for 6,291,456. All dimensions multiply together. At float32 (4 bytes), this is ~25 MB for one activation tensor.',
          xpValue: 10,
        },
        {
          id: 'q4-4-2', type: 'short_answer',
          question: 'What is tensor broadcasting? Give a concrete example from transformer computation showing how a (1, 1, 768) bias vector is applied to a (32, 512, 768) batch without a loop.',
          gradingRubric: 'Award marks for: (1) broadcasting expands size-1 dimensions to match; (2) (1,1,768) + (32,512,768) → the bias is replicated across all 32 batches and 512 positions; (3) no loop required — framework handles expansion internally; (4) equivalent to adding the same bias to every token in every batch.',
          xpValue: 15,
        },
        {
          id: 'q4-4-3', type: 'multiple_choice',
          question: 'What does loss.backward() do in PyTorch?',
          options: [
            'Recomputes the forward pass in reverse order for verification',
            'Traverses the computation DAG and computes gradients for all parameters via the chain rule',
            'Updates model weights using the current gradients',
            'Clears the gradient buffers to prepare for the next batch',
          ],
          correctAnswer: 'Traverses the computation DAG and computes gradients for all parameters via the chain rule',
          gradingRubric: 'Award full marks for the second option. Backward only computes .grad — optimiser.step() does the weight update; zero_grad() clears buffers.',
          xpValue: 10,
        },
        {
          id: 'q4-4-4', type: 'short_answer',
          question: 'Trace through the shapes of Q, K, V tensors in multi-head attention. Given 8 heads, sequence length 512, d_model=512, and d_k=d_v=64, what is the shape of the final attention output before the output projection?',
          gradingRubric: 'Award marks for: (1) Q, K, V each: (batch, 8, 512, 64); (2) scores = Q @ Kᵀ: (batch, 8, 512, 512); (3) weights = softmax(scores): (batch, 8, 512, 512); (4) context = weights @ V: (batch, 8, 512, 64); (5) concatenate heads → (batch, 512, 512); (6) then output projection (512, 512) gives final (batch, 512, 512).',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p4', moduleId: 'm4',
    name: 'Embedding Explorer', emoji: '🧭',
    description: 'Use the Anthropic API to generate text embeddings for 30+ sentences, compute a full cosine similarity matrix, reduce to 2D with PCA, and create an interactive scatter plot where points cluster by semantic meaning.',
    tools: ['python', 'numpy', 'matplotlib', 'anthropic-sdk', 'claude-code'],
    status: 'not_started',
    rubric: [
      'Generates embeddings for at least 30 sentences from 5+ semantic categories (e.g., maritime, programming, cooking, sport, science)',
      'Computes the full (n×n) cosine similarity matrix correctly using numpy',
      'Implements PCA from scratch (or with sklearn) to reduce 1536 dims to 2',
      'Plots a 2D scatter with labels; points from same category should visibly cluster',
      'Prints the 5 most similar and 5 most dissimilar pairs by cosine similarity',
      'Handles the Anthropic embeddings API correctly (rate limits, error handling)',
      'README includes a screenshot of the plot and an explanation of why clustering occurs',
    ],
    xpReward: 100,
  },
}

// ─── MODULE 5 ─────────────────────────────────────────────────────────────────
const m5: Module = {
  id: 'm5', number: 5, arc: 1,
  title: 'Calculus and Optimisation',
  description: 'Master the mathematics that teaches machines to learn — derivatives, gradient descent, backpropagation, and the optimisers powering every modern AI model.',
  prerequisiteModuleId: 'm4',
  lessons: [
    {
      id: '5-1', number: '5.1',
      title: 'Derivatives and the Idea of Change',
      duration: 14,
      content: `# Derivatives and the Idea of Change

The entire field of machine learning rests on a single mathematical question: **how does a small change in one variable affect another?** The answer is the derivative — and once you understand it intuitively, you understand why neural networks can learn at all.

## What Is a Derivative?

A **derivative** measures the instantaneous rate of change of a function. If \`f(x)\` describes a curve, then \`f'(x)\` (or \`df/dx\`) tells you the slope of that curve at any point x.

Concretely: if you nudge x by a tiny amount \`Δx\`, the output changes by approximately \`f'(x) × Δx\`. This linear approximation is the cornerstone of optimisation.

| Notation | Meaning |
|----------|---------|
| \`f'(x)\` | derivative of f with respect to x (Lagrange) |
| \`df/dx\` | differential notation (Leibniz) |
| \`∂f/∂x\` | partial derivative (holds other variables fixed) |

## Common Derivative Rules

You do not need to derive these from first principles — you need to recognise patterns:

- **Power rule:** \`d/dx [xⁿ] = nxⁿ⁻¹\`
- **Constant multiple:** \`d/dx [cf(x)] = c·f'(x)\`
- **Sum rule:** \`d/dx [f + g] = f' + g'\`
- **Product rule:** \`d/dx [fg] = f'g + fg'\`
- **Chain rule:** \`d/dx [f(g(x))] = f'(g(x)) · g'(x)\` — this one powers backpropagation

## Derivatives of Key AI Functions

Three functions appear constantly in AI:

**ReLU (Rectified Linear Unit):**
\`\`\`
ReLU(x) = max(0, x)
ReLU'(x) = 0 if x < 0, else 1
\`\`\`
ReLU is piecewise linear — its derivative is a simple switch. This is why it is the dominant activation function in modern networks: gradients flow cleanly without vanishing.

**Sigmoid:**
\`\`\`
σ(x) = 1 / (1 + e⁻ˣ)
σ'(x) = σ(x)(1 − σ(x))
\`\`\`
Sigmoid squashes values to (0,1). Its derivative is largest near zero and collapses toward the tails — this causes the **vanishing gradient problem** in deep networks, which is why ReLU replaced it in hidden layers.

**Softmax (for output layers):**
Softmax converts raw logits to probabilities. Its Jacobian (matrix of partial derivatives) is more complex but has a tidy closed form used in backprop.

## Why This Matters for AI

Every neural network training loop boils down to: compute the derivative of the loss function with respect to every weight, then adjust each weight to reduce the loss. That process — called **gradient descent** — is literally calculus applied to millions of parameters simultaneously.

When you call \`anthropic.messages.create()\` and Claude returns a thoughtful answer, you are experiencing the result of trillions of derivative computations during training. The weights inside Claude are fixed, but they were found by following gradients downhill through an unimaginably complex mathematical landscape.

## Geometric Intuition

Think of a function's graph as a hilly landscape:
- The **derivative** at any point is the steepness of the slope beneath your feet
- Positive derivative → ground rising to the right
- Negative derivative → ground falling to the right
- Derivative = 0 → flat ground (a potential minimum or maximum)

Finding the minimum of a loss function means finding the flat valleys in this landscape. Derivatives are your compass.

## Numerical vs. Symbolic Derivatives

Modern deep learning frameworks (PyTorch, JAX, TensorFlow) use **automatic differentiation** — they record every operation in a computational graph and apply the chain rule exactly, without numerical approximation. This is far more efficient than finite-difference estimation:

\`\`\`python
# PyTorch autograd: derivatives are computed automatically
import torch
x = torch.tensor(3.0, requires_grad=True)
y = x ** 3 + 2 * x          # y = x³ + 2x
y.backward()                  # compute dy/dx
print(x.grad)                 # tensor(29.)  ← 3x² + 2 = 3(9) + 2 = 29 ✓
\`\`\`

Understanding derivatives means understanding what \`requires_grad=True\` actually does: it tells PyTorch to track this tensor through the computational graph so that gradients can flow back through it during \`backward()\`.`,
      keyTerms: [
        { term: 'Derivative', definition: 'The instantaneous rate of change of a function; the slope of a curve at a point.' },
        { term: 'Chain Rule', definition: 'A rule for differentiating composite functions: d/dx[f(g(x))] = f\'(g(x))·g\'(x). Fundamental to backpropagation.' },
        { term: 'ReLU', definition: 'Rectified Linear Unit: max(0,x). The most common neural network activation function due to clean gradient flow.' },
        { term: 'Vanishing Gradient', definition: 'When gradients shrink exponentially through deep layers, preventing early layers from learning. Caused by sigmoid/tanh activations.' },
        { term: 'Automatic Differentiation', definition: 'Framework technique (used in PyTorch/JAX) that applies the chain rule exactly through a computational graph.' },
      ],
    },
    {
      id: '5-2', number: '5.2',
      title: 'Gradient Descent — Teaching Machines to Learn',
      duration: 16,
      content: `# Gradient Descent — Teaching Machines to Learn

If derivatives tell you the slope at a single point, **gradient descent** uses those slopes to navigate toward the bottom of a loss landscape. It is the algorithm that makes machine learning possible.

## The Core Algorithm

Given a loss function \`L(w)\` where \`w\` is a vector of model weights:

\`\`\`
Repeat until convergence:
    w ← w - α · ∇L(w)
\`\`\`

Where:
- \`α\` (alpha) is the **learning rate** — how large a step to take
- \`∇L(w)\` is the **gradient** — the vector of partial derivatives of L with respect to every weight
- The minus sign means we move **downhill** (against the gradient)

This deceptively simple update rule, applied billions of times over millions of examples, is what taught GPT-4 to reason and Claude to write.

## Visualising the Loss Landscape

Imagine a mountain range viewed from above. Each point on the map represents a possible configuration of weights. The elevation at each point represents the loss (error) for that configuration. Gradient descent is a hiker trying to reach the lowest valley:

1. Look at the slope beneath your feet (compute gradient)
2. Take a step downhill (update weights)
3. Repeat

In 2D this is easy to visualise. In practice, neural networks have billions of dimensions — but the same principle applies. Remarkably, high-dimensional loss landscapes tend to have **many saddle points** but **few true local minima** that are much worse than the global minimum. This is a major theoretical reason why gradient descent works in practice.

## Variants of Gradient Descent

| Variant | Data per update | Speed | Noise |
|---------|----------------|-------|-------|
| **Batch GD** | Full dataset | Slow | Low |
| **Stochastic GD (SGD)** | 1 example | Fast | High |
| **Mini-batch GD** | 32–512 examples | Balanced | Medium |

Modern training uses **mini-batch SGD**. The noise from small batches actually helps escape shallow local minima — it acts like a random perturbation that shakes the hiker off bad ledges.

## The Learning Rate — The Most Important Hyperparameter

The learning rate \`α\` controls step size:

- **Too large:** overshoots the minimum, loss diverges or oscillates
- **Too small:** training takes forever, may get stuck
- **Just right:** smooth convergence to a good minimum

\`\`\`
α = 0.1  → often too large for deep networks
α = 0.01 → common starting point
α = 0.001 → typical for Adam optimizer
α = 1e-5  → common for fine-tuning pre-trained models
\`\`\`

When fine-tuning Claude via LoRA (Module 22), you will use very small learning rates (1e-4 to 1e-5) because the pre-trained weights are already near a good region — large steps would destroy the learned representations.

## Loss Functions — What Are We Minimising?

The loss function quantifies how wrong the model is. Common choices:

**Mean Squared Error (regression):**
\`\`\`
L = (1/n) Σ (ŷᵢ - yᵢ)²
\`\`\`

**Cross-Entropy Loss (classification / language models):**
\`\`\`
L = -Σ yᵢ log(ŷᵢ)
\`\`\`

Language models like Claude are trained to minimise cross-entropy between their predicted token probability distribution and the actual next token. Every forward pass computes this loss; every backward pass computes its gradient; every weight update moves weights to reduce it. Repeated across trillions of tokens.

## Convergence and the Loss Curve

Training is monitored by plotting loss vs. training steps:

- **Decreasing loss** → model is learning
- **Plateau** → may need to adjust learning rate or increase model capacity
- **Increasing validation loss while training loss decreases** → overfitting

The loss curves published by labs like Anthropic (in model cards and scaling law papers) follow predictable **power law** relationships — which is why scaling laws (Module 9) can predict model performance before training completes.

## Gradient Descent in Code

\`\`\`python
# Pure NumPy gradient descent for linear regression
import numpy as np

def train(X, y, lr=0.01, epochs=1000):
    w = np.zeros(X.shape[1])
    for epoch in range(epochs):
        y_pred = X @ w                          # forward pass
        loss = np.mean((y_pred - y) ** 2)       # MSE loss
        grad = (2 / len(y)) * X.T @ (y_pred - y)  # gradient
        w -= lr * grad                          # weight update
        if epoch % 100 == 0:
            print(f"Epoch {epoch}: loss = {loss:.4f}")
    return w
\`\`\`

This 8-line loop is the conceptual ancestor of the code that trained every large language model in existence.`,
      keyTerms: [
        { term: 'Gradient Descent', definition: 'An iterative optimisation algorithm that updates parameters by moving opposite to the gradient of the loss function.' },
        { term: 'Learning Rate (α)', definition: 'The step size in gradient descent. Too large diverges; too small is slow. Critical hyperparameter.' },
        { term: 'Mini-batch SGD', definition: 'Gradient descent using small random subsets of data (32–512 examples) per update. Standard in modern deep learning.' },
        { term: 'Loss Function', definition: 'A function measuring model error. Training minimises this. Cross-entropy for classification/LMs; MSE for regression.' },
        { term: 'Cross-Entropy Loss', definition: 'Standard loss for language models: measures the difference between predicted token probabilities and actual tokens.' },
      ],
    },
    {
      id: '5-3', number: '5.3',
      title: 'Backpropagation — The Chain Rule at Scale',
      duration: 15,
      content: `# Backpropagation — The Chain Rule at Scale

Gradient descent needs the gradient of the loss with respect to every weight in the network. In a model with billions of parameters, computing these gradients naively would be impossibly expensive. **Backpropagation** is the efficient algorithm that makes it tractable — and it is literally just the chain rule applied in reverse through a computational graph.

## The Computational Graph

Every neural network computation can be represented as a directed acyclic graph (DAG) where:
- **Nodes** are operations (multiply, add, ReLU, softmax)
- **Edges** carry tensor values flowing forward

\`\`\`
Input x → [Linear] → [ReLU] → [Linear] → [Softmax] → Loss L
\`\`\`

During the **forward pass**, data flows left to right, producing a loss value.
During the **backward pass**, gradients flow right to left using the chain rule.

## The Chain Rule in Action

Consider a simple two-layer network:
\`\`\`
z₁ = W₁x + b₁        (first linear layer)
a₁ = ReLU(z₁)        (activation)
z₂ = W₂a₁ + b₂       (second linear layer)
L  = CrossEntropy(softmax(z₂), y)   (loss)
\`\`\`

To find \`∂L/∂W₁\`, we apply the chain rule backward:
\`\`\`
∂L/∂W₁ = (∂L/∂z₂) · (∂z₂/∂a₁) · (∂a₁/∂z₁) · (∂z₁/∂W₁)
\`\`\`

Each factor is a local gradient — easy to compute. The magic of backprop is that these local gradients can be computed and cached during one backward pass, rather than recomputed for each weight separately.

## Why This Is Efficient

Without backprop: to compute the gradient with respect to each of N weights, you would need N forward passes (perturb each weight, measure loss change). For GPT-4 with ~1 trillion parameters, this is 10¹² forward passes. Impossible.

With backprop: **one forward pass + one backward pass** computes all N gradients simultaneously. The cost is roughly 2–3× a single forward pass. This is why training is feasible at all.

## Vanishing and Exploding Gradients

As gradients propagate backward through many layers, they are multiplied together. If each local gradient has magnitude < 1, the product shrinks exponentially → **vanishing gradients** (early layers learn nothing).
If each local gradient has magnitude > 1, the product grows exponentially → **exploding gradients** (training diverges).

**Solutions evolved over time:**
| Problem | Solution |
|---------|---------|
| Vanishing gradients | ReLU activations, residual connections (ResNets) |
| Exploding gradients | Gradient clipping (cap gradient norm) |
| Both | Batch normalisation, layer normalisation |
| Long-range vanishing | Attention mechanisms (direct connections across tokens) |

The **attention mechanism** in Transformers is in part a solution to vanishing gradients in sequence models. Instead of gradients flowing through hundreds of recurrent steps, attention creates direct paths between any two positions — gradients flow cleanly.

## Residual Connections — The Key Insight of ResNets

\`\`\`
output = F(x) + x     ← the skip connection
\`\`\`

Adding the input directly to the output creates a gradient highway: even if \`F(x)\` has a tiny gradient, the gradient of the identity mapping is 1, ensuring at least some gradient always flows. This is why 150-layer networks became trainable in 2015 — and why every modern Transformer block uses residual connections.

## Backprop in PyTorch

PyTorch's autograd engine implements backprop automatically:

\`\`\`python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10),
)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# Training step
output = model(x_batch)              # forward pass: build computational graph
loss = nn.CrossEntropyLoss()(output, y_batch)
optimizer.zero_grad()                # clear previous gradients
loss.backward()                      # backward pass: compute all ∂L/∂w
optimizer.step()                     # update weights: w ← w - α·∇L
\`\`\`

\`loss.backward()\` is the single call that invokes the entire backpropagation algorithm across the computational graph. Every research lab in the world calls this (or an equivalent) millions of times per training run.

## Implications for AI Scale

Backpropagation's efficiency scales linearly with model size — twice as many parameters costs roughly twice as much compute per step. Combined with mini-batch parallelism on GPUs, this makes training models with 70 billion parameters feasible on clusters of thousands of GPUs.

Understanding backprop tells you why AI labs invest so heavily in custom silicon (TPUs, Trainium, NeuralCore): each chip is optimised to perform the specific matrix multiplications and gradient accumulations that dominate training compute.`,
      keyTerms: [
        { term: 'Backpropagation', definition: 'Algorithm for computing gradients in neural networks by applying the chain rule backward through the computational graph.' },
        { term: 'Computational Graph', definition: 'A DAG representing all operations in a neural network. Forward pass produces loss; backward pass propagates gradients.' },
        { term: 'Residual Connection', definition: 'A skip connection adding input directly to output: output = F(x) + x. Creates gradient highways through deep networks.' },
        { term: 'Gradient Clipping', definition: 'Technique to prevent exploding gradients by capping the gradient norm to a maximum value during training.' },
        { term: 'Vanishing Gradient', definition: 'Gradients shrinking exponentially through layers, preventing early layers from learning. Solved by ReLU, residual connections, and attention.' },
      ],
    },
    {
      id: '5-4', number: '5.4',
      title: 'Optimisers — From SGD to Adam',
      duration: 13,
      content: `# Optimisers — From SGD to Adam

Vanilla gradient descent is powerful but crude. Modern optimisers use the history of past gradients to adapt step sizes per parameter — turning the blunt "move downhill" instruction into a sophisticated navigation strategy. Understanding optimisers tells you why the same learning rate that works for one layer may destroy another.

## The Problem With Vanilla SGD

Plain SGD applies the same learning rate to every parameter:
\`\`\`
w ← w - α · g      (g = gradient)
\`\`\`

This is inefficient because:
- Some parameters have consistently large gradients → should use small steps
- Some parameters have small, rare gradients → should use large steps
- Gradients are noisy from mini-batches → oscillations in narrow valleys

## Momentum — Building Speed

**SGD with Momentum** accumulates a velocity vector:
\`\`\`
v ← β·v + (1-β)·g
w ← w - α·v
\`\`\`

Where \`β ≈ 0.9\` (momentum coefficient). Like a ball rolling downhill, momentum accumulates speed in consistent directions and dampens oscillations. This helps navigate the narrow "ravine" geometries common in neural network loss landscapes.

## RMSProp — Adapting Step Sizes

**RMSProp** tracks the exponential moving average of squared gradients:
\`\`\`
v ← β·v + (1-β)·g²
w ← w - (α / √(v + ε)) · g
\`\`\`

Parameters with large recent gradients get smaller effective learning rates. This solves the "sparse gradients" problem in embedding layers — word embeddings for rare words receive larger updates than embeddings for common words.

## Adam — The Default Choice

**Adam** (Adaptive Moment Estimation) combines momentum and RMSProp:
\`\`\`
m ← β₁·m + (1-β₁)·g          (first moment: mean of gradients)
v ← β₂·v + (1-β₂)·g²         (second moment: mean of squared gradients)

m̂ = m / (1 - β₁ᵗ)             (bias-corrected)
v̂ = v / (1 - β₂ᵗ)

w ← w - α · m̂ / (√v̂ + ε)
\`\`\`

**Default hyperparameters:**
| Parameter | Default | Meaning |
|-----------|---------|---------|
| \`α\` | 1e-3 | Learning rate |
| \`β₁\` | 0.9 | Momentum decay |
| \`β₂\` | 0.999 | RMS decay |
| \`ε\` | 1e-8 | Numerical stability |

Adam is the default for almost all deep learning research. It converges fast, requires minimal hyperparameter tuning, and handles the sparse gradients of embedding layers gracefully.

## AdamW — The LLM Standard

**AdamW** adds decoupled weight decay — L2 regularisation applied directly to weights, not through gradient scaling:
\`\`\`
w ← w - α·(m̂/√v̂ + ε) - α·λ·w
\`\`\`

Where \`λ\` (typically 0.01–0.1) is the weight decay coefficient. This prevents weight magnitudes from growing unconstrained, improving generalisation.

**AdamW is the standard optimiser for training and fine-tuning LLMs.** When Anthropic trains Claude, they use AdamW with a carefully scheduled learning rate. When you fine-tune a model via Hugging Face, AdamW is the default.

## Learning Rate Schedules

A fixed learning rate is suboptimal. State-of-the-art training uses **schedules**:

**Cosine annealing:**
\`\`\`
α(t) = α_min + 0.5(α_max - α_min)(1 + cos(πt/T))
\`\`\`
Smoothly decreases from \`α_max\` to \`α_min\` following a cosine curve. Used by most LLM training runs.

**Warmup:**
Most large model training begins with a **linear warmup** phase (typically 1–2% of total steps) where learning rate ramps from 0 to \`α_max\`. This prevents early instability when weights are random and gradients are large.

**Combined warmup + cosine decay:**
\`\`\`
Steps 0 → T_warmup:      α increases linearly to α_max
Steps T_warmup → T_total: α decreases via cosine to α_min
\`\`\`

This is the schedule used in GPT-3, PaLM, Claude, and virtually every major LLM training run.

## Practical Implications for AI Engineering

When you call the Anthropic API for fine-tuning (Module 13) or configure a training run:

\`\`\`python
from transformers import AdamW, get_cosine_schedule_with_warmup

optimizer = AdamW(model.parameters(), lr=2e-5, weight_decay=0.01)
scheduler = get_cosine_schedule_with_warmup(
    optimizer,
    num_warmup_steps=500,
    num_training_steps=10000,
)
\`\`\`

These choices directly determine whether training converges, how fast it converges, and the final model quality. The ability to read a paper's "Training Details" section and understand what \`β₁=0.9, β₂=0.95, warmup=2000 steps, cosine decay to 1e-5\` means is what separates AI practitioners from AI users.`,
      keyTerms: [
        { term: 'Adam Optimiser', definition: 'Adaptive Moment Estimation: combines momentum and RMSProp to adapt learning rates per parameter. Default for deep learning.' },
        { term: 'AdamW', definition: 'Adam with decoupled weight decay. Standard optimiser for training and fine-tuning large language models.' },
        { term: 'Momentum', definition: 'Technique accumulating a velocity vector in gradient descent, accelerating consistent directions and dampening oscillations.' },
        { term: 'Learning Rate Schedule', definition: 'A plan for varying learning rate during training. Cosine decay with linear warmup is standard for LLMs.' },
        { term: 'Weight Decay', definition: 'L2 regularisation applied to weights to prevent unbounded growth, improving generalisation.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q5-1', title: 'Derivatives and Change',
      type: 'lesson', moduleId: 'm5', passMark: 70,
      questions: [
        {
          id: 'q5-1-1', type: 'multiple_choice',
          question: 'What does the derivative f\'(x) represent geometrically?',
          options: ['The area under the curve at x', 'The slope of the tangent line at x', 'The value of f at x', 'The second derivative of f'],
          correctAnswer: 'The slope of the tangent line at x',
          gradingRubric: 'Award full marks for the second option. The derivative gives the instantaneous rate of change — geometrically this is the slope of the line tangent to the curve at point x.',
          xpValue: 10,
        },
        {
          id: 'q5-1-2', type: 'multiple_choice',
          question: 'The vanishing gradient problem is most commonly caused by which activation function in deep networks?',
          options: ['ReLU', 'Sigmoid', 'GELU', 'Swish'],
          correctAnswer: 'Sigmoid',
          gradingRubric: 'Sigmoid\'s derivative σ\'(x) = σ(x)(1-σ(x)) approaches 0 for large |x|, causing gradients to shrink exponentially through layers.',
          xpValue: 10,
        },
        {
          id: 'q5-1-3', type: 'short_answer',
          question: 'Using the power rule, what is the derivative of f(x) = x⁴ + 3x²?',
          correctAnswer: '4x³ + 6x',
          gradingRubric: 'd/dx[x⁴] = 4x³ and d/dx[3x²] = 6x. By the sum rule, the derivative is 4x³ + 6x.',
          xpValue: 15,
        },
        {
          id: 'q5-1-4', type: 'multiple_choice',
          question: 'PyTorch\'s requires_grad=True flag tells the engine to:',
          options: [
            'Freeze the parameter so it does not update',
            'Track this tensor through the computational graph for gradient computation',
            'Convert the tensor to float64 precision',
            'Enable CUDA acceleration for this tensor',
          ],
          correctAnswer: 'Track this tensor through the computational graph for gradient computation',
          gradingRubric: 'requires_grad=True marks a tensor to be included in the automatic differentiation graph, so .backward() can compute its gradient.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q5-2', title: 'Gradient Descent',
      type: 'lesson', moduleId: 'm5', passMark: 70,
      questions: [
        {
          id: 'q5-2-1', type: 'multiple_choice',
          question: 'In gradient descent w ← w - α·∇L, why is there a minus sign?',
          options: [
            'It is a convention with no mathematical meaning',
            'We move opposite to the gradient to go downhill on the loss surface',
            'It ensures the learning rate stays positive',
            'It compensates for the sign of the loss function',
          ],
          correctAnswer: 'We move opposite to the gradient to go downhill on the loss surface',
          gradingRubric: 'The gradient points uphill (direction of steepest ascent). Subtracting it moves parameters downhill toward lower loss.',
          xpValue: 10,
        },
        {
          id: 'q5-2-2', type: 'multiple_choice',
          question: 'Which loss function is used to train language models like Claude?',
          options: ['Mean Squared Error', 'Hinge Loss', 'Cross-Entropy Loss', 'Huber Loss'],
          correctAnswer: 'Cross-Entropy Loss',
          gradingRubric: 'Cross-entropy loss -Σ y log(ŷ) measures the difference between predicted token probabilities and the actual next token distribution.',
          xpValue: 10,
        },
        {
          id: 'q5-2-3', type: 'practical',
          question: 'What would happen to training if you set the learning rate α = 10.0 for a deep neural network?',
          correctAnswer: 'Training would likely diverge — loss would increase or oscillate wildly rather than decrease',
          gradingRubric: 'A learning rate of 10.0 is many orders of magnitude too large. Each step would overshoot the minimum, sending weights to extreme values and causing loss to explode.',
          xpValue: 20,
        },
        {
          id: 'q5-2-4', type: 'multiple_choice',
          question: 'Mini-batch SGD is preferred over full-batch gradient descent because:',
          options: [
            'It always finds a better minimum',
            'It uses less memory and the noise helps escape shallow local minima',
            'It requires no learning rate',
            'It computes exact gradients',
          ],
          correctAnswer: 'It uses less memory and the noise helps escape shallow local minima',
          gradingRubric: 'Mini-batches process data in chunks (less GPU memory), and stochastic noise from small batches acts as a regulariser, often finding better generalisations than full-batch descent.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q5-3', title: 'Backpropagation',
      type: 'lesson', moduleId: 'm5', passMark: 70,
      questions: [
        {
          id: 'q5-3-1', type: 'multiple_choice',
          question: 'Backpropagation is mathematically equivalent to:',
          options: [
            'Forward-mode automatic differentiation',
            'Finite-difference gradient estimation',
            'The chain rule applied backward through a computational graph',
            'Newton\'s method for root finding',
          ],
          correctAnswer: 'The chain rule applied backward through a computational graph',
          gradingRubric: 'Backprop systematically applies the chain rule from the loss back through each operation in the computational graph, computing all gradients in one backward pass.',
          xpValue: 10,
        },
        {
          id: 'q5-3-2', type: 'multiple_choice',
          question: 'A residual connection output = F(x) + x solves the vanishing gradient problem because:',
          options: [
            'It doubles the gradient at every layer',
            'The identity path always has gradient 1, ensuring gradient flow even if F(x) is tiny',
            'It prevents the use of activation functions',
            'It keeps weights initialised near zero',
          ],
          correctAnswer: 'The identity path always has gradient 1, ensuring gradient flow even if F(x) is tiny',
          gradingRubric: '∂(F(x)+x)/∂x = ∂F/∂x + 1. Even if ∂F/∂x → 0, the gradient is at least 1, creating a highway for gradient flow through deep networks.',
          xpValue: 15,
        },
        {
          id: 'q5-3-3', type: 'short_answer',
          question: 'In PyTorch, which method call triggers the backward pass to compute all gradients?',
          correctAnswer: 'loss.backward()',
          gradingRubric: 'Calling .backward() on the loss tensor triggers backpropagation through the entire computational graph, populating .grad attributes on all tensors with requires_grad=True.',
          xpValue: 10,
        },
        {
          id: 'q5-3-4', type: 'multiple_choice',
          question: 'Why was the attention mechanism in Transformers partly a solution to gradient problems?',
          options: [
            'It uses larger batch sizes',
            'It removes all activation functions',
            'It creates direct connections between positions, avoiding long gradient chains through recurrent steps',
            'It initialises weights to exactly 1.0',
          ],
          correctAnswer: 'It creates direct connections between positions, avoiding long gradient chains through recurrent steps',
          gradingRubric: 'RNNs suffered vanishing gradients over long sequences because gradients flowed through hundreds of steps. Attention creates direct O(1)-depth connections between any two positions.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q5-4', title: 'Optimisers and Learning Rate Schedules',
      type: 'lesson', moduleId: 'm5', passMark: 70,
      questions: [
        {
          id: 'q5-4-1', type: 'multiple_choice',
          question: 'What does AdamW add to Adam that makes it preferred for LLM training?',
          options: [
            'A larger default learning rate',
            'Decoupled weight decay applied directly to weights',
            'Second-order gradient estimation',
            'Automatic batch size scaling',
          ],
          correctAnswer: 'Decoupled weight decay applied directly to weights',
          gradingRubric: 'AdamW applies L2 regularisation (weight decay) directly to weights rather than through the gradient, preventing the gradient scaling from distorting the regularisation effect.',
          xpValue: 10,
        },
        {
          id: 'q5-4-2', type: 'multiple_choice',
          question: 'Why do large model training runs begin with a linear learning rate warmup phase?',
          options: [
            'To allow the optimiser to load model weights from disk',
            'To prevent early instability when random weights produce large, noisy gradients',
            'Because GPUs run faster at lower learning rates',
            'To match the cosine schedule at step zero',
          ],
          correctAnswer: 'To prevent early instability when random weights produce large, noisy gradients',
          gradingRubric: 'At initialisation, random weights produce unpredictable gradient magnitudes. Starting with a small learning rate and ramping up prevents explosive early updates that could permanently damage training.',
          xpValue: 10,
        },
        {
          id: 'q5-4-3', type: 'practical',
          question: 'You are fine-tuning a pre-trained language model. Should you use a higher or lower learning rate than you would for training from scratch? Why?',
          correctAnswer: 'Lower — fine-tuning uses 10–100× smaller learning rates (e.g. 1e-5 vs 1e-3) to avoid overwriting the valuable pre-trained representations',
          gradingRubric: 'Pre-trained weights already occupy a good region of the loss landscape. Large steps would destroy this — fine-tuning makes small, targeted adjustments to adapt the model to the new task.',
          xpValue: 20,
        },
        {
          id: 'q5-4-4', type: 'multiple_choice',
          question: 'Adam\'s β₁ = 0.9 controls:',
          options: [
            'The learning rate decay speed',
            'Weight decay regularisation strength',
            'The exponential moving average of gradients (first moment / momentum)',
            'The numerical stability constant',
          ],
          correctAnswer: 'The exponential moving average of gradients (first moment / momentum)',
          gradingRubric: 'β₁ governs the first moment estimate m ← β₁·m + (1-β₁)·g — how much past gradient history influences the current update direction.',
          xpValue: 10,
        },
      ],
    },
  ],
  project: {
    id: 'p5', moduleId: 'm5',
    name: 'Gradient Descent Visualiser',
    emoji: '📉',
    description: 'Build an interactive visualiser showing gradient descent navigating a 2D loss surface. Display contour plots, animate the optimisation path, and let the user adjust learning rate and momentum to see their effects in real-time.',
    tools: ['React', 'Canvas API or D3.js', 'NumPy-style calculations in JS', 'Tailwind CSS'],
    status: 'not_started',
    rubric: [
      'Renders a smooth 2D loss landscape contour plot with correct gradient directions',
      'Animates gradient descent path step-by-step with configurable animation speed',
      'Learning rate slider visibly changes step sizes — small α creeps, large α diverges',
      'Toggle between SGD, Momentum, and Adam to compare optimisation paths on the same surface',
      'Displays current loss value and step count live during animation',
    ],
    xpReward: 260,
  },
}

// ─── MODULE 6 ─────────────────────────────────────────────────────────────────
const m6: Module = {
  id: 'm6', number: 6, arc: 1,
  title: 'Probability and Statistics',
  description: 'Build the probabilistic intuition behind every AI output — from softmax temperatures to Bayesian reasoning, information theory to evaluation metrics. Arc 1 Final Exam included.',
  prerequisiteModuleId: 'm5',
  lessons: [
    {
      id: '6-1', number: '6.1',
      title: 'Probability Foundations and Bayes\' Theorem',
      duration: 14,
      content: `# Probability Foundations and Bayes' Theorem

Every token Claude generates is a probability distribution. Every confidence score from a model is a probability. Understanding probability is not optional for AI practitioners — it is the language in which AI thinks.

## Core Probability Concepts

**Sample space Ω:** the set of all possible outcomes
**Event A:** a subset of Ω
**Probability P(A):** a number in [0,1] measuring how likely A is

Three axioms underpin all of probability theory (Kolmogorov, 1933):
1. P(A) ≥ 0 for all events A
2. P(Ω) = 1 (something must happen)
3. P(A ∪ B) = P(A) + P(B) when A and B are mutually exclusive

From these three axioms, all of statistics, machine learning, and information theory follows.

## Conditional Probability

\`P(A|B)\` (read: "probability of A given B") is the probability of A occurring when we know B has occurred:

\`\`\`
P(A|B) = P(A ∩ B) / P(B)
\`\`\`

**AI connection:** Language model inference is entirely conditional probability. When Claude generates "The capital of France is ___", it computes \`P(next_token | all_previous_tokens)\`. Every generation step is a conditional probability evaluation.

## Independence

Events A and B are **independent** if knowing B gives no information about A:
\`\`\`
P(A|B) = P(A)    ⟺    P(A ∩ B) = P(A)·P(B)
\`\`\`

**Naive Bayes** classifiers assume feature independence — often wrong but surprisingly effective. Neural networks learn to model dependencies between features explicitly, which is why they outperform Naive Bayes on complex tasks.

## Bayes' Theorem — The Most Important Formula in AI

\`\`\`
P(H|E) = P(E|H) · P(H) / P(E)
\`\`\`

| Term | Name | Meaning |
|------|------|---------|
| \`P(H)\` | Prior | Probability of hypothesis before seeing evidence |
| \`P(E\|H)\` | Likelihood | Probability of evidence given hypothesis is true |
| \`P(E)\` | Marginal | Total probability of evidence (normalising constant) |
| \`P(H\|E)\` | Posterior | Updated probability after seeing evidence |

**Example — Spam Filter:**
- Prior \`P(spam) = 0.2\` (20% of emails are spam)
- Likelihood \`P("win prize"|spam) = 0.8\` (80% of spam contains this phrase)
- Likelihood \`P("win prize"|not spam) = 0.05\` (5% of legitimate email does)

\`\`\`
P(spam|"win prize") = (0.8 × 0.2) / (0.8×0.2 + 0.05×0.8) = 0.16/0.20 = 0.80
\`\`\`

Seeing "win prize" updates our probability from 20% to 80%. This is Bayesian reasoning.

## Bayesian Thinking in AI Alignment

Bayes' theorem underlies Constitutional AI and RLHF (Module 10). Human raters provide judgements about which response is better — these are evidence that updates the model's belief about what "good" responses look like. The reward model is literally a learned Bayesian prior over human preferences.

When Claude is uncertain, it often expresses probabilistic hedging ("I think... but I'm not certain") — this reflects genuine probability distributions over likely answers, not rhetorical caution.

## The Law of Total Probability

Often \`P(E)\` is hard to compute directly. Instead:
\`\`\`
P(E) = Σᵢ P(E|Hᵢ) · P(Hᵢ)
\`\`\`

Sum over all mutually exclusive hypotheses. This is used in **mixture models** — a foundational technique in clustering, topic modelling, and understanding how different "experts" in a mixture-of-experts model contribute to outputs.`,
      keyTerms: [
        { term: 'Conditional Probability', definition: 'P(A|B): the probability of A given that B has occurred. Foundation of all language model inference.' },
        { term: 'Bayes\' Theorem', definition: 'P(H|E) = P(E|H)·P(H)/P(E). Updates beliefs based on evidence. Core of Bayesian machine learning.' },
        { term: 'Prior', definition: 'P(H): belief about a hypothesis before observing evidence.' },
        { term: 'Posterior', definition: 'P(H|E): updated belief after observing evidence E.' },
        { term: 'Independence', definition: 'Two events are independent if P(A|B) = P(A) — knowing B gives no information about A.' },
      ],
    },
    {
      id: '6-2', number: '6.2',
      title: 'Probability Distributions',
      duration: 13,
      content: `# Probability Distributions

A probability distribution describes all possible values a random variable can take and how likely each is. Understanding the handful of distributions that appear constantly in AI is essential for reading papers, debugging models, and designing systems.

## Discrete Distributions

**Bernoulli distribution** — single binary trial:
\`\`\`
P(X=1) = p,   P(X=0) = 1-p
Mean: p,   Variance: p(1-p)
\`\`\`
A single coin flip. Appears in binary classifiers — is this spam? Is this toxic? Is this the correct answer?

**Categorical distribution** — generalised Bernoulli to K categories:
\`\`\`
P(X=k) = pₖ,   where Σ pₖ = 1
\`\`\`
**This is the output distribution of a language model.** At each step, the model outputs a categorical distribution over the entire vocabulary (~50,000–100,000 tokens). Sampling from this distribution produces the next token.

**Binomial distribution** — k successes in n independent Bernoulli trials:
\`\`\`
P(X=k) = C(n,k) · pᵏ(1-p)ⁿ⁻ᵏ
\`\`\`
Used in A/B testing for AI features: if 340 of 1000 users prefer model A, is this statistically significant?

## Continuous Distributions

**Uniform distribution** — all values in [a,b] equally likely:
\`\`\`
f(x) = 1/(b-a)   for x ∈ [a,b]
\`\`\`
Used in weight initialisation strategies (Xavier/Glorot initialisation samples from a scaled uniform distribution).

**Gaussian (Normal) distribution:**
\`\`\`
f(x) = (1/σ√2π) · exp(-(x-μ)²/2σ²)
\`\`\`
Parameterised by mean μ and standard deviation σ. The most important distribution in statistics due to the **Central Limit Theorem**: means of large samples are approximately Gaussian regardless of the original distribution.

AI uses:
- Weight initialisation (He/Kaiming init samples from N(0, 2/fan_in))
- Noise injection in training (dropout, diffusion models)
- Variational Autoencoders: the latent space is modelled as a Gaussian
- Statistical tests on benchmark results

**Exponential distribution:** models time between events. Used in reinforcement learning for modelling reward delays.

## Softmax — Turning Logits Into Probabilities

The **softmax function** converts raw neural network outputs (logits) to a categorical probability distribution:
\`\`\`
softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)
\`\`\`

Properties:
- All outputs in (0,1)
- Outputs sum to 1
- Largest logit gets the highest probability (but not all of it)
- Differentiable everywhere (unlike argmax)

## Temperature Scaling — The API Parameter You Use Every Day

When you call the Anthropic API, the \`temperature\` parameter controls how "peaked" or "flat" the output distribution is:

\`\`\`
softmax_temp(zᵢ) = exp(zᵢ/T) / Σⱼ exp(zⱼ/T)
\`\`\`

| Temperature | Effect | Use case |
|-------------|--------|---------|
| T → 0 | Distribution collapses to argmax (greedy) | Factual Q&A, code generation |
| T = 0.7 | Slightly peaked — balanced | General use |
| T = 1.0 | Standard softmax | Creative writing |
| T > 1.5 | Very flat — high diversity | Brainstorming, random generation |

**Understanding temperature as probability distribution shaping is how you tune Claude's API calls correctly.** Asking Claude to write production code? Use temperature 0.1–0.3. Asking for creative story ideas? Use 0.9–1.2.

## Expectation and Variance

**Expectation E[X]:** the probability-weighted average of all outcomes
\`\`\`
E[X] = Σ xᵢ · P(X=xᵢ)   (discrete)
E[X] = ∫ x · f(x) dx      (continuous)
\`\`\`

**Variance Var[X]:** average squared deviation from the mean
\`\`\`
Var[X] = E[(X - E[X])²] = E[X²] - E[X]²
\`\`\`

In neural networks, controlling the variance of layer outputs (through batch norm, layer norm) prevents exploding/vanishing activations.`,
      keyTerms: [
        { term: 'Categorical Distribution', definition: 'A probability distribution over K discrete categories. The output of every language model at each generation step.' },
        { term: 'Softmax', definition: 'Function converting logits to a categorical distribution: softmax(zᵢ) = exp(zᵢ)/Σexp(zⱼ). Output layer of classifiers and LMs.' },
        { term: 'Temperature', definition: 'Scaling factor dividing logits before softmax. Low T → peaked (deterministic); high T → flat (creative). Key API parameter.' },
        { term: 'Gaussian Distribution', definition: 'Normal distribution N(μ,σ²). Used in weight initialisation, diffusion models, VAEs, and statistical tests.' },
        { term: 'Expectation', definition: 'The probability-weighted average of a random variable. Fundamental concept in loss function design and theoretical analysis.' },
      ],
    },
    {
      id: '6-3', number: '6.3',
      title: 'Maximum Likelihood and Model Evaluation',
      duration: 14,
      content: `# Maximum Likelihood and Model Evaluation

How do we know if a model is good? How do we define "good" mathematically? Maximum likelihood estimation provides the theoretical grounding for why we minimise cross-entropy, while statistical evaluation metrics tell us whether improvements are real or just noise.

## Maximum Likelihood Estimation (MLE)

Given observed data \`X = {x₁, x₂, ..., xₙ}\` and a model with parameters \`θ\`, we want to find the parameters that make the observed data most likely:

\`\`\`
θ* = argmax_θ P(X|θ) = argmax_θ Π P(xᵢ|θ)
\`\`\`

Taking the log (log-likelihood is easier to work with, and argmax is preserved):
\`\`\`
θ* = argmax_θ Σ log P(xᵢ|θ)
\`\`\`

**Maximising log-likelihood = minimising negative log-likelihood = minimising cross-entropy loss.**

This is the fundamental reason language models are trained with cross-entropy loss. MLE on a dataset of text asks: "what model parameters make this text most probable?" The model learns to assign high probability to real text — which means learning grammar, facts, reasoning patterns, and everything else in the training data.

## Perplexity — The LLM Evaluation Metric

**Perplexity** is the exponentiated average negative log-likelihood over a test set:
\`\`\`
Perplexity = exp(-1/n · Σ log P(xᵢ|x₁...xᵢ₋₁))
\`\`\`

Interpretation: a perplexity of K means the model is, on average, as confused as if it had K equally likely choices at each token.

| Model | Perplexity on WikiText-103 |
|-------|---------------------------|
| GPT-2 small | ~29 |
| GPT-3 | ~20 |
| GPT-4 class | ~5–8 |

Lower perplexity = better language model. But perplexity is an intrinsic metric — it does not always correlate with downstream task performance. A model with lower perplexity may still be worse at coding or reasoning.

## Classification Metrics

For AI tasks with categorical outputs:

**Accuracy:** fraction of correct predictions. Misleading when classes are imbalanced.

**Precision, Recall, F1:**
\`\`\`
Precision = TP / (TP + FP)    ← of predicted positives, how many are real?
Recall    = TP / (TP + FN)    ← of real positives, how many did we find?
F1        = 2 · (P·R)/(P+R)   ← harmonic mean balancing both
\`\`\`

**AI safety context:** In content moderation, you might tolerate low precision (many false positives → some good content blocked) to achieve high recall (few false negatives → little harmful content passes). The Recall/Precision tradeoff is a design decision with ethical implications.

**ROC-AUC:** Area Under the Receiver Operating Characteristic curve. Measures a classifier's ability to distinguish classes at all thresholds. AUC = 1.0 is perfect; AUC = 0.5 is random.

## Statistical Significance in AI Benchmarks

When model A achieves 73.2% on a benchmark and model B achieves 72.8%, is A actually better?

**Null hypothesis H₀:** the difference is due to chance
**p-value:** probability of seeing this difference if H₀ were true

Standard threshold: p < 0.05 (less than 5% chance it's random).

Many published AI benchmark improvements are not statistically significant — a major issue in the field. When reading papers, check if differences are tested for significance, especially on small test sets.

## Train / Validation / Test Split

The gold standard for honest evaluation:

\`\`\`
Training set (70–80%): model sees these — learns from them
Validation set (10–15%): tuning hyperparameters — model doesn't train on these
Test set (10–15%): final evaluation — NEVER looked at during development
\`\`\`

**Contamination:** if test data appears in training data, benchmark scores are inflated. This is a real problem for LLMs trained on internet data — popular benchmarks may be partially in the training corpus. Anthropic and other labs invest in **decontamination** pipelines.

## Cross-Validation

When data is scarce, k-fold cross-validation provides a more robust estimate:
1. Split data into k equal folds
2. Train on k-1 folds, evaluate on the remaining fold
3. Repeat k times, rotating the evaluation fold
4. Average results across k runs

Used in ML research but less common for LLMs due to training cost.`,
      keyTerms: [
        { term: 'Maximum Likelihood Estimation (MLE)', definition: 'Finding model parameters that maximise the probability of observed data. Equivalent to minimising cross-entropy loss.' },
        { term: 'Perplexity', definition: 'exp(-1/n · Σ log P(xᵢ|context)). Measures how well a language model predicts text. Lower is better.' },
        { term: 'Precision', definition: 'TP/(TP+FP). Of all positive predictions, what fraction are correct? Relevant when false positives are costly.' },
        { term: 'Recall', definition: 'TP/(TP+FN). Of all actual positives, what fraction did we catch? Relevant when false negatives are costly.' },
        { term: 'Benchmark Contamination', definition: 'When test data appears in training data, inflating scores. A major issue for LLMs trained on internet data.' },
      ],
    },
    {
      id: '6-4', number: '6.4',
      title: 'Information Theory — Entropy and KL Divergence',
      duration: 15,
      content: `# Information Theory — Entropy and KL Divergence

Information theory, developed by Claude Shannon in 1948, provides the mathematical language for reasoning about uncertainty, compression, and the cost of being wrong. It turns out that this language perfectly describes what language models are doing — and connects probability, loss functions, and model architecture in a unified framework.

## Shannon Entropy

**Entropy H(X)** measures the average surprise — or uncertainty — in a probability distribution:
\`\`\`
H(X) = -Σ P(x) log₂ P(x)
\`\`\`

Units are **bits** (using log₂) or **nats** (using ln).

Intuition:
- If one outcome is certain (P=1), entropy = 0 (no surprise, no information)
- If all outcomes equally likely, entropy is maximised (maximum uncertainty)

| Distribution | Entropy |
|---|---|
| Certain: P=(1,0,0,0) | 0 bits |
| 2 equally likely | 1 bit |
| 4 equally likely | 2 bits |
| 8 equally likely | 3 bits |

**Information theory in AI:** The entropy of the model's output distribution at each token position tells you how "confident" or "confused" the model is. High entropy → model is uncertain, many tokens are plausible. Low entropy → model is confident about the next token.

## Cross-Entropy — The Loss Function Explained

**Cross-entropy H(P, Q)** measures the average number of bits needed to represent samples from distribution P using a code optimised for distribution Q:
\`\`\`
H(P, Q) = -Σ P(x) log Q(x)
\`\`\`

Where:
- P is the **true distribution** (one-hot: the actual next token)
- Q is the **model's predicted distribution** (softmax output)

When P is one-hot (P(xₜ) = 1 for the true token, 0 for all others):
\`\`\`
H(P, Q) = -log Q(xₜ)     ← just the negative log prob of the correct token
\`\`\`

**This is exactly the cross-entropy loss used to train language models.** Minimising it means increasing the probability Q assigns to the correct token. Every training step is asking: "what did you predict, and by how much were you wrong?"

## KL Divergence — Measuring Distribution Distance

**KL Divergence** (Kullback-Leibler) measures how different distribution Q is from reference distribution P:
\`\`\`
KL(P ∥ Q) = Σ P(x) log(P(x)/Q(x)) = H(P,Q) - H(P)
\`\`\`

Properties:
- KL(P∥Q) ≥ 0 always (Gibbs' inequality)
- KL(P∥Q) = 0 iff P = Q
- **Not symmetric:** KL(P∥Q) ≠ KL(Q∥P)

## KL Divergence in RLHF

This is where information theory meets cutting-edge AI safety. In **Reinforcement Learning from Human Feedback** (Module 10), the model is fine-tuned to maximise a reward signal. But unconstrained optimisation would make the model "reward hack" — produce text that scores highly but is bizarre or useless.

The solution: penalise the model for diverging too far from the original pre-trained distribution:
\`\`\`
Objective = E[reward(response)] - β · KL(π_RL ∥ π_SFT)
\`\`\`

Where:
- \`π_RL\` = the RL-trained policy (current model)
- \`π_SFT\` = the supervised fine-tuned reference model
- \`β\` = KL penalty coefficient (typically 0.01–0.1)

**The KL penalty keeps Claude from drifting too far from its pre-trained knowledge** while still learning human preferences. This is a direct application of information theory in frontier AI safety research.

## Mutual Information — What Does X Tell Us About Y?

**Mutual Information I(X;Y)** measures how much knowing X reduces uncertainty about Y:
\`\`\`
I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)
\`\`\`

I(X;Y) = 0 → X and Y are independent (knowing X tells us nothing about Y)
I(X;Y) > 0 → X contains information about Y

Used in:
- **Feature selection:** which input features are most informative about the label?
- **Representation learning:** encouraging neural network layers to capture task-relevant information
- **Attention analysis:** measuring which input tokens are most informative for each output

## Compression and the Bits-per-Character Metric

Language models are implicit compression algorithms. A model assigning high probability to actual text is effectively compressing that text efficiently.

**Bits-per-character (BPC)** or **bits-per-byte (BPB)** normalises cross-entropy by sequence length:
\`\`\`
BPB = cross-entropy loss / log(2)       (converting nats to bits)
\`\`\`

A BPB of 1.0 means the model needs 1 bit per byte to encode text — equivalent to near-perfect compression. State-of-the-art LLMs achieve ~0.9 BPB on English text, outperforming dedicated compression algorithms.

## Connecting Everything

\`\`\`
Training objective: minimise cross-entropy H(P_true, P_model)
= minimise -Σ log P_model(correct_token)
= maximise log-likelihood (MLE from lesson 6.3)
= minimise bits needed to encode truth using model's beliefs
= make model's distribution close to the true data distribution
\`\`\`

Information theory, MLE, and gradient descent all point at the same thing: **make the model's probability distribution match reality as closely as possible.** That is, fundamentally, what training a language model means.`,
      keyTerms: [
        { term: 'Shannon Entropy', definition: 'H(X) = -Σ P(x)log P(x). Measures average uncertainty/surprise in a distribution. Zero for certain events; maximum for uniform.' },
        { term: 'Cross-Entropy Loss', definition: 'H(P,Q) = -Σ P(x)log Q(x). Measures the cost of using model distribution Q to encode samples from true distribution P. The standard LLM training loss.' },
        { term: 'KL Divergence', definition: 'KL(P∥Q) = Σ P(x)log(P(x)/Q(x)). Measures how different Q is from P. Used in RLHF to prevent the model from deviating too far from its prior.' },
        { term: 'Mutual Information', definition: 'I(X;Y): how much knowing X reduces uncertainty about Y. Used in feature selection and attention analysis.' },
        { term: 'Bits-per-Byte (BPB)', definition: 'Cross-entropy normalised per byte. Measures compression quality — state-of-the-art LLMs achieve ~0.9 BPB on English text.' },
      ],
    },
  ],
  quizzes: [
    {
      id: 'q6-1', title: 'Probability and Bayes',
      type: 'lesson', moduleId: 'm6', passMark: 70,
      questions: [
        {
          id: 'q6-1-1', type: 'multiple_choice',
          question: 'In language model generation, P(next_token | all_previous_tokens) is an example of:',
          options: ['Joint probability', 'Conditional probability', 'Marginal probability', 'Prior probability'],
          correctAnswer: 'Conditional probability',
          gradingRubric: 'Every generation step computes the probability of the next token conditioned on all previous tokens — this is exactly conditional probability P(A|B).',
          xpValue: 10,
        },
        {
          id: 'q6-1-2', type: 'multiple_choice',
          question: 'In Bayes\' theorem P(H|E) = P(E|H)·P(H)/P(E), what is P(H) called?',
          options: ['Likelihood', 'Prior', 'Posterior', 'Evidence'],
          correctAnswer: 'Prior',
          gradingRubric: 'P(H) is the prior — our belief about hypothesis H before observing any evidence E.',
          xpValue: 10,
        },
        {
          id: 'q6-1-3', type: 'practical',
          question: 'A disease affects 1% of the population. A test is 95% accurate (P(positive|disease)=0.95, P(positive|no disease)=0.05). If you test positive, what is the probability you have the disease?',
          correctAnswer: 'Approximately 16% (using Bayes: 0.95×0.01 / (0.95×0.01 + 0.05×0.99) ≈ 0.16)',
          gradingRubric: 'Counter-intuitively, even with a 95% accurate test, a positive result from a rare disease (1% prevalence) only means ~16% chance of having it. The low prior (1%) dominates.',
          xpValue: 25,
        },
        {
          id: 'q6-1-4', type: 'multiple_choice',
          question: 'The KL penalty in RLHF (β · KL(π_RL ∥ π_SFT)) serves to:',
          options: [
            'Increase the model\'s vocabulary',
            'Prevent the model from deviating too far from the pre-trained distribution',
            'Speed up training convergence',
            'Reduce the learning rate automatically',
          ],
          correctAnswer: 'Prevent the model from deviating too far from the pre-trained distribution',
          gradingRubric: 'Without the KL penalty, RL fine-tuning would reward hack — producing bizarre outputs that score high on the reward model. The KL penalty keeps the model grounded in its pre-trained knowledge.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q6-2', title: 'Probability Distributions and Softmax',
      type: 'lesson', moduleId: 'm6', passMark: 70,
      questions: [
        {
          id: 'q6-2-1', type: 'multiple_choice',
          question: 'The output distribution of a language model at each generation step follows a:',
          options: ['Gaussian distribution', 'Binomial distribution', 'Categorical distribution', 'Uniform distribution'],
          correctAnswer: 'Categorical distribution',
          gradingRubric: 'At each step, the LM outputs probabilities over all vocabulary tokens — a probability distribution over K discrete categories, which is the categorical distribution.',
          xpValue: 10,
        },
        {
          id: 'q6-2-2', type: 'multiple_choice',
          question: 'Setting temperature = 0.1 when calling the Claude API will:',
          options: [
            'Make outputs more creative and diverse',
            'Make outputs more deterministic and focused (near-greedy sampling)',
            'Have no effect on generation',
            'Double the context window',
          ],
          correctAnswer: 'Make outputs more deterministic and focused (near-greedy sampling)',
          gradingRubric: 'Low temperature sharpens the softmax distribution toward a single token. T→0 approaches greedy decoding (always pick the highest-probability token).',
          xpValue: 10,
        },
        {
          id: 'q6-2-3', type: 'short_answer',
          question: 'Why does softmax use exp(z) rather than just the raw logits z?',
          correctAnswer: 'exp(z) ensures all outputs are positive and the sum can equal 1, making a valid probability distribution',
          gradingRubric: 'Raw logits can be negative. exp(z) maps any real number to (0,∞), allowing normalisation to probabilities. It also amplifies differences between logits, making the distribution peaked.',
          xpValue: 15,
        },
        {
          id: 'q6-2-4', type: 'multiple_choice',
          question: 'The Gaussian distribution is used in He/Kaiming weight initialisation because:',
          options: [
            'It produces integer weights',
            'It is the simplest distribution to implement',
            'The Central Limit Theorem implies layer outputs will be approximately Gaussian, controlling activation variance',
            'It maximises training speed',
          ],
          correctAnswer: 'The Central Limit Theorem implies layer outputs will be approximately Gaussian, controlling activation variance',
          gradingRubric: 'Initialising weights from N(0, 2/fan_in) ensures that the variance of each layer\'s output stays controlled — preventing the cascading explosion/vanishing of activations through deep networks.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q6-3', title: 'MLE and Model Evaluation',
      type: 'lesson', moduleId: 'm6', passMark: 70,
      questions: [
        {
          id: 'q6-3-1', type: 'multiple_choice',
          question: 'Maximising log-likelihood during LLM training is mathematically equivalent to:',
          options: [
            'Maximising accuracy on a validation set',
            'Minimising cross-entropy loss',
            'Minimising the learning rate',
            'Maximising KL divergence from the prior',
          ],
          correctAnswer: 'Minimising cross-entropy loss',
          gradingRubric: 'argmax Σ log P(xᵢ|θ) = argmin -Σ log P(xᵢ|θ) = argmin cross-entropy. All three formulations describe the same optimisation problem.',
          xpValue: 15,
        },
        {
          id: 'q6-3-2', type: 'multiple_choice',
          question: 'A language model\'s perplexity of 8 means:',
          options: [
            'The model makes 8 errors per sentence',
            'The model uses 8 bits per token',
            'The model is as confused as if choosing uniformly among 8 equally likely tokens at each step',
            'The model achieves 8% accuracy',
          ],
          correctAnswer: 'The model is as confused as if choosing uniformly among 8 equally likely tokens at each step',
          gradingRubric: 'Perplexity is the branching factor of a uniform distribution with equivalent uncertainty. Perplexity 8 = the average uncertainty equals having 8 equally plausible options.',
          xpValue: 10,
        },
        {
          id: 'q6-3-3', type: 'practical',
          question: 'You\'re building a hate speech detector. Would you optimise for precision or recall? Justify your answer.',
          correctAnswer: 'Recall — missing hate speech (false negative) is worse than occasionally flagging benign content (false positive)',
          gradingRubric: 'In safety-critical content moderation, failing to catch harmful content (low recall) is riskier than occasionally flagging innocent posts (low precision). The ethical stakes drive the metric choice.',
          xpValue: 20,
        },
        {
          id: 'q6-3-4', type: 'multiple_choice',
          question: 'Benchmark contamination in LLMs occurs when:',
          options: [
            'The model is trained on data similar to the test set',
            'Two models are evaluated on different benchmarks',
            'The test data appeared in the training corpus, inflating scores',
            'The benchmark uses too many questions',
          ],
          correctAnswer: 'The test data appeared in the training corpus, inflating scores',
          gradingRubric: 'If a benchmark\'s test questions were in the training data, the model may have memorised answers — making scores higher than actual capability. A major source of misleading reported performance.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q6-4', title: 'Information Theory',
      type: 'lesson', moduleId: 'm6', passMark: 70,
      questions: [
        {
          id: 'q6-4-1', type: 'multiple_choice',
          question: 'Shannon entropy H(X) = 0 when:',
          options: [
            'All outcomes are equally likely',
            'One outcome has probability 1 (no uncertainty)',
            'The distribution has many possible values',
            'The variable X is continuous',
          ],
          correctAnswer: 'One outcome has probability 1 (no uncertainty)',
          gradingRubric: 'H(X) = -1·log(1) - 0·log(0) = 0. When one outcome is certain, there is zero surprise and zero entropy.',
          xpValue: 10,
        },
        {
          id: 'q6-4-2', type: 'multiple_choice',
          question: 'The cross-entropy loss for language models simplifies to -log Q(xₜ) because:',
          options: [
            'The softmax function eliminates other terms',
            'The true distribution P is one-hot: only the correct token has probability 1',
            'We use log base 2 rather than natural log',
            'Gradients for other tokens cancel out',
          ],
          correctAnswer: 'The true distribution P is one-hot: only the correct token has probability 1',
          gradingRubric: 'H(P,Q) = -Σ P(x)log Q(x). Since P is one-hot, only the true token xₜ has P(xₜ)=1; all other terms vanish, leaving -log Q(xₜ).',
          xpValue: 15,
        },
        {
          id: 'q6-4-3', type: 'multiple_choice',
          question: 'KL Divergence KL(P∥Q) = 0 if and only if:',
          options: [
            'P and Q have the same mean',
            'P and Q are identical distributions',
            'Q assigns higher probability to all events than P',
            'Both distributions are uniform',
          ],
          correctAnswer: 'P and Q are identical distributions',
          gradingRubric: 'KL(P∥Q) = 0 ⟺ P(x) = Q(x) for all x. Any difference between the distributions, however small, produces positive KL divergence.',
          xpValue: 10,
        },
        {
          id: 'q6-4-4', type: 'practical',
          question: 'Explain why training a language model with cross-entropy loss is equivalent to compression.',
          correctAnswer: 'A model assigning higher probability to actual text needs fewer bits to encode it — low cross-entropy = efficient compression = model has learned true structure of the data',
          gradingRubric: 'Shannon showed that optimal coding assigns -log P(x) bits to outcome x. A model with low cross-entropy assigns high P to real text, so encoding real text is cheap — the model has learned to predict the data well.',
          xpValue: 25,
        },
      ],
    },
  ],
  project: {
    id: 'p6', moduleId: 'm6',
    name: 'Probability Explorer',
    emoji: '🎲',
    description: 'Build an interactive dashboard visualising probability distributions and information theory concepts. Include a live softmax temperature slider showing how temperature reshapes token distributions, an entropy calculator, and a Bayes\' theorem interactive example.',
    tools: ['React', 'D3.js or Recharts', 'Tailwind CSS', 'Custom probability computations'],
    status: 'not_started',
    rubric: [
      'Interactive Gaussian and Categorical distribution plots with adjustable mean, variance, and category count',
      'Softmax temperature slider (0.01–2.0) showing how distribution sharpness changes in real-time with labelled chart',
      'Bayes\' theorem calculator with visual prior/posterior update showing the belief shift as a bar chart',
      'Entropy and cross-entropy values updating live as distribution parameters change',
      'Clean, labelled visualisations following the Stark Academy dark design system',
    ],
    xpReward: 280,
  },
  finalExam: {
    id: 'arc1-final',
    title: 'Arc 1 Final Exam — CS & Mathematics Foundations',
    type: 'arc_final',
    moduleId: 'm6',
    passMark: 70,
    questions: [
      // Module 1: Binary
      {
        id: 'arc1-f-1', type: 'multiple_choice',
        question: 'Convert the binary number 10110101 to decimal.',
        options: ['169', '181', '197', '213'],
        correctAnswer: '181',
        gradingRubric: '128+0+32+16+0+4+0+1 = 181. Positions (from right): 2⁷+2⁵+2⁴+2²+2⁰ = 128+32+16+4+1 = 181.',
        xpValue: 20,
      },
      {
        id: 'arc1-f-2', type: 'multiple_choice',
        question: 'Why are neural network weights stored in FP16 (half-precision) rather than FP32 during inference?',
        options: [
          'FP16 is more accurate for small numbers',
          'FP16 uses half the memory, allowing larger models or faster inference',
          'FP16 avoids numerical overflow',
          'FP32 is not supported on GPUs',
        ],
        correctAnswer: 'FP16 uses half the memory, allowing larger models or faster inference',
        gradingRubric: 'FP16 requires 2 bytes vs FP32\'s 4 bytes per weight. A 70B parameter model in FP32 needs 280GB; in FP16 it fits in 140GB. Slight precision loss is acceptable for inference.',
        xpValue: 20,
      },
      // Module 2: Algorithms
      {
        id: 'arc1-f-3', type: 'multiple_choice',
        question: 'The attention mechanism in Transformers has time complexity O(n²) where n is sequence length. This means doubling the context window:',
        options: [
          'Doubles attention computation',
          'Triples attention computation',
          'Quadruples attention computation',
          'Has no effect on computation',
        ],
        correctAnswer: 'Quadruples attention computation',
        gradingRubric: 'O(n²): if n doubles, n² quadruples. A 4K context window requires 4× more attention compute than 2K. This is why long-context models are expensive and why linear attention is an active research area.',
        xpValue: 20,
      },
      {
        id: 'arc1-f-4', type: 'multiple_choice',
        question: 'A hash table lookup is O(1) average case. What data structure does this make it ideal for?',
        options: [
          'Sorted data requiring binary search',
          'Key-value caches like KV-cache in Transformer inference',
          'Hierarchical data like syntax trees',
          'Time-series data requiring ordered traversal',
        ],
        correctAnswer: 'Key-value caches like KV-cache in Transformer inference',
        gradingRubric: 'The KV-cache stores key and value tensors indexed by token position. O(1) lookup per cached position is why KV-caching dramatically speeds up autoregressive generation.',
        xpValue: 20,
      },
      // Module 3: Networking
      {
        id: 'arc1-f-5', type: 'multiple_choice',
        question: 'The Anthropic API uses Server-Sent Events (SSE) for streaming because:',
        options: [
          'SSE is faster than TCP for large payloads',
          'SSE allows the server to push tokens as they are generated without waiting for the full response',
          'WebSockets cannot handle text data',
          'REST APIs cannot handle streaming',
        ],
        correctAnswer: 'SSE allows the server to push tokens as they are generated without waiting for the full response',
        gradingRubric: 'Autoregressive generation produces one token at a time. SSE streams each token immediately via a persistent HTTP connection, giving users visible progress rather than waiting seconds for the full response.',
        xpValue: 20,
      },
      {
        id: 'arc1-f-6', type: 'short_answer',
        question: 'What HTTP status code indicates that a REST API request was rate-limited, and how should a well-written client handle it?',
        correctAnswer: '429 Too Many Requests — the client should implement exponential backoff: wait, retry, wait longer, retry, up to a maximum number of attempts',
        gradingRubric: 'Rate limiting (429) means the client has exceeded API quota. Exponential backoff (1s, 2s, 4s, 8s...) prevents thundering herd problems while respecting server capacity limits.',
        xpValue: 25,
      },
      // Module 4: Linear Algebra
      {
        id: 'arc1-f-7', type: 'multiple_choice',
        question: 'In a Transformer, the attention score between query q and key k is computed as qᵀk / √d_k. Why the √d_k denominator?',
        options: [
          'To normalise keys to unit length',
          'To prevent dot products from growing large in high dimensions, keeping softmax in a sensitive gradient region',
          'To ensure attention weights sum to 1',
          'To reduce memory usage during training',
        ],
        correctAnswer: 'To prevent dot products from growing large in high dimensions, keeping softmax in a sensitive gradient region',
        gradingRubric: 'With d_k-dimensional vectors, random dot products have variance d_k. Dividing by √d_k normalises variance to 1, preventing very large values that push softmax into near-zero gradient regions.',
        xpValue: 20,
      },
      {
        id: 'arc1-f-8', type: 'multiple_choice',
        question: 'Word embeddings place semantically similar words close together in vector space. This means the cosine similarity between "king" and "queen" should be:',
        options: ['Close to -1 (opposite directions)', 'Close to 0 (orthogonal)', 'Close to 1 (similar direction)', 'Exactly 0.5'],
        correctAnswer: 'Close to 1 (similar direction)',
        gradingRubric: 'Semantically related words have similar embedding vectors — they point in similar directions in high-dimensional space. Cosine similarity near 1 indicates high semantic relatedness.',
        xpValue: 15,
      },
      // Module 5: Calculus
      {
        id: 'arc1-f-9', type: 'multiple_choice',
        question: 'Backpropagation computes gradients for a network with N parameters using:',
        options: [
          'N forward passes (one per parameter)',
          'N² operations due to pairwise interactions',
          'One forward pass + one backward pass regardless of N',
          '2N passes for stability',
        ],
        correctAnswer: 'One forward pass + one backward pass regardless of N',
        gradingRubric: 'This is backprop\'s key efficiency: by propagating gradients backward through the computational graph using the chain rule, all N gradients are computed simultaneously in roughly 2-3× the cost of a single forward pass.',
        xpValue: 20,
      },
      {
        id: 'arc1-f-10', type: 'multiple_choice',
        question: 'AdamW is preferred over Adam for LLM training because:',
        options: [
          'AdamW uses a larger learning rate by default',
          'AdamW has decoupled weight decay that regularises weights correctly without distorting gradient scaling',
          'AdamW requires fewer hyperparameters',
          'AdamW is faster to compute than Adam',
        ],
        correctAnswer: 'AdamW has decoupled weight decay that regularises weights correctly without distorting gradient scaling',
        gradingRubric: 'In Adam, L2 regularisation is added to gradients — but gradient scaling then diminishes its effect. AdamW applies weight decay directly to weights, ensuring consistent regularisation across all parameters.',
        xpValue: 20,
      },
      // Module 6: Probability
      {
        id: 'arc1-f-11', type: 'multiple_choice',
        question: 'Shannon entropy H(X) is maximised when:',
        options: [
          'One outcome has probability 1',
          'All outcomes are equally probable',
          'The distribution is Gaussian',
          'Variance is minimised',
        ],
        correctAnswer: 'All outcomes are equally probable',
        gradingRubric: 'Maximum entropy corresponds to maximum uncertainty — a uniform distribution where every outcome is equally surprising. This is why high temperature creates high-entropy (diverse, unpredictable) model outputs.',
        xpValue: 15,
      },
      {
        id: 'arc1-f-12', type: 'multiple_choice',
        question: 'Training a language model by minimising cross-entropy loss is equivalent to:',
        options: [
          'Minimising KL divergence from a Gaussian prior',
          'Maximum likelihood estimation of model parameters on the training data',
          'Minimising the Euclidean distance between logits and labels',
          'Maximising the entropy of the output distribution',
        ],
        correctAnswer: 'Maximum likelihood estimation of model parameters on the training data',
        gradingRubric: 'Minimising -Σ log P(xᵢ|θ) is equivalent to maximising Σ log P(xᵢ|θ) — the log-likelihood. MLE and cross-entropy minimisation are mathematically identical objectives.',
        xpValue: 20,
      },
      {
        id: 'arc1-f-13', type: 'multiple_choice',
        question: 'In RLHF, the KL penalty β·KL(π_RL ∥ π_SFT) is added to the objective because:',
        options: [
          'It increases training speed',
          'Unconstrained RL would cause reward hacking — drifting far from pre-trained knowledge',
          'It prevents the model from using too many tokens',
          'It enforces a minimum perplexity threshold',
        ],
        correctAnswer: 'Unconstrained RL would cause reward hacking — drifting far from pre-trained knowledge',
        gradingRubric: 'Without the KL constraint, RL optimisation would exploit the reward model with degenerate outputs. The KL penalty keeps the policy close to the SFT baseline, balancing helpfulness with coherence.',
        xpValue: 20,
      },
      {
        id: 'arc1-f-14', type: 'practical',
        question: 'You have a dataset of 10,000 examples. Design an honest evaluation split and explain why you chose it.',
        correctAnswer: 'Train: 8000, Validation: 1000, Test: 1000 (80/10/10). Keep test set completely held out until final evaluation. Use validation for hyperparameter tuning only. Never look at test set during development.',
        gradingRubric: 'The test set must stay completely unseen during development to provide an unbiased final estimate. Using it for hyperparameter tuning (even once) contaminates it — the score will be optimistically biased.',
        xpValue: 30,
      },
      {
        id: 'arc1-f-15', type: 'practical',
        question: 'A colleague says "our new model gets 85% on the benchmark — it beats the previous 84.2%!" What statistical question should you ask before celebrating?',
        correctAnswer: 'Is the difference statistically significant? With a small test set, a 0.8% difference could easily be within noise. Ask for confidence intervals or a significance test (p-value).',
        gradingRubric: 'Many published improvements are within statistical noise. A 0.8% difference on a 500-question benchmark (4 questions) is not reliable. Require significance tests and larger test sets before drawing conclusions.',
        xpValue: 30,
      },
    ],
  },
}

export const arc1Modules: Module[] = [m1, m2, m3, m4, m5, m6]



