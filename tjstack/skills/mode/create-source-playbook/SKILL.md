---
name: create-source-playbook
description: >-
  Writes a personal source-playbook-skill for one MCP and one why category
  when no source-playbook-skill for that source exists yet. Reads the live
  tool schema and fills the five source-playbook sections. Use for
  /create-source-playbook, an MCP with no source-playbook-skill, or a call
  from setup-source.
---

# Create source playbook

Write `~/.cursor/skills/source-<mcp-slug>/SKILL.md`, a personal source-playbook-skill the why skill reads. One MCP, one category, one skill file. Re-running overwrites that same file.

The only writes are that skill file and, when this skill is invoked alone, `~/.cursor/rules/source-playbooks.mdc`.


## Steps

### 1. Take the inputs

Take the MCP namespace and one why category from the user or from the setup-source caller.

The category is one of these exact strings:

- `issue tracker`
- `long-form documents`
- `real-time chat`
- `infrastructure observability`
- `error tracking`
- `product analytics`

Each category answers a why-question of one kind:

- `issue tracker`: why the work was requested, and what decision the comments record
- `long-form documents`: the spec, decision, or note that states the reason
- `real-time chat`: the contemporaneous discussion of the tradeoff
- `infrastructure observability`: the runtime signal around the change
- `error tracking`: the exception or regression that forced the change
- `product analytics`: the usage or experiment result behind a threshold or behavior

Done when both values are present and the category is one of those six strings. If either value is missing, ask. If the category string is anything else, including `source control`, go to step 2.

### 2. Leave source control on the bundled skill

`source control` is the bundled `code-explore` skill. When the category is `source control`, stop. Tell the user that category stays on `code-explore`. Write no skill and leave every rule file untouched.

When the category is any other string outside the six, stop. List the six strings. Write nothing.

Done when the category is one of the six, or you have stopped.

### 3. Stop when a source-playbook-skill already exists

Build `mcp-slug` from the namespace: lowercase it, collapse each run of non-alphanumeric characters to a single hyphen, and strip a leading or trailing hyphen. The skill name is `source-<mcp-slug>`.

Namespace `plugin-linear-linear` becomes `source-plugin-linear-linear`. Namespace `User.Notion` becomes `source-user-notion`.

If `mcp-slug` is empty, or `source-<mcp-slug>` is longer than 64 characters, stop.

The owned path is `~/.cursor/skills/source-<mcp-slug>/SKILL.md`. That file is this playbook. A re-run overwrites it.

A source-playbook-skill is any skill for this source that does one of these two jobs:

- It tells the agent how to load a record from that source, such as a ticket. The steps may call an MCP tool or a script that ships inside the skill.
- It explains how to work that source, the way a playbook does. A skill that explains how to work with Linear is one.

Both are the category `source-playbook-skill`. A skill that only mentions the product in passing is not.

Look through skills already in the session, `~/.cursor/skills/*/SKILL.md`, and plugin skills. Read the description and enough of the body to see which job it does. A description that contains `source-playbook-skill` and this namespace is one. So is a skill that never uses that phrase but still does one of the two jobs for this namespace or its product.

`code-explore` is the source-control source-playbook-skill. It does not cover an MCP namespace.

If a skill other than the owned path is already a source-playbook-skill for this source, stop. Do not write a second one. Report that skill name.

Done when no other source-playbook-skill covers this source, or you have stopped and reported the name.

### 4. Read the live schema

Read the live tool schemas with GetDynamicTools for that namespace, or the MCP descriptors Cursor exposes for it.

If the namespace status is `needsAuth`, authenticate that namespace and read the schema again.

Done when you hold the live tool list: each tool's name, description, and input fields. If the schema is missing, or the list is empty, stop. Do not invent tool names. Every tool name in the playbook comes from that list.

### 5. Write the skill

Create `~/.cursor/skills/source-<mcp-slug>/` if it is missing, then overwrite `SKILL.md`.

Frontmatter:

```yaml
---
name: source-<mcp-slug>
description: source-playbook-skill for the <namespace> MCP in the <category> category. Read by the why skill. Do not invoke directly.
disable-model-invocation: true
---
```

Use the namespace and the category string as given. The description sentence stays otherwise exact. Quote the description when the namespace contains a colon.

The H1 is the namespace. The first heading says when this source is the one to use. The next five are the source-playbook headings, in this order, each filled from the schema you just read. Keep the file short: a few bullets per heading. Do not add further headings.

Ask for the when-sentence when the caller did not pass one. It names the product and the id form. "Mantis #123" is this source. "Redmine #456" is not, when this source is Mantis.

```markdown
# <namespace>

## When to use this source

## What this source contains

## How to search it

## What good evidence looks like

## Common pitfalls

## What to return
```

Jobs of those headings:

- **When to use this source.** The when-sentence. One or two lines. Say the other sources in this category that this one is not, when the caller named them.

- **What this source contains.** The records these tools can retrieve for this category. Name the record types the tool descriptions actually name. Close with this category's why-question from step 1, limited to those record types.
- **How to search it.** The schema tool to call for a wide search, then the schema tool to call for a single record. Use the argument names from the schema. When several tools search, pick the one whose description is the broad query. When several fetch one record, pick the one that takes an id. Name a further tool only when it retrieves a record type that pair cannot. If the schema has only one of the two, name the one that exists and say which job is uncovered.
- **What good evidence looks like.** A few shapes of a useful hit: a quoted decision, motivation, or tradeoff in a field the tools return. Titles, status, and counts are context.
- **Common pitfalls.** A pitfall only when a tool description states that limit: pagination, a truncated body, auth scope, a time window, preview versus full record, or duplicates.
- **What to return.** For each hit that bears on the question: identifier, title, quoted text, author, dates, and the link when a tool returns one. Say whether the hit states the reason or only sits beside it.

Done when the file exists, the frontmatter matches, the when heading and the five playbook headings are present in that order, and every tool name in the body is in the schema list from step 4.

### 6. Update the rule, unless the caller will

When the caller (setup-source) says it will write the rule, leave `~/.cursor/rules/source-playbooks.mdc` untouched. Return the skill name `source-<mcp-slug>`.

When this skill is invoked alone, add `source-<mcp-slug>` to that category's line in `~/.cursor/rules/source-playbooks.mdc`. Leave every other line as it is. An existing source-control line stays as written. Do not remove a skill already on the line.

If the file is missing, create `~/.cursor/rules/` if needed and write the file below. `alwaysApply` is `false`. The description is `Evidence sources for the why skill`. Set source control to `code-explore none` only in this new file. Set the requested category to the skill name. Set the other five categories to `gap`. This is the order:

```yaml
---
description: Evidence sources for the why skill
alwaysApply: false
---
source control: code-explore none
issue tracker: gap
long-form documents: gap
real-time chat: gap
infrastructure observability: gap
error tracking: gap
product analytics: gap
```

If the file exists and that category line is missing, insert `<category>: source-<mcp-slug>` without rewriting any other line. Place it after the predecessor from the order above when that predecessor is present; otherwise append it. If the line is `gap`, replace `gap` with the skill name. If the line already lists skill names, append `source-<mcp-slug>` when it is not already a token on that line.

`gap` means that category has no playbook. Each skill name is one source the why skill reads. A category may list more than one.

Done when the caller kept the rule, or the category line contains the skill name and no other skill name was removed. On a new file, source control is `code-explore none` and the untouched categories are `gap`.

### 7. Confirm

Tell the user the skill path and whether the rule line was updated. When the caller kept the rule, say the rule line was not updated and give the skill name. Re-running updates the same skill file.
