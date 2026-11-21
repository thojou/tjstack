# tjstack

This repository is a plugin marketplace for Cursor and Claude Code. The installable package is `tjstack/`.

## Install

**Cursor.** In Customize, add this repository as a local folder. Cursor reads `.cursor-plugin/plugin.json` and discovers `skills/`, `rules/`, `agents/`, `commands/`, and `hooks/hooks.json`.

**Claude Code.** Add the marketplace and install the plugin:

```text
/plugin marketplace add thojou/tjstack
/plugin install tjstack@tjstack
```

Claude Code reads `.claude-plugin/plugin.json` and discovers `skills/` and `agents/`. Skills run as `/tjstack:<skill>`, for example `/tjstack:tj-mode`. For a local checkout, run `claude --plugin-dir ./tjstack`. Then run `/tjstack:setup-tjstack` once. It writes the rules tjstack reads, including the harness rule that translates the Cursor terms in the skills.

## Skills

Skills live in `tjstack/skills/<category>/<name>/SKILL.md`. The category only groups the files. The leaf directory is the skill name, so `skills/design/architect/` runs as `/tjstack:architect`. Both `plugin.json` files list each category directory under `skills`, because neither host scans `skills/` more than one level deep.

| Category | Purpose |
| --- | --- |
| `mode` | How the agent behaves, and how to adapt that |
| `orchestrate` | Plan work and spread it across agents |
| `session` | The running work: build, commit, track, review the session |
| `design` | Before code: clarify, record, decide |
| `understand` | Understand code, history, and answers |
| `review` | Check and clean up finished work |
| `writing` | Text and documents for people |
| `principles` | One `principle-*` skill per engineering rule |
| `setup` | Set up and extend tjstack |

To add a skill, follow the [create-skill](tjstack/skills/setup/create-skill/SKILL.md) skill. A new category also goes into `skills` in both `plugin.json` files. To add a principle, follow the [create-principle](tjstack/skills/setup/create-principle/SKILL.md) skill. Run `python3 scripts/check-skills.py` after either. It checks that names are unique, that both manifests list every category, and that relative links between skills resolve.

## Session metrics

tjstack tracks each agent session through hooks in both hosts. One script, `tjstack/hooks/metrics.js`, handles both hosts and needs Node.js on `PATH`. It writes one JSON file per session to `~/.config/tjstack/metrics/` (or `$XDG_CONFIG_HOME/tjstack/metrics/`). After every turn, it rebuilds `board.html` in the same folder. Open that file in a browser to compare sessions across projects and hosts. No data leaves your machine.

| Metric | Claude Code | Cursor |
| --- | --- | --- |
| Agent time and turns | yes | yes |
| Tests (pass, fail, stale after an edit) | yes | yes, read from the output, because Cursor reports no exit code |
| Tokens and cost | yes, from the transcript at list prices | no, Cursor hooks do not report usage |
| Model and task name | yes | yes |

**Claude Code** also shows a band above the prompt. The band holds this session's cost, agent time and tests, plus the buttons tj-mode, Retro (`/tjstack:retro`), Board and Details. While tj-mode is on (`●`), every typed request runs with the `/tjstack:tj-mode` skill; slash commands run as typed. The choice is kept across sessions. Press ctrl+x, then Tab, to move the focus into the band from the keyboard. The band is a Claude Code hooks module (`tjstack/hooks/band/register.tsx`). Claude Code hooks modules are in early access.

**Cursor** gets the same hooks through `tjstack/hooks/cursor-hooks.json`, but no band, because Cursor has no UI extension point for it. The Cursor CLI in print mode (`agent -p`) sends no `beforeSubmitPrompt` or `stop` event. There, the `sessionEnd` hook takes the task name and the turn count from the transcript, and the agent time from the session's duration.

To rebuild the board by hand and open it, run `node tjstack/hooks/metrics.js board --open`. To run the tests, run `node --test tjstack/hooks/metrics.test.js`.

## Credits

Adapted in part from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan and [skills](https://github.com/mattpocock/skills) by Matt Pocock, both MIT. License texts are in NOTICE. Several principles distill ideas from *Clean Code* by Robert C. Martin (Prentice Hall, 2008), restated in our own words.
