---
name: retro
description: "Mines the active session transcript with three review lenses and writes a retro report of durable learnings and proposed skill changes. Use for /retro, \"retro\", or a retrospective of this session. Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings. Does not edit skills."
disable-model-invocation: true
---

# Retro

Mine this session for durable learnings, then write a retro report. The report is the whole deliverable. Do not edit skills, rules, or code, and do not file backlog items. Applying a proposal is a later instruction.

Before every Task spawn below, read and follow the `spawn-subagent` skill. Each spawn names the role line, the class, and the effort to use when the rule line is missing.

## 1. Locate the active transcript

The parent finds its own transcript file before fanning out. The system prompt names the active workspace's `agent-transcripts/` directory. Use that path. Do not glob across `~/.cursor/projects/*/`. That crosses workspace boundaries and reads private chats from unrelated projects.

```bash
ls -t <agent-transcripts>/*.jsonl <agent-transcripts>/*/*.jsonl <agent-transcripts>/*/subagents/*.jsonl 2>/dev/null | head -10
```

Three layouts: legacy flat (`<id>.jsonl`), nested (`<id>/<id>.jsonl`), and subagent (`<id>/subagents/<id>.jsonl`).

For each candidate, read the first JSONL line and check that `message.content[0].text` contains this conversation's opening user prompt. Take the matching path. If no path resolves, write a tight digest of the session and pass that instead.

## 2. Spawn three reviewers

One message, three `Task` calls, `subagent_type: generalPurpose`, agent mode (`readonly: false`). Reviewers need MCP access for context the transcript cites. Readonly strips MCPs. The prompts forbid writes.

| Lens | Role line | Class when the line is missing | Prompt |
| --- | --- | --- | --- |
| Judgment | `retro judgment` | `claude-opus`, prefer no `-fast`, effort `xhigh` | `references/judgment-reviewer.md` |
| Tooling | `retro tooling` | `grok`, prefer `-fast`, effort `xhigh` | `references/tooling-reviewer.md` |
| Divergent | `retro judgment` | `claude-opus`, prefer no `-fast`, effort `xhigh` | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or the digest where marked. Reviewers return findings in the `Task` response body.

## 3. Synthesize

One `Task` call, `subagent_type: generalPurpose`, agent mode (`readonly: false`), role line `retro judgment`, class `claude-opus`, prefer no `-fast`, effort `xhigh` when the line is missing. The quality check spot-verifies citations, which can require MCP access.

Use `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. The synthesizer returns Accepted, Rejected, and Backlog. It does not edit anything.

## 4. Structural check

For any Accepted item a lint rule, script, metadata flag, or runtime check would enforce more reliably, move it to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Write the report

Write the report through the **noslop** skill. This is the reply. Do not show the raw reviewer or synthesizer dumps. One row per Accepted item and per Backlog item. `skill gap` is a body edit to a skill this session used. `missed trigger` is `tune description`. `new skill` is a skill that has no existing home. `structural` is a Backlog item: name the mechanism, not a prose edit. Write `none` for an empty Findings, Proposals, or Dropped section.

```
# Retro

## Outcome

| Field | Value |
| --- | --- |
| Goal | one sentence from the opening request |
| Status | report only |

## Findings

| Type | Evidence | Learning | Proposed action |
| --- | --- | --- | --- |
| skill gap, missed trigger, new skill, or structural | turn or short quote | the principle | the change, and where it would go |

## Proposals

- Skill: path, then the proposal
- Description: skill, then why it should have triggered
- New skill: name, then why no existing skill fits
- Structural: mechanism, then the pattern

## Dropped

One line per Rejected finding: principle, then the reason.

## Decision

Pending review. Nothing in this report was applied. Applying a row is a separate instruction.
```
