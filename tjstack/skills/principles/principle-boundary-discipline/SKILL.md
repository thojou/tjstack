---
name: principle-boundary-discipline
description: "Apply when wiring validation, error handling, third-party libraries, or framework adapters. Concentrate guards at system boundaries (CLI, config, network, external APIs); trust data that has already crossed a boundary, wrap third-party APIs in one place, return errors with context instead of null, and keep business logic in pure functions."
disable-model-invocation: true
---

# Boundary Discipline

Place validation, type narrowing, and error handling at system boundaries. Trust domain values that have already been validated. Business logic lives in pure functions. The shell is thin and mechanical.

**Why:** Scattered validation is noisy, redundant, and gives a false sense of safety. Keep logic out of framework wiring so it can be tested without the framework.

**The pattern:**
- **At boundaries** (CLI args, config files, external APIs, network protocols): validate, return errors, handle defensively.
- **Inside the system:** domain values that the boundary already accepted, error propagation, no re-validation.
- **Across the boundary.** Expose domain concepts, not the boundary's private representation. Keep general-purpose mechanism inside and special-purpose policy at the edge.

**Applications:**

Validation and error handling:
- Validate config at parse time (the boundary), not inside business logic
- Parse raw data into domain values at the boundary
- Do not re-export transport, storage, framework, or wire types through the public surface
- No redundant nil checks deep in call chains if the boundary already validated

Errors:
- Raise or return an error that names the operation, a safe input identifier, and why it failed. Preserve the original cause without exposing credentials or private payloads.
- Define error types by what the caller does with them, not by where they came from. Translate a third-party library's many failure types into the one or two your caller can act on, at the wrapper.
- Do not return null or pass null. Use an empty collection only for a successful zero-item result, and a typed absence for a valid optional result per [Type System Discipline](../principle-type-system-discipline/SKILL.md). Never turn a failed operation into either value.
- Keep the error path out of the happy path. One function handles the failure, another does the work.
- Release owned resources on failure as well as success. Use the language's scoped cleanup construct, and propagate or translate a failure instead of logging it as success.

Third-party code:
- Confine a third-party API to one wrapper when it would otherwise spread across call sites. The wrapper exposes the interface your code wishes it had. This is a boundary, not a speculative layer, so [Minimize Reader Load](../principle-minimize-reader-load/SKILL.md) keeps it.
- Pin what you rely on in learning tests: small tests that call the library the way you use it. An upgrade that breaks an assumption fails there first.
- When the other side does not exist yet, write the interface you need, code against it, and adapt the real thing to it later. A fake proves the local contract only. Check the adapter against the real provider before claiming integration works.

Code organization:
- Business logic in pure functions with no framework dependencies
- Construct and wire dependencies at startup, in `main` or a composition root. Business code receives what it uses and never builds or looks up its own collaborators.
- Parse functions: pure transforms from raw bytes to domain state
- Prompt construction: structured state in, string out
- Scoring and assessment: pure transforms from state to results

**The tests:**
- "Has this value already been validated for this domain contract?" If yes, do not repeat the check.
- "Can this be a pure function that the shell just calls?" If yes, extract it.
- "Would swapping this library touch more than one file?" If yes, wrap it.
