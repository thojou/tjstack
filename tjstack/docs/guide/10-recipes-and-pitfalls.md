# Recipes and pitfalls

This page is meant to be copied from. The prompts below are written for Ledger. Swap in your own names, ids, and checks. They're written the way people actually type, lowercase and terse, because the skills understand that fine.

Recipes are grouped by stage. The page ends with the traps that catch most new users at least once.

## Understand

### Learn a subsystem, then its history

```text
/how does the dunning job pick which invoices get a reminder? then /why it skips invoices under 5 EUR.
```

How it works first, then why. `/why` lists which sources it read and which categories it couldn't reach, so you know how solid the answer is.

### Get a messy report restated

```text
/tj-mode here's the support thread. say in plain words what's broken and for whom. no code changes yet.
```

If the summary is off, one reply fixes it, and no code has been written yet. Hold your own suspicion until you've seen the agent's.

### Pick up where you left off

```text
/catch-up the credit note work, then read the ticket i'm about to paste.
```

You get a short overview, every thread with its state, the problems that keep returning, and the next step, all before the new ticket is read.

### Learn something properly

```text
/teach how SEPA direct debit mandates work, so i can review the new payment flow.
```

The first session sets a goal and gives the first lesson. Later sessions read what you've already shown you understand and continue from there.

## Design

### From idea to requirements

```text
/interview finance wants to approve invoices above 10,000 EUR before they're sent.
```

Once the open questions are resolved:

```text
/create-prd
```

The interview records the terms in `docs/CONTEXT.md` and the hard calls as ADRs. The PRD then uses those terms, so it speaks the team's language.

### Write down a decision while you still remember why

```text
/create-adr we poll the bank API every 15 minutes instead of using webhooks, because the bank drops webhooks under load.
```

You get a numbered file in `docs/adr/`, or an explanation of which of the three conditions the decision fails.

### Compare options by building them

```text
/tj-mode prototype three layouts for the approval queue. put them behind one switcher and screenshot each.
```

You choose by looking at running variants, not by reading descriptions of them.

### Ask for a second opinion on the current approach

```text
/arena take our current approval design as one candidate and get two more. tell me whether anything beats it.
```

Your design competes against fresh attempts. Either something better turns up, or you have evidence that yours holds.

### Plan a settled design as PRs

```text
/tj-mode plan the approval feature. one PR per step that can be verified on its own, each with its proof.
```

Wait with this until the shape is clear. The result is a document, not code, and it says which playbook should carry it out.

## Build

### Fix a bug test-first

```text
/tj-mode reproduce the double reminder first. if a cheap test can show it, use /tdd. then fix and rerun everything.
```

"If a cheap test can show it" leaves room to skip the test. A brittle test full of mocks proves less than a real command run.

### Fix a UI bug with visual proof

```text
/tj-mode the "send reminder" button stays disabled for overdue invoices. use /verify-ledger to show it on the demo tenant, fix it, and attach screenshots of the button before and after.
```

Naming the verify skill and the tenant tells the agent exactly where to look. You check the screenshots first and the diff second.

### Commit a working tree that mixes three changes

```text
/git-commit split this into separate commits
```

You get one Conventional Commit per logical change, staged hunk by hunk, plus a list of whatever is still uncommitted.

## Review

### Have several models attack a branch

```text
/challenge this branch. read-only. only real bugs or behavior changes, no style.
```

Both qualifiers matter. Read-only keeps the review from editing anything. The no-style rule keeps the Act on group short and serious.

### Check what a small change reaches

```text
/blast-radius of caching tax rates per request. prove the fact that makes it safe.
```

You learn what a symbol search would miss, and the key safety fact comes back either proven by running code or marked unproven with the reason.

### Review a whole folder

```text
/audit src/Dunning. rank what's wrong and what i can delete.
```

You get a ranked report with a concrete failing case for each finding, and no code changes. Fix the findings you choose as separate tasks.

### Run one check across many items

```text
/swarm render every invoice template in templates/invoices/ with the demo data. one worker per template, one report.
```

Each worker owns one template. You get a single `PASS`, `ISSUES`, or `BLOCKED` report instead of a dozen transcripts.

## Ship

### Get a PR to green without merging it

```text
/tj-mode babysit PR 418. get it merge-ready, i'll merge.
```

Conflicts, then threads, then CI, with fixes bundled into as few pushes as possible. It stops at merge-ready and the merge stays with you.

### Leave a task running overnight

```text
i'm off. keep going without stopping until every invoice fixture renders the same as before. log decisions so i can review in the morning.
```

Use this short form only when the chat already contains the task and its check. For a fresh task, write the four-part contract from [page 7](./07-overnight.md).

## Redirect a drifting run

Corrections fit in one line:

```text
the task was to reproduce. stop fixing.
```

```text
prove it works. i want the CLI output, not the test summary.
```

```text
noslop that reply and drop the long dashes
```

What usually works isn't more words but the right name. [Page 8](./08-principles.md) has the list.

## Get help or plainer words

```text
/rly
```

[`/rly`](../../skills/understand/rly/SKILL.md) rewrites the last reply in everyday words. It breaks up dense sentences, calls a small mechanism by its plain name instead of inflating it, replaces invented terms, and says what it actually thinks if the previous answer just agreed with you. It replies in whatever language you're writing.

```text
/tj-help how do i stop the agent from asking before every commit?
```

The reply is an explanation, one prompt you can paste, and a link to its source. It costs a short answer, not a run.

## The pitfalls

| Trap | Why it hurts | Instead |
| --- | --- | --- |
| Listing skills in the prompt | Your order replaces the playbook's, and steps fall out. | Give the goal and the constraints. Name a skill only when you disagree with one choice. |
| "Make it better" as the goal | A loop has nothing it can test. | A command or an output that can be right or wrong. |
| Opening with your guess at the cause | The search narrows to your guess. | Ask for the agent's reading first, then add your hunch. |
| Taking the first design | You get the model's first idea, whatever its quality. | Prototypes or `/architect`, then choose from evidence. |
| Reviewing a plan with no code | Reviewers invent risks that never happen. | Prototype the open questions, then review real code. |
| Requirements before shared terms | The PRD inherits the confusion. | `/interview` before `/create-prd`. |
| Several agents in one checkout | Files get overwritten and nobody knows who did what. | `local` with a worktree per writer, or `cloud`. |
| Looping before the checks exist | Unchecked work, produced faster. | A working verify skill first. |
| Reporting a number nobody examined | A cache or a skipped path can fake a gain. | Explain the Number before it's posted. |
| Correcting the same thing in every chat | Fixes one run, never the next. | A lint, type, or test in the repository. |
| `/arena` for coverage | It merges candidates. It doesn't cover slices. | `/swarm`. |
| Fixing every review comment | Bots and people both send noise. | Let `/challenge` and Babysit sort, then overrule where you disagree. |
| Using `auto` as if it were a model | It means "use the chat's model". | See [model roles](./01-setup.md#2-a-model-for-each-role). |
| Accepting "build passes" as done | Compiling isn't working. | Ask for the real output and expect it in the reply. |
| Waiting for the agent to merge | No playbook merges on its own. | Merge yourself, or ask explicitly and confirm when it pauses. |
| Not reading the Destination tuple | The push goes to `origin`, or to the alias in the project's PR remote rule. | Read it before the first push. Change the remote by committing that rule. |
| Writing `SKILL.md` freehand | Weak descriptions and frontmatter go unnoticed. | [`/create-skill`](./09-make-it-yours.md#author-a-focused-skill-with-create-skill). |

New to tjstack and starting on this page? Do [setup](./01-setup.md) and one real task first. The recipes are much easier to adapt once you've watched a playbook work.

Next: [Troubleshooting](./11-troubleshooting.md). Back to the [guide index](./README.md).
