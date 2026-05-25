import type { Module } from '@/types'

function makeStub(id: string, number: number, title: string, prereq?: string): Module {
  return {
    id, number, title, arc: 5,
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

// ─── MODULE 21 ────────────────────────────────────────────────────────────────
const m21: Module = {
  id: 'm21', number: 21, arc: 5,
  title: 'MCP and Advanced Agent Architecture',
  description: 'A deep technical dive into the Model Context Protocol and the architectural patterns that make complex agent systems reliable at scale — hierarchical orchestration, multi-agent coordination, parallel execution, and the observability tools needed to debug systems you can\'t fully predict.',
  prerequisiteModuleId: 'm20',
  lessons: [
    {
      id: '21-1', number: '21.1',
      title: 'MCP Deep Dive — Building Production Servers',
      duration: 18,
      content: `# MCP Deep Dive — Building Production Servers

Module 14 introduced MCP conceptually. This lesson goes deep on the protocol mechanics — transport layers, lifecycle, authentication, and the full implementation of a production-grade MCP server with all three primitives.

## Protocol Architecture

MCP uses a client-server model over two transport mechanisms:

**stdio (Standard I/O)** — process-based, used for local tools. The MCP host spawns the server as a subprocess and communicates via stdin/stdout. Simple, secure, no network exposure.

**SSE (Server-Sent Events)** — HTTP-based, used for remote servers. The server exposes an HTTP endpoint; the client maintains a persistent connection receiving events. Required for network-accessible MCP servers.

\`\`\`
MCP Host (Claude Code / Claude Desktop)
    ↕ stdio or SSE
MCP Server (your code)
    ↕ arbitrary integrations
External Systems (databases, APIs, filesystems)
\`\`\`

## Complete MCP Server Implementation

\`\`\`typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const server = new Server(
  { name: 'maritime-research-server', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
)

// ── TOOLS ─────────────────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_shipwrecks',
      description: 'Search the maritime archaeology database for shipwrecks by location, period, or vessel type',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          period: { type: 'string', description: 'Historical period (e.g., "19th century")' },
          location: { type: 'string', description: 'Geographic location or region' },
          maxResults: { type: 'number', description: 'Maximum results (default 10)' },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_dive_conditions',
      description: 'Get current dive conditions for a location (visibility, currents, weather)',
      inputSchema: {
        type: 'object',
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' },
        },
        required: ['latitude', 'longitude'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'search_shipwrecks') {
    const results = await searchDatabase(args as SearchParams)
    return {
      content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
    }
  }

  if (name === 'get_dive_conditions') {
    const conditions = await fetchMarineWeather(args.latitude, args.longitude)
    return {
      content: [{ type: 'text', text: JSON.stringify(conditions, null, 2) }],
    }
  }

  throw new Error(\`Unknown tool: \${name}\`)
})

// ── RESOURCES ─────────────────────────────────────────────────────────────────
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'maritime://regulations/current',
      name: 'Current Maritime Regulations',
      description: 'Up-to-date dive and salvage regulations by jurisdiction',
      mimeType: 'text/markdown',
    },
    {
      uri: 'maritime://sites/{siteId}',
      name: 'Site Documentation',
      description: 'Detailed documentation for a specific archaeological site',
      mimeType: 'application/json',
    },
  ],
}))

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params

  if (uri === 'maritime://regulations/current') {
    const regs = await loadRegulations()
    return { contents: [{ uri, mimeType: 'text/markdown', text: regs }] }
  }

  const siteMatch = uri.match(/^maritime:\\/\\/sites\\/(.+)$/)
  if (siteMatch) {
    const site = await loadSite(siteMatch[1])
    return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(site) }] }
  }

  throw new Error(\`Unknown resource: \${uri}\`)
})

// ── PROMPTS ───────────────────────────────────────────────────────────────────
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: 'site_report',
      description: 'Generate a professional archaeological site report',
      arguments: [
        { name: 'siteId', description: 'Site identifier', required: true },
        { name: 'audience', description: 'Target audience (academic/public/regulatory)', required: false },
      ],
    },
  ],
}))

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'site_report') {
    const site = await loadSite(args?.siteId || '')
    return {
      description: 'Generate site report',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: \`Generate a professional archaeological site report for:

Site: \${JSON.stringify(site, null, 2)}
Audience: \${args?.audience || 'academic'}

Include: site overview, historical context, finds summary, conservation status, research recommendations.\`,
          },
        },
      ],
    }
  }

  throw new Error(\`Unknown prompt: \${name}\`)
})

// ── START ─────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Maritime Research MCP Server running on stdio')
}

main().catch(console.error)
\`\`\`

## MCP Server Lifecycle

\`\`\`
1. Host spawns server process (stdio) or connects to HTTP endpoint (SSE)
2. Handshake: host sends initialize request with capabilities
3. Server responds with its capabilities (which primitives it supports)
4. Host calls list_tools / list_resources / list_prompts to discover available items
5. During conversation: host calls tool/read_resource/get_prompt as needed
6. Host sends shutdown request → server cleans up → process exits
\`\`\`

## Authentication for Remote MCP Servers

For SSE-based servers, authentication matters:

\`\`\`typescript
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import express from 'express'

const app = express()

// Bearer token authentication middleware
app.use('/mcp', (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication' })
  }
  const token = auth.slice(7)
  if (token !== process.env.MCP_SECRET_TOKEN) {
    return res.status(403).json({ error: 'Invalid token' })
  }
  next()
})

app.get('/mcp/sse', async (req, res) => {
  const transport = new SSEServerTransport('/mcp/messages', res)
  await server.connect(transport)
})

app.post('/mcp/messages', async (req, res) => {
  // handle incoming messages
})
\`\`\`

## The MCP Ecosystem

Key production-ready MCP servers available:
- **@modelcontextprotocol/server-filesystem** — file operations with configurable root
- **@modelcontextprotocol/server-github** — GitHub API (issues, PRs, code search)
- **@modelcontextprotocol/server-postgres** — PostgreSQL query and schema access
- **@modelcontextprotocol/server-puppeteer** — browser automation
- **@modelcontextprotocol/server-slack** — Slack messaging and channel access
- **@modelcontextprotocol/server-google-maps** — location and mapping

These can be composed — an agent using 5 MCP servers simultaneously has access to all their tools.`,
      keyTerms: ['MCP server', 'stdio transport', 'SSE transport', 'tools', 'resources', 'prompts', 'lifecycle', 'MCP authentication'],
    },
    {
      id: '21-2', number: '21.2',
      title: 'Advanced Agent Patterns — Orchestration and Hierarchy',
      duration: 17,
      content: `# Advanced Agent Patterns — Orchestration and Hierarchy

Single-agent systems have a ceiling. They're limited by context window size, can't specialise deeply across multiple domains, and become brittle as task complexity grows. Hierarchical and multi-agent architectures break through these limits — at the cost of coordination complexity.

## The Orchestrator-Subagent Pattern

The most common multi-agent architecture. A top-level orchestrator agent plans and delegates; specialised subagents execute:

\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// Subagent: specialised research agent
async function researchAgent(topic: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: \`You are a research specialist. Your job is to thoroughly research
    topics and produce structured summaries with citations. Focus on accuracy
    and source quality. Do not editorialize — report what sources say.\`,
    tools: [webSearchTool, fetchUrlTool],
    messages: [{ role: 'user', content: \`Research: \${topic}\` }]
  })
  return extractFinalText(response)
}

// Subagent: specialised writing agent
async function writingAgent(brief: string, research: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: \`You are a professional writer. You receive a brief and research,
    and produce polished, well-structured prose. Match the tone and format
    specified in the brief. Integrate all relevant research naturally.\`,
    messages: [{ role: 'user', content: \`Brief: \${brief}\n\nResearch:\n\${research}\` }]
  })
  return extractFinalText(response)
}

// Orchestrator: plans, delegates, synthesises
async function orchestratorAgent(userTask: string): Promise<string> {
  // Step 1: Plan the task
  const plan = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: \`You are a task orchestrator. Break the user's task into subtasks
    that can be delegated to specialist agents. Output a JSON plan.\`,
    messages: [{ role: 'user', content: userTask }]
  })

  const taskPlan = JSON.parse(extractFinalText(plan))

  // Step 2: Execute each subtask (some in parallel, some sequential)
  const researchResults = await Promise.all(
    taskPlan.researchTopics.map((topic: string) => researchAgent(topic))
  )

  // Step 3: Synthesise and delegate writing
  const combinedResearch = researchResults.join('\n\n---\n\n')
  const finalOutput = await writingAgent(taskPlan.writingBrief, combinedResearch)

  return finalOutput
}
\`\`\`

## Agent-as-Tool Pattern

The most elegant composition approach: expose entire agents as tools that other agents can call. The orchestrator doesn't need to know the agent's implementation — just its interface.

\`\`\`typescript
// Define agents as tool definitions
const agentTools = [
  {
    name: 'research_specialist',
    description: \`Conducts deep research on any topic. Searches the web,
    synthesises multiple sources, and returns a structured summary.
    Use when you need factual information about a topic.\`,
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'What to research' },
        depth: { type: 'string', enum: ['quick', 'thorough'], description: 'Research depth' },
      },
      required: ['topic'],
    },
  },
  {
    name: 'code_specialist',
    description: \`Writes, reviews, and debugs code. Handles implementation tasks.
    Returns working code with explanation.\`,
    input_schema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'What code to write or fix' },
        language: { type: 'string', description: 'Programming language' },
        context: { type: 'string', description: 'Existing code context if any' },
      },
      required: ['task'],
    },
  },
]

// Tool handler dispatches to the appropriate agent
async function handleAgentTool(toolName: string, toolInput: Record<string, string>) {
  if (toolName === 'research_specialist') {
    return researchAgent(toolInput.topic)
  }
  if (toolName === 'code_specialist') {
    return codeAgent(toolInput.task, toolInput.language, toolInput.context)
  }
  throw new Error(\`Unknown agent tool: \${toolName}\`)
}
\`\`\`

## Parallel Agent Execution

Some tasks are embarrassingly parallel — use Promise.all aggressively:

\`\`\`typescript
async function parallelResearch(topics: string[]): Promise<Record<string, string>> {
  // All research agents run concurrently
  const results = await Promise.all(
    topics.map(async (topic) => ({
      topic,
      result: await researchAgent(topic),
    }))
  )

  return Object.fromEntries(results.map(({ topic, result }) => [topic, result]))
}

// With concurrency limiting (avoid hitting rate limits)
async function parallelWithLimit<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []

  for (const task of tasks) {
    const p = task().then(result => { results.push(result) })
    executing.push(p)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(executing.findIndex(e => e === p), 1)
    }
  }

  await Promise.all(executing)
  return results
}

// Use: max 5 concurrent agents (respect rate limits)
const results = await parallelWithLimit(
  topics.map(topic => () => researchAgent(topic)),
  5
)
\`\`\`

## Agent State Machines

Long-running agents benefit from explicit state machine design. Define states, transitions, and checkpoints:

\`\`\`typescript
type AgentState =
  | 'planning'
  | 'researching'
  | 'writing'
  | 'reviewing'
  | 'complete'
  | 'failed'

interface AgentCheckpoint {
  state: AgentState
  completedSteps: string[]
  artifacts: Record<string, string>
  timestamp: string
}

class StatefulAgent {
  private checkpoint: AgentCheckpoint = {
    state: 'planning',
    completedSteps: [],
    artifacts: {},
    timestamp: new Date().toISOString(),
  }

  async run(task: string): Promise<string> {
    while (this.checkpoint.state !== 'complete' && this.checkpoint.state !== 'failed') {
      await this.saveCheckpoint()  // persist before each step
      await this.step(task)
    }

    return this.checkpoint.artifacts.finalOutput || 'Task failed'
  }

  private async step(task: string): Promise<void> {
    switch (this.checkpoint.state) {
      case 'planning':
        this.checkpoint.artifacts.plan = await this.plan(task)
        this.checkpoint.state = 'researching'
        break
      case 'researching':
        this.checkpoint.artifacts.research = await this.research(this.checkpoint.artifacts.plan)
        this.checkpoint.state = 'writing'
        break
      case 'writing':
        this.checkpoint.artifacts.draft = await this.write(this.checkpoint.artifacts.research)
        this.checkpoint.state = 'reviewing'
        break
      case 'reviewing':
        this.checkpoint.artifacts.finalOutput = await this.review(this.checkpoint.artifacts.draft)
        this.checkpoint.state = 'complete'
        break
    }
    this.checkpoint.completedSteps.push(this.checkpoint.state)
  }

  private async saveCheckpoint(): Promise<void> {
    this.checkpoint.timestamp = new Date().toISOString()
    await fs.writeFile('agent-checkpoint.json', JSON.stringify(this.checkpoint, null, 2))
  }

  // Can resume from checkpoint after interruption
  static async resume(checkpointPath: string, task: string): Promise<string> {
    const agent = new StatefulAgent()
    agent.checkpoint = JSON.parse(await fs.readFile(checkpointPath, 'utf-8'))
    return agent.run(task)
  }
}
\`\`\`

Checkpointing is essential for long-running agents: if the process crashes or an API call fails after 45 minutes of work, you can resume from the last checkpoint rather than starting over.`,
      keyTerms: ['orchestrator', 'subagent', 'agent-as-tool', 'parallel execution', 'state machine', 'checkpoint', 'hierarchical agents'],
    },
    {
      id: '21-3', number: '21.3',
      title: 'Multi-Agent Systems — Coordination and Communication',
      duration: 16,
      content: `# Multi-Agent Systems — Coordination and Communication

Beyond orchestrator-subagent, more sophisticated multi-agent systems have agents that communicate laterally, share state, and collaborate without a single central coordinator. These systems are powerful but introduce coordination challenges that require careful design.

## Why Multi-Agent?

**Parallelism:** multiple agents working simultaneously on independent subtasks

**Specialisation:** agents can have different system prompts, tools, and even different models tuned to their role

**Scalability:** the bottleneck of a single agent's context window doesn't limit the whole system

**Redundancy:** multiple agents can independently attempt the same task; majority vote or verification improves reliability

**Division of cognitive labour:** some tasks genuinely benefit from having a "proposer" and a "critic" as separate agents

## The Shared Memory Pattern

Agents coordinate by reading and writing to a shared state store:

\`\`\`typescript
interface SharedAgentState {
  task: string
  phase: 'research' | 'synthesis' | 'review' | 'done'
  findings: Array<{ agentId: string; topic: string; content: string; timestamp: string }>
  decisions: Array<{ decision: string; rationale: string; madeBy: string }>
  messages: Array<{ from: string; to: string; content: string }>
}

class SharedStateStore {
  private state: SharedAgentState
  private locks: Set<string> = new Set()

  async read(): Promise<SharedAgentState> {
    return JSON.parse(JSON.stringify(this.state))  // deep copy
  }

  async writeFindings(agentId: string, topic: string, content: string): Promise<void> {
    this.state.findings.push({ agentId, topic, content, timestamp: new Date().toISOString() })
    await this.persist()
  }

  async sendMessage(from: string, to: string, content: string): Promise<void> {
    this.state.messages.push({ from, to, content })
    await this.persist()
  }

  private async persist(): Promise<void> {
    await fs.writeFile('shared-state.json', JSON.stringify(this.state, null, 2))
  }
}

// Agent reads shared state to understand current context
async function collaborativeAgent(agentId: string, store: SharedStateStore): Promise<void> {
  const state = await store.read()
  const myMessages = state.messages.filter(m => m.to === agentId)
  const otherFindings = state.findings.filter(f => f.agentId !== agentId)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: \`You are agent \${agentId} in a collaborative research team.\`,
    messages: [{
      role: 'user',
      content: \`
Current task: \${state.task}
Other agents have found:
\${otherFindings.map(f => \`[\${f.agentId}] \${f.topic}: \${f.content}\`).join('\n')}
Messages to you: \${myMessages.map(m => \`[\${m.from}]: \${m.content}\`).join('\n')}

Based on what others have found, what unique angle can you contribute?
      \`
    }]
  })

  const finding = extractFinalText(response)
  await store.writeFindings(agentId, 'contribution', finding)
}
\`\`\`

## Debate and Verification Patterns

Some tasks benefit from having agents argue opposing positions and a judge agent evaluate:

\`\`\`typescript
async function debatePattern(proposition: string): Promise<string> {
  // Proposer argues FOR
  const [proArgument, conArgument] = await Promise.all([
    client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: 'You are a strong advocate. Build the best possible case FOR the proposition.',
      messages: [{ role: 'user', content: proposition }]
    }),
    // Critic argues AGAINST
    client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: 'You are a rigorous skeptic. Build the strongest case AGAINST the proposition.',
      messages: [{ role: 'user', content: proposition }]
    })
  ])

  // Judge evaluates both sides
  const judgment = await client.messages.create({
    model: 'claude-opus-4-20250514',  // use strongest model for judgment
    max_tokens: 1024,
    system: 'You are an impartial judge. Evaluate both arguments and reach a considered verdict.',
    messages: [{
      role: 'user',
      content: \`Proposition: \${proposition}

FOR: \${extractFinalText(proArgument)}
AGAINST: \${extractFinalText(conArgument)}

Evaluate both arguments. What is your verdict and why?\`
    }]
  })

  return extractFinalText(judgment)
}
\`\`\`

## Conflict Resolution

When multiple agents produce conflicting outputs, you need a resolution strategy:

\`\`\`typescript
type ConflictResolutionStrategy = 'majority_vote' | 'highest_confidence' | 'judge_agent' | 'human_escalation'

async function resolveConflict(
  outputs: Array<{ agentId: string; output: string; confidence?: number }>,
  strategy: ConflictResolutionStrategy
): Promise<string> {
  switch (strategy) {
    case 'majority_vote': {
      // Cluster similar outputs, return largest cluster's representative
      const clusters = clusterSimilarOutputs(outputs)
      const largest = clusters.sort((a, b) => b.length - a.length)[0]
      return largest[0].output
    }

    case 'highest_confidence': {
      const sorted = outputs.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      return sorted[0].output
    }

    case 'judge_agent': {
      const judgment = await client.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: \`Multiple agents produced conflicting outputs. Choose the best:
\${outputs.map((o, i) => \`Option \${i+1} (from \${o.agentId}): \${o.output}\`).join('\n\n')}

Which is most accurate/useful and why? Return only the chosen output.\`
        }]
      })
      return extractFinalText(judgment)
    }

    case 'human_escalation':
      // Send to a human review queue
      await notifyHumanReviewer(outputs)
      throw new Error('Escalated to human review — check review queue')
  }
}
\`\`\`

## Common Multi-Agent Failure Modes

**Context drift:** agents in a long chain progressively drift from the original task. Mitigation: always include the original task in every agent's context, not just intermediate outputs.

**Infinite delegation loops:** orchestrator delegates to agent A, which delegates back to orchestrator. Mitigation: track delegation depth; throw if depth exceeds MAX_DEPTH.

**Coordination overhead dominating:** when the time spent coordinating between agents exceeds the time saved by parallelisation. Mitigation: profile whether multi-agent actually helps vs. a single well-prompted agent.

**Trust blindness:** agents blindly trusting other agents' outputs without verification. Mitigation: build verification steps into critical outputs; never execute code from another agent without review.

**Cascading failures:** one agent's failure propagates through the chain. Mitigation: independent error handling per agent, partial results are often acceptable.`,
      keyTerms: ['shared memory', 'debate pattern', 'conflict resolution', 'context drift', 'coordination overhead', 'cascading failure', 'verification pattern'],
    },
    {
      id: '21-4', number: '21.4',
      title: 'Agent Observability — Tracing, Debugging, and Testing',
      duration: 15,
      content: `# Agent Observability — Tracing, Debugging, and Testing

An agent that fails in production is far harder to debug than a function that returns the wrong value. The non-determinism, long execution chains, and tool call sequences make traditional debugging techniques nearly useless. You need purpose-built observability.

## Structured Agent Tracing

Every agent action should emit a structured trace event:

\`\`\`typescript
interface AgentTraceEvent {
  traceId: string          // unique per top-level task
  spanId: string           // unique per agent action
  parentSpanId?: string    // links to parent action (enables tree view)
  agentId: string
  timestamp: string
  type: 'llm_call' | 'tool_call' | 'tool_result' | 'decision' | 'delegation' | 'error'
  durationMs: number
  input?: string           // truncated
  output?: string          // truncated
  metadata: Record<string, unknown>
}

class AgentTracer {
  private events: AgentTraceEvent[] = []
  private readonly traceId = crypto.randomUUID()

  async traceToolCall<T>(
    agentId: string,
    toolName: string,
    toolInput: unknown,
    fn: () => Promise<T>,
    parentSpanId?: string
  ): Promise<T> {
    const spanId = crypto.randomUUID()
    const start = Date.now()

    try {
      const result = await fn()
      this.emit({
        traceId: this.traceId, spanId, parentSpanId, agentId,
        timestamp: new Date().toISOString(),
        type: 'tool_call',
        durationMs: Date.now() - start,
        input: JSON.stringify(toolInput).slice(0, 500),
        output: JSON.stringify(result).slice(0, 500),
        metadata: { toolName, success: true },
      })
      return result
    } catch (error) {
      this.emit({
        traceId: this.traceId, spanId, parentSpanId, agentId,
        timestamp: new Date().toISOString(),
        type: 'error',
        durationMs: Date.now() - start,
        metadata: { toolName, error: String(error) },
      })
      throw error
    }
  }

  private emit(event: AgentTraceEvent): void {
    this.events.push(event)
    // Stream to observability backend (Langfuse, Helicone, custom)
    void this.sendToBackend(event)
  }

  exportTrace(): AgentTraceEvent[] {
    return this.events
  }
}
\`\`\`

## Visualising Agent Execution

The trace events form a tree. Visualise it to understand what happened:

\`\`\`
traceId: abc-123
│
├── [llm_call] orchestrator: "Plan the research task" (1.2s)
│   └── [decision] "Delegate to 3 research agents in parallel"
│
├── [delegation] → research_agent_1: "US maritime law" (parallel)
│   ├── [tool_call] web_search: "US maritime heritage law" (0.8s)
│   ├── [tool_call] fetch_url: "noaa.gov/maritime" (1.1s)
│   └── [llm_call] synthesise findings (2.1s)
│
├── [delegation] → research_agent_2: "UNCLOS provisions" (parallel)
│   ├── [tool_call] web_search: "UNCLOS shipwreck" (0.7s)
│   └── [llm_call] synthesise findings (1.9s)
│
└── [llm_call] orchestrator: synthesise all research (3.4s)
    └── [decision] "Complete — return final report"

Total wall time: 6.8s (would be 14s sequential)
\`\`\`

## Replaying Agent Trajectories

Capture enough information to replay exactly what happened:

\`\`\`typescript
interface AgentRecording {
  task: string
  toolMocks: Record<string, unknown[]>  // tool name → ordered responses
  llmResponses: unknown[]               // ordered LLM responses
  finalOutput: string
}

// Replay mode: use recorded responses instead of live calls
async function replayAgent(recording: AgentRecording) {
  const toolQueues = new Map(
    Object.entries(recording.toolMocks).map(([k, v]) => [k, [...v]])
  )
  const llmQueue = [...recording.llmResponses]

  // Inject mocked dependencies
  const mockClient = {
    messages: {
      create: async () => llmQueue.shift()
    }
  }
  const mockTools = new Proxy({}, {
    get: (_, toolName: string) => async () => toolQueues.get(toolName)?.shift()
  })

  // Run agent with mocks — deterministic, fast, no API cost
  return runAgent(recording.task, mockClient, mockTools)
}
\`\`\`

This enables:
- **Regression testing:** did a code change break an existing agent behaviour?
- **Debugging production failures:** replay the exact sequence that caused a failure
- **Cost-free test runs:** test agent logic without API calls

## Testing Agent Behaviour

\`\`\`typescript
describe('ResearchAgent', () => {
  it('should handle web search failures gracefully', async () => {
    const mockTools = {
      web_search: jest.fn().mockRejectedValue(new Error('Network timeout')),
      fetch_url: jest.fn().mockResolvedValue('Fallback content'),
    }

    const result = await researchAgent('test topic', mockTools)

    // Should not throw — should use fallback strategy
    expect(result).toBeDefined()
    expect(result).not.toContain('Error')

    // Should have attempted fallback
    expect(mockTools.fetch_url).toHaveBeenCalled()
  })

  it('should not exceed MAX_STEPS iterations', async () => {
    const callCount = { value: 0 }
    const infiniteLoopMock = jest.fn().mockImplementation(async () => {
      callCount.value++
      return 'Do more research'  // always tells agent to continue
    })

    await expect(researchAgent('test', { web_search: infiniteLoopMock }))
      .resolves.toBeDefined()

    // Should have stopped at MAX_STEPS
    expect(callCount.value).toBeLessThanOrEqual(MAX_STEPS)
  })
})
\`\`\`

## Key Observability Metrics for Agents

- **Tool call success rate** by tool name — which tools are flaky?
- **Average steps to completion** — are agents getting more or less efficient?
- **Delegation depth distribution** — how deep are your agent trees?
- **Abandoned task rate** — tasks that hit MAX_STEPS without completing
- **Cost per task** — total API cost for a full agent run
- **Time-to-completion P95** — tail latency for long agent runs
- **Error type distribution** — tool failures vs LLM failures vs logic errors

The goal of observability is not to watch agents run — it's to catch regressions and failure modes before users do, and to have enough information to diagnose any failure that makes it through.`,
      keyTerms: ['agent tracing', 'span', 'trace tree', 'trajectory replay', 'agent testing', 'tool mock', 'observability metrics', 'delegation depth'],
    },
  ],
  quizzes: [
    {
      id: 'q21-1', title: 'MCP Deep Dive Quiz',
      type: 'lesson', moduleId: 'm21', passMark: 70,
      questions: [
        {
          id: 'q21-1-1', type: 'multiple_choice',
          question: 'What is the key difference between stdio and SSE transport in MCP?',
          options: [
            'stdio is faster; SSE supports larger message sizes',
            'stdio is process-based for local tools; SSE is HTTP-based for remote servers',
            'stdio supports all three primitives; SSE only supports tools',
            'stdio requires authentication; SSE works anonymously',
          ],
          correctAnswer: 'stdio is process-based for local tools; SSE is HTTP-based for remote servers',
          gradingRubric: 'stdio: host spawns server as subprocess, communicates via stdin/stdout — local only, simple, secure. SSE: HTTP persistent connection, allows network-accessible servers — required for remote/shared MCP servers.',
          xpValue: 10,
        },
        {
          id: 'q21-1-2', type: 'multiple_choice',
          question: 'In MCP\'s three primitives, what distinguishes a "resource" from a "tool"?',
          options: [
            'Resources are free; tools cost API credits to use',
            'Resources are data the model reads; tools are functions the model executes',
            'Resources are defined by the user; tools are defined by the server',
            'Resources work offline; tools require network access',
          ],
          correctAnswer: 'Resources are data the model reads; tools are functions the model executes',
          gradingRubric: 'Tools = executable functions (side effects possible). Resources = data sources the model reads as context (URI-addressed, read-only semantics). Prompts = reusable prompt templates. Each primitive serves a different interaction pattern.',
          xpValue: 10,
        },
        {
          id: 'q21-1-3', type: 'short_answer',
          question: 'Describe the MCP server lifecycle from host connection to shutdown, and explain why the capability handshake step is important.',
          gradingRubric: 'Lifecycle: (1) Host spawns server process (stdio) or connects to SSE endpoint; (2) initialize handshake — host sends capabilities it supports, server responds with capabilities it offers (tools/resources/prompts bitmask); (3) Host calls list_tools/list_resources/list_prompts to discover available items; (4) During conversation, host calls specific tools/reads resources/gets prompts as needed; (5) Shutdown: host sends shutdown, server cleans up, exits. Capability handshake importance: allows hosts and servers with different feature sets to negotiate what\'s possible — a server that only implements tools doesn\'t need to handle resource requests, and the host knows not to send them. Enables graceful degradation and future extensibility.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q21-2', title: 'Orchestration Patterns Quiz',
      type: 'lesson', moduleId: 'm21', passMark: 70,
      questions: [
        {
          id: 'q21-2-1', type: 'multiple_choice',
          question: 'What is the key advantage of the "agent-as-tool" pattern over direct orchestrator code?',
          options: [
            'Agent-as-tool is faster because it bypasses the message API',
            'The orchestrator doesn\'t need to know subagent implementation — just the tool interface',
            'Agent-as-tool allows subagents to run on different machines automatically',
            'Subagents defined as tools are automatically cached by the API',
          ],
          correctAnswer: 'The orchestrator doesn\'t need to know subagent implementation — just the tool interface',
          gradingRubric: 'Exposing agents as tools means the orchestrator uses the same tool-call mechanism for both external tools (web search) and subagents. Implementation details are hidden behind the interface — you can swap subagent implementations without changing orchestrator code.',
          xpValue: 10,
        },
        {
          id: 'q21-2-2', type: 'multiple_choice',
          question: 'Why is checkpointing essential for long-running agents?',
          options: [
            'Checkpoints allow the agent to bill users at each step of completion',
            'Process crashes or API failures after 45 minutes of work can be resumed from the checkpoint rather than restarting',
            'Checkpoints enable multiple users to observe the agent\'s progress simultaneously',
            'Anthropic requires checkpoints for all agent runs exceeding 10 minutes',
          ],
          correctAnswer: 'Process crashes or API failures after 45 minutes of work can be resumed from the checkpoint rather than restarting',
          gradingRubric: 'Long-running agents are vulnerable to network failures, rate limits, process crashes. Persisting state after each step means failures can resume from the last checkpoint — not restart from zero. Critical for tasks that take hours.',
          xpValue: 10,
        },
        {
          id: 'q21-2-3', type: 'short_answer',
          question: 'Describe three distinct multi-agent failure modes and for each: the mechanism that causes it and a concrete mitigation.',
          gradingRubric: 'Any three from: (1) Context drift — progressive deviation from original task as agents summarise each other\'s work; mitigation: always include the original task in every agent\'s context, not just intermediate outputs. (2) Infinite delegation loops — orchestrator A delegates to agent B which delegates back to A; mitigation: track delegation depth, throw if depth > MAX_DEPTH. (3) Coordination overhead dominating — time coordinating > time saved by parallelisation; mitigation: profile whether multi-agent helps vs single well-prompted agent. (4) Trust blindness — agents blindly executing outputs from other agents; mitigation: verification steps on critical outputs, never execute code from another agent without review. (5) Cascading failures — one agent failure propagates through chain; mitigation: independent error handling per agent, partial results acceptable, fallback strategies.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q21-3', title: 'Multi-Agent Systems Quiz',
      type: 'lesson', moduleId: 'm21', passMark: 70,
      questions: [
        {
          id: 'q21-3-1', type: 'multiple_choice',
          question: 'What is the "debate pattern" in multi-agent systems, and when is it most useful?',
          options: [
            'Multiple agents debate the optimal solution in a group chat, with majority vote winning',
            'A proposer agent and a critic agent argue opposing sides; a judge agent evaluates — useful for high-stakes decisions',
            'Agents debate task allocation before starting, optimising workload distribution',
            'The pattern where agents debate which tool to call next in a chain',
          ],
          correctAnswer: 'A proposer agent and a critic agent argue opposing sides; a judge agent evaluates — useful for high-stakes decisions',
          gradingRubric: 'Debate pattern: one agent builds the strongest case FOR, another builds the strongest case AGAINST, a judge (often the strongest model) evaluates and decides. Useful for decisions where confirmation bias is a risk — having a dedicated critic ensures weaknesses are systematically explored.',
          xpValue: 10,
        },
        {
          id: 'q21-3-2', type: 'multiple_choice',
          question: 'In the shared memory coordination pattern, why does each agent read the full shared state before contributing?',
          options: [
            'To check if another agent has already completed the task, avoiding duplicate work',
            'To understand what other agents have found so the agent can contribute a unique, complementary angle',
            'To verify the shared state has not been corrupted by concurrent writes',
            'To synchronise clocks between agents running on different machines',
          ],
          correctAnswer: 'To understand what other agents have found so the agent can contribute a unique, complementary angle',
          gradingRubric: 'Without reading others\' findings, agents would duplicate effort and produce redundant outputs. Reading shared state allows each agent to position its contribution distinctively — "what unique angle can I add given what others have already found?" This is the key coordination mechanism.',
          xpValue: 10,
        },
        {
          id: 'q21-3-3', type: 'short_answer',
          question: 'Compare majority vote, judge agent, and human escalation as conflict resolution strategies — when would you choose each?',
          gradingRubric: 'Majority vote: fast, cheap, works when agents are roughly equal quality and many agents are running. Best for: simple factual disagreements with 5+ agents. Limitation: doesn\'t work if agents cluster into wrong answer due to shared bias. Judge agent: more expensive (requires a strong model), but handles nuanced disagreement. Best for: complex reasoning conflicts with 2-4 agents, when the disagreement requires sophisticated evaluation. Limitation: judge can be wrong too; still no human in loop. Human escalation: slowest, most expensive, but highest quality decision. Best for: high-stakes irreversible decisions, legal/medical/financial disagreements, cases where being wrong has serious consequences. Also appropriate when both previous strategies fail to converge. The right choice depends on stakes × cost × acceptable latency.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q21-4', title: 'Agent Observability Quiz',
      type: 'lesson', moduleId: 'm21', passMark: 70,
      questions: [
        {
          id: 'q21-4-1', type: 'multiple_choice',
          question: 'What does a "parent span ID" in agent tracing enable?',
          options: [
            'It links the trace to the parent user account for billing',
            'It establishes a parent-child relationship between spans, enabling tree visualisation of the execution',
            'It allows the parent process to cancel the child agent\'s execution',
            'It timestamps events relative to the parent span\'s start time',
          ],
          correctAnswer: 'It establishes a parent-child relationship between spans, enabling tree visualisation of the execution',
          gradingRubric: 'Parent span ID links each action to the action that caused it — an LLM call that triggers a tool call records the LLM call\'s span ID as the tool call\'s parent. This builds a tree structure you can visualise and traverse to understand the full execution path.',
          xpValue: 10,
        },
        {
          id: 'q21-4-2', type: 'multiple_choice',
          question: 'What is "trajectory replay" in agent testing, and what key benefit does it provide?',
          options: [
            'Playing back a video recording of the agent\'s screen actions',
            'Re-running an agent with recorded tool responses and LLM outputs — deterministic, API-free testing',
            'Replaying the agent\'s reasoning chain to verify logical consistency',
            'Running the agent trajectory in reverse to diagnose which step caused an error',
          ],
          correctAnswer: 'Re-running an agent with recorded tool responses and LLM outputs — deterministic, API-free testing',
          gradingRubric: 'Recording captures all tool responses and LLM outputs. Replay injects these as mocks instead of making live API calls. Result: deterministic (same inputs every time), fast, and free (no API costs). Enables regression testing: did a code change break existing agent behaviour?',
          xpValue: 10,
        },
        {
          id: 'q21-4-3', type: 'short_answer',
          question: 'List five key observability metrics for production agent systems and explain what each reveals about agent health.',
          gradingRubric: 'Any five of: (1) Tool call success rate by tool — reveals which tools are flaky or unreliable; (2) Average steps to completion — is the agent getting more or less efficient over time? (3) Delegation depth distribution — how deep are agent trees? Unusually deep trees suggest complexity or loops; (4) Abandoned task rate (hits MAX_STEPS without completing) — reveals tasks that are too hard for current agent capability; (5) Cost per task — total API cost, essential for unit economics; (6) P95 time-to-completion — tail latency reveals worst-case user experience; (7) Error type distribution (tool vs LLM vs logic) — directs where to focus reliability improvements; (8) Cache hit rate — reveals whether prompt caching is working effectively.',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p21', moduleId: 'm21',
    name: 'Multi-Agent Research System',
    emoji: '🕸️',
    description: 'Build a production multi-agent research system with a custom MCP server, an orchestrator that delegates to specialised subagents running in parallel, shared state coordination, and full observability with structured tracing, trajectory replay, and a metrics dashboard.',
    tools: ['Anthropic API', '@modelcontextprotocol/sdk', 'TypeScript', 'observability backend'],
    status: 'not_started',
    rubric: [
      'Custom MCP server implementing all three primitives (tools, resources, prompts) with SSE transport',
      'Orchestrator agent that plans tasks and delegates to at least 3 specialised subagents using agent-as-tool pattern',
      'Parallel execution with concurrency limiting — multiple subagents run simultaneously',
      'Shared state store enabling coordination between agents — each reads others\' findings before contributing',
      'Checkpointing: agent state persisted after each step, with resume capability on failure',
      'Full structured tracing with parent span IDs, exportable trace tree, and trajectory replay for test cases',
    ],
    xpReward: 440,
  },
}

// ─── MODULE 22 ────────────────────────────────────────────────────────────────
const m22: Module = {
  id: 'm22', number: 22, arc: 5,
  title: 'Fine-tuning and LoRA',
  description: 'When prompting isn\'t enough — the theory and practice of adapting models to your specific use case. Covers when fine-tuning is the right choice, the mechanics of supervised fine-tuning, parameter-efficient techniques like LoRA and QLoRA, dataset curation, and DPO as a modern RLHF alternative.',
  prerequisiteModuleId: 'm21',
  lessons: [
    {
      id: '22-1', number: '22.1',
      title: 'When to Fine-tune — The Decision Framework',
      duration: 14,
      content: `# When to Fine-tune — The Decision Framework

Fine-tuning is powerful but often unnecessary, expensive, and slower to iterate on than prompting. Before reaching for it, exhaust simpler options. This lesson gives you a clear decision framework.

## The Hierarchy of Adaptation Techniques

\`\`\`
1. Prompting (zero-shot / few-shot)        → try first, always
2. RAG (retrieval-augmented generation)    → for knowledge gaps
3. System prompt engineering              → for behaviour and format
4. Fine-tuning                            → when 1-3 are insufficient
5. Training from scratch                  → almost never for most use cases
\`\`\`

The key question at each level: **does the next level actually solve the problem?** Most use cases stop at level 2 or 3. Fine-tuning is level 4.

## The Case FOR Fine-tuning

**Consistent style and format:** you need every output in a specific format, tone, or style that prompting alone can't reliably enforce.

\`\`\`
Bad prompting result: "Here's the JSON:\n\`\`\`json\n{...}\n\`\`\`\nHope this helps!"
Fine-tuned result:    {"field": "value"}  ← clean, every time
\`\`\`

**Domain-specific behaviour:** your domain has vocabulary, conventions, or reasoning patterns not well represented in the base model's training data. Legal contracts, medical records, specialised scientific notation, maritime archaeology terminology.

**Speed and cost:** fine-tuning on a smaller model can replace prompting a larger model. A fine-tuned 7B model may outperform Sonnet on your specific task at 100× lower cost.

**Reducing prompt size:** if you need 2000 tokens of examples in every prompt to get good results, fine-tuning can bake those examples into the weights — dropping prompt size to 50 tokens.

**Edge case handling:** the model consistently fails on specific patterns in your data. Fine-tuning on these failure cases is often the most efficient fix.

## The Case AGAINST Fine-tuning

**You haven't tried prompting well:** most perceived fine-tuning needs can be solved with better prompts, system messages, or few-shot examples.

**Your data is small:** fine-tuning on fewer than 100-200 high-quality examples often hurts more than it helps. You need sufficient volume.

**You need to update knowledge frequently:** fine-tuned weights are static. If you're updating because the model doesn't know recent facts, use RAG — it's updatable in minutes.

**You need multiple capabilities:** fine-tuning for one task often degrades others (catastrophic forgetting). A fine-tuned customer service model may be worse at code review than the base model.

**You're not measuring:** fine-tuning without an eval suite to compare before/after is guesswork. You don't know if you improved.

## What Fine-tuning Changes (and What It Doesn't)

\`\`\`
Fine-tuning DOES:
  ✓ Adjust the model's style, tone, and format
  ✓ Improve performance on specific task patterns
  ✓ Encode domain-specific conventions
  ✓ Make the model faster (smaller models fine-tuned > larger models prompted)
  ✓ Reduce prompt size needed for good results

Fine-tuning DOES NOT:
  ✗ Add new knowledge (knowledge is from training corpus, not fine-tuning)
  ✗ Fix fundamental capability gaps (can't teach a model to reason better via SFT)
  ✗ Guarantee factual accuracy (still hallucinates, possibly more confidently)
  ✗ Replace alignment training (safety properties can degrade)
\`\`\`

## Decision Matrix

| Situation | Recommended approach |
|---|---|
| Model doesn't know recent facts | RAG |
| Wrong output format/style | System prompt / few-shot first; fine-tune if persistent |
| Model too slow/expensive | Model routing + prompting; fine-tune smaller model if needed |
| Domain-specific vocabulary | Few-shot first; fine-tune if vocab is large |
| Consistent failure on specific patterns | Fine-tune on failure cases |
| Need to update frequently | RAG (not fine-tuning) |
| Want to encode a personality | System prompt first; fine-tune for strong consistency |
| Legal/safety requirements | Fine-tune safety fine-tuning + RLHF (non-trivial) |

## APIs for Fine-tuning

**Anthropic fine-tuning API:** as of 2025, Anthropic offers fine-tuning for Claude models via their API for enterprise customers. Check docs.anthropic.com for current model availability and pricing.

**OpenAI fine-tuning API:** mature, widely used, supports GPT-4o-mini, GPT-3.5.

**Open-source (Hugging Face):** full control, requires your own GPU or cloud compute. Use PEFT/LoRA for efficiency.

For most builders without massive datasets or very specific needs, fine-tuning open-source models via Hugging Face is the most practical path.`,
      keyTerms: ['fine-tuning', 'supervised fine-tuning', 'catastrophic forgetting', 'decision framework', 'RAG vs fine-tuning', 'domain adaptation'],
    },
    {
      id: '22-2', number: '22.2',
      title: 'Supervised Fine-tuning — Data and Training',
      duration: 16,
      content: `# Supervised Fine-tuning — Data and Training

Supervised fine-tuning (SFT) is the foundational fine-tuning technique. You show the model examples of the exact input-output pairs you want it to reproduce, and gradient descent adjusts the weights to increase the probability of those outputs given those inputs.

## The SFT Data Format

For chat models, training data uses the same message format as inference:

\`\`\`jsonl
{"messages": [
  {"role": "system", "content": "You are a maritime archaeologist assistant. Provide concise, technical responses."},
  {"role": "user", "content": "What is the significance of a ship's knees in wooden vessel construction?"},
  {"role": "assistant", "content": "Ship's knees are angled structural members that reinforce the joint between horizontal and vertical timbers — primarily between deck beams and the vessel's sides. They transfer load across the joint, preventing racking forces from separating the hull structure. Natural crooks (curved timber sections) were preferred for knees because their grain follows the curve, maximising strength. The presence, type, and fastening of knees are key diagnostic features in archaeological vessel analysis."}
]}
{"messages": [
  {"role": "system", "content": "You are a maritime archaeologist assistant. Provide concise, technical responses."},
  {"role": "user", "content": "What does dendrochronology reveal about a wooden wreck?"},
  {"role": "assistant", "content": "Dendrochronology (tree-ring dating) applied to a wooden wreck's timbers can determine: (1) the felling date of the trees used in construction (within 1-3 years), (2) the geographic origin of the timber through regional ring-width signatures, and (3) whether different vessel parts were repaired using timber from different periods or regions. The outermost ring present on a timber establishes a terminus post quem — the vessel cannot have been built before that date."}
]}
\`\`\`

**Each line is one complete conversation.** JSONL format (JSON Lines) — one JSON object per line, no commas between lines.

## Data Quality Over Data Quantity

This is the single most important principle of fine-tuning:

**100 expert-curated examples > 10,000 scraped examples**

Quality criteria:
- **Correctness:** every output must be factually and structurally correct
- **Consistency:** similar inputs should produce stylistically similar outputs
- **Coverage:** examples should span the distribution of real inputs you'll see
- **Contrast:** include negative examples — show what NOT to do via the preferred alternative

\`\`\`python
# Quality filtering pipeline
def filter_training_examples(raw_examples: list[dict]) -> list[dict]:
    filtered = []
    for example in raw_examples:
        messages = example['messages']
        assistant_msg = next(m for m in messages if m['role'] == 'assistant')

        # Filter 1: minimum length (too short = insufficient detail)
        if len(assistant_msg['content']) < 50:
            continue

        # Filter 2: maximum length (too long = overly verbose for our use case)
        if len(assistant_msg['content']) > 2000:
            continue

        # Filter 3: no hallucination markers (uncertain phrases we don't want modelled)
        bad_phrases = ['I think maybe', 'I\'m not sure but', 'probably around']
        if any(phrase in assistant_msg['content'] for phrase in bad_phrases):
            continue

        # Filter 4: format check (must contain specific markers for our domain)
        if 'maritime' in messages[0]['content'] and 'terminus' not in assistant_msg['content']:
            pass  # domain-specific format check

        filtered.append(example)

    return filtered
\`\`\`

## Dataset Size Guidelines

| Use case | Minimum examples | Sweet spot |
|---|---|---|
| Format/style consistency | 50-100 | 200-500 |
| Domain terminology | 200-500 | 1,000+ |
| Instruction following | 1,000+ | 5,000-50,000 |
| Full capability fine-tuning | 10,000+ | 100,000+ |

For most custom applications: 200-2000 carefully curated examples in the sweet spot.

## The SFT Training Loop

\`\`\`python
# Conceptual SFT training (using Hugging Face Trainer)
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer
from datasets import load_dataset

model = AutoModelForCausalLM.from_pretrained('meta-llama/Llama-3.2-3B-Instruct')
tokenizer = AutoTokenizer.from_pretrained('meta-llama/Llama-3.2-3B-Instruct')

dataset = load_dataset('json', data_files={'train': 'train.jsonl', 'eval': 'eval.jsonl'})

training_args = TrainingArguments(
    output_dir='./fine-tuned-model',
    num_train_epochs=3,          # 1-5 epochs typical; more = overfitting risk
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,  # effective batch size = 4 × 4 = 16
    learning_rate=2e-5,          # lower than pretraining (2e-5 to 5e-5 typical)
    warmup_ratio=0.03,
    lr_scheduler_type='cosine',
    save_strategy='epoch',
    evaluation_strategy='epoch',
    load_best_model_at_end=True,
    fp16=True,                   # mixed precision training
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset['train'],
    eval_dataset=dataset['eval'],
    tokenizer=tokenizer,
    max_seq_length=2048,
)

trainer.train()
trainer.save_model('./final-model')
\`\`\`

## Overfitting and When to Stop

\`\`\`
Training loss: ↓↓↓↓↓  ← always decreases
Eval loss:     ↓↓↓→↑  ← the "↑" is when to stop (early stopping)

If train loss → 0 but eval loss → ∞: severe overfitting
Model has memorised training examples, not generalised
\`\`\`

Signs of overfitting:
- The model outputs phrases from training examples verbatim
- Eval loss increases while train loss continues decreasing
- The model works perfectly on training-like inputs but fails on slight variations

Prevention: hold out 10-20% as eval set, use early stopping, limit epochs (1-3 for small datasets), add regularisation via weight decay.`,
      keyTerms: ['supervised fine-tuning', 'JSONL format', 'data quality', 'overfitting', 'early stopping', 'training loss', 'eval loss', 'dataset size'],
    },
    {
      id: '22-3', number: '22.3',
      title: 'LoRA and Parameter-Efficient Fine-tuning',
      duration: 17,
      content: `# LoRA and Parameter-Efficient Fine-tuning

Full fine-tuning updates all model parameters — for a 70B model, that's 140 GB of gradients, Adam optimiser states, and parameter copies. This is prohibitively expensive for most practitioners. LoRA (Low-Rank Adaptation) solves this by training only a tiny fraction of parameters.

## The LoRA Insight

A key observation from LoRA's authors (Hu et al., 2021): the weight updates during fine-tuning have a low intrinsic rank. You don't need to update all 140 billion parameters — the meaningful changes live in a much lower-dimensional subspace.

**The math:**

\`\`\`
Pre-trained weight matrix:  W₀ ∈ ℝ^(d × k)    (e.g., 4096 × 4096 = 16M params)
                                                  ← frozen during training

LoRA decomposition:         ΔW = B × A
  where B ∈ ℝ^(d × r)      (e.g., 4096 × 8)
        A ∈ ℝ^(r × k)      (e.g., 8 × 4096)
        r = rank (typically 4-64)

Training updates B and A only: 4096×8 + 8×4096 = 65,536 params
vs full update: 4096×4096 = 16,777,216 params
Reduction: 256× fewer parameters trained!

At inference: W = W₀ + (α/r) × B × A
\`\`\`

The scaling factor α/r controls how much the LoRA update contributes to the final weights. α is typically equal to r, giving a factor of 1.

## LoRA in Practice with PEFT

\`\`\`python
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM

# Load base model
model = AutoModelForCausalLM.from_pretrained(
    'meta-llama/Llama-3.2-3B-Instruct',
    torch_dtype=torch.float16,
    device_map='auto',
)

# Configure LoRA
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,                    # rank — higher = more capacity, more params
    lora_alpha=32,           # scaling factor (typically 2×r)
    target_modules=[         # which weight matrices to adapt
        'q_proj',            # query projection in attention
        'v_proj',            # value projection in attention
        'k_proj',            # key projection
        'o_proj',            # output projection
        'gate_proj',         # MLP gate
        'up_proj',           # MLP up projection
        'down_proj',         # MLP down projection
    ],
    lora_dropout=0.05,       # regularisation
    bias='none',             # don't train bias terms
)

# Apply LoRA — most parameters are now frozen
peft_model = get_peft_model(model, lora_config)
peft_model.print_trainable_parameters()
# Output: trainable params: 6,815,744 || all params: 3,219,816,448 || trainable%: 0.21%

# Train exactly as with full SFT — only 0.21% of params update
\`\`\`

## Rank Selection

| Rank (r) | Trainable params (approx) | Use when |
|---|---|---|
| 4 | Minimal | Simple style/format adaptation |
| 8 | Small | Standard fine-tuning, most tasks |
| 16 | Medium | More complex behaviour changes |
| 32 | Large | Domain with significant divergence from base |
| 64+ | Very large | Approaching full fine-tuning territory |

Start at r=8, evaluate, increase if results are unsatisfactory.

## QLoRA — Quantised LoRA

QLoRA combines LoRA with 4-bit quantisation of the base model:

\`\`\`python
from transformers import BitsAndBytesConfig

# Load in 4-bit quantised (NF4 format)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,  # nested quantisation for further compression
    bnb_4bit_quant_type='nf4',       # NormalFloat4 — best for normally distributed weights
    bnb_4bit_compute_dtype=torch.bfloat16,
)

model = AutoModelForCausalLM.from_pretrained(
    'meta-llama/Llama-3.1-70B-Instruct',  # 70B model!
    quantization_config=bnb_config,
    device_map='auto',
)

# Now apply LoRA on top of the 4-bit model
peft_model = get_peft_model(model, lora_config)

# Memory: 70B at FP16 = 140GB. With QLoRA: ~35GB + LoRA adapters (~100MB)
# Fine-tune a 70B model on a single A100 80GB!
\`\`\`

**QLoRA impact:** made fine-tuning frontier-class models accessible to individuals. A single A100 (rentable for ~$2.50/hr) can fine-tune a 70B model that previously required a cluster.

## Which Modules to Target

The choice of which weight matrices to adapt (target_modules) affects what the fine-tuning changes:

**Attention projections (q_proj, k_proj, v_proj, o_proj):** affects how the model attends — what it pays attention to and how it contextualises.

**MLP layers (gate_proj, up_proj, down_proj):** affects computation within each transformer block — the "reasoning" layers.

**All of the above:** most thorough; LoRA papers show targeting all linear layers gives best results at cost of more parameters.

**Embedding layers:** rarely targeted — changing embeddings can destabilise the model significantly.

## Saving and Loading LoRA Adapters

\`\`\`python
# Save only the LoRA adapters (tiny — ~10-100MB vs 70GB+ for full model)
peft_model.save_pretrained('./my-lora-adapters')

# To use: load base model + apply adapters
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained('meta-llama/Llama-3.1-70B-Instruct')
model_with_lora = PeftModel.from_pretrained(base_model, './my-lora-adapters')

# Or merge permanently for faster inference (cannot un-merge)
merged_model = model_with_lora.merge_and_unload()
merged_model.save_pretrained('./merged-model')
\`\`\`

The ability to share tiny adapters (instead of full model weights) enables a new sharing paradigm — Hugging Face Hub hosts thousands of LoRA adapters for popular base models.`,
      keyTerms: ['LoRA', 'low-rank adaptation', 'rank', 'lora_alpha', 'QLoRA', 'NF4 quantisation', 'target_modules', 'PEFT', 'adapter'],
    },
    {
      id: '22-4', number: '22.4',
      title: 'DPO, Evaluation, and the Fine-tuning Workflow',
      duration: 16,
      content: `# DPO, Evaluation, and the Fine-tuning Workflow

SFT teaches the model what to do. But sometimes you need to teach it what's *better* — a preference signal, not just a correct answer. DPO (Direct Preference Optimisation) achieves this without the complexity of RLHF's reward model and PPO loop.

## Why SFT Alone Is Insufficient for Alignment

SFT maximises the probability of the training output. But:
- Your training data contains some bad examples (noise)
- For many tasks, multiple outputs are valid but some are better
- SFT doesn't teach the model to compare or rank outputs
- Safety alignment requires "refuse harmful request" to beat "comply with harmful request" — a preference, not a single correct answer

\`\`\`
SFT data: (prompt → good response)
         "Write a story" → [one specific story]

DPO data: (prompt → chosen response, rejected response)
         "Write a story" → (vivid, detailed story) > (flat, dull story)
\`\`\`

## DPO — Direct Preference Optimisation

RLHF (from M10) requires training a separate reward model and running PPO. DPO achieves similar alignment by reformulating the problem — directly optimising the policy to prefer chosen over rejected responses.

**The intuition:** instead of learning a reward model and then optimising against it (two steps), DPO shows the model paired examples (chosen, rejected) and directly increases the probability of chosen while decreasing the probability of rejected.

\`\`\`python
from trl import DPOTrainer, DPOConfig

# DPO dataset format: paired preferences
dpo_dataset = [
    {
        'prompt': 'How should I store sensitive user data?',
        'chosen': 'Encrypt at rest using AES-256, hash passwords with bcrypt, store PII separately from application data with access controls, and implement audit logging for all access.',
        'rejected': 'Just put it in a database with a password on it, that should be fine.',
    },
    {
        'prompt': 'Explain transformer attention',
        'chosen': 'Attention computes a weighted sum of value vectors, where weights are determined by the similarity between query and key vectors via scaled dot product. Self-attention lets each token attend to all others, capturing long-range dependencies.',
        'rejected': 'Attention is when the model looks at different words.',
    },
]

dpo_config = DPOConfig(
    beta=0.1,                    # controls how much to deviate from reference model
                                 # lower β = more conservative, higher = more aggressive
    learning_rate=5e-7,          # lower than SFT — DPO is sensitive to LR
    num_train_epochs=1,          # usually 1-3 epochs for DPO
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    output_dir='./dpo-model',
)

dpo_trainer = DPOTrainer(
    model=peft_model,            # SFT-trained model as starting point
    ref_model=None,              # if None, uses the model itself as reference (memory efficient)
    args=dpo_config,
    train_dataset=dpo_dataset,
    tokenizer=tokenizer,
)

dpo_trainer.train()
\`\`\`

**β (beta) parameter:** controls the KL divergence penalty — how much the DPO-trained model is allowed to deviate from the SFT reference model. Low β = stays close to SFT model. High β = strong preference optimisation but risks mode collapse.

## Creating Preference Datasets

\`\`\`python
# Method 1: Human annotation
# Hire domain experts, show pairs, have them select preferred response
# Gold standard but expensive

# Method 2: Model-generated + human filtered
# Generate multiple responses per prompt using the current model
# Have humans select the best

# Method 3: Claude as annotator (AI preference labelling)
async def generate_preference_pair(prompt: str) -> dict:
    # Generate two responses with different sampling
    response_a, response_b = await asyncio.gather(
        client.messages.create(
            model='claude-sonnet-4-20250514', max_tokens=512,
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.3,  # more focused
        ),
        client.messages.create(
            model='claude-sonnet-4-20250514', max_tokens=512,
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.9,  # more creative/varied
        )
    )

    text_a = response_a.content[0].text
    text_b = response_b.content[0].text

    # Use a strong model to determine preference
    judgment = await client.messages.create(
        model='claude-opus-4-20250514', max_tokens=256,
        messages=[{'role': 'user', 'content': f'''Which response is better for this prompt?
Prompt: {prompt}
Response A: {text_a}
Response B: {text_b}
Output JSON: {{"better": "A" or "B", "reason": "..."}}'''}]
    )

    result = json.loads(judgment.content[0].text)
    chosen, rejected = (text_a, text_b) if result['better'] == 'A' else (text_b, text_a)
    return {'prompt': prompt, 'chosen': chosen, 'rejected': rejected}
\`\`\`

## Evaluating Fine-tuned Models

**Never ship a fine-tuned model without eval comparison:**

\`\`\`python
# Before/after eval comparison
async def compare_models(base_model_fn, finetuned_model_fn, eval_cases: list):
    results = []
    for case in eval_cases:
        base_response = await base_model_fn(case['prompt'])
        ft_response = await finetuned_model_fn(case['prompt'])

        # Auto-eval: format compliance
        format_ok_base = check_format(base_response, case['expected_format'])
        format_ok_ft = check_format(ft_response, case['expected_format'])

        # LLM judge: quality comparison
        judge_result = await judge_which_is_better(
            case['prompt'], base_response, ft_response
        )

        results.append({
            'prompt': case['prompt'],
            'format_regression': format_ok_base and not format_ok_ft,
            'quality_improvement': judge_result == 'finetuned',
        })

    format_regression_rate = sum(r['format_regression'] for r in results) / len(results)
    quality_win_rate = sum(r['quality_improvement'] for r in results) / len(results)

    print(f'Format regression rate: {format_regression_rate:.1%}')
    print(f'Quality win rate vs base: {quality_win_rate:.1%}')

    # Reject the fine-tuned model if it regresses on >5% of cases
    return format_regression_rate < 0.05 and quality_win_rate > 0.6
\`\`\`

## The Complete Fine-tuning Workflow

\`\`\`
1. Define the use case and success criteria
   ↓
2. Try prompting / RAG — can they solve it?
   ↓ (if no)
3. Collect 100+ high-quality training examples
   ↓
4. Build eval set (20-30% of collected examples, held out)
   ↓
5. Run baseline: current model on eval set
   ↓
6. Fine-tune with LoRA (start: r=8, 3 epochs, lr=2e-5)
   ↓
7. Evaluate fine-tuned model against baseline
   ↓
8. If regressions found: inspect failures, improve data, retrain
   ↓
9. If quality acceptable: ship — monitor in production
   ↓
10. Collect production failure cases → add to training data → retrain (data flywheel)
\`\`\`

The data flywheel is the long-term strategy: production failures become training examples, which improve the model, which reduces future failures. Each iteration compounds.`,
      keyTerms: ['DPO', 'preference dataset', 'chosen/rejected pair', 'beta parameter', 'data flywheel', 'before/after eval', 'quality win rate', 'format regression'],
    },
  ],
  quizzes: [
    {
      id: 'q22-1', title: 'Fine-tuning Decision Quiz',
      type: 'lesson', moduleId: 'm22', passMark: 70,
      questions: [
        {
          id: 'q22-1-1', type: 'multiple_choice',
          question: 'A model consistently formats responses with verbose prose when you need clean JSON output. What is the recommended first approach?',
          options: [
            'Immediately fine-tune on 500 JSON examples — this is a format problem that requires fine-tuning',
            'Try system prompt instruction and tool use with forced JSON schema first; fine-tune only if persistent',
            'Switch to a different base model that was pre-trained on JSON',
            'Use RAG to retrieve JSON formatting examples for every request',
          ],
          correctAnswer: 'Try system prompt instruction and tool use with forced JSON schema first; fine-tune only if persistent',
          gradingRubric: 'The adaptation hierarchy: prompting first, then fine-tuning. Structured output via tool_choice with a JSON schema often solves format problems entirely without fine-tuning. Fine-tuning is expensive and slow to iterate — exhaust simpler options first.',
          xpValue: 10,
        },
        {
          id: 'q22-1-2', type: 'multiple_choice',
          question: 'What does fine-tuning NOT do, despite common misconceptions?',
          options: [
            'Fine-tuning cannot change the model\'s output format or style',
            'Fine-tuning cannot add new knowledge that wasn\'t in the pretraining corpus',
            'Fine-tuning cannot improve performance on domain-specific tasks',
            'Fine-tuning cannot reduce the model\'s tendency to be verbose',
          ],
          correctAnswer: 'Fine-tuning cannot add new knowledge that wasn\'t in the pretraining corpus',
          gradingRubric: 'Fine-tuning adjusts style, format, and task-specific behaviour — but knowledge comes from pretraining. If the model doesn\'t know a fact, SFT won\'t teach it that fact (it might teach the model to confidently state it, which is worse). Use RAG for knowledge.',
          xpValue: 10,
        },
        {
          id: 'q22-1-3', type: 'short_answer',
          question: 'A startup is building a legal contract analysis tool. They want to fine-tune Claude or an open-source model. Describe the decision process they should follow, including what they\'d try before fine-tuning and what signals would tell them fine-tuning is needed.',
          gradingRubric: 'Step 1: try prompting with a detailed legal-domain system prompt and few-shot examples of contract analysis. Evaluate on a held-out set of contracts. Step 2: if knowledge gaps (model doesn\'t know recent case law, specific jurisdiction rules): add RAG over a legal knowledge base. Step 3: if format issues (inconsistent structure, wrong citation format): try tool_choice with structured output schema. Fine-tuning needed signals: (1) consistent failure on domain-specific vocabulary/conventions despite good prompts; (2) output format still wrong after structured output attempts; (3) prompt needs 2000+ tokens of examples to get acceptable results (fine-tuning can bake these in); (4) speed/cost requirements that can\'t be met with large model + long prompt. Not fine-tuning: if the real issue is that the model doesn\'t know a specific statute → RAG, not fine-tuning.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q22-2', title: 'SFT Data and Training Quiz',
      type: 'lesson', moduleId: 'm22', passMark: 70,
      questions: [
        {
          id: 'q22-2-1', type: 'multiple_choice',
          question: 'Why is "data quality over data quantity" the most important principle of SFT?',
          options: [
            'Larger datasets take longer to process and cost more in compute',
            'Low-quality examples teach the model bad patterns that are hard to unlearn; 100 expert examples beat 10,000 noisy ones',
            'High-quality data is needed for regulatory compliance in most jurisdictions',
            'Large datasets cause overfitting more quickly than small datasets',
          ],
          correctAnswer: 'Low-quality examples teach the model bad patterns that are hard to unlearn; 100 expert examples beat 10,000 noisy ones',
          gradingRubric: 'Every training example updates the model\'s weights. Bad examples teach bad patterns — incorrect outputs, poor reasoning, wrong format. SFT literally maximises the probability of the training outputs. If those outputs are poor, the model learns to be poor. Expert curation of even small datasets consistently outperforms large noisy datasets.',
          xpValue: 10,
        },
        {
          id: 'q22-2-2', type: 'multiple_choice',
          question: 'What does a diverging eval loss (increasing) while training loss continues decreasing indicate?',
          options: [
            'The model is learning — this is normal and expected during fine-tuning',
            'The GPU is running out of memory and should be upgraded',
            'The model is overfitting — memorising training examples rather than generalising',
            'The learning rate is too low and should be increased',
          ],
          correctAnswer: 'The model is overfitting — memorising training examples rather than generalising',
          gradingRubric: 'Diverging eval loss = overfitting. The model has memorised the training set but can\'t generalise to unseen examples. Train loss → 0 while eval loss → ∞ is classic overfitting. Solution: early stopping at the eval loss minimum, fewer epochs, more training data diversity, regularisation.',
          xpValue: 10,
        },
        {
          id: 'q22-2-3', type: 'short_answer',
          question: 'You have 50 high-quality examples for a maritime archaeology question-answering task. What practical steps would you take to make fine-tuning viable despite the small dataset size, and what risks should you mitigate?',
          gradingRubric: 'With 50 examples: (1) Split 40 train / 10 eval — small but necessary. (2) Data augmentation: rephrase questions and answers to create variations (effectively 150+ examples from 50); use Claude to generate paraphrases maintaining accuracy. (3) Use a small base model (3B-7B parameters) — small models need less data than large ones to overfit. (4) Use LoRA with low rank (r=4 or r=8) to reduce trainable parameters and overfitting risk. (5) 1-2 epochs maximum with strong early stopping. (6) Regularisation: higher dropout (0.1), weight decay. Risks to mitigate: overfitting (model memorises training queries verbatim) — test with novel questions not in training set; catastrophic forgetting (model degrades on general tasks) — include some general examples in the mix; hallucination (model confidently states wrong answers with fine-tuned confidence) — include quality filters and uncertainty expressions in training examples.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q22-3', title: 'LoRA and PEFT Quiz',
      type: 'lesson', moduleId: 'm22', passMark: 70,
      questions: [
        {
          id: 'q22-3-1', type: 'multiple_choice',
          question: 'LoRA represents weight updates as ΔW = B × A where r is the rank. What does a lower rank value mean?',
          options: [
            'Fewer parameters are trained, less capacity to change the model\'s behaviour',
            'The model updates faster during training but produces lower quality outputs',
            'Lower rank means the adapters are stored more efficiently on disk',
            'Lower rank applies LoRA to fewer layers of the model',
          ],
          correctAnswer: 'Fewer parameters are trained, less capacity to change the model\'s behaviour',
          gradingRubric: 'Rank r determines B ∈ ℝ^(d×r) and A ∈ ℝ^(r×k). Lower r = smaller matrices = fewer trainable parameters = less capacity. r=4 barely changes the model; r=64 approaches full fine-tuning in capacity (but at much lower memory cost). Start at r=8 for most tasks.',
          xpValue: 10,
        },
        {
          id: 'q22-3-2', type: 'multiple_choice',
          question: 'What is the key innovation of QLoRA that made fine-tuning 70B models accessible on a single GPU?',
          options: [
            'QLoRA uses quantum computing to parallelise gradient computation',
            'QLoRA quantises the base model to 4-bit while keeping LoRA adapters in full precision',
            'QLoRA reduces the number of LoRA adapters needed to achieve good performance',
            'QLoRA applies LoRA only to quantised layers, skipping standard layers',
          ],
          correctAnswer: 'QLoRA quantises the base model to 4-bit while keeping LoRA adapters in full precision',
          gradingRubric: 'QLoRA loads the frozen base model in 4-bit NF4 format (70B model → ~35GB instead of 140GB), while the small LoRA adapters and optimizer states remain in bfloat16. Total memory: ~35GB + ~100MB adapters → fits on a single A100 80GB, enabling anyone with ~$2.50/hr GPU access to fine-tune 70B models.',
          xpValue: 10,
        },
        {
          id: 'q22-3-3', type: 'short_answer',
          question: 'Explain why LoRA adapters can be shared on Hugging Face Hub separately from the base model weights, and what workflow this enables for a team building a domain-specific AI.',
          gradingRubric: 'LoRA adapters are tiny (10-100MB) because they contain only the low-rank matrices B and A, not the full model weights (which may be 140GB). The base model is loaded separately and the adapters are applied on top. This enables: (1) A team can train multiple domain-specific adapters on the same base model without duplicating the base; (2) Adapters can be shared publicly without distributing the full model (which may have licensing constraints); (3) Users download once the 70GB base model, then swap tiny adapters for different tasks; (4) The Hugging Face Hub hosts thousands of adapters — community can share specialisations; (5) Organisations can keep the base model private while sharing domain adapters. The merge_and_unload() operation permanently bakes the adapter into a new full model for production deployment where inference speed matters.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q22-4', title: 'DPO and Evaluation Quiz',
      type: 'lesson', moduleId: 'm22', passMark: 70,
      questions: [
        {
          id: 'q22-4-1', type: 'multiple_choice',
          question: 'What is the fundamental difference between SFT training data and DPO training data?',
          options: [
            'SFT uses JSON format; DPO uses CSV format',
            'SFT uses (prompt → correct response); DPO uses (prompt → chosen response, rejected response) pairs',
            'SFT trains on user messages; DPO trains on assistant messages only',
            'SFT requires 10× more data than DPO to achieve the same result',
          ],
          correctAnswer: 'SFT uses (prompt → correct response); DPO uses (prompt → chosen response, rejected response) pairs',
          gradingRubric: 'SFT: maximise probability of the one correct output. DPO: increase probability of chosen relative to rejected — teaches the model to prefer better responses. DPO is essential for alignment tasks where multiple outputs are valid but some are better, and for safety where the model must learn to prefer refusals over harmful compliance.',
          xpValue: 10,
        },
        {
          id: 'q22-4-2', type: 'multiple_choice',
          question: 'In the fine-tuning "data flywheel," what drives the continuous improvement cycle?',
          options: [
            'Automatically retraining the model every night on synthetic data',
            'Production failure cases becoming new training examples, which improve the model, which reduces future failures',
            'Users rating model responses in the app, which feeds directly into DPO training',
            'The model fine-tuning itself on its own successful outputs',
          ],
          correctAnswer: 'Production failure cases becoming new training examples, which improve the model, which reduces future failures',
          gradingRubric: 'Data flywheel: identify production failures → add to training data (as failures to avoid, or as additional SFT examples with correct answers) → retrain → deployment improves → fewer failures → collect new harder edge cases. Each iteration compounds. This is how production AI systems continuously improve without manual prompt engineering.',
          xpValue: 10,
        },
        {
          id: 'q22-4-3', type: 'short_answer',
          question: 'Describe the complete fine-tuning workflow from use-case definition to production deployment, including what metrics you would track at each evaluation step.',
          gradingRubric: 'Complete workflow: (1) Define use case and success criteria — before touching data or models; (2) Try prompting and RAG — baseline eval on held-out cases; (3) Collect 100+ high-quality training examples — curated, filtered for quality; (4) Build eval set (20-30% holdout); (5) Baseline: run current model on eval — record format compliance %, quality score via LLM judge, task success rate; (6) Fine-tune with LoRA (r=8, 3 epochs, lr=2e-5) — monitor train loss, eval loss, stop at eval loss minimum; (7) Compare fine-tuned vs baseline: format regression rate (<5% threshold), quality win rate (>60% target), task success rate delta; (8) If regressions: inspect failures, improve training data, retrain; (9) A/B test in production with traffic split; (10) Monitor: production success rate, user feedback, edge case accumulation; (11) Data flywheel: collect production failures → add to training data → next iteration. Key rejection criteria: format regression rate >5% or quality win rate <50% → do not ship.',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p22', moduleId: 'm22',
    name: 'Domain Fine-tuned Model',
    emoji: '🎯',
    description: 'Fine-tune a small open-source model (3B-7B) on a domain of your choice using LoRA. Build a quality eval suite, run baseline comparison, experiment with DPO on preference pairs, and document the complete fine-tuning workflow with before/after eval results.',
    tools: ['Hugging Face PEFT', 'TRL', 'transformers', 'bitsandbytes for QLoRA', 'Anthropic API for data generation'],
    status: 'not_started',
    rubric: [
      'Dataset of 200+ training examples in JSONL chat format with documented quality filtering criteria',
      'Eval set of 50+ cases with automated scoring (format compliance + LLM-as-judge quality)',
      'LoRA fine-tuning with documented hyperparameter choices (rank, alpha, target modules, epochs, lr)',
      'Before/after eval comparison: format regression rate, quality win rate, task success rate delta',
      'DPO experiment: 50+ preference pairs, DPO training run, eval comparison vs SFT-only model',
      'Written analysis: what improved, what regressed, what the data flywheel next iteration would focus on',
    ],
    xpReward: 420,
  },
}

// ─── MODULE 23 ────────────────────────────────────────────────────────────────
const m23: Module = {
  id: 'm23', number: 23, arc: 5,
  title: 'Reading Research Papers',
  description: 'The skill that separates practitioners who consume AI knowledge secondhand from those who engage with it directly at the frontier. How to find, read, and critically evaluate ML research papers — and how to translate what you read into working implementations and genuine understanding.',
  prerequisiteModuleId: 'm22',
  lessons: [
    {
      id: '23-1', number: '23.1',
      title: 'The Research Ecosystem — Finding What to Read',
      duration: 14,
      content: `# The Research Ecosystem — Finding What to Read

AI research is published faster than anyone can read it. In 2024, arXiv received over 200 AI/ML papers per day. The skill isn't reading everything — it's knowing what to read and where to find it.

## The Publication Landscape

### arXiv — The Preprint Server

arXiv (arxiv.org) is the central hub of AI research. Papers are posted before peer review — usually the same day as or before conference submission. This means:

- **Speed:** you can read a paper the day it's written, not 12 months later
- **No paywalls:** all papers are free
- **No quality filter:** anyone can post; quality varies enormously
- **Versioning:** papers get revised; v1 may differ substantially from v3

The key arXiv categories for AI:
- **cs.LG** — Machine Learning (algorithms, theory)
- **cs.CL** — Computation and Language (NLP, LLMs)
- **cs.AI** — Artificial Intelligence (general)
- **cs.CV** — Computer Vision
- **stat.ML** — Statistics and Machine Learning (more theoretical)

### The Top Conferences

Peer-reviewed research appears at these venues (in rough prestige order):

**NeurIPS** (Neural Information Processing Systems) — December. Largest ML conference; broad scope.

**ICML** (International Conference on Machine Learning) — July. Strong theory + applications.

**ICLR** (International Conference on Learning Representations) — May. Focused on deep learning; open review process (reviews are public).

**ACL / EMNLP / NAACL** — NLP-focused conferences. Essential for LLM research.

**CVPR / ICCV / ECCV** — Computer vision focused.

A paper at one of these venues has survived peer review by domain experts. Not infallible, but a meaningful quality signal.

## How to Find Papers Worth Reading

### Following the Frontier

**Twitter/X:** AI researchers post their papers here first. Follow the authors of papers you find valuable.

**Hugging Face Papers:** huggingface.co/papers — community-curated daily papers with discussion. High signal-to-noise ratio.

**Papers With Code:** paperswithcode.com — links papers to implementations and benchmark leaderboards. Essential for seeing state of the art.

**Semantic Scholar:** semanticscholar.org — academic search engine with citation graphs and AI-generated summaries.

**Connected Papers:** connectedpapers.com — visualises citation relationships; great for finding a paper's intellectual neighbourhood.

### Citation Chasing — The Most Reliable Method

Once you find one important paper, work outward:

**Backward (references):** what did this paper build on? The introduction and related work will cite the 5-10 most important prior works. Read those.

**Forward (citations):** who cited this paper since it was published? Google Scholar, Semantic Scholar, and arXiv show this. Recent high-citation papers extending important work are often worth reading.

\`\`\`
"Attention Is All You Need" (2017)
    ↑ cited by
    ├── "BERT" (2018)
    │   ↑ cited by "RoBERTa", "ALBERT", "DeBERTa"...
    ├── "GPT-2" (2019)
    │   ↑ cited by "GPT-3", "InstructGPT", "ChatGPT"...
    └── "Constitutional AI" (2022)
        ↑ cited by Anthropic alignment papers...
\`\`\`

## Building a Reading System

You will not remember everything you read without a system. Minimum viable setup:

**A reading log:** one file (Notion, Obsidian, plain text) with an entry per paper:
\`\`\`markdown
## Attention Is All You Need (Vaswani et al., 2017)
arXiv: 1706.03762
Read: 2025-01-15
Status: deep-read

### What it does
Introduces the Transformer architecture — eliminates recurrence entirely,
uses only attention mechanisms for sequence modelling.

### Key insight
Scaled dot-product attention + multi-head attention + positional encoding
achieves better results than RNN/LSTM at lower computational cost.

### Why it matters
Foundation of all modern LLMs. Every model in this curriculum builds on this.

### Questions / confusions
- Why sinusoidal positional encoding vs learned? (answered in ablations: comparable)
- How does masking work in decoder? (need to re-read 3.1)

### Implementation status
[ ] Implemented core attention
[ ] Implemented full Transformer block
\`\`\`

**A reading queue:** separate from the log — papers you intend to read. Keep it bounded (max 20 entries). Prune ruthlessly — most papers that seem important today won't be urgent in a week.

## Calibrating Your Reading Depth

Not all papers deserve the same attention:

| Depth | When | Time investment |
|---|---|---|
| Title + abstract only | Staying aware of a topic | 2 minutes |
| Introduction + conclusion | Assessing relevance | 10-15 minutes |
| Full paper skim | Getting the gist | 30-45 minutes |
| Deep read | Truly understanding the contribution | 2-4 hours |
| Implement and verify | Fully internalising | 1-3 days |

For every 50 papers you encounter: read abstracts for most, deep-read 5, implement 1. The implementation is where real understanding forms.`,
      keyTerms: ['arXiv', 'NeurIPS', 'ICML', 'ICLR', 'Papers With Code', 'citation chasing', 'reading log', 'reading depth'],
    },
    {
      id: '23-2', number: '23.2',
      title: 'Anatomy of an ML Paper — Reading Strategically',
      duration: 15,
      content: `# Anatomy of an ML Paper — Reading Strategically

Most people read papers like books — from first word to last. This is inefficient and often leads to getting lost in detail before understanding the big picture. Strategic reading extracts understanding proportional to effort.

## The Structure of an ML Paper

\`\`\`
Abstract        ← 1 paragraph, 3-5 minutes
Introduction    ← 1-2 pages, motivation and contributions
Related Work    ← 1-2 pages, situates paper in context
Method/Model    ← 2-5 pages, the core contribution
Experiments     ← 2-4 pages, how they tested it
Results         ← 1-3 pages, what they found (tables, figures)
Conclusion      ← 0.5 pages, summary and future work
Appendix        ← variable, proofs, additional experiments, implementation details
\`\`\`

## The Strategic Reading Order

**Don't read linearly.** Follow this order instead:

### Pass 1 — Big picture (15-20 minutes)
1. **Title** — what is this about?
2. **Abstract** — what problem, what approach, what results?
3. **Introduction** — why does this matter? What are the claimed contributions?
4. **Conclusion** — what did they find? Does it match the intro claims?
5. **All figures and tables** — figures encode the key results; read captions carefully

After Pass 1, you should know: what problem is being solved, what the proposed solution is, and whether the results are compelling. **Decide here whether a deeper read is warranted.**

### Pass 2 — Understanding the contribution (1-2 hours)
6. **Method section** — how does it work? Can you follow the architecture/algorithm?
7. **Main experiments table** — which baselines, which metrics, what are the gains?
8. **Ablation studies** — which components matter? What does each part contribute?
9. **Related work** — what prior work does this extend? Where does this fit?

After Pass 2, you should be able to explain the paper to someone else.

### Pass 3 — Deep verification (2-4 hours, selective)
10. **Appendix** — implementation details that may be critical for replication
11. **Proofs** — if you need mathematical certainty rather than intuition
12. **Work through the equations** — derive intermediate steps yourself

## Dissecting the Abstract

Every abstract answers (or should answer) these questions:
1. **What problem?** The motivation
2. **Why is it hard?** The challenge existing approaches don't solve
3. **What do we propose?** The method in one sentence
4. **How did we verify?** The experimental setup
5. **What did we achieve?** The quantitative result

\`\`\`
"We present a neural sequence to sequence learning framework [WHAT]
where the input and output are not necessarily aligned [WHY HARD].
We use long short-term memory (LSTM) units [WHAT WE PROPOSE]
and test on English to French translation [HOW VERIFIED],
achieving a BLEU score of 34.8 [RESULT]."
— Sutskever et al., 2014
\`\`\`

Read the abstract twice — once for the big picture, once checking each of these five questions is answered.

## Reading Figures Effectively

In ML papers, figures do most of the work. Learn to extract maximum information:

**Architecture diagrams:** trace the data flow. Where does input enter? What transformations happen? What's the output? Mark the key novelty.

**Training curves:** check if train and validation converge together (no overfitting), whether the authors ran long enough to plateau, whether the error bars overlap with baselines (statistical significance).

**Results tables:**
- Identify what's being compared (rows usually = methods, columns = benchmarks)
- Find the proposed method's row — where does it win? Where does it lose?
- Check if baseline implementations seem fair (were baselines tuned as carefully as the proposed method?)
- Bold = best in column. Does the proposed method win everywhere or selectively?

**Ablation tables:** each row removes one component. If removing a component degrades performance a lot, that component is important. If removal barely changes results, the component may not be doing much.

## Red Flags in Papers

Not all published research is rigorous. Watch for:

**Cherry-picked examples:** "here's an impressive case where our method works" — where are the failure cases?

**Incomparable baselines:** the proposed method was trained with more data, more compute, or longer than baselines. Not a fair comparison.

**Missing ablations:** the method has 5 novel components but ablations only test removing 1 — you don't know which components matter.

**Saturated benchmarks:** achieving 95% on a benchmark where humans score 90% and previous SOTA was 93% — the remaining headroom may be noise, not signal.

**Lack of statistical significance:** performance improvements within error bars that aren't tested for significance.

**Reproduced by no one:** a result that other labs can't replicate is suspect. Check Papers With Code for reproduction attempts.

## Using Claude to Accelerate Reading

\`\`\`typescript
// Upload the paper PDF and ask targeted questions
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 }
        },
        {
          type: 'text',
          text: \`Answer these questions about this paper:
1. What is the core technical contribution in one sentence?
2. What are the 3 most important equations and what does each mean?
3. What's the fairest criticism of this work?
4. What would I need to implement to reproduce the main result?\`
        }
      ]
    }
  ]
})
\`\`\`

Claude is excellent at: summarising, explaining notation, relating to other papers you mention, and identifying potential weaknesses. It's not reliable for: catching subtle mathematical errors, verifying experimental fairness, or generating novel insights about the work.`,
      keyTerms: ['abstract anatomy', 'strategic reading', 'three-pass method', 'ablation study', 'results table', 'cherry-picking', 'statistical significance', 'red flags'],
    },
    {
      id: '23-3', number: '23.3',
      title: 'Understanding the Mathematics',
      duration: 16,
      content: `# Understanding the Mathematics

The biggest barrier most practitioners face when reading ML papers isn't the ideas — it's the notation. The same mathematical concept appears with different symbols in different papers, and dense derivations can make a simple idea look impenetrable. This lesson gives you a toolkit for navigating the math.

## Decoding Notation

ML papers use a mix of conventions that are rarely fully defined. Common patterns:

\`\`\`
Scalars:        lowercase italics     x, y, α, β, λ
Vectors:        lowercase bold        x, h, z
Matrices:       uppercase bold        W, X, H
Sets:           script/calligraphic   𝒟, ℋ, 𝒳
Functions:      uppercase italics     L, F, P
Distributions:  𝒩(μ, σ²), 𝒰(a,b), Categorical(π)
Expectations:   𝔼[x], 𝔼_{x~p}[f(x)]
Norms:          ‖x‖₂ (L2), ‖x‖₁ (L1), ‖x‖_F (Frobenius)
Transpose:      Wᵀ, xᵀ
Hadamard:       A ⊙ B (element-wise product)
KL divergence:  KL(P ‖ Q) or D_KL(P ‖ Q)
\`\`\`

**The first time a paper uses a symbol, find its definition — usually nearby in the text.** Build your own notation table for each paper.

## The Equations That Appear Everywhere

Mastering these ~10 equations means you can read 80% of ML papers:

### Softmax
\`\`\`
softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)

Converts raw scores (logits) into a probability distribution.
The exp ensures all values are positive; dividing by the sum normalises.
\`\`\`

### Cross-entropy Loss
\`\`\`
L = -Σᵢ yᵢ log(ŷᵢ)

Where yᵢ is the true label (one-hot) and ŷᵢ is the predicted probability.
Penalises the model more when it's confident and wrong.
\`\`\`

### Scaled Dot-Product Attention
\`\`\`
Attention(Q, K, V) = softmax(QKᵀ / √dₖ) × V

Q = queries, K = keys, V = values (all matrices)
√dₖ scaling prevents dot products from growing large in high dimensions
The output is a weighted sum of values, weighted by query-key similarity
\`\`\`

### KL Divergence
\`\`\`
KL(P ‖ Q) = Σₓ P(x) log(P(x) / Q(x))

Measures how much distribution P differs from reference distribution Q.
Asymmetric: KL(P‖Q) ≠ KL(Q‖P)
Appears in: VAEs, RLHF (KL penalty), information theory arguments
\`\`\`

### Gradient Descent Update
\`\`\`
θ ← θ - η ∇_θ L(θ)

θ = parameters, η = learning rate, L = loss, ∇_θ = gradient w.r.t. θ
This is the core of all model training
\`\`\`

### Layer Normalisation
\`\`\`
LayerNorm(x) = γ × (x - μ) / (σ + ε) + β

μ = mean over features, σ = std over features
γ, β = learned scale and shift
ε = small constant for numerical stability (1e-5 typically)
\`\`\`

## The "What Does This Equation Do?" Framework

When you hit a dense equation, ask in order:

1. **What are the inputs?** Find what each variable represents
2. **What is the output shape?** Matrices have dimensions; understanding shape prevents confusion
3. **What operation is being performed?** Is this a dot product? A normalisation? A sampling step?
4. **What is the intuition?** Can you describe in words what this is computing?
5. **Can you trace a simple example?** With x = [1, 0, 0], what does this compute?

\`\`\`python
# Trace the attention mechanism with concrete numbers
import numpy as np

# 3 tokens, 4-dimensional embeddings
Q = np.array([[1, 0, 1, 0],   # query for token 1
              [0, 1, 0, 1],   # query for token 2
              [1, 1, 0, 0]])  # query for token 3

K = np.array([[1, 0, 1, 0],   # key for token 1
              [0, 1, 0, 1],   # key for token 2
              [0, 0, 1, 1]])  # key for token 3

V = np.array([[1, 0],   # value for token 1 (2-dim for simplicity)
              [0, 1],   # value for token 2
              [1, 1]])  # value for token 3

d_k = K.shape[-1]  # 4

# Step 1: compute raw attention scores
scores = Q @ K.T / np.sqrt(d_k)  # shape: (3, 3)
print("Scores:\n", scores)

# Step 2: softmax to get attention weights
def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return exp_x / exp_x.sum(axis=-1, keepdims=True)

weights = softmax(scores)  # shape: (3, 3), rows sum to 1
print("Attention weights:\n", weights)

# Step 3: weighted sum of values
output = weights @ V  # shape: (3, 2)
print("Output:\n", output)
# Each row: a weighted blend of all value vectors
# Token 1's output is mostly influenced by tokens most similar to its query
\`\`\`

## When to Work Through the Math vs. When to Skip

**Work through when:**
- This equation is the core contribution of the paper
- You're going to implement this
- The intuition you have doesn't match the behaviour you observe in code
- The paper's claims rest on this derivation

**Skip (for now) when:**
- This is background math you've seen before
- The paper provides a clear verbal intuition and you trust it
- This is a proof in the appendix for a result you accept empirically
- You're doing a first-pass read to assess relevance

The highest-leverage skill: knowing when to go deep and when to stay shallow. Not every equation in every paper needs to be derived from scratch.

## Resources for Filling Gaps

**The Matrix Calculus You Need For Deep Learning** (Parr & Howard) — covers derivatives with respect to matrices and vectors.

**Dive Into Deep Learning** (d2l.ai) — interactive textbook with runnable code for every concept.

**3Blue1Brown** — visual explanations of linear algebra, calculus, and neural networks. Essential for building geometric intuition.

**Distill.pub** — extraordinarily clear visual explanations of ML concepts. Sparse but gold.

**The Annotated Transformer** (Rush) — line-by-line implementation of "Attention Is All You Need" in PyTorch. The gold standard for paper-to-code translation.`,
      keyTerms: ['notation', 'softmax', 'cross-entropy', 'attention equation', 'KL divergence', 'layer normalisation', 'concrete tracing', 'matrix calculus'],
    },
    {
      id: '23-4', number: '23.4',
      title: 'Implementing from Papers',
      duration: 17,
      content: `# Implementing from Papers

Reading a paper and understanding it are different. Implementing the core idea is the only way to achieve the deep understanding that lets you build on, critique, and extend research. This lesson covers the paper-to-code workflow.

## The Implementation Mindset

**Start with the simplest version that reveals the key insight.** Don't implement the full model with all optimisations — implement the minimum that demonstrates the contribution.

For "Attention Is All You Need": you don't need the full translation system. Implement scaled dot-product attention and verify it does what the paper claims. That's the insight.

\`\`\`python
# The simplest possible implementation of the core insight
# Goal: verify the attention mechanism produces the right shapes and behaviour

import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor,
                                  mask: torch.Tensor = None) -> torch.Tensor:
    """
    Q: (batch, heads, seq_len, d_k)
    K: (batch, heads, seq_len, d_k)
    V: (batch, heads, seq_len, d_v)
    Returns: (batch, heads, seq_len, d_v)
    """
    d_k = Q.size(-1)

    # Scaled dot-product: QKᵀ / √dₖ
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)

    # Optional causal mask (decoder self-attention)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))

    # Softmax over last dimension (across key positions)
    weights = F.softmax(scores, dim=-1)

    # Weighted sum of values
    return torch.matmul(weights, V)

# Verify: simple 2-token, single-head example
batch, heads, seq, d_k, d_v = 1, 1, 3, 4, 4
Q = torch.randn(batch, heads, seq, d_k)
K = torch.randn(batch, heads, seq, d_k)
V = torch.randn(batch, heads, seq, d_v)

output = scaled_dot_product_attention(Q, K, V)
assert output.shape == (batch, heads, seq, d_v), f"Wrong shape: {output.shape}"
print("✓ Output shape correct:", output.shape)

# Verify weights sum to 1 (it's a probability distribution over key positions)
scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
weights = F.softmax(scores, dim=-1)
assert torch.allclose(weights.sum(dim=-1), torch.ones(batch, heads, seq)), "Weights don't sum to 1"
print("✓ Attention weights sum to 1")
\`\`\`

## The Paper-to-Code Workflow

\`\`\`
1. Identify the minimum implementable unit
   ↓
2. Read the relevant section carefully (Method)
   ↓
3. Note every design choice: shapes, operations, normalisations, initialisations
   ↓
4. Write type annotations and docstrings BEFORE the code
   ↓
5. Implement the simplest version (no optimisations)
   ↓
6. Write tests that verify paper-specified properties
   ↓
7. Compare to reference implementation (if one exists)
   ↓
8. Run the paper's experiments (simplified version) and check results
\`\`\`

## Common Gotchas in Paper Implementations

**The paper describes the final version, not the iterative process.** Things that look clean in the paper often required multiple implementation choices that aren't discussed. Check the appendix for "implementation details."

**Normalisation order matters.** "Pre-norm" (normalise before attention/MLP) vs "post-norm" (normalise after) are different architectures. Papers often don't make this explicit. The original Transformer used post-norm; most modern architectures use pre-norm.

\`\`\`python
# Post-norm (original Transformer)
x = layer_norm(x + attention(x))

# Pre-norm (modern default, GPT-2 onwards)
x = x + attention(layer_norm(x))
# More stable training, now standard
\`\`\`

**Initialisation matters more than you think.** Papers often specify weight initialisation schemes in appendices. Wrong initialisation can prevent training from starting.

\`\`\`python
# Good: Xavier/Glorot initialisation for attention projections
nn.init.xavier_uniform_(self.W_q.weight)
nn.init.zeros_(self.W_q.bias)
\`\`\`

**Causal masking in autoregressive models.** The decoder in Transformer-based language models must not attend to future tokens. Missing the mask produces a model that "cheats" during training and fails at inference.

**Learning rate schedule.** Many papers use warmup + cosine decay or warmup + inverse square root decay. The schedule is often mentioned only in experimental details and is critical for reproduction.

## Using Reference Implementations

Before implementing from scratch, check:

**Papers With Code** (paperswithcode.com) — links official and community implementations for most notable papers.

**GitHub search:** \`<paper title> implementation\` or \`<paper acronym> pytorch\`

**HuggingFace:** many architectures available; implementations are production-quality.

**The value of reading reference implementations:** even if you implement independently, reading a reference implementation reveals design choices the paper glossed over. Check yours against the reference implementation output on the same random seed.

\`\`\`python
# Shape-matching test against a reference implementation
import torch

# Your implementation
my_output = my_attention(Q, K, V)

# Reference implementation (e.g., from HuggingFace transformers)
ref_output = reference_attention(Q, K, V)

# Should be identical (modulo floating point)
assert torch.allclose(my_output, ref_output, atol=1e-5), \
    f"Max diff: {(my_output - ref_output).abs().max()}"
print("✓ Matches reference implementation")
\`\`\`

## Using Claude for Paper Implementation

Claude is particularly strong at this workflow:

\`\`\`typescript
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 2048,
  messages: [{
    role: 'user',
    content: \`I'm implementing the LoRA paper (Hu et al., 2021) in PyTorch.

The paper says LoRA represents weight updates as ΔW = BA where B ∈ ℝ^{d×r}
and A ∈ ℝ^{r×k}, with r << min(d,k).

Here's my implementation:
\${myCode}

Questions:
1. Is the initialisation correct? Paper says A is random Gaussian, B is zero.
2. Should I apply the α/r scaling factor before or after matmul?
3. My output shapes don't match — can you trace through the dimensions?\`
  }]
})
\`\`\`

Claude can: verify implementation logic, trace dimensions, explain what the paper means in your specific context, and catch common errors. It cannot: know what the paper's authors intended beyond what's written, or guarantee the implementation will reproduce results.

## Building Your Implementation Portfolio

For each paper you deeply read:

\`\`\`markdown
## Paper: "LoRA: Low-Rank Adaptation of Large Language Models" (2021)

### Core implementation
- [ ] LoRALinear layer (W + BA with α/r scaling)
- [ ] Apply to attention Q and V projections
- [ ] Verify parameter count reduction

### Tests
- [ ] Shape correctness test
- [ ] Weight initialisation test (B = zeros at init)
- [ ] Merge-and-unload produces equivalent forward pass

### Results check
- [ ] Plug into GPT-2; verify LoRA updates on forward pass
- [ ] Compare to full fine-tuning on a toy task

### Notes
- Pre-norm vs post-norm: paper uses pre-norm
- Merge: W_final = W_pretrained + (α/r) * B @ A
\`\`\`

Over time, this portfolio becomes a personal library of verified, tested implementations that you fully understand — worth more than 100 papers passively read.`,
      keyTerms: ['paper-to-code', 'minimum implementable unit', 'pre-norm vs post-norm', 'causal masking', 'reference implementation', 'shape testing', 'implementation portfolio'],
    },
  ],
  quizzes: [
    {
      id: 'q23-1', title: 'Research Ecosystem Quiz',
      type: 'lesson', moduleId: 'm23', passMark: 70,
      questions: [
        {
          id: 'q23-1-1', type: 'multiple_choice',
          question: 'What is the key tradeoff of reading papers from arXiv vs waiting for conference publication?',
          options: [
            'arXiv papers are free; conference papers require expensive subscriptions',
            'arXiv gives speed and free access but no peer review quality filter; conferences are slower but peer-reviewed',
            'arXiv papers have more citations; conference papers have better reproducibility',
            'arXiv only publishes computer science papers; conferences cover all ML domains',
          ],
          correctAnswer: 'arXiv gives speed and free access but no peer review quality filter; conferences are slower but peer-reviewed',
          gradingRubric: 'arXiv: papers posted same day as written (or before submission), all free, but no quality filter — anyone can post, quality varies enormously. Conference papers have survived peer review by domain experts (imperfect but meaningful quality signal) at the cost of 6-12 month delay.',
          xpValue: 10,
        },
        {
          id: 'q23-1-2', type: 'multiple_choice',
          question: 'What is "citation chasing" and why is it one of the most reliable methods for finding relevant papers?',
          options: [
            'Counting citations to rank papers by importance — higher citation count = more important',
            'Following references backward (what a paper builds on) and citations forward (who built on it) to map a topic\'s intellectual neighbourhood',
            'Searching for papers that cite the same author to find related work by the same researcher',
            'Using citation graphs to detect plagiarism between papers',
          ],
          correctAnswer: 'Following references backward (what a paper builds on) and citations forward (who built on it) to map a topic\'s intellectual neighbourhood',
          gradingRubric: 'Backward: a paper\'s references section contains the 5-10 most important prior works in the area. Forward: who has cited this paper reveals subsequent developments. Together they map the intellectual neighbourhood around a central paper — reliably surfacing the most relevant work.',
          xpValue: 10,
        },
        {
          id: 'q23-1-3', type: 'short_answer',
          question: 'Describe your ideal reading system for managing ML papers — what would you track for each paper and why, and how would you manage your reading queue?',
          gradingRubric: 'Strong answers should include: a reading log with per-paper entries covering (1) core contribution in one sentence, (2) key insight/intuition, (3) why it matters to your work, (4) questions and confusions to resolve, (5) implementation status. A reading queue capped at ~20 papers with ruthless pruning — most papers that seem urgent today won\'t matter next week. Depth calibration: don\'t read everything at the same depth; title+abstract for most, deep-read for 5-10%, implement for 1-2%. The log serves two purposes: comprehension (writing forces understanding) and retrieval (searchable when you need to recall something months later).',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q23-2', title: 'Strategic Reading Quiz',
      type: 'lesson', moduleId: 'm23', passMark: 70,
      questions: [
        {
          id: 'q23-2-1', type: 'multiple_choice',
          question: 'In the three-pass reading strategy, what should you decide after Pass 1 (big picture)?',
          options: [
            'Whether the mathematical proofs in the appendix are correct',
            'Whether this paper warrants a deeper read — is the contribution compelling enough?',
            'Which baseline to implement first when reproducing results',
            'Whether the paper\'s writing style is accessible enough to continue',
          ],
          correctAnswer: 'Whether this paper warrants a deeper read — is the contribution compelling enough?',
          gradingRubric: 'Pass 1 (title, abstract, intro, conclusion, all figures/tables) gives you the big picture in 15-20 minutes. After Pass 1 you know: what problem, what solution, are the results compelling? The key decision: does this merit the 1-4 hour investment of a deeper read? Most papers don\'t, for any given reader.',
          xpValue: 10,
        },
        {
          id: 'q23-2-2', type: 'multiple_choice',
          question: 'What do ablation study tables reveal that main results tables often hide?',
          options: [
            'The actual compute cost required to reproduce the results',
            'Which components of the method are actually responsible for the performance gain',
            'Whether the method works in languages other than English',
            'The failure cases and limitations of the proposed approach',
          ],
          correctAnswer: 'Which components of the method are actually responsible for the performance gain',
          gradingRubric: 'Ablation studies systematically remove individual components of the proposed method and measure the impact. If removing component X doesn\'t hurt performance, X probably isn\'t important. If removing X causes a large drop, X is the core contribution. Main results tables show overall performance; ablations reveal the actual sources of improvement.',
          xpValue: 10,
        },
        {
          id: 'q23-2-3', type: 'short_answer',
          question: 'List four specific red flags in ML papers that suggest the results may not be as strong as claimed, and explain how you would investigate each.',
          gradingRubric: 'Any four of: (1) Cherry-picked examples — only show cases where the method works well; investigate by asking where the failure cases are, checking if the paper has error analysis; (2) Incomparable baselines — proposed method used more data/compute than baselines; investigate by checking training conditions in appendix, comparing FLOPs or dataset size; (3) Saturated benchmarks — 95% on a task where human is 90% and prior SOTA was 93%; investigate by checking if the remaining gap is within noise/error bar; (4) Missing ablations — multi-component method with no per-component analysis; makes it impossible to know what matters; (5) No statistical significance testing — performance improvements that might be within noise; investigate by checking error bars, standard deviation, number of seeds; (6) No independent reproduction — check Papers With Code for reproduction attempts; if none, treat results cautiously.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q23-3', title: 'Mathematical Understanding Quiz',
      type: 'lesson', moduleId: 'm23', passMark: 70,
      questions: [
        {
          id: 'q23-3-1', type: 'multiple_choice',
          question: 'In the scaled dot-product attention formula, why is the score divided by √dₖ?',
          options: [
            'To normalise the output to the range [0, 1] before applying softmax',
            'To prevent dot products from growing large in high dimensions, which would push softmax into regions with very small gradients',
            'To match the scale of the value vectors so the weighted sum has correct magnitude',
            'To ensure the attention weights are symmetric (Aᵢⱼ = Aⱼᵢ)',
          ],
          correctAnswer: 'To prevent dot products from growing large in high dimensions, which would push softmax into regions with very small gradients',
          gradingRubric: 'As dₖ grows, dot products of random Q and K vectors grow in magnitude (variance grows linearly with dₖ). Large values push softmax outputs toward 0 and 1, producing very small gradients. Dividing by √dₖ keeps the variance at 1, maintaining softmax in the well-behaved region.',
          xpValue: 10,
        },
        {
          id: 'q23-3-2', type: 'multiple_choice',
          question: 'When should you work through the mathematics in a paper versus skim past it?',
          options: [
            'Always work through every equation — skimming math is a bad habit',
            'Skim all math on first pass; only work through equations for methods you plan to implement or that underpin key claims',
            'Only work through math if you plan to submit a review of the paper',
            'Skip math in NeurIPS papers; work through math in ICML papers which are more theory-focused',
          ],
          correctAnswer: 'Skim all math on first pass; only work through equations for methods you plan to implement or that underpin key claims',
          gradingRubric: 'Strategic depth: not every equation in every paper needs deriving. Work through equations that: (1) are the core contribution, (2) you\'ll implement, (3) underpin the paper\'s key claims, or (4) your intuition doesn\'t match observed behaviour. Background math, proofs of known results, and equations for components you won\'t use can be safely skimmed.',
          xpValue: 10,
        },
        {
          id: 'q23-3-3', type: 'short_answer',
          question: 'Apply the "what does this equation do?" framework to KL divergence: KL(P ‖ Q) = Σₓ P(x) log(P(x)/Q(x)). Explain inputs, output, operation, intuition, and give a concrete example.',
          gradingRubric: 'Inputs: P = target distribution (what we want), Q = approximate distribution (what we have). Both are probability distributions over the same event space x. Output: a scalar ≥ 0 measuring how different P is from Q. Operation: for each outcome x, compute P(x) × log(P(x)/Q(x)) — the log ratio is negative when Q overestimates P (Q(x) > P(x)) and positive when Q underestimates. Weight by P(x) — outcomes that actually occur under P matter most. Sum over all x. Intuition: how much information is lost when using Q to approximate P? Or equivalently, how many extra bits do you need to encode samples from P using a code optimised for Q? KL = 0 iff P = Q everywhere. Concrete example: P = [0.9, 0.1], Q = [0.5, 0.5]. KL(P‖Q) = 0.9 × log(0.9/0.5) + 0.1 × log(0.1/0.5) ≈ 0.9 × 0.588 + 0.1 × (-1.609) ≈ 0.529 - 0.161 = 0.368. KL(Q‖P) would give a different number — asymmetry.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q23-4', title: 'Implementation Workflow Quiz',
      type: 'lesson', moduleId: 'm23', passMark: 70,
      questions: [
        {
          id: 'q23-4-1', type: 'multiple_choice',
          question: 'Why should you implement the "minimum implementable unit" first rather than the full model?',
          options: [
            'The full model is too large to fit in memory on most development machines',
            'The minimum unit reveals the key insight without implementation complexity obscuring the understanding',
            'Papers with code only provide implementations of minimum units, not full models',
            'Starting small prevents intellectual property issues with full implementations',
          ],
          correctAnswer: 'The minimum implementation reveals the key insight without implementation complexity obscuring the understanding',
          gradingRubric: 'A full model adds data pipelines, training loops, optimisers, evaluation, and engineering scaffolding that obscures whether you understand the contribution. The minimum unit — just the novel component — can be implemented in 20-50 lines and verified immediately. Once you understand the core, the rest is engineering.',
          xpValue: 10,
        },
        {
          id: 'q23-4-2', type: 'multiple_choice',
          question: 'What is the difference between "pre-norm" and "post-norm" in Transformer implementations, and which is modern standard?',
          options: [
            'Pre-norm applies attention before the MLP layer; post-norm applies them in the opposite order',
            'Pre-norm normalises input before the sublayer (x + sublayer(norm(x))); post-norm normalises after; pre-norm is modern standard',
            'Pre-norm uses batch normalisation; post-norm uses layer normalisation',
            'Pre-norm is from the original Transformer paper; post-norm is a modern improvement',
          ],
          correctAnswer: 'Pre-norm normalises input before the sublayer (x + sublayer(norm(x))); post-norm normalises after; pre-norm is modern standard',
          gradingRubric: 'Post-norm (original Transformer): x = LayerNorm(x + sublayer(x)). Pre-norm (modern): x = x + sublayer(LayerNorm(x)). Pre-norm provides more stable gradients, especially for deep networks and long training runs — adopted by GPT-2 and nearly all subsequent architectures. Papers often don\'t specify which they used — check the code.',
          xpValue: 10,
        },
        {
          id: 'q23-4-3', type: 'short_answer',
          question: 'Describe the tests you would write to verify a LoRA implementation is correct, and explain what each test verifies about the implementation.',
          gradingRubric: 'Tests should include: (1) Shape test — given input of known shape, output matches expected shape; verifies the matrix multiplications are set up correctly; (2) Initialisation test — at initialisation, B=zeros so ΔW = BA = 0, meaning the LoRA layer is identical to the frozen base layer; verifies the paper\'s initialisation is implemented; (3) Parameter count test — count trainable parameters and verify they match the expected r*(d+k) formula; (4) Merge equivalence test — merge_and_unload() produces a model with identical forward pass output to the LoRA model; (5) Gradient flow test — confirm gradients flow to A and B but not to the frozen base weight W₀; (6) Scaling test — verify the α/r scaling factor is applied (output changes when alpha changes at fixed r); (7) Integration test — plug into a small language model, run a forward pass, verify loss is non-zero and decreases during training.',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p23', moduleId: 'm23',
    name: 'Paper Implementation',
    emoji: '📄',
    description: 'Choose a seminal AI paper and produce a complete implementation from scratch. Document your reading process (three-pass notes), implement the core contribution with full shape-annotated tests, compare against a reference implementation, and write a companion explainer blog post or notebook.',
    tools: ['PyTorch or JAX', 'Anthropic API for assistance', 'Papers With Code', 'Jupyter/notebook'],
    status: 'not_started',
    rubric: [
      'Three-pass reading notes documenting big-picture understanding, contribution, and implementation questions',
      'Core implementation in fewer than 200 lines — minimum unit that demonstrates the key insight',
      'Type annotations and docstrings written before code — clear specification of input/output shapes',
      'Test suite verifying all paper-specified properties (shapes, initialisations, mathematical properties)',
      'Output match against a reference implementation (same random seed → identical outputs within tolerance)',
      'Written companion explainer: the paper\'s key idea in plain English, why it works, and what you learned implementing it',
    ],
    xpReward: 380,
  },
}

// ─── MODULE 24 ────────────────────────────────────────────────────────────────
const m24: Module = {
  id: 'm24', number: 24, arc: 5,
  title: 'Personal AI Operating System',
  description: 'Build an AI system tuned entirely to you — your context, your workflows, your goals. From persistent memory and automatic context injection to personal agent pipelines and MCP servers for your own tools. The JARVIS module.',
  prerequisiteModuleId: 'm23',
  lessons: [
    {
      id: '24-1', number: '24.1',
      title: 'Designing Your Personal AI System',
      duration: 14,
      content: `# Designing Your Personal AI System

A generic AI assistant is useful. An AI assistant that knows your projects, your preferences, your schedule, your domain expertise, and your goals is transformative. This module is about building the latter — a personal AI operating system designed specifically for you.

## What Is a Personal AI OS?

Not an app, not a chatbot — an ecosystem of AI capabilities that integrates with your actual work, persists context across sessions, and automates workflows you currently do manually.

**Principles:**

**Context-first:** the AI should know what you're working on without you having to re-explain every session. Your projects, goals, preferences, and history should be available to it automatically.

**Composable:** built from small, well-defined components that can be mixed and matched — tools, MCP servers, agent pipelines — rather than one monolithic application.

**Private by default:** your data stays on your machine or your infrastructure. You decide what gets sent to external APIs.

**Extensible:** as your needs evolve, new tools and integrations can be added without rebuilding from scratch.

## The Architecture

\`\`\`
┌─────────────────────────────────────────────────────┐
│                  User Interface                      │
│    (Terminal / Claude Code / Custom UI / Telegram)   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Context Manager                         │
│   Injects: CLAUDE.md + Active Project + Memory      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                Claude API                            │
│     (claude-sonnet-4-20250514, tool use enabled)    │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  MCP Servers      Agent Tools    Memory System
  (filesystem,    (web search,   (semantic store,
   calendar,       code exec,     episodic log,
   GitHub,         shell)         daily journal)
   notes)
\`\`\`

## Identifying Your Automation Opportunities

Before building, map what you actually do:

\`\`\`markdown
## My Daily Workflows (audit)

### Morning
- [ ] Check emails, triage priority → could be automated
- [ ] Review GitHub notifications → could be automated
- [ ] Plan tasks for the day → could be assisted with AI

### Research tasks (maritime archaeology)
- [ ] Find relevant papers on a topic → could be automated
- [ ] Read and summarise sources → could be AI-assisted
- [ ] Cross-reference with existing notes → could be automated

### Development
- [ ] Code review before committing → could be AI-assisted
- [ ] Write commit messages → could be automated
- [ ] Update project documentation → could be assisted

### Weekly
- [ ] Review week's progress → could be AI-synthesised
- [ ] Plan next week → could be AI-assisted
\`\`\`

Automation targets: tasks that are (1) repetitive, (2) information-heavy, (3) time-consuming, or (4) where you consistently forget to do them.

## The CLAUDE.md as Personal Context

For Claude Code users, CLAUDE.md is a powerful personal context file:

\`\`\`markdown
# Personal AI OS — Context

## Who I am
- Anthony, 24, RAAF background
- Maritime archaeologist in training (James Cook University)
- Currently building Stark Academy (see ~/projects/stark-academy)
- Primary programming languages: TypeScript, Python
- Preferred editor: VS Code with Vim keybindings

## Active projects
- **Stark Academy**: AI education platform (see CLAUDE.md in project root)
- **Thesis**: Bronze Age Mediterranean trade routes (first draft due August)
- **Side**: Contributing to MARI (Maritime Archaeology Research Institute) database

## Working preferences
- Commit frequently with descriptive messages
- TypeScript strict mode, functional components
- Test before shipping
- Prefer explicit over implicit
- Don't ask clarifying questions if you can make a reasonable assumption

## Current focus (updated weekly)
Week of 2025-05-25:
- Priority 1: Complete Stark Academy curriculum (modules 21-26)
- Priority 2: Thesis Chapter 3 outline
- Priority 3: MARI database PR review

## Domain vocabulary (maritime archaeology)
- terminus post quem / terminus ante quem — dating bounds
- dendrochronology — tree-ring dating of ship timbers
- carvel / clinker — hull planking techniques
- typology — classification of artifact types
\`\`\`

This file is read at the start of every Claude Code session — persistent context for free.

## Privacy Architecture

Decide up front what stays local vs what goes to the API:

| Data type | Stay local | OK to send |
|---|---|---|
| Journal/diary entries | ✓ | ✗ |
| Health data | ✓ | ✗ |
| Financial records | ✓ | ✗ |
| Work code (proprietary) | ✓ per policy | ✗ by default |
| Research notes | Usually | When needed |
| Task lists | Usually | When needed |
| Public domain research | ✓ OK | ✓ |

Build your context injection to respect these categories — automated systems should not inadvertently send private data.`,
      keyTerms: ['personal AI OS', 'context manager', 'automation audit', 'CLAUDE.md', 'privacy architecture', 'composable system'],
    },
    {
      id: '24-2', number: '24.2',
      title: 'Persistent Context and Memory Engineering',
      duration: 16,
      content: `# Persistent Context and Memory Engineering

The biggest limitation of default Claude interactions is statelessness — every conversation starts fresh. Persistent context engineering eliminates this, making your AI assistant feel like a colleague who knows your work deeply.

## The Context Hierarchy

Layer your context from most stable to most dynamic:

\`\`\`
Layer 1: Identity (rarely changes)
  Who you are, domain expertise, communication preferences
  Source: CLAUDE.md, ~/.ai-context/identity.md
  Update frequency: monthly

Layer 2: Projects (changes weekly)
  Active projects, their status, key decisions made
  Source: per-project CLAUDE.md files, project summaries
  Update frequency: weekly

Layer 3: Current focus (changes daily)
  What you're working on today, blockers, priorities
  Source: daily note, task list, recent git commits
  Update frequency: daily

Layer 4: Session context (changes per conversation)
  What you're asking about right now, recent tool outputs
  Source: conversation history, active terminal output
  Update frequency: per interaction
\`\`\`

## Automatic Context Injection

Build a context assembler that computes what to inject based on what you're doing:

\`\`\`typescript
import path from 'path'
import fs from 'fs/promises'

interface ContextLayer {
  label: string
  content: string
  priority: number    // higher = injected first / given more weight
  tokenEstimate: number
}

async function assembleContext(currentDirectory: string): Promise<string> {
  const layers: ContextLayer[] = []

  // Layer 1: Identity (always included)
  const identity = await readFileIfExists(path.join(process.env.HOME!, '.ai-context/identity.md'))
  if (identity) {
    layers.push({ label: 'Identity', content: identity, priority: 100, tokenEstimate: estimate(identity) })
  }

  // Layer 2: Project context (if in a project directory)
  const projectClaude = await findInAncestors(currentDirectory, 'CLAUDE.md')
  if (projectClaude) {
    layers.push({ label: 'Project', content: projectClaude.content, priority: 80, tokenEstimate: estimate(projectClaude.content) })
  }

  // Layer 3: Today's focus
  const todayNote = await getTodayNote()
  if (todayNote) {
    layers.push({ label: 'Today', content: todayNote, priority: 60, tokenEstimate: estimate(todayNote) })
  }

  // Layer 4: Recent git activity (what have I been coding?)
  const recentCommits = await getRecentGitLog(currentDirectory, 5)
  if (recentCommits) {
    layers.push({ label: 'Recent commits', content: recentCommits, priority: 40, tokenEstimate: estimate(recentCommits) })
  }

  // Sort by priority, fit within token budget
  const TOKEN_BUDGET = 4000
  const sorted = layers.sort((a, b) => b.priority - a.priority)
  const included: ContextLayer[] = []
  let tokenCount = 0

  for (const layer of sorted) {
    if (tokenCount + layer.tokenEstimate < TOKEN_BUDGET) {
      included.push(layer)
      tokenCount += layer.tokenEstimate
    }
  }

  return included.map(l => \`## \${l.label}\n\${l.content}\`).join('\n\n')
}

async function findInAncestors(startDir: string, filename: string): Promise<{ content: string; path: string } | null> {
  let dir = startDir
  while (dir !== path.dirname(dir)) {
    const filePath = path.join(dir, filename)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return { content, path: filePath }
    } catch {}
    dir = path.dirname(dir)
  }
  return null
}
\`\`\`

## Semantic Memory — What You've Learned

Build a memory store that accumulates useful facts across sessions:

\`\`\`typescript
interface Memory {
  id: string
  content: string           // the fact/insight/preference
  embedding: number[]       // for similarity search
  category: 'preference' | 'fact' | 'decision' | 'note'
  source: string            // which conversation or tool created this
  timestamp: string
  accessCount: number
  lastAccessed: string
}

class PersonalMemoryStore {
  private memories: Memory[] = []
  private readonly dbPath = path.join(process.env.HOME!, '.ai-context/memories.json')

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8')
      this.memories = JSON.parse(data)
    } catch {
      this.memories = []
    }
  }

  async remember(content: string, category: Memory['category'], source: string): Promise<void> {
    const embedding = await embed(content)
    const memory: Memory = {
      id: crypto.randomUUID(),
      content, embedding, category, source,
      timestamp: new Date().toISOString(),
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
    }
    this.memories.push(memory)
    await this.save()
  }

  async recall(query: string, k = 5): Promise<Memory[]> {
    const queryVec = await embed(query)
    const scored = this.memories.map(m => ({
      memory: m,
      score: cosineSimilarity(queryVec, m.embedding),
    }))

    const top = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ memory }) => {
        memory.accessCount++
        memory.lastAccessed = new Date().toISOString()
        return memory
      })

    await this.save()
    return top
  }

  async forget(id: string): Promise<void> {
    this.memories = this.memories.filter(m => m.id !== id)
    await this.save()
  }

  private async save(): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(this.memories, null, 2))
  }
}
\`\`\`

## The Daily Note System

A daily note that auto-generates morning context and accumulates through the day:

\`\`\`typescript
async function generateDailyNote(): Promise<string> {
  const today = new Date().toISOString().split('T')[0]
  const notePath = path.join(process.env.HOME!, \`notes/daily/\${today}.md\`)

  // Check if today's note already exists
  try {
    return await fs.readFile(notePath, 'utf-8')
  } catch {}

  // Generate fresh daily note using yesterday's note + tasks
  const yesterdayNote = await getYesterdayNote()
  const pendingTasks = await getPendingTasks()
  const calendarEvents = await getCalendarToday()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: 'You are a personal AI assistant creating a daily planning note.',
    messages: [{
      role: 'user',
      content: \`Create a concise daily note for \${today}.

Yesterday's note: \${yesterdayNote || 'No note'}
Pending tasks: \${pendingTasks || 'None'}
Today's calendar: \${calendarEvents || 'No events'}

Format as markdown with sections: Focus, Tasks, Notes. Keep brief.\`
    }]
  })

  const note = response.content[0].type === 'text' ? response.content[0].text : ''
  await fs.writeFile(notePath, \`# Daily Note — \${today}\n\n\${note}\n\n---\n\`)
  return note
}
\`\`\`

## Context-Aware Tool Selection

Your personal AI OS should automatically surface relevant tools based on context:

\`\`\`typescript
function selectTools(context: string): Tool[] {
  const tools: Tool[] = []

  // Always available
  tools.push(webSearchTool, calculatorTool)

  // Context-dependent
  if (context.includes('git') || context.includes('code') || context.includes('project')) {
    tools.push(gitTool, fileSystemTool, terminalTool)
  }

  if (context.includes('paper') || context.includes('research') || context.includes('thesis')) {
    tools.push(arxivSearchTool, pdfReaderTool, citationTool)
  }

  if (context.includes('calendar') || context.includes('schedule') || context.includes('meeting')) {
    tools.push(calendarTool)
  }

  return tools
}
\`\`\``,
      keyTerms: ['context hierarchy', 'context injection', 'semantic memory', 'daily note', 'memory store', 'context-aware tools', 'token budget'],
    },
    {
      id: '24-3', number: '24.3',
      title: 'Personal Agent Workflows',
      duration: 15,
      content: `# Personal Agent Workflows

Once context infrastructure is in place, build agent workflows that automate your specific repetitive tasks. This lesson covers designing, building, and scheduling personal agent pipelines.

## Identifying Agent-Worthy Workflows

Good candidates for agent automation:
- **High information load:** requires reading/synthesising many sources
- **Repetitive structure:** same steps every time, just different inputs
- **Low judgment required:** the decisions are mostly obvious
- **Easy to verify:** you can quickly check if the output is right

\`\`\`markdown
## Candidate Workflow Audit

### Morning briefing
Steps: check arXiv for AI papers → summarise relevant ones →
       check GitHub notifications → draft reply to important issues
Automation potential: HIGH — structured, repetitive, information-heavy

### Literature review for thesis chapter
Steps: search for papers → read abstracts → deep-read promising ones →
       extract relevant quotes → synthesise into outline
Automation potential: MEDIUM — reading/synthesis needs judgment,
                                but finding and filtering can be automated

### Weekly progress review
Steps: review git commits → review completed tasks →
       identify blockers → draft next week's priorities
Automation potential: HIGH — structured synthesis from structured data
\`\`\`

## Building a Morning Briefing Agent

\`\`\`typescript
async function morningBriefingAgent(): Promise<string> {
  const today = new Date().toISOString().split('T')[0]

  // Step 1: Gather raw information in parallel
  const [arxivPapers, githubNotifications, pendingTasks, calendarEvents] = await Promise.all([
    fetchArxivPapers(['cs.LG', 'cs.CL'], 24),  // last 24 hours
    fetchGitHubNotifications(),
    fetchPendingTasks(),
    fetchCalendarEvents(today),
  ])

  // Step 2: Filter and prioritise arXiv papers
  const relevantPapers = await client.messages.create({
    model: 'claude-haiku-4-20250514',  // cheap for filtering
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: \`I'm a maritime archaeologist building AI tools.
Filter these arXiv papers to those relevant to my interests.
Keep maximum 5. Return as JSON array with {title, arxivId, relevanceReason}.

Papers:
\${arxivPapers.map(p => \`\${p.id}: \${p.title} — \${p.abstract.slice(0, 200)}\`).join('\n')}\`
    }]
  })

  // Step 3: Synthesise into briefing
  const briefing = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: \`You are Anthony's personal AI assistant. Create a concise,
    actionable morning briefing. Prioritise what needs attention today.\`,
    messages: [{
      role: 'user',
      content: \`Create today's morning briefing.

Today: \${today}
Calendar: \${JSON.stringify(calendarEvents)}
GitHub notifications requiring attention: \${githubNotifications.length}
Pending tasks: \${pendingTasks.slice(0, 5).join(', ')}
Relevant new papers: \${relevantPapers.content[0].type === 'text' ? relevantPapers.content[0].text : ''}

Format: short bullet points, action-oriented, under 300 words.\`
    }]
  })

  const text = briefing.content[0].type === 'text' ? briefing.content[0].text : ''

  // Step 4: Deliver via preferred channel
  await sendToTelegram(text)        // or write to daily note, or display in terminal
  await appendToDailyNote(today, text)

  return text
}
\`\`\`

## Scheduling Agent Workflows

\`\`\`typescript
// Using node-cron for scheduled execution
import cron from 'node-cron'

// Morning briefing at 7:30 AM on weekdays
cron.schedule('30 7 * * 1-5', async () => {
  console.log('Running morning briefing agent...')
  try {
    await morningBriefingAgent()
  } catch (error) {
    await sendAlert(\`Morning briefing failed: \${error}\`)
  }
}, { timezone: 'Australia/Brisbane' })

// Weekly review every Sunday at 6 PM
cron.schedule('0 18 * * 0', async () => {
  await weeklyReviewAgent()
})

// Hourly: check for urgent GitHub issues
cron.schedule('0 * * * *', async () => {
  await checkUrgentNotifications()
})
\`\`\`

## The Research Assistant Workflow

For the maritime archaeology thesis work:

\`\`\`typescript
async function researchAssistantWorkflow(topic: string, chapterContext: string): Promise<void> {
  const sessionId = crypto.randomUUID()

  // Step 1: Find relevant papers
  const papers = await Promise.all([
    searchArxiv(topic),
    searchSemanticScholar(topic),
    searchJSTOR(topic),  // via API key
  ])

  const allPapers = deduplicateByDOI(papers.flat())
  console.log(\`Found \${allPapers.length} candidate papers\`)

  // Step 2: Filter by relevance to thesis
  const relevant = await filterByRelevance(allPapers, chapterContext)
  console.log(\`\${relevant.length} papers pass relevance filter\`)

  // Step 3: For each relevant paper, extract key quotes and arguments
  const extractions = await parallelWithLimit(
    relevant.map(paper => () => extractKeyContent(paper, topic)),
    3  // max 3 concurrent
  )

  // Step 4: Synthesise into a research note
  const synthesis = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: \`You are a research assistant for a maritime archaeology thesis.
    Synthesise sources into a structured research note with proper academic citations.\`,
    messages: [{
      role: 'user',
      content: \`Topic: \${topic}
Chapter context: \${chapterContext}

Source extractions:
\${extractions.map(e => \`---\n\${e}\`).join('\n')}

Produce: key arguments, evidence gaps, suggested thesis contribution, bibliography.\`
    }]
  })

  // Step 5: Save to research notes
  const note = synthesis.content[0].type === 'text' ? synthesis.content[0].text : ''
  await saveResearchNote(topic, sessionId, note, extractions)
  console.log(\`Research note saved for: \${topic}\`)
}
\`\`\`

## Trigger-Based Agents

Agents don't have to run on a schedule — they can be triggered by events:

\`\`\`typescript
// Watch for new files in a folder (e.g., PDFs downloaded from academic databases)
import chokidar from 'chokidar'

const watcher = chokidar.watch(path.join(process.env.HOME!, 'Downloads'), {
  ignored: /(^|[\/\\])\../,
  persistent: true,
})

watcher.on('add', async (filePath) => {
  if (filePath.endsWith('.pdf')) {
    console.log(\`New PDF detected: \${filePath}\`)
    await processPDF(filePath)  // extract, summarise, save to notes
  }
})

// Watch for git commits (post-commit hook)
// In .git/hooks/post-commit:
// #!/bin/sh
// node ~/scripts/ai-commit-summary.js
\`\`\``,
      keyTerms: ['morning briefing agent', 'cron scheduling', 'trigger-based agent', 'research assistant workflow', 'parallel processing', 'notification delivery'],
    },
    {
      id: '24-4', number: '24.4',
      title: 'Personal MCP Servers and Tool Integration',
      duration: 15,
      content: `# Personal MCP Servers and Tool Integration

The final layer of your Personal AI OS: custom MCP servers that expose your own tools, data, and services to Claude. This is where the system becomes genuinely personal — not just generic tools but integrations with your specific data and workflows.

## Tools Worth Building as MCP Servers

\`\`\`typescript
// My personal MCP server exposes:
const myTools = [
  'search_my_notes',          // semantic search over Obsidian vault
  'get_thesis_outline',       // current chapter structure
  'search_research_papers',   // my personal paper library (Zotero/local)
  'get_project_status',       // summarise a project from git + tasks
  'search_bookmarks',         // my saved web bookmarks
  'add_to_reading_list',      // add a URL or paper to my queue
  'get_calendar_free_time',   // when am I available?
  'run_shell_safely',         // curated set of safe shell commands
]
\`\`\`

## Building a Notes MCP Server (Obsidian/Markdown)

\`\`\`typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const NOTES_DIR = path.join(process.env.HOME!, 'notes')

const server = new Server(
  { name: 'personal-notes', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_notes',
      description: 'Semantic search over all personal notes and research',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number', default: 5 },
          folder: { type: 'string', description: 'Limit search to a subfolder' },
        },
        required: ['query'],
      },
    },
    {
      name: 'read_note',
      description: 'Read the full content of a specific note',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Relative path from notes root' },
        },
        required: ['path'],
      },
    },
    {
      name: 'create_note',
      description: 'Create a new note in the notes system',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          folder: { type: 'string', description: 'Subfolder (e.g., "thesis", "research", "daily")' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'content'],
      },
    },
    {
      name: 'link_notes',
      description: 'Find notes related to a given note (by content similarity)',
      inputSchema: {
        type: 'object',
        properties: {
          notePath: { type: 'string' },
          limit: { type: 'number', default: 5 },
        },
        required: ['notePath'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'search_notes') {
    const folder = args.folder ? path.join(NOTES_DIR, args.folder) : NOTES_DIR
    const results = await semanticSearchNotes(args.query, folder, args.limit || 5)
    return {
      content: [{
        type: 'text',
        text: results.map(r => \`## \${r.title} (score: \${r.score.toFixed(2)})\n\${r.excerpt}\`)
          .join('\n\n---\n\n')
      }]
    }
  }

  if (name === 'create_note') {
    const folder = path.join(NOTES_DIR, args.folder || 'inbox')
    const filename = \`\${args.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md\`
    const fullPath = path.join(folder, filename)
    const tags = (args.tags || []).map((t: string) => \`- \${t}\`).join('\n')
    const content = \`---
title: \${args.title}
date: \${new Date().toISOString().split('T')[0]}
tags:\n\${tags}
---

\${args.content}\`

    await fs.mkdir(folder, { recursive: true })
    await fs.writeFile(fullPath, content)
    return { content: [{ type: 'text', text: \`Note created: \${fullPath}\` }] }
  }

  throw new Error(\`Unknown tool: \${name}\`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
\`\`\`

## Registering Your MCP Servers

For Claude Code, add to \`~/.claude/settings.json\`:
\`\`\`json
{
  "mcpServers": {
    "personal-notes": {
      "command": "node",
      "args": ["/Users/anthony/ai-os/mcp-servers/notes/index.js"],
      "description": "Personal notes and research search"
    },
    "personal-projects": {
      "command": "node",
      "args": ["/Users/anthony/ai-os/mcp-servers/projects/index.js"]
    },
    "maritime-research": {
      "command": "node",
      "args": ["/Users/anthony/ai-os/mcp-servers/maritime/index.js"]
    }
  }
}
\`\`\`

For Claude Desktop, add to \`~/Library/Application Support/Claude/claude_desktop_config.json\`:
\`\`\`json
{
  "mcpServers": {
    "personal-notes": {
      "command": "node",
      "args": ["/Users/anthony/ai-os/mcp-servers/notes/index.js"]
    }
  }
}
\`\`\`

## Evolution Strategy — Start Small, Compound

**Month 1:** CLAUDE.md + daily note + morning briefing script

**Month 2:** Personal notes MCP server + memory store

**Month 3:** Research assistant workflow + automated paper filtering

**Month 4:** Project status MCP + weekly review agent

**Month 5+:** Domain-specific tools (maritime database MCP, thesis tracking, etc.)

Each addition compounds. By month 6, your AI assistant knows your work as well as a dedicated human assistant would — without the privacy tradeoffs of sharing your data with a person.

## The Compounding Effect

The most powerful aspect of a Personal AI OS isn't any single tool — it's the compounding of context over time.

Day 1: Claude knows your name and preferences.
Week 4: Claude knows your active projects and their status.
Month 3: Claude knows the decisions you've made and why.
Month 6: Claude knows your thesis argument, your go-to sources, your writing style, your blockers.
Year 1: Claude knows your intellectual trajectory — what you were thinking six months ago, what changed your mind, what you're building toward.

This is qualitatively different from a generic assistant. It's the difference between having a capable stranger help you and having a deeply-context-aware collaborator.`,
      keyTerms: ['personal MCP server', 'notes integration', 'tool registration', 'context compounding', 'evolution strategy', 'trigger-based automation', 'claude settings.json'],
    },
  ],
  quizzes: [
    {
      id: 'q24-1', title: 'Personal AI OS Design Quiz',
      type: 'lesson', moduleId: 'm24', passMark: 70,
      questions: [
        {
          id: 'q24-1-1', type: 'multiple_choice',
          question: 'What are the four core principles of a well-designed Personal AI OS?',
          options: [
            'Fast, cheap, accurate, scalable',
            'Context-first, composable, private by default, extensible',
            'Cloud-hosted, always-on, multi-device, shareable',
            'Automated, intelligent, integrated, auditable',
          ],
          correctAnswer: 'Context-first, composable, private by default, extensible',
          gradingRubric: 'Context-first (knows your work without re-explaining), composable (small components that mix), private by default (your data stays local), extensible (new tools can be added). These four principles distinguish a personal AI OS from a generic AI chatbot.',
          xpValue: 10,
        },
        {
          id: 'q24-1-2', type: 'multiple_choice',
          question: 'Which types of workflows are the BEST candidates for agent automation?',
          options: [
            'High-judgment creative decisions requiring novel thinking',
            'Sensitive interpersonal communications requiring emotional intelligence',
            'High information load, repetitive structure, low judgment required, easy to verify',
            'One-time novel tasks that require creative problem-solving',
          ],
          correctAnswer: 'High information load, repetitive structure, low judgment required, easy to verify',
          gradingRubric: 'Best automation candidates: information-heavy (reading many sources), repetitive (same steps every time), low judgment (decisions mostly obvious), easy to verify (you can quickly check output quality). Poor candidates: novel creative tasks, high-stakes interpersonal situations, tasks requiring genuine expertise judgment.',
          xpValue: 10,
        },
        {
          id: 'q24-1-3', type: 'short_answer',
          question: 'Design the context injection system for your personal AI OS. What would your four layers be, what content belongs in each, and how often would each be updated?',
          gradingRubric: 'Strong answers should describe four distinct layers with clear separation of concerns: (1) Identity/persona layer (rarely changes — who you are, domain expertise, working style, communication preferences; updated monthly); (2) Projects layer (changes weekly — active projects with current status, key decisions, blockers; updated weekly or after major decisions); (3) Daily focus layer (changes daily — today\'s priorities, schedule, pending tasks; updated each morning or automatically from task manager/calendar); (4) Session layer (changes per conversation — what\'s currently open, recent tool output, immediate task context; injected automatically from cwd, recent git, etc.). Should also address token budget management — not all layers can fit simultaneously, so priority ordering and token budgeting are needed.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q24-2', title: 'Context and Memory Quiz',
      type: 'lesson', moduleId: 'm24', passMark: 70,
      questions: [
        {
          id: 'q24-2-1', type: 'multiple_choice',
          question: 'In the context assembler, why does the system sort layers by priority and apply a token budget?',
          options: [
            'To comply with Anthropic\'s rate limits on context window usage',
            'To ensure the most important context fits within the available context window when total context exceeds limits',
            'To reduce API costs by sending fewer tokens per request',
            'To prevent the model from being confused by too much context',
          ],
          correctAnswer: 'To ensure the most important context fits within the available context window when total context exceeds limits',
          gradingRubric: 'Context windows have limits. If all four layers together exceed the budget, you need to prioritise. Sorting by priority (identity > project > daily > session) and including layers until budget is hit ensures the most important context always makes it in, while less critical context is dropped gracefully.',
          xpValue: 10,
        },
        {
          id: 'q24-2-2', type: 'multiple_choice',
          question: 'What does the memory store\'s "access count" field enable?',
          options: [
            'Billing users per memory access in a commercial system',
            'Implementing memory decay or promoting frequently-used memories in retrieval ranking',
            'Auditing which memories have been shared with external services',
            'Tracking how many different sessions have accessed a given memory',
          ],
          correctAnswer: 'Implementing memory decay or promoting frequently-used memories in retrieval ranking',
          gradingRubric: 'Access count + last accessed timestamp enables: (1) recency + frequency scoring — memories accessed often and recently rank higher in retrieval; (2) decay — memories never accessed after a threshold can be pruned; (3) promotion — frequently needed memories can be elevated to persistent context. Mirrors human memory consolidation.',
          xpValue: 10,
        },
        {
          id: 'q24-2-3', type: 'short_answer',
          question: 'Describe the "compounding effect" of a Personal AI OS over time, and explain why this qualitatively differs from using a generic AI assistant for individual tasks.',
          gradingRubric: 'Compounding effect: context accumulates over months. Day 1 knows basic preferences. Month 1 knows active projects. Month 3 knows decisions made and reasoning. Month 6 knows intellectual trajectory, go-to sources, writing style, blockers, thesis argument. Qualitative difference from generic assistants: (1) No re-explaining context every session — weeks of context available instantly; (2) The AI can notice patterns across time ("you always get stuck on X before deadline — is that happening now?"); (3) Recommendations are personalised to your actual work, not generic advice; (4) The AI knows what you don\'t know yet (gaps in your research notes) rather than just what you tell it; (5) Trust develops — you know the AI understands your context and don\'t have to hedge every request with background explanation.',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q24-3', title: 'Agent Workflows Quiz',
      type: 'lesson', moduleId: 'm24', passMark: 70,
      questions: [
        {
          id: 'q24-3-1', type: 'multiple_choice',
          question: 'In the morning briefing agent, why is the filtering step done with claude-haiku rather than claude-sonnet?',
          options: [
            'Haiku has better paper-reading capabilities than Sonnet',
            'Filtering is a simple classification task — Haiku is cheap and fast enough; Sonnet is reserved for synthesis requiring higher quality',
            'The Batch API requires using Haiku for preprocessing steps',
            'Haiku has a larger context window suitable for processing many papers simultaneously',
          ],
          correctAnswer: 'Filtering is a simple classification task — Haiku is cheap and fast enough; Sonnet is reserved for synthesis requiring higher quality',
          gradingRubric: 'Model routing applied to personal workflows: filtering (is this paper relevant? yes/no) is a simple classification task well within Haiku\'s capability at ~20× lower cost than Sonnet. Sonnet handles synthesis (creating the coherent briefing) where quality matters. This is cost engineering applied to personal automation.',
          xpValue: 10,
        },
        {
          id: 'q24-3-2', type: 'multiple_choice',
          question: 'What distinguishes trigger-based agents from scheduled (cron-based) agents, and when is each appropriate?',
          options: [
            'Trigger-based agents are more expensive; scheduled agents are more reliable',
            'Scheduled agents run on a time interval; trigger-based agents run when an event occurs — triggers are better for event-driven workflows',
            'Scheduled agents use Claude API; trigger-based agents use open-source models locally',
            'Trigger-based agents require MCP servers; scheduled agents work without MCP',
          ],
          correctAnswer: 'Scheduled agents run on a time interval; trigger-based agents run when an event occurs — triggers are better for event-driven workflows',
          gradingRubric: 'Cron/scheduled: run at fixed intervals regardless of whether anything relevant happened (morning briefing, weekly review). Trigger-based: run when a specific event occurs (new PDF downloaded, git commit, email from advisor, file changed). Triggers are more efficient (don\'t run unnecessarily) and more responsive (immediate reaction to events).',
          xpValue: 10,
        },
        {
          id: 'q24-3-3', type: 'short_answer',
          question: 'Design a complete agent workflow for one repetitive task in your own work or studies. Specify: the trigger or schedule, the information sources, the processing steps, the model/cost strategy, and the output/delivery mechanism.',
          gradingRubric: 'Strong answers should be specific and realistic, including: (1) Clear trigger or schedule (cron expression or event type); (2) Concrete information sources (which APIs, files, databases — not vague "gather information"); (3) Processing steps with model choice rationale (e.g., Haiku for filtering, Sonnet for synthesis); (4) Error handling / what happens if a step fails; (5) Specific output format and delivery method (Telegram, file, daily note, email, terminal). Bonus: parallelisation where steps are independent. Assessment note: the actual workflow doesn\'t have to be the "right" answer — what matters is that the design is coherent, specific, and demonstrates understanding of the principles (model routing, parallel execution, error handling, context injection).',
          xpValue: 20,
        },
      ],
    },
    {
      id: 'q24-4', title: 'MCP Integration Quiz',
      type: 'lesson', moduleId: 'm24', passMark: 70,
      questions: [
        {
          id: 'q24-4-1', type: 'multiple_choice',
          question: 'What makes a personal notes MCP server more valuable than just letting Claude read files directly?',
          options: [
            'MCP servers are faster because they bypass the API\'s token limits',
            'An MCP server adds semantic search, structured access patterns, and can abstract over your specific note storage system',
            'MCP servers encrypt notes before sending them to the Claude API',
            'Claude cannot read files directly — MCP is the only way to access local files',
          ],
          correctAnswer: 'An MCP server adds semantic search, structured access patterns, and can abstract over your specific note storage system',
          gradingRubric: 'Claude can read files via Claude Code\'s file tools. But a notes MCP server adds: (1) semantic search (find notes by meaning, not just filename); (2) structured access patterns (search_notes, read_note, create_note, link_notes); (3) abstraction — if you change from Obsidian to Notion, update the MCP server without changing any prompts; (4) custom indexing and metadata not available through raw file access.',
          xpValue: 10,
        },
        {
          id: 'q24-4-2', type: 'multiple_choice',
          question: 'Describe the recommended evolution strategy for building a Personal AI OS and why starting small matters.',
          options: [
            'Build all components simultaneously to see how they interact before using any',
            'Start with the most impressive features to motivate continued development',
            'Start with CLAUDE.md and a daily note, add one component per month — compounding context over time',
            'Wait until all tools are perfect before starting to use the system',
          ],
          correctAnswer: 'Start with CLAUDE.md and a daily note, add one component per month — compounding context over time',
          gradingRubric: 'Start small: CLAUDE.md (persistent identity context) + daily note (daily context) can be built in hours and provides immediate value. Add MCP servers, agent workflows, and memory systems incrementally. Starting small matters because: (1) each component is independently valuable; (2) you learn what you actually need before over-engineering; (3) context starts compounding from day one even with minimal tooling; (4) sustainable — doesn\'t require a big-bang implementation.',
          xpValue: 10,
        },
        {
          id: 'q24-4-3', type: 'short_answer',
          question: 'Design the tool interface (tool name, description, and input schema) for a personal MCP server tool that fits your actual workflow. Explain what data source it accesses and how it would be useful in practice.',
          gradingRubric: 'Strong answers should provide: (1) A specific tool name that follows the convention (verb_noun); (2) A clear description that tells Claude when to use it and what it returns; (3) A typed input_schema with required and optional fields; (4) The specific data source (file path, database, API, service — not vague "my data"); (5) A concrete use case explaining when Claude would call this tool and what it would enable. The tool should be genuinely personal (not a generic tool that anyone would build) and address a real workflow need. Assessment focus: specificity, coherence of the interface design, and practical utility.',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p24', moduleId: 'm24',
    name: 'Personal AI OS',
    emoji: '🤖',
    description: 'Build and deploy your own Personal AI Operating System. Must include: layered context injection system, semantic memory store, at least two personal MCP servers exposing your own data, a scheduled morning briefing agent, and a trigger-based workflow agent. Document the system architecture and the "week 1 vs week 4" context difference.',
    tools: ['Anthropic API', '@modelcontextprotocol/sdk', 'node-cron or equivalent', 'vector DB for memory'],
    status: 'not_started',
    rubric: [
      'Layered context system: at least 3 layers (identity, project, daily) with token budget management and auto-injection',
      'Semantic memory store: persist, retrieve, and decay memories across sessions with cosine similarity search',
      'Minimum 2 personal MCP servers: one accessing your notes/documents, one accessing a personal data source',
      'Morning briefing agent: runs on schedule, pulls from 3+ information sources, delivers personalised daily briefing',
      'Trigger-based workflow: at least one agent triggered by a real event (file change, new download, git commit, etc.)',
      'Architecture documentation: diagram + explanation of how context compounds over time, with example of week 1 vs week 4 context difference',
    ],
    xpReward: 460,
  },
}

// ─── MODULE 25 ────────────────────────────────────────────────────────────────
const m25: Module = {
  id: 'm25', number: 25, arc: 5,
  title: 'Maritime and Domain AI',
  description: 'How to make powerful general models genuinely useful in a specialised field — using maritime archaeology as the case study. Covers domain adaptation strategies, computer vision for sonar and photogrammetry, NLP for historical ship records, and the full end-to-end pipeline from raw field data to AI-assisted site report.',
  prerequisiteModuleId: 'm24',
  lessons: [
    {
      id: '25-1', number: '25.1',
      title: 'Domain-Specific AI — The Specialisation Imperative',
      duration: 16,
      content: `# Domain-Specific AI — The Specialisation Imperative

General-purpose language models are trained on the internet. Maritime archaeology is not the internet. If you ask Claude about a "vessel assemblage with in-situ concretion and displaced stratigraphy," it will give a technically coherent answer — but it won't know whether you're describing a Hellenistic amphora wreck or a 19th-century steam collier. Domain expertise matters, and this lesson is about how to inject it.

## Why General Models Struggle

**Vocabulary gaps.** Every field has jargon that looks like English but means something precise. A "site datum" in archaeology is the fixed reference point from which all measurements are taken — not a piece of data. "Spoil area" is where dredged sediment is deposited. "In situ" means the artefact hasn't moved from where it was deposited. "Assemblage" refers to a collection of objects from the same context. A model that doesn't know these will misinterpret your questions.

**Distributional shift.** Historical ship logs are written in 17th-century English with abbreviations, unusual spelling, and domain conventions (e.g. BM for burthen merchant, Ts for tons). General models are trained mostly on modern text.

**Tacit knowledge.** Experienced maritime archaeologists know that a scatter of copper alloy fasteners and pine planking at a particular depth off a particular coast likely indicates a specific era of vessel construction. This pattern-matching requires domain context that no general model has unless you provide it.

## Three Adaptation Strategies

\`\`\`
Strategy         | When to use                        | Cost
─────────────────|────────────────────────────────────|──────────────
Prompting        | Quick, prototype, changing needs   | Low
RAG              | Large corpus, factual accuracy     | Medium
Fine-tuning      | High-volume, consistent style      | High
\`\`\`

For most maritime archaeology work, **RAG is the sweet spot** — you build a corpus of domain documents (UNESCO 2001 Convention text, historical wreck databases, your own site reports, Lloyd's Register digitisations) and retrieve relevant context at query time.

## Building a Maritime Domain Prompt

The simplest improvement: a detailed system prompt with domain context injected before every query.

\`\`\`typescript
const MARITIME_SYSTEM_PROMPT = \`You are an AI assistant specialising in maritime archaeology and underwater cultural heritage.

Domain knowledge:
- Vessel construction periods: clinker (pre-1500), carvel (1450+), iron/steel (post-1850)
- Key artefact materials: copper alloy fasteners, lead sheathing, wooden hull planking, ceramic cargo, iron fittings
- Site formation processes: scouring, burial, concretion, biological colonisation
- Standard recording: Harris matrix for stratigraphy, photogrammetry for site plans, RTK GPS for datum

Terminology:
- In situ: object has not moved from original depositional context
- Assemblage: group of artefacts from same archaeological context
- Spoil area: zone of disturbed sediment from dredging or excavation
- Datum point: fixed reference from which all measurements are taken
- GPR: Ground Penetrating Radar — detects sub-sediment anomalies
- Side-scan sonar: produces acoustic image of seabed texture
- Multibeam echo sounder: generates bathymetric depth map

When answering questions:
1. Use correct archaeological terminology
2. Consider site formation processes when interpreting anomalies
3. Note when additional survey methods would clarify interpretation
4. Flag any cultural heritage protection considerations\`
\`\`\`

## Building a Domain Knowledge Base

For RAG, you need a corpus. For maritime archaeology, good sources include:

**Primary databases:**
- UNESCO Underwater Cultural Heritage database
- NAHBS (National Historic Ships — UK)
- NOAA's Maritime Heritage Program database
- Lloyd's Register digitisation projects (years 1764–1993)
- Your own site reports and dive logs

**Key texts to index:**
- Muckelroy's *Maritime Archaeology* (1978) — theoretical foundations
- Dean et al., *Archaeological Recording Manual for Maritime Sites* (1992)
- UNESCO Convention on the Protection of the Underwater Cultural Heritage (2001)
- Annex Rules: 36 rules governing excavation, in-situ preservation, access

**Building the corpus:**
\`\`\`typescript
// Your domain RAG pipeline (from Module 15)
const maritimeCorpus = await buildCorpus([
  './data/site-reports/*.pdf',
  './data/lloyd-register-extracts/*.txt',
  './data/unesco-convention.txt',
  './data/wreck-database.json',
])

// Chunk with maritime-aware boundaries
// Ship log entries, paragraph breaks, table rows are natural boundaries
const chunks = chunkDocuments(maritimeCorpus, {
  maxTokens: 400,
  overlap: 50,
  preserveBoundaries: ['entry', 'paragraph', 'table-row'],
})
\`\`\`

## Depth Calibration

Not every question needs the full domain system. Use a routing approach:

\`\`\`
Query type                          | Strategy
────────────────────────────────────|──────────────────────────────────
"What is side-scan sonar?"          | System prompt sufficient
"Is this sonar return anomalous?"   | System prompt + retrieved context
"Date this vessel construction"     | RAG over timber typology docs
"Translate this 1673 ship log"      | Fine-tuned OCR + translation model
"Site significance assessment"      | Full pipeline + expert review
\`\`\`

The key insight: **domain adaptation is a spectrum**, not a binary. Start with prompting, add RAG when factual accuracy matters, consider fine-tuning only when volume and consistency requirements justify the cost.`,
      keyTerms: ['domain adaptation', 'vocabulary gap', 'distributional shift', 'tacit knowledge', 'domain RAG', 'maritime corpus', 'in situ', 'assemblage', 'datum point'],
    },
    {
      id: '25-2', number: '25.2',
      title: 'Computer Vision for Maritime Archaeology',
      duration: 18,
      content: `# Computer Vision for Maritime Archaeology

Underwater archaeology is inherently visual — sonar images, photogrammetric models, ROV video, core sample photographs. AI vision has reached a level where it can genuinely assist with analysis, not just novelty demos. This lesson covers the practical application of computer vision to maritime archaeological data.

## Sonar Imagery Types

**Side-scan sonar** — emits sound pulses perpendicular to the vessel track. Returns produce an acoustic "shadow image" of the seabed. Wreck sites appear as bright returns (hard structures) with acoustic shadows behind them. Ideal for initial survey sweeps.

**Multibeam echo sounder (MBES)** — emits a fan of beams directly below the vessel, measuring depth at many angles simultaneously. Produces high-resolution bathymetric maps. Can detect proud wreck structures, debris fields, and sub-bottom anomalies.

**Sub-bottom profiler** — penetrates sediment using low-frequency acoustic pulses. Can detect buried hull remains, cargo, and archaeological features below the seabed surface.

## Sonar Interpretation Challenges

Interpreting sonar imagery is a skilled, time-consuming task. AI can assist with:

**Anomaly detection:** flagging unusual returns in a track that warrant closer inspection.
\`\`\`
Normal seabed return → low variance, consistent texture
Wreck candidate → high-amplitude return, acoustic shadow, elongated form
Debris field → scattered anomalies with irregular spacing
Geological feature → consistent topographic pattern, no shadow
\`\`\`

**Assisted annotation pipeline:**
\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

async function analyseSonarImage(imageBase64: string, metadata: {
  frequency: string
  depth: number
  location: string
  date: string
}) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: \`Analyse this side-scan sonar image from a maritime archaeological survey.

Survey metadata:
- Sonar frequency: \${metadata.frequency}
- Water depth: \${metadata.depth}m
- Location: \${metadata.location}
- Date: \${metadata.date}

Identify:
1. Any anomalous returns suggesting cultural material (wrecks, debris, anchors)
2. Acoustic shadow characteristics if present
3. Seabed sediment type (hard/soft/mixed based on return intensity)
4. Recommended follow-up survey actions
5. Priority rating: HIGH / MEDIUM / LOW / NONE

Format as structured JSON.\`,
        },
      ],
    }],
    system: 'You are an expert maritime archaeologist specialising in remote sensing and geophysical survey interpretation.',
  })

  return response.content[0].type === 'text' ? JSON.parse(response.content[0].text) : null
}
\`\`\`

## Photogrammetry and 3D Recording

Structure from Motion (SfM) photogrammetry is now standard in maritime archaeology. Overlapping photographs are processed into point clouds, 3D meshes, and orthomosaics.

**The pipeline:**
\`\`\`
Overlapping photos (60%+ overlap)
    → Feature detection (SIFT/ORB keypoints)
    → Feature matching between images
    → Camera pose estimation (bundle adjustment)
    → Dense point cloud generation
    → Mesh reconstruction
    → Texture mapping
    → Orthomosaic export
\`\`\`

**Software:** Agisoft Metashape (industry standard), COLMAP (open source), RealityCapture.

**AI for photogrammetric analysis:**
- Automated scale bar detection
- Artefact classification in orthomosaic (ceramic, metal, organics)
- Change detection between survey seasons
- Automated site plan annotation

\`\`\`typescript
// Classify artefacts in a site orthomosaic
async function classifyOrthomosaic(imageBase64: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        {
          type: 'text',
          text: \`This is an orthomosaic of an underwater archaeological site.

Map all visible artefacts as a JSON array. For each artefact provide:
{
  "id": "unique identifier",
  "material": "ceramic|metal|organic|concretion|uncertain",
  "estimated_size": "small (<10cm)|medium (10-50cm)|large (>50cm)",
  "condition": "intact|fragmented|heavily_concreated|degraded",
  "location_description": "descriptive position relative to main structure",
  "archaeological_notes": "any observations about manufacture, date, use"
}

Focus on culturally significant material. Ignore natural seabed features.\`,
        },
      ],
    }],
  })

  return response
}
\`\`\`

## ROV Video Analysis

ROV footage is a rich but time-consuming data source. An AI pipeline can:

1. **Extract key frames** at regular intervals or on motion detection
2. **Classify each frame** for content type (hull structure, artefact, biota, sediment)
3. **Flag significant frames** for archaeologist review
4. **Generate a time-coded summary** of site features observed

\`\`\`typescript
// Process ROV video — extract and classify frames
import ffmpeg from 'fluent-ffmpeg'
import * as fs from 'fs'

async function analyseROVVideo(videoPath: string, outputDir: string) {
  // Extract frame every 5 seconds
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions(['-vf', 'fps=0.2'])  // 1 frame per 5 seconds
      .output(\`\${outputDir}/frame-%04d.jpg\`)
      .on('end', resolve)
      .on('error', reject)
      .run()
  })

  const frames = fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg'))
  const results = []

  for (const frame of frames) {
    const imageData = fs.readFileSync(\`\${outputDir}/\${frame}\`)
    const base64 = imageData.toString('base64')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
          { type: 'text', text: 'Classify this ROV frame: { "type": "hull|artefact|biota|sediment|equipment|unclear", "significance": "high|medium|low", "notes": "brief description" }' },
        ],
      }],
    })

    results.push({ frame, analysis: response.content[0] })
  }

  return results.filter(r => {
    const analysis = JSON.parse((r.analysis as any).text)
    return analysis.significance === 'high'
  })
}
\`\`\`

## Practical Limitations

**Turbidity:** Murky water degrades image quality. AI performance degrades with image quality — build confidence thresholds into your pipeline and flag low-quality frames for manual review.

**Marine growth:** Heavy concretion and biofouling obscure artefact form. AI trained on clean museum objects will struggle. Include degraded examples in your domain prompting.

**Depth calibration:** Without scale references in the image, size estimates are approximate. Always include scale bars in photogrammetric recording.

**False positives in sonar:** Geological features (sand waves, rock outcrops, pipe laying) produce returns similar to wreck sites. Never act on AI-flagged anomalies without follow-up diver or ROV inspection.

The maxim: **AI is a survey assistant, not an archaeological interpreter.** It accelerates data processing, reduces the manual burden of reviewing thousands of sonar lines or hours of video, and surfaces candidates for expert assessment. The professional judgement remains yours.`,
      keyTerms: ['side-scan sonar', 'multibeam echo sounder', 'sub-bottom profiler', 'photogrammetry', 'Structure from Motion', 'orthomosaic', 'ROV video analysis', 'anomaly detection', 'acoustic shadow'],
    },
    {
      id: '25-3', number: '25.3',
      title: 'NLP for Historical Maritime Research',
      duration: 16,
      content: `# NLP for Historical Maritime Research

Every wreck has a paper trail — if it sank in a documented era. Ship registration records, insurance logs, newspaper accounts, admiralty dispatches, customs manifests, and private correspondence collectively hold the historical identity of vessels that now lie on the seabed. AI-assisted NLP makes working with this corpus tractable.

## The Historical Document Problem

**OCR quality** — handwritten documents require specialised models. Printed 17th-20th century documents have variable type quality, foxing, water damage, and non-standard letterforms. Modern OCR achieves 98%+ on clean printed text but drops significantly on historical material.

**Language drift** — 17th-century English uses different spelling conventions (*shippe*, *accompt*, *burthen*), abbreviations (BM = burthen merchant, Ts = tons), and syntactic structures that confuse models trained on modern text.

**Domain abbreviations** — Lloyd's Register alone has hundreds of specialised codes (character class, construction quality, equipment surveys) that require a domain key to interpret.

**Handwriting variation** — every clerk had a different hand. Transfer learning on historical handwriting models (e.g. Transkribus) is currently the best approach for handwritten primary sources.

## OCR Pipeline for Historical Documents

\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

// Claude Vision is remarkably capable at historical document OCR
async function transcribeHistoricalDocument(imageBase64: string, docType: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: \`You are a specialist in historical maritime document transcription.

You understand:
- 17th-20th century English spelling conventions and abbreviations
- Lloyd's Register notation (character class, equipment surveys, ownership records)
- Admiralty log formatting and naval record conventions
- Customs manifest layout (vessel name, master, cargo, port, tonnage)
- Common abbreviations: BM (burthen merchant), Ts (tons), Sk (sloop/schooner), Bg (brig),
  Bk (barque), SS (steam ship), SY (steam yacht), NE (not examined)\`,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        {
          type: 'text',
          text: \`Transcribe this \${docType} exactly as written.
Then provide a normalised modern English version.
Format:
TRANSCRIPTION:
[exact transcription]

NORMALISED:
[modern interpretation with expanded abbreviations]

EXTRACTED ENTITIES:
- Vessel name:
- Type/rig:
- Tonnage:
- Master:
- Owner:
- Port of registry:
- Year:
- Cargo (if manifest):
- Notable events:\`,
        },
      ],
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
\`\`\`

## Entity Extraction at Scale

A digitised Lloyd's Register volume contains thousands of vessel entries. Entity extraction converts unstructured text into structured records.

\`\`\`typescript
interface VesselRecord {
  name: string
  rig: string
  tonnage: number | null
  yearBuilt: number | null
  buildingPort: string | null
  master: string | null
  owner: string | null
  portOfRegistry: string | null
  charClass: string | null
  lastSurveyYear: number | null
}

async function extractVesselEntities(rawText: string): Promise<VesselRecord> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: \`Extract vessel information from this Lloyd's Register entry as JSON matching this schema:
{
  "name": string,
  "rig": "ship|barque|brig|brigantine|schooner|sloop|ketch|steam|other",
  "tonnage": number | null,
  "yearBuilt": number | null,
  "buildingPort": string | null,
  "master": string | null,
  "owner": string | null,
  "portOfRegistry": string | null,
  "charClass": string | null,
  "lastSurveyYear": number | null
}

Entry text:
\${rawText}

Return only the JSON object.\`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text)
}
\`\`\`

## Building a Shipwreck Knowledge Graph

Isolated vessel records are useful. A connected knowledge graph is transformative. Linking vessel records to Lloyd's data, newspaper accounts, admiralty loss lists, and site survey data creates a rich network for research.

\`\`\`
Vessel: ELEANOR (1834)
    ├─ Built at: Aberdeen, Scotland (builder record)
    ├─ Owner: James Morrison & Co., London (Lloyd's)
    ├─ Routes: London–Sydney, 1834–1847 (customs manifests)
    ├─ Incidents: Grounded off Kangaroo Island, 1841 (newspaper)
    ├─ Lost: Bass Strait storm, June 1847 (admiralty loss list)
    └─ Wreck site: Candidate site WA-2024-047 (survey record)
\`\`\`

**Graph construction:**
\`\`\`typescript
// Neo4j or simple adjacency list
interface VesselNode {
  id: string
  name: string
  properties: VesselRecord
}

interface HistoricalEvent {
  type: 'built' | 'registered' | 'voyage' | 'incident' | 'lost'
  date: string
  location: string
  source: string
  description: string
}

interface WreckCandidate {
  siteId: string
  confidence: 'confirmed' | 'probable' | 'possible' | 'speculative'
  surveyDate: string
  surveyMethod: string
}

// Link historical record to physical site
async function matchVesselToSite(
  vessel: VesselRecord & { events: HistoricalEvent[] },
  site: WreckCandidate & { observations: string[] }
) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: \`Assess the probability that this vessel is the site described.

VESSEL RECORD:
\${JSON.stringify(vessel, null, 2)}

SITE OBSERVATIONS:
\${site.observations.join('\\n')}

Provide:
1. Probability assessment (high/medium/low/unlikely) with reasoning
2. Concordant features (what matches)
3. Discordant features (what doesn't match)
4. Additional research needed to confirm/refute identification\`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
\`\`\`

## Newspaper Mining for Loss Accounts

19th-century newspapers are extensively digitised (Trove, British Newspaper Archive, Papers Past). They contain contemporaneous accounts of maritime losses with details not found in official records.

**What newspaper accounts contain that official records don't:**
- Eyewitness accounts of sinking events
- Cargo details (including undeclared or unusual cargo)
- Weather and sea conditions
- Names of survivors and casualties
- Salvage attempts and their outcomes
- Insurance disputes revealing concealed vessel condition

**Search and extract pipeline:**
\`\`\`typescript
async function mineNewspaperAccount(articleText: string, targetVessel: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: \`This is a 19th-century newspaper article. Extract all maritime loss information relevant to the vessel "\${targetVessel}".

Article:
\${articleText}

Extract:
1. Date and location of incident
2. Circumstances of loss
3. Weather conditions
4. Cargo and passengers
5. Survivors and casualties
6. Salvage information
7. Any discrepancies from official records
8. Reliability assessment of the account

Format as structured report.\`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
\`\`\`

## The Full Historical Research Pipeline

\`\`\`
Digitised primary sources
    → OCR + transcription (Claude Vision / Transkribus)
    → Entity extraction (vessel names, dates, locations, events)
    → Knowledge graph construction (Neo4j / JSON-LD)
    → Cross-source linking (same vessel across Lloyd's, customs, newspapers)
    → Wreck candidate matching (historical record ↔ site survey)
    → Site significance assessment report (Claude synthesis)
\`\`\`

This pipeline transforms months of archival research into days — not by replacing the expertise required to interpret records, but by making the tedious processing work tractable at scale.`,
      keyTerms: ['historical OCR', 'entity extraction', 'knowledge graph', 'Lloyd\'s Register', 'admiralty records', 'Transkribus', 'newspaper mining', 'wreck identification', 'primary source'],
    },
    {
      id: '25-4', number: '25.4',
      title: 'End-to-End Domain AI Pipeline',
      duration: 16,
      content: `# End-to-End Domain AI Pipeline

This lesson assembles everything into a coherent Maritime AI Research Assistant — a working system that integrates sonar analysis, historical research, computer vision, and report generation. We also address the ethical frameworks that govern work with underwater cultural heritage.

## Architecture Overview

\`\`\`
Input Layer
├── Sonar images (side-scan, MBES rasters)
├── Historical documents (Lloyd's, customs, newspapers)
├── Site photos/orthomosaics (photogrammetry outputs)
├── Dive logs and field notes (text)
└── GIS data (coordinates, depths, survey tracks)

Processing Layer
├── Vision pipeline (sonar analysis, artefact classification)
├── NLP pipeline (OCR, entity extraction, knowledge graph)
├── Retrieval layer (domain RAG over corpus)
└── Synthesis layer (Claude with full domain context)

Output Layer
├── Site significance assessment
├── Vessel identification report
├── Survey recommendation
└── Cultural heritage management advice
\`\`\`

## The Maritime AI Research Assistant

\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface SiteRecord {
  siteId: string
  coordinates: { lat: number; lon: number }
  depth: number
  surveyDate: string
  sonarFindings: string
  visualObservations: string[]
  artefactDescriptions: string[]
}

interface HistoricalMatch {
  vesselName: string
  confidence: 'confirmed' | 'probable' | 'possible' | 'speculative'
  evidenceSummary: string
}

interface AssessmentReport {
  siteId: string
  significance: 'exceptional' | 'high' | 'medium' | 'low'
  historicalMatches: HistoricalMatch[]
  managementRecommendation: string
  furtherResearchRequired: string[]
  protectionConsiderations: string[]
}

async function generateSiteAssessment(
  site: SiteRecord,
  relevantHistory: string  // Retrieved from domain RAG
): Promise<AssessmentReport> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: \`You are an expert maritime archaeologist conducting professional site significance assessments.

You apply the criteria of the UNESCO 2001 Convention and relevant national legislation (Australian Historic Shipwrecks Act 1976, UK Protection of Wrecks Act 1973) when assessing significance.

Significance criteria (ICOMOS Burra Charter adapted for maritime contexts):
- Historic significance: association with important people, events, or periods
- Scientific significance: capacity to yield information about maritime history or technology
- Social significance: importance to communities (including Indigenous consultation requirements)
- Aesthetic significance: design, craftsmanship, artistic value
- Rarity: uniqueness or scarcity of vessel type, period, or context

Always note if Indigenous cultural heritage consultation may be required.\`,
    messages: [{
      role: 'user',
      content: \`Generate a professional site significance assessment for the following maritime archaeological site.

SITE DATA:
ID: \${site.siteId}
Location: \${site.coordinates.lat}°, \${site.coordinates.lon}°
Depth: \${site.depth}m
Survey date: \${site.surveyDate}

Sonar findings:
\${site.sonarFindings}

Visual observations:
\${site.visualObservations.join('\\n')}

Artefact descriptions:
\${site.artefactDescriptions.join('\\n')}

RELEVANT HISTORICAL CONTEXT (from research database):
\${relevantHistory}

Produce a structured assessment report as JSON matching the AssessmentReport interface.\`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text)
}
\`\`\`

## GIS Integration

Maritime AI pipelines generate spatial data that belongs in a GIS environment. QGIS is the open-source standard; the qgis Python API allows automation.

\`\`\`python
# QGIS Python console — add AI-classified sonar anomalies as layer
from qgis.core import QgsVectorLayer, QgsFeature, QgsGeometry, QgsPointXY
import json

# Load AI analysis results
with open('sonar_anomalies.json') as f:
    anomalies = json.load(f)

# Create memory layer
layer = QgsVectorLayer('Point?crs=EPSG:4326', 'AI Sonar Anomalies', 'memory')
provider = layer.dataProvider()

features = []
for anomaly in anomalies:
    if anomaly['significance'] in ['high', 'medium']:
        feature = QgsFeature()
        feature.setGeometry(QgsGeometry.fromPointXY(
            QgsPointXY(anomaly['lon'], anomaly['lat'])
        ))
        feature.setAttributes([
            anomaly['id'],
            anomaly['significance'],
            anomaly['type'],
            anomaly['notes'],
        ])
        features.append(feature)

provider.addFeatures(features)
QgsProject.instance().addMapLayer(layer)
\`\`\`

## Ethical Framework: UNESCO 2001 Convention

Any use of AI in maritime archaeology must operate within the legal and ethical framework governing underwater cultural heritage.

**Key principles:**
- **In-situ preservation** as the first option — excavation only when preservation is not possible or research benefit is exceptional
- **Non-commercial exploitation** — UCH shall not be commercially exploited
- **No dispersal** — artefacts shall not be sold, bought, or bartered as commercial items
- **State reporting obligations** — discoveries must be reported to competent authorities

**AI-specific considerations:**

*Data sovereignty:* Sonar data, site locations, and historical records relating to vessels may be subject to national sovereignty claims. Share responsibly.

*Indigenous cultural heritage:* Many wrecks carry significance beyond their European maritime identity. First Nations communities may have rights and interests in wrecks and their cargo. Consultation is not optional — it's ethically required and increasingly legally mandated.

*Dual-use risk:* Precise site coordinates published in AI outputs could enable illegal looting. Implement access controls; publish general locations, not pinpoint coordinates, in open reports.

**Looting prevention in your pipeline:**
\`\`\`typescript
// Sanitise AI outputs before publication
function sanitiseForPublication(report: AssessmentReport): PublicAssessmentReport {
  return {
    siteId: report.siteId,
    // Truncate coordinates to ~1km precision for public reports
    approximateLocation: {
      lat: Math.round(report.coordinates.lat * 100) / 100,
      lon: Math.round(report.coordinates.lon * 100) / 100,
    },
    significance: report.significance,
    // Omit specific artefact descriptions that could guide looters
    summaryFindings: report.managementRecommendation,
    furtherResearch: report.furtherResearchRequired,
    // Always include the protection notice
    protectionStatus: 'This site is protected under applicable national and international law. Unauthorised interference is a criminal offence.',
  }
}
\`\`\`

## Your Competitive Advantage

Anthony, here's the honest truth about where you stand: a 24-year-old maritime archaeologist who can build AI pipelines for sonar analysis, historical NLP, and automated site assessment is genuinely rare. The field is full of talented archaeologists. It is not full of archaeologists who can write TypeScript, design RAG systems, and understand ICOMOS significance criteria simultaneously.

The opportunity: **most maritime archaeology institutions have decades of unprocessed data.** Site photos never analysed. Survey recordings reviewed once and filed. Lloyd's Register extracts that were manually transcribed at enormous cost and then rarely searched. Your unique position is to be the person who unlocks that archive.

That's not a technology pitch. It's an observation about where the value is and who can reach it.`,
      keyTerms: ['maritime AI pipeline', 'GIS integration', 'QGIS', 'UNESCO 2001 Convention', 'in-situ preservation', 'cultural heritage ethics', 'data sovereignty', 'Indigenous consultation', 'looting prevention'],
    },
  ],
  quizzes: [
    {
      id: 'q25-1', moduleId: 'm25', type: 'lesson',
      title: 'Domain Specialisation Quiz',
      passMark: 70,
      questions: [
        {
          id: 'q25-1-1', type: 'multiple_choice',
          question: 'A maritime archaeologist asks Claude about a "vessel assemblage with in-situ concretion." The model gives a technically coherent but archaeologically imprecise answer. This is BEST described as:',
          options: ['Model hallucination', 'Vocabulary gap causing domain misinterpretation', 'Context window limitation', 'A fine-tuning failure'],
          correctAnswer: 'Vocabulary gap causing domain misinterpretation',
          gradingRubric: 'The model understands the words but not the precise archaeological meaning — a vocabulary gap / distributional shift problem, not hallucination or context limits.',
          xpValue: 10,
        },
        {
          id: 'q25-1-2', type: 'multiple_choice',
          question: 'For a maritime archaeology workflow needing factual accuracy with a large corpus of site reports and historical records, which adaptation strategy offers the best cost-accuracy tradeoff?',
          options: ['Zero-shot prompting only', 'RAG with a domain corpus', 'Full fine-tuning on domain data', 'Few-shot prompting with 5 examples'],
          correctAnswer: 'RAG with a domain corpus',
          gradingRubric: 'RAG retrieves relevant domain context at query time, providing factual accuracy from the corpus without the cost and rigidity of fine-tuning.',
          xpValue: 10,
        },
        {
          id: 'q25-1-3', type: 'short_answer',
          question: 'A side-scan sonar return shows a bright elongated feature with an acoustic shadow. A colleague says the AI flagged it as "high significance." What is the correct next step before concluding it is a wreck site?',
          gradingRubric: 'Follow-up inspection (diver, ROV, or sub-bottom profiler) is required. AI-flagged sonar anomalies must be verified before being treated as confirmed wreck sites — geological features can produce similar returns.',
          xpValue: 15,
        },
        {
          id: 'q25-1-4', type: 'multiple_choice',
          question: 'The UNESCO 2001 Convention\'s primary management principle for underwater cultural heritage is:',
          options: [
            'Commercial salvage rights for finder nations',
            'In-situ preservation as the first option',
            'Mandatory excavation within 5 years of discovery',
            'Open-access publication of all site coordinates',
          ],
          correctAnswer: 'In-situ preservation as the first option',
          gradingRubric: 'The Convention establishes in-situ preservation as the default approach, with excavation only when preservation is impossible or the research benefit is exceptional.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q25-2', moduleId: 'm25', type: 'lesson',
      title: 'Computer Vision for Maritime Sites Quiz',
      passMark: 70,
      questions: [
        {
          id: 'q25-2-1', type: 'multiple_choice',
          question: 'Which sonar system produces a bathymetric depth map of the seabed (rather than an acoustic shadow image)?',
          options: ['Side-scan sonar', 'Sub-bottom profiler', 'Multibeam echo sounder', 'Chirp sonar'],
          correctAnswer: 'Multibeam echo sounder',
          gradingRubric: 'MBES emits a fan of beams measuring depth at multiple angles, producing a 3D bathymetric surface. Side-scan produces acoustic shadow images; sub-bottom penetrates sediment.',
          xpValue: 10,
        },
        {
          id: 'q25-2-2', type: 'multiple_choice',
          question: 'Structure from Motion photogrammetry produces which output for archaeological recording?',
          options: ['Sub-bottom sediment profiles', 'Acoustic shadow maps', 'Point clouds and orthomosaics', 'GPR radargrams'],
          correctAnswer: 'Point clouds and orthomosaics',
          gradingRubric: 'SfM processes overlapping photographs into dense point clouds, 3D meshes, and orthomosaic plan views — the standard output for photogrammetric site recording.',
          xpValue: 10,
        },
        {
          id: 'q25-2-3', type: 'short_answer',
          question: 'An AI ROV video analysis pipeline flags 15 frames as "high significance" from 4 hours of footage. What quality control step is essential before these findings are included in a site report?',
          gradingRubric: 'Expert archaeologist review of all flagged frames. AI classification of video frames has false positives (marine growth, equipment, sediment disturbance can be misclassified). All flags must be verified by a qualified person before inclusion in official records.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q25-3', moduleId: 'm25', type: 'lesson',
      title: 'Historical Research NLP Quiz',
      passMark: 70,
      questions: [
        {
          id: 'q25-3-1', type: 'multiple_choice',
          question: 'When transcribing a 19th-century Lloyd\'s Register entry with Claude Vision, what should the output include beyond a literal transcription?',
          options: [
            'Only the exact transcription with no interpretation',
            'A normalised modern version with expanded abbreviations and extracted entities',
            'A modern rewrite that corrects historical spelling errors',
            'A summary paragraph replacing the original text',
          ],
          correctAnswer: 'A normalised modern version with expanded abbreviations and extracted entities',
          gradingRubric: 'The pipeline produces exact transcription (preserving the original), a normalised version (expanded abbreviations, modern spelling), and structured entity extraction — all three are needed for research use.',
          xpValue: 10,
        },
        {
          id: 'q25-3-2', type: 'short_answer',
          question: 'What information do 19th-century newspaper accounts of maritime losses typically contain that official admiralty loss records do NOT?',
          gradingRubric: 'Newspaper accounts often include: eyewitness descriptions of the sinking, weather and sea conditions, cargo details (including undeclared cargo), names of survivors and casualties, salvage attempt outcomes, and insurance disputes revealing concealed vessel condition — all providing context missing from terse official records.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q25-4', moduleId: 'm25', type: 'lesson',
      title: 'Domain Pipeline and Ethics Quiz',
      passMark: 70,
      questions: [
        {
          id: 'q25-4-1', type: 'multiple_choice',
          question: 'A maritime AI pipeline report includes precise GPS coordinates for a wreck site. Before public release, the coordinates should be:',
          options: [
            'Published in full for scientific transparency',
            'Truncated to ~1km precision to prevent looting',
            'Encrypted and withheld from publication entirely',
            'Shared only with Lloyd\'s of London',
          ],
          correctAnswer: 'Truncated to ~1km precision to prevent looting',
          gradingRubric: 'Precise coordinates in public reports can enable illegal looting. Standard practice is to truncate to approximately 1km precision (2 decimal places of lat/lon) in public outputs while maintaining full precision in protected records.',
          xpValue: 10,
        },
        {
          id: 'q25-4-2', type: 'short_answer',
          question: 'Why is Indigenous cultural heritage consultation "not optional" when conducting maritime archaeology AI research in Australian waters?',
          gradingRubric: 'Many wrecks (and their cargo) carry cultural significance to First Nations communities beyond their European maritime identity. Indigenous communities have rights and interests in this heritage under both ethical obligations and increasingly under Australian law. Consultation must precede publication, data sharing, or decisions about site management — it is both an ethical requirement and legally mandated in many contexts.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q25-final', moduleId: 'm25', type: 'module_final',
      title: 'Maritime and Domain AI — Module Final',
      passMark: 70,
      questions: [
        {
          id: 'q25f-1', type: 'multiple_choice',
          question: 'A maritime archaeologist wants AI to help identify vessel type from a 1847 Lloyd\'s Register entry written in period-specific notation. The BEST first step is:',
          options: [
            'Fine-tune a model on Lloyd\'s Register data',
            'Use a general-purpose model with no domain context',
            'Build a system prompt with Lloyd\'s notation conventions and abbreviation definitions',
            'Use keyword search on the raw text',
          ],
          correctAnswer: 'Build a system prompt with Lloyd\'s notation conventions and abbreviation definitions',
          gradingRubric: 'A well-constructed system prompt with domain vocabulary and abbreviation tables is the fastest, lowest-cost first step. Fine-tuning is justified only after this approach proves insufficient at scale.',
          xpValue: 15,
        },
        {
          id: 'q25f-2', type: 'multiple_choice',
          question: 'Side-scan sonar acoustic shadows are useful for archaeological interpretation because they:',
          options: [
            'Show the internal structure of buried objects',
            'Indicate the height of proud structures above the seabed',
            'Measure the depth of sediment overburden',
            'Identify the material composition of returns',
          ],
          correctAnswer: 'Indicate the height of proud structures above the seabed',
          gradingRubric: 'Acoustic shadows are cast by structures proud of the seabed — a longer shadow indicates a taller structure. This allows estimation of hull height or wreck relief without direct measurement.',
          xpValue: 15,
        },
        {
          id: 'q25f-3', type: 'multiple_choice',
          question: 'The primary reason maritime archaeology AI pipelines are rare despite obvious utility is:',
          options: [
            'AI is incapable of processing underwater imagery',
            'The field lacks practitioners with both domain expertise and AI engineering skills',
            'Legal barriers prevent AI use in underwater cultural heritage work',
            'Maritime archaeology datasets are classified by national governments',
          ],
          correctAnswer: 'The field lacks practitioners with both domain expertise and AI engineering skills',
          gradingRubric: 'The gap is human, not technical — maritime archaeologists rarely have AI engineering skills, and AI engineers rarely have maritime archaeology expertise. The combination is genuinely rare and valuable.',
          xpValue: 15,
        },
        {
          id: 'q25f-4', type: 'short_answer',
          question: 'Design a 3-stage AI pipeline for identifying the historical identity of a newly discovered wreck site. Describe the input, processing, and output of each stage.',
          gradingRubric: 'Strong answers include: Stage 1 — Physical characterisation: sonar/visual data → CV analysis → structural characteristics (vessel type, size, era, materials); Stage 2 — Historical search: characteristics → RAG over Lloyd\'s/admiralty records → candidate vessel list; Stage 3 — Correlation: candidate list + site observations → matching analysis → ranked identification with confidence assessment and further research needs.',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p25', moduleId: 'm25', name: 'Maritime AI Research Assistant',
    emoji: '⚓',
    description: 'Build an AI-powered research assistant for maritime archaeology. It should accept multiple input types — sonar image descriptions, historical document text, or site observation notes — and produce structured archaeological assessments integrating domain knowledge, RAG retrieval from a maritime corpus, and professional-grade reporting.',
    tools: ['Anthropic SDK', 'TypeScript', 'Claude Vision', 'Vector database', 'QGIS (optional)'],
    status: 'not_started',
    rubric: [
      'Domain system prompt: comprehensive maritime archaeology context including terminology, vessel typology, significance criteria, and UNESCO 2001 principles',
      'Multi-modal intake: accepts at minimum text (site notes, historical excerpts) and image descriptions; stretch goal for actual image processing',
      'RAG integration: retrieves relevant context from a personal maritime corpus (minimum 10 documents indexed) before synthesis',
      'Entity extraction: pulls structured data (vessel name, date, location, artefact types) from unstructured historical text',
      'Assessment output: produces structured site significance assessment using recognised criteria (ICOMOS/Burra Charter)',
      'Ethics implementation: sanitises outputs for public release (coordinate truncation, looting prevention, Indigenous consultation flag where applicable)',
    ],
    xpReward: 400,
  },
}

// ─── MODULE 26 ────────────────────────────────────────────────────────────────
const m26: Module = {
  id: 'm26', number: 26, arc: 5,
  title: 'Capstone — Build Stark Academy',
  description: 'The final module brings the entire curriculum full circle. You built Stark Academy to learn — now you understand exactly how it works and why every decision was made. This module is equal parts technical synthesis and reflection: implement the remaining AI features, polish the PWA, and chart what comes next after 26 modules of deliberate learning.',
  prerequisiteModuleId: 'm25',
  lessons: [
    {
      id: '26-1', number: '26.1',
      title: 'Capstone Architecture — How Stark Academy Was Built',
      duration: 20,
      content: `# Capstone Architecture — How Stark Academy Was Built

You have been using Stark Academy to learn AI engineering. Now let's reverse-engineer it entirely — every decision, every tradeoff, every file. This is the lesson where the curriculum teaches itself.

## The Requirements That Drove the Design

**Anthony's constraints (which shaped everything):**
- No server, no cloud, no account — local-first
- Works on laptop and phone simultaneously via LAN sync
- Looks sharp (Iron Man aesthetic — not a study app, a war room)
- Fast to load, fast to navigate (PWA, offline-capable)
- AI-powered tutoring at the core, not bolted on

**Stack decisions — and why:**

\`\`\`
Decision              | Chosen          | Why not X
──────────────────────|─────────────────|────────────────────────────────
Build tool            | Vite            | Next.js adds SSR complexity for no benefit (no server)
State management      | Zustand         | Redux too heavy; Context API doesn't persist; Zustand tiny + persist plugin
Styling               | Tailwind CSS v3 | CSS-in-JS (styled-components) has runtime cost; raw CSS doesn't scale
Type system           | TypeScript strict| JS would make a 26-module type hierarchy unmaintainable
Persistence           | localStorage    | IndexedDB overkill for this data volume; no SQLite in browser
Sync                  | Express + LAN   | Cloud sync requires account; P2P WebRTC is complex; LAN Express is simple
AI SDK                | Anthropic       | That's the curriculum — eat your own cooking
\`\`\`

## File Architecture

\`\`\`
stark-academy/
├── src/
│   ├── api/                    # All Anthropic SDK calls here only
│   │   ├── tutor.ts            # Lesson explanation + question answering
│   │   ├── quiz.ts             # Free-text quiz grading
│   │   └── insights.ts         # Progress insights generation
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # Root layout with conditional Sidebar/BottomNav
│   │   │   ├── Sidebar.tsx     # Desktop (≥1024px) navigation
│   │   │   └── BottomNav.tsx   # Mobile (<768px) navigation
│   │   ├── curriculum/
│   │   │   ├── ArcMap.tsx      # Visual arc/module overview
│   │   │   ├── ModuleCard.tsx  # Module status + entry point
│   │   │   └── LessonReader.tsx# Markdown lesson renderer
│   │   ├── quiz/
│   │   │   ├── QuizEngine.tsx  # Question routing + answer collection
│   │   │   ├── QuizQuestion.tsx# Individual question component
│   │   │   └── QuizResults.tsx # Score + XP award + feedback
│   │   └── ui/                 # Primitive components (Button, Card, Badge...)
│   ├── data/
│   │   └── curriculum/
│   │       ├── arc1.ts through arc5.ts
│   │       └── index.ts        # Combined export of all 26 modules
│   ├── hooks/
│   │   ├── useClaude.ts        # Streaming message hook
│   │   ├── useOnlineStatus.ts  # Network detection for sync
│   │   └── useSync.ts          # LAN sync orchestration
│   ├── pages/                  # Route-level components
│   │   ├── Home.tsx
│   │   ├── Curriculum.tsx
│   │   ├── Module.tsx
│   │   ├── Lesson.tsx
│   │   ├── Quiz.tsx
│   │   ├── Projects.tsx
│   │   ├── Progress.tsx
│   │   └── Settings.tsx
│   ├── store/
│   │   └── useAppStore.ts      # Zustand store — single source of truth
│   ├── types/
│   │   └── index.ts            # All interfaces (Module, Quiz, Progress...)
│   └── utils/
│       ├── cn.ts               # Tailwind conditional classname utility
│       └── sync.ts             # LAN sync merge logic
├── sync-server/
│   └── server.ts               # Express sync server (port 3001)
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker (offline caching)
└── CLAUDE.md                   # Project memory for AI-assisted development
\`\`\`

## The Zustand Store Architecture

The single source of truth for all progress, settings, and UI state:

\`\`\`typescript
// src/store/useAppStore.ts — simplified structure
interface AppState {
  // Curriculum progress
  moduleProgress: Record<string, ModuleProgress>
  lessonProgress: Record<string, LessonProgress>
  quizResults: Record<string, QuizResult>
  projectStatus: Record<string, ProjectStatus>

  // User settings
  apiKey: string
  syncServerUrl: string
  theme: 'dark'  // always — void is home

  // Actions
  completeLesson: (lessonId: string) => void
  recordQuizResult: (quizId: string, result: QuizResult) => void
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void
  earnXP: (amount: number, source: string) => void

  // Computed
  totalXP: () => number
  arcProgress: (arcNumber: ArcNumber) => number
  nextRecommendedModule: () => Module | null
}
\`\`\`

**Why Zustand over Redux:**
- No boilerplate (no actions, reducers, dispatch)
- Built-in persist middleware with localStorage adapter
- Tiny bundle (~1KB vs ~50KB for Redux Toolkit)
- TypeScript-first API
- Easily testable (just import the hook)

## The Curriculum Data Layer

The \`src/data/curriculum/\` directory holds ~15,000 lines of TypeScript encoding every lesson, quiz, and project in the curriculum. This is intentional — the data is:

1. **Type-safe** — every field is validated at build time by TypeScript strict mode
2. **Bundled** — no runtime fetching, lessons load instantly
3. **Versionable** — curriculum updates are git commits, not database migrations
4. **AI-readable** — structured data Claude Code can reason about directly

The tradeoff: bundle size. 26 modules of full content adds ~500KB to the bundle. With gzip compression and code splitting by arc, this is acceptable for a local PWA.

\`\`\`typescript
// src/data/curriculum/index.ts
export { arc1Modules } from './arc1'
export { arc2Modules } from './arc2'
export { arc3Modules } from './arc3'
export { arc4Modules } from './arc4'
export { arc5Modules } from './arc5'

export const allModules = [
  ...arc1Modules,
  ...arc2Modules,
  ...arc3Modules,
  ...arc4Modules,
  ...arc5Modules,
]

export function getModule(id: string) {
  return allModules.find(m => m.id === id) ?? null
}

export function getLesson(lessonId: string) {
  for (const module of allModules) {
    const lesson = module.lessons.find(l => l.id === lessonId)
    if (lesson) return { lesson, module }
  }
  return null
}
\`\`\``,
      keyTerms: ['Vite', 'Zustand', 'localStorage persist', 'PWA', 'TypeScript strict', 'curriculum data layer', 'LAN sync', 'AppShell', 'single source of truth'],
    },
    {
      id: '26-2', number: '26.2',
      title: 'Building Core Components',
      duration: 20,
      content: `# Building Core Components

This lesson walks through the key component implementations in Stark Academy — the patterns you'd use to build any serious React application with TypeScript and Tailwind.

## AppShell — Responsive Layout Root

\`\`\`tsx
// src/components/layout/AppShell.tsx
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-screen bg-void text-white font-body">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-[260px] z-20">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
        {/* Page content rendered here via React Router */}
        <Outlet />
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-20">
        <BottomNav />
      </div>
    </div>
  )
}
\`\`\`

**Key decisions:**
- \`fixed\` sidebar on desktop preserves scrollability of main content
- \`pb-20\` on main ensures content isn't hidden behind mobile bottom nav
- \`lg:\` breakpoint at 1024px (not 768px) — sidebar needs enough space to be useful

## QuizEngine — The Heart of the Learning Loop

\`\`\`tsx
// src/components/quiz/QuizEngine.tsx
import { useState } from 'react'
import type { Quiz, QuizQuestion } from '@/types'
import { useAppStore } from '@/store/useAppStore'
import { gradeQuizAnswer } from '@/api/quiz'
import { cn } from '@/utils/cn'

interface Props {
  quiz: Quiz
  onComplete: (score: number, xpEarned: number) => void
}

export function QuizEngine({ quiz, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [grading, setGrading] = useState(false)
  const [results, setResults] = useState<Record<string, { correct: boolean; feedback: string }>>({})
  const recordQuizResult = useAppStore(s => s.recordQuizResult)

  const current = quiz.questions[currentIndex]
  const isLast = currentIndex === quiz.questions.length - 1

  async function handleAnswer(questionId: string, answer: string) {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))

    if (current.type === 'short_answer') {
      // Grade free-text with Claude
      setGrading(true)
      try {
        const feedback = await gradeQuizAnswer({
          question: current.question,
          answer,
          rubric: current.gradingRubric,
        })
        setResults(prev => ({ ...prev, [questionId]: feedback }))
      } finally {
        setGrading(false)
      }
    } else {
      // Grade multiple choice locally
      const correct = answer === current.correctAnswer
      setResults(prev => ({
        ...prev,
        [questionId]: { correct, feedback: current.gradingRubric },
      }))
    }
  }

  function handleNext() {
    if (isLast) {
      finishQuiz()
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  function finishQuiz() {
    const correctCount = Object.values(results).filter(r => r.correct).length
    const score = Math.round((correctCount / quiz.questions.length) * 100)
    const xpEarned = quiz.questions
      .filter(q => results[q.id]?.correct)
      .reduce((sum, q) => sum + q.xpValue, 0)

    recordQuizResult(quiz.id, { score, xpEarned, completedAt: new Date().toISOString() })
    onComplete(score, xpEarned)
  }

  return (
    <div className="card max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="h-1 bg-surface rounded-full mb-6">
        <div
          className="h-1 bg-spark-500 rounded-full transition-all duration-500"
          style={{ width: \`\${((currentIndex + 1) / quiz.questions.length) * 100}%\` }}
        />
      </div>

      <QuizQuestionComponent
        question={current}
        answer={answers[current.id]}
        result={results[current.id]}
        onAnswer={(a) => handleAnswer(current.id, a)}
        grading={grading}
      />

      {results[current.id] && (
        <button
          onClick={handleNext}
          className="btn-primary mt-6 w-full min-h-[44px]"
        >
          {isLast ? 'See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  )
}
\`\`\`

## LessonReader — Markdown with Iron Man Prose

\`\`\`tsx
// src/components/curriculum/LessonReader.tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Lesson } from '@/types'

interface Props {
  lesson: Lesson
  onComplete: () => void
  isCompleted: boolean
}

export function LessonReader({ lesson, onComplete, isCompleted }: Props) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Lesson header */}
      <div className="mb-8">
        <p className="text-sm text-spark-400 font-body mb-1">Lesson {lesson.number}</p>
        <h1 className="font-heading text-3xl font-bold text-white">{lesson.title}</h1>
        <p className="text-surface-400 mt-2">{lesson.duration} min read</p>
      </div>

      {/* Lesson content — prose-iron applies all typography */}
      <div className="prose-iron">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {lesson.content}
        </ReactMarkdown>
      </div>

      {/* Key terms */}
      {lesson.keyTerms.length > 0 && (
        <div className="mt-8 p-4 card-raised rounded-xl">
          <h3 className="font-heading text-sm uppercase tracking-wider text-spark-400 mb-3">
            Key Terms
          </h3>
          <div className="flex flex-wrap gap-2">
            {lesson.keyTerms.map(term => (
              <span key={term} className="px-2 py-1 bg-surface rounded text-xs font-mono text-spark-300">
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Complete button */}
      <div className="mt-10">
        <button
          onClick={onComplete}
          disabled={isCompleted}
          className="btn-primary w-full min-h-[44px] disabled:opacity-50"
        >
          {isCompleted ? '✓ Lesson Complete' : 'Mark as Complete →'}
        </button>
      </div>
    </article>
  )
}
\`\`\`

## The useClaude Hook — Streaming Responses

\`\`\`typescript
// src/hooks/useClaude.ts
import { useState, useCallback } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { useAppStore } from '@/store/useAppStore'

interface UseClaudeOptions {
  system?: string
  model?: string
}

export function useClaude(options: UseClaudeOptions = {}) {
  const [streaming, setStreaming] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const apiKey = useAppStore(s => s.apiKey)

  const send = useCallback(async (userMessage: string) => {
    if (!apiKey) {
      setError('No API key set. Go to Settings to add your Anthropic API key.')
      return
    }

    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

    setStreaming(true)
    setOutput('')
    setError(null)

    try {
      const stream = client.messages.stream({
        model: options.model ?? 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: options.system,
        messages: [{ role: 'user', content: userMessage }],
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          setOutput(prev => prev + event.delta.text)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Check your API key and try again.')
    } finally {
      setStreaming(false)
    }
  }, [apiKey, options.system, options.model])

  return { send, output, streaming, error }
}
\`\`\`

## Design System Usage

Every UI decision in Stark Academy uses the token system from \`tailwind.config.js\`:

\`\`\`tsx
// ✅ Correct — using design tokens
<div className="bg-void text-white card card-glow">
  <h2 className="font-heading text-xl text-spark-400">Module Complete</h2>
  <p className="font-body text-surface-300">You earned 200 XP</p>
  <button className="btn-primary min-h-[44px]">Continue →</button>
</div>

// ❌ Wrong — hardcoded values break the system
<div style={{ backgroundColor: '#0A0A1A', color: '#fff' }}>
  <h2 style={{ color: '#5456F5' }}>Module Complete</h2>
</div>
\`\`\`

The \`prose-iron\` class handles all lesson content typography in one place — font sizes, line height, code block styling, table formatting, blockquote style — so lesson content never needs inline styles.`,
      keyTerms: ['AppShell', 'responsive layout', 'QuizEngine', 'LessonReader', 'useClaude hook', 'streaming', 'design tokens', 'prose-iron', 'Zustand store'],
    },
    {
      id: '26-3', number: '26.3',
      title: 'AI Features — Making Stark Academy Intelligent',
      duration: 18,
      content: `# AI Features — Making Stark Academy Intelligent

Stark Academy is more than a markdown viewer with quizzes. The AI layer is what makes it genuinely useful for learning — an always-available tutor that knows exactly what you're studying and responds to your actual confusion.

## The AI Tutor API

\`\`\`typescript
// src/api/tutor.ts
import Anthropic from '@anthropic-ai/sdk'
import type { Lesson, Module } from '@/types'

function buildTutorSystem(module: Module, lesson: Lesson): string {
  return \`You are an expert AI tutor for Stark Academy, an Iron Man-themed curriculum teaching Claude and the Anthropic ecosystem.

Current context:
- Module: \${module.number} — \${module.title}
- Lesson: \${lesson.number} — \${lesson.title}
- Lesson content: [Below]

Your role:
- Answer questions about this lesson's content with precision and depth
- Use analogies that connect concepts to things the student already knows
- If a question goes beyond this lesson, answer it well but note which future module covers it more deeply
- Be direct — no filler phrases like "Certainly!" or "Great question!"
- Use code examples liberally when they illustrate a concept better than words
- When the student is confused, ask them to describe their mental model before correcting it

Lesson content:
\${lesson.content.slice(0, 8000)}\`  // Truncate if very long
}

export async function askTutor(
  question: string,
  module: Module,
  lesson: Lesson,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  apiKey: string,
  onChunk: (text: string) => void,
): Promise<void> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: buildTutorSystem(module, lesson),
    messages: [
      ...conversationHistory,
      { role: 'user', content: question },
    ],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onChunk(event.delta.text)
    }
  }
}
\`\`\`

## Quiz Grading API

Free-text quiz answers are graded by Claude against the rubric, not by keyword matching:

\`\`\`typescript
// src/api/quiz.ts
import Anthropic from '@anthropic-ai/sdk'
import { useAppStore } from '@/store/useAppStore'

interface GradeRequest {
  question: string
  answer: string
  rubric: string
}

interface GradeResult {
  correct: boolean
  score: number  // 0-100
  feedback: string
}

export async function gradeQuizAnswer(request: GradeRequest): Promise<GradeResult> {
  const apiKey = useAppStore.getState().apiKey

  if (!apiKey) {
    // Fallback: mark as correct with a note if no API key
    return { correct: true, score: 75, feedback: 'Auto-graded (no API key). Set your key in Settings for AI grading.' }
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: \`Grade this quiz answer.

Question: \${request.question}

Student answer: \${request.answer}

Grading rubric: \${request.rubric}

Respond with JSON: { "correct": boolean, "score": number (0-100), "feedback": string (1-2 sentences, specific and constructive) }
Mark correct: true if the answer demonstrates understanding of the core concept, even if phrasing differs.
Mark correct: false if it shows a fundamental misunderstanding.\`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    return JSON.parse(text)
  } catch {
    return { correct: false, score: 0, feedback: 'Could not parse grading response. Try rephrasing your answer.' }
  }
}
\`\`\`

## Progress Insights API

Weekly insights turn raw progress data into a personalised learning narrative:

\`\`\`typescript
// src/api/insights.ts
import Anthropic from '@anthropic-ai/sdk'
import { useAppStore } from '@/store/useAppStore'

interface ProgressSnapshot {
  modulesCompleted: number
  totalModules: number
  currentArc: number
  recentLessons: string[]
  weakAreas: string[]  // Quiz topics with < 70% scores
  strongAreas: string[]  // Quiz topics with > 90% scores
  streak: number
  totalXP: number
}

export async function generateInsights(snapshot: ProgressSnapshot, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: \`Generate a weekly learning insights summary for a Stark Academy student.

Progress data:
\${JSON.stringify(snapshot, null, 2)}

Write a 3-paragraph summary in the style of a respected mentor (not sycophantic). Include:
1. What they've genuinely accomplished this week
2. A specific insight about their learning pattern based on strong/weak areas
3. One concrete recommendation for the coming week

Be direct and specific. Reference actual module content where possible.\`,
    }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
\`\`\`

## Token Usage and Cost Monitoring

With an Anthropic API key comes a cost. Build awareness in:

\`\`\`typescript
// Track API usage in the store
interface ApiUsage {
  inputTokens: number
  outputTokens: number
  estimatedCostUSD: number
  lastUpdated: string
}

// After each API call
function trackUsage(response: Anthropic.Message) {
  const { input_tokens, output_tokens } = response.usage
  const cost = (input_tokens * 3 / 1_000_000) + (output_tokens * 15 / 1_000_000)
  // claude-sonnet-4: $3/M input, $15/M output

  useAppStore.getState().addApiUsage({ input_tokens, output_tokens, cost })
}
\`\`\`

Display usage in Settings so Anthony always knows what the app is spending — transparency is non-negotiable when it's a real API key.

## The Intelligence Stack

\`\`\`
User                   Stark Academy AI Layer                    Anthropic API
──────                 ─────────────────────────                ─────────────
Reads lesson     →     Lesson content in context
Asks question    →     [lesson + history] → tutor prompt  →     claude-sonnet-4
Answers quiz     →     [question + rubric] → grade prompt →     claude-sonnet-4
Reviews week     →     [progress data] → insights prompt  →     claude-sonnet-4
Types /explain   →     [selected text] → explain prompt   →     claude-sonnet-4
\`\`\`

Each AI call has a specific, bounded task. The tutor knows the lesson. The grader knows the rubric. The insights generator knows the progress. No call is open-ended — context is scoped tightly to reduce token cost and improve response quality.`,
      keyTerms: ['AI tutor API', 'quiz grading', 'streaming', 'progress insights', 'token usage monitoring', 'context scoping', 'dangerouslyAllowBrowser', 'useClaude hook'],
    },
    {
      id: '26-4', number: '26.4',
      title: 'Ship It — PWA, Polish, and What Comes Next',
      duration: 15,
      content: `# Ship It — PWA, Polish, and What Comes Next

The last lesson. Let's make Stark Academy production-ready on your local machine, then talk honestly about what 26 modules of deliberate study actually gives you — and what to do next.

## PWA: Making It Installable

A Progressive Web App is a web app that can be installed like a native app, works offline, and has a home screen icon. Stark Academy benefits from this on mobile — Anthony's phone should feel like a purpose-built app, not a browser tab.

**manifest.json:**
\`\`\`json
{
  "name": "Stark Academy",
  "short_name": "Stark",
  "description": "26-module Iron Man curriculum for Claude mastery",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#05050F",
  "theme_color": "#5456F5",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
\`\`\`

**Service Worker (Vite PWA plugin is the easiest path):**
\`\`\`bash
npm install vite-plugin-pwa
\`\`\`

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'google-fonts' },
        }],
      },
      manifest: {
        name: 'Stark Academy',
        short_name: 'Stark',
        theme_color: '#5456F5',
        background_color: '#05050F',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
\`\`\`

**Install prompt (iOS requires manual "Add to Home Screen"; Android shows native prompt):**
\`\`\`typescript
// src/hooks/useInstallPrompt.ts
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setPrompt(null)
  }

  return { canInstall: !!prompt, install, isInstalled }
}
\`\`\`

## LAN Sync — Laptop and Phone Together

\`\`\`typescript
// sync-server/server.ts (simplified)
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

let serverState: Record<string, unknown> = {}

app.get('/state', (_req, res) => res.json(serverState))

app.post('/sync', (req, res) => {
  // Merge client state into server state
  // Last-write-wins per key (with timestamp comparison)
  serverState = mergeStates(serverState, req.body)
  res.json(serverState)
})

app.listen(3001, '0.0.0.0', () => {
  console.log('Stark Academy sync server running on port 3001')
  console.log('On your phone, go to Settings and enter this laptop\\'s IP address')
})
\`\`\`

## What 26 Modules Actually Gives You

Honest assessment, no hype.

**You know how it works.** The token, the context window, the transformer architecture (conceptually), the training loop. Most people using Claude have no model at all. You have a model.

**You can build.** API calls, streaming, tool use, MCP servers, RAG pipelines, multi-agent systems. You've not just read about these — you have projects that demonstrate them.

**You can evaluate.** RAGAS, LLM-as-judge, CI eval gates. You know how to measure whether AI is doing what you need it to do. This is rarer than building ability.

**You understand the field.** Safety, governance, chip geopolitics, the regulatory trajectory. You can have informed conversations about where this is going and what the constraints are.

**What you don't have yet:** deep experience. That comes from building real things for real users, shipping projects, encountering edge cases you can't anticipate, and iterating on feedback. The 26 modules give you the map. Experience is the territory.

## What Comes Next

**Build something real with your specific edge.** You are a maritime archaeologist learning AI engineering. That combination is rare. The opportunity is in the intersection, not in competing with pure AI engineers on their home turf.

**Write and teach.** The act of explaining what you know cements it. A blog post on AI for maritime archaeology, a talk at an archaeology conference, a GitHub repo that other archaeologists can actually use — these compound faster than private projects.

**Stay current efficiently.** The field moves fast. The weekly minimum:
- Anthropic releases and blog (30 min/week)
- One arXiv paper from cs.LG or cs.CL (1 hr/week)
- Hugging Face Papers daily digest (10 min/day)
- One community touchpoint: AI safety Discord, LessWrong, ML Twitter/X (20 min/day)

**Recommended next projects (in order of learning value):**
1. Ship the maritime AI research assistant from M25 — make it actually useful for a real project
2. Contribute to an open-source AI tool (SDK examples, evals, documentation)
3. Run a real fine-tuning experiment on domain data with LoRA
4. Implement one paper from scratch — the M23 project, now for real
5. Build something collaborative — find another person who needs the tool you can build

## A Final Word

You built Stark Academy to learn. You completed Stark Academy to understand. The gap between those two things is 26 modules of deliberate effort.

That effort is not a credential — it's capability. Credentials tell people what you might know. Capability tells them what you can do. The projects, the code, the understanding of why every decision in this very app was made — that's the output.

The Extremis protocol is complete. What you do with it is up to you.`,
      keyTerms: ['PWA manifest', 'service worker', 'Vite PWA plugin', 'install prompt', 'LAN sync', 'deliberate practice', 'domain edge', 'continuous learning'],
    },
  ],
  quizzes: [
    {
      id: 'q26-1', moduleId: 'm26', type: 'lesson',
      title: 'Architecture Quiz',
      passMark: 70,
      questions: [
        {
          id: 'q26-1-1', type: 'multiple_choice',
          question: 'Stark Academy uses Vite instead of Next.js primarily because:',
          options: [
            'Vite has better TypeScript support',
            'Next.js server-side rendering adds complexity with no benefit for a local-first PWA',
            'Next.js doesn\'t support Tailwind CSS v3',
            'Vite bundles are always smaller than Next.js builds',
          ],
          correctAnswer: 'Next.js server-side rendering adds complexity with no benefit for a local-first PWA',
          gradingRubric: 'The architecture decision is driven by requirements: no server, local-first, no deployment. SSR adds complexity that has no payoff for these requirements. Vite is simpler and faster for a purely client-side app.',
          xpValue: 10,
        },
        {
          id: 'q26-1-2', type: 'multiple_choice',
          question: 'Why is curriculum data stored as TypeScript modules rather than fetched from a database at runtime?',
          options: [
            'Databases don\'t support TypeScript types',
            'It provides type safety at build time, instant loading, and git-versionable curriculum updates',
            'TypeScript modules are faster than JSON at runtime',
            'This is the only approach that works with Vite',
          ],
          correctAnswer: 'It provides type safety at build time, instant loading, and git-versionable curriculum updates',
          gradingRubric: 'Three real advantages: TypeScript strict validates every field at build time, bundled data loads instantly (no fetch), and curriculum updates are git commits with full history — not database migrations.',
          xpValue: 10,
        },
        {
          id: 'q26-1-3', type: 'short_answer',
          question: 'The Zustand store uses a localStorage persist middleware. What is one significant tradeoff of storing all progress in localStorage rather than a database?',
          gradingRubric: 'Key tradeoffs include: localStorage has a 5-10MB storage limit (fine for progress data, insufficient for large datasets); it\'s synchronous and blocks the main thread on large writes; it\'s not queryable (no SQL-style filtering); and it\'s wiped if the user clears browser data, with no automatic backup.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q26-2', moduleId: 'm26', type: 'lesson',
      title: 'Component Implementation Quiz',
      passMark: 70,
      questions: [
        {
          id: 'q26-2-1', type: 'multiple_choice',
          question: 'In the AppShell, why is `pb-20` applied to the main content area?',
          options: [
            'To add visual breathing room at the bottom of all pages',
            'To prevent content from being hidden behind the fixed mobile bottom nav',
            'It\'s a Tailwind animation class for the fade-up effect',
            'To match the sidebar width on desktop',
          ],
          correctAnswer: 'To prevent content from being hidden behind the fixed mobile bottom nav',
          gradingRubric: 'The BottomNav is `fixed` at the bottom of the viewport. Without padding on the main content, the last elements on a page would be hidden behind it. pb-20 (80px) creates clearance, and lg:pb-0 removes it on desktop where there\'s no bottom nav.',
          xpValue: 10,
        },
        {
          id: 'q26-2-2', type: 'multiple_choice',
          question: 'Why does the QuizEngine use Claude to grade short_answer questions but grades multiple_choice locally?',
          options: [
            'Multiple choice answers are always wrong if not exact matches',
            'Claude is too slow for multiple choice',
            'Short answer requires semantic understanding of correctness; multiple choice is a string equality check',
            'API calls are only allowed for quiz questions worth > 15 XP',
          ],
          correctAnswer: 'Short answer requires semantic understanding of correctness; multiple choice is a string equality check',
          gradingRubric: 'Multiple choice has one correct answer — a local string comparison is accurate and free. Short answer can be correct in many different phrasings; Claude provides semantic grading against the rubric that keyword matching cannot.',
          xpValue: 10,
        },
      ],
    },
    {
      id: 'q26-3', moduleId: 'm26', type: 'lesson',
      title: 'AI Features Quiz',
      passMark: 70,
      questions: [
        {
          id: 'q26-3-1', type: 'multiple_choice',
          question: 'The AI tutor\'s system prompt includes `lesson.content.slice(0, 8000)`. What is the purpose of this truncation?',
          options: [
            'Claude cannot process more than 8000 characters',
            'It limits context cost for very long lessons while keeping the tutor informed of lesson content',
            'The first 8000 characters contain the most important content',
            'It prevents the API key from being exposed',
          ],
          correctAnswer: 'It limits context cost for very long lessons while keeping the tutor informed of lesson content',
          gradingRubric: 'Including the entire lesson in every tutor call would be expensive for very long lessons. Truncating to ~8000 characters keeps cost manageable while ensuring the tutor has the lesson context needed to answer questions accurately.',
          xpValue: 10,
        },
        {
          id: 'q26-3-2', type: 'short_answer',
          question: 'Why is it important to display API usage and estimated cost to the user in Settings, rather than silently billing in the background?',
          gradingRubric: 'Transparency and trust: users deserve to know what their API key is spending. Surprises on an Anthropic invoice damage trust. Usage visibility also helps users calibrate how often to use AI features vs reading static content, and enables informed decisions about when to use Haiku (cheaper) vs Sonnet (more capable).',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q26-4', moduleId: 'm26', type: 'lesson',
      title: 'PWA and Reflection Quiz',
      passMark: 70,
      questions: [
        {
          id: 'q26-4-1', type: 'multiple_choice',
          question: 'A service worker\'s primary function in a PWA like Stark Academy is to:',
          options: [
            'Encrypt localStorage data at rest',
            'Run background sync with the Anthropic API',
            'Intercept network requests and serve cached assets for offline functionality',
            'Compress JavaScript bundles before serving',
          ],
          correctAnswer: 'Intercept network requests and serve cached assets for offline functionality',
          gradingRubric: 'Service workers act as a proxy between the browser and network. They can intercept fetch requests and serve cached responses, enabling the app to load and function without a network connection.',
          xpValue: 10,
        },
        {
          id: 'q26-4-2', type: 'short_answer',
          question: 'The lesson argues that Anthony\'s "competitive advantage" comes from the intersection of maritime archaeology and AI engineering. Explain why this intersection is more valuable than pure expertise in either domain alone.',
          gradingRubric: 'The field has many good maritime archaeologists (domain expertise without AI) and many AI engineers (technical skill without domain). The intersection is rare: someone who understands what problems are worth solving (from domain expertise), can build the tools to solve them (from AI engineering), and can communicate results credibly to domain experts (from shared background). This combination enables the creation of genuinely useful tools that neither group could build alone.',
          xpValue: 15,
        },
      ],
    },
    {
      id: 'q26-final', moduleId: 'm26', type: 'module_final',
      title: 'Capstone Module Final',
      passMark: 70,
      questions: [
        {
          id: 'q26mf-1', type: 'multiple_choice',
          question: 'Stark Academy stores all 26 modules\' content in TypeScript files bundled at build time. The main tradeoff of this approach vs. runtime API fetching is:',
          options: [
            'TypeScript files cannot contain markdown content',
            'Larger bundle size in exchange for instant loading, type safety, and no backend',
            'TypeScript files are not supported by Vite code splitting',
            'Build-time bundling prevents curriculum updates without redeployment',
          ],
          correctAnswer: 'Larger bundle size in exchange for instant loading, type safety, and no backend',
          gradingRubric: 'The tradeoff is explicit: ~500KB added to the bundle in exchange for zero-latency content loading, compile-time type validation, and no server requirement. For a local PWA, this is the right trade.',
          xpValue: 15,
        },
        {
          id: 'q26mf-2', type: 'multiple_choice',
          question: 'The `min-h-[44px]` class appears on all interactive elements throughout Stark Academy. This requirement comes from:',
          options: [
            'The Tailwind CSS v3 design system defaults',
            'Mobile touch target size guidelines (Apple HIG / WCAG) for usable tap targets',
            'The Anthropic SDK requirement for button elements',
            'The Iron Man design system\'s aesthetic standards',
          ],
          correctAnswer: 'Mobile touch target size guidelines (Apple HIG / WCAG) for usable tap targets',
          gradingRubric: '44px is the Apple Human Interface Guidelines minimum touch target size, also aligned with WCAG 2.5.5 (AAA). It ensures tappable elements are large enough to hit accurately on a mobile screen without frustrating misses.',
          xpValue: 15,
        },
        {
          id: 'q26mf-3', type: 'short_answer',
          question: 'Describe how the three AI features in Stark Academy (tutor, quiz grader, insights) each scope their context differently, and why this matters for cost and quality.',
          gradingRubric: 'Tutor: scoped to current lesson content + conversation history — gives accurate lesson-specific answers without irrelevant context. Quiz grader: scoped to single question + rubric + student answer — fast, cheap, focused on the grading task. Insights: scoped to aggregated progress data (no lesson content) — synthesises patterns, not facts. Tight context scoping reduces token cost, focuses the model on the relevant task, and improves response quality by removing noise.',
          xpValue: 20,
        },
      ],
    },
  ],
  project: {
    id: 'p26', moduleId: 'm26', name: 'Capstone — Complete Stark Academy',
    emoji: '🏛️',
    description: 'Your capstone project IS Stark Academy. Complete all remaining components, integrate the AI features, ship the PWA, and deploy locally to both laptop and mobile via LAN sync. The final project is the app you\'ve been using — finished, polished, and running on your own hardware.',
    tools: ['Vite', 'React 18', 'TypeScript strict', 'Tailwind CSS v3', 'Zustand', 'Anthropic SDK', 'Express (sync server)', 'vite-plugin-pwa'],
    status: 'not_started',
    rubric: [
      'All 8 screens implemented: Home, Curriculum (ArcMap), Module, Lesson, Quiz, Projects, Progress, Settings',
      'AI tutor integrated: streaming responses in LessonReader, multi-turn conversation, lesson context injected',
      'Quiz engine complete: multiple choice local grading, short-answer Claude grading, score calculation, XP award',
      'PWA: installable on mobile (manifest + service worker), works offline for previously visited lessons',
      'LAN sync: sync-server running, phone can sync progress from laptop IP in Settings',
      'Design system: all components use only Tailwind tokens (no hardcoded colours/fonts), all interactive elements min-h-[44px]',
      'API usage display: Settings page shows token usage and estimated cost to date',
      'TypeScript strict: npx tsc --noEmit exits with 0 errors on the complete codebase',
    ],
    xpReward: 500,
  },
  finalExam: {
    id: 'arc5-final', moduleId: 'm26', type: 'arc_final',
    title: 'Grand Final — Stark Academy Mastery Exam',
    passMark: 80,
    questions: [
      // Arc 1: Foundations (Q1–4)
      {
        id: 'gf-01', type: 'multiple_choice',
        question: 'The "emergent capabilities" phenomenon in large language models refers to:',
        options: [
          'Capabilities explicitly programmed by engineers at specific parameter counts',
          'Abilities that appear abruptly at certain scale thresholds, not predictable from smaller model performance',
          'The gradual, linear improvement in model quality as training data increases',
          'Features that only emerge after RLHF fine-tuning is applied to a base model',
        ],
        correctAnswer: 'Abilities that appear abruptly at certain scale thresholds, not predictable from smaller model performance',
        gradingRubric: 'Emergent capabilities are qualitative capability jumps that appear non-linearly at scale — not present in smaller models, then suddenly present in larger ones. This makes capability prediction difficult and is a key challenge for AI safety planning.',
        xpValue: 15,
      },
      {
        id: 'gf-02', type: 'multiple_choice',
        question: 'Constitutional AI (CAI) trains models to be helpful and harmless by:',
        options: [
          'Using human labellers to flag every harmful output during RLHF',
          'Hardcoding a list of prohibited topics at the inference level',
          'Having the model critique and revise its own outputs against a written set of principles',
          'Training on a curated dataset with all harmful content manually removed',
        ],
        correctAnswer: 'Having the model critique and revise its own outputs against a written set of principles',
        gradingRubric: 'CAI uses a critique-revision loop: the model generates a response, then critiques it against a constitution of principles, then revises. This allows scalable alignment without labelling every output individually.',
        xpValue: 15,
      },
      {
        id: 'gf-03', type: 'multiple_choice',
        question: 'In the transformer attention mechanism, the "query-key dot product" computes:',
        options: [
          'The position encoding added to each token embedding',
          'A relevance score between each position\'s query and every other position\'s key',
          'The gradient used to update attention weight parameters',
          'The compression ratio of the key-value cache',
        ],
        correctAnswer: 'A relevance score between each position\'s query and every other position\'s key',
        gradingRubric: 'Q·K^T produces a matrix of attention scores — how relevant each key position is to each query position. These scores are scaled, softmaxed into attention weights, and used to form a weighted sum of value vectors.',
        xpValue: 15,
      },
      {
        id: 'gf-04', type: 'short_answer',
        question: 'Explain the difference between a "base model" and an "instruction-tuned model," and why you would use each.',
        gradingRubric: 'Base model: pretrained on next-token prediction, no RLHF/fine-tuning — completes text in the style of its training data. Used for: few-shot prompting research, fine-tuning as a starting point, studying raw capabilities. Instruction-tuned model: further trained with RLHF and Constitutional AI to follow instructions helpfully and safely. Used for: production applications, chat, API-based tools — essentially all practical use cases.',
        xpValue: 20,
      },
      // Arc 2: Builders (Q5–8)
      {
        id: 'gf-05', type: 'multiple_choice',
        question: 'Prompt caching in the Anthropic API reduces cost on cached tokens by approximately:',
        options: ['25%', '50%', '75%', '90%'],
        correctAnswer: '90%',
        gradingRubric: 'Cached tokens are billed at 0.10× the standard input price — a 90% reduction. Cache writes cost 1.25× standard input (one-time), but the savings on subsequent reads are substantial for long, repeated contexts.',
        xpValue: 15,
      },
      {
        id: 'gf-06', type: 'multiple_choice',
        question: 'In an agentic system, the "ReAct" pattern (Reason + Act) prevents the model from:',
        options: [
          'Making API calls that violate rate limits',
          'Taking irreversible actions without logging the reasoning behind them',
          'Acting immediately on a task without explicit reasoning steps, which reduces reliability and interpretability',
          'Using tools that require authentication',
        ],
        correctAnswer: 'Acting immediately on a task without explicit reasoning steps, which reduces reliability and interpretability',
        gradingRubric: 'ReAct interleaves explicit Thought steps (reasoning about what to do) with Action steps (tool calls) and Observation steps (processing results). This makes the agent\'s decision process inspectable and catches errors that a direct-action approach would miss.',
        xpValue: 15,
      },
      {
        id: 'gf-07', type: 'multiple_choice',
        question: 'Which tool use pattern is MOST appropriate when Claude needs to decide at runtime which of several specialised agents to invoke based on the user\'s request?',
        options: [
          'Parallel tool calls — run all agents simultaneously',
          'Orchestrator-subagent with routing logic — select the appropriate agent based on task classification',
          'Sequential chaining — always invoke all agents in fixed order',
          'Single-agent with all tools — give one agent all capabilities',
        ],
        correctAnswer: 'Orchestrator-subagent with routing logic — select the appropriate agent based on task classification',
        gradingRubric: 'Routing requires classification then delegation — the orchestrator analyses the request and routes to the appropriate specialised subagent. Parallel invocation wastes resources; sequential chaining ignores the routing requirement; single-agent loses specialisation benefits.',
        xpValue: 15,
      },
      {
        id: 'gf-08', type: 'short_answer',
        question: 'You are building a customer support agent that reads customer data, looks up order history, and drafts email responses. Which of these operations require human confirmation before execution and why?',
        gradingRubric: 'Sending email responses should require confirmation — it is irreversible and externally visible. Reading customer data and order history are reversible/read-only and can proceed autonomously. The principle: reversible actions (reads, drafts, lookups) can be automated; irreversible actions with external consequences (sends, cancellations, charges) should have a human checkpoint. Agentic safety requires the minimal footprint principle — only confirm escalation when consequences are non-trivial and difficult to undo.',
        xpValue: 20,
      },
      // Arc 3: Engineering (Q9–12)
      {
        id: 'gf-09', type: 'multiple_choice',
        question: 'In a RAG pipeline, the primary function of a cross-encoder reranker is to:',
        options: [
          'Convert query text into vector embeddings faster than a bi-encoder',
          'Re-score retrieved chunks by jointly considering the query and document together for higher precision',
          'Chunk documents into fixed-size segments before embedding',
          'Compress multiple retrieved documents into a single summary',
        ],
        correctAnswer: 'Re-score retrieved chunks by jointly considering the query and document together for higher precision',
        gradingRubric: 'Bi-encoders embed query and documents separately (fast, approximate). Cross-encoders compare query and document jointly (slower, more accurate). Reranking applies the cross-encoder to the top-K bi-encoder results to reorder by true relevance — the two-stage pipeline gets speed from bi-encoders and precision from cross-encoders.',
        xpValue: 15,
      },
      {
        id: 'gf-10', type: 'multiple_choice',
        question: 'RAGAS evaluates RAG systems on which two primary dimensions?',
        options: [
          'Latency and throughput',
          'Faithfulness (answer grounded in context) and answer relevance (answers the actual question)',
          'Recall and precision of retrieved chunks',
          'Model confidence scores and uncertainty quantification',
        ],
        correctAnswer: 'Faithfulness (answer grounded in context) and answer relevance (answers the actual question)',
        gradingRubric: 'RAGAS primary metrics: Faithfulness (does the answer contain only claims supported by the retrieved context?) and Answer Relevance (does the answer actually address the question asked?). Context Precision and Context Recall evaluate retrieval quality separately.',
        xpValue: 15,
      },
      {
        id: 'gf-11', type: 'multiple_choice',
        question: 'Extended Thinking in Claude\'s API differs from standard prompting primarily because:',
        options: [
          'It allows Claude to access external tools during reasoning',
          'The reasoning process happens in a separate "thinking" block before the response, with more compute budget for complex problems',
          'It bypasses Constitutional AI guidelines for research purposes',
          'Extended Thinking uses a different model optimised for long-form reasoning',
        ],
        correctAnswer: 'The reasoning process happens in a separate "thinking" block before the response, with more compute budget for complex problems',
        gradingRubric: 'Extended Thinking gives Claude a scratchpad ("thinking" content block) to reason through complex problems before producing its answer. This is different from standard prompting where reasoning is embedded in the response. The thinking block uses additional token budget and is visible to the developer but typically hidden from end users.',
        xpValue: 15,
      },
      {
        id: 'gf-12', type: 'short_answer',
        question: 'An eval suite for a customer-facing Claude deployment shows 95% helpfulness but 8% harmful response rate. Describe how you would reduce the harmful response rate while minimising impact on helpfulness, using at minimum two techniques from the curriculum.',
        gradingRubric: 'Strong answers combine complementary techniques: (1) Input/output guardrails — classifier before and after Claude response to catch high-risk patterns without modifying the base model, low latency impact; (2) System prompt hardening — explicit restrictions and persona definition in the system prompt; (3) Red-teaming to understand the failure taxonomy — which categories of harmful outputs are occurring? (4) Fine-tuning on preference pairs showing desired vs. undesired responses; (5) LLM-as-judge eval for the harmful categories to measure improvement. Key insight: address the specific harmful categories identified in red-teaming, don\'t apply blanket restrictions that tank helpfulness.',
        xpValue: 20,
      },
      // Arc 4: Mastery (Q13–16)
      {
        id: 'gf-13', type: 'multiple_choice',
        question: 'The EU AI Act classifies foundation models with ≥10²⁵ training FLOPs as:',
        options: [
          'Prohibited AI systems requiring immediate decommissioning',
          'General Purpose AI models of systemic risk requiring additional obligations',
          'High-risk systems requiring CE marking and conformity assessments',
          'Unregulated systems exempted from all Act provisions',
        ],
        correctAnswer: 'General Purpose AI models of systemic risk requiring additional obligations',
        gradingRubric: 'GPAI models above the 10²⁵ FLOP threshold are classified as models with systemic risk under the EU AI Act, triggering additional obligations: adversarial testing (red-teaming), incident reporting to the EU AI Office, and cybersecurity requirements.',
        xpValue: 15,
      },
      {
        id: 'gf-14', type: 'multiple_choice',
        question: 'LoRA (Low-Rank Adaptation) reduces fine-tuning compute cost by:',
        options: [
          'Removing transformer layers from the model during training',
          'Representing weight updates as the product of two small matrices (ΔW = BA) instead of updating full weight matrices',
          'Quantising all weights to 4-bit during the forward pass',
          'Training only the output embedding layer while freezing all attention weights',
        ],
        correctAnswer: 'Representing weight updates as the product of two small matrices (ΔW = BA) instead of updating full weight matrices',
        gradingRubric: 'LoRA decomposes the weight update ΔW = BA where B ∈ R^(d×r) and A ∈ R^(r×k) with rank r << min(d,k). This reduces trainable parameters dramatically — a 7B model with rank-16 LoRA adapters trains ~10M parameters instead of 7B, enabling fine-tuning on consumer hardware.',
        xpValue: 15,
      },
      {
        id: 'gf-15', type: 'multiple_choice',
        question: 'DPO (Direct Preference Optimisation) differs from RLHF because:',
        options: [
          'DPO trains on more data for longer, while RLHF uses less data',
          'DPO eliminates the need for a separate reward model by directly optimising policy on preference pairs',
          'RLHF is only suitable for instruction following; DPO is used for reasoning tasks',
          'DPO requires Constitutional AI principles while RLHF does not',
        ],
        correctAnswer: 'DPO eliminates the need for a separate reward model by directly optimising policy on preference pairs',
        gradingRubric: 'RLHF requires training a reward model on preference data, then using PPO to optimise the LLM against that reward model (three stages). DPO skips the reward model entirely — it directly optimises a policy on (chosen, rejected) preference pairs using a reparameterised loss. Same outcome, less infrastructure.',
        xpValue: 15,
      },
      {
        id: 'gf-16', type: 'short_answer',
        question: 'Speculative decoding uses a small "draft model" alongside a large "target model." Explain how this achieves faster inference without changing the target model\'s output distribution.',
        gradingRubric: 'The draft model (fast, small) generates k candidate tokens. The target model evaluates all k tokens in parallel in a single forward pass. It accepts tokens where P_target(token) ≥ P_draft(token) (by acceptance-rejection sampling), and resamples from the target distribution when rejecting. This guarantees the final output is distributed identically to the target model alone — no quality loss. Speed gain: k tokens verified per forward pass instead of 1, which is particularly beneficial when the draft model\'s predictions are frequently accepted (high acceptance rate).',
        xpValue: 20,
      },
      // Arc 5: Architect (Q17–20)
      {
        id: 'gf-17', type: 'multiple_choice',
        question: 'In the MCP protocol, the difference between a "tool" and a "resource" primitive is:',
        options: [
          'Tools are read-only; resources can modify external state',
          'Tools execute actions and may have side effects; resources provide read-only data access',
          'Tools require authentication; resources are always public',
          'Tools use SSE transport; resources use stdio transport',
        ],
        correctAnswer: 'Tools execute actions and may have side effects; resources provide read-only data access',
        gradingRubric: 'MCP tools are callable functions that may execute code, call APIs, modify state — they have potential side effects. Resources are URI-addressable data sources that provide read access to content (files, database views, live data). Prompts are reusable prompt templates. The distinction matters for safety — hosts can restrict tool access more carefully than resource access.',
        xpValue: 15,
      },
      {
        id: 'gf-18', type: 'multiple_choice',
        question: 'The 3-pass method for reading a research paper recommends reading the abstract, introduction, and conclusion in the first pass to determine:',
        options: [
          'The mathematical derivations used in the paper',
          'Whether the paper is worth reading in full and what category it falls into',
          'The experimental results and their statistical significance',
          'Which citations to prioritise for follow-up reading',
        ],
        correctAnswer: 'Whether the paper is worth reading in full and what category it falls into',
        gradingRubric: 'Pass 1 (10-15 minutes) reads the abstract, intro, conclusion, and section headings to assess: Is this relevant? Is the contribution significant? Is the methodology credible? What category (new architecture, empirical study, survey, position paper)? This triage prevents investing 3 hours in a paper that isn\'t worth deep engagement.',
        xpValue: 15,
      },
      {
        id: 'gf-19', type: 'multiple_choice',
        question: 'A personal AI OS with "layered context injection" uses multiple context files that update at different frequencies. The context that updates MOST frequently is typically:',
        options: [
          'Identity context (name, values, expertise areas)',
          'Project context (current goals, active work)',
          'Daily context (today\'s tasks, recent decisions, meeting notes)',
          'Historical context (past projects, long-term goals)',
        ],
        correctAnswer: 'Daily context (today\'s tasks, recent decisions, meeting notes)',
        gradingRubric: 'The layered context hierarchy has different update frequencies: Identity (rarely/never), Project (weekly), Daily (every day or every session). Daily context is the most dynamic — it contains today\'s priorities, recent decisions, and session-specific information that changes with every work session.',
        xpValue: 15,
      },
      {
        id: 'gf-20', type: 'short_answer',
        question: 'You have completed 26 modules studying Claude and the Anthropic ecosystem. Describe the one project you would build next that best leverages your specific combination of skills and background, and explain why that intersection is your competitive advantage.',
        gradingRubric: 'Excellent answers are personal, specific, and demonstrate understanding of why the intersection of domains matters. For Anthony: something connecting maritime archaeology domain knowledge with AI engineering — e.g., a maritime AI research assistant, a historical ship record NLP pipeline, automated sonar analysis tools for archaeological surveys. The competitive advantage explanation should articulate that the value is not in being the best AI engineer (competing with thousands of specialists) or the best maritime archaeologist (competing with established professionals), but in being one of very few people who can build tools that maritime archaeologists actually need, communicate results credibly to both communities, and understand what problems are worth solving. Accept any thoughtful answer that demonstrates genuine self-awareness about domain-crossing advantage.',
        xpValue: 25,
      },
    ],
  },
}

export const arc5Modules: Module[] = [m21, m22, m23, m24, m25, m26]
