---
name: customize-my-mode
description: "Drafts or revises one personal -mode skill from the user's working conventions, using recent transcripts when they help. Use for /customize-my-mode, \"customize my mode\", \"create/update/refresh my -mode skill\", \"turn/capture my preferences or working style into a skill\", or wanting agents to follow how the user works."
disable-model-invocation: true
---

# Customize my mode

Turn the user's working conventions into one `-mode` skill agents will follow (`jay-mode`, `priya-mode`). This skill only sequences three pieces. An inline mining pass (step 1), the **create-skill** skill (authoring), and the **noslop** skill (prose).

Outside Cursor, the `tjstack-harness` rule translates tools, paths, and the transcript format. If that rule is missing, run `/setup-tjstack` first.

## Flow

### 0. Check for an existing skill

Look recursively for `.cursor/skills/**/*-mode/SKILL.md` and `~/.cursor/skills/*-mode/SKILL.md` matching the user's handle. A mode skill can live in a personal category directory (`.cursor/skills/<handle>/`), not only at the top level. If one exists, confirm intent with `AskQuestion` unless they already said "update my skill" or similar.

- Update the existing skill (default for repeat runs)
- Start fresh (rare, ask why before doing it)

Update mode changes the rest of the flow.

- Step 1 mines only history since the skill was last edited (`git log -1 --format=%cI <path>`). If the file is not in a git repo, use its mtime.
- Step 2 asks what changed or what is missing, not what to capture from zero.
- Step 4 edits the existing file in place. Preserve sections the user has not contradicted. Revise sections that have new evidence. Add a section only for a genuinely new rule.

### 1. Mine their history

Locate the active workspace's transcripts before fanning out. The system prompt names the workspace's `agent-transcripts/` directory. Use only that path. Do not glob across `~/.cursor/projects/*/`. That crosses workspace boundaries and reads private chats from unrelated projects.

Survey recent conversations in that scope. Default the last 2 to 4 weeks, split into 3 slices so each has enough material. Spawn the miners in parallel. Read `spawn-subagent` first. `subagent_type: generalPurpose`. Role line `judgment and prose`. The work is reading local transcripts, so the environment rule keeps them on this machine. Each miner orders files by modification time (`ls -t`), never by UUID name, skips the current chat, and returns a short list of patterns with evidence pointers (chat UUID and the turn). Raw transcripts stay in the miners.

Default signals:

- Response preferences (length, tone, format, "dumb it down" corrections)
- Delegation habits (subagents, models, specialized workflows, parallelism)
- Verification posture (what "done" means, unit tests vs live repro, reviewers)
- Code and prose discipline (style, principles cited, lint and format tools)
- Process conventions (worktrees, commits, PRs, review and merge tooling)
- Meta preferences (fixing skills mid-task, proposing new ones)

Cross-check across slices before elevating a signal. A pattern in 2 or more slices is high-confidence. A lone signal is weak and usually gets dropped.

### 2. Ask the user directly

Mining misses intent that has not come up yet. Use `AskQuestion` (structured multi-choice) rather than asking the user to type from scratch.

One or two questions, 4 to 6 options each, `allow_multiple: true` on category questions. Start broad ("Which areas matter most?"), then follow up on the selected areas with specific options. After those rounds, one free-form question catches anything the options missed.

Do not dump 20 questions.

### 3. Cluster findings

Group the combined signals into sections. Use only the ones that apply.

- **Response style.** Length, tone, format.
- **Autonomy.** How much to do without asking, and MCP tool use.
- **Understand first.** Which skills to reach for when scoping or investigating a change.
- **Subagents.** Default, parallelism, model-to-task, specialized workflows.
- **Prose and code discipline.** Principles, lint tools, style guides.
- **Review and verify.** Repro posture, verification skills, live-testing tools.
- **Process.** Git worktrees, commits, PRs, review and merge tooling.
- **Skills.** Skill-authoring habits, fix-the-skill-first, proposing new skills.

The **tj-mode** skill shows the shape. Read it for granularity. Do not copy its content. The user's rules are their own.

### 4. Draft the skill

Use the **create-skill** skill to author the file.

- **Path.** Preserve an existing mode skill's directory. For a new mode, use `.cursor/skills/<handle>/<handle>-mode/SKILL.md` when the repo already has a personal category for that handle. Otherwise default to `.cursor/skills/<handle>-mode/SKILL.md` in the project, or `~/.cursor/skills/<handle>-mode/` when the user wants a personal skill.
- **Handle.** The user's first name or chosen identifier.
- **Description.** Trigger on their name, `/<handle>-mode`, and "work in their style". Leave generic keywords such as "write code" or "review PR" out of the description.
- **YAML.** Follow `create-skill`'s YAML rules. Keep `description` as one scalar. Quote it, or use `description: >-` with indented continuation lines when punctuation or wrapping needs it.
- **Invocation.** `disable-model-invocation: true` by default. Set it false only when the user explicitly wants their mode on every turn.

### 5. Iterate on prose

Apply **noslop** and `create-skill`'s writing guidelines to every line.

Show the draft and take feedback. Expect several iterations. Cut hard. A mode skill is not a manual.

### 6. Land it

When the mode skill is in a git repo, land it through `../tj-mode/playbooks/opening-a-pr.md`. Do not push to the default branch. A personal skill that is not in a git repo is the file. There is no PR.

## Guardrails

- **One conversation is not a rule.** A preference stated once and contradicted later is noise. Require several instances before writing it down.
- **Stay operational.** Restating another skill, a metaphor, or poetic prose for an agent reader costs tokens and changes nothing.
- **Reference, do not paste.** Skills the user relies on appear as paths. Same for principle docs they keep elsewhere.
- **A section needs a real rule.** "Communicate clearly" is not a section. "Short paragraphs. Tables when comparing options. Bullets only when the items are parallel." is.
- **Say "the user" or "the human".** Imperatives do not use the author's first name.
- **Skip an empty area.** No process rules worth writing means no Process section.

## Evaluation

A `-mode` skill is subjective. Ask whether it reads like them and whether it missed anything. Then ship.

Run a description-optimization loop only when the trigger misses in practice.

## When not to use

- A task-specific skill. The **create-skill** skill alone. No mining.
- One narrow workflow, such as how they write commit messages. That is a regular skill, not a mode skill.
