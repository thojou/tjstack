---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. Reads ~/.cursor/rules/source-playbooks.mdc and investigates each evidence category (source control, issue tracker, long-form docs, real-time chat, infrastructure observability, error tracking, product analytics warehouse) in parallel, then returns a cited read on decisions and tradeoffs. Use how for runtime behavior."
disable-model-invocation: true
---

# Why

Investigate the motivation and intent behind code.

Companion to the `how` skill. `how` answers what the code does and how it works. `why` answers what forces led to its shape.

Before every Task spawn below, read and follow the `spawn-subagent` skill. Each spawn names its role line.

## Operating Posture

Operate as a **careful, cautious, and precise investigator**. Be honest about what you know vs what you're inferring. Read `references/epistemics.md` for the full confidence framework and phrasing guide. The synthesizer must follow it.

## Step 1. Understand the Target and the Question

Parse what the user is asking. The **target** is usually a chunk of code, a pattern, a feature, or a named design decision. The **question** is usually a design rationale, a tradeoff, a motivating edge case, an external constraint, dead code, or a broad history sweep.

If the target is vague ("why do we do it this way?" with no clear referent), make your best guess from conversation context (open files, recent edits, cursor location, what was just discussed). State your interpretation briefly so the user can redirect if you're off, then proceed.

## Step 2. Establish the Code Anchor

Before spawning investigators, anchor the investigation in concrete code. You need:

- The relevant file path(s) and line range(s)
- The key symbols (function names, class names, constants)
- An initial commit list. The last few commits touching the target.
- PR/MR numbers from commit subjects (pattern `(#1234)` in the subject line)

Build this inline.

```bash
# Blame target lines for last-touch commits
git blame -L <start>,<end> <file>

# Full file history, with patches, through renames
git log --follow -p -- <file>

# Last N commits touching the file, PR numbers visible
git log --oneline -20 -- <file>

# Extract PR numbers from a commit message
git log -1 --format=%B <commit>
```

The source-control investigator fetches PR/MR bodies.

Capture this as seed context (file paths, symbols, commits, PR/MR numbers, linked ticket IDs). Pass it to the investigators.

## Step 3. Spawn Parallel Investigators (default posture)

**Default to the full parallel investigation.**

### Discovery

Read `~/.cursor/rules/source-playbooks.mdc`. If the file is missing, do not stop: use `source control: code-explore gh glab` and mark every other category `gap`. Say in the reply that `/setup-source` has not run. Do not discover MCPs or skills inline.

The rule has `alwaysApply: false`. One line per category. The value is `gap`, or one or more skill names separated by spaces. The source-control line is one skill, then forge tokens:

```
source control: code-explore gh glab
issue tracker: source-mantis source-redmine
long-form documents: <skill names or gap>
real-time chat: <skill names or gap>
infrastructure observability: <skill names or gap>
error tracking: <skill names or gap>
product analytics: <skill names or gap>
```

Forge tokens are a non-empty subset of `gh` and `glab`, or the single token `none`. Ignore YAML frontmatter and `#` comments.

Spawn one investigator per skill name, in one message, so they run concurrently. On `source control`, only the first token is a skill. On every other line, every token is a skill. A `gap` line is not spawned. It is a coverage gap in Sources Consulted. Two skills on one line are two investigators. Each follows its own playbook, including when that source applies. A question that says Mantis is not a search of the Redmine playbook. A question that names no source still spawns every skill on the line.

Subagent config (each):
- `subagent_type`: `generalPurpose`
- role line: `why investigator`
- `readonly`: `false` (agent mode). **Do not use readonly/Ask mode.** It strips MCP access, which disables MCP-backed investigators entirely. Investigators still shouldn't write anything.

Each investigator gets:
1. The base prompt from `references/investigator-prompt.md`
2. The named skill's `SKILL.md`. Read a bundled skill by name. If it is not bundled, read `~/.cursor/skills/<name>/SKILL.md`.
3. The cross-cutting `references/incident-postmortem.md` **if the target code looks defensive** (null checks, retry logic, timeout handling, rate limiting, feature flags, egress guards, OOM handlers)
4. The code anchor from Step 2 (file paths, symbols, commit hashes, PR/MR numbers, ticket IDs)
5. The user's original question

For `source control`, also pass the forge tokens. The code-explore skill decides which of those tokens run for this repo. Do not restate that matching algorithm here.

### What each category surfaces

Each entry names the category and the kind of "why" it uniquely surfaces. Use it to know what to expect back, how to name a gap when a category returns empty, and (only in the rare provably-irrelevant case) to justify a skip.

1. **Source control investigator**. Git history, `gh` or `glab` for PRs and MRs, code comments, tests. Spawn when the rule names a skill. Best at surfacing *implementation-time rationale captured during review*.

2. **Issue / ticket tracker investigator** (e.g. Linear, Jira, GitHub Issues, Plane, Shortcut MCP). Best at surfacing *the product or business forcing function*. Strongest when the why is external to engineering.

3. **Long-form documents investigator** (e.g. Notion, Confluence, Google Docs, Coda MCP). Best at surfacing *long-form design rationale*. Where the why is written out before it becomes code.

4. **Real-time team chat investigator** (e.g. Slack, Discord, Microsoft Teams, Mattermost MCP). Best at surfacing *real-time deliberation that never reached a doc*. Especially important when the source control, ticket, and doc paper trail is thin.

5. **Infrastructure observability investigator** (e.g. Datadog, New Relic, Honeycomb, Grafana, Splunk MCP). Infra/runtime view. Best at surfacing *infrastructure and runtime reality that motivated the code*. Strongest when the target reacts to an infra signal (timeouts, retries, rate limits, circuit breakers).

6. **Error / exception tracking investigator** (e.g. Sentry, Rollbar, Bugsnag, Airbrake MCP). Best at surfacing *the specific exceptions and error trajectories that motivated defensive or corrective code*. Strongest for catch blocks, null guards, type checks, retries, and other defenses.

7. **Product analytics warehouse investigator** (e.g. Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift MCP). Product/data view. Best at surfacing *product and data reality that shaped the code*. Strongest for flag-gated code, experiment-driven ships, data migrations, and "where did this number come from" questions.

### When to skip an investigator

Only skip with an **explicit, written justification** that goes in the final "Sources Consulted" section. Two valid reasons:

- **The rule marks this category `gap`**. Flag this as a gap, not a choice. Example: "Real-time team chat skipped. The rule marks this category `gap`, so the conversational record was not searchable."
- **The source is provably irrelevant**, not just "probably irrelevant." A high bar. Example: "Error / exception tracking skipped. Target is a build-time script with no runtime code path."

If your scope assessment suggests a single-commit trivial target where the PR description already contains the complete answer, you may answer inline **only after** confirming all seven available category searches would be redundant. Say so explicitly. This should be rare.

## Step 4. Synthesize

Spawn one synthesizer subagent:

- `subagent_type`: `generalPurpose`
- role line: `why synthesizer`
- `readonly`: `false` (agent mode). The synthesizer's quality check spot-verifies citations, which can require MCP access. Readonly/Ask mode strips MCPs and defeats that.

The synthesizer gets:
1. The investigator findings, including any null results and any categories skipped with justification
2. The code anchor from Step 2 (file paths, symbols, commit hashes, PR numbers, ticket IDs)
3. The user's original question
4. The epistemics framework from `references/epistemics.md`
5. The synthesizer prompt template from `references/synthesizer-prompt.md`

## Step 5. Present

Take the synthesizer's output and present it to the user. You may lightly edit for clarity or add context from the conversation, but **do not rewrite the confidence language**.

## Output Format

The output structure is the one in `references/synthesizer-prompt.md`: The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted, Confidence Summary. Adapt as needed, but keep the confidence separation intact, and keep Sources Consulted as one line per category. When a category has more than one source, that line names each source and what it returned or why it was skipped.

After the Sources Consulted block, if the user's `why` question is a precursor to actually changing this code, convert the lineage findings into a Preserve / Change / Avoid / Risk constraint set suitable for planning the change.

## Common Failure Modes to Avoid

- **Recency bias**. Assuming the most recent commit is authoritative. The current shape is often the accretion of many earlier decisions. Trace back.

## Reference Files

- `references/epistemics.md`. Confidence tiers and phrasing guide. The synthesizer must follow it.
- `references/investigator-prompt.md`. Base prompt template for investigator subagents.
- `references/synthesizer-prompt.md`. Prompt template for the synthesizer subagent, including the output format.
- `references/incident-postmortem.md`. Cross-cutting incident and postmortem queries. Append it when the target code looks defensive.
- The skill named by the rule. Its `SKILL.md` is the playbook for that investigator.
