# The tjstack guide

Most agent mistakes don't come from weak models. They come from vague briefs and unchecked results. tjstack moves the rigor out of your prompt and into playbooks: you state the outcome and the check, `/tj-mode` chooses the procedure, and the reply comes back with proof attached. This guide shows how to work that way, one stage of a change at a time.

## The running example

Every page uses the same imaginary project, so the prompts build on each other. **Ledger** is a PHP invoicing app with a web UI and a CLI. It issues invoices, adds VAT, bills subscriptions, sends dunning emails for late payers, and exports CSV files for accounting. Replace Ledger's details with your own when you copy a prompt.

## The pages

| Page | What you'll be able to do afterward |
| --- | --- |
| [1. Set up tjstack](./01-setup.md) | Install the plugin, choose models per role, and connect the sources `/why` searches. |
| [2. Route work through `/tj-mode`](./02-tj-mode.md) | Write a prompt that routes to the right playbook, and audit the reply you get back. |
| [3. Understand Ledger's code first](./03-understand.md) | Get a traced model of the code and its history with `/how`, `/why`, `/explain`, `/teach`, and `/catch-up`. |
| [4. Design the change](./04-design.md) | Go from a fuzzy idea to agreed terms, recorded decisions, requirements, and a tested shape. |
| [5. Build, commit, and tidy the change](./05-build-and-clean.md) | Brief the build playbooks, work test-first, commit in small units, and strip what reviewers shouldn't see. |
| [6. Prove it, then open the PR](./06-verify-and-ship.md) | Prove behavior on the running app, check what a diff reaches, audit a whole repository, and get a PR to merge-ready. |
| [7. Run work while you're away](./07-overnight.md) | Hand over a long task with a contract, and audit the trail when you return. |
| [8. Steer with principle names](./08-principles.md) | Correct a drifting agent with one phrase. |
| [9. Make it yours](./09-make-it-yours.md) | Build your own mode, learn from a session, and add skills and principles. |
| [10. Recipes and pitfalls](./10-recipes-and-pitfalls.md) | Copy a prompt for a common situation, and avoid the usual traps. |
| [11. Troubleshooting](./11-troubleshooting.md) | Match a symptom to its cause and fix. |

Pages 1 and 2 are prerequisites. After them, jump to the stage you're at. Each page closes with a **Try it** task for your own repository.

Three reference pages hold the facts the guide only touches:

- [Skill reference](../reference/skills.md): every skill, what it reads and writes, and a sample prompt.
- [Files reference](../reference/files.md): every rule, record, and log tjstack touches, per harness.
- [Glossary](../reference/glossary.md): the terms the skills use, from "role line" to "merge frontier".

## Command names in Cursor and Claude Code

Commands appear here in their Cursor form, such as `/tj-mode`. Claude Code namespaces plugin commands, so type `/tjstack:tj-mode`, `/tjstack:how`, and so on. Where a harness behaves differently, the page calls it out.

## Find your starting point

| Situation | First prompt | Page |
| --- | --- | --- |
| A task that needs care, of any kind | `/tj-mode <outcome>. <check that proves it>.` | [2](./02-tj-mode.md) |
| You're about to touch code you haven't read | `/how <question>` | [3](./03-understand.md) |
| Code looks wrong and you suspect a reason | `/why <question>` | [3](./03-understand.md) |
| You're back on a topic after a break | `/catch-up <topic>` | [3](./03-understand.md) |
| Another agent left a branch half done | `/tj-mode take over this branch` | [3](./03-understand.md) |
| A feature idea nobody has pinned down | `/interview <idea>` | [4](./04-design.md) |
| New code will be called from several places | `/architect <what>` | [4](./04-design.md) |
| You want other models to attack a diff | `/challenge` | [4](./04-design.md) |
| You want a ranked review of a whole repository | `/audit` | [6](./06-verify-and-ship.md) |
| Something is broken | `/tj-mode <symptom>. repro first, then fix and verify.` | [5](./05-build-and-clean.md) |
| Agents can't run your app on their own | `/create-verification-skill` | [6](./06-verify-and-ship.md) |
| A PR is red and you want it green | `/tj-mode babysit this pr` | [6](./06-verify-and-ship.md) |
| You're leaving for the night | `/tj-mode im going to bed. <goal>. done means <check>.` | [7](./07-overnight.md) |
| The last reply was hard to follow | `/rly` | [10](./10-recipes-and-pitfalls.md) |
| You don't know which of the above applies | `/tj-help <question>` | below |

## Ask before you spend

[`/tj-help`](../../skills/setup/tj-help/SKILL.md) is the free question desk:

```text
/tj-help ledger's PRs keep going to my fork. what decides the remote?
```

It answers from these pages, gives you one prompt to send, and links its source. It never starts a run, so asking costs almost nothing. For error messages and odd behavior, [Troubleshooting](./11-troubleshooting.md) is usually faster.

## The habit in one prompt

```text
/tj-mode invoices with a 0% VAT line show a total of 0.00. find out why before touching anything, then fix it. done means the fixture invoice INV-1042 totals 238.00 again.
```

No playbook name, no skill list. A symptom, an order of work, and a number that is either right or wrong. That is enough for `/tj-mode` to pick Bug fix and carry the rest.

Next: [Set up tjstack](./01-setup.md).
