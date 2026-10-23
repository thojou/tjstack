# ADR format

ADRs live in `docs/adr/` with sequential numbers: `0001-slug.md`, `0002-slug.md`. The `scripts/next-id.sh` script in the **create-adr** skill prints the next number.

In a multi-context workspace, a decision that belongs to one context goes in that context's directory, such as `ordering/docs/adr/`. Workspace-wide decisions stay in `docs/adr/`.

## Template

```md
# {Short title of the decision}

{One to three sentences. The context, what we decided, and why.}
```

That is the whole format. An ADR can be one paragraph. The value is recording *that* a decision was made and *why*, not filling out sections.

## Optional sections

Add one only when it adds real value. Most ADRs need none.

- **Status** frontmatter (`proposed`, `accepted`, `deprecated`, `superseded by ADR-NNNN`). Useful when a decision is revisited.
- **Considered options.** Only when a rejected alternative is worth remembering.
- **Consequences.** Only when a downstream effect is not obvious.

## When to write an ADR

All three must hold.

1. **Hard to reverse.** Changing your mind later costs something real.
2. **Surprising without context.** A future reader looks at the code and asks why it was done this way.
3. **A real tradeoff.** There were real alternatives, and one was picked for specific reasons.

An easy-to-reverse decision needs no ADR. You just reverse it. An unsurprising one raises no question. With no real alternative, there is nothing to record beyond "we did the obvious thing".

### What qualifies

- **Architectural shape.** "We use a monorepo." "The write model is event-sourced, the read model is projected into Postgres."
- **Integration between contexts.** "Ordering and Billing talk through domain events, not synchronous HTTP."
- **Technology with lock-in.** Database, message bus, auth provider, deployment target. Not every library, only the ones that take a quarter to swap out.
- **Boundaries and ownership.** "The Customer context owns customer data. Other contexts reference it by ID only."
- **Deliberate deviations from the obvious path.** Anything where a reasonable reader would assume the opposite.
- **Constraints the code cannot show.** Compliance, partner API contracts, latency SLAs.
- **A non-obvious rejection.** Record the subtle reason so the same debate does not repeat in six months.

## Supersession

When a new ADR replaces an old one, keep the old file. Set its status to `superseded by ADR-NNNN` and name the old ADR in the new one.
