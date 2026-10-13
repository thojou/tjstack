---
name: create-verification-skill
description: "Generate a project-local skill that drives a browser app, a CLI, or both the way a user does. Use for /create-verification-skill, \"make a verify skill for this repo\", or when the project has no scripted way to prove browser or CLI behavior."
disable-model-invocation: true
---

# Create a verification skill

Write `.cursor/skills/verify-<slug>/` in the repo under test. The next agent reads it cold and drives the app. Browser and CLI are the surfaces you script whenever the repo has them.

Prove the real user path and read the resulting state (the **prove-it-works** principle skill). Assert the value the user sees (the **test-behavior-not-implementation** principle skill).

## 1. Interview the repo, not the user

Answer from the codebase. Ask only what you cannot observe.

**Surfaces.** Name every surface a person operates, then pick a primary:

- **Browser.** A page with a URL. Signals: routes, a Playwright or Cypress config, a port in the README, an HTML entry.
- **CLI.** A command a person types. Signals: a `bin` entry, a console or argument parser, README usage, a `make` target.
- **Both.** One skill covers both. A browser drive leaves the CLI unverified. A CLI drive leaves the browser unverified.
- **HTTP API with no page and no CLI.** Drive it as a CLI: the repo's HTTP client or `curl`, asserting status and body.
- **Desktop or mobile.** A dev URL or CDP port is a browser. A command the person runs is a CLI. A native window with neither gets no click path. Stop when that is the only surface, and say so.
- **Library with nothing to run.** Stop. This skill drives an app a person starts.

**Run.** The repo's own command from the README, package scripts, or Makefile. Record ports, env, seed data, auth, and working directory.

**Drive.** Use a harness the repo already runs. Otherwise record the recipe you will prove in step 4:

- Browser: open the run's own URL. Handles are role, accessible name, URL, and `data-*` attributes the app already renders. Wait for a heading, status, or URL, which you name. Coordinates and tab order are not handles.
- CLI: the real argv in a new process. Capture stdout, stderr, and the exit code. Use a PTY or tmux session only when the command reads a prompt. That session belongs to this run.

Start a server, browser context, and process for this run. Leave the user's open browser, dev server, and terminal alone.

**Observe.**

- Browser: the action, the next URL or accessible state, and the side effect shown again through the UI (a row, a file, a record). The proof is an ARIA or text snapshot a script can diff. A screenshot is extra context.
- CLI: the full command, stdout, stderr, exit code, and a second read of the side effect through a user-facing query or the file the command writes.

**Isolate.** Two runs need different ports, data directories, profiles, and PTYs. When the app cannot do that, the generated skill refuses to drive an instance this run did not start.

Done when you can name the surfaces, the start command, and the drive recipe. When the checkout does not start, fix a missing env file, port, or seed step the README already names. Stop when the fix is product work, and report the exact failure. A missing sample config that the app never serves as a feature may be created by the generated skill, marked as verification scaffolding, and removed in cleanup.

## 2. Generate the skill

Slug: lowercase the app or repo name, collapse each run of non-alphanumerics to one hyphen, and strip a leading or trailing hyphen. Directory: `.cursor/skills/verify-<slug>/`. `name` is `verify-<slug>` and at most 64 characters. If that directory exists, update it. If several `verify-*` skills exist, ask which one.

Frontmatter `description` names the app, the surfaces, and when to run the skill.

Fill every section from the interview. Leave no placeholders.

**Launch.** The exact command, then the signal that the app is usable. A listening port is not that signal: a health check can pass while init is still running. Wait for the seed or ready log the interview found. Include teardown.

- Browser: disposable data dir, port this run picked, migrations and seed finished, then the user journey can start.
- CLI: build or install once. Each drive is a new process. Keep a server only when the command under test is a server, and then follow the browser rules for that port.

**Doctor.** One read-only check the agent runs before the first drive and after any surprising failure. Browser: process up, this run owns the port, URL and data dir match, seed or test auth is present. CLI: the binary is the one this run built, the data dir is the disposable one, version or build id matches.

**Drive.** Commands and selectors from this repo. When both surfaces exist, use both subsections.

- **Browser.** URL, role, accessible name, and the text or URL that shows the step worked.
- **CLI.** Argv, exit code, and the literal stdout or stderr fragment. For a prompted command, the PTY transcript and the session name.

**Evidence.** A path outside the disposable data dir. Capture the action and the resulting state. Check side effects beside what is visible. Mock only where production already isolates that external system. For a dry-run or test mode, record the files, network, or git refs it left untouched.

**Cleanup.** Stop processes and sessions this run started, by pid, port owner, or session name. Remove scratch state. Leave the evidence files.

**Helpers.** Any script is executable, and the skill body shows the command. One script may expose `browser` and `cli`. Ship only the subcommands for surfaces the repo has.

Done when the file exists, the frontmatter matches, and every command in it comes from this repo.

## 3. Seed the feature map

Create `features/README.md` and one file for each of the top 3–5 user-facing features, taken from routes, commands, and docs. Follow [`references/feature-map-example/`](references/feature-map-example/). Copy the headings. Replace every command with one from this repo.

Each feature file starts with an H1 and one paragraph of user-visible behavior, then these H2s in order:

1. `Sub-features`
2. `How to get to it (user POV)` lists every entry point. A feature with a page and a command lists both.
3. `Driving it with <harness>` starts with `Preconditions:` and pairs each user action with a command and an observable result.
4. `Gotchas`

A missing precondition fails the journey. Write the reason in `Gotchas`. Keep the journey intact. A proof that uses one entry point is unfinished while the map lists another. A browser-only app omits CLI bullets. A CLI-only app omits browser bullets, ARIA snapshots, and screenshots.

Done when the index links every feature file and each file has those four H2s.

## 4. Prove the skill before you hand it over

Run the generated instructions. Launch, run doctor, then drive. Cover every surface the skill claims:

- Browser: one mapped browser feature, through the harness, to an evidence file.
- CLI: one mapped CLI feature, same bar.
- Both: one browser drive and one CLI drive. The same feature file is enough when it lists both.

The evidence has to come from a command the skill names, rerunnable in a second shell. An IDE click with no such command leaves the skill a draft.

After cleanup, confirm the evidence is still at the named path. Run cleanup after every failed attempt so ports and PTYs do not linger.

A stand-in (a container for a VM, a local stack for a remote host) leaves a list of setup steps the real target will not perform. Those steps stay unverified.

Done when each claimed surface has one drive, and the evidence survives cleanup.

## 5. Hand back

Tell the user the skill path, the surfaces, the feature files, and what the proof run printed. The map goes stale when the app changes. Re-run launch, doctor, and the drives for the features a change touches, and edit the map from that evidence.

**Reply:** path, surfaces, proof result. Write it through **noslop**.
