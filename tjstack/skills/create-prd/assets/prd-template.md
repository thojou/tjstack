# {Feature title}

> `{NNNN}-{feature-name}`, drafted {date}
>
> Sources: conversation, `docs/CONTEXT.md`, ADRs {ADR titles, or "none"}

## Problem statement

The problem the user faces, from the user's point of view.

## Solution

The solution, from the user's point of view.

## User stories

A long, numbered list. Cover every part of the feature. Each story has this form:

1. As a {actor}, I want {feature}, so that {benefit}.

## Implementation decisions

The decisions made so far. This can include:

- The modules to build or change.
- The interfaces of those modules that change.
- Technical clarifications from the developer.
- Architectural decisions. Cite ADRs by title, do not copy their text.
- Schema changes.
- API contracts.
- Specific interactions.

No file paths or code snippets. They go stale fast.

One exception. If a prototype produced a snippet that states a decision more precisely than prose can, such as a state machine, a reducer, a schema, or a type shape, inline it in that decision and say it came from a prototype. Keep only the decision-rich part.

## Testing decisions

- What makes a good test here. Test external behavior, not implementation details.
- Which modules get tested.
- Prior art, meaning similar tests already in the codebase.
- The seams where behavior is verified, and whether the user confirmed them.

## Out of scope

What this PRD does not cover.

## Further notes

Open questions, dependencies on other PRDs, missing glossary or ADR coverage, and the suggested next step.
