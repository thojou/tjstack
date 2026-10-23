---
name: git-commit
description: "Commit staged or working-tree changes as small Conventional Commits: read the diff, stage by logical change, write the message from the diff with technical-writing and noslop, commit through a heredoc, and report the result. Use for /git-commit, 'commit this', 'write a commit message', 'stage and commit', or when a playbook says to commit."
disable-model-invocation: true
---

# Git commit

A commit says what the diff changes and nothing else. Make each one a single logical change with a Conventional Commits subject.

## Workflow

1. **Look before you stage.** `git status --porcelain` shows what is modified, staged, and untracked. Read `git diff --staged` when something is staged, else `git diff`. Open untracked files you have not seen.
2. **Group the hunks.** Decide which changes form one unit and stage exactly those, by path or with `git add -p` when one file mixes two units. Never stage everything blind with `git add -A` or `git add .`. A test belongs in the commit of the code it covers. The exception is a failing test you land first on purpose, per the **sequence-verifiable-units** principle skill.
3. **Check what you stage.**
   - Secrets stay out. Check the staged list for `.env` files, keys, tokens, and credential exports. Unstage any you find and tell the user.
   - Prose gets the same pass as the message. When the diff adds or changes docs, comments, or user-facing strings, run **noslop** on those words before you commit them.
4. **Write the message from the staged diff.**
   - Match the repo first: skim `git log --oneline -20` and any contributing guide. Otherwise use `<type>(<scope>): <subject>` from [references/conventional-commits.md](references/conventional-commits.md).
   - Write the subject and the body with the **technical-writing** skill: every layer except Diátaxis, plus the STE vocabulary rules (one word per action, keep articles, a plain verb over `-ing` where one works).
   - The body says why the change exists, what it changes in behavior, and what a reader cannot see in the diff. It does not restate the subject. Skip the body when the subject says it all.
   - Run **noslop** over the finished message. A commit message is prose too.
5. **Commit through a quoted heredoc**, so line breaks and backticks survive the shell:

   ```bash
   git commit -F - <<'EOF'
   <type>(<scope>): <subject>

   <optional body>

   <optional trailers>
   EOF
   ```

   Put the attribution trailers the harness or the repo requires at the end.
6. **Report.** Run `git log --oneline -1` and `git status --short`. Give the hash, the subject, and whatever is still uncommitted.

## Safety

- Leave git config untouched.
- No history-destroying commands (`reset --hard`, `clean -f`, `checkout -- .`, `branch -D`) unless the user asked for that command.
- Hooks run. Skip them with `--no-verify` only on the user's explicit request.
- Never force-push `main` or `master`.
- A hook that rejects the commit leaves nothing committed. Fix the cause and commit again.
- Amend only your own unpushed commit, and only when the change belongs in it. Anything else gets a new commit unless the user asks.
- If a hook reformats files during the commit, follow the repo's convention for committing those changes.
