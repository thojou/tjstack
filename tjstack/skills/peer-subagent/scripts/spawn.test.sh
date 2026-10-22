#!/usr/bin/env bash
# Dry-run checks for spawn.sh. Makes no model calls.
set -euo pipefail

spawn="$(dirname "$0")/spawn.sh"
fail=0

has() {
	local name="$1" out="$2"
	shift 2
	local want
	for want in "$@"; do
		if [[ "$out" != *"$want"* ]]; then
			printf 'FAIL %s: missing %q in: %s\n' "$name" "$want" "$out"
			fail=1
		fi
	done
}

rejects() {
	local name="$1"
	shift
	if bash "$spawn" --dry-run "$@" >/dev/null 2>&1; then
		printf 'FAIL %s: accepted %s\n' "$name" "$*"
		fail=1
	fi
}

out=$(bash "$spawn" --dry-run --harness codex --model gpt-6-luna --effort low ping)
has codex-read "$out" "codex exec" "--model gpt-6-luna" 'model_reasoning_effort=\"low\"' "--sandbox read-only" " - < prompt"

out=$(bash "$spawn" --dry-run --harness codex --mode write ping)
has codex-write "$out" "--approve-for-me"
[[ "$out" != *--sandbox* ]] || { printf 'FAIL codex-write: --approve-for-me cannot be combined with --sandbox: %s\n' "$out"; fail=1; }
[[ "$out" != *--model* && "$out" != *model_reasoning_effort* ]] || { printf 'FAIL codex-default: %s\n' "$out"; fail=1; }

out=$(bash "$spawn" --dry-run --harness claude --model opus --effort xhigh ping)
has claude-read "$out" "claude --print" "--model opus" "--effort xhigh" "--permission-mode dontAsk" "--tools Read\\,Grep\\,Glob" " < prompt"

out=$(bash "$spawn" --dry-run --harness claude --mode write ping)
has claude-write "$out" "--permission-mode auto"

out=$(bash "$spawn" --dry-run --harness cursor --model claude-opus-5-5 --effort high ping)
has cursor-read "$out" "cursor-agent --print" "--model claude-opus-5-5-high" "--mode ask" " ping"

out=$(bash "$spawn" --dry-run --harness cursor --mode write ping)
has cursor-write "$out" "--auto-review"

out=$(printf 'line one\nline two\n' | bash "$spawn" --dry-run --harness cursor -)
has stdin-prompt "$out" "line one" "line two"

rejects no-harness ping
rejects bad-harness --harness nope ping
rejects bad-effort --harness codex --effort ultra ping
rejects bad-mode --harness codex --mode yolo ping
rejects cursor-effort-no-model --harness cursor --effort high ping
rejects cursor-effort-auto --harness cursor --model auto --effort high ping
rejects empty-prompt --harness codex ""
rejects bad-workspace --harness codex --workspace /nonexistent/dir ping

[[ "$fail" == 0 ]] && printf 'ok\n'
exit "$fail"
