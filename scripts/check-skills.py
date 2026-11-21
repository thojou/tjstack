#!/usr/bin/env python3
"""Check the tjstack skill tree.

One category level, unique names, both manifests list every category, frontmatter
descriptions parse, relative and plugin-root paths resolve, every cited skill or playbook
exists in this plugin, no link points at a foreign skill, the tj-mode Principles index
lists every principle, the README links every skill and agent, and every link in the
user docs points at a file and heading that exist.
"""
import json
import re
import sys
from pathlib import Path

PLUGIN = Path(__file__).resolve().parent.parent / "tjstack"
SKILLS = PLUGIN / "skills"
AGENTS = PLUGIN / "agents"
TJ_MODE = SKILLS / "mode/tj-mode"
MANIFESTS = [PLUGIN / ".claude-plugin/plugin.json", PLUGIN / ".cursor-plugin/plugin.json"]
# Slash commands the hosts ship, and placeholders that stand for any skill name.
HOST_COMMANDS = {"loop", "name"}

# A relative path in prose or a link. Placeholders such as ../<name>/ never match.
RELATIVE = re.compile(r"(?<![\w.-])((?:\.\./)+[\w.-]+(?:/[\w.-]+)*)")
# Citations of a skill, agent, or playbook by name.
BOLD_PAIR = re.compile(r"\*\*([a-z][a-z0-9-]*)\*\* and \*\*([a-z][a-z0-9-]*)\*\*(?: principle)? skills\b")
BOLD_ONE = re.compile(r"\*\*([a-z][a-z0-9-]*)\*\*(?: principle)? (skill|agent|playbook)s?\b")
BOLD_PRINCIPLE = re.compile(r"\*\*(principle-[a-z0-9-]+)\*\*")
TICK_ONE = re.compile(r"`([a-z][a-z0-9-]*)` (skill|agent|playbook)s?\b")
SLASH = re.compile(r"(?:^|[\s(`\"'])/(?:tjstack:)?([a-z][a-z0-9-]+)(?=[^a-z0-9/:<-]|$)")
INLINE_CODE = re.compile(r"`[^`]*`")
# A plugin path such as `skills/setup/create-skill/SKILL.md`. Placeholders never match.
PLUGIN_PATH = re.compile(r"`((?:skills|agents)/[\w./-]+)`")
# A link to a skill that lives in another repository.
FOREIGN_SKILL = re.compile(r"https?://\S+/SKILL\.md")

errors = []


def frontmatter(path):
    text = path.read_text()
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    return match.group(1) if match else ""


def check_description(path):
    match = re.search(r"^description:[ \t]*(.*)$", frontmatter(path), re.M)
    if not match or not match.group(1).strip():
        errors.append(f"{path.relative_to(PLUGIN)}: no description")
        return
    value = match.group(1).strip()
    # A plain YAML scalar keeps backslashes literally and breaks on ': ' or ' #'.
    if value[0] not in "\"'>|" and ('\\"' in value or ": " in value or " #" in value):
        errors.append(f"{path.relative_to(PLUGIN)}: quote the description, plain YAML misreads it")


names = {}
for skill in sorted(SKILLS.glob("*/*/SKILL.md")):
    skill_dir = skill.parent
    match = re.search(r"^name:\s*(\S+)", frontmatter(skill), re.M)
    if not match or match.group(1) != skill_dir.name:
        errors.append(f"{skill}: frontmatter name does not match directory {skill_dir.name}")
    if skill_dir.name in names:
        errors.append(f"{skill}: name {skill_dir.name} also in {names[skill_dir.name]}")
    names[skill_dir.name] = skill_dir.parent.name
    check_description(skill)

for stray in SKILLS.glob("*/SKILL.md"):
    errors.append(f"{stray}: skill outside a category directory")

agents = {p.stem for p in AGENTS.glob("*.md")}
for agent in sorted(AGENTS.glob("*.md")):
    check_description(agent)
playbooks = {p.stem for p in (TJ_MODE / "playbooks").glob("*.md")}
known = {"skill": set(names) | agents, "agent": agents, "playbook": playbooks}

categories = sorted(p.name for p in SKILLS.iterdir() if p.is_dir())
for manifest in MANIFESTS:
    listed = sorted(Path(p).name for p in json.loads(manifest.read_text()).get("skills", []))
    if listed != categories:
        errors.append(f"{manifest}: skills lists {listed}, directories are {categories}")


def prose_lines(doc):
    """Yield (line number, line) outside fenced code blocks."""
    fenced = False
    for line_no, line in enumerate(doc.read_text().splitlines(), 1):
        if line.lstrip().startswith("```"):
            fenced = not fenced
            continue
        if not fenced:
            yield line_no, line


def check_citations(doc, line_no, line):
    where = f"{doc.relative_to(PLUGIN)}:{line_no}"
    prose = INLINE_CODE.sub("`", line)
    cited = [(name, "skill") for pair in BOLD_PAIR.findall(prose) for name in pair]
    cited += BOLD_ONE.findall(prose) + TICK_ONE.findall(line)
    cited += [(name, "skill") for name in BOLD_PRINCIPLE.findall(prose)]
    for name, kind in cited:
        if name not in known[kind]:
            errors.append(f"{where}: {kind} {name} is not in this plugin")
    for name in SLASH.findall(line):
        if name not in known["skill"] and name not in HOST_COMMANDS:
            errors.append(f"{where}: /{name} is not a skill in this plugin")
    for target in PLUGIN_PATH.findall(line):
        if not (PLUGIN / target).exists():
            errors.append(f"{where}: {target} does not resolve from the plugin root")
    for url in FOREIGN_SKILL.findall(line):
        errors.append(f"{where}: {url} links a skill outside this plugin")


docs = sorted(SKILLS.glob("*/*/**/*.md")) + sorted(AGENTS.glob("*.md"))
for doc in docs:
    in_skill = doc.is_relative_to(SKILLS)
    if in_skill:
        parts = doc.relative_to(SKILLS).parts
        skill_dir = SKILLS / parts[0] / parts[1]
    for line_no, line in prose_lines(doc):
        check_citations(doc, line_no, line)
        if not in_skill:
            continue
        # Skills write paths relative to the file or to their own skill directory.
        # A `[text](path)` in backticks shows an example link, not a real one.
        for target in RELATIVE.findall(re.sub(r"`[^`]*\]\([^`]*`", "", line)):
            if not any((base / target).resolve().exists() for base in (doc.parent, skill_dir)):
                errors.append(f"{doc.relative_to(PLUGIN)}:{line_no}: {target} does not resolve")

# The tj-mode Principles index is how agents find a principle. It has to list each one.
index = (TJ_MODE / "SKILL.md").read_text().split("## Principles", 1)[1].split("\n## ", 1)[0]
indexed = set()
for title, explicit in re.findall(r"^- \*\*([^*]+?)\.?\*\*(?: \(\*\*(principle-[a-z0-9-]+)\*\*\))?", index, re.M):
    indexed.add(explicit or "principle-" + re.sub(r"[^a-z0-9-]", "", title.lower().replace(" ", "-")))
for name in sorted({n for n in names if n.startswith("principle-")} ^ indexed):
    state = "missing from" if name in names else "not a skill, listed in"
    errors.append(f"skills/mode/tj-mode/SKILL.md: {name} {state} the Principles index")

# The README is the public catalog. It links every skill and agent, and each link resolves.
README = PLUGIN.parent / "README.md"
links = set(re.findall(r"\]\(([^)#\s]+)\)", README.read_text()))
for link in sorted(l for l in links if "://" not in l):
    if not (README.parent / link).exists():
        errors.append(f"README.md: {link} does not resolve")
catalog = {f"tjstack/skills/{category}/{name}/SKILL.md" for name, category in names.items()}
catalog |= {f"tjstack/agents/{name}.md" for name in agents}
for missing in sorted(catalog - links):
    errors.append(f"README.md: does not link {missing}")



def anchors(doc):
    """GitHub heading slugs: lowercase, punctuation dropped, spaces as hyphens."""
    return {
        re.sub(r"[^\w\- ]", "", line.lstrip("#").strip().lower()).replace(" ", "-")
        for _, line in prose_lines(doc)
        if line.startswith("#")
    }


# The user docs cite skills and link skills, pages, and headings. Catch a rename that strands them.
LINK = re.compile(r"\]\(([^)\s]+)\)")
for doc in [PLUGIN / "README.md", *sorted((PLUGIN / "docs").glob("**/*.md"))]:
    for line_no, line in prose_lines(doc):
        check_citations(doc, line_no, line)
        for target in LINK.findall(INLINE_CODE.sub("", line)):
            if re.match(r"[a-z]+:", target):
                continue
            path, _, anchor = target.partition("#")
            linked = (doc.parent / path).resolve() if path else doc
            where = f"{doc.relative_to(PLUGIN)}:{line_no}: {target}"
            if not linked.exists():
                errors.append(f"{where} does not resolve")
            elif anchor and linked.suffix == ".md" and anchor not in anchors(linked):
                errors.append(f"{where} names a missing heading")

print("\n".join(errors) or f"ok: {len(names)} skills in {len(categories)} categories, {len(agents)} agents")
sys.exit(1 if errors else 0)
