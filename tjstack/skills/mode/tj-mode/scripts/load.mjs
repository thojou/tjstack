#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const modeDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const skillsDir = path.resolve(modeDir, "../..");
const categories = fs
	.readdirSync(skillsDir, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name);

const resolve = (arg) => {
	if (arg.endsWith(".md")) {
		const file = path.resolve(modeDir, arg);
		return fs.existsSync(file) ? file : null;
	}
	for (const name of [arg, `principle-${arg}`]) {
		for (const category of categories) {
			const file = path.join(skillsDir, category, name, "SKILL.md");
			if (fs.existsSync(file)) return file;
		}
	}
	return null;
};

const args = process.argv.slice(2);
if (!args.length) {
	console.error("Usage: node load.mjs <skill-name | playbooks/<title>.md | path/to/file.md>...");
	process.exit(2);
}

const seen = new Set();
const missing = [];
for (const arg of args) {
	const file = resolve(arg);
	if (!file) {
		missing.push(arg);
		continue;
	}
	if (seen.has(file)) continue;
	seen.add(file);
	process.stdout.write(`<file path="${file}">\n${fs.readFileSync(file, "utf8").trimEnd()}\n</file>\n\n`);
}

if (missing.length) {
	console.error(`not found: ${missing.join(", ")}`);
	process.exitCode = 1;
}
