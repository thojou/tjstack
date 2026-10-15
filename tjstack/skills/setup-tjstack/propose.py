#!/usr/bin/env python3
"""Print one tjstack slug per role from `agent models`."""

import argparse
import subprocess
import sys
from collections import defaultdict

EFFORTS = ("max", "xhigh", "high", "medium", "low")
RANK = {name: i for i, name in enumerate(EFFORTS)}

# kind, prefer -fast. pair = newest claude-opus without -fast, then newest grok with -fast.
ROLES = (
    ("bug-fix", "grok", True),
    ("perf-issue", "grok", True),
    ("feature, refactoring", "grok", True),
    ("judgment and prose", "opus", False),
    ("hardest tasks", "opus", False),
    ("how explorer", "grok", True),
    ("how explainer", "opus", False),
    ("blast-radius reader", "opus", False),
    ("catch-up miner", "grok", True),
    ("why investigator", "grok", True),
    ("why synthesizer", "opus", False),
    ("track-your-work reviewer", "pair", False),
    ("clean-comments reviewer", "opus", False),
    ("arena runners", "pair", False),
    ("arena cross-judge pool", "pair", False),
    ("architect runners", "pair", False),
    ("challenge reviewers", "pair", False),
    ("swarm workers", "grok", True),
    ("retro judgment", "opus", False),
    ("retro tooling", "grok", True),
)
ROLE_NAMES = {role for role, _, _ in ROLES}


def parse_slug(slug):
    parts = slug.split("-")
    fast = parts[-1] == "fast"
    if fast:
        parts.pop()
    thinking = "thinking" in parts
    if thinking:
        parts.remove("thinking")
    effort = parts[-1] if parts and parts[-1] in RANK else None
    if effort:
        parts.pop()
    return "-".join(parts), effort, fast


def version_key(ident):
    nums = []
    for tok in ident.split("-"):
        if tok and all(part.isdigit() for part in tok.split(".")):
            nums.extend(int(part) for part in tok.split("."))
    return tuple(nums)


def is_class(ident, kind):
    toks = ident.split("-")
    if kind == "grok":
        return "grok" in toks
    return "claude" in toks and "opus" in toks


def family(slug):
    return slug.split("-", 1)[0]


def slugs_in(text):
    found = []
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("Tip:") or " - " not in line:
            continue
        slug = line.split(" - ", 1)[0].strip()
        if slug and slug != "auto":
            found.append(slug)
    return found


def index_models(slugs):
    by_ident = defaultdict(list)
    for slug in slugs:
        ident, effort, fast = parse_slug(slug)
        thinking = "-thinking" in slug or slug.endswith("-thinking")
        # parse_slug already stripped the token; detect it from the raw slug.
        by_ident[ident].append((effort, fast, thinking, slug))
    usable = {}
    for ident, items in by_ident.items():
        if any(not item[2] for item in items):
            items = [item for item in items if not item[2]]
        usable[ident] = items
    return set(slugs), usable


def pick_id(usable, kind):
    idents = [ident for ident in usable if is_class(ident, kind)]
    if not idents:
        return None

    def rank(ident):
        # Non-cursor wins a version tie.
        return (version_key(ident), 0 if ident.startswith("cursor-") else 1, ident)

    return max(idents, key=rank)


def candidates(ident, effort, fast):
    head = f"{ident}-{effort}" if effort else ident
    tail = "-fast" if fast else ""
    options = [head + tail]
    if effort:
        options.append(f"{ident}-thinking-{effort}{tail}")
        options.append(f"{head}-thinking{tail}")
    else:
        options.append(f"{ident}-thinking{tail}")
    return options


def pick_slug(usable, known, ident, prefer_fast, budget):
    if ident is None:
        return None
    items = usable[ident]
    if not any(effort for effort, _, _, _ in items):
        for want in ([True, False] if prefer_fast else [False]):
            for _, fast, _, slug in items:
                if fast == want and "-thinking" not in slug:
                    return slug
            for _, fast, _, slug in items:
                if fast == want:
                    return slug
        return None
    allow_thinking = all("-thinking" in slug for _, _, _, slug in items)
    wants = [True, False] if prefer_fast else [False]
    for want in wants:
        for effort in EFFORTS[RANK[budget] :]:
            for slug in candidates(ident, effort, want):
                if "-thinking" in slug and not allow_thinking:
                    continue
                if slug in known:
                    return slug
    return None


def suggest(usable, known, kind, prefer_fast, budget):
    if kind == "pair":
        opus = pick_slug(usable, known, pick_id(usable, "opus"), False, budget)
        grok = pick_slug(usable, known, pick_id(usable, "grok"), True, budget)
        if not opus or not grok:
            return "NEEDS_CHOICE"
        return f"{opus}, {grok}"
    return pick_slug(usable, known, pick_id(usable, kind), prefer_fast, budget) or "NEEDS_CHOICE"


def retarget(current, known, suggestion, budget):
    ident, _, fast = parse_slug(current)
    for effort in EFFORTS[RANK[budget] :]:
        slug = f"{ident}-{effort}" + ("-fast" if fast else "")
        if slug in known:
            return slug
    bare = ident + ("-fast" if fast else "")
    if bare in known:
        return bare
    return suggestion


def apply_current(suggestion, current, known, budget):
    if not current:
        return suggestion
    if current in ("inherit-parent", "auto") or "," in current:
        return current
    if "," in suggestion:
        families = {family(part.strip()) for part in suggestion.split(",")}
        if family(current) not in families:
            return current
        return retarget(current, known, suggestion, budget)
    if suggestion == "NEEDS_CHOICE" or family(current) != family(suggestion):
        return current
    return retarget(current, known, suggestion, budget)


def propose(text, budget, current):
    known, usable = index_models(slugs_in(text))
    lines = []
    for role, kind, prefer_fast in ROLES:
        suggestion = suggest(usable, known, kind, prefer_fast, budget)
        value = apply_current(suggestion, current.get(role), known, budget)
        lines.append(f"{role}: {value}")
    return lines


def load_current(path):
    vals = {}
    for line in open(path):
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("---") or ":" not in line:
            continue
        role, val = line.split(":", 1)
        role, val = role.strip(), val.strip()
        if role in ROLE_NAMES:
            vals[role] = val
    return vals


def agent_models():
    try:
        proc = subprocess.run(["agent", "models"], text=True, capture_output=True)
    except FileNotFoundError:
        sys.exit("agent models failed: agent not on PATH")
    if proc.returncode != 0:
        sys.exit(proc.stderr.strip() or "agent models failed")
    return proc.stdout


def self_check():
    text = """
Available models

auto - Auto
grok-4.7-low-fast - g
grok-4.7-xhigh - g
grok-4.7-xhigh-fast - g
cursor-grok-4.7-xhigh-fast - g
claude-opus-5-5-low - o
claude-opus-5-5-xhigh - o
claude-opus-5-5-xhigh-fast - o
claude-opus-5-5-max - o
claude-opus-5-thinking-xhigh - o
claude-opus-5-xhigh - o
claude-4.6-opus-high - o
claude-4.6-opus-high-thinking - o
composer-2.5 - c
"""
    lines = dict(line.split(": ", 1) for line in propose(text, "xhigh", {}))
    assert lines["bug-fix"] == "grok-4.7-xhigh-fast"
    assert lines["how explorer"] == "grok-4.7-xhigh-fast"
    assert lines["judgment and prose"] == "claude-opus-5-5-xhigh"
    assert lines["how explainer"] == "claude-opus-5-5-xhigh"
    assert lines["clean-comments reviewer"] == "claude-opus-5-5-xhigh"
    assert lines["arena runners"] == "claude-opus-5-5-xhigh, grok-4.7-xhigh-fast"
    low = dict(line.split(": ", 1) for line in propose(text, "low", {}))
    assert low["bug-fix"] == "grok-4.7-low-fast"
    assert low["hardest tasks"] == "claude-opus-5-5-low"
    kept = dict(
        line.split(": ", 1)
        for line in propose(
            text,
            "xhigh",
            {
                "bug-fix": "composer-2.5",
                "perf-issue": "grok-4.7-low-fast",
                "judgment and prose": "claude-opus-5-5-low",
                "arena runners": "inherit-parent, auto",
            },
        )
    )
    assert kept["bug-fix"] == "composer-2.5"
    assert kept["perf-issue"] == "grok-4.7-xhigh-fast"
    assert kept["judgment and prose"] == "claude-opus-5-5-xhigh"
    assert kept["arena runners"] == "inherit-parent, auto"
    # No effort at or below low except a higher opus → choice.
    thin = "grok-4.7-high-fast - g\nclaude-opus-5-5-high - o\n"
    thin_lines = dict(line.split(": ", 1) for line in propose(thin, "low", {}))
    assert thin_lines["bug-fix"] == "NEEDS_CHOICE"
    assert thin_lines["hardest tasks"] == "NEEDS_CHOICE"
    only_thinking = "claude-opus-5-thinking-xhigh - o\ngrok-4.7-xhigh-fast - g\n"
    thinking_lines = dict(line.split(": ", 1) for line in propose(only_thinking, "xhigh", {}))
    assert thinking_lines["hardest tasks"] == "claude-opus-5-thinking-xhigh"
    mixed = "claude-opus-5-thinking-xhigh - o\nclaude-opus-5-high - o\ngrok-4.7-xhigh-fast - g\n"
    mixed_lines = dict(line.split(": ", 1) for line in propose(mixed, "xhigh", {}))
    assert mixed_lines["hardest tasks"] == "claude-opus-5-high"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--budget", choices=EFFORTS)
    parser.add_argument("--current")
    parser.add_argument("--role")
    parser.add_argument("--models-file")
    parser.add_argument("--self-check", action="store_true")
    args = parser.parse_args()
    if args.self_check:
        self_check()
        return
    if not args.budget:
        parser.error("--budget is required")
    if args.role and args.role not in ROLE_NAMES:
        sys.exit(f"unknown role: {args.role}")
    text = open(args.models_file).read() if args.models_file else agent_models()
    current = load_current(args.current) if args.current else {}
    lines = propose(text, args.budget, current)
    if args.role:
        value = next(line.split(": ", 1)[1] for line in lines if line.startswith(args.role + ": "))
        print(value)
        return
    print("\n".join(lines))


if __name__ == "__main__":
    main()
