---
name: blast-radius
description: >-
  Find what a change can break outside the diff, and prove the one fact
  that makes it safe by running the real code. Use for "blast radius of X",
  "what could this break", or a small diff you do not trust yet.
disable-model-invocation: true
---

# Blast radius

Find what a change breaks somewhere else, before it ships.

Companion to `how` and `why`. `how` says what the code does. `why` says why it is shaped that way. This skill says what else the change reaches.

A caller list is not the result. Grep already returns that. The result is breakage a symbol search misses, and a run that shows the safety fact is true.

## Do not trust the writeup

A writeup that sounds right has the same shape when it is wrong. Find the one or two facts the change's safety depends on, and prove them by running code.

For each fact, go as far down this list as is cheap, and say where you stopped.

1. You asserted it.
2. You cited a real `file:line`, or the library's own source.
3. You walked the failing steps and showed they do not reach.
4. You ran a script or test that calls the real code and fails if the fact is wrong.
5. You reproduced it in the running app.

Step 4 is the usual bar: one small script that imports the library the app ships and calls the function you are worried about.

## Steps

1. Read the change. Read the diff, the symbols it adds, changes, and deletes, and what it now does that the diff does not spell out. Anchor it:

   ```bash
   git log --oneline -20 -- <file>
   git log -1 --format=%B <commit>
   gh pr view <number> --json title,body,mergedAt
   ```

   Take the PR number from a merge subject like `(#1234)` when one is there.

2. Find the one fact that makes it safe. A risky-looking change is often safe because of one fact, such as "this call only drops cache entries that are already dead". If that fact holds, most of the other cases are cleared. Spend the time here.

3. Look where grep stops. Read the source of the library you call. Check its pinned version and any local patch. Work out when the code runs: microtasks, unmount, teardown, and framework differences. Follow what a symbol search misses: JSON an API returns, a database column, a wire format, another language reading the same bytes, a feature flag, and code three hops downstream.

4. Score each risk. Give it a real chance of happening and a real cost if it does. Keep the risks you confirmed. List the ones you checked and cleared on their own. Cite a real `file:line`. A search that finds nothing is still an answer. Do not invent a caller or an API.

5. Prove the one fact. Write a script or test that runs the real code, run it, and paste what happened. If you cannot run it, mark the fact unproven and say what blocked the run.

6. When the change spans more than one package, or you are not sure the one fact covers it, spawn one extra reader before you write the answer. Read `spawn-subagent` first.
   - `subagent_type`: `generalPurpose`
   - role line: `blast-radius reader`
   - class: `claude-opus`, prefer no `-fast`, effort `xhigh` when the rule line is missing
   - Tell it not to create, edit, or delete files.
   - Give it the diff, the symbols, and this question: what does this break outside the diff?
   - Merge only risks it cites with a real `file:line` that you did not already have.

## What to hand back

Write the reply through `noslop`. Cite real code. Strip anything private before the text goes anywhere public.

- **What it does.** What changed, including the part the diff does not spell out.
- **The one fact that makes it safe.** State it, say which proof step you reached, and show the run. If you could not prove it, write unproven.
- **Risks.** Each one names how it breaks, the `file:line`, how likely, how bad, and how to check. Paste the run for the ones that matter.
- **Cleared.** What you checked, and why it is fine.
- **Before you merge.** The cheapest test or repro that catches the real bug, including the script you wrote.

**Reply:** that writeup, with the safety fact either proven or marked unproven.
