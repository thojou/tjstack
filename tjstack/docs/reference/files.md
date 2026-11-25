# Files tjstack reads and writes

tjstack keeps its configuration in rules, its design records under `docs/`, and its working logs outside git. This page lists every location, which skill writes it, and whether it belongs in a commit.

## Configuration rules

`/setup-tjstack` and `/setup-source` write these. They live in your home directory and apply to every project. They load when a chat starts, so start a new chat after you change one.

| Rule | Cursor | Claude Code | Written by | Read by |
| --- | --- | --- | --- | --- |
| Models per role and the budget | `~/.cursor/rules/tjstack-models.mdc` | `~/.claude/rules/tjstack-models.md` | `/setup-tjstack` | `spawn-subagent`, so every skill that spawns |
| Subagent environment | `~/.cursor/rules/tjstack-environment.mdc` | `~/.claude/rules/tjstack-environment.md` | `/setup-tjstack` | `spawn-subagent` |
| Harness translation | none | `~/.claude/rules/tjstack-harness.md` | `/setup-tjstack` | Every skill outside Cursor |
| Evidence sources for `/why` | `~/.cursor/rules/source-playbooks.mdc` | `~/.claude/tjstack/source-playbooks.md` | `/setup-source` | `/why`, `/catch-up` |

The source-playbooks rule is not always applied. In Claude Code it lives outside `~/.claude/rules/` on purpose, because every file there loads in every session.

A missing models rule makes skills ask you to run `/setup-tjstack`. A missing environment rule means `local`. `/setup-tjstack` deletes a leftover home PR-remote rule. Opening a PR does not read it.

## Project rules

Commit these. They apply to this repository only.

| Rule | Cursor | Claude Code | Written by | Read by |
| --- | --- | --- | --- | --- |
| PR remote alias | `.cursor/rules/tjstack-pr-remote.mdc` | `.claude/rules/tjstack-pr-remote.md` | the repo | Opening a PR, Babysit, Autopilot-stack |

The line is `pr remote: <alias>`, one git remote name. `AGENTS.md` or `CLAUDE.md` can name the remote instead. A remote named in the prompt wins over all of them, and with none of them, the remote is `origin`. The host of that remote's push URL picks `gh` or `glab`.

## Personal and project skills

| What | Cursor | Claude Code | Written by |
| --- | --- | --- | --- |
| Your mode skill | `.cursor/skills/<name>-mode/` or `~/.cursor/skills/<name>-mode/` | `.claude/skills/...` or `~/.claude/skills/...` | `/customize-my-mode` |
| Source playbooks | `~/.cursor/skills/source-<mcp>/` | `~/.claude/skills/source-<mcp>/` | `/create-source-playbook` |
| Verification skill | `.cursor/skills/verify-<app>/` | `.claude/skills/verify-<app>/` | `/create-verification-skill` |
| Any skill you author | `.cursor/skills/<name>/` or `~/.cursor/skills/<name>/` | `.claude/skills/<name>/` or `~/.claude/skills/<name>/` | `/create-skill` |

Commit project skills, so every person and agent on the team uses the same ones. Personal skills stay in your home directory.

## Design records in the repository

These live under `docs/` at the repository root by default. If your project already keeps them elsewhere, the skills use your paths. Commit them.

| Document | Default path | Written by |
| --- | --- | --- |
| Domain glossary | `docs/CONTEXT.md` | `/interview` |
| Context map, for multi-context repos | `docs/CONTEXT-MAP.md` | `/interview` |
| Architecture decisions | `docs/adr/NNNN-<slug>.md` | `/create-adr`, `/interview` |
| Product requirements | `docs/prd/NNNN-<feature>.md` | `/create-prd` |
| Multi-PR plans | the agent store's `docs/`, unless you name a path | Multi-phase plan playbook |
| Learning workspace | `docs/learn/<topic>/` | `/teach` |

Numbers come from a script, `next-id.sh` in the `create-adr` skill, never from counting files by hand. A multi-day plan can stay committed while the work runs. Remove it once the last PR merges.

## Working files, usually not committed

| File | Location | Written by | Commit it when |
| --- | --- | --- | --- |
| Decision trail | `decisions.tsv`, or `.audit/<task-slug>.tsv` | `/track-your-work` | A reviewer needs the trail to trust the result |
| Autopilot children | `.audit/children.tsv` in each owner's checkout | Autopilot-stack | Never |
| Resume note | the pause reply, or `/tmp/<slug>-resume.md` before context compaction | Pause safely | Never |
| Prototypes | `/tmp/prototype-<slug>/` | `/prototype` | Never. Prototype code doesn't merge. |
| Arena candidates | `/tmp/arena-<slug>/candidate-<n>/` | `/arena` | Never |
| Peer runs | the `run=` directory the script prints | `/peer-subagent` | Never |
| Session metrics | `~/.config/tjstack/metrics/<session>.json` and `board.html`, or under `$XDG_CONFIG_HOME/tjstack/metrics/` | The metrics hooks | Never. They stay on your machine. |

## What tjstack reads but never writes

| Source | Read by | Notes |
| --- | --- | --- |
| Your chat transcripts | `/catch-up`, `/retro`, `/customize-my-mode`, Session pickup, `/track-your-work` | Only the active workspace's transcripts. Never another project's, unless you ask. In Claude Code they're under `~/.claude/projects/<slug>/`. |
| Git history and PRs | `/why`, `/blast-radius`, `/catch-up`, Babysit | Through `git`, `gh`, and `glab`. |
| MCP servers | `/why`, `/catch-up` | Only the servers listed in the source-playbooks rule. |
