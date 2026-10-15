---
name: spawn-subagent
description: >-
  Set the Task model from a tjstack role line, and set the environment and
  isolation, before spawning a subagent. Use when a tjstack skill names a role
  in tjstack-models.mdc.
disable-model-invocation: true
---

# Spawn subagent

Outside Cursor, the `tjstack-harness` rule translates this skill and the caller's spawn fields. If that rule is missing, run `/setup-tjstack` first.

Each spawn names a role line in the `tjstack-models.mdc` rule (`~/.cursor/rules/tjstack-models.mdc`). Set `model` to that line's value. When the caller already picked one entry from a comma-separated line, set `model` to that entry. Leave `model` unset when the value is `auto` or `inherit-parent`. When the rule or the line is missing, run `/setup-tjstack` first. If the Task tool rejects a slug, use the closest valid slug of the same model from its error message and say so.

**Model lists.** A comma-separated role line names the models a skill spreads its subagents over. The operator sets one model or several in `/setup-tjstack`. A fan-out line (`arena runners`, `architect runners`, `challenge reviewers`) runs one subagent per entry, and at least two. A single entry runs twice on that model. A pick line (`track-your-work reviewer`, `arena cross-judge pool`) takes the first entry whose model differs from the parent's, or the first entry when none differs. Two values are the same model when they match after you drop the effort token and a trailing `-fast`. `inherit-parent` and `auto` are the parent's model.

## Environment

Resolve the environment for each spawn. The first rule that matches wins.

1. A worker that needs this machine runs local. That covers control-ui or control-cli, local transcripts, a local database or Docker, auth that exists only here, and commits that are not pushed.
2. Once a run falls back from cloud, it stays local.
3. When the operator names `cloud` or `local` in this task, use that.
4. Otherwise use the `subagent environment:` line in `~/.cursor/rules/tjstack-environment.mdc`. A missing file or line means `local`.

Cloud sets `environment: "cloud"`. The operator's choice in rule 3 or 4 is the explicit request the Task tool needs for a cloud agent. Pass `cloud_base_branch` only for a pushed branch. Local sets `environment: "local"` and follows **Local isolation**.

If a cloud spawn fails, or the agent reports that it cannot reach the repo, respawn that worker local under **Local isolation**. Tell the operator. If the run keeps a **track-your-work** trail, log the fallback as a row. Every later spawn in this run is local.

## Local isolation

Subagents that only read the repo share the parent's checkout. Every subagent that writes to the repo gets its own worktree. The parent creates it before the spawn:

```bash
git worktree add -b <branch> .worktrees/<slug> <base-sha>
```

A lane that only verifies or measures gets a detached worktree at the SHA it checks:

```bash
git worktree add --detach .worktrees/<slug> <sha>
```

Before the first worktree, the parent adds `/.worktrees/` and `/.audit/` to `.git/info/exclude`, once per repo. From a linked worktree that file is `$(git rev-parse --git-common-dir)/info/exclude`.

The brief carries this block. A detached lane writes `branch: detached` and its SHA as `base`. Drop the server line when the worker starts no server.

```text
Worktree
- path: <absolute worktree path>
- branch: <branch>   base: <base-sha>
- server: port <port>   COMPOSE_PROJECT_NAME: <name>
```

The worker runs every command and edit inside that path. Its first step checks that `git rev-parse --show-toplevel` prints that path and that `git rev-parse --abbrev-ref HEAD` prints that branch. A detached lane checks `git rev-parse HEAD` against the base instead. On a mismatch the worker reports `BLOCKED` and changes nothing. It starts a server only on the port and with the `COMPOSE_PROJECT_NAME` from the brief.

A worker does not push, fetch, stash, switch branches, run `git worktree`, or edit git config. The exception is a worker whose playbook makes it a PR owner. It runs the git steps that playbook names.

After the parent harvests a worker's result, it removes the worktree with `git worktree remove .worktrees/<slug>` and runs `git worktree prune`. It keeps the worktree while the agent may still be resumed for that checkout.
