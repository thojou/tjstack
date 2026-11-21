---
name: principle-early-return
description: "Apply when writing or reviewing a function with nested conditionals, an else after a return, or a main path buried inside if blocks. Put each case that ends the function in a guard clause at the top that exits at once, and leave the main path last at the outermost indentation level."
disable-model-invocation: true
---

# Early Return

Handle each case that ends the function first, in its own guard clause that returns, raises, `continue`s, or `break`s at once. The main path comes last, at the function's outermost indentation level, with no `else` around it.

**Why:** Each nested `if` is a condition the reader holds until its block closes. After a run of guards, the reader knows every exit has already fired and reads the main path with nothing pending.

- **Guard, then work.** Replace `if (cart) { if (cart.items.length > 0) { ...work... } else { return emptyTotal } } else { throw ... }` with one guard per exit and the work below them, unindented.
- **No `else` after an exit.** When the `if` branch exits, the `else` adds a level and nothing else. Drop it. In a loop, `continue` past the items that do not apply instead of wrapping the loop body in an `if`.
- **Guards come before the first side effect.** A check that can only run after part of the work has happened marks a step boundary. Split the function there per [Functions Do One Thing](../principle-functions-do-one-thing/SKILL.md).
- **A guard exits, it does not handle.** It returns the result the contract defines for that case, or raises or propagates the error. Recovery, retry, and error translation stay in another function, which keeps the error path out of the happy path per [Boundary Discipline](../principle-boundary-discipline/SKILL.md). A guard that grows a block of handling is a function to extract.
- **Guard only the cases the contract admits.** An empty cart, an event already processed, an optional value that is absent. Do not re-check a value a boundary already validated per [Boundary Discipline](../principle-boundary-discipline/SKILL.md). Do not add a guard that returns a default to hide a state that should never happen per [Fix Root Causes](../principle-fix-root-causes/SKILL.md). A guard never turns a failure into a value that looks like success. A state that should never happen raises per [Fail Fast](../principle-fail-fast/SKILL.md).
- **Guards are exits, not dispatch.** A ladder of `if (kind === A) return doA()` that picks which operation runs is a branch chain. Use a tagged variant or a table per [Model the Domain](../principle-model-the-domain/SKILL.md). If a guard checks a state the type could exclude, change the type per [Type System Discipline](../principle-type-system-discipline/SKILL.md).
- **Name why the function stops.** Guard on a positive predicate when the exit reason has one: `if (order.isPaid()) return`. Otherwise negate one positive predicate, `if (!isEligible(order)) return`. Never negate a negative name. This keeps the positive-condition rule in [Functions Do One Thing](../principle-functions-do-one-thing/SKILL.md).
- **Release resources with scope, not with a single exit.** Use the language's scoped cleanup construct (`finally`, `with`, `defer`, a destructor) so every return releases what the function owns. Do not thread a `result` variable through nested branches to reach one cleanup block.

**Stop:** do not rewrite an `if`/`else` whose two branches are both main results of equal weight, such as `return a > b ? a : b`. Neither branch is an exit.

**The test:** every `if` above the main path ends in `return`, `raise`, `continue`, or `break`, and the main path sits at the function's outermost level.

Distinct from [Functions Do One Thing](../principle-functions-do-one-thing/SKILL.md), which decides where one function ends and the next begins, and from [Minimize Reader Load](../principle-minimize-reader-load/SKILL.md), which counts layers and state across code. This file orders the branches inside one function.
