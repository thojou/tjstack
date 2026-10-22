---
name: create-skill
description: "Create or revise an agent skill: frontmatter, what stays in SKILL.md, and what belongs in a side file. Use for /create-skill, \"create a skill\", \"write a skill\", or when authoring or editing a SKILL.md."
disable-model-invocation: true
---

# Create a skill

Write a skill an agent can follow cold. The agent is already capable. Add only the steps, gates, and facts it will not invent correctly on its own.

If the user gives exact wording, copy it verbatim into `SKILL.md`. Do not paraphrase it.

## Process

1. **Gather.** Ask only what you cannot infer: the task and the cases it must handle, where the skill lives, the slash command and phrases that should load it, and whether it needs scripts, assets, or scenario notes.
2. **Draft** `SKILL.md` and any side files with the **technical-writing** skill, then run the **noslop** skill over the `description`, the body, and every side file. Add a side file only under the layering rule below.
3. **Review with the user.** Cover the cases, cut any line that does not change a decision, then run the checklist.

## Placement

| Target | Path |
| --- | --- |
| This plugin | `tjstack/skills/<name>/SKILL.md` |
| A project | `.cursor/skills/<name>/SKILL.md` |
| Personal, all projects | `~/.cursor/skills/<name>/SKILL.md` |

Outside Cursor, the `tjstack-harness` rule translates `.cursor` and `~/.cursor` paths. Never write into `~/.cursor/skills-cursor/`.

`name` is the leaf directory: lowercase letters, digits, single hyphens, at most 64 characters.

## SKILL.md

```markdown
---
name: skill-name
description: "What it does. Use when [triggers]."
disable-model-invocation: true
---
```

Set `disable-model-invocation: true` unless the skill must load without being named. `description` is one scalar, at most 1024 characters, third person. First sentence: what it does. Second sentence: "Use when" plus the slash command and the trigger phrases. Quote it, or use `description: >-` when it wraps.

The description is the only text the agent sees when deciding whether to load the skill.

Good: `Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.`

Bad: `Helps with documents.`

## What stays in SKILL.md

Anything the agent must read on every invocation stays in `SKILL.md`: the workflow, the gates, and any template it fills on every run. That content soft-raises the 150-line cap. Do not move it out to get back under the cap. A file the agent can skip is a file it will skip.

Extract a reference, asset, or template only when a run can finish without it. The usual case is extra material for one scenario, or a template some runs never fill. Link it from `SKILL.md` with the condition that makes it relevant, such as `when validation fails`. Do not tell the agent to read every side file at the start.

Each layer has one job. Do not copy the same prose into two of them.

- `SKILL.md` holds frontmatter, gates, the workflow, and the templates every run fills.
- `references/*.md` holds scenario depth: process detail, schemas, and docs a run may not need.
- `assets/*` holds a template or schema the skill writes from, never process rules.
- `scripts/` holds a deterministic helper (validate, format, id allocation). Tell the agent to run it, not to read it as instructions.

One process view: numbered steps or a diagram, not both. Links from `SKILL.md` go one level deep. No dates that will rot. One term per concept.

When the skill must match the Agent Skills spec, read [the spec](https://agentskills.io/llms.txt) and the [best practices](https://agentskills.io/skill-creation/best-practices.md).

## Scripts

Add a script when the operation is deterministic, the same code would be regenerated every run, or a failure needs a fixed message.

## Checklist

- [ ] Leaf directory matches `name`
- [ ] Description is third person, has "Use when", and names `/name`
- [ ] Steps and templates used on every run are in `SKILL.md`
- [ ] Over 150 lines only because that must-read content is inline
- [ ] Each side file is optional for some runs, and the link says when to read it
- [ ] No duplicated prose across files
- [ ] One process view, references one level deep
- [ ] Written with **technical-writing** and checked with **noslop**, `description` and body alike
- [ ] Consistent terms, concrete examples
