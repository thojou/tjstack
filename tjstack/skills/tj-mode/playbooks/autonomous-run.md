### Autonomous run

**You own the exit condition. Define done, then drive to it without stopping.**

1. State the exit condition as a checkable predicate before the first iteration (tests green, repro fixed, all N MRs open, verified, and pipeline green, pixel-diff zero). A merge is never part of it.
2. Wake with `/loop`, Cursor's built-in loop skill. It runs a monitored shell locally and a timer in cloud. An event to watch (a pipeline, a ref advancing) gets a watcher that wakes you, with a long heartbeat as fallback. No event gets a fixed heartbeat sized to when the result is worth re-checking.
3. Each iteration makes the smallest change the evidence justifies, verifies it against the predicate, commits it with the **git-commit** skill if it advanced, and discards what didn't help. Belt-and-suspenders that "might help" gets reverted. Spawn a delegated iteration per `spawn-subagent`.
   Sequence the work via the **sequence-verifiable-units** principle skill, verifying each unit before the next.
4. Mid-run discoveries are yours. Address broken skills, related bugs, flaky verifiers, review noise, tooling failures, orphaned follow-ups, and fixable drift yourself via tj-mode. Each out-of-band fix is its own MR through **Opening a PR**. Do not park reversible work for the human or use `AskQuestion`. Surface only irreversible actions, genuine product or preference calls no experiment can settle, or a real dead end. Return to the predicate after each side fix.
5. Checkpoint every iteration via the **track-your-work** skill, a row for what changed and whether the predicate moved.
6. Stop when the predicate is met. A plateau is not a stop. Pivot your approach past it. Surface a genuine dead end rather than spinning. Never relax the predicate or merge an MR to declare victory.

**Reply:** the exit condition, iterations run, commits and MR links, what was discarded, final predicate state.
