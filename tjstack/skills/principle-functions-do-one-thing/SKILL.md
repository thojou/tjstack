---
name: principle-functions-do-one-thing
description: "Apply when writing or reviewing a function with mixed abstraction levels, behavior-selecting flags, unclear arguments, hidden effects, or hidden call-order requirements. It gives each function one job with explicit inputs and effects while preserving required atomic operations."
disable-model-invocation: true
---

# Functions Do One Thing

A function does one thing when you cannot extract another function from it whose name is more than a restatement of its body. Its name says that one thing, and its body works at one level of abstraction.

- **One level of abstraction per function.** Do not mix `chargeCustomer(order)` with string parsing and index arithmetic in the same body. Lift the detail into a named step, or push the policy up. Read top-down: each function is followed by the steps it calls, one level lower.
- **No behavior-selecting flags.** When a flag selects which operation runs, use separate named functions or a tagged variant per [Model the Domain](../principle-model-the-domain/SKILL.md). A boolean that is domain data does not by itself imply two jobs.
- **Keep arguments few.** Zero to two is normal, three needs a reason. Group arguments when they form one real concept. Do not move call-local inputs into mutable fields or globals to shorten a signature. Do not use an output argument where a return value works.
- **Separate commands from queries.** Keep observation separate from mutation when callers need them independently. Preserve atomic operations such as `setIfAbsent` that change state and return a result. Name the combined operation clearly. Splitting it into a check and an action can introduce a race per [Separate Before Serializing Shared State](../principle-separate-before-serializing-shared-state/SKILL.md).
- **No hidden side effects.** A function named `checkPassword` does not also start a session. If the effect is needed, name it or move it to the caller.
- **Make temporal coupling explicit.** If `b()` needs a result from `a()`, pass that result explicitly. For an inherent protocol such as initialize before read, expose the prerequisite and failure behavior in the contract. Do not invent a meaningless parameter just to force an order.
- **Extract to name, not to shrink.** Give a tangled condition or a magic number a name: `isEligibleForRefund(order)`, `MAX_RETRIES`. Extract a block when its name lifts the reader one level of abstraction. Do not extract a pass-through. A one-caller wrapper that only renames its body is a layer to collapse per [Minimize Reader Load](../principle-minimize-reader-load/SKILL.md).
- **Prefer positive conditions.** `if (isValid)` reads faster than `if (!isInvalid)`. Encapsulate a compound condition in a predicate whose name is positive.
- **Move behavior to its data.** A function that mostly reads another object's fields belongs on that object or next to its type.

**The test:** describe the function's job in one sentence. Unrelated steps are a split candidate. Keep a cohesive algorithm or required atomic operation together. If a split leaves a function whose body is one call with the same arguments, inline it.

Distinct from [Names Reveal Intent](../principle-names-reveal-intent/SKILL.md), which picks the words. This file decides where one function ends and the next begins.
