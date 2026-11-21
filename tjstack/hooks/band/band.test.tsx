import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'tjstack',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 20, bodyColumns: 80, scroll: { offset: 0, bodyRows: 19 }, view: {} },
} as const

test('the band shows before the first prompt', async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /tjstack/ }))?.text).toBe('● tjstack')
  await ui.unmount()
})

test('the tj-mode button adds the skill to typed prompts, not to slash commands', async ($, on) => {
  const seen: (readonly string[] | undefined)[] = []
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.submit', (_, e) => (seen.push(e.context), { text: e.text }))
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('fs.read', () => ({ value: '---\nname: tj-mode\n---\n# tj-mode\nbody' }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  await $.prompt.submit({ text: 'hi' })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await ui.press({ key: 'tj-mode' })
  await $.prompt.submit({ text: 'hi' })
  await $.prompt.submit({ text: '/tjstack:retro', command: { name: 'tjstack:retro', args: '' } as never })
  await ui.unmount()

  expect(seen[0]).toBeUndefined()
  expect(seen[1]?.[0]).toContain('/tjstack:tj-mode')
  expect(seen[1]?.[0]).toContain('# tj-mode\nbody')
  expect(seen[1]?.[0]).not.toContain('name: tj-mode')
  expect(seen[2]).toBeUndefined()
})

test('on desktop the Board button opens the board as a pane', async ($, on) => {
  const opened: string[] = []
  const m = { host: 'claude', session: 's1', project: 'p', name: 'Fix login', model: 'm', started: 0, updated: 1, turns: 2, agentMs: 5000, turnStart: null, cost: 0.5, lastTurnCost: null, tokens: null, tests: { state: 'pass', passed: 3, failed: null }, files: [] }
  on('env.get', (_, e) => ({ value: e.name === 'HOME' ? '/h' : undefined }))
  on('fs.list', () => ({ value: [{ name: 's1.json', kind: 'file', size: 1, mtimeMs: 1, isLink: false }] }))
  on('fs.read', () => ({ value: JSON.stringify(m) }))
  on('ui.open', (_, e) => (opened.push(e.id), { value: { isPlaced: true } }))

  const band = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await band.press({ key: 'board' })
  await band.unmount()
  expect(opened).toEqual(['tjstack-board'])

  const pane = await $.ui.mount({
    plugin: 'tjstack', component: 'Pane', requestId: 'tjstack-board', surface: 'desktop',
    props: { title: 'tjstack board', isFocused: false, bodyColumns: 80, placement: 'dock', scroll: { offset: 0, bodyRows: 20 }, view: {} },
  })
  expect((await pane.find({ type: 'Text', text: /Fix login/ }))?.text).toBe('Fix login')
  expect((await pane.find({ type: 'Text', text: /passed/ }))?.text).toBe('✓ 3 passed')
  await pane.unmount()
})
