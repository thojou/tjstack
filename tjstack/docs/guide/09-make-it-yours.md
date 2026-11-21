# Make it yours

`tj-mode` encodes one engineer's habits. The machinery under it (playbooks, routing, model roles) doesn't depend on those habits, so you can put your own on top. This page covers a personal mode, a retro after a hard session, fixing recurring mistakes at the source, writing skills and principles, and producing finished documents.

Grow it slowly. You don't need many skills to start, and you don't need all of tjstack. Watch where agents go wrong, and add a check or a skill once a mistake has happened twice.

## Draft your own mode with `/customize-my-mode`

```text
/customize-my-mode
```

[`/customize-my-mode`](../../skills/mode/customize-my-mode/SKILL.md) starts from your history rather than a questionnaire. Several miners go through your chats in the current workspace, by default from the past two to four weeks, looking for preferences you've shown repeatedly: reply length and format, how you delegate, what you accept as done, code and writing style, and how you commit and open PRs. A pattern counts only if it shows up in at least two separate slices of history. Then it asks one or two multiple-choice questions to cover what the history didn't show.

The draft is a `<your-name>-mode` skill, built with the **create-skill** skill and cleaned with `/noslop`. You'll go back and forth a few times. Trim aggressively, since a mode is a set of rules and not a handbook. If the skill lives in a repository, it goes through Opening a PR like any change.

Habits change, so update it from time to time:

```text
/customize-my-mode refresh my mode from everything since you last changed it
```

An update only reads history newer than the skill's last edit. Rules you haven't contradicted stay. Rules with new evidence get revised, and only genuinely new patterns get new sections.

## Learn from a session with `/retro`

Right after a session that went badly, or surprisingly well:

```text
/retro the VAT bug took three rounds. what should change so it takes one?
```

[`/retro`](../../skills/session/retro/SKILL.md) gives the session's transcript to three reviewers at once. One looks at decisions, one at tools and skills, and one looks for anything the other two would miss. A synthesizer sorts their suggestions into accepted, rejected, and backlog, checking their citations along the way.

You get a report and nothing else: no skill, rule, or code is edited. Each finding has a type:

| Type | Meaning |
| --- | --- |
| Skill gap | A skill used in this session needs a change in its body. |
| Missed trigger | A skill should have loaded and didn't, so its description needs work. |
| New skill | A recurring workflow that no skill covers yet. |
| Structural | Better enforced by a lint, script, or check than by text. Goes to the backlog with the mechanism named. |

Adopt a finding only if it would lead to a different decision next time. A single odd session isn't a pattern. To adopt one, ask for it separately, for example "apply the second skill gap from the retro".

## Stop correcting the same mistake

If you keep telling agents the same thing, put the fix in the repository. [Encode Lessons in Structure](../../skills/principles/principle-encode-lessons-in-structure/SKILL.md) orders the options from strongest to weakest:

1. The design makes the mistake impossible.
2. Types, a lint, or a CI check reject it, with an error message that says what to do instead.
3. A test catches it.
4. A written rule asks agents not to do it. Nothing enforces a written rule, so this is the last resort.

"A reviewer will catch it" isn't an option on the list. If a reviewer has to catch the same thing every week, the repository is what needs fixing. Ask for the strongest level that works, and for proof that the check would have caught a real past case:

```text
/tj-mode agents keep calling PDO directly instead of the repositories. enforce it with a lint or a type, not a doc, and show it failing on commit <sha> where it happened.
```

`/retro` feeds this directly. Its structural findings are exactly the candidates.

## Author a focused skill with `/create-skill`

When you know the procedure you want written down:

```text
/create-skill a skill for checking Ledger's database migrations before they merge
```

[`/create-skill`](../../skills/setup/create-skill/SKILL.md) only asks what it can't figure out: the cases it must cover, where the skill should live, and which phrases should trigger it. It drafts `SKILL.md` and any extra files with `/technical-writing`, runs `/noslop` over all of it, and reviews the result with you.

It holds every skill to a few rules:

- **The description decides when the skill loads.** It's all an agent sees when choosing. Sentence one says what the skill does. Sentence two starts with "Use when" and lists the command and trigger phrases.
- **Explicit loading by default.** `disable-model-invocation: true` stays unless the skill must load without being named.
- **Only what a capable agent wouldn't already do.** Generic advice is noise. Project-specific steps, gates, and facts are the content.
- **Layered files.** Anything every run needs is in `SKILL.md`. Long references, templates, and scripts go in side files that `SKILL.md` points to.
- **Rules you can check.** Each rule is an action the agent can take and you can verify, such as "grep every caller of the function you touch". Before it adds a rule, it reads the rules next to it and resolves any contradiction. A rule that keeps failing gets encoded in structure, not answered with a counter-rule.

Project skills go in `.cursor/skills/<name>/` and personal ones in `~/.cursor/skills/<name>/`, or the `.claude/` equivalents in Claude Code. A skill for tjstack itself goes in `tjstack/skills/<category>/<name>/`. Add it to the repository README's skill list and to the [skill reference](../reference/skills.md), then run `python3 scripts/check-skills.py`.

Two special kinds of skill come from dedicated generators. A skill that operates your app to prove behavior comes from [`/create-verification-skill`](./06-verify-and-ship.md#create-a-project-verification-skill). A skill that teaches `/why` to search an MCP server comes from [`/create-source-playbook`](./01-setup.md#connect-evidence-sources-with-setup-source).

## Add a principle with `/create-principle`

```text
/create-principle when to add a database index, and when not to
```

[`/create-principle`](../../skills/setup/create-principle/SKILL.md) first checks whether an existing principle already covers the trigger, and stops if so. If not, it writes a single file, `skills/principles/principle-<name>/SKILL.md`, with a description that begins "Apply when" and names the trigger. Then it adds the principle to the Principles index in `tj-mode` and cites it in the playbook step where it applies. Principles only load when the index, a playbook, or a person names them, so an unlisted principle never runs. `scripts/check-skills.py` fails if the index misses one.

## Produce documents with `/technical-writing` and `/md-to-pdf`

Docs, RFCs, ADRs, READMEs, PR descriptions, and commit messages all benefit from [`/technical-writing`](./05-build-and-clean.md#hold-documents-to-a-standard-with-technical-writing). Name it when you ask for the document, or point it at a draft.

When the document has to leave the repository as a PDF:

```text
/md-to-pdf docs/prd/0003-subscription-pause.md
```

[`/md-to-pdf`](../../skills/writing/md-to-pdf/SKILL.md) renders through a single script and headless Chrome, with fixed rules for page breaks: every chapter starts on a fresh page, tables and diagrams are never split, and headings are never left alone at the bottom of a page. Without a theme the style is neutral. Use `--theme` or `MD_TO_PDF_THEME` for your own fonts and colors. Themes and brand files stay outside the tjstack repository. You need `python3` with `markdown` and `beautifulsoup4`, and Chrome or Chromium on the `PATH`.

## Fix a broken skill without stalling the task

If a skill misbehaves in the middle of a task, `/tj-mode` repairs it in a separate PR and carries on. Do the same when you're the one who spots it. A skill fix buried in a feature PR gets no real review and can't be judged on its own.

Before you trust a changed skill, give the old and the new version the same real task and compare what each actually did. A fix based on one bad session often only fits that session. A second, different task shows whether it generalizes.

**Pitfall:** writing a `SKILL.md` by hand from scratch. Use `/create-skill`, which checks the description, frontmatter, and wording before other people and agents depend on them.

**Try it.** Run `/customize-my-mode`. When it shows the draft, ask which chats each rule came from, and remove every rule that rests on a single chat.

Next: [Recipes and pitfalls](./10-recipes-and-pitfalls.md).
