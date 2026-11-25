# Prove it, then open the PR

A passing build tells you the code compiles. It doesn't tell you the invoice total is right. The [Prove It Works principle](../../skills/principles/principle-prove-it-works/SKILL.md) makes the agent check the real result before claiming success, but it can only check what it can reach. This page is about making the real result reachable, then getting the change through a PR.

Once agents can check their own work, you are no longer the step everything waits on. If they can't, adding more agents just adds more work for you to verify by hand.

## Say what done means in the first message

Write down what "done" means in the first message:

```text
/tj-mode add a --currency option to the CSV export. without it the file is byte-identical to today's, with it every amount is converted at the stored rate, and both run against the demo tenant. show me the commands and output.
```

That gives the agent three checks it can actually run. Expect the reply to quote each command with its output. A check that couldn't run is reported as "inconclusive", and the playbooks treat that as a fail. A reply that sounds sure of itself but shows nothing should make you ask for evidence.

What counts as proof depends on what changed:

| Change | Proof |
| --- | --- |
| CLI command | Run it and show the output. |
| Web UI | Click through the changed flow in the running app. |
| Parser, importer, migration | Feed it a saved input and compare. |
| Performance | Traces from before and after. |
| Persistence | Read the stored value back. |

Prefer proof you can inspect yourself: the red and then green test run, screenshots from before and after, the trace file. You can poke at an artifact. You can only believe an explanation.

The playbooks operate the real surface themselves. If your repository has a `verify-*` skill for that surface, they drive through it. Otherwise the agent runs the app, CLI, or tests directly. [Create a project verification skill](#create-a-project-verification-skill) explains how to get one.

## Vet a measured number

Speedups are easy to fake by accident: a warm cache, a debug build on one side, or work that happened outside the timer. Before a number goes into a PR, steer with the principle:

```text
apply explain the number to the export speedup before it goes in the PR.
```

The [Explain the Number principle](../../skills/principles/principle-explain-the-number/SKILL.md) puts three demands on any measurement:

1. **Name the limit.** Ask why the result isn't twice as good. Find what bounds it, using a profile or system counters, not by reading code.
2. **Rule out the impostors.** Errors, skipped or cached work, code that didn't run, an untuned side, noise, or a piece too small to matter for the whole task. Exclude each one with evidence.
3. **Keep the evidence attached.** Run count, spread, and limit travel with the number.

The Perf issue playbook does this for every number it produces. Invoke it yourself for measurements made elsewhere, or for a colleague's number that seems too good.

## Check what a diff can break with `/blast-radius`

```text
/blast-radius of caching tax rates per request
```

A grep for callers is easy to get. What it misses is the hard part. [`/blast-radius`](../../skills/review/blast-radius/SKILL.md) follows the paths a symbol search can't see: into the library behind a call, into timing (when does this code run?), into JSON responses, database columns, file formats, feature flags, and code several hops away.

Its main move is to find the single fact the change depends on, such as "the rate table can't change during one request", and prove that fact by running code. Each fact is graded on a scale from "stated" up to "reproduced in the running app". Usually the bar is a short script that calls the real code and fails if the fact is false. If the script can't run, the fact is marked unproven and the blocker named.

`/challenge` checks what's inside the diff. `/blast-radius` checks what's around it.

## Review a whole repository with `/audit`

```text
/audit src/Billing. what can i delete?
```

[`/audit`](../../skills/review/audit/SKILL.md) reviews a repository or one folder, not a diff. It looks for bugs, security holes, code that breaks under real load, risky code without tests, slow paths, and code to delete, merge, or split. Findings come back ranked, each explained in plain words. It changes nothing. Pick the findings you want fixed and run each one as its own task, such as `/tj-mode` with a Bug fix or a Refactoring.

## Create a project verification skill

"Click through the flow" assumes the agent can click. If Ledger has no scripted way to be driven, create one:

```text
/create-verification-skill
```

[`/create-verification-skill`](../../skills/review/create-verification-skill/SKILL.md) reads Ledger's repository to answer its own questions. It finds the surfaces people use (web pages, CLI commands, or both), how to start the app locally, what can operate it, and what output would prove a behavior. You only get asked what the repository can't tell it. If there's nothing to run, like a pure library, or only a native window with no dev URL, it stops and says why.

The skill it writes goes in `.cursor/skills/verify-<app>/`, or `.claude/skills/verify-<app>/` in Claude Code, and contains these sections:

- **Launch.** The start command and the signal that the app is ready. That's a seed or ready message, because an open port can come before the app is usable.
- **Doctor.** One read-only health check, run before the first action and after anything unexpected.
- **Drive.** How to operate each surface, using stable handles like roles, accessible names, and URLs, never screen positions.
- **Evidence.** Where the proof is stored, outside the throwaway data directory.
- **Cleanup.** Stop only what this run started.

A **Helpers** section documents any scripts that ship with it. There's also a feature map in `features/`, one file for each of the three to five most important user-facing features, saying what output proves the feature works. Before handing it over, the generator follows its own instructions from start to end and shows you the output. Don't use a verify skill whose proof run failed.

From then on, any agent can check behavior in Ledger:

```text
/tj-mode add a "mark as disputed" action to invoices. check it with /verify-ledger and attach screenshots.
```

With a working verify skill, `/swarm` can split a full check across the feature map, one worker per feature.

Commit the skill, so people and agents all operate the app the same way. Maps get stale as the app changes. After a change, rerun launch, doctor, and the drives for the affected features, and fix the map from what you saw. If agents keep writing one-off scripts to operate the app, apply [Build the Lever](../../skills/principles/principle-build-the-lever/SKILL.md): ask for a small control CLI that the skill can call.

## Open the PR

```text
/tj-mode open the PR. small commits in a sensible order, proof in the description.
```

The [Opening a PR playbook](../../skills/mode/tj-mode/playbooks/opening-a-pr.md) closes every playbook that changed code. It works in a worktree from main, reshapes the history into small ordered commits through `/git-commit`, runs `/clean-comments`, and writes the title and description with `/technical-writing` and `/noslop`.

Before the first push, it prints the **Destination tuple**:

```text
Destination
- remote: origin
- push URL: git@github.com:acme/ledger.git
- host: github.com   project: acme/ledger
- base: main   head: fix/credit-note-vat   forge CLI: gh
```

The remote is `origin`, unless the repo commits `.cursor/rules/tjstack-pr-remote.mdc`. The host decides the CLI: `gh` for `github.com`, `glab` for GitLab, including a host where `glab auth status` succeeds. If the host is ambiguous, for example an SSH alias, it stops and asks. This block is your last chance to stop a push to the wrong place before it happens, so read it.

Titles use Conventional Commits, for example `fix(tax): apply customer exemptions to credit notes`. The description is written for a reviewer who has the diff open and a minute to spare. Its sections, in order, are Why, What changed, Scope, Tradeoffs, Blast Radius, and Verification. Scope is always present, and the others appear when there's something to say. Several narrow PRs review faster than one wide one, and a stacked follow-up is better than a branch that keeps growing.

## Get the PR to merge-ready with Babysit

After a PR opens, blockers pile up: red checks, review comments, a base branch that moves on. The [Babysit playbook](../../skills/mode/tj-mode/playbooks/babysit.md) works through them:

```text
/tj-mode babysit PR 418 and get it green. the merge is mine.
```

Babysit only starts on request, never just because a PR was opened. It picks one of four modes before it looks at anything:

| Mode | Triggered by | Behavior |
| --- | --- | --- |
| `drive` | "babysit this", "get it green", "merge-ready" | Loops until the PR is merge-ready. |
| `background` | a plan that is still executing | Triages without blocking other work. |
| `threads-only` | "address the review comments", "address the bugbot comments" | Answers review threads and changes nothing else. |
| `check` | "check on PR 123", "is it green", "anything outstanding?" | One status pass, one report. |

In `drive`, it deals with the lowest unmerged PR of a stack first, and in a fixed order: conflicts, review threads, then CI. Known fixes are bundled into a single push, so CI restarts once. Conflicts are the exception. Babysit never rebases, retargets, or force-pushes, so it reports the conflict and stops.

A CI failure is classified before anyone presses retry. A suspected flake gets one fresh run, and if it fails the same way twice, it wasn't a flake. Review comments, whether from people or bots like Bugbot, are triaged against the [bugbot triage rubric](../../skills/mode/tj-mode/references/bugbot-triage.md). Real findings get a fix proven by a failing test first. A comment that turns out to be wrong gets a reply in its thread that shows why, and no code change. Anything new that touches security, data, auth, billing, or migrations goes to you.

To get only the status:

```text
/tj-mode is PR 418 green? just report, don't fix anything.
```

Babysit stops at merge-ready, even with every check green. Merging is a separate decision, and it's yours.

**Try it.** On your next PR, read the Destination tuple before the push goes through. Afterward, ask `/tj-mode is PR <n> green?` and compare its verdict with the PR page.

Next: [Run work while you're away](./07-overnight.md).
