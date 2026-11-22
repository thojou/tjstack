# Glossary

The words tjstack's skills and replies use, in alphabetical order. Each entry links to the page that explains it in context.

**Act on, Consider, Noted, Dismissed.** The four buckets `/challenge` sorts review findings into. Only Act on findings would block a real PR. See [Design](../guide/04-design.md#break-it-with-challenge).

**ADR.** Architecture decision record. A short numbered file under `docs/adr/` that records that a decision was made and why. Written only when the decision is hard to reverse, surprising without context, and a real trade-off. See [Design](../guide/04-design.md#record-a-decision-with-create-adr).

**Always-pause list.** The irreversible actions `/tj-mode` never takes without asking: force-pushing a shared branch, deploying, deleting data, messaging customers, merging, closing, or arming auto-merge on a PR, and pushing before the Destination tuple. See [Route work](../guide/02-tj-mode.md#know-what-it-does-without-asking).

**Attention section.** The closing section of every reply from a run that kept a decision trail. A reviewer on a different model lists what deserves your scrutiny. See [Overnight](../guide/07-overnight.md#the-morning-audit).

**Band.** The strip above the prompt in Claude Code. It shows the session's cost, agent time, and tests, and holds the tj-mode toggle and the Retro, Board, and Details buttons.

**Board.** `board.html` in `~/.config/tjstack/metrics/`. A page that compares your recorded sessions across projects and harnesses.

**Budget.** The reasoning effort tjstack passes to subagents: `low`, `medium`, `high`, `xhigh`, or `max`. Set in `/setup-tjstack`. See [Setup](../guide/01-setup.md#1-a-reasoning-budget).

**Characterization test.** A test that pins what code does today, before a refactor moves anything. The Refactoring playbook writes one first. See [Build](../guide/05-build-and-clean.md#give-each-build-playbook-the-facts-it-needs).

**Coverage gap.** An evidence category `/why` couldn't search because no tool is connected for it. Reported, never guessed around. See [Understand](../guide/03-understand.md#dig-up-history-with-why).

**Cross-judge.** The read-only judge in `/arena` that scores every candidate against the rubric, on a different model when your panel allows. See [Design](../guide/04-design.md#fan-out-attempts-with-arena).

**Decision trail.** The append-only TSV `/track-your-work` keeps, one row per decision with its reason, evidence, and result. See [Overnight](../guide/07-overnight.md#the-morning-audit).

**Destination tuple.** The block Opening a PR prints before any push: remote, push URL, host, project, base, head, and forge CLI. See [Prove it, then open the PR](../guide/06-verify-and-ship.md#open-the-pr).

**Done check, finish condition, exit condition, predicate.** A check that can pass or fail and tells the agent the work is finished. A duration is never one. See [Route work](../guide/02-tj-mode.md#what-goes-in-a-prompt).

**Evidence category.** One of the seven kinds of record `/why` searches: source control, issue tracker, long-form documents, real-time chat, infrastructure observability, error tracking, and product analytics. See [Setup](../guide/01-setup.md#connect-evidence-sources-with-setup-source).

**Fan-out line, pick line.** The two kinds of panel role. A fan-out line runs one subagent per listed model, at least two. A pick line takes the first model that differs from the chat's own. See [Setup](../guide/01-setup.md#2-a-model-for-each-role).

**Feature map.** The `features/` directory in a verification skill: one file per user-facing feature, with what proves it works. See [Prove it, then open the PR](../guide/06-verify-and-ship.md#create-a-project-verification-skill).

**Feedback loop.** A repeatable pass or fail signal for a bug, built before any hypothesis. See [Build](../guide/05-build-and-clean.md#give-each-build-playbook-the-facts-it-needs).

**Forge.** The service that hosts pull requests: GitHub through `gh`, or GitLab through `glab`.

**Harness.** The tool the agent runs in, such as Cursor or Claude Code. The skills are written in Cursor terms, and the **harness rule** translates them elsewhere. See [Setup](../guide/01-setup.md#what-setup-writes).

**`inherit-parent`, `auto`.** Role values that mean "run this subagent on the chat's own model." Neither is a model name.

**Merge frontier.** The lowest unmerged PR in a stack. Babysit works only on it until it merges. See [Prove it, then open the PR](../guide/06-verify-and-ship.md#get-the-pr-to-merge-ready-with-babysit).

**Merge-ready.** The forge agrees the PR can merge: checks green, no blocking thread, no conflict. Babysit stops here and never merges.

**Mode.** A skill that sets how the agent works for a whole task, such as `/tj-mode` or your own `<name>-mode`. In Cursor, a Custom Mode keeps it on every turn. See [Make it yours](../guide/09-make-it-yours.md#draft-your-own-mode-with-customize-my-mode).

**Owner.** In Autopilot-stack, the one agent that builds, proves, and babysits one PR. The **root** is the chat that audits the owners and alone rewrites the stack. See [Overnight](../guide/07-overnight.md#build-a-stack-of-dependent-prs-with-autopilot-stack).

**Panel.** A role that lists several models, such as `challenge reviewers`. Model diversity is how tjstack gets independent opinions.

**Playbook.** A fixed list of steps inside `/tj-mode` for one kind of task. Thirteen ship with tjstack. Playbooks have no slash command. You pick one by describing the task. See [Route work](../guide/02-tj-mode.md#what-happens-to-your-prompt).

**PRD.** Product requirements document, written by `/create-prd` under `docs/prd/`. See [Design](../guide/04-design.md#write-requirements-with-create-prd).

**Principle.** A one-rule skill such as Prove It Works. You steer with its name. See [Principles](../guide/08-principles.md).

**Reuse ladder.** The order the Laziness Protocol checks before new code: nothing, code the repository has, the standard library, an installed dependency, one readable line, then the least new code. See [Principles](../guide/08-principles.md#the-29-briefly).

**Role line.** One line in the models rule that maps a job, such as `how explorer`, to a model. Every subagent spawn names its role line. See [Setup](../guide/01-setup.md#2-a-model-for-each-role).

**Session override.** A phrase such as "going to bed" or "don't stop" that tells `/tj-mode` to keep going without check-ins. It doesn't lift the always-pause list.

**Skips and risks.** The one or two lines that end every tj-mode reply: what the agent left out or could not check, and any risk you need to know. See [Route work](../guide/02-tj-mode.md#read-the-reply).

**Skip line.** A playbook step `/tj-mode` chose not to run. It stays in the todo list as `skip: <reason>` so you can audit the choice.

**Source playbook.** A small skill that tells `/why` how to search one MCP server. Written by `/create-source-playbook`.

**Testing seam.** The place where a behavior gets verified, as high as possible: an API, a CLI command, a browser flow. `/create-prd` proposes them. See [Design](../guide/04-design.md#write-requirements-with-create-prd).

**Throughput checkpoint.** Four todo items the Feature playbook writes before delegating: blocking first steps, independent workstreams, shared mutable state, and the smallest safe split.

**Verification skill.** A project-local `verify-<app>` skill that teaches agents to launch, drive, and prove your app. See [Prove it, then open the PR](../guide/06-verify-and-ship.md#create-a-project-verification-skill).

**Worktree.** A second git checkout of the same repository in its own directory. tjstack gives each writing subagent its own, so parallel agents never share files.
