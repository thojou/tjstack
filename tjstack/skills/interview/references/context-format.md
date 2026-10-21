# CONTEXT format

`docs/CONTEXT.md` is the project's domain glossary. It records what things mean in this domain, not how they are built.

Create it when the first term locks.

## Rules

- **Glossary only.** No implementation details, file paths, library choices, or API shapes.
- **One canonical term per concept.** Give one precise definition. List confusing aliases under `_Avoid:_`.
- **Update inline.** Patch the file as each term locks. Do not batch to the end.
- **Flag ambiguity.** A meaning that is still open or contested goes under **Flagged ambiguities** until it is settled.

## Template

```md
# Context: <project or context name>

> Domain glossary. Implementation decisions belong in ADRs, not here.

## Language

### <Term>

**Definition:** <one or two sentences on what the term is>

_Avoid:_ <overloaded alias, and why it confuses>

## Relationships

- **<A> to <B>:** <how they relate, in plain domain language>

## Flagged ambiguities

- **<Term>:** <what is still unclear or contested>
```

| Section | Holds |
| --- | --- |
| **Language** | Canonical terms with definitions and `_Avoid:_` notes |
| **Relationships** | How concepts connect: ownership, lifecycle, cardinality |
| **Flagged ambiguities** | Open questions. Remove an entry when it is settled. |

Most entries are a short definition plus an optional `_Avoid:_` line. Keep the file scannable.

## Single and multiple contexts

Most projects have one context.

```
docs/
├── CONTEXT.md
└── adr/
    ├── 0001-event-sourced-orders.md
    └── 0002-postgres-for-write-model.md
```

A project with several bounded contexts gives each its own `docs/` directory, and the root keeps a map.

```
docs/
├── CONTEXT-MAP.md        lists each context and its docs path
├── CONTEXT.md            terms shared by the whole project
└── adr/
ordering/
└── docs/
    ├── CONTEXT.md
    └── adr/
billing/
└── docs/
    ├── CONTEXT.md
    └── adr/
```

`CONTEXT-MAP.md` has one line per context, such as `ordering: ordering/docs/`. Create it when the second context appears.

## What does not belong here

- Stack, frameworks, deployment, schema design.
- Phase plans, acceptance criteria, task lists. Those go in a PRD from the **create-prd** skill.
- Decisions and their reasons. Those go in an ADR from the **adr** skill.

## Conflicting contexts

When two context glossaries define the same term differently, show the user both definitions. Ask whether the meaning is project-wide or local to each context. Never merge or overwrite one silently.
