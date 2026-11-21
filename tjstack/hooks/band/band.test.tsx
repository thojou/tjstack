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
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  await $.prompt.submit({ text: 'hi' })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await ui.press({ key: 'tj-mode' })
  await $.prompt.submit({ text: 'hi' })
  await $.prompt.submit({ text: '/tjstack:retro', command: { name: 'tjstack:retro', args: '' } as never })
  await ui.unmount()

  expect(seen[0]).toBeUndefined()
  expect(seen[1]?.[0]).toContain('tjstack:tj-mode')
  expect(seen[2]).toBeUndefined()
})
