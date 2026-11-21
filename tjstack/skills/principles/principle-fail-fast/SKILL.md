---
name: principle-fail-fast
description: "Apply when code meets a state it cannot handle: a broken invariant, a missing or bad config value, an unexpected variant, or a failure you are tempted to default, retry, or log past. Stop at that point with an error that says what broke and where, and catch failures in one top-level handler instead of along the way."
disable-model-invocation: true
---

# Fail Fast

When code reaches a state it was not written for, stop there and say so. A failure at the point of the problem points at the bug. A failure three modules later, or a wrong result with no failure at all, makes the next person trace the bad value back to its source. Source: Jim Shore, "Fail Fast", IEEE Software, 2004.

- **No silent fallback.** Do not replace a missing or invalid value with a default, an empty string, zero, or the last known value to keep going. Do not catch an error to log it and continue as if the operation worked. A documented default for an optional setting is a choice, not a fallback. A default for a required value hides the bug.
- **Fail at startup.** Read and check required config, credentials, and dependencies when the process starts, not on first use hours later. A bad value stops the process before it serves anything, with the key name and the reason.
- **Assert what your own code promises.** Use an assertion for a condition that only a bug in this code can break: an internal invariant, a postcondition of your own computation, a call-order requirement, an `else` that is unreachable. Leave assertions on in production when they are cheap.
- **Do not assert what a boundary or a type already guarantees.** Input from outside is checked once where it enters, per [Boundary Discipline](../principle-boundary-discipline/SKILL.md). A value the parser or the type already constrains needs no second check, per [Type System Discipline](../principle-type-system-discipline/SKILL.md). An assertion that a type could express is a sign to strengthen the type. An assertion guards your logic, not the data the boundary accepted.
- **Make the message point at the cause.** Name the operation, the value or key that failed, what was expected, and what arrived. "Assertion failed" and "invalid input" force a debugger session. Keep secrets out of the message.
- **Catch at the top.** One handler at the top of each unit of work (the request, the job, the command, the event loop) logs the failure with its context and ends that unit: an error response, a failed job, a nonzero exit. The process keeps serving other units when it can. Code below that handler propagates the error and does not catch it unless it can recover or add context.
- **An assertion that fires is a bug report.** Find why the state arose and fix it there, per [Fix Root Causes](../principle-fix-root-causes/SKILL.md). Do not delete the assertion or wrap it in a guard to make the crash go away.

**Stop:** reconciling a known, recoverable state is not a silent fallback. A stale lock whose PID is dead, or a half-written temp file from a crashed run, gets cleaned per [Make Operations Idempotent](../principle-make-operations-idempotent/SKILL.md). Fail on a state you cannot name.

Distinct from [Boundary Discipline](../principle-boundary-discipline/SKILL.md), which says where input is checked and how errors are shaped. This file says what code does when it meets a state it cannot handle, and where the failure is caught.
