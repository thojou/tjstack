# Skill reference

Every tjstack skill, grouped by category, with when to use it, what it writes, and one prompt. For the story of how they fit together, read the [guide](../guide/README.md). In Claude Code, prefix each command with `tjstack:`, as in `/tjstack:how`.

**How to read the tables.** "Writes" names the files a skill creates or changes outside the code you asked it to change. "Read-only" means it changes nothing. "Inside tj-mode" means `/tj-mode` runs the skill on its own when a playbook step needs it, so you type it only for more or less of it than the default.

## mode

How the agent behaves, and how to adapt that.

| Skill | Use it when | Writes | Inside tj-mode |
| --- | --- | --- | --- |
| [`/tj-mode`](../../skills/mode/tj-mode/SKILL.md) | Work where a mistake would cost more than the tokens. Routes to one of thirteen playbooks. | Whatever the playbook ships | It is tj-mode |
| [`/customize-my-mode`](../../skills/mode/customize-my-mode/SKILL.md) | You'd like agents to follow your habits. Mines your chats and drafts a `<name>-mode` skill. | `.cursor/skills/<name>-mode/SKILL.md`, or the personal skills directory | No |

```text
/tj-mode the csv export drops its last row. repro first, then fix. show me row counts before and after.
/customize-my-mode
```

## understand

Understand code, history, and answers. Everything here is read-only except `/teach`.

| Skill | Use it when | Writes | Inside tj-mode |
| --- | --- | --- | --- |
| [`/how`](../../skills/understand/how/SKILL.md) | You're about to change code you haven't traced, or don't know where new code belongs. | Read-only | Yes |
| [`/why`](../../skills/understand/why/SKILL.md) | You want to know why code is shaped this way, from commits, tickets, docs, chat, and telemetry. Needs `/setup-source`. | Read-only | Yes |
| [`/explain`](../../skills/understand/explain/SKILL.md) | You need to really understand a change. Combines `/how` and `/why` into one walkthrough with diagrams that grow step by step. | Read-only | No |
| [`/teach`](../../skills/understand/teach/SKILL.md) | You want to learn a topic over several sessions. | `docs/learn/<topic>/`: mission, resources, HTML lessons, learning records | No |
| [`/rly`](../../skills/understand/rly/SKILL.md) | The last reply was too dense, inflated, agreeable, or full of invented words. | Read-only | No |
| [`code-explore`](../../skills/understand/code-explore/SKILL.md) | Never directly. The source-control playbook `/why` reads. | Read-only | Via `/why` |

```text
/how do we dedupe notifications? is there an n+1 when we look up subscribers?
/why was the retry limit set to five? does the reason still hold?
/explain how this PR changes retries. convince me it fixes the cause.
/teach i want to read flame graphs well enough to review perf PRs.
/rly
```

## design

Before code: clarify, record, decide.

| Skill | Use it when | Writes | Inside tj-mode |
| --- | --- | --- | --- |
| [`/interview`](../../skills/design/interview/SKILL.md) | An idea is fuzzy, or one word means two things to your team. One question at a time. | `docs/CONTEXT.md`, and ADRs you accept | When an idea is still taking shape |
| [`/create-adr`](../../skills/design/create-adr/SKILL.md) | A decision is hard to reverse, surprising without context, and a real trade-off. | `docs/adr/NNNN-<slug>.md` | When a decision passes the bar |
| [`/create-prd`](../../skills/design/create-prd/SKILL.md) | Settled requirements should outlive the chat. Synthesizes. Doesn't interview. | `docs/prd/NNNN-<feature>.md` | When requirements settle |
| [`/architect`](../../skills/design/architect/SKILL.md) | New code will be called from several places. Append "with checkpoint" to see the design before any code. | The design sketch, then the code | Yes, for boundary-crossing code |
| [`/prototype`](../../skills/design/prototype/SKILL.md) | A which-approach question that running something can settle. | `/tmp/prototype-<slug>/`, or an uncommitted route in the app | Yes, via the Prototype playbook |

```text
/interview we want customers to pause a subscription instead of cancelling it.
/create-adr record that paused subscriptions keep their billing anchor date.
/create-prd turn the pause feature into requirements.
/architect design the import pipeline. i care most about how callers use it.
/prototype three layouts for the settings page behind a switcher.
```

## orchestrate

Plan work and spread it across agents.

| Skill | Use it when | Writes | Inside tj-mode |
| --- | --- | --- | --- |
| [`/arena`](../../skills/orchestrate/arena/SKILL.md) | You want N attempts at the same brief, judged, with the best parts merged into one. | Candidates under `/tmp/arena-<slug>/` or worktrees | Via `/architect` and Feature |
| [`/swarm`](../../skills/orchestrate/swarm/SKILL.md) | You want parallel coverage over slices, or a race, and one `PASS` / `ISSUES` / `BLOCKED` report. | Per-worker outputs | Yes |
| [`/figure-it-out`](../../skills/orchestrate/figure-it-out/SKILL.md) | No playbook fits, or the work is large and you'll review it later. Designs a playbook first. | A decision trail via `/track-your-work` | Yes, for large or unattended work |
| [`/peer-subagent`](../../skills/orchestrate/peer-subagent/SKILL.md) | A brief should run on the Codex CLI, Claude Code, or the Cursor CLI. | A run directory with the prompt, reply, and log | No |
| [`spawn-subagent`](../../skills/orchestrate/spawn-subagent/SKILL.md) | Rarely directly. Sets the model, environment, and worktree for every subagent from your rules. | Worktrees for writing subagents | Yes, before every spawn |

```text
/arena this, 5 candidates. the cache key format is expensive to change later.
/swarm check every package under packages/ against its check.sh. one report.
/figure-it-out migrate every caller from the sync store to the async one. i'll review when i'm back.
/peer-subagent send this review brief to codex in read mode.
```

## session

The running work: build, commit, track, and review the session.

| Skill | Use it when | Writes | Inside tj-mode |
| --- | --- | --- | --- |
| [`/tdd`](../../skills/session/tdd/SKILL.md) | A feature or fix has a cheap local test path. PHP and PHPUnit first, Pest supported, other runners by analogy. | Tests and code | Yes, in Bug fix |
| [`/git-commit`](../../skills/session/git-commit/SKILL.md) | You want small Conventional Commits staged by logical change. | Commits | Yes, for every commit |
| [`/track-your-work`](../../skills/session/track-your-work/SKILL.md) | A long, unattended, or multi-phase run needs a decision trail you can audit. | `decisions.tsv` or `.audit/<task>.tsv` | Yes, for long runs |
| [`/babysit`](../../skills/session/babysit/SKILL.md) | An open PR or stack should reach merge-ready. Never merges. | Fix commits and thread replies on the PR | Yes, via the Babysit playbook |
| [`/catch-up`](../../skills/session/catch-up/SKILL.md) | You're starting or resuming work and want your recent context on a topic. | Read-only | No |
| [`/retro`](../../skills/session/retro/SKILL.md) | A session taught you something and you want the lessons as proposals. Report only. | Read-only | No |

```text
/tdd add a regression test for the vat rounding bug, then fix it
/git-commit split this into logical commits
/track-your-work keep a decision trail i can review when i'm back.
/babysit PR 418. get it green, the merge is mine.
/catch-up my work on the export pipeline
/retro that took too long. what should change?
```

## review

Check and clean up finished work.

| Skill | Use it when | Writes | Inside tj-mode |
| --- | --- | --- | --- |
| [`/challenge`](../../skills/review/challenge/SKILL.md) | You want several models to try to break a diff. Sorts findings into Act on, Consider, Noted, Dismissed. | Read-only | Yes, for contested designs |
| [`/blast-radius`](../../skills/review/blast-radius/SKILL.md) | A small diff you don't trust. Finds breakage outside the diff and proves the one safety fact by running code. | A proof script, when it runs one | No |
| [`/clean-comments`](../../skills/review/clean-comments/SKILL.md) | Before review. A reviewer that didn't write the comments deletes those the code can carry. | Comment deletions and small fixes | Yes, on every PR |
| [`/create-verification-skill`](../../skills/review/create-verification-skill/SKILL.md) | Agents can't launch and operate your web app or CLI on their own. | `.cursor/skills/verify-<app>/` with a feature map | No |
| [`/audit`](../../skills/review/audit/SKILL.md) | You want a ranked review of a whole repository or folder: bugs, security, scale, missing tests, speed, and code to cut. | Read-only | When you ask for an audit |

```text
/challenge the whole branch, skeptically. no nitpicks.
/blast-radius of dropping cache entries on logout
/clean-comments
/create-verification-skill
/audit the whole repo. what can i delete?
```

## writing

Text and documents for people.

| Skill | Use it when | Writes | Inside tj-mode |
| --- | --- | --- | --- |
| [`/technical-writing`](../../skills/writing/technical-writing/SKILL.md) | Writing or reviewing docs, READMEs, RFCs, ADRs, PR descriptions, or commit messages, in English or German. | The doc you asked for | Yes, for docs and PRs |
| [`/noslop`](../../skills/writing/noslop/SKILL.md) | Text reads like model output. | The text you pointed at | Yes, on every reply |
| [`/md-to-pdf`](../../skills/writing/md-to-pdf/SKILL.md) | A Markdown file must become a print-ready PDF, optionally themed. | `<file>.pdf` | No |

```text
/technical-writing review the readme changes
/noslop the release notes
/md-to-pdf docs/prd/0003-subscription-pause.md --theme ~/brand/print.css
```

## setup

Set up and extend tjstack.

| Skill | Use it when | Writes | Inside tj-mode |
| --- | --- | --- | --- |
| [`/setup-tjstack`](../../skills/setup/setup-tjstack/SKILL.md) | First run, or to change models, budget, PR remote, or subagent environment. | Three rules, plus the harness rule outside Cursor | No |
| [`/setup-source`](../../skills/setup/setup-source/SKILL.md) | `/why` needs to know which tool covers each evidence category. | The source-playbooks rule | No |
| [`/create-source-playbook`](../../skills/setup/create-source-playbook/SKILL.md) | An MCP server has no playbook that tells `/why` how to search it. `/setup-source` calls it for you. | `~/.cursor/skills/source-<mcp>/SKILL.md` | No |
| [`/create-skill`](../../skills/setup/create-skill/SKILL.md) | Writing or revising any `SKILL.md`. | The skill directory | Yes, for agent-facing prose |
| [`/create-principle`](../../skills/setup/create-principle/SKILL.md) | A rule should load only when a playbook or a person names it. | `skills/principles/principle-<name>/SKILL.md` | No |
| [`/tj-help`](../../skills/setup/tj-help/SKILL.md) | A question about tjstack itself. Answers from these docs with a prompt to send, and runs nothing. | Read-only | No |

```text
/setup-tjstack
/setup-source
/create-source-playbook for the linear mcp, category issue tracker
/create-skill a skill for verifying database migrations in this repo
/create-principle a rule for when to add a database index
/tj-help which skill should i use to review this branch?
```

## principles

Twenty-eight one-rule skills. `/tj-mode` keeps an index of all of them, loads the ones whose situation fits the task, and names each one it applies. You steer with their names rather than invoking them. The [principles page](../guide/08-principles.md) lists all of them with a one-line summary.

```text
prove it works. create INV-1042 through the CLI and show me the stored totals.
/principle-attack-the-premise
```

## Agents

Two subagent definitions ship with the plugin. You rarely spawn them yourself.

| Agent | What it is |
| --- | --- |
| [`tj-agent`](../../agents/tj-agent.md) | The wrapper for every subagent a `/tj-mode` playbook step spawns. It reads `tj-mode` in full before any work. Never use it to run the playbook itself. In Claude Code it's `tjstack:tj-agent`. |
| [`comment-cleaner`](../../agents/comment-cleaner.md) | The read-only comment reviewer behind `/clean-comments`. In Claude Code it's `tjstack:comment-cleaner`. |

## Outside tjstack

- `/loop` is built into Cursor and Claude Code. Autonomous run and Autopilot-stack use it.
- Bugbot is Cursor's review bot. Babysit triages its comments when it runs on your PRs.
- No playbook merges or deploys. Landing stays with you, and sustained metric work runs as an Autonomous run.
