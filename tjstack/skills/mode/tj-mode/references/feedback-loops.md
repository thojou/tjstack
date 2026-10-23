# Feedback loops for a bug

The loop is the fix's foundation. Without a pass or fail signal for the bug, every hypothesis is a guess. Build the loop before you form a single hypothesis.

## Pick a loop type

Try them roughly in this order. Take the first one that reaches the bug.

1. A failing test at the seam that reaches the bug.
2. A curl or HTTP script against a running dev server.
3. A CLI run with fixture input, its stdout diffed against a known-good output.
4. A headless browser script with DOM, console, and network assertions.
5. A captured trace replayed through the code path in isolation.
6. A throwaway harness that calls one function with the minimal subset of state.
7. A property or fuzz loop, for intermittent wrong output.
8. A bisection harness, when the bug appeared between two known states.
9. A differential loop that runs the same input through the old and new versions and diffs the outputs.

## Sharpen it

- **Faster.** A loop you can run a hundred times beats one you run twice.
- **Sharper.** Assert the specific symptom the user reported, not a nearby failure.
- **Deterministic.** Pin time, seed the RNG, isolate the filesystem.
- **Flaky bugs.** Raise the reproduction rate until it is debuggable. Loop it a hundred times, run in parallel, add load.

The loop counts as a reproduction only when it fails with the user-described symptom, across runs or at a known flake rate. Capture that symptom verbatim. Step 4 compares against it.

Keep a loop script outside the production tree unless it becomes the regression test.
