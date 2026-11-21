# tjstack harness: Claude Code

tjstack skills are written in Cursor terms. In Claude Code, translate each term with this table.

| Cursor | Claude Code |
| --- | --- |
| `Task` tool | `Agent` tool |
| `subagent_type: generalPurpose` | `subagent_type: general-purpose` |
| `readonly: true` (strips MCP) | `general-purpose`, and the prompt forbids writes. MCP stays available. |
| `readonly: false` | Omit. `general-purpose` and the tjstack agents can write. |
| `subagent_type: tj-agent`, `comment-cleaner` | `tjstack:tj-agent`, `tjstack:comment-cleaner`. Without the plugin installed, use `general-purpose` and start the prompt with the body of `agents/<name>.md` from the plugin root. |
| `model` is a slug from `agent models` | `model` is a value the Agent tool's `model` parameter accepts. |
| `inherit-parent` or `auto` omits `model` | Omit `model`. |
| effort is the slug's effort token | `effort` param (`low` to `max`) when the tool offers it. Otherwise drop it. |
| `environment: "cloud"` | `isolation: "remote"` when the Agent tool offers it. Otherwise run local. |
| `cloud_base_branch` | None. Push the branch and name it in the brief. |
| A subagent can spawn subagents | A subagent cannot spawn subagents. The chat runs every fan-out. A delegate that needs one reports back and the chat runs it. |
| `agent models` lists the models | The values the Agent tool's `model` parameter lists. Nothing to run. |
| Always-applied rule `~/.cursor/rules/<name>.mdc` with `alwaysApply: true` frontmatter | `~/.claude/rules/<name>.md`, no frontmatter |
| On-demand rule `~/.cursor/rules/source-playbooks.mdc` | `~/.claude/tjstack/source-playbooks.md`, no frontmatter. Files in `~/.claude/rules/` load every session. |
| Personal skills `~/.cursor/skills/<name>/SKILL.md` | `~/.claude/skills/<name>/SKILL.md` |
| Project skills `.cursor/skills/` | `.claude/skills/` |
| Plugin skills under `~/.cursor/plugins/` | Under `~/.claude/plugins/` |
| A bundled skill loads by name | Most tjstack skills set `disable-model-invocation`, so the Skill tool refuses them. Read `skills/*/<name>/SKILL.md` under the plugin root with the Read tool. The root is three levels above the "Base directory" printed when a tjstack skill loads, or above the tj-mode path in the brief. |
| Transcripts `~/.cursor/projects/<slug>/agent-transcripts/` | `~/.claude/projects/<slug>/`, `<slug>` is the absolute launch directory with every character that is not a letter or digit turned into `-` (`/home/user/proj` is `-home-user-proj`). In a worktree or subdirectory, drop trailing path parts until the directory exists. Never read another project's directory. This directory is `<agent-transcripts>`. |
| The system prompt names the active `agent-transcripts/` directory | Nothing names it. Derive the directory from the working directory. The active session is the newest `*.jsonl` directly in it (first line of `ls -t <dir>/*.jsonl`). |
| Chat transcript `<uuid>/<uuid>.jsonl`, subagent `<uuid>/subagents/<id>.jsonl` | Chat `<session-id>.jsonl`, subagent `<session-id>/subagents/agent-<agentId>.jsonl` with a `.meta.json`. Large tool outputs sit in `<session-id>/tool-results/`. |
| Every JSONL line is one chat message | Every line is one event. Keep `type` `user` and `assistant`. `message.content` is a string or a list of blocks (`text`, `tool_use`, `tool_result`). The first message is the first `type: user` line. |
| Cloud-agent URL | claude.ai/code session URL. Its transcript is not on disk, so pick up from the pushed branch. |
| `AskQuestion` | `AskUserQuestion`. It takes two to four options. Put the rest under its free-text Other answer. |
| Built-in `create-skill` skill | This plugin's **create-skill** skill. Read `skills/setup/create-skill/SKILL.md`. |
| `/loop` dynamic mode | `/loop` with no interval, which self-paces. |
| MCP discovery with `GetDynamicTools` or the `mcps/` directory | MCP tools are `mcp__<server>__<tool>` in the tool list. Load deferred ones with `ToolSearch`. `claude mcp list` lists servers. |
| Cursor restart | Claude Code restart, or `claude --resume`. |
