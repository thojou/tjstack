---
name: principle-laziness-protocol
description: "Apply when writing new code, refactoring, evaluating diff size, or tempted to add an abstraction, a dependency, a layer, or signal threading. Take the first rung of the reuse ladder that fully solves the problem, finish every place the change must reach, and never cut the safety floor."
disable-model-invocation: true
---

# Laziness Protocol

Be lazy about the solution, never about the change.

- **Climb the reuse ladder.** Before you write code, stop at the first rung that fully solves the problem:
  1. Nothing. Skip the feature, option, or flexibility nobody asked for, and name what you skipped in the reply.
  2. Code this repository already has: a helper, a component, a service, or a pattern. Call it the way its other callers do.
  3. The standard library or the platform, unless the project has its own version. A house component beats a native widget.
  4. A dependency the project already installs. Do not add a dependency for a few lines.
  5. One line a reader understands at a glance. A one-liner the reader has to decode is not short.
  6. Only then, the least new code that works.

  A rung holds only when it does the whole job: correct on the edge cases, and the experience the user needs per [Experience First](../principle-experience-first/SKILL.md). `email.utils.parseaddr` parses an address but accepts `@missing-local.com`, so it does not validate one. Between two options of the same size, take the one that is correct on the edge cases.
- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag.
- **Minimize the diff, never the reach.** Before you edit, list every place the change must reach: callers, tests, fixtures, config, and exports. The smallest change is the smallest one that reaches all of them. A diff that leaves a caller broken is unfinished, not small.
- **Keep the floor.** Never cut validation at a trust boundary, error handling that prevents data loss, a security check, accessibility, or anything the user asked for. Code you move or merge keeps its validation and error handling. New logic with a branch, a loop, a parser, money, security, or a data write leaves a test that fails when the logic breaks.
- **Stop at simple.** A design is simple enough when, in this order of priority, the tests pass, the code states its intent, no piece of knowledge lives in two places, and no class, function, or layer remains that the first three do not need. An earlier rule wins a conflict with a later one.

Distinct from [Subtract Before You Add](../principle-subtract-before-you-add/SKILL.md), which orders removal before construction. This file decides how much to build and where it comes from.
