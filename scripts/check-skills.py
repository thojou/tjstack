#!/usr/bin/env python3
"""Check the tjstack skill tree: one category level, unique names, listed in both manifests, links resolve."""
import json
import re
import sys
from pathlib import Path

PLUGIN = Path(__file__).resolve().parent.parent / "tjstack"
SKILLS = PLUGIN / "skills"
MANIFESTS = [PLUGIN / ".claude-plugin/plugin.json", PLUGIN / ".cursor-plugin/plugin.json"]
# A relative path in prose or a link. Placeholders such as ../<name>/ never match.
RELATIVE = re.compile(r"(?<![\w.-])((?:\.\./)+[\w.-]+(?:/[\w.-]+)*)")

errors = []
names = {}
for skill in sorted(SKILLS.glob("*/*/SKILL.md")):
    skill_dir = skill.parent
    match = re.search(r"^name:\s*(\S+)", skill.read_text(), re.M)
    if not match or match.group(1) != skill_dir.name:
        errors.append(f"{skill}: frontmatter name does not match directory {skill_dir.name}")
    if skill_dir.name in names:
        errors.append(f"{skill}: name {skill_dir.name} also in {names[skill_dir.name]}")
    names[skill_dir.name] = skill_dir.parent.name

for stray in SKILLS.glob("*/SKILL.md"):
    errors.append(f"{stray}: skill outside a category directory")

categories = sorted(p.name for p in SKILLS.iterdir() if p.is_dir())
for manifest in MANIFESTS:
    listed = sorted(Path(p).name for p in json.loads(manifest.read_text()).get("skills", []))
    if listed != categories:
        errors.append(f"{manifest}: skills lists {listed}, directories are {categories}")

# Skills write paths relative to the file or to their own skill directory.
for doc in sorted(SKILLS.glob("*/*/**/*.md")):
    skill_dir = SKILLS / doc.relative_to(SKILLS).parts[0] / doc.relative_to(SKILLS).parts[1]
    fenced = False
    for line_no, line in enumerate(doc.read_text().splitlines(), 1):
        if line.lstrip().startswith("```"):
            fenced = not fenced
        # Fenced blocks and `[text](path)` in backticks show example links, not real ones.
        if fenced:
            continue
        line = re.sub(r"`[^`]*\]\([^`]*`", "", line)
        for target in RELATIVE.findall(line):
            if not any((base / target).resolve().exists() for base in (doc.parent, skill_dir)):
                errors.append(f"{doc.relative_to(PLUGIN)}:{line_no}: {target} does not resolve")

print("\n".join(errors) or f"ok: {len(names)} skills in {len(categories)} categories")
sys.exit(1 if errors else 0)
