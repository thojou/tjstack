# Learning record format

Learning records live in `learning-records/` as `0001-slug.md`, `0002-slug.md`, and so on. The **create-adr** skill's `scripts/next-id.sh` prints the next number.

They are the teaching equivalent of ADRs. They capture non-obvious lessons, key insights, and stated prior knowledge that steer later sessions. Together they mark the user's zone of proximal development.

On a returning session, read the highest-numbered record first. It sets the floor for what the user already understands.

## Template

```md
# {Short title of what was learned or established}

{One to three sentences. What was learned, or what prior knowledge was established, and why it matters for later sessions.}
```

That is the whole format. A record can be one paragraph. The value is recording *that* this is now known and *why* it changes what to teach next.

## Optional sections

Add one only when it adds real value.

- **Status** frontmatter (`active`, `superseded by LR-NNNN`). Useful when an earlier understanding turns out wrong.
- **Evidence.** How the user showed the understanding: a question answered, an exercise solved, prior experience cited.
- **Implications.** What this unlocks or rules out for later sessions, when that is not obvious.

## When to write one

Write a record when any of these holds.

1. **The user showed real understanding of something non-trivial.** Not exposure. Evidence they can use the concept correctly. This raises the floor for what to teach next.
2. **The user disclosed prior knowledge.** "I already know X." Record it and the depth claimed, so no later session reteaches it.
3. **A misconception was corrected.** The user believed something wrong and now sees why. These predict stumbling blocks in related topics.
4. **The mission shifted.** The user found they care about something else. Update `MISSION.md` and link it.

### What does not qualify

- Material that was only covered. Coverage is not learning. Wait for evidence.
- A term already captured in `GLOSSARY.md`. Do not duplicate it.
- A session log. Learning records are decision-grade insights, not a journal.

## Supersession

When a later record contradicts an earlier one, mark the old record `Status: superseded by LR-NNNN`. Do not delete it. How the understanding changed is itself useful signal.
