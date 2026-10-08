---
name: setup-source
description: >-
  Configures why evidence sources. Discovers MCPs and skills, proposes every
  source in a category, and writes ~/.cursor/rules/source-playbooks.mdc. Use
  for /setup-source or configuring why evidence sources.
---

# Setup source

Write `~/.cursor/rules/source-playbooks.mdc`, the rule the why skill reads. A category lists every source that belongs there. `alwaysApply: false`.

## Steps

### 1. Discover

List the available MCPs and skills.

MCPs: use the available-tools map when present. Otherwise inspect the `mcps/` directory Cursor exposes for enabled MCP servers.

Skills: skills already in the session, `~/.cursor/skills/*/SKILL.md`, and plugin skills.

Map each to one evidence category. Classify using the name, server instructions, tool names, and skill description.

1. Source control history → `source control`
2. Issue / ticket tracker → `issue tracker`
3. Long-form documents → `long-form documents`
4. Real-time team chat → `real-time chat`
5. Infrastructure observability → `infrastructure observability`
6. Error / exception tracking → `error tracking`
7. Product analytics warehouse → `product analytics`

A category keeps every source that classifies there. An MCP that fits more than one category goes to the confirm step, not a silent category pick. Source control is not discovered from an MCP.

### 2. Load current state

If `~/.cursor/rules/source-playbooks.mdc` exists, read it. Those lines are the current choices. Otherwise there is no current choice. Unknown category lines are dropped.

### 3. Propose

One line per category, in the order above. The value is `gap`, or one or more skill names separated by spaces.

**Source control.** The skill is `code-explore` unless the user swaps it. Forge tokens come from `command -v gh` and `command -v glab`, not from `git remote` and not from an MCP. Do not run the `create-source-playbook` skill for the CLIs. Both binaries present: `gh glab`. Only one: that token. Neither: `none`.

**Other categories.** Keep every match. A source-playbook-skill is used as it is and is not created again. That is a skill that loads records from the source, including through a script inside the skill, or a playbook that explains the source. `create-source-playbook` step 3 is that test, and it is per source, not per category. A second tracker in the same category still gets its own skill. If an MCP has no source-playbook-skill, follow `create-source-playbook` for that MCP and category, and tell it not to edit the rule. This skill writes the rule once at the end. If nothing matches: `gap`.

### 4. Confirm

Show every category with its proposed line. Mark any category that still needs a choice. Also list each unknown line step 2 dropped. Prefer AskQuestion over free text. Offer accept as-is, or change specific categories. The user may remove a source. They do not have to leave only one. The user may drop `gh` or `glab` from the source-control line. Dropping both leaves `none`. When an MCP on the list has no source-playbook-skill yet, follow the `create-source-playbook` skill for that MCP and category, and tell it not to edit the rule.

When a category lists more than one source, each playbook says when that source is the one to use. Ask if the skill does not already say it. Add a `When to use this source` heading at the top of that skill's body, plus the sentence the user gave, and do not rewrite the rest. "Mantis #123" is the Mantis source. "Redmine #456" is the Redmine source. A question that names neither source still uses every source in the category.

### 5. Validate and write

Every skill token must resolve (bundled skill, or `~/.cursor/skills/<name>/SKILL.md`). A line is `gap` or skill names, not both. `gap` is not a skill name. The tokens after `code-explore` are `none` or a non-empty subset of `gh` and `glab`, with `gh` before `glab` when both remain. A swapped source-control skill keeps those same tokens after its name. If validation fails, stop and ask again.

Write `~/.cursor/rules/source-playbooks.mdc` with `alwaysApply: false` and one line per category. A value other than `gap` is the skill names, separated by spaces. The values are the confirmed choices, not the angle brackets below. Overwrite the whole file so re-runs stay idempotent. Create `~/.cursor/rules/` if it is missing. Shape:

```
---
description: Evidence sources for the why skill
alwaysApply: false
---
source control: code-explore <forge tokens>
issue tracker: <skill names or gap>
long-form documents: <skill names or gap>
real-time chat: <skill names or gap>
infrastructure observability: <skill names or gap>
error tracking: <skill names or gap>
product analytics: <skill names or gap>
```

Both forge binaries present, two issue trackers, and every other category empty, is:

```
source control: code-explore gh glab
issue tracker: source-mantis source-redmine
long-form documents: gap
real-time chat: gap
infrastructure observability: gap
error tracking: gap
product analytics: gap
```

### 6. Tell the user

Tell the user the rule path, the skills in each category, the forge tokens, and that it applies to new sessions. Re-running this skill updates it.
