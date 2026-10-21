#!/usr/bin/env bash
# Print the next four-digit index for a directory of NNNN-slug.md files.
# Usage: next-id.sh <dir>
set -euo pipefail

if [ "$#" -ne 1 ]; then
	printf 'usage: next-id.sh <dir>\n' >&2
	exit 1
fi

max=0
shopt -s nullglob
for entry in "$1"/*.md; do
	base="$(basename "$entry" .md)"
	if [[ "$base" =~ ^([0-9]{4})- ]]; then
		num=$((10#${BASH_REMATCH[1]}))
		if ((num > max)); then
			max=$num
		fi
	fi
done

printf '%04d\n' $((max + 1))
