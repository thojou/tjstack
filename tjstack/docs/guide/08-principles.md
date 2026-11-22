# Steer with principle names

A principle in tjstack is a skill that holds exactly one engineering rule. There are 29. `/tj-mode` keeps an index of all of them. Each entry names the situation the principle applies to. At the start of a task, tj-mode loads the principles whose situation fits, together with the playbook. Playbook steps also name the principle that governs them, so a step can pull one in later. Whenever a principle changes a decision, the reply says which principle and which decision. It may cite only principles it has read in full in this session.

For you, the names work as shorthand. The agent already has the full rule behind each name, so a three-word phrase can redirect it more precisely than a paragraph of explanation.

## Steering in practice

The agent wants to add a fourth payment adapter next to three that are half-dead:

```text
subtract before you add. remove the unused adapters first, then decide what the new one needs.
```

The agent reports success because PHPUnit is green:

```text
prove it works. generate INV-1042 through the CLI and show me the PDF totals.
```

The arena runners all write their candidates into `src/Tax/`:

```text
separate before serializing shared state. each runner writes to its own directory, then we compare.
```

The third attempt at a flaky dunning test just failed:

```text
attack the premise. list what all three fixes took for granted, and test that first.
```

The names work because the rules behind them are concrete. Hold the agent to the second half as well: the reply should name the decision the rule changed. A principle mentioned with no decision attached was quoted, not applied.

If a principle isn't loaded in your chat yet, type it as a command, such as `/principle-prove-it-works`, and the agent reads it in full.

## The 29, briefly

**Core.** How much to build, and when to start over.

- [Laziness Protocol](../../skills/principles/principle-laziness-protocol/SKILL.md). Be lazy about the solution, never about the change. Before writing code, take the first rung of a reuse ladder that fully works: nothing, code the repository already has, the standard library, an installed dependency, one readable line, and only then new code. Reach every caller the change breaks, and never cut validation, error handling, security, or tests.
- [Foundational Thinking](../../skills/principles/principle-foundational-thinking/SKILL.md). Choose the data structures first. Good ones make the logic that follows easy.
- [Redesign from First Principles](../../skills/principles/principle-redesign-from-first-principles/SKILL.md). Treat a new requirement as if it had been known on day one, and shape the design around it instead of attaching it.
- [Attack the Premise](../../skills/principles/principle-attack-the-premise/SKILL.md). Two failed fixes with a shared assumption mean the assumption is the suspect. Check it before attempt three.
- [Subtract Before You Add](../../skills/principles/principle-subtract-before-you-add/SKILL.md). Clear out dead code, duplicate checks, and leftover stubs, then build on what remains.
- [Minimize Reader Load](../../skills/principles/principle-minimize-reader-load/SKILL.md). Count the hops and the hidden state a reader has to track, and cut both.
- [Early Return](../../skills/principles/principle-early-return/SKILL.md). Handle each case that ends a function in a guard clause at the top, and keep the main path last, at the outermost level.
- [Outcome-Oriented Execution](../../skills/principles/principle-outcome-oriented-execution/SKILL.md). In a planned rewrite, head for the end state. Don't build bridges you'll tear down a week later.
- [Experience First](../../skills/principles/principle-experience-first/SKILL.md). When the user's experience and the easy implementation disagree, the user wins.
- [Exhaust the Design Space](../../skills/principles/principle-exhaust-the-design-space/SKILL.md). For something without precedent, build two or three versions and compare them before choosing.
- [Build the Lever](../../skills/principles/principle-build-the-lever/SKILL.md). Write the script, codemod, or generator that does or checks the work. A reviewer can rerun a tool. They can't rerun your afternoon of manual edits.

**Architecture.** Where state, validation, and compatibility belong.

- [Model the Domain](../../skills/principles/principle-model-the-domain/SKILL.md). Rules that recur belong in a structure, like a state machine, a typed model, or a lookup table, instead of `if` statements spread across files.
- [Boundary Discipline](../../skills/principles/principle-boundary-discipline/SKILL.md). Parse all input where it enters, before the first side effect. Wrap each third-party API in one place, and let inner code rely on its types.
- [Compose Over Inherit](../../skills/principles/principle-compose-over-inherit/SKILL.md). Give a type its behaviors as collaborators behind small interfaces and combine them at construction, instead of writing a subclass for each mix. Where inheritance stays, the base class runs the steps and subclasses fill in only the hooks.
- [Fail Fast](../../skills/principles/principle-fail-fast/SKILL.md). At a broken invariant or a bad config value, stop with an error that names what broke. Check config at startup, and catch failures in one top-level handler per unit of work.
- [Type System Discipline](../../skills/principles/principle-type-system-discipline/SKILL.md). Design types so invalid states can't be constructed. Parse external data into those types at the boundary, and return the parsed value instead of a yes-or-no verdict.
- [Make Operations Idempotent](../../skills/principles/principle-make-operations-idempotent/SKILL.md). Running an operation again after a crash should land in the same state.
- [Migrate Callers Then Delete Legacy APIs](../../skills/principles/principle-migrate-callers-then-delete-legacy-apis/SKILL.md). Move every caller and remove the old API together, without a compatibility layer in between.
- [Separate Before Serializing Shared State](../../skills/principles/principle-separate-before-serializing-shared-state/SKILL.md). Give each writer its own copy first. Add locks only when a single writer is truly required.

**Code.** How one function or one name reads. Both are adapted from *Clean Code*.

- [Functions Do One Thing](../../skills/principles/principle-functions-do-one-thing/SKILL.md). One job and one level of abstraction per function, and no boolean parameter that switches it into a different operation.
- [Names Reveal Intent](../../skills/principles/principle-names-reveal-intent/SKILL.md). A name should tell why the thing exists and how to use it, so it needs no comment.

**Verification.** What counts as proof.

- [Prove It Works](../../skills/principles/principle-prove-it-works/SKILL.md). Check the actual output, not a stand-in for it.
- [Fix Root Causes](../../skills/principles/principle-fix-root-causes/SKILL.md). Reproduce, trace back to where things first went wrong, and fix there. A null check that hides a crash isn't a fix.
- [Sequence Work into Verifiable Units](../../skills/principles/principle-sequence-verifiable-units/SKILL.md). Break the work into small steps that each end in a check, and finish one before starting the next.
- [Test Behavior, Not Implementation](../../skills/principles/principle-test-behavior-not-implementation/SKILL.md). Assert what a caller can see. A test that would pass with every dependency returning nothing tests nothing.
- [Explain the Number](../../skills/principles/principle-explain-the-number/SKILL.md). Before trusting a measurement, find out what limits it and exclude everything else it might be measuring.

**Delegation.** Keeping parallel work manageable.

- [Guard the Context Window](../../skills/principles/principle-guard-the-context-window/SKILL.md). Let subagents read the big files and logs, and keep only their conclusions in the main chat.
- [Never Block on the Human](../../skills/principles/principle-never-block-on-the-human/SKILL.md). For anything reversible, do it and show the result rather than asking first.

**Meta.**

- [Encode Lessons in Structure](../../skills/principles/principle-encode-lessons-in-structure/SKILL.md). When the same advice comes up twice, make it a lint, check, or script. [Page 9](./09-make-it-yours.md#stop-correcting-the-same-mistake) applies this to a whole repository.

## Phrases that work

You don't need the exact names. Everyday wording reaches the same rules:

| What you see | What you say | Principle behind it |
| --- | --- | --- |
| A new interface with one implementation and one caller | "smallest change, no new abstraction" | Laziness Protocol |
| A null check wrapped around a crash | "fix the cause, not the symptom" | Fix Root Causes |
| "should work now" | "show it working on the real thing" | Prove It Works |
| Every collaborator in the test is mocked | "test what a caller sees" | Test Behavior, Not Implementation |
| `if ($invoice->status === ...)` in five files | "model the domain" | Model the Domain |
| "Shall I try X?" for something easy to undo | "just try it and show me" | Never Block on the Human |
| `render(bool $asPdf)` | "one function, one job" | Functions Do One Thing |
| The main path sits three `if` blocks deep | "guard clauses first" | Early Return |
| `EmailAndSmsNotifier extends EmailNotifier` | "compose, don't inherit" | Compose Over Inherit |
| A missing config value silently becomes `0` | "fail fast, name what's missing" | Fail Fast |
| A 10x speedup from a one-line change | "explain the number" | Explain the Number |

There's no need to learn the list. Skim it once. When you catch the agent making a mistake, come back and find the name that would have prevented it. You'll remember the ones you've used.

**Try it.** Take `/tj-mode`'s last reply and find each principle it mentions. Check whether the reply names the decision that principle changed. If one doesn't, ask: "what did that principle change?"

Next: [Make it yours](./09-make-it-yours.md).
