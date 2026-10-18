---
name: principle-functions-do-one-thing
description: "Apply when writing or reviewing a function that is long, takes a boolean or many arguments, mixes high-level steps with low-level detail, or both changes state and returns an answer. Give each function one job at one level of abstraction, with explicit inputs and no hidden effects."
disable-model-invocation: true
---

# Functions Do One Thing

A function does one thing when you cannot extract another function from it whose name is more than a restatement of its body. Its name says that one thing, and its body works at one level of abstraction.

- **One level of abstraction per function.** Do not mix `chargeCustomer(order)` with string parsing and index arithmetic in the same body. Lift the detail into a named step, or push the policy up. Read top-down: each function is followed by the steps it calls, one level lower.
- **No flag arguments.** A boolean or mode parameter says the function does two things. Split it into two functions, or pass a value from a tagged variant per [Model the Domain](../principle-model-the-domain/SKILL.md).
- **Keep arguments few.** Zero to two is normal, three needs a reason. When several arguments travel together, they are a concept. Give it a type. Do not use an output argument where a return value works.
- **Separate commands from queries.** A function either changes state or answers a question. `setIfAbsent(key)` returning a boolean makes `if (set(...))` ambiguous. Split it into a check and an action, or name the combined operation for what it is.
- **No hidden side effects.** A function named `checkPassword` does not also start a session. If the effect is needed, name it or move it to the caller.
- **Make temporal coupling explicit.** If `b()` must run after `a()`, make `a()` return what `b()` needs. Then the order cannot be forgotten.
- **Extract to name, not to shrink.** Give a tangled condition or a magic number a name: `isEligibleForRefund(order)`, `MAX_RETRIES`. Extract a block when its name lifts the reader one level of abstraction. Do not extract a pass-through. A one-caller wrapper that only renames its body is a layer to collapse per [Minimize Reader Load](../principle-minimize-reader-load/SKILL.md).
- **Prefer positive conditions.** `if (isValid)` reads faster than `if (!isInvalid)`. Encapsulate a compound condition in a predicate whose name is positive.
- **Move behavior to its data.** A function that mostly reads another object's fields belongs on that object or next to its type.

**The test:** describe the function in one sentence without "and", "or", or "unless". If you can't, split it. Then check the opposite failure: if a split leaves a function whose body is one call with the same arguments, inline it.

Distinct from [Names Reveal Intent](../principle-names-reveal-intent/SKILL.md), which picks the words. This file decides where one function ends and the next begins.
