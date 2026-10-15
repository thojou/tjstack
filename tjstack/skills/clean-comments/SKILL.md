---
name: clean-comments
description: >-
  Spawn Comment Cleaner, delete comments the code can carry itself, fix
  accepted findings, and offer a structural encoding for a constraint the
  code cannot express. Use for /clean-comments.
disable-model-invocation: true
---

# Clean comments

Spawn Comment Cleaner. Act on accepted findings.

Defer to Comment Cleaner's fresh perspective.

Before the spawn below, read and follow the `spawn-subagent` skill.

## Scope

Use the caller's files or diff. Otherwise use the current diff against the base branch, default `main`, including the working tree.

## Steps

1. Spawn `Task` with `subagent_type: "comment-cleaner"`.
   - role line: `clean-comments reviewer`
   - class: `claude-opus`, prefer no `-fast`, effort `xhigh` when the rule line is missing
   Pass the scope. Do not restate its rules.
2. Inspect its report and diff. Reject application-code edits, scope escapes, exception-protected deletions, misstated `MUST KILL` reasons, and flags that treat kept intentional code as guilty. A keep of a stale, redundant, nonlocal, or non-adjacent comment is a misstated keep. Reshape flags on our-code surprises stay actionable. Do not restore those comments. A keep survives only with proof it is about something we cannot change, and that the comment still matches the adjacent code. Audit missed scoped suppressions of a linter, compiler, or static analyzer. A suppression of a correctness or safety check stays an actionable `MUST KILL`. Restore a deletion only with an exact keep-list exception and scoped proof. Before accepting a thin `IMPORTANT` or `do not remove` kill or keep, run the `how` or `why` skill on its symbol. If a kill is ambiguous, do not restore it. If a keep is refuted or still ambiguous, delete it. Revert and rerun one rejected report with the failure named. Reject a second, report it open, and fail `/clean-comments`.
3. Fix a trivial accepted flag directly. Delete a dead path, drop a parameter, use the real API, or replace the comment with a name that says the same thing. When the tool already has a skip, ignore, or deprecated marker, put the reason there. If any fix needs a new shape, sketch the signatures and boundaries once for the accepted set and the surrounding code. Stop at the sketch. Step 4 implements it.
4. Implement the smallest root-cause fix in scope. Remove every named workaround. If the root cause is out of scope, land the smallest in-scope fix and report the rest open. Do not widen the fence. Do not fix instances outside it. Do not add a guard that hides the symptom.
5. A constraint comment says `do not remove`, `do not change wording`, or `talk to X before changing`. Leave a keep about something we cannot change. Offer the cheapest in-scope encoding: a type, a name, a runtime check, a test, or a CI lint. Wait for interactive approval. An unattended run or an eval needs the caller's pre-approval. If approved, encode the constraint, then delete the comment. Otherwise delete the comment, report the constraint open, and sketch the out-of-scope work.
6. Report the deletion count, restored comments, reruns, the sketch, fixes, encoding offers, encodings, unenforced constraints, and other open work.
