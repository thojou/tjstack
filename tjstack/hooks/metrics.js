#!/usr/bin/env node
// tjstack session metrics: one hook script for Claude Code and Cursor.
// Each hook event updates ~/.config/tjstack/metrics/<session>.json; every turn end rebuilds board.html.
//   node metrics.js claude|cursor   hook mode, event JSON on stdin
//   node metrics.js board [--open]  rebuild the board, print its path

const fs = require('fs')
const os = require('os')
const path = require('path')

const DIR = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'tjstack', 'metrics')

// USD per million tokens: [input, 5m cache write, 1h cache write, cache read, output].
// shortcut: first-party list prices as of 2026-11; a model missing here gets no cost (null), add it when it shows up.
const PRICES = {
  'claude-fable-5-2': [8, 10, 16, 0.2, 40],
  'claude-fable-5-1': [10, 12.5, 20, 0.25, 50],
  'claude-fable-5': [10, 12.5, 20, 1, 50],
  'claude-opus-5-5': [4, 5, 8, 0.2, 20],
  'claude-opus-5': [5, 6.25, 10, 0.5, 25],
  'claude-opus-4-8': [5, 6.25, 10, 0.5, 25],
  'claude-opus-4-7': [5, 6.25, 10, 0.5, 25],
  'claude-opus-4-6': [5, 6.25, 10, 0.5, 25],
  'claude-sonnet-5-5': [2, 2.5, 4, 0.1, 10],
  'claude-sonnet-5': [2, 2.5, 4, 0.2, 10],
  'claude-sonnet-4-6': [3, 3.75, 6, 0.3, 15],
  'claude-haiku-5-5': [0.1, 0.125, 0.2, 0.01, 0.5],
  'claude-haiku-4-5': [1, 1.25, 2, 0.1, 5],
}

const TEST_CMD = /\b(npm (run )?test|pnpm (run )?test|yarn test|bun test|npx (jest|vitest)|jest|vitest|pytest|python3? -m pytest|go test|cargo test|mvn test|gradle test|rspec|phpunit|dotnet test|node --test|deno test|make test)\b/

const modelId = m => String(m || '').replace(/\[.*\]$/, '').replace(/-\d{8}$/, '')

function replyCost(model, u) {
  let p = PRICES[modelId(model)]
  if (!p) return null
  const cc = u.cache_creation || {}
  const split = cc.ephemeral_5m_input_tokens !== undefined || cc.ephemeral_1h_input_tokens !== undefined
  const w5 = split ? cc.ephemeral_5m_input_tokens || 0 : u.cache_creation_input_tokens || 0
  const w1 = split ? cc.ephemeral_1h_input_tokens || 0 : 0
  const input = u.input_tokens || 0
  const read = u.cache_read_input_tokens || 0
  // Haiku 5.5 bills prompts over 100k tokens at 5x.
  if (modelId(model) === 'claude-haiku-5-5' && input + read + w5 + w1 > 100000) p = p.map(x => x * 5)
  const usd = (input * p[0] + w5 * p[1] + w1 * p[2] + read * p[3] + (u.output_tokens || 0) * p[4]) / 1e6
  // Fast mode costs twice the standard rate on every model that offers it.
  return u.speed === 'fast' ? usd * 2 : usd
}

// Tokens, cost and main model from Claude Code transcripts (main + subagents). Each reply's usage is
// written on several lines with the same message id, so the last line per id counts.
function claudeUsage(files) {
  const replies = new Map()
  for (const file of files) {
    let text = ''
    try { text = fs.readFileSync(file, 'utf8') } catch { continue }
    for (const line of text.split('\n')) {
      if (!line.includes('"usage"')) continue
      let r
      try { r = JSON.parse(line) } catch { continue }
      const m = r.message
      if (r.type !== 'assistant' || !m || !m.usage || !m.model || m.model === '<synthetic>') continue
      replies.set(m.id || `${file}:${replies.size}`, m)
    }
  }
  const tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
  const models = new Map()
  let cost = 0
  let priced = true
  for (const m of replies.values()) {
    const u = m.usage
    tokens.input += u.input_tokens || 0
    tokens.output += u.output_tokens || 0
    tokens.cacheRead += u.cache_read_input_tokens || 0
    tokens.cacheWrite += u.cache_creation_input_tokens || 0
    models.set(m.model, (models.get(m.model) || 0) + 1)
    const c = replyCost(m.model, u)
    if (c === null) priced = false
    else cost += c
  }
  const model = [...models].sort((a, b) => b[1] - a[1])[0]
  return { tokens, cost: replies.size && priced ? cost : null, model: model ? model[0] : '' }
}

// Cursor transcripts carry no usage, but the first prompt and one `turn_ended` record per turn.
function cursorTranscript(file) {
  let text = ''
  try { text = fs.readFileSync(file, 'utf8') } catch {}
  let name = ''
  let turns = 0
  for (const line of text.split('\n')) {
    let r
    try { r = JSON.parse(line) } catch { continue }
    if (r.type === 'turn_ended') turns += 1
    if (!name && r.role === 'user') {
      const t = ((r.message || {}).content || []).map(c => c.text || '').join('\n')
      const q = /<user_query>\s*([\s\S]*?)\s*<\/user_query>/.exec(t)
      name = (q ? q[1] : t).trim().split('\n')[0].slice(0, 80)
    }
  }
  return { name, turns }
}

function subagentFiles(transcript) {
  const dir = path.join(transcript.replace(/\.jsonl$/, ''), 'subagents')
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith('.jsonl')).map(f => path.join(dir, f))
  } catch {
    return []
  }
}

// Pass/fail counts from common runners (pytest, jest, vitest, mocha, node --test, TAP, cargo, go).
function testResult(output, exitFailed) {
  const num = re => { const m = re.exec(output); return m ? Number(m[1]) : undefined }
  const passed = num(/(\d+) (?:passed|passing)\b/) ?? num(/(?:ℹ |# )pass (\d+)/) ?? num(/test result: \w+\. (\d+) passed/)
  const failed = num(/(\d+) (?:failed|failing)\b/) ?? num(/(?:ℹ |# )fail (\d+)/)
  // Cursor reports no exit code, so a FAIL marker or a failure count decides there.
  const fail = exitFailed || (failed ?? 0) > 0 || (failed === undefined && /^(FAIL|--- FAIL|not ok)\b/m.test(output))
  return { state: fail ? 'fail' : 'pass', passed: passed ?? null, failed: failed ?? null }
}

function projectOf(dir) {
  if (!dir) return ''
  for (let d = dir; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, '.git'))) return path.basename(d)
    if (path.dirname(d) === d) return path.basename(dir)
  }
}

const fileOf = id => path.join(DIR, `${String(id).replace(/[^\w.-]/g, '_')}.json`)

function load(id) {
  try { return JSON.parse(fs.readFileSync(fileOf(id), 'utf8')) } catch { return null }
}

// shortcut: read-modify-write without a lock; two hooks racing on one session can drop one update. Add a lock file if that shows.
function save(s) {
  fs.mkdirSync(DIR, { recursive: true })
  const tmp = `${fileOf(s.session)}.${process.pid}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(s, null, 1))
  fs.renameSync(tmp, fileOf(s.session))
}

function fresh(host, session, now) {
  return {
    host, session, project: '', name: '', model: '', started: now, updated: now,
    turns: 0, agentMs: 0, turnStart: null, cost: null, lastTurnCost: null,
    tokens: null, tests: { state: 'none', passed: null, failed: null }, files: [],
  }
}

// One hook event in, the session's new state out. Pure apart from reading transcripts.
function apply(host, e, s, now) {
  const ev = e.hook_event_name
  s = { ...s, updated: now }
  if (!s.model && e.model) s.model = e.model
  const root = host === 'cursor' ? (e.workspace_roots || [])[0] : e.cwd
  if (!s.project && root) s.project = projectOf(root)

  if (ev === 'UserPromptSubmit' || ev === 'beforeSubmitPrompt') {
    const text = String(e.prompt || '').trim()
    if (!s.name && text && !text.startsWith('/')) s.name = text.split('\n')[0].slice(0, 80)
    s.turnStart = now
  } else if (ev === 'PostToolUse' || ev === 'PostToolUseFailure' || ev === 'afterShellExecution' || ev === 'afterFileEdit') {
    const shell = ev === 'afterShellExecution' || e.tool_name === 'Bash'
    const command = shell ? String(e.command ?? (e.tool_input || {}).command ?? '') : ''
    if (shell && TEST_CMD.test(command)) {
      const r = e.tool_response || {}
      const out = ev === 'afterShellExecution' ? String(e.output || '') : `${r.stdout || ''}\n${r.stderr || ''}\n${e.error || ''}`
      s.tests = testResult(out, ev === 'PostToolUseFailure')
    }
    const file = ev === 'afterFileEdit' ? e.file_path : !shell && (e.tool_input || {}).file_path
    if (file) {
      if (!s.files.includes(file)) s.files = [...s.files, file]
      if (s.tests.state !== 'none') s.tests = { ...s.tests, state: 'stale' }
    }
  } else if (ev === 'Stop' || ev === 'stop') {
    s.turns += 1
    if (s.turnStart !== null) s.agentMs += Math.max(0, now - s.turnStart)
    s.turnStart = null
    if (host === 'claude' && e.transcript_path) {
      const u = claudeUsage([e.transcript_path, ...subagentFiles(e.transcript_path)])
      s.lastTurnCost = u.cost !== null && s.cost !== null ? u.cost - s.cost : u.cost
      s.cost = u.cost
      s.tokens = u.tokens
      if (u.model) s.model = u.model
    }
  } else if (ev === 'sessionEnd') {
    // The Cursor CLI (-p) sends no beforeSubmitPrompt or stop, only sessionStart and sessionEnd.
    const t = e.transcript_path ? cursorTranscript(e.transcript_path) : { name: '', turns: 0 }
    if (!s.name && !t.name.startsWith('/')) s.name = t.name
    s.turns = Math.max(s.turns, t.turns)
    // In the IDE, stop already timed each turn; sessionEnd's duration there is the composer's whole life.
    if (s.agentMs === 0 && e.duration_ms) s.agentMs = e.duration_ms
  }
  return s
}

const readStdin = () => { try { return fs.readFileSync(0, 'utf8') } catch { return '' } }

function hook(host) {
  let e = {}
  try { e = JSON.parse(readStdin() || '{}') } catch {}
  const session = e.session_id || e.conversation_id
  if (session) {
    const now = Date.now()
    try {
      const s = apply(host, e, load(session) || fresh(host, session, now), now)
      save(s)
      if (['Stop', 'stop', 'sessionEnd'].includes(e.hook_event_name)) writeBoard(now)
    } catch (err) {
      process.stderr.write(`tjstack metrics: ${err.message}\n`)
    }
  }
  // Cursor's beforeSubmitPrompt reads a verdict; every other event ignores an empty answer.
  process.stdout.write(e.hook_event_name === 'beforeSubmitPrompt' ? '{"continue":true}\n' : '{}\n')
}

function sessions() {
  let names = []
  try { names = fs.readdirSync(DIR).filter(f => f.endsWith('.json')) } catch {}
  return names.flatMap(f => {
    try { return [JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))] } catch { return [] }
  })
}

function writeBoard(now = Date.now()) {
  fs.mkdirSync(DIR, { recursive: true })
  const file = path.join(DIR, 'board.html')
  fs.writeFileSync(file, require('./board').boardHtml(sessions(), now))
  return file
}

module.exports = { apply, fresh, claudeUsage, cursorTranscript, replyCost, testResult, projectOf, TEST_CMD }

if (require.main === module) {
  const [mode, flag] = process.argv.slice(2)
  if (mode === 'board') {
    const file = writeBoard()
    console.log(file)
    if (flag === '--open') {
      const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open'
      require('child_process').spawn(cmd, [file], { detached: true, stdio: 'ignore' }).on('error', () => {}).unref()
    }
  } else if (mode === 'claude' || mode === 'cursor') {
    hook(mode)
  } else {
    console.error('usage: metrics.js claude|cursor < event.json   |   metrics.js board [--open]')
    process.exit(2)
  }
}
