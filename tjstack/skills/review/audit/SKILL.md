---
name: audit
description: >-
  Audit a whole repository or a folder and report, ranked: bugs, security
  holes, what breaks at the expected load, risky code without a test, slow
  paths, and code to delete, reuse, merge, or split. Each finding names a
  concrete failing case. Changes no code. Use for /audit, "audit this
  codebase", "review the whole repo", "find bloat", or "what can I delete".
disable-model-invocation: true
---

# Audit

Audit the code like a new owner who gets paged when it breaks. Rank what you find in this order: correct, safe, holds at the expected load, tested, fast, lean. This skill reports. It edits no file in the repository.

The **challenge** and **blast-radius** skills review one change. This skill reviews what is already there.

## 1. Map first

- Audit what the user names: a folder, a package, or the repository. Nothing named means the whole repository.
- Read the README, the build and deploy config, the dependency list, the entry points (main, routes, handlers, jobs, CLI commands), and the tests.
- Find the expected load: one person running a script, or many users and processes at once. Judge scale against that load, and state the load you assumed.
- Trace the main flows end to end: where data comes in, what is stored, what goes out. Read these paths in full: user input, money, auth, data writes, background jobs, and state that processes share.
- Go deep where a mistake costs the most, not file by file. Record each part you did not read.
- When the map holds more subsystems than one context can read in full, partition them per the **swarm** skill, one worker per subsystem with this file as its brief. Merge the findings yourself, per the **principle-guard-the-context-window** skill.

## 2. Look for

1. **Bug.** A wrong result, a crash, a missed edge case (empty, zero, the last item, rounding, time zones), a caller that disagrees with what a function returns, or the same rule applied differently in two places.
2. **Risk.** Injection, weak randomness, secrets in code or logs, a missing check on user input, a swallowed error, writes in the wrong order, or a missing transaction.
3. **Scale.** Fine for one user, wrong for many: a check-then-write race, the same work done by every process, memory or a list that only grows, a query per item, quadratic work on large input, or per-process state that must be shared.
4. **Missing test.** Logic with a branch, a parser, money, security, or a data write, and no test that fails when it breaks, per the **principle-laziness-protocol** skill.
5. **Speed.** A large slowdown is a finding. A small win, such as work repeated in a hot loop, is a nice-to-have. Reading code cannot prove a slowdown, so mark it as needing a measurement per the **principle-explain-the-number** skill.
6. **Lean.** Code that should not exist or should be smaller.
   - Delete dead code, unused options, flags, and config, and speculative features, per the **principle-subtract-before-you-add** skill.
   - Reuse instead of keeping two helpers that do the same job. Keep one and name its path. Code that the standard library, the platform, or an installed dependency already does is a finding per the reuse ladder in the **principle-laziness-protocol** skill. So is a dependency that does what a few lines can do.
   - Collapse an interface with one implementation, a factory with one product, or a wrapper that only passes calls through, per the **principle-minimize-reader-load** skill. A wrapper that confines a third-party API is a boundary and stays, per the **principle-boundary-discipline** skill.
   - Merge near-copies that must change together.
   - Split a function that does several unrelated jobs, per the **principle-functions-do-one-thing** skill. Split by job, never by line count.

## 3. Check before you report

- Every finding needs a concrete case: this input or this situation leads to this wrong result. No case, no finding.
- Before you call code unused, grep the whole tree for it, including tests, fixtures, config, and string or dynamic references.
- Prove a Must-fix finding by running it when the run is cheap: a scratch script outside the repository that calls the real code and shows the wrong result. Paste the output. Otherwise mark the finding unproven.
- Propose the smallest fix that works. Prefer a fix that deletes code. Do not add layers, frameworks, or config the problem does not need.
- Drop style taste and vague worries.

## 4. Report

Write for a reader who may never have seen this code: short sentences, everyday words, and each technical term explained the first time you use it. Apply **noslop**.

Start with `What this repo does:` in two or three sentences, and the load you assumed.

Then give the findings in three groups, most important first. Skip an empty group.

- **Must fix.** A bug, a security hole, data loss, or a break at the expected load.
- **Should fix.** Risky code without a test, real slowness, duplication, a function that mixes jobs, or code that should not exist.
- **Nice to have.** Small speedups and shorter forms.

Number the findings across all groups, so the user can say "fix 2 and 5". Report at most 20. If you left smaller ones out, say how many. Each finding has four parts, each one or two sentences:

```markdown
2. **A failed import reports success** (`import/stock.py:31-44`)
   - **What this is:** The nightly job reads the supplier CSV and updates stock counts.
   - **Problem:** A row with an unknown SKU raises `KeyError`. The `except` logs it and moves on, and the job exits 0. Ten bad rows leave ten products at yesterday's count, and no alert fires.
   - **Fix:** Collect the bad rows and exit 1 when the list is not empty. The log line already has the row number.
   - **If we skip it:** The shop sells items it does not have until someone notices by hand.
```

End with these lines:

- `Verdict:` one line. Healthy, or what to fix first.
- `Lean:` the lines and dependencies the lean findings remove, counted from their line ranges. Leave it out when there is no lean finding.
- `Not checked:` the parts you did not read or could not run.

When nothing turns up, write `What this repo does:`, then `Healthy. Nothing to fix.` and one line on what you checked.

The skill ends at the report. The user picks findings by number. A bug then goes to the Bug fix playbook in tj-mode, a lean finding to Refactoring, and a slow path to Perf issue.

**Reply:** the report.
