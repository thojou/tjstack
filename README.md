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

## Credits

Adapted in part from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, [skills](https://github.com/mattpocock/skills) by Matt Pocock, and [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert, all MIT. License texts are in NOTICE. Several principles distill ideas from *Clean Code* by Robert C. Martin (Prentice Hall, 2008), restated in our own words.
