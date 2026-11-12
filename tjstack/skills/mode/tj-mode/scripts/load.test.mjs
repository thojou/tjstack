import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const scripts = dirname(fileURLToPath(import.meta.url));
const loader = join(scripts, "load.mjs");
const modeDir = dirname(scripts);
const skillsDir = resolve(modeDir, "../..");
const load = (...args) => spawnSync(process.execPath, [loader, ...args], { encoding: "utf8" });
const block = (file) => `<file path="${file}">\n${readFileSync(file, "utf8").trimEnd()}\n</file>\n\n`;

test("prints a playbook, a skill, and a principle by short name, in argument order", () => {
	const result = load("playbooks/bug-fix.md", "noslop", "laziness-protocol");
	assert.equal(result.status, 0, result.stderr);
	assert.equal(
		result.stdout,
		block(join(modeDir, "playbooks/bug-fix.md")) +
			block(join(skillsDir, "writing/noslop/SKILL.md")) +
			block(join(skillsDir, "principles/principle-laziness-protocol/SKILL.md")),
	);
});

test("prints a file once when two arguments name it", () => {
	const result = load("principle-prove-it-works", "prove-it-works");
	assert.equal(result.stdout, block(join(skillsDir, "principles/principle-prove-it-works/SKILL.md")));
});

test("still prints what it found, then names every missing argument and exits 1", () => {
	const result = load("no-such-skill", "noslop", "playbooks/nope.md");
	assert.equal(result.status, 1);
	assert.equal(result.stdout, block(join(skillsDir, "writing/noslop/SKILL.md")));
	assert.equal(result.stderr, "not found: no-such-skill, playbooks/nope.md\n");
});

test("prints a large file in full when a later argument is missing", () => {
	const file = join(tmpdir(), `load-large-${process.pid}.md`);
	writeFileSync(file, "x".repeat(200_000));
	try {
		const result = load(file, "no-such-skill");
		assert.equal(result.status, 1);
		assert.equal(result.stdout, block(file));
		assert.equal(result.stderr, "not found: no-such-skill\n");
	} finally {
		rmSync(file);
	}
});

test("prints usage and exits 2 without arguments", () => {
	const result = load();
	assert.equal(result.status, 2);
	assert.match(result.stderr, /^Usage: /);
});
