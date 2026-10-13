# Add a principle

A principle is one Cursor skill. Cursor discovers every `skills/<name>/SKILL.md` under the plugin. `.cursor-plugin/plugin.json` does not list skills.

Every principle sets `disable-model-invocation: true`. It loads when a playbook names it, or when the user names it. It does not load from its description alone.

## Check the list first

Read [Principles](#principles). If one skill already owns the trigger, cite that skill. Add a directory when no existing principle owns it.

## Create the skill

Create `skills/principle-<kebab-name>/SKILL.md` and nothing else. The directory name and the `name` field are the same string: lowercase letters, digits, and hyphens, at most 64 characters.

```markdown
---
name: principle-example-name
description: "Apply when <trigger>. <the action, in one or two sentences>."
disable-model-invocation: true
---

# Example Name

<the rule, as commands>

Distinct from [Nearest Principle](../principle-nearest/SKILL.md), which <what that skill owns>.
```

Write `description` in the third person. Start with `Apply when`, name the trigger, then the action. Quote the value. Stay under 1024 characters. Skill lists show this string on its own.

Give the body one `#` heading, the principle name in title case. Write the rule an agent would miss. Use **Why:**, **Pattern:**, or **Stop:** when a block needs a label. Add a `##` heading only when the file holds a second procedure. [Prove It Works](skills/principle-prove-it-works/SKILL.md) is that case.

When two principles meet, link the sibling and say which trigger belongs to which file.

## Cite it where it applies

Name the principle in the playbook at the moment it applies:

```markdown
per the **example-name** principle skill
```

Drop the `principle-` prefix inside the bold slug. The sentence states the rule. [figure-it-out](skills/figure-it-out/SKILL.md) reads each named principle in full before applying it. If that skill is not in the session, the sentence in the playbook is the rule, so the sentence has to hold on its own.

Playbooks that already cite principles:

- [architect](skills/architect/SKILL.md) and [architect/references/runner-prompt.md](skills/architect/references/runner-prompt.md)
- [arena](skills/arena/SKILL.md)
- [figure-it-out](skills/figure-it-out/SKILL.md)
- [retro](skills/retro/SKILL.md)
- [track-your-work](skills/track-your-work/SKILL.md)
- [tj-mode](skills/tj-mode/SKILL.md) playbooks [bug-fix](skills/tj-mode/playbooks/bug-fix.md), [feature](skills/tj-mode/playbooks/feature.md), and [refactoring](skills/tj-mode/playbooks/refactoring.md)

Inside another principle, link the file: `[Example Name](../principle-example-name/SKILL.md)`.

Add a bullet to [Principles](#principles) in the same change.

## Principles

24 skills. From `tjstack/`, regenerate the names with:

```bash
ls skills | grep '^principle-'
```

- [principle-attack-the-premise](skills/principle-attack-the-premise/SKILL.md). When two or more fixes that share one premise fail the same gate, write that premise down, count which actors hold the imbalance, and remove the assignment.
- [principle-boundary-discipline](skills/principle-boundary-discipline/SKILL.md). Put validation and error handling at the CLI, config, network, or external API. Trust data that has already crossed a boundary, and keep business logic in pure functions.
- [principle-build-the-lever](skills/principle-build-the-lever/SKILL.md). For a non-trivial edit, migration, analysis, or check, build the codemod, script, generator, or delegate skill that does the work or proves it.
- [principle-encode-lessons-in-structure](skills/principle-encode-lessons-in-structure/SKILL.md). When the same instruction or correction comes up again, encode it as a lint, metadata flag, runtime check, or script.
- [principle-exhaust-the-design-space](skills/principle-exhaust-the-design-space/SKILL.md). For a novel UI interaction, an architectural decision with no local precedent, or a product decision that depends on feel, build two or three prototypes and compare them before committing.
- [principle-experience-first](skills/principle-experience-first/SKILL.md). When implementation convenience conflicts with the person who uses the result, choose that experience and ship fewer polished features.
- [principle-explain-the-number](skills/principle-explain-the-number/SKILL.md). Before you trust a measured speedup, regression, throughput, latency, or eval result, name what limits it and rule out that the number measured something else.
- [principle-fix-root-causes](skills/principle-fix-root-causes/SKILL.md). When debugging, reproduce the symptom, ask why until you reach the cause, and fix it there.
- [principle-foundational-thinking](skills/principle-foundational-thinking/SKILL.md). Before writing logic, get the core data structures right, put shared scaffold before features, and ask what concurrent actors share.
- [principle-guard-the-context-window](skills/principle-guard-the-context-window/SKILL.md). When context fills with large outputs, long files, repeated reads, or fan-out, send the bulk to subagents and keep summaries in the main thread.
- [principle-laziness-protocol](skills/principle-laziness-protocol/SKILL.md). When refactoring or about to add a layer, put the decision in one place and make the smallest diff that solves the problem.
- [principle-make-operations-idempotent](skills/principle-make-operations-idempotent/SKILL.md). Design commands, lifecycle steps, and processing loops so a crash, restart, or retry still reaches the same end state.
- [principle-migrate-callers-then-delete-legacy-apis](skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md). When a new internal API replaces an old one, migrate the callers and delete the old API in the same wave.
- [principle-minimize-reader-load](skills/principle-minimize-reader-load/SKILL.md). When code is hard to trace, cut layers between the question and the answer, and cut state the reader has to hold.
- [principle-model-the-domain](skills/principle-model-the-domain/SKILL.md). When stateful logic branches a lot, or the same shape assumption repeats across files, encode the domain in one structure.
- [principle-never-block-on-the-human](skills/principle-never-block-on-the-human/SKILL.md). On reversible work, decide and proceed, then present the result. Ask first for irreversible actions. Product direction still comes from the human.
- [principle-outcome-oriented-execution](skills/principle-outcome-oriented-execution/SKILL.md). During a planned rewrite or migration, converge on the target architecture. Planned, scoped, reversible breakage between phase boundaries is acceptable.
- [principle-prove-it-works](skills/principle-prove-it-works/SKILL.md). Before you call a task done, check the real artifact. Run it, read the value, or inspect the diff. Prefer a script a reviewer can rerun.
- [principle-redesign-from-first-principles](skills/principle-redesign-from-first-principles/SKILL.md). When a new requirement lands on an existing design, redesign as if that requirement had been there from the start, then deliver the redesign in increments.
- [principle-separate-before-serializing-shared-state](skills/principle-separate-before-serializing-shared-state/SKILL.md). When concurrent actors might write the same file, branch, key, or object, give each actor its own state. Serialize only when one shared writer is a real invariant.
- [principle-sequence-verifiable-units](skills/principle-sequence-verifiable-units/SKILL.md). Break a sweep, migration, stack of commits, or stack of pull requests into units that each end in a state you check before the next unit starts.
- [principle-subtract-before-you-add](skills/principle-subtract-before-you-add/SKILL.md). Before an addition, refactor, or rewrite, remove dead code, redundant validators, and empty stubs, then build on what remains.
- [principle-test-behavior-not-implementation](skills/principle-test-behavior-not-implementation/SKILL.md). Call the code the way its users do and assert the observed result against a literal expected value. Rewrite or delete a test that would still pass if every dependency returned an empty or wrong value.
- [principle-type-system-discipline](skills/principle-type-system-discipline/SKILL.md). Make illegal states unrepresentable, separate semantic primitives, parse external data at the boundary, refuse unchecked coercions, handle every variant, and derive shapes from the schema that owns them.
