# Set up tjstack

Setup takes about ten minutes. You install the plugin, answer four questions in `/setup-tjstack`, and optionally connect the tools `/why` searches and give agents a way to run your app. Then you try one real task on Ledger.

## Install the plugin

**Cursor.** Open Customize and add the tjstack repository as a local folder. Cursor picks up the skills and agents from `.cursor-plugin/plugin.json`.

**Claude Code.** Register the marketplace, then install:

```text
/plugin marketplace add thojou/tjstack
/plugin install tjstack@tjstack
```

Working from a clone? Start Claude Code with `claude --plugin-dir ./tjstack`. Remember the namespace: in Claude Code, every command on these pages starts with `tjstack:`.

Nothing runs just because the plugin is installed. Nearly all tjstack skills carry `disable-model-invocation: true`. They load when you type their command or when a running skill reads them by path, never because a word in your message happened to match.

## Run `/setup-tjstack`

```text
/setup-tjstack
```

[`/setup-tjstack`](../../skills/setup/setup-tjstack/SKILL.md) walks you through four choices and saves each as an always-applied rule. Rules are read when a chat starts, so open a fresh chat when you're done.

### 1. A reasoning budget

The budget is the effort level tjstack passes to the subagents it starts: `low`, `medium`, `high`, `xhigh`, or `max`. If you never chose one, it's `xhigh`. A model value that already carries an effort suffix keeps its own. Claude Code's picker only fits four options, so enter `max` as free text if you want it.

### 2. A model for each role

tjstack starts subagents for specific jobs, and each job has a named **role line** in the models rule. Setup suggests a value for every line and shows you the whole table. Change only the lines you have an opinion about. In Cursor the suggestions come from `propose.py`, which asks `agent models` what you can use. In Claude Code they come from the values the Agent tool accepts.

| Kind of role | Role lines | Who runs on it |
| --- | --- | --- |
| Code writers | `bug-fix`, `perf-issue`, `feature, refactoring` | The delegate that edits code inside the matching playbook. |
| Judgment | `judgment and prose`, `hardest tasks` | Writing, design calls, and the toughest code, such as cross-cutting designs or concurrency. |
| Skill helpers | `how explorer`, `how explainer`, `why investigator`, `why synthesizer`, `catch-up miner`, `blast-radius reader`, `clean-comments reviewer`, `swarm workers`, `retro judgment`, `retro tooling` | The helpers one particular skill starts, mostly read-only. |
| Panels | `arena runners`, `architect runners`, `challenge reviewers`, `arena cross-judge pool`, `track-your-work reviewer` | A list of models instead of one. |

Panels come in two flavors. A **fan-out line** (`arena runners`, `architect runners`, `challenge reviewers`) starts one subagent per listed model and never fewer than two, so a single model gets two runs. A **pick line** (`arena cross-judge pool`, `track-your-work reviewer`) uses the first listed model that isn't the one your chat runs on. Listing two model families on these lines is how you get a reviewer that doesn't share the author's blind spots.

For a role you don't care about, write `inherit-parent` or `auto`. Both tell tjstack to leave the subagent's `model` field empty, so it runs on whatever model your chat uses. Neither is a model slug.

### 3. The PR remote

Name the git remote alias pull requests go to. It defaults to `origin`. If Ledger lives on a company GitLab added as `gitlab`, enter `gitlab`. The Opening a PR playbook reads this rule and nothing else, so mentioning a remote mid-task won't redirect a push. Rerun setup to change it.

From the remote's host, tjstack picks `gh` for GitHub or `glab` for GitLab. A host it can't classify makes it stop and ask.

### 4. Where subagents run

`local` keeps subagents on your machine and gives each writing subagent a git worktree of its own. `cloud` starts them as cloud agents, except jobs that need your machine, such as reading your local chat transcripts or your local database. If a cloud start fails, tjstack falls back to local for the rest of the run. Without a choice, it's `local`.

### What setup writes

| Rule | Cursor | Claude Code |
| --- | --- | --- |
| Models and budget | `~/.cursor/rules/tjstack-models.mdc` | `~/.claude/rules/tjstack-models.md` |
| PR remote | `~/.cursor/rules/tjstack-pr-remote.mdc` | `~/.claude/rules/tjstack-pr-remote.md` |
| Subagent environment | `~/.cursor/rules/tjstack-environment.mdc` | `~/.claude/rules/tjstack-environment.md` |
| Harness translation | not needed | `~/.claude/rules/tjstack-harness.md` |

The last row matters in Claude Code. The skills are written in Cursor's vocabulary, so they say `Task` where Claude Code has `Agent`, and `~/.cursor/rules/` where Claude Code uses `~/.claude/rules/`. The **harness rule** is the dictionary. Its source is [`harness/claude-code.md`](../../skills/setup/setup-tjstack/harness/claude-code.md). A skill that notices it's missing will send you back to `/setup-tjstack`.

Running setup again is safe. It starts from your current answers, drops role lines it no longer recognizes, and lists what it dropped. To return one role to its default, delete that line and rerun.

## Connect evidence sources with `/setup-source`

`/why` reconstructs the reasons behind code from seven kinds of record: source control, the issue tracker, long-form documents, team chat, infrastructure observability, error tracking, and product analytics. It has to know which of your tools covers which kind.

```text
/setup-source
```

[`/setup-source`](../../skills/setup/setup-source/SKILL.md) inventories your MCP servers and skills, assigns each to a category, and asks you to confirm. Source control always goes through the bundled `code-explore` skill, using `gh`, `glab`, or both, whichever you have installed. A category with nothing behind it is saved as `gap`, and `/why` will name that gap in its report instead of filling it with guesses.

Some MCP servers need a short playbook before `/why` can query them well. Setup writes it for you with [`/create-source-playbook`](../../skills/setup/create-source-playbook/SKILL.md), which reads the server's live tool schema. When you add a server later, run `/create-source-playbook` for it directly.

The rule is saved as `~/.cursor/rules/source-playbooks.mdc` in Cursor and `~/.claude/tjstack/source-playbooks.md` in Claude Code. Skip this step and `/why` refuses to start, while every other skill works normally.

## Give agents a way to drive your app

Setup won't do this for you, and it's the step with the biggest payoff. For a browser app, a CLI, or both, run:

```text
/create-verification-skill
```

The result is a `verify-<app>` skill inside your project that explains how to launch Ledger, operate it like a user, and save proof of what happened. The generator runs its own instructions once before it hands them over. Details are on the [verification page](./06-verify-and-ship.md#create-a-project-verification-skill).

The reason to do it on day one: without it, "verified" means "I read the code and it looks right", and every claim comes back to you for a manual check. With it, the agent can run Ledger, see the bug, and see the fix.

## Keep the cost in check

Rigor costs tokens. Every panel entry is another subagent, and a review panel of four models reads the same diff four times. To see what a session cost, look at the band in Claude Code, or open `~/.config/tjstack/metrics/board.html` in either harness. Cursor does not report tokens, so the board shows cost for Claude Code sessions only. Ways to spend less:

- Lower the budget in `/setup-tjstack`, or put cheaper models on the code-writer roles while your chat runs on a strong model.
- Write `auto` or `inherit-parent` on roles where the chat's own model is good enough.
- Trim panel lists. Two entries is the minimum for fan-out lines.
- Fix a typo without `/tj-mode`. Reach for it when a mistake would cost you more than the tokens.

## Run your first task

Choose a small change you would trust a new colleague with:

```text
/tj-mode add a --format=json option to `ledger invoices:list`. the default table output must not change by a single byte. show both outputs.
```

The todo list that appears starts with the Feature playbook's steps, pasted unchanged. Any step the agent decides to leave out stays visible as `skip: <reason>`. Read those lines. They tell you where the agent thinks it can cut a corner.

Keeping the mode active:

- **Cursor.** Select `/tj-mode` in the `/` menu and confirm with Option+Enter on Mac or Alt+Enter on Windows. That turns it into a Custom Mode that applies to every turn until you leave it, in the Agents Window and the CLI. With plain Enter it only rides along with that one message.
- **Claude Code.** Switch on the tj-mode toggle in the band above the prompt. While it is on, every request you type runs with `/tjstack:tj-mode`, and slash commands run as typed. The choice is kept across sessions. If the band doesn't show, because hooks modules are not available in your Claude Code yet, put `/tjstack:tj-mode` in front of each new task.

**Try it.** After setup, open the models rule and read the `challenge reviewers` line. If it names a single model, your adversarial reviews are one model arguing with itself. Decide whether to add a second family.

Next: [Route work through `/tj-mode`](./02-tj-mode.md).
