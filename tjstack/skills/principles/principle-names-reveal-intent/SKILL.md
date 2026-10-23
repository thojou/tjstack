---
name: principle-names-reveal-intent
description: "Apply when naming or renaming a variable, function, type, module, or file, or when a reviewer has to ask what a name means. Pick the name that answers why it exists, what it does, and how it is used, so no comment has to."
disable-model-invocation: true
---

# Names Reveal Intent

A name is the cheapest documentation the code has, and the only one that cannot drift. If a name needs a comment, a glossary, or a look at the implementation, rename it.

- **Say what it means, not what it is.** `elapsedDays` beats `d`. `activeAccounts` beats `list2`. A unit, a state, or a constraint the reader must know goes into the name: `timeoutMs`, `unpaidInvoices`, `sortedIds`.
- **Do not mislead.** A name that says `list` holds a list. A name that says `get` has no side effect. Two names that differ in one letter or one suffix do not mean unrelated things.
- **Make distinctions meaningful.** `data`, `info`, `item`, `manager`, `processor`, and number suffixes (`a1`, `a2`) add letters without adding meaning. If two names can be swapped without the reader noticing, one of them is wrong.
- **One word per concept, one concept per word.** Pick `fetch`, `get`, or `load` for one meaning and use it everywhere. Do not reuse the same word for two operations, such as `add` for both append and sum.
- **Use the domain's vocabulary.** Name problem concepts with the terms the users and specs use. Name mechanism with the standard engineering term (`Queue`, `Visitor`, `Cache`). Do not invent a third vocabulary.
- **Match length to scope.** A loop index can be `i`. A module-level constant needs a full, searchable name. The wider the scope, the longer and more specific the name.
- **No encodings.** No type prefixes, no Hungarian notation, no `I` or `Impl` that only restates the language's own marker. Let the type system carry the type.
- **Verbs for actions, nouns for things.** Functions and methods are verb phrases (`sendReceipt`). Types and values are noun phrases (`Receipt`). A boolean reads as a claim (`isExpired`, `hasRetries`).
- **Name the side effect.** A function that also writes, sends, or caches says so, or splits per [Functions Do One Thing](../principle-functions-do-one-thing/SKILL.md).

**The test:** read the call site alone. If the reader cannot predict what happens without opening the definition, the name is wrong.

**Stop:** a rename is a contract change. Find every usage, including strings, docs, config keys, and serialized data, before you call it done.

Distinct from [Type System Discipline](../principle-type-system-discipline/SKILL.md), which separates semantic primitives with types. This file chooses the words those types and values carry. Comment deletion belongs to the **clean-comments** skill.
