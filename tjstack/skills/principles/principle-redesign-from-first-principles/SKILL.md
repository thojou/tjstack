---
name: principle-redesign-from-first-principles
description: "Apply when integrating a new requirement into an existing design. Redesign inside the project's conventions. A convention changes everywhere or nowhere."
disable-model-invocation: true
---

# Redesign From First Principles

When integrating a change, don't bolt it onto the existing design. Redesign as if the requirement had been a foundational assumption from the start.

- Read all affected files and understand the current design
- Ask: "if we were writing this from scratch with this new requirement, what would we build?"
- Propagate the change through every reference: types, docs, examples, rationale sections
- Think about the whole redesign, then deliver it incrementally
- **Redesign the feature, follow the frame.** The project's documented guidelines, ADRs, and patterns that repeat across the code are the frame. Redesign how the requirement fits inside it. Build new code the way its neighbours are built
- **A convention changes everywhere or nowhere.** When a convention blocks the right design, do not write a one-off variant. Propose the new convention with the **create-adr** skill and migrate every caller per the **migrate-callers-then-delete-legacy-apis** principle skill. Two patterns for one job is the failure this rule prevents
- **No frame yet** (no guidelines, competing variants for one job): pick the best existing variant or design one, record it with the **create-adr** skill, and it becomes the frame the next change follows

This is the method for preserving option value when integrating changes into an existing design.
