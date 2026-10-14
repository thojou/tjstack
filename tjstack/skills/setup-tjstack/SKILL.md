---
name: setup-tjstack
description: >-
  Configure which models tjstack uses per role, at what reasoning budget,
  which git remote alias Opening a PR publishes to, and whether subagents
  run in cloud or local. Asks for a budget, loads the model list with
  `agent models`, proposes a slug per role, and writes three always-applied
  rules. Use for /setup-tjstack, "configure tjstack models", "tjstack budget",
  "PR remote", "subagent environment", "cloud or local", or changing those
  choices.
---

# Setup tjstack

Write three always-applied rules. `~/.cursor/rules/tjstack-models.mdc` sets tjstack's model per role. Skills that spawn a subagent read it through `/spawn-subagent`. `~/.cursor/rules/tjstack-pr-remote.mdc` sets the git remote alias Opening a PR pushes to and opens against. The default alias is `origin`. `~/.cursor/rules/tjstack-environment.mdc` sets whether subagents run as cloud agents or on this machine. `/spawn-subagent` reads it too. The default is `local`.


## Steps

### 1. Detect available models

Enumerate the model slugs you can pass to a `Task` subagent in this session. That is the dependable source. If Cursor also exposes a models API or CLI that lists the user's entitled models, prefer it for completeness. If you cannot detect any, ask the user to paste the slugs they have access to. Never write a real slug you have not confirmed is available. The aliases `inherit-parent` and `auto` are always valid even though they are not detected slugs.

### 2. Load current state

If `~/.cursor/rules/tjstack-models.mdc` exists, read it. Its `# budget` line and its role values are the current choices. Otherwise there is no current choice. A line whose role is not listed above is retired. Drop it.

### 3. Budget, propose, and confirm

**(a) Ask for a budget.** Prefer AskQuestion over free text. Offer these five options with these exact labels, and name the current budget when the rule records one. With no rule, the budget is `xhigh`.

- `low`
- `medium`
- `high`
- `xhigh`
- `max`

The label is the effort token. `low` sets `low`, `medium` sets `medium`, `high` sets `high`, `xhigh` sets `xhigh`, and `max` sets `max`.

**Load models.** Run `agent models`. Parse lines of the form `slug - name`. The slug is the first field. Skip the header, blank lines, and the `Tip:` line. If the command fails, stop. Do not invent a slug, and do not ask the user to paste one.

**Propose.** From that list, one suggestion per role: the newest slug of the role's class. The model id is the slug with a trailing `-fast` removed and with the effort token removed. The effort token is the last token, or the token before a trailing `fast`, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. Newest is the highest version number in the id. On a tie, prefer the id that does not start with `cursor-`. Ignore a `-thinking` slug when the same id exists without `-thinking`. Use `-fast` only when the role prefers it and that form is in the list. Otherwise use the form without `-fast`. `bug-fix` and `feature, refactoring` are class `grok` and prefer `-fast`. `judgment and prose` and `hardest tasks` are class `claude-opus` and prefer no `-fast`. `swarm workers` is class `grok` and prefers `-fast`. `retro judgment` is class `claude-opus` and prefers no `-fast`. `retro tooling` is class `grok` and prefers `-fast`. `track-your-work reviewer`, `arena runners`, `arena cross-judge pool`, `architect runners`, and `challenge reviewers` are the exception: two slugs on one line, comma-separated, the newest `claude-opus` without `-fast`, then the newest `grok` with `-fast` when that form is listed.

**(b) Apply the budget.** The working table starts from those suggestions. On a re-run, keep a current value that is `inherit-parent`, `auto`, a list, or a different family than the suggestion. Set the effort token of every other real slug to the budget label. If that slug is not in the list, use the same family's listed slug with the highest effort at or below the target, and the same fast preference. If none exists, mark the role as needing a choice. `inherit-parent` and `auto` do not change.

**(c) Show the roles and confirm.** Show every role with its model, marking any role that needs a choice. Also list each line step 1 dropped. Ask whether to accept as-is or change specific roles, offering the slugs from `agent models` plus `inherit-parent` and `auto`. Prefer AskQuestion over free text. A list value runs one subagent per entry, alias entries included, so the list length sets the count. `arena runners`, `architect runners`, and `challenge reviewers` are that kind of list. `track-your-work reviewer` is also a comma-separated list on one line, but the skill picks one entry whose family differs from the parent's. It does not run one subagent per entry. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real slug written must be a slug `agent models` printed. `inherit-parent` and `auto` always pass. If a chosen real slug is not in that list, stop and ask again.

### 5. Write the rule

Write `~/.cursor/rules/tjstack-models.mdc` with `alwaysApply: true`, a `# budget` line with the chosen label only, and one line per role. The values are the slugs from step 2, not the angle brackets below. Overwrite the whole file so re-runs stay idempotent. Create `~/.cursor/rules/` if it is missing. Shape:

```
---
description: tjstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# tjstack model configuration. One line per role. Delete a line to fall back to the proposal rules in setup-tjstack.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit Task `model`).
# Alias entries in `arena runners`, `architect runners`, and `challenge reviewers` still count toward that line's fan-out. `arena cross-judge pool` selects one entry whose family differs from the parent's when possible. `swarm workers` is the default for every worker unless a race or comparison assigns another model per arm.
# budget: <chosen label>
bug-fix: <slug from step 2>
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
