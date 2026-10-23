---
name: peer-subagent
description: >-
  Runs a subagent brief on a peer harness (Codex CLI, Claude Code, or Cursor
  CLI) the way Task runs an internal subagent, with model, reasoning effort,
  read or write mode, and workspace. Use when a brief should go to Codex,
  Claude, or Cursor, or to a model only that harness offers.
disable-model-invocation: true
---

# Peer subagent

This is Task for another harness. You write the brief, the script runs it on that CLI, and you get back the external agent's final reply. You do not do the brief yourself.

## Spawn

Run `scripts/spawn.sh` from this skill's directory, outside the sandbox. The CLIs need network and their own home directories. Pass the brief on stdin:

```bash
bash scripts/spawn.sh --harness codex --model gpt-6-luna --effort high \
  --mode read --workspace /abs/path/to/repo - <<'BRIEF'
<self-contained brief>
BRIEF
```

The final `-` tells the script to read the brief from stdin. A one-line brief can be passed as a quoted argument instead.

| Flag | Task equivalent | Values |
|---|---|---|
| `--harness` | which agent runs | `codex`, `claude`, `cursor` |
| `--model` | `model` | that harness's slug; omit for its configured default |
| `--effort` | the effort in an internal slug | `low`, `medium`, `high`, `xhigh`, `max`; omit for the model default |
| `--mode` | read-only vs editing subagent | `read` (default), `write` |
| `--workspace` | the checkout it works in | directory; defaults to the current one |

Model slugs belong to the harness, not to Task:

- Codex: `gpt-6-luna`, `gpt-6.1-sol`, `gpt-6-astra`. Effort goes to `model_reasoning_effort`. Luna has no `ultra`.
- Claude: `opus`, `sonnet`, `fable`, or a full name. Effort goes to `--effort`.
- Cursor: run `cursor-agent --list-models`. Cursor has no effort flag. Pass the base slug and the script appends the effort, so `--model claude-opus-5-5 --effort high` runs `claude-opus-5-5-high`. Effort without a model, or with `auto`, is rejected.

`read` lets the agent read the workspace and blocks edits. `write` lets it edit and run commands under that harness's auto-review (Codex `--approve-for-me`, Claude `--permission-mode auto`, Cursor `--auto-review`). The script never passes a bypass or YOLO flag.

## Brief

The external agent sees nothing of this chat. Write the brief the way you would for Task: the goal, absolute paths, constraints, what done means, and the exact shape of the reply you want. For `read`, also say not to modify files.

A `write` brief needs its own checkout. Follow **Local isolation** in the `spawn-subagent` skill ([../spawn-subagent/SKILL.md](../spawn-subagent/SKILL.md)). Create the worktree first and pass its path as `--workspace`.

## Result

The script prints `harness=`, `model=`, `effort=`, `mode=`, `workspace=`, `run=`, and `exit=`, then the final reply after `---`. The `run=` directory keeps `prompt.md`, `reply.md`, and the full `log`.

- Exit 0: treat the reply like a subagent result. Check its claims against the workspace before you build on them.
- Non-zero: the script prints the log tail. Report the exit code and the error. Do not do the brief yourself in its place. A model the CLI rejects lists the valid slugs in that error.

For a background run, start the command with `block_until_ms: 0`. The script prints its header only after the CLI exits, so the run is done once the command output shows `exit=`. To run briefs in parallel, start one command per brief. Every run is a fresh session. There is no resume.

## Check

`bash scripts/spawn.test.sh` checks the command line for each harness, mode, and effort without calling a model.
