---
name: interview
description: "Interview the user about an idea, one question at a time, against the project's domain model. Sharpens terms, records them in docs/CONTEXT.md as they lock, and offers ADRs for hard-to-reverse decisions. Use for /interview, 'grill me', 'sharpen this idea', brainstorming a new project or feature, or untangling overloaded domain language."
disable-model-invocation: true
---

# Interview

Interview the user about every part of the idea until you both understand it the same way. The idea can be a new project, a feature taking shape, or a change to an existing system. Walk each branch of the design tree and resolve the decisions one by one, dependencies first.

The output is shared language, not a plan. Terms go into the glossary as they lock. Hard-to-reverse decisions go into ADRs.

## Where the documents live

| Document | Default path |
| --- | --- |
| Domain glossary | `docs/CONTEXT.md` |
| Context map, multi-context only | `docs/CONTEXT-MAP.md` |
| Architecture decisions | `docs/adr/NNNN-slug.md` |

If the project already keeps a glossary or ADRs elsewhere, use those paths. If the user names a directory, use it. Create a file only when you have something to write in it.

## Steps

1. Read what exists. `docs/CONTEXT.md`, `docs/CONTEXT-MAP.md`, each nested `CONTEXT.md` the map lists, and the matching `adr/` directories. Skim the code the idea touches.
2. Ask one question with your recommended answer. Wait for the reply before the next question. Prefer AskQuestion when the answer is a pick from a few options.
3. When the code can answer a question, read the code instead of asking. State what you found. Ask a follow-up only if it is still ambiguous. Per the **principle-never-block-on-the-human** skill, the user answers preference and product calls, not facts you can look up.
4. Patch the glossary the moment a term locks. Do not batch it to the end. Read [references/context-format.md](references/context-format.md) before the first write.
5. Offer an ADR only when a decision passes all three criteria in the **create-adr** skill's [format reference](../create-adr/references/adr-format.md). On a yes, follow the **create-adr** skill.

## During the session

- **Glossary conflict.** A term the user uses differs from `docs/CONTEXT.md`. Say so at once and quote both meanings.
- **Fuzzy language.** One word covers two concepts. Propose a precise canonical term for each, per the **principle-model-the-domain** skill.
- **Scenarios.** Stress-test each relationship with a concrete edge case. "What happens to an open order when its customer is deleted?"
- **Code cross-check.** The user states how something works. Check it in the repo and name any contradiction.

## Ending

The session ends when the open branches are resolved or the user stops. If the user stops early, list the terms locked so far and the questions still open. Leave the open ones under **Flagged ambiguities** in the glossary.

**Reply:** the glossary path, the terms locked, the ADRs written, the questions still open, and the next step. Name the **create-prd** skill when the idea is ready to become requirements, and the **architect** skill when the open question is the code's shape.
