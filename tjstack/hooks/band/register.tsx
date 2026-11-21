// The tjstack band above the Claude Code prompt: quick actions and this session's metrics.
// It only reads: hooks/metrics.js writes the numbers (the same script Cursor runs), so band and board agree.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Metrics, Tests, Tokens } from './types'

const metrics = atom({ plugin: 'tjstack', key: 'metrics' } as const, null)
const details = atom({ plugin: 'tjstack', key: 'details' } as const, false)
const tjMode = atom({ plugin: 'tjstack', key: 'tjMode' } as const, false)

// tj-mode sets disable-model-invocation, so the model cannot load it through the Skill tool: hand it the skill's text.
async function tjModeContext($: EngineInterface) {
  const file = `${$.plugin.root}/skills/mode/tj-mode/SKILL.md`
  const body = (await $.fs.read(file)).replace(/^---\n[\s\S]*?\n---\n/, '')
  return `tj-mode is on: handle this request by the tj-mode skill below, as if the user had run /tjstack:tj-mode. The skill's file is ${file}.\n\n${body}`
}

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

type Col = { key: string; label: string; value: string; sub: string; tone?: 'warning' | 'success' | 'error' }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const fit = (s: string, max: number) => (s.length > max ? `${s.slice(0, Math.max(1, max - 1))}…` : s)
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
// The image cannot read the app's theme, so it follows the system's.
const STYLE = `.l,.s{fill:#87867f;font:12px ${FONT}}.v{fill:#1f1e1d;font:600 16px ${FONT}}.d{stroke:#1f1e1d;stroke-opacity:.12}.warning{fill:#a86400}.success{fill:#2e7d32}.error{fill:#c62828}@media (prefers-color-scheme:dark){.v{fill:#ecebe6}.d{stroke:#fff;stroke-opacity:.14}.warning{fill:#e3a03d}.success{fill:#6abf69}.error{fill:#ef6a5a}}`

// Text glyphs make broken lines in the desktop's proportional font; an SVG draws real dividers and exact columns.
export function metricsSvg(cols: Col[], width = 720): string {
  const height = 64
  const colW = width / Math.max(1, cols.length)
  let body = `<line class="d" x1="0" y1="0.5" x2="${width}" y2="0.5"/>`
  cols.forEach((c, i) => {
    const x = i * colW + (i === 0 ? 0 : 12)
    const tone = c.tone ? ` ${c.tone}` : ''
    if (i > 0) body += `<line class="d" x1="${i * colW}" y1="14" x2="${i * colW}" y2="${height - 2}"/>`
    body += `<text class="l" x="${x}" y="24">${esc(c.label)}</text>`
    body += `<text class="v${tone}" x="${x}" y="44">${esc(fit(c.value, Math.floor((colW - 16) / 9)))}</text>`
    if (c.sub) body += `<text class="s" x="${x}" y="61">${esc(fit(c.sub, Math.floor((colW - 16) / 6.2)))}</text>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><style>${STYLE}</style>${body}</svg>`
}

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
    return next({ ...e, context: [...(e.context ?? []), await tjModeContext($)] })
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
      <Button key="retro" plain label="Retro" onPress={run('tjstack:retro')} />,
      <Button key="board" plain label="Board" onPress={board} />,
      <Button key="details" plain label={open ? 'Compact' : 'Details'} onPress={toggle} />,
    ]

    if (!open) {
      return stack(
        <Box flexDirection="row" alignItems="center" gap={2} width={width}>
          <Button key="tj-mode" plain onPress={toggleTj}>
            <Text color={tj ? 'suggestion' : 'inactive'}>●</Text> tj-mode
          </Button>
          <Text>{usd(m?.cost ?? null)}</Text>
          <Text dimColor>{elapsed(m?.agentMs ?? 0)}</Text>
          {tests !== '' && <Text color={m ? testsTone(m.tests) : undefined}>{tests}</Text>}
          {actions}
        </Box>
      )
    }

    const avg = m && m.cost !== null && m.turns > 0 ? ` · ⌀ $${(m.cost / m.turns).toFixed(2)}` : ''
    const cols: Col[] = [
      { key: 'cost', label: 'cost', value: usd(m?.cost ?? null), sub: m?.lastTurnCost != null ? `last $${m.lastTurnCost.toFixed(2)}${avg}` : '' },
      { key: 'tokens', label: 'tokens', value: fmtTokens(total(m?.tokens ?? null)), sub: `${m?.turns ?? 0} ${m?.turns === 1 ? 'turn' : 'turns'}` },
      { key: 'time', label: 'agent time', value: elapsed(m?.agentMs ?? 0), sub: m && m.turns > 0 ? `⌀ ${elapsed(m.agentMs / m.turns)} / turn` : '' },
      { key: 'tests', label: 'tests', value: tests || 'not run', sub: m?.tests.state === 'stale' ? 'code changed since' : '', tone: m ? testsTone(m.tests) : undefined },
    ]
    let body = (
      <Box flexDirection="column">
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
    if (e.surface === 'desktop') {
      const { Svg } = $.ui.resolve(e)
      body = <Svg source={metricsSvg(cols)} alt={cols.map(c => `${c.label} ${c.value}`).join(', ')} />
    }
    return stack(
      // The desktop's SVG draws its own line at the top, which would touch the buttons without the gap.
      <Box flexDirection="column" width={width} gap={e.surface === 'desktop' ? 1 : 0}>
        <Box flexDirection="row" alignItems="center" gap={1}>
          <Button
            key="tj-mode"
            label="tj-mode"
            {...(tj ? { variant: 'primary' as const } : { plain: true as const, dimColor: true })}
            onPress={toggleTj}
          />
          {actions}
        </Box>
        {body}
      </Box>
    )
  }).catch(($, e, next) => next(e))
}
