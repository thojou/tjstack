---
name: create-prd
description: "Turn what the conversation already settled, plus the project glossary and ADRs, into a product requirements document under docs/prd/. Synthesizes, does not interview. Use for /create-prd, 'write a PRD', 'turn this into requirements', or after an interview session when the idea should become a durable spec."
disable-model-invocation: true
---

# Create PRD

Turn what you already know into a PRD: this conversation, the project glossary, and the recorded decisions. Do not interview the user. Fill gaps by reading the repo. When the idea itself is still fuzzy, run the **interview** skill first.

## Where the documents live

| Document | Default path |
| --- | --- |
| Domain glossary | `docs/CONTEXT.md`, plus each context in `docs/CONTEXT-MAP.md` |
| Architecture decisions | `docs/adr/` |
| PRD output | `docs/prd/NNNN-feature-name.md` |

If the project already keeps these elsewhere, use those paths. If the user names a directory, use it.

## Steps

### 1. Gather sources

Read these before drafting.

| Source | What to take from it |
| --- | --- |
| This conversation | Problem, solution shape, decisions, constraints, implied user stories |
| `docs/CONTEXT.md` | Canonical terms. Use them throughout the PRD. |
| `docs/adr/` | Hard-to-reverse decisions. Cite them by title, never paste their bodies. |
| The repo | Current modules, existing seams, prior art for tests |

If the glossary or ADRs are missing, work from the conversation and the code, and note the gap under **Further notes**. When the conversation's words conflict with the glossary, use the glossary's term and note the mismatch.

### 2. Explore the code

If you have not read the code the feature touches, read it now. Check every claim the PRD makes about the current state. Respect the ADRs in that area.

### 3. Sketch the testing seams

Name where the behavior will be verified. Prefer an existing seam at the highest practical level: a module boundary, an API, a CLI command, a browser flow. Propose a new seam only when no existing one reaches the behavior, and also place it as high as possible. The **test-behavior-not-implementation** principle skill sets the bar.

When the user is in the session, show the numbered seam list and ask once whether it matches their expectations. Iterate only on requested changes. When the user is away, write the PRD with your seams and mark them unconfirmed under **Testing decisions**.

### 4. Write the PRD

Get the number from the **create-adr** skill's script. Do not count files yourself.

```bash
bash <this skill's directory>/../create-adr/scripts/next-id.sh docs/prd
```

The feature name is 2 to 5 lowercase hyphenated words, nouns over verbs. Write `docs/prd/<NNNN>-<feature-name>.md` from [assets/prd-template.md](assets/prd-template.md). The template owns the structure. Do not copy the glossary or the ADR list into the PRD. Use their terms and cite ADRs by title.

Run the **noslop** skill on the text before you commit it.

**Reply:** the PRD path, the seams and whether the user confirmed them, the gaps noted, and the next step. A single feature goes to the **Feature** playbook in tj-mode. Work that spans phases or several PRs goes to **Multi-phase plan**.
