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

To add a principle, follow [tjstack/PRINCIPLES.md](tjstack/PRINCIPLES.md).

## Credits

Adapted in part from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan and [skills](https://github.com/mattpocock/skills) by Matt Pocock, both MIT. License texts are in NOTICE. Several principles distill ideas from *Clean Code* by Robert C. Martin (Prentice Hall, 2008), restated in our own words.
