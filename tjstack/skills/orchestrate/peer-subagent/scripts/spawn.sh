#!/usr/bin/env bash
# Run one brief on an external agent CLI and print its final reply.
set -euo pipefail

usage() {
	cat >&2 <<'EOF'
usage: spawn.sh --harness <codex|claude|cursor> [--model <slug>]
                [--effort <low|medium|high|xhigh|max>] [--mode <read|write>]
                [--workspace <dir>] [--dry-run] (<prompt> | -)
EOF
}

die() {
	printf '%s\n' "$1" >&2
	exit 2
}

harness=""
model=""
effort=""
mode=read
workspace="$PWD"
dry=0
while [[ $# -gt 0 ]]; do
	case "$1" in
		--harness|--model|--effort|--mode|--workspace)
			[[ $# -ge 2 ]] || { usage; exit 2; }
			case "$1" in
				--harness) harness="$2" ;;
				--model) model="$2" ;;
				--effort) effort="$2" ;;
				--mode) mode="$2" ;;
				--workspace) workspace="$2" ;;
			esac
			shift 2
			;;
		--dry-run) dry=1; shift ;;
		-h|--help) usage; exit 0 ;;
		--) shift; break ;;
		-) break ;;
		-*) usage; die "Unknown argument: $1" ;;
		*) break ;;
	esac
done

[[ $# -ge 1 ]] || { usage; exit 2; }
if [[ "$1" == - ]]; then
	prompt="$(cat)"
else
	prompt="$*"
fi
[[ -n "$prompt" ]] || die "Empty prompt"

case "$effort" in
	""|low|medium|high|xhigh|max) ;;
	*) die "Unknown effort: $effort" ;;
esac
case "$mode" in
	read|write) ;;
	*) die "Unknown mode: $mode" ;;
esac
[[ -d "$workspace" ]] || die "No such workspace: $workspace"
workspace="$(cd -- "$workspace" && pwd)"

stdin_prompt=1
case "$harness" in
	codex)
		cmd=(codex exec --cd "$workspace" --skip-git-repo-check --ephemeral --color never)
		[[ -z "$model" ]] || cmd+=(--model "$model")
		[[ -z "$effort" ]] || cmd+=(-c "model_reasoning_effort=\"$effort\"")
		if [[ "$mode" == read ]]; then
			cmd+=(--sandbox read-only)
		else
			cmd+=(--approve-for-me)
		fi
		;;
	claude)
		cmd=(claude --print --no-session-persistence --permission-prompts none)
		[[ -z "$model" ]] || cmd+=(--model "$model")
		[[ -z "$effort" ]] || cmd+=(--effort "$effort")
		if [[ "$mode" == read ]]; then
			cmd+=(--permission-mode dontAsk --tools "Read,Grep,Glob")
		else
			cmd+=(--permission-mode auto)
		fi
		;;
	cursor)
		# Cursor has no effort flag; effort is the model slug suffix.
		if [[ -n "$effort" ]]; then
			[[ -n "$model" && "$model" != auto ]] || die "cursor needs --model <base slug> with --effort"
			model="$model-$effort"
		fi
		cmd=(cursor-agent --print --trust --workspace "$workspace")
		[[ -z "$model" ]] || cmd+=(--model "$model")
		if [[ "$mode" == read ]]; then
			cmd+=(--mode ask)
		else
			cmd+=(--auto-review)
		fi
		stdin_prompt=0
		;;
	"") usage; exit 2 ;;
	*) die "Unknown harness: $harness" ;;
esac
[[ "$harness" != codex ]] || cmd+=(-)

if [[ "$dry" == 1 ]]; then
	printf '%q' "${cmd[0]}"
	printf ' %q' "${cmd[@]:1}"
	if [[ "$stdin_prompt" == 1 ]]; then
		printf ' < prompt\n'
	else
		printf ' %q\n' "$prompt"
	fi
	exit 0
fi

run="$(mktemp -d "${TMPDIR:-/tmp}/peer-subagent.XXXXXX")"
printf '%s\n' "$prompt" >"$run/prompt.md"
: >"$run/reply.md"

set +e
case "$harness" in
	codex)
		"${cmd[@]}" --output-last-message "$run/reply.md" <"$run/prompt.md" >"$run/log" 2>&1
		;;
	claude)
		(cd -- "$workspace" && "${cmd[@]}" <"$run/prompt.md" >"$run/reply.md" 2>"$run/log")
		;;
	cursor)
		"${cmd[@]}" "$prompt" </dev/null >"$run/reply.md" 2>"$run/log"
		;;
esac
code=$?
set -e

printf 'harness=%s\n' "$harness"
printf 'model=%s\n' "${model:-default}"
printf 'effort=%s\n' "${effort:-default}"
printf 'mode=%s\n' "$mode"
printf 'workspace=%s\n' "$workspace"
printf 'run=%s\n' "$run"
printf 'exit=%s\n' "$code"
printf -- '---\n'
cat "$run/reply.md"
[[ ! -s "$run/reply.md" || -z "$(tail -c 1 "$run/reply.md")" ]] || printf '\n'
if [[ "$code" != 0 ]]; then
	printf -- '--- log tail\n'
	tail -n 20 "$run/log"
fi
exit "$code"
