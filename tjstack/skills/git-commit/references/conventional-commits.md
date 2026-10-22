# Conventional Commits

Read this when picking the type, the scope, or how to mark a breaking change. The repo's own convention wins where it differs.

## Shape

```text
<type>(<scope>)!: <subject>

<body>

<trailers>
```

Scope, `!`, body, and trailers are optional.

## Type

| Type | The change |
|---|---|
| `feat` | Adds behavior a user or caller can notice |
| `fix` | Corrects behavior that was wrong |
| `refactor` | Restructures code with no behavior change |
| `perf` | Makes something faster or lighter, same behavior |
| `test` | Touches tests only |
| `docs` | Touches documentation only |
| `style` | Whitespace, formatting, import order, no logic |
| `build` | Build scripts, dependencies, toolchain |
| `ci` | Pipeline definitions |
| `chore` | Upkeep that fits nothing above |
| `revert` | Undoes an earlier commit, named in the body |

When a commit seems to need two types, it is probably two commits.

## Scope

One short noun for the area the change lives in: a package, module, or feature, such as `parser`, `billing`, or `cli`. Reuse the scopes already in `git log`. Leave the scope out when the change is repo-wide or no single area fits.

## Subject

- Imperative mood: "add", "drop", "handle", not "added" or "adds".
- Lowercase first word, unless it is a proper noun or a code symbol.
- No trailing period.
- Aim for 50 characters, stay under 72.
- Name the concrete thing that changed, such as a function, flag, or endpoint, instead of "update code" or "fix bug".

| Weak | Better |
|---|---|
| `fix: fixed bug` | `fix(parser): accept trailing commas in arrays` |
| `feat: updates` | `feat(cli): add --dry-run to sync` |
| `chore: stuff.` | `chore: drop unused lodash dependency` |

## Breaking changes

Put `!` before the colon and explain the migration in a trailer:

```text
feat(config)!: read settings from config.toml

BREAKING CHANGE: config.yaml is no longer read. Run `tool migrate-config` once.
```

## Body

Wrap at 72 columns. Explain why the change was needed and what a reader could not tell from the diff: the constraint, the rejected alternative, the follow-up. Skip the body when the subject already says it all.

## Trailers

One per line, after a blank line: `BREAKING CHANGE:`, `Refs: #123`, `Closes: #123`, `Co-Authored-By:`, and whatever attribution the harness or the repo asks for.
