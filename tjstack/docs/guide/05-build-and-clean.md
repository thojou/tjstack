# Build, commit, and tidy the change

Each build playbook already knows how its kind of work is done properly. Your prompt only has to supply the facts it can't find on its own. This page shows which facts each playbook needs, then the habits that keep the resulting diff easy to review: tests that start red, small commits, plain text, and no comments that the code could express itself.

## Give each build playbook the facts it needs

Each playbook wants a different kind of input.

**Bug fix wants the symptom, observed.**

```text
/tj-mode `ledger dunning:run` sends the first reminder twice when the job is retried. repro first, then fix and verify.
```

**Feature wants the new behavior and what must stay as it is.**

```text
/tj-mode add a --currency option to `ledger invoices:export`. without the option, the CSV stays byte-identical. verify both cases.
```

**Refactoring wants a behavior guarantee.**

```text
/tj-mode split InvoiceBuilder into a line calculator and a document assembler. no behavior change. capture current output for the fixture set first and prove it's identical afterward.
```

**Perf issue wants a number, not a feeling.**

```text
/tj-mode the monthly export takes 42s for the demo tenant. profile it, fix what the profile shows, report before and after.
```

What the playbook adds on its own:

| Playbook | Steps it adds |
| --- | --- |
| [Bug fix](../../skills/mode/tj-mode/playbooks/bug-fix.md) | A repro on the real surface with a pass or fail signal. Three to five ranked, falsifiable hypotheses in a table, eliminated one probe at a time. Before the fix, a grep for every caller of the function it touches, so the shared code is fixed once. No default or swallowed error that only hides the symptom. Every debug line tagged `[DEBUG-<id>]`, then shown to be gone. The failing repro committed before the fix. |
| [Feature](../../skills/mode/tj-mode/playbooks/feature.md) | `/how` over the affected area, `/architect` for the shape, the data shape named before logic, and a throughput checkpoint about what can run in parallel. New logic with a branch, a loop, a parser, money, security, or a data write leaves a test that fails when the logic breaks. |
| [Refactoring](../../skills/mode/tj-mode/playbooks/refactoring.md) | Today's behavior pinned with a characterization test or snapshot, deletions before additions, proof that output didn't change, and a revert if the code isn't easier to read afterward. |
| [Perf issue](../../skills/mode/tj-mode/playbooks/perf-issue.md) | A baseline trace, then the perf mantras from cheapest to most expensive: skip the work, don't repeat it, do less, do it later, do it out of sight, do it in parallel, and only then make it cheaper. |

Bug fix relies on a reference that's worth knowing: [feedback loops](../../skills/mode/tj-mode/references/feedback-loops.md). It describes nine kinds of repro loop, from a failing test at the right seam to a bisection script, and how to make a loop faster, more precise, and repeatable. If a bug only shows up now and then, send the agent there:

```text
the double reminder only happens every few runs. build a reliable loop per the feedback-loops reference before you guess at causes.
```

In every code-writing playbook, a subagent writes the code while your chat stays in charge. The lead defines the scope, the data shape, and the success check. Afterward it reviews the diff and writes its own summary instead of passing on the subagent's.

To push one metric step by step over a long run, use an [Autonomous run](./07-overnight.md#the-overnight-contract) with the metric as the exit condition.

## Start from a red test with `/tdd`

```text
/tdd regression test for VAT on credit notes for exempt customers, then the fix
```

[`/tdd`](../../skills/session/tdd/SKILL.md) is built for PHP and PHPUnit, which fits Ledger. It writes Pest tests in a Pest project, and in other stacks it applies the same cycle with that stack's runner. Before writing anything, it reads `phpunit.xml`, checks the installed PHPUnit version so it only uses API that exists there, and finds the command the project uses to run tests.

The cycle has six steps. Two of them exist only to watch:

1. **Red.** One test, one behavior. Call the code like a real caller and compare with a literal expected value.
2. **Verify red.** Run just that test and see it fail, for the reason you expect. Never skipped.
3. **Green.** The least code that makes it pass.
4. **Verify green.** The new test passes, then the whole suite runs clean.
5. **Refactor** with all tests green.
6. **Next test.**

Before any of this, `/tdd` asks whether a test is the right tool. If the test would need the whole framework booted for a pure function, a live third-party API, or a stack of mocks, it says so and uses the nearest real check: a script, an `artisan` or `bin/console` command, or an HTTP call to the local app. A real command run is better proof than a fragile test.

## Commit in small, honest units with `/git-commit`

```text
/git-commit
```

[`/git-commit`](../../skills/session/git-commit/SKILL.md) looks at the diff, decides which hunks belong together, and stages each group by path or with `git add -p`. It never adds everything at once. It scans what's staged for `.env` files, keys, and tokens and takes them out again. The message follows the repository's own style if it has one, Conventional Commits otherwise, and goes in through a quoted heredoc so formatting survives the shell.

Tests go in the same commit as the code they test. The exception is Bug fix's failing repro, which lands first on purpose so the history shows the bug before its fix.

Hooks always run. `--no-verify` happens only on your request, `main` is never force-pushed, and amending is limited to the agent's own commits that haven't been pushed. Playbooks commit through this skill too, so the rules are the same whether you call it or a playbook does.

## Clean the prose with `/noslop`

```text
/noslop the changelog entry for 2.5
```

[`/noslop`](../../skills/writing/noslop/SKILL.md) removes the patterns that make text read as machine-written: the usual buzzwords ("robust", "seamless", "leverage"), praise in place of a fact, artificial balance, chat-style sign-offs, and sentences so generic they'd fit any project. It covers the German versions as well. Meaning and tone stay yours.

tj-mode already applies it to replies, commit messages, PR descriptions, and documents. Call it on your own drafts, or when something slipped through:

```text
noslop the last reply, and no long dashes
```

## Strip the comments with `/clean-comments`

Whoever wrote a comment will defend it, and an agent is no exception. The review has to come from someone else:

```text
/clean-comments
```

[`/clean-comments`](../../skills/review/clean-comments/SKILL.md) starts [Comment Cleaner](../../agents/comment-cleaner.md), a read-only reviewer that removes comments unless they're on a short list of exceptions: license headers, contract docs on a public API, quirks forced by something outside your control, formatter directives, and links to a tracker issue for a real constraint. Narration, banners, dead code in comments, and TODOs without a live ticket all go.

If a comment explains a surprise in your own code, the comment goes and the code gets a `MUST KILL` flag: rename, extract, or type it so the surprise disappears. `/clean-comments` fixes the flags it agrees with at the source. A comment that claims a rule, like "don't remove this", earns an offer to turn the rule into a type, test, runtime check, or lint, which it does only after you approve.

Without arguments it reviews the diff against `main`. Opening a PR runs it on every PR anyway, so calling it yourself matters mostly outside playbooks.

## Hold documents to a standard with `/technical-writing`

```text
/technical-writing check the new section in docs/billing.md
```

[`/technical-writing`](../../skills/writing/technical-writing/SKILL.md) works in four layers, each with one question. Is this a tutorial, a how-to, a reference, or an explanation? Does each sentence speak to the reader directly? Does each sentence say one thing? Could any sentence be misread? It writes English unless you ask for German or the document is already German, and it has separate guidance for German.

Who does what: `/technical-writing` decides structure and wording, `/noslop` removes machine tells from text, and `/clean-comments` removes comments the code can replace. No skill rewrites generated clutter out of code on its own. The principles prevent it while the code is written, the review steps catch it, and [`/audit`](./06-verify-and-ship.md#review-a-whole-repository-with-audit) lists what a whole repository could delete.

**Pitfall:** treating cleanup as optional. Reviewers read leftover narration and defensive dead code as signs of unfinished work, and extra code is extra surface for the next bug. When a diff looks bloated, say "apply laziness protocol and subtract before you add" before you commit. The Laziness Protocol makes the agent climb a reuse ladder before it writes new code: nothing at all, code the repository already has, the standard library, an installed dependency, one readable line, and only then new code. It never cuts validation, error handling, security, or tests to make a diff smaller.

**Try it.** Make a small change and leave a few explanatory comments in it. Run `/clean-comments`. Look at what survived and why, and check whether a `MUST KILL` flag names something you'd actually rename.

Next: [Prove it, then open the PR](./06-verify-and-ship.md).
