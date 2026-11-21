### Opening a PR

Invoked at the end of every playbook that ships code. Investigation, Pause safely, Session pickup, Multi-phase plan, and Prototype stop at the reply. "PR" below also means a GitLab merge request.

**Worktree.** Work from a git worktree off main. Subagents inherit it. Each subagent's environment and isolation follow `spawn-subagent`. Do not push or reset until Destination has read the configured remote. Then reset against that remote: `git fetch <remote> && git reset --hard <remote>/<branch>`. Dirty branch with unrelated work: patch out, fresh worktree, apply. Snarled worktree: reset from main, redo minimally.

**Commits.** Commit liberally, each one through the **git-commit** skill. Rebase into small, ordered commits before opening PRs. Each commit is a future PR: landable, ordered to tell the story. Amend when the fix belongs in a just-made commit. New commit when separable.

**PRs.** Run **clean-comments** over the diff before review. Write every PR title and description with `/technical-writing` (every layer except Diátaxis, and apply the STE vocabulary rules: one word per action, keep articles, a plain verb over `-ing` where one works), then apply **noslop**.

**Titles.** Conventional Commits `type(scope): subject`, no trailing period. Type such as `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, or `perf`. Scope is the area, such as `tjstack` or `tj-mode`. Subject is short, imperative, and names a real symbol when one carries the change, for example `fix(tjstack): pin the PR destination`.

**Descriptions.** The PR body is a one-minute briefing, not a lab notebook, for a reviewer who has the diff. It says why the change exists, what it leaves out, what it could break, and how you proved it works. Write short, simple sentences with few identifiers, no walls of text. The body becomes the squash commit body, so keep that commit under about 40 lines. Use `##` headings, not bold lead-ins, in this order, and drop a section with nothing to say:

- `## Why`: the problem and approach, 1–3 short sentences. No SHAs, rebase genealogy, or "based on main" preamble.
- `## What changed`: 1–3 short bullets. Name a real symbol or path only when it carries the change. Name both sides of a rename or retarget.
- `## Scope`: always. 1–3 short items on what it covers and what it deliberately leaves out (a follow-up, a known gap). No symbols, paths, or file-by-file essay.
- `## Tradeoffs`: only rejected alternatives a reviewer would otherwise ask about. Skip when there was no real choice.
- `## Blast Radius`: 1–2 sentences on who or what it touches and why that is safe or risky. If main is red, state the cost of leaving it red.
- `## Verification`: 1–3 bullets, each a real run path and its outcome. Perf: one primary number with its unit, `before → after`, and a link to the arena or swarm directory for the rest. No sample-size methodology, swarm recitals, or metric tables.

After the sections, attach videos or screenshots when they prove a claim. Full SHAs, swarm or arena lane recitals, lever-correction essays, file-by-file checklists, and "CLEAN" verdicts go in a linked artifact, not the body.

**Destination.** Opening a PR publishes the branch. The remote alias is the `pr remote:` line in `~/.cursor/rules/tjstack-pr-remote.mdc`. If that file or line is missing, the alias is `origin`. Use that alias for every push, create, edit, retarget, view, and stack child. Do not choose a different remote. A name the operator says in this task does not override the rule. Changing the alias is `/setup-tjstack`.

1. Read the push URL with `git remote get-url --push <alias>`. If that fails, stop and name the missing alias. Do not fall back to another remote. Take the host and the project path (`owner/repo` or `group/subgroup/project`, without `.git`) from `git@<host>:<path>`, `ssh://[user@]<host>[:port]/<path>`, or `https://<host>/<path>`. If the fetch URL and push URL differ in host or path, stop and ask.
2. Forge from that host:
   - `github.com` → `gh`.
   - `gitlab.com`, any host whose name contains `gitlab`, or a host where `glab auth status --hostname <host>` succeeds → `glab`.
   - Anything else, including an SSH alias that hides the real host: stop and ask. Never default to `gh`.
   - If `command -v <cli>` fails, or the CLI is not authenticated for that host, stop and report. Do not switch forges, tools, or remotes.
3. Print the tuple before the first push. Print it again before every create or retarget:

   ```text
   Destination
   - remote: <alias from the rule>
   - push URL: <url>
   - host: <host>   project: <path>
   - base: <base-branch>   head: <head-branch>   forge CLI: <gh|glab>
   ```

4. Push and create. Every command carries the remote and project explicitly. Check that `git rev-parse --abbrev-ref HEAD` equals `<head-branch>` before you push.

   ```bash
   git push -u <remote> HEAD

   # gh. --head is the branch name.
   gh pr create --repo <owner>/<repo> --base <base-branch> --head <head-branch> --title "<title>" --body-file <body-file>

   # glab. --head selects another repository. Do not pass it. The branch is --source-branch.
   glab mr create -R https://<host>/<project-path> --source-branch <head-branch> --target-branch <base-branch> --title "<title>" --description "$(cat <body-file>)" --yes
   ```

   Never use a bare `git push`, `gh` or `glab` without `--repo` or `-R`, `gh repo set-default`, `glab mr create --push`, or a remote or config edit to paper over ambiguity.
5. Later operations use the same pin:
   - `gh pr edit|view|checks|merge <n> --repo <owner>/<repo>`
   - `glab mr update|view|merge <n> -R https://<host>/<project-path>`
   - Retarget: `gh pr edit <n> --repo <owner>/<repo> --base <new-base>` or `glab mr update <n> -R https://<host>/<project-path> --target-branch <new-base>`
   - Watch, only when a later ask requests it: `gh pr checks <n> --repo <owner>/<repo> --watch` or `glab ci status -R https://<host>/<project-path> --branch <head-branch> --live`
6. The URL the forge prints on create must match the tuple's host and project. If it does not, stop and tell the operator at once. Do not close the PR yourself.

A built-in PR tool may replace step 4 only if it accepts this exact remote, host, and project. If it cannot target them, use the resolved CLI. Never fall back to another forge or another remote.

**Size and stacks.** Prefer five narrow PRs to one large PR. A stack is a base-branch chain. The root PR targets trunk. Each child branch rebases onto its parent's exact tip and its PR targets the parent branch. Stack children reuse the parent's Destination tuple. Remote, host, project, and forge CLI stay fixed. Only the base changes, and each child has its own head. Before each child create, print the tuple with the new base and head, then:

- `gh pr create --repo <owner>/<repo> --base <parent-branch> --head <child-branch>`
- `glab mr create -R https://<host>/<project-path> --source-branch <child-branch> --target-branch <parent-branch> --yes`

Branch from trunk only for independent work. Rebase on trunk before substantial stack work. If `git remote -v` changed since the parent was created, stop and re-run Destination.

**Readiness.** Open every PR ready, never as a draft. A built-in PR tool can default to draft, so set `draft: false` on every creation call through it. With `gh`, omit `--draft`. With `glab`, omit `--draft`. If a PR still opens as a draft, mark it ready: `gh pr ready <number> --repo <owner>/<repo>` or `glab mr update <number> -R https://<host>/<project-path> --ready`. Run `gh pr view <number> --repo <owner>/<repo>` or `glab mr view <number> -R https://<host>/<project-path>` before you refer to PR status.

Before you call the PR open, confirm all three:

- The Destination tuple was printed in this session, and its remote is the alias from `tjstack-pr-remote.mdc`, or `origin` when that rule is missing.
- Every push and PR command so far used `<remote>` and `--repo` or `-R` for that project.
- The URL the forge printed matches the tuple's host and project.

**Babysit.** Opening a PR does not start a watch. Post the URL and keep building. Finish the phase or stack first. A status check is a separate ask. Babysit is `playbooks/babysit.md`, on request or inside Autopilot-stack. Push back when feedback drifts from intent.

A subagent that opens a PR runs `challenge`, **clean-comments**, and **noslop**, and posts the URL the forge printed. Then it returns to the parent without watching. An Autopilot-stack owner is the exception. It babysits its own MR per `playbooks/autopilot-stack.md`.

**Reply link.** Reply with the URL the forge CLI printed on create for the Destination project. To fetch it again, use `gh pr view <n> --repo <owner>/<repo> --json url --jq .url` or `glab mr view <n> -R https://<host>/<project-path>`. Never build the link by hand.
