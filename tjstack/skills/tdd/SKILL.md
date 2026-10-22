---
name: tdd
description: "Drive a feature, behavior change, or bug fix test-first: write one failing test, watch it fail for the right reason, write the minimal code to pass, refactor while green, repeat. Use for /tdd, 'TDD this', 'write a failing test first', 'add a regression test', or a bug with a cheap local test path. Falls back to the closest executable check when a test would be expensive, brittle, or unclear."
disable-model-invocation: true
---

# TDD

Only a test that has been red can show it guards anything. Turn the intended behavior into an executable check, see it go red, then make it green with the smallest change.

## Gate: is there a cheap test path?

Before the first test, find the narrowest executable check the codebase already uses for that code path: a unit, component, integration, or regression test. Use the existing runner and the nearest existing test file.

Run the full cycle when that path is cheap and local. Skip a new test when it would need broad harness setup, mostly mocks, slow end-to-end infrastructure, production-only state, vague reproduction steps, or large unrelated fixture churn. Then use the closest executable check instead: a targeted script, a reproduction command, browser automation, a snapshot comparison, or a log assertion. Prefer no new test over a bad test.

Throwaway prototypes, generated code, and plain configuration are out of scope. A prototype goes to the **prototype** skill.

## The cycle

### 1. Red: write one failing test

State the intended behavior and the smallest observable case that shows it. For a bug, that is the reproduction. One test covers one behavior. A test name that joins two claims is two tests.

Call the code the way its users do and assert the literal result they observe, per the **test-behavior-not-implementation** principle skill. Design the call from the caller's side first. If the test is awkward to write, the interface is awkward to use: change the interface, not the test.

Use real code. Mock only a slow or external boundary, and only after you know which side effects the test depends on. Read [references/testing-anti-patterns.md](references/testing-anti-patterns.md) before adding a mock, a test double, or a test helper.

### 2. Verify red: watch it fail

Mandatory. Run only the new test and read the output.

- An assertion fails. A crash before the assertion, such as a syntax error, a missing import, or a broken fixture, does not count. Repair it and run again.
- The assertion message matches the behavior you are about to add.
- Nothing else explains the failure: no misspelled name, wrong path, or stale build.

A test that is green on its first run either covers behavior that already exists or checks the wrong thing. Correct the test before touching production code.

**Code already written?** Code that came before its test is unverified, not wrong. Stash or revert the production change, run the test, and confirm it fails for the intended reason. Then restore the change and continue at step 4. Never adjust a test until it passes against code you have not seen it fail without.

### 3. Green: write the minimal code

Write the simplest production change that makes the test pass. No options, parameters, or abstractions the test does not demand, per the **laziness-protocol** principle skill. For a bug, fix the root cause, not the symptom, per the **fix-root-causes** principle skill.

Do not refactor other code or add features in this step.

### 4. Verify green: watch it pass

Mandatory. Rerun the new test, then the project's whole test command (`npm test`, `pytest`, `cargo test`, whatever the repo uses), even when the task named one file. A green test file is not a green suite.

- The new test passes.
- Every other test still passes.
- The output is clean: no new errors, warnings, or skipped tests.

If the new test fails, fix the code, not the test. If another test fails, fix it now. A failure you did not cause still goes in the reply by name.

### 5. Refactor while green

Only after green: remove duplication, improve names, extract helpers. Rerun after each change. Add no behavior. Behavior comes from the next failing test.

### 6. Next test

Pick the next behavior, edge case, or error path and return to step 1. One behavior per loop keeps every failure local, per the **sequence-verifiable-units** principle skill.

## Guardrails

- Never change a test to match a wrong implementation.
- Never weaken an existing assertion unless the expected behavior has changed and you can say why.
- Never skip, disable, or quarantine a test to get green.
- Keep a regression test focused on its bug. Add sibling coverage for a broader failure class after the focused test lands.
- For a flaky bug, make the test deterministic where you can, and name the signal it locks down.
- Never add a method to production code that only tests call. Put it in a test utility.
- Commit so the failing test lands before the fix, or with it in one commit. The history then shows red before green.

## Excuses to catch

Each of these sends you back to step 1.

| Excuse | Answer |
|---|---|
| "This is trivial." | Trivial code still regresses, and its test is the cheapest one you will write today. |
| "I'll add the test once it works." | A test written against finished code goes green on the first run, so it never showed it can fail. It records what the code does, not what it should do. |
| "I clicked through it already." | A manual run leaves nothing a reviewer or the next change can replay. |
| "I have to explore first." | Fine. Then stash or discard the spike and start the cycle from red. |
| "It was green right away, nice." | That is the warning sign, not the reward. Break the behavior and watch the test notice. |
| "Mocking it is quicker." | A mock-heavy test checks your mock. Keep the substitute at the outer boundary. |
| "This case is special." | Write down which gate condition it meets. If none, run the cycle. |

## When stuck

| Symptom | Next move |
|---|---|
| No idea how to test it | Start from the assertion you want to read, then write the call that would make it true. |
| The test is long and tangled | The code under test does too much. Split it or narrow its inputs. |
| Every collaborator needs a fake | Dependencies are hard-wired. Pass them in at the boundary. |
| Setup dwarfs the assertion | Move the setup into a builder or fixture. If it stays large, the design is the problem. |

## Reply

Report the evidence, not only the outcome, per the **prove-it-works** principle skill:

- The failing-before test or check, and the failure it produced, pasted verbatim.
- The passing-after run, and the nearby suites you also ran.
- If you could not show failing-before evidence, say why and name the closest check you used instead.
