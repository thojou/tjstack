---
name: git-commit
description: "Commit staged or working-tree changes as small Conventional Commits: read the diff, stage by logical change, write the message from the diff, commit through a heredoc, and report the result. Use for /git-commit, 'commit this', 'write a commit message', 'stage and commit', or when a playbook says to commit."
disable-model-invocation: true
---

# Git commit

A commit says what the diff changes and nothing else. Make each one a single logical change with a Conventional Commits subject.

## Workflow

1. **Look before you stage.** `git status --porcelain` shows what is modified, staged, and untracked. Read `git diff --staged` when something is staged, else `git diff`. Open untracked files you have not seen.
2. **Group the hunks.** Decide which changes form one unit and stage exactly those, by path or with `git add -p` when one file mixes two units. Never stage everything blind with `git add -A` or `git add .`. A test belongs in the commit of the code it covers. The exception is a failing test you land first on purpose, per the **sequence-verifiable-units** principle skill.
3. **Keep secrets out.** Check the staged list for `.env` files, keys, tokens, and credential exports. Unstage any you find and tell the user.
4. **Derive the message from the staged diff.** Match the repo first: skim `git log --oneline -20` and any contributing guide. Otherwise use `<type>(<scope>): <subject>` from [references/conventional-commits.md](references/conventional-commits.md). Add a body only when the reason, a behavior change, or a migration step would not be obvious from the diff.
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
- A rejected commit gets fixed and committed again. `--amend` only on the user's request, and only for a commit that is not pushed.
- If a hook reformats files during the commit, follow the repo's convention for committing those changes.
