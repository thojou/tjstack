---
name: setup-tjstack
description: >-
  Configure which models tjstack uses per role, at what reasoning budget,
  which git remote alias Opening a PR publishes to, and whether subagents
  run in cloud or local. Asks for a budget, runs `propose.py` (it calls
  `agent models`), proposes a slug per role, and writes three always-applied
  rules. Use for /setup-tjstack, "configure tjstack models", "tjstack budget",
  "PR remote", "subagent environment", "cloud or local", or changing those
  choices.
---

# Setup tjstack

Write three always-applied rules. `~/.cursor/rules/tjstack-models.mdc` sets tjstack's model per role. Skills that spawn a subagent read it through `/spawn-subagent`. `~/.cursor/rules/tjstack-pr-remote.mdc` sets the git remote alias Opening a PR pushes to and opens against. The default alias is `origin`. `~/.cursor/rules/tjstack-environment.mdc` sets whether subagents run as cloud agents or on this machine. `/spawn-subagent` reads it too. The default is `local`.


## Steps

### 1. Detect available models

Do not do this yourself. Do not read the Task tool schema, search MCP, or look for a CLI. Step 3 runs `propose.py`, which runs `agent models` and prints one slug per role. `inherit-parent` and `auto` stay valid values. Never write a real slug `propose.py` did not print.

### 2. Load current state

If `~/.cursor/rules/tjstack-models.mdc` exists, read it. Its `# budget` line and its role values are the current choices. If the file is missing, there is no current choice. Do not list the rules directory. A line whose role is not in the step 5 template is retired. Drop it.

### 3. Budget, propose, and confirm

**(a) Ask for a budget.** Prefer AskQuestion over free text. Offer these five options with these exact labels, and name the current budget when the rule records one. With no rule, the budget is `xhigh`.

- `low`
- `medium`
- `high`
- `xhigh`
- `max`

The label is the effort token. `low` sets `low`, `medium` sets `medium`, `high` sets `high`, `xhigh` sets `xhigh`, and `max` sets `max`.

**(b) Propose.** From this skill's directory, run:

```bash
python3 propose.py --budget <label>
```

Add `--current ~/.cursor/rules/tjstack-models.mdc` when that file exists. Stdout is the working table. `NEEDS_CHOICE` means that role needs a choice. If the command fails, stop. Do not invent a slug, and do not ask the user to paste one. Do not re-pick slugs by hand.

**(c) Show the roles and confirm.** Show that table. Also list each retired role step 2 dropped. Ask whether to accept as-is or change specific roles. Prefer AskQuestion over free text. Do not paste the model catalog into that question. If the user changes a role, run `agent models` and offer those slugs plus `inherit-parent` and `auto`. A list value runs one subagent per entry, alias entries included, so the list length sets the count. `arena runners`, `architect runners`, and `challenge reviewers` are that kind of list. `track-your-work reviewer` is also a comma-separated list on one line, but the skill picks one entry whose family differs from the parent's. It does not run one subagent per entry. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real slug written must be a slug `agent models` printed. `inherit-parent` and `auto` always pass. If a chosen real slug is not in that list, stop and ask again.

### 5. Write the rule

Write `~/.cursor/rules/tjstack-models.mdc` with `alwaysApply: true`, a `# budget` line with the chosen label only, and one line per role. The values are the slugs `propose.py` printed, not the angle brackets below. Overwrite the whole file so re-runs stay idempotent. Create `~/.cursor/rules/` if it is missing. Shape:

```
---
description: tjstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# tjstack model configuration. One line per role. Delete a line to fall back to propose.py in setup-tjstack.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit Task `model`).
# Alias entries in `arena runners`, `architect runners`, and `challenge reviewers` still count toward that line's fan-out. `arena cross-judge pool` selects one entry whose family differs from the parent's when possible. `swarm workers` is the default for every worker unless a race or comparison assigns another model per arm.
# budget: <chosen label>
bug-fix: <slug from step 2>
perf-issue: <slug from step 2>
feature, refactoring: <slug from step 2>
judgment and prose: <slug from step 2>
hardest tasks: <slug from step 2>
how explorer: <slug from step 2>
how explainer: <slug from step 2>
blast-radius reader: <slug from step 2>
catch-up miner: <slug from step 2>
why investigator: <slug from step 2>
why synthesizer: <slug from step 2>
track-your-work reviewer: <claude-opus slug>, <grok slug>
clean-comments reviewer: <slug from step 2>
arena runners: <claude-opus slug>, <grok slug>
arena cross-judge pool: <claude-opus slug>, <grok slug>
architect runners: <claude-opus slug>, <grok slug>
challenge reviewers: <claude-opus slug>, <grok slug>
swarm workers: <slug from step 2>
retro judgment: <slug from step 2>
retro tooling: <slug from step 2>
```

### 6. PR remote

This choice is the only place that picks the remote. Opening a PR does not choose one.

If `~/.cursor/rules/tjstack-pr-remote.mdc` exists, its `pr remote:` value is the current alias. Otherwise the alias is `origin`.

Ask whether to keep that alias or set another git remote name. Prefer AskQuestion. Offer the current alias. The other choice is a different alias the user types. The value is one remote name, such as `origin` or `gitlab`. It is not a URL, a host, or a project path. An empty value or a value with spaces is not an alias. Ask again.

Write `~/.cursor/rules/tjstack-pr-remote.mdc` with `alwaysApply: true`. Overwrite the whole file. Create `~/.cursor/rules/` if it is missing. Shape:

```
---
description: git remote alias tjstack uses when opening a pull request
alwaysApply: true
---
# Remote alias for Opening a PR. That playbook reads this line and does not choose a remote.
# Default is origin. Set another git remote name to publish elsewhere.
pr remote: <alias>
```

### 7. Subagent environment

This choice is the operator's explicit request for cloud agents. The Task tool starts a cloud agent only on that request.

If `~/.cursor/rules/tjstack-environment.mdc` exists, its `subagent environment:` value is the current choice. If the file or the line is missing, the choice is `local`.

Ask whether subagents run in `cloud` or `local`. Prefer AskQuestion. Offer both and name the current choice. `cloud` runs subagents as cloud agents, except those that need this machine, and falls back to local when a cloud spawn fails. `local` runs subagents on this machine, and each one that writes gets its own git worktree. Any other value is not a choice. Ask again.

Write `~/.cursor/rules/tjstack-environment.mdc` with `alwaysApply: true`. Overwrite the whole file. Create `~/.cursor/rules/` if it is missing. Shape:

```
---
description: where tjstack subagents run (cloud or local)
alwaysApply: true
---
# Environment for tjstack subagents. spawn-subagent reads this line.
# Default is local. A missing line means local. A failed cloud spawn falls back to local.
subagent environment: <cloud|local>
```

### 8. Confirm

Tell the user all three rules were written, which slug each role got, which PR remote alias was written, which subagent environment was written, and that all three apply to new sessions. Re-running this skill updates them.
