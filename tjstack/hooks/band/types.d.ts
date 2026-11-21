export type Tests = { state: 'none' | 'pass' | 'fail' | 'stale'; passed: number | null; failed: number | null }
export type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number }

// One session as hooks/metrics.js writes it to ~/.config/tjstack/metrics/<session>.json.
export type Metrics = {
  host: 'claude' | 'cursor'
  session: string
  project: string
  name: string
  model: string
  started: number
  updated: number
  turns: number
  agentMs: number
  turnStart: number | null
  cost: number | null
  lastTurnCost: number | null
  tokens: Tokens | null
  tests: Tests
  files: string[]
}

declare module 'claude-code' {
  interface PluginState {
    tjstack: { metrics: Metrics | null; details: boolean }
  }
}
