---
name: principle-laziness-protocol
description: "Apply when refactoring, evaluating diff size, or tempted to add abstractions, layers, or signal threading. Bias toward deletion and the smallest change that solves the problem."
disable-model-invocation: true
---

# Laziness Protocol

- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind one source of truth and pass the result as a simple flag.
- **Minimize the diff.** Make the smallest change that solves the problem. Fewer lines beat "elegant" boilerplate.
- **Stop at simple.** A design is simple enough when, in this order of priority, the tests pass, the code states its intent, no piece of knowledge lives in two places, and no class, function, or layer remains that the first three do not need. An earlier rule wins a conflict with a later one.
