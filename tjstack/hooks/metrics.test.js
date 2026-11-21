// node --test tjstack/hooks
const test = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { apply, fresh, claudeUsage, replyCost, testResult } = require('./metrics')
const { boardHtml } = require('./board')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tjstack-metrics-'))
const reply = (id, model, usage) => JSON.stringify({ type: 'assistant', message: { id, model, usage } })

test('reply cost follows the price list, fast mode doubles, unknown model is unpriced', () => {
  const u = { input_tokens: 1e6, output_tokens: 1e6, cache_read_input_tokens: 1e6, cache_creation_input_tokens: 1e6 }
  assert.strictEqual(replyCost('claude-opus-5-5', u), 4 + 20 + 0.2 + 5)
  assert.strictEqual(replyCost('claude-opus-5-5[1m]', { ...u, speed: 'fast' }), 2 * (4 + 20 + 0.2 + 5))
  assert.strictEqual(replyCost('gpt-9', u), null)
})

test('claude usage counts each reply once and sums subagent transcripts', () => {
  const main = path.join(tmp, 'main.jsonl')
  const sub = path.join(tmp, 'sub.jsonl')
  const u = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 100, cache_creation_input_tokens: 0 }
  fs.writeFileSync(main, [reply('a', 'claude-opus-5-5', u), reply('a', 'claude-opus-5-5', u), 'not json "usage"', reply('b', 'claude-opus-5-5', u)].join('\n'))
  fs.writeFileSync(sub, reply('c', 'claude-haiku-5-5', u))
  const r = claudeUsage([main, sub, path.join(tmp, 'missing.jsonl')])
  assert.deepStrictEqual(r.tokens, { input: 30, output: 15, cacheRead: 300, cacheWrite: 0 })
  assert.strictEqual(r.model, 'claude-opus-5-5')
  assert.ok(r.cost > 0)
})

test('test results from runner output and exit status', () => {
  assert.deepStrictEqual(testResult('# pass 7\n# fail 0', false), { state: 'pass', passed: 7, failed: 0 })
  assert.strictEqual(testResult('3 passed, 1 failed in 0.2s', false).state, 'fail')
  assert.strictEqual(testResult('FAIL src/a.test.ts', false).state, 'fail')
  assert.strictEqual(testResult('whatever', true).state, 'fail')
})

test('a cursor session: prompt, test run, edit, stop', () => {
  const base = { conversation_id: 'c1', model: 'gpt-5', workspace_roots: [tmp] }
  let s = fresh('cursor', 'c1', 0)
  s = apply('cursor', { ...base, hook_event_name: 'beforeSubmitPrompt', prompt: 'Fix the parser\nmore' }, s, 1000)
  s = apply('cursor', { ...base, hook_event_name: 'afterShellExecution', command: 'npm test', output: '12 passing' }, s, 2000)
  assert.deepStrictEqual(s.tests, { state: 'pass', passed: 12, failed: null })
  s = apply('cursor', { ...base, hook_event_name: 'afterFileEdit', file_path: '/x/a.js', edits: [] }, s, 3000)
  assert.strictEqual(s.tests.state, 'stale')
  s = apply('cursor', { ...base, hook_event_name: 'stop', status: 'completed', loop_count: 0 }, s, 6000)
  assert.strictEqual(s.name, 'Fix the parser')
  assert.strictEqual(s.model, 'gpt-5')
  assert.strictEqual(s.turns, 1)
  assert.strictEqual(s.agentMs, 5000)
  assert.strictEqual(s.cost, null)
  assert.deepStrictEqual(s.files, ['/x/a.js'])
})

test('a cursor CLI session: only sessionEnd, name and turns from the transcript', () => {
  const transcript = path.join(tmp, 'cursor.jsonl')
  fs.writeFileSync(transcript, [
    JSON.stringify({ role: 'user', message: { content: [{ type: 'text', text: '<timestamp>x</timestamp>\n<user_query>\nSay hi\nplease\n</user_query>' }] } }),
    JSON.stringify({ role: 'assistant', message: { content: [{ type: 'text', text: 'Hi' }] } }),
    JSON.stringify({ type: 'turn_ended', status: 'success' }),
  ].join('\n'))
  const s = apply('cursor', { conversation_id: 'c2', hook_event_name: 'sessionEnd', duration_ms: 4200, transcript_path: transcript }, fresh('cursor', 'c2', 0), 1)
  assert.strictEqual(s.name, 'Say hi')
  assert.strictEqual(s.turns, 1)
  assert.strictEqual(s.agentMs, 4200)
  // After stop has timed the turns (the IDE), sessionEnd keeps that time.
  const timed = apply('cursor', { conversation_id: 'c2', hook_event_name: 'sessionEnd', duration_ms: 999999 }, { ...s, agentMs: 3000 }, 2)
  assert.strictEqual(timed.agentMs, 3000)
})

test('a claude session: a failing test run, then stop reads the transcript', () => {
  const transcript = path.join(tmp, 's1.jsonl')
  fs.writeFileSync(transcript, reply('m', 'claude-sonnet-5-5', { input_tokens: 1000, output_tokens: 1000 }))
  const base = { session_id: 's1', cwd: tmp, transcript_path: transcript }
  let s = fresh('claude', 's1', 0)
  s = apply('claude', { ...base, hook_event_name: 'UserPromptSubmit', prompt: '/tjstack:retro' }, s, 0)
  assert.strictEqual(s.name, '')
  s = apply('claude', { ...base, hook_event_name: 'PostToolUseFailure', tool_name: 'Bash', tool_input: { command: 'pytest -q' }, error: '2 failed, 5 passed' }, s, 10)
  assert.deepStrictEqual(s.tests, { state: 'fail', passed: 5, failed: 2 })
  s = apply('claude', { ...base, hook_event_name: 'Stop' }, s, 500)
  assert.strictEqual(s.agentMs, 500)
  assert.strictEqual(s.tokens.output, 1000)
  assert.strictEqual(s.cost, (1000 * 2 + 1000 * 10) / 1e6)
})

test('the board keeps names as data, never markup', () => {
  const html = boardHtml([{ ...fresh('claude', 'x', 0), name: '</script><img src=x onerror=alert(1)>', files: ['/secret/path.js'] }], 0)
  assert.ok(!html.includes('</script><img'))
  assert.ok(!html.includes('/secret/path.js'))
})
