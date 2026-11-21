// The tjstack band above the Claude Code prompt: quick actions and this session's metrics.
// It only reads: hooks/metrics.js writes the numbers (the same script Cursor runs), so band and board agree.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Metrics, Tests, Tokens } from './types'

const metrics = atom({ plugin: 'tjstack', key: 'metrics' } as const, null)
const details = atom({ plugin: 'tjstack', key: 'details' } as const, false)
const tjMode = atom({ plugin: 'tjstack', key: 'tjMode' } as const, false)

const TJ_MODE_CONTEXT = 'tj-mode is on: before anything else, load the `tjstack:tj-mode` skill with the Skill tool and handle this request by it.'

const home = async ($: EngineInterface) => (await $.env.get('HOME')) ?? (await $.env.get('USERPROFILE')) ?? ''
const metricsDir = async ($: EngineInterface) => `${(await $.env.get('XDG_CONFIG_HOME')) ?? `${await home($)}/.config`}/tjstack/metrics`

async function reload($: EngineInterface) {
  const id = (await $.session.id()).replace(/[^\w.-]/g, '_')
  const text = await $.fs.read(`${await metricsDir($)}/${id}.json`).catch(() => '')
  let m: Metrics | null = null
  try {
    m = text ? (JSON.parse(text) as Metrics) : null
  } catch {}
  await update($, metrics, () => m)
}

const elapsed = (ms: number) => {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}
const fmtTokens = (n: number) => (n < 1000 ? `${n}` : n < 1e6 ? `${+(n / 1e3).toFixed(1)}k` : `${+(n / 1e6).toFixed(1)}M`)
const total = (t: Tokens | null) => (t ? t.input + t.output + t.cacheRead + t.cacheWrite : 0)
const usd = (n: number | null) => (n === null ? '–' : `$${n.toFixed(2)}`)

const testsText = (t: Tests) =>
  t.state === 'pass'
    ? `✓ ${t.passed ?? ''} passed`.replace('  ', ' ')
    : t.state === 'fail'
      ? `✗ ${t.failed ?? ''} failed`.replace('  ', ' ')
      : t.state === 'stale'
        ? 'no test since change'
        : ''
const testsTone = (t: Tests) => (t.state === 'pass' ? 'success' : t.state === 'fail' ? 'error' : t.state === 'stale' ? 'warning' : undefined)

async function openBoard($: EngineInterface) {
  const file = `${await metricsDir($)}/board.html`
  if (!(await $.fs.exists(file).catch(() => false))) return $.ui.toast('tjstack: no board yet, finish a turn first')
  const windows = (await $.env.get('OS')) === 'Windows_NT'
  const mac = !windows && (await $.process.run(['uname'])).stdout.trim() === 'Darwin'
  const ran = await $.process.run(windows ? ['cmd', '/c', 'start', '', file] : [mac ? 'open' : 'xdg-open', file]).catch(() => undefined)
  if (!ran || ran.exitCode !== 0) $.ui.toast(`tjstack board: ${file}`)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await reload($).catch(() => undefined)
    const shown = (await $.store.get('details')) === true
    await update($, details, () => shown)
    const isOn = (await $.store.get('tjMode')) === true
    await update($, tjMode, () => isOn)
    return next(e)
  }).catch(($, e, next) => next(e))

  // Slash commands keep their own instructions; everything typed gets the tj-mode skill.
  on('prompt.submit', async ($, e, next) => {
    if (e.command || e.isMeta || !(await read($, tjMode))) return next(e)
    return next({ ...e, context: [...(e.context ?? []), TJ_MODE_CONTEXT] })
  }).catch(($, e, next) => next(e))

  // The Stop and PostToolUse hooks have written by now; pick their numbers up.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await reload($).catch(() => undefined)
    return result
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    await reload($).catch(() => undefined)
    return result
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    // Other mods share this slot: draw theirs below ours.
    const below = await next(e).catch(() => undefined)
    const m = await read($, metrics)
    const open = await read($, details)
    const tj = await read($, tjMode)
    const { Box, Text, Button } = $.ui.resolve(e)
    const width = e.surface === 'terminal' ? e.props.bodyColumns : undefined
    const stack = (mine: NonNullable<typeof below>) => (below ? <Box flexDirection="column">{mine}{below}</Box> : mine)

    const run = (command: string) => () => $.command.run({ command })
    const toggleTj = async () => {
      await update($, tjMode, x => !x)
      await $.store.set('tjMode', !tj)
    }
    const toggle = async () => {
      await update($, details, x => !x)
      await $.store.set('details', !open)
    }
    const board = () => openBoard($).catch(() => $.ui.toast('tjstack: could not open the board'))
    const tests = m ? testsText(m.tests) : ''
    // An array, not a fragment: a fragment draws as a column of its own.
    const actions = [
      <Box key="gap" flexGrow={1} />,
      <Button key="tj-mode" plain label={tj ? 'tj-mode ●' : 'tj-mode ○'} onPress={toggleTj} />,
      <Button key="retro" plain label="Retro" onPress={run('tjstack:retro')} />,
      <Button key="board" plain label="Board" onPress={board} />,
      <Button key="details" plain label={open ? 'Compact' : 'Details'} onPress={toggle} />,
    ]

    if (!open) {
      return stack(
        <Box flexDirection="row" alignItems="center" gap={2} width={width}>
          <Text color="suggestion">● tjstack</Text>
          <Text>{usd(m?.cost ?? null)}</Text>
          <Text dimColor>{elapsed(m?.agentMs ?? 0)}</Text>
          {tests !== '' && <Text color={m ? testsTone(m.tests) : undefined}>{tests}</Text>}
          {actions}
        </Box>
      )
    }

    const cols = [
      { key: 'cost', label: 'cost', value: usd(m?.cost ?? null), sub: m?.lastTurnCost != null ? `last turn $${m.lastTurnCost.toFixed(2)}` : '' },
      { key: 'tokens', label: 'tokens', value: fmtTokens(total(m?.tokens ?? null)), sub: `${m?.turns ?? 0} ${m?.turns === 1 ? 'turn' : 'turns'}` },
      { key: 'time', label: 'agent time', value: elapsed(m?.agentMs ?? 0), sub: m && m.turns > 0 ? `⌀ ${elapsed(m.agentMs / m.turns)} / turn` : '' },
      { key: 'tests', label: 'tests', value: tests || 'not run', sub: m?.tests.state === 'stale' ? 'code changed since' : '', tone: m ? testsTone(m.tests) : undefined },
    ]
    return stack(
      <Box flexDirection="column" width={width}>
        <Box flexDirection="row" alignItems="center" gap={1}>
          <Text color="suggestion">● tjstack</Text>
          {actions}
        </Box>
        <Text dimColor wrap="truncate-end">
          {'─'.repeat(e.props.bodyColumns)}
        </Text>
        <Box flexDirection="row" gap={2}>
          {cols.map(c => (
            <Box key={c.key} flexDirection="column" {...(width === undefined ? { flexGrow: 1 } : { width: Math.max(10, Math.floor(width / cols.length) - 2) })}>
              <Text dimColor>{c.label}</Text>
              <Text bold color={c.tone}>
                {c.value}
              </Text>
              <Text dimColor wrap="truncate-end">
                {c.sub}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }).catch(($, e, next) => next(e))
}
