---
name: principle-type-system-discipline
description: "Apply when designing data shapes, reviewing a function signature, or accepting external data. Make illegal states unrepresentable, distinguish semantic primitives, parse external data at boundaries, refuse unchecked coercions, handle every variant, and derive shapes from the schema that owns them."
disable-model-invocation: true
---

# Type System Discipline

Reject impossible states, mismatched primitives, and unhandled variants in the shape itself. Prefer defining errors and special cases out of existence over proliferating handlers.

- **Make illegal states unrepresentable.** Model variants as a sum type (a tagged variant), not as optional fields that admit contradictory combinations. A completed flag plus an optional timestamp allows completed with no time. Derive the flag from the timestamp, or model two variants: open, and done with a time. If a comment is needed to say when a field combination is valid, split it into a sum type.
- **Types are constructions, not restrictions.** Build the type from the values you want. A non-empty list is a head plus a rest. A valid time range is a start plus a duration. Choose the shape that cannot build the illegal value, and expose the interface callers need on top.
- **Distinguish semantic primitives.** `UserId` and `OrderId` must not be interchangeable. Give each its own type or constructor. Validate once at creation, then trust it. If two arguments share a primitive but mean different things, separate them.
- **External data is untyped until parsed.** RPC, JSON, IPC, CLI, config, env, database rows. Parse at every boundary that turns unstructured input into the model. [boundary-discipline](../principle-boundary-discipline/SKILL.md) says where validation belongs.
- **Return the evidence, not a verdict.** A check that returns `bool` or nothing is a validator. The caller learns the fact and loses it, so the next function checks again or assumes. Return the refined value instead: `parseEmail(raw) -> Email`, not `isValidEmail(raw) -> bool`. Treat a function whose only result is success or unit with suspicion. It either performs an effect or throws a fact away.
- **Don't lie to the checker or the parser.** Casts, unsafe coercions, and assertions that skip the check are latent crashes. If the language has a static checker, trace each escape hatch to the boundary and validate there. If it does not, the constructor or parser is the only check; do not scatter later assertions that assume it.
- **Exhaustive handling.** Adding a variant must force every handler to notice. Use the language's idiom when it has one (compiler exhaustiveness). When it does not, one registry or one match function owns the variants so a missing case fails in one place.
- **Derive shapes from authoritative schemas.** When a protocol buffer, OpenAPI spec, GraphQL schema, database migration, or design-token file owns a shape, derive from it instead of hand-rolling a parallel one. See [encode-lessons-in-structure](../principle-encode-lessons-in-structure/SKILL.md).
- **Strengthen a shape only where partiality appears.** A runtime "this should never happen" marks a shape that is too weak. Push that check into the shape, then stop. `sum` of an empty list is 0, so it takes the plain list. `head` of an empty list has no answer, so it demands the non-empty one. If nothing would otherwise fail, keep the plain shape.
