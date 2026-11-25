# Troubleshooting

Each entry names a symptom, its cause, and the fix. Find your symptom in the table, then read the section for details. If none fits, ask [`/tj-help`](../../skills/setup/tj-help/SKILL.md) with the symptom in your own words.

| Symptom | Section |
| --- | --- |
| A skill says to run `/setup-tjstack` first | [Missing rules](#a-skill-says-to-run-setup-tjstack-first) |
| Changed models still run the old ones | [Rules apply to new chats](#changed-models-still-run-the-old-ones) |
| `/why` stops and asks for `/setup-source` | [No evidence sources](#why-stops-and-asks-for-setup-source) |
| `/why` reports many coverage gaps | [No evidence sources](#why-stops-and-asks-for-setup-source) |
| A skill never starts unless you type it | [Skills load when named](#a-skill-never-starts-unless-you-type-it) |
| The Skill tool refuses a tjstack skill in Claude Code | [Skills load when named](#a-skill-never-starts-unless-you-type-it) |
| Later turns ignore `/tj-mode` | [Mode fades](#later-turns-ignore-tj-mode) |
| The band doesn't show in Claude Code, or the board stays empty | [Session metrics](#the-band-or-the-board-is-missing) |
| A new question gets handled as part of the previous task | [Mode fades](#later-turns-ignore-tj-mode) |
| The PR went to the wrong remote, or the playbook stopped before pushing | [Destination](#the-pr-went-to-the-wrong-place-or-stopped-before-pushing) |
| Babysit didn't merge a green PR | [Merging](#babysit-didnt-merge-a-green-pr) |
| Parallel agents overwrote each other | [Isolation](#parallel-agents-overwrote-each-other) |
| A subagent in Claude Code says it can't spawn subagents | [Harness limits](#a-subagent-in-claude-code-cant-spawn-subagents) |
| A long run was busy all night and finished nothing | [Finish condition](#a-long-run-was-busy-all-night-and-finished-nothing) |
| The agent calls it done because tests pass | [Evidence](#the-agent-calls-it-done-because-tests-pass) |
| Runs cost more than expected | [Cost](#runs-cost-more-than-expected) |
| `/tdd` writes PHP tests in a non-PHP project | [Test stack](#tdd-assumes-php) |
| `/md-to-pdf` fails | [PDF dependencies](#md-to-pdf-fails) |

## A skill says to run `/setup-tjstack` first

**Cause.** The models rule is missing, or, outside Cursor, the harness rule is missing. Skills that spawn subagents read the models rule through `spawn-subagent`. In Claude Code, every skill also relies on the harness rule to translate Cursor terms such as `Task` and `~/.cursor/rules/`.

**Fix.** Run `/setup-tjstack` (`/tjstack:setup-tjstack` in Claude Code). Check that the files listed in [What setup writes](./01-setup.md#what-setup-writes) exist. In Claude Code, `~/.claude/rules/tjstack-harness.md` must be there.

## Changed models still run the old ones

**Cause.** The rules load when a chat starts. A chat that was already open still uses the old values.

**Fix.** Start a new chat. If a role still uses an old model, open the models rule and check the role's line. Delete a line to fall back to the default, then rerun `/setup-tjstack`.

## `/why` stops and asks for `/setup-source`

**Cause.** `/why` reads the source-playbooks rule to know which tool covers each evidence category. Without it, `/why` doesn't guess.

**Fix.** Run `/setup-source`. Many coverage gaps in a `/why` report mean those categories have no tool connected. Add the MCP server for that tool, then rerun `/setup-source`. It offers to write a source playbook for any new server.

## A skill never starts unless you type it

**Cause.** Almost every tjstack skill sets `disable-model-invocation: true`. It loads only when you type its command, or when another skill reads it by path. That keeps an agent from starting a heavy workflow because your message happened to mention it. In Claude Code, the Skill tool refuses such skills, so tjstack skills read each other's `SKILL.md` files with the Read tool instead. The harness rule tells them how.

**Fix.** Type the command, such as `/how` or `/tjstack:how`. Inside `/tj-mode`, you don't need to. The playbook reads each skill when a step needs it.

## Later turns ignore `/tj-mode`

**Cause.** Started with plain Enter in Cursor, the skill belongs to that single message, and later turns lose track of it. In a long chat, the mode can also treat a new question as the next step of the last playbook.

**Fix.** In Cursor, start `/tj-mode` as a Custom Mode with Option+Enter or Alt+Enter. In Claude Code, switch on the tj-mode toggle in the band, or start each new task with `/tjstack:tj-mode`. Mid-chat, say "new task" to make it match a playbook again.

## The band or the board is missing

**Cause.** The metrics hooks run `node`, so they need Node.js on your `PATH`. The band in Claude Code is a hooks module, and hooks modules are in early access, so your Claude Code may not load it yet. Cursor never shows a band.

**Fix.** Check that `node --version` works in the shell your harness starts. To rebuild the board by hand and open it, run `node <plugin>/hooks/metrics.js board --open`, where `<plugin>` is the installed `tjstack/` directory. Without the band, start tasks with `/tjstack:tj-mode`.

## The PR went to the wrong place, or stopped before pushing

**Cause.** Opening a PR uses `origin`, or the alias in the project's PR remote rule, and takes the forge from that remote's host. It stops instead of guessing when the alias doesn't exist, the push URL and fetch URL disagree, the host is unknown (such as an SSH alias), or the `gh` or `glab` CLI is missing or not signed in.

**Fix.** Read the Destination tuple the playbook printed. To publish somewhere other than `origin`, commit `.cursor/rules/tjstack-pr-remote.mdc` with `pr remote: <alias>`. A name you say mid-task doesn't override that file. Check the CLI with `gh auth status` or `glab auth status --hostname <host>`.

## Babysit didn't merge a green PR

**Cause.** By design. Babysit stops at merge-ready. Merging, closing, and arming auto-merge are on `/tj-mode`'s always-pause list, and no playbook merges.

**Fix.** Merge it yourself. If you ask the agent to merge, expect it to pause and confirm first.

## Parallel agents overwrote each other

**Cause.** Several agents wrote to one working tree.

**Fix.** Keep the subagent environment `local`, where each writing subagent gets its own worktree, or switch to `cloud`. For your own chats, say "fresh worktree off `<base>`" at the start of each task.

## A subagent in Claude Code can't spawn subagents

**Cause.** In Claude Code, a subagent can't start subagents of its own. Skills written for Cursor sometimes expect a delegate to fan out.

**Fix.** Nothing to change. The harness rule tells delegates to report back, and the chat runs the fan-out. Long, deeply nested runs such as Autopilot-stack work, but the chat carries more of the load.

## A long run was busy all night and finished nothing

**Cause.** The run had a duration or a mood, not a predicate. "Work on this for four hours" gives the loop nothing to check.

**Fix.** Give a finish condition that a command can pass or fail, and see [the overnight contract](./07-overnight.md#the-overnight-contract). Read the decision trail's Attention section to see where the run drifted.

## The agent calls it done because tests pass

**Cause.** The agent checked a proxy instead of the real artifact.

**Fix.** Say "apply prove it works. show me the real output." For apps, give agents a way to drive the real thing with `/create-verification-skill`.

## Runs cost more than expected

**Cause.** Subagents and review panels each spend tokens. A panel with five models runs five subagents.

**Fix.** See [Keep the cost in check](./01-setup.md#keep-the-cost-in-check). The biggest levers are a smaller budget, cheaper models in the code roles, and shorter panel lists.

## `/tdd` assumes PHP

**Cause.** `/tdd` is written for PHP and PHPUnit, with Pest supported.

**Fix.** In another stack, it uses that stack's test runner the same way, and the cycle doesn't change. Name the runner in the prompt if the project has several.

## `/md-to-pdf` fails

**Cause.** A missing dependency. The script needs `python3` with `markdown` and `beautifulsoup4`, plus Chrome or Chromium.

**Fix.** Run `pip install markdown beautifulsoup4`. Put `google-chrome` or `chromium` on your `PATH`, or set `MD_TO_PDF_CHROME` to the browser binary.

Back to the [guide index](./README.md).
