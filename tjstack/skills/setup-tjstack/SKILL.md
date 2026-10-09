---
name: setup-tjstack
description: >-
  Configure which models tjstack uses per role and at what reasoning budget.
  Asks for a budget, loads the model list with `agent models`, proposes a
  slug per role from that list, and writes an always-applied rule. Use for
  /setup-tjstack, "configure tjstack models", "tjstack budget", or changing
  tjstack's model choices.
---

# Setup tjstack

Write `~/.cursor/rules/tjstack-models.mdc`, an always-applied rule that sets tjstack's model per role. Skills that spawn a subagent read it through `/spawn-subagent`.


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

**Propose.** From that list, one suggestion per role: the newest slug of the role's class. The model id is the slug with a trailing `-fast` removed and with the effort token removed. The effort token is the last token, or the token before a trailing `fast`, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. Newest is the highest version number in the id. On a tie, prefer the id that does not start with `cursor-`. Ignore a `-thinking` slug when the same id exists without `-thinking`. Use `-fast` only when the role prefers it and that form is in the list. Otherwise use the form without `-fast`. `swarm workers` is class `grok` and prefers `-fast`. `track-your-work reviewer`, `arena runners`, and `arena cross-judge pool` are the exception: two slugs on one line, comma-separated, the newest `claude-opus` without `-fast`, then the newest `grok` with `-fast` when that form is listed.

**(b) Apply the budget.** The working table starts from those suggestions. On a re-run, keep a current value that is `inherit-parent`, `auto`, a list, or a different family than the suggestion. Set the effort token of every other real slug to the budget label. If that slug is not in the list, use the same family's listed slug with the highest effort at or below the target, and the same fast preference. If none exists, mark the role as needing a choice. `inherit-parent` and `auto` do not change.

**(c) Show the roles and confirm.** Show every role with its model, marking any role that needs a choice. Also list each line step 1 dropped. Ask whether to accept as-is or change specific roles, offering the slugs from `agent models` plus `inherit-parent` and `auto`. Prefer AskQuestion over free text. A list value runs one subagent per entry, alias entries included, so the list length sets the count. `arena runners` is that kind of list. `track-your-work reviewer` is also a comma-separated list on one line, but the skill picks one entry whose family differs from the parent's. It does not run one subagent per entry. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

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
# Alias entries in `arena runners` still count toward its fan-out. `arena cross-judge pool` selects one entry whose family differs from the parent's when possible. `swarm workers` is the default for every worker unless a race or comparison assigns another model per arm.
# budget: <chosen label>
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
swarm workers: <slug from step 2>
```

### 6. Confirm

Tell the user the rule was written, which slug each role got, and that it applies to new sessions. Re-running this skill updates it.
