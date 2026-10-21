---
name: create-adr
description: "Record one architecture decision as a numbered ADR under docs/adr/, from the conversation, a diff, or other evidence. Use for /create-adr, 'record this decision', 'write an ADR', or a hard-to-reverse tradeoff that a future reader would question."
disable-model-invocation: true
---

# Create ADR

An ADR records that a decision was made and why. It does not restate the design. The format, the bar for writing one, and the multi-context layout live in [references/adr-format.md](references/adr-format.md). Read it before you write.

## Where ADRs live

The default is `docs/adr/` at the repo root. If the project already keeps ADRs elsewhere, such as `doc/adr/` or `docs/decisions/`, use that directory and its naming style. If the user names a directory, use it. In a multi-context workspace, a decision that belongs to one context goes in that context's `docs/adr/`. `docs/CONTEXT-MAP.md` lists the contexts.

Create the directory when the first ADR is written, not before.

## Steps

1. Name the one decision. Two decisions are two ADRs.
2. Check it against the three criteria in the format reference. If it fails one, say so and do not write the ADR. The obvious choice needs no record.
3. Read the existing ADRs in the target directory and `docs/CONTEXT.md` when present. Use the glossary's terms. If an earlier ADR covers the same ground, the new one supersedes it. Keep the old file and mark the link in both.
4. Gather the evidence: the conversation, the diff, a measurement, an issue. Prefer evidence from this project over general best practice.
5. Get the number from the script. Do not count files yourself.

   ```bash
   bash <this skill's directory>/scripts/next-id.sh docs/adr
   ```

6. Write `docs/adr/<NNNN>-<slug>.md`. The slug is 2 to 5 lowercase words, nouns over verbs. Start with the one-paragraph form. Add an optional section only when it earns its place.
7. A decision that is not settled gets `Status: proposed` and names the open question.
8. Run the **noslop** skill on the text before you commit it.

**Reply:** the path, the decision in one sentence, and any ADR it supersedes.
