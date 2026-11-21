# tjstack

Write less, but higher-quality code.

An agent will happily write a thousand lines before lunch. The hard part is knowing which of them are right. tjstack is a plugin for Cursor and Claude Code that gives the agent an engineer's routine: read the code before editing it, settle the shape before filling it in, check the result on the running app, and leave a record a reviewer can follow.

What that buys you:

- **Fewer, better diffs.** Playbooks favor deletion, small commits, and fixes at the root cause, and they reject a change that doesn't prove itself.
- **Parallel work you can trust.** Once a single agent verifies its own output, you can run several without rereading every line they write.
- **Your models, your rules.** Each job reads its model from one rule you set once, and review panels spread across model families so one model's blind spot doesn't become the team's.
- **Room for your own style.** `tj-mode` is one person's way of working. `/customize-my-mode` builds yours from how you actually work.

Parts of tjstack are adapted from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, [skills](https://github.com/mattpocock/skills) by Matt Pocock, and [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert. The licenses are in [NOTICE](../NOTICE).

## Install

**Cursor.** In Customize, add the tjstack repository as a local folder.

**Claude Code.**

```text
/plugin marketplace add thojou/tjstack
/plugin install tjstack@tjstack
```

Commands are namespaced in Claude Code, so `/tj-mode` becomes `/tjstack:tj-mode`. From a local clone, use `claude --plugin-dir ./tjstack`.

## Get started

1. Run [`/setup-tjstack`](./skills/setup/setup-tjstack/SKILL.md). It asks for a reasoning budget, a model per role, the git remote for PRs, and whether subagents run locally or in the cloud. In Claude Code it also installs the rule that maps the skills' Cursor vocabulary to Claude Code. Open a new chat afterward.
2. Prefix any task that deserves care with [`/tj-mode`](./skills/mode/tj-mode/SKILL.md).

Two more steps pay off in the first week. [`/setup-source`](./skills/setup/setup-source/SKILL.md) lets `/why` search your tracker, docs, and chat as well as git. [`/create-verification-skill`](./skills/review/create-verification-skill/SKILL.md) teaches agents to run your app, so they can check their own work.

To learn the workflow, follow the [tjstack guide](./docs/guide/README.md), which builds up one example project from setup to overnight runs. For a quick answer about which skill to use, type [`/tj-help`](./skills/setup/tj-help/SKILL.md) and your question.

## Usage

Start a task with `/tj-mode`, the outcome, and a check:

```text
/tj-mode invoices with a 0% VAT line total 0.00. reproduce it, fix it, and show INV-1042 totaling 238.00 again.
```

```text
/tj-mode i'm off for the night. replace TaxCalculator with TaxEngine everywhere. done when grep finds no TaxCalculator and the suite passes. keep a decision log.
```

What follows:

1. tj-mode classifies the task. In one call it loads the matching playbook together with every skill and principle the task needs, then copies the playbook's steps into the todo list as the first items. Steps it decides to skip remain listed as `skip: <reason>`.
2. Each step pulls in the skills it needs. Code is written by delegates, while your chat keeps the lead and reviews their diffs.
3. The reply names each principle it applied and the decision it changed, and labels every claim as measured, inferred, or guessed. It ends with what the agent skipped or could not check, and any risk you need to know about.

Some actions always wait for your confirmation: merging, deploying, deleting data, and force-pushing a shared branch. Before any push, the agent prints a Destination block naming the remote, host, and project.

To keep the mode active, Cursor users pick `/tj-mode` from the `/` menu with Option+Enter (Mac) or Alt+Enter (Windows), which makes it a Custom Mode. In Claude Code, switch on the tj-mode toggle in the [session band](#session-metrics). While it is on, every request you type runs with `/tjstack:tj-mode`. Without the band, put `/tjstack:tj-mode` in front of each new task. For long runs, combine it with your harness's `/loop`.

<details>
<summary>The thirteen playbooks</summary>

| Playbook | For |
| --- | --- |
| [Investigation](./skills/mode/tj-mode/playbooks/investigation.md) | You want an answer, not a change: how something works, why it exists, which option wins. |
| [Bug fix](./skills/mode/tj-mode/playbooks/bug-fix.md) | Reproduce a defect, find the root cause with ranked hypotheses, and fix it with runtime evidence. |
| [Perf issue](./skills/mode/tj-mode/playbooks/perf-issue.md) | Something is measurably slow. Baseline first, then fixes tied to the profile. |
| [Feature](./skills/mode/tj-mode/playbooks/feature.md) | Behavior is new or changes. The data shape gets named before any logic. |
| [Refactoring](./skills/mode/tj-mode/playbooks/refactoring.md) | A change to structure that keeps behavior the same, held against a pinned contract. |
| [Prototype](./skills/mode/tj-mode/playbooks/prototype.md) | A throwaway sketch that settles one design or behavior question. |
| [Autonomous run](./skills/mode/tj-mode/playbooks/autonomous-run.md) | A checkable exit condition and a known approach, driven to done without stopping. |
| [Autopilot-stack](./skills/mode/tj-mode/playbooks/autopilot-stack.md) | A queue of coupled PRs, one owner each, verified into one stack for you to land. |
| [Babysit](./skills/mode/tj-mode/playbooks/babysit.md) | On request, works an open PR or stack through conflicts, review threads, and CI until it can merge. GitHub and GitLab. |
| [Session pickup](./skills/mode/tj-mode/playbooks/session-pickup.md) | Resume another agent's in-flight work. |
| [Pause safely](./skills/mode/tj-mode/playbooks/pause-safely.md) | Halt running work with a checkpoint commit and a resume note. |
| [Multi-phase plan](./skills/mode/tj-mode/playbooks/multi-phase-plan.md) | You want the multi-PR plan itself, not code. |
| [Opening a PR](./skills/mode/tj-mode/playbooks/opening-a-pr.md) | The closing step of every code playbook: tidy commits, a Destination check, then the PR with a one-minute description. |

</details>

## Skills

Most skills run inside tj-mode's playbooks without you naming them. Call one directly when you want exactly that step:

```text
/how which code decides the VAT rate for a credit note?
```

```text
/challenge this branch. real bugs only.
```

<details>
<summary>All skills</summary>

| Skill | Use it when |
| --- | --- |
| [`/tj-mode`](./skills/mode/tj-mode/SKILL.md) | The front door. Picks a playbook for anything that needs care. |
| [`/tj-help`](./skills/setup/tj-help/SKILL.md) | A question about tjstack itself. Answers from the docs, gives you a prompt, runs nothing. |
| [`/how`](./skills/understand/how/SKILL.md) | You want a walkthrough of how a subsystem works, or where new code should live. |
| [`/why`](./skills/understand/why/SKILL.md) | Code looks odd and you want the reasons on record. Searches git plus every source you connected, in parallel. |
| [`/explain`](./skills/understand/explain/SKILL.md) | You want one plain explanation of a change or subsystem. Runs `/how` and `/why` and builds it up diagram by diagram. |
| [`/teach`](./skills/understand/teach/SKILL.md) | You want to learn a topic over several sessions, with a mission, lessons, and records of what you know. |
| [`/rly`](./skills/understand/rly/SKILL.md) | You want the last reply restated in plain words. |
| [`/catch-up`](./skills/session/catch-up/SKILL.md) | You're starting or resuming work and want your recent context on a topic, from your chats and the shared record. |
| [`/interview`](./skills/design/interview/SKILL.md) | An idea is fuzzy. One question at a time, with terms recorded in `docs/CONTEXT.md` as they lock. |
| [`/create-adr`](./skills/design/create-adr/SKILL.md) | A decision is hard to reverse, surprising, and a real trade-off. Writes `docs/adr/NNNN-*.md`. |
| [`/create-prd`](./skills/design/create-prd/SKILL.md) | Settled requirements should outlive the chat. Writes `docs/prd/NNNN-*.md` with testing seams. |
| [`/architect`](./skills/design/architect/SKILL.md) | New code will have several callers. Designs it from their side, compares at least two shapes, then implements. |
| [`/prototype`](./skills/design/prototype/SKILL.md) | A which-approach question that running a throwaway sketch can settle. |
| [`/arena`](./skills/orchestrate/arena/SKILL.md) | One artifact matters. Several runners attempt it, a judge scores them, the best parts get combined. |
| [`/swarm`](./skills/orchestrate/swarm/SKILL.md) | The same check over many items, or a race between workers, summed up in one report. |
| [`/figure-it-out`](./skills/orchestrate/figure-it-out/SKILL.md) | No playbook fits, or the work is large and you'll review it later. Designs an auditable playbook first. |
| [`/peer-subagent`](./skills/orchestrate/peer-subagent/SKILL.md) | A brief should run on the Codex CLI, Claude Code, or the Cursor CLI. |
| [`/challenge`](./skills/review/challenge/SKILL.md) | A diff should face reviewers from several model families. Findings come back sorted by what to act on. |
| [`/blast-radius`](./skills/review/blast-radius/SKILL.md) | You have a small diff and want to know what else it could break, with the one safety fact proven by running code. |
| [`/clean-comments`](./skills/review/clean-comments/SKILL.md) | Before review. A reviewer that didn't write the comments removes those the code could express. |
| [`/create-verification-skill`](./skills/review/create-verification-skill/SKILL.md) | Agents can't run your app yet. Writes a `verify-<app>` skill so they can launch it, use it, and capture proof. |
| [`/audit`](./skills/review/audit/SKILL.md) | You want a ranked review of a whole repository or folder: bugs, security, scale, missing tests, speed, and code to delete. Report only. |
| [`/tdd`](./skills/session/tdd/SKILL.md) | A fix or feature with a cheap local test path. Red, watch it fail, green, refactor. PHPUnit first. |
| [`/git-commit`](./skills/session/git-commit/SKILL.md) | Commit as small Conventional Commits, staged by logical change. |
| [`/babysit`](./skills/session/babysit/SKILL.md) | An open PR or stack needs conflicts, review threads, and CI cleared until it can merge. Stops at merge-ready. GitHub and GitLab. |
| [`/track-your-work`](./skills/session/track-your-work/SKILL.md) | You want a reviewable decision trail for a long or unattended run, checked by a reviewer on another model. |
| [`/retro`](./skills/session/retro/SKILL.md) | A session taught you something. Three reviewers mine the transcript and propose skill changes. Report only. |
| [`/technical-writing`](./skills/writing/technical-writing/SKILL.md) | Docs, RFCs, ADRs, READMEs, PR descriptions, and commit messages to a layered standard, in English or German. |
| [`/noslop`](./skills/writing/noslop/SKILL.md) | Text reads like model output. |
| [`/md-to-pdf`](./skills/writing/md-to-pdf/SKILL.md) | A Markdown file must become a print-ready PDF, optionally themed. |
| [`/customize-my-mode`](./skills/mode/customize-my-mode/SKILL.md) | You want a mode of your own, mined from your chat history. |
| [`/setup-tjstack`](./skills/setup/setup-tjstack/SKILL.md) | Pick models per role, the budget, the PR remote, and where subagents run. |
| [`/setup-source`](./skills/setup/setup-source/SKILL.md) | Tell `/why` which tool covers each evidence category. |
| [`/create-source-playbook`](./skills/setup/create-source-playbook/SKILL.md) | An MCP server has no playbook for `/why` yet. |
| [`/create-skill`](./skills/setup/create-skill/SKILL.md) | You're writing or revising a `SKILL.md`. |
| [`/create-principle`](./skills/setup/create-principle/SKILL.md) | A rule should load only when a playbook or a person names it. |

Two skills are plumbing that other skills read: [`spawn-subagent`](./skills/orchestrate/spawn-subagent/SKILL.md) sets each subagent's model and worktree, and [`code-explore`](./skills/understand/code-explore/SKILL.md) is the source-control playbook behind `/why`.

</details>

The [skill reference](./docs/reference/skills.md) adds what each skill reads and writes, and a sample prompt for each.

### Examples

<details>
<summary>One prompt per situation</summary>

```
bug fix:        /tj-mode credit notes ignore VAT exemptions since PR 318. reproduce with
                customer C-77, fix, and show INV-2207 totaling 500.00.
perf:           /tj-mode the monthly export takes 42s for the demo tenant. profile and fix.
feature:        /tj-mode add --currency to invoices:export. default output stays byte-identical.
refactoring:    /tj-mode split InvoiceBuilder in two. no behavior change, prove it on the fixtures.
prototype:      /tj-mode prototype three layouts for the pause dialog behind one switcher.
plan:           /tj-mode plan the approval feature. one verifiable PR per step.
overnight:      /tj-mode i'm off. render every template like before. keep a decision log.
autopilot:      /tj-mode autopilot these five tax-engine changes as one stack. land nothing.
babysit:        /tj-mode is PR 418 green? report only.
pickup:         /tj-mode take over feat/credit-notes. skip what's already done.
how:            /how does the dunning job pick invoices?
why:            /why do we round VAT per line?
explain:        /explain the rounding change in this PR. convince me it's the cause.
interview:      /interview finance wants to approve invoices above 10,000 EUR.
adr:            /create-adr we poll the bank API instead of using webhooks.
prd:            /create-prd
architect:      /architect the pause and resume API, designed from the callers' side.
arena:          /arena three proration formulas. compare with ours.
swarm:          /swarm render every template in templates/invoices/. one report.
challenge:      /challenge this branch. real bugs only.
audit:          /audit src/Billing. what can i delete?
blast radius:   /blast-radius of caching tax rates per request
tdd:            /tdd regression test for VAT on exempt credit notes, then the fix
commit:         /git-commit split this into separate commits
catch-up:       /catch-up the credit note work
retro:          /retro the VAT bug took three rounds. why?
plain words:    /rly
help:           /tj-help which skill reviews a branch?
```

</details>

## The two bundled agents

The chat where you type `/tj-mode` is the lead. It runs the playbook, keeps the todo list, and starts every subagent.

Those subagents run as [`tj-agent`](./agents/tj-agent.md), a wrapper whose first action is to read `tj-mode` and its principles index in full. A generic subagent skips that reading and stops following the rules. `tj-agent` is for the steps inside a playbook, never for running the playbook itself.

[Comment Cleaner](./agents/comment-cleaner.md) is a read-only reviewer that removes comments the code could express. Reach it through [`/clean-comments`](./skills/review/clean-comments/SKILL.md). In Claude Code the two agents are `tjstack:tj-agent` and `tjstack:comment-cleaner`.

## Principles

Each of the 28 principles is a small skill with one rule. tj-mode keeps an index of all of them, with the situation each one applies to, and loads the ones a task needs when it starts. Playbook steps also name the principle that governs them. You use them by name, as in "prove it works, show me the CLI output".

<details>
<summary>All twenty-eight principles</summary>

| Principle | Group | Rule |
| --- | --- | --- |
| [laziness-protocol](./skills/principles/principle-laziness-protocol/SKILL.md) | core | Reuse before you write: nothing, existing code, the platform, an installed dependency, then new code. Reach every caller, keep the safety checks. |
| [foundational-thinking](./skills/principles/principle-foundational-thinking/SKILL.md) | core | Choose the data structures first. Good ones make the logic that follows easy. |
| [redesign-from-first-principles](./skills/principles/principle-redesign-from-first-principles/SKILL.md) | core | Shape the design around a new requirement as if it had been known on day one. |
| [attack-the-premise](./skills/principles/principle-attack-the-premise/SKILL.md) | core | Two failed fixes with a shared assumption make the assumption the suspect. |
| [subtract-before-you-add](./skills/principles/principle-subtract-before-you-add/SKILL.md) | core | Clear out dead code and duplicate checks, then build on what remains. |
| [minimize-reader-load](./skills/principles/principle-minimize-reader-load/SKILL.md) | core | Cut the hops and hidden state a reader has to track. |
| [early-return](./skills/principles/principle-early-return/SKILL.md) | core | Guard clauses at the top, the main path last and unnested. |
| [outcome-oriented-execution](./skills/principles/principle-outcome-oriented-execution/SKILL.md) | core | In a planned rewrite, head for the end state without temporary bridges. |
| [experience-first](./skills/principles/principle-experience-first/SKILL.md) | core | When the user's experience and the easy implementation disagree, the user wins. |
| [exhaust-the-design-space](./skills/principles/principle-exhaust-the-design-space/SKILL.md) | core | Without precedent, build two or three versions and compare. |
| [build-the-lever](./skills/principles/principle-build-the-lever/SKILL.md) | core | Write the tool that does or checks the work, so a reviewer can rerun it. |
| [model-the-domain](./skills/principles/principle-model-the-domain/SKILL.md) | architecture | Put recurring rules in a structure, not in scattered conditionals. |
| [boundary-discipline](./skills/principles/principle-boundary-discipline/SKILL.md) | architecture | Parse all input at the entry point before the first side effect, wrap each third-party API once, trust inner types. |
| [fail-fast](./skills/principles/principle-fail-fast/SKILL.md) | architecture | Stop at a broken invariant or bad config with an error that names it. Never default or log past it. |
| [type-system-discipline](./skills/principles/principle-type-system-discipline/SKILL.md) | architecture | Design types so invalid states can't be built. |
| [make-operations-idempotent](./skills/principles/principle-make-operations-idempotent/SKILL.md) | architecture | A rerun after a crash ends in the same state. |
| [migrate-callers-then-delete-legacy-apis](./skills/principles/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | architecture | Move all callers and remove the old API together. |
| [separate-before-serializing-shared-state](./skills/principles/principle-separate-before-serializing-shared-state/SKILL.md) | architecture | Give each writer its own copy before reaching for locks. |
| [functions-do-one-thing](./skills/principles/principle-functions-do-one-thing/SKILL.md) | code | One job and one level of abstraction per function, no mode-switching flags. |
| [names-reveal-intent](./skills/principles/principle-names-reveal-intent/SKILL.md) | code | A name says why the thing exists and how to use it. |
| [prove-it-works](./skills/principles/principle-prove-it-works/SKILL.md) | verification | Check the actual output, not a stand-in. |
| [fix-root-causes](./skills/principles/principle-fix-root-causes/SKILL.md) | verification | Reproduce, trace to where it first went wrong, fix there. |
| [sequence-verifiable-units](./skills/principles/principle-sequence-verifiable-units/SKILL.md) | verification | Small steps, each ending in a check, one after another. |
| [test-behavior-not-implementation](./skills/principles/principle-test-behavior-not-implementation/SKILL.md) | verification | Assert what a caller can see, against a literal value. |
| [explain-the-number](./skills/principles/principle-explain-the-number/SKILL.md) | verification | Find what limits a measurement before trusting it. |
| [guard-the-context-window](./skills/principles/principle-guard-the-context-window/SKILL.md) | delegation | Subagents read the bulk. The main chat keeps conclusions. |
| [never-block-on-the-human](./skills/principles/principle-never-block-on-the-human/SKILL.md) | delegation | For reversible work, do it and show the result. |
| [encode-lessons-in-structure](./skills/principles/principle-encode-lessons-in-structure/SKILL.md) | meta | Advice given twice becomes a lint, check, or script. |

</details>

## Session metrics

tjstack records each agent session through hooks, in Claude Code and in Cursor. The hooks need Node.js on your `PATH`. They write one JSON file per session to `~/.config/tjstack/metrics/` and rebuild `board.html` there after every turn. Open the board in a browser to compare sessions across projects. No data leaves your machine.

In Claude Code, a band above the prompt shows the session's cost, agent time, and test results, with buttons for the tj-mode toggle, Retro, Board, and Details. The band uses Claude Code hooks modules, which are in early access. Cursor records the same metrics, but has no band. The [repository README](../README.md#session-metrics) lists which metric each host reports.

## What stays with you

- **Landing.** No playbook merges. Babysit ends at merge-ready, Autopilot-stack ends with a verified stack, and you decide when to land.
- **`/loop`.** It comes with Cursor and Claude Code. tjstack uses it for long runs.
- **Review bots.** If Bugbot or another bot comments on your PRs, Babysit checks each claim against the code before it acts.

## Make it yours

Run [`/customize-my-mode`](./skills/mode/customize-my-mode/SKILL.md) to get a `<your-name>-mode` skill drafted from your own chat history, alongside `tj-mode`.

After a difficult session, [`/retro`](./skills/session/retro/SKILL.md) proposes changes for you to accept or reject. Write new skills with [`/create-skill`](./skills/setup/create-skill/SKILL.md) and new principles with [`/create-principle`](./skills/setup/create-principle/SKILL.md).

Change models whenever you like by rerunning [`/setup-tjstack`](./skills/setup/setup-tjstack/SKILL.md). Roles without a line in the rule use their defaults, so you only set what you care about.

## License

MIT
