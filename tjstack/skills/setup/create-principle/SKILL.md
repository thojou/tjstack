---
name: create-principle
description: "Write one principle as skills/principles/principle-<name>/SKILL.md, in the form the existing principles use. Use for /create-principle, \"add a principle\", or when a rule should load only when a playbook or the user names it."
disable-model-invocation: true
---

# Create a principle

A principle is one skill in `skills/principles/`. Both plugin manifests list `./skills/principles/` as a skill directory, so a new principle needs no manifest change.

Every principle sets `disable-model-invocation: true`. It loads when a playbook names it, or when the user names it. It does not load from its description alone.

## Check first

From the plugin root (`tjstack/`):

```bash
ls skills/principles
```

Read the description of each skill whose trigger might overlap. If one already owns the trigger, cite that skill and stop. Add a directory when no existing principle owns it.

Then read the principles your rule could contradict, not only the ones that share its trigger. A rule to cut code meets the ones that keep validation, types, tests, and boundaries. Resolve each contradiction in the text, or drop the rule. A new rule often fights an old one.

## Write the file

Create `skills/principles/principle-<kebab-name>/SKILL.md` and nothing else. The directory name and the `name` field are the same string: lowercase letters, digits, and hyphens, at most 64 characters.

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

Give the body one `#` heading, the principle name in title case. Write the rule an agent would miss. Use **Why:**, **Pattern:**, or **Stop:** when a block needs a label. Add a `##` heading only when the file holds a second procedure. [Prove It Works](../../principles/principle-prove-it-works/SKILL.md) is that case.

When two principles meet, link the sibling and say which trigger belongs to which file.

Run the **noslop** skill on the text.

## Cite it where it applies

Name the principle in the playbook at the moment it applies:

```markdown
per the **example-name** principle skill
```

Drop the `principle-` prefix inside the bold slug. The sentence states the rule. [figure-it-out](../../orchestrate/figure-it-out/SKILL.md) reads each named principle in full before applying it. If that skill is not in the session, the sentence in the playbook is the rule, so the sentence has to hold on its own.

Inside another principle, link the file: `[Example Name](../principle-example-name/SKILL.md)`.

**Reply:** the path, the trigger in one sentence, and any existing principle that almost owned it.
