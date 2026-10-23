---
name: technical-writing
description: "Technical-writing standard for English and German docs: Diátaxis modes, Google developer style, STE rules, Global English. Use when writing, reviewing, or restructuring docs, READMEs, tutorials, how-to guides, reference, explanations, RFCs, ADRs, PR descriptions, or commit messages."
---

# Technical writing

The goal is writing a tired engineer understands on the first read. Four layers get you there, one question each: what kind of document is this, how do sentences address the reader, how much does each sentence carry, and can any sentence be read two ways. Apply all four.

Three rules sit above the layers:

- **Cut every word that does no work.** If the sentence survives without a word, the word goes. "In order to" is "to". "It is important to note that" is nothing.
- **Use the short, everyday word.** "Use", not "utilize". "Help", not "facilitate". "Do", not "perform". A long word has to buy its length with precision.
- **When a rule makes a sentence worse, fix the sentence another way or leave it alone.** The rules serve the reader. A sentence that follows every rule and sounds like a machine wrote it has failed.

The codebase is the word list. Write the real symbol, file, flag, or command name, not a synonym or a description of it.

Use the words a developer says out loud: "move", "delete", "a budget that only decreases", not "evacuate", "ratchet", or "endgame". A named pattern is fine when the doc says what it means the first time.

## Pick the language

Write in English. Write German only when the user asks for German or when you edit a document that is already German. The language of the conversation does not choose the language of the document. One document, one language. Code, paths, flags, commands, log lines, and quoted error messages stay verbatim in both. Every layer below applies to both languages. [Write German](#write-german) adapts them.

## Vary the rhythm

The layers decide what a document says and how much each sentence carries. A doc can obey all of them and still read machine-written: every sentence clipped short, no view anywhere, nothing specific.

- Mix sentence lengths on purpose. Short sentences land a point. Longer ones that take their time carry a fact with its condition or consequence.
- One thought per sentence does not mean one length per sentence. Split the sentence that carries two thoughts. Keep the long sentence that carries one.
- Have a view where the mode allows it. Explanation weighs trade-offs, so say what you make of them instead of listing pros and cons. Reference stays dry.
- Be specific over sterile. Not "schema changes can cause issues" but "a column rename fails the build".

## Pick the mode first (Diátaxis)

One document, one mode. Two questions pick it: does the content inform action (doing) or cognition (knowing), and does it serve the reader's study (acquiring a skill) or work (applying it)?

| Mode | Informs | Serves | Reader asks | Like |
|---|---|---|---|---|
| Tutorial | action | study | "Can you teach me to…?" | a cooking lesson |
| How-to guide | action | work | "How do I…?" | a recipe |
| Reference | cognition | work | "What is…?" | the facts on a food packet |
| Explanation | cognition | study | "Why…?" | an essay on culinary history |

Use the [compass](https://diataxis.fr/compass/) on a whole document, a section, or one sentence. Trust it over intuition, which often answers fast and wrong. Tutorial versus how-to is not basic versus advanced: a tutorial can teach an advanced skill, and a how-to can cover a routine chore. Each mode below links its diataxis.fr page. Fetch the page when a draft keeps fighting its mode or a review needs the full principles.

**Tutorial: a lesson** ([tutorials](https://diataxis.fr/tutorials/)). You are the teacher. The learner's success is your job, not theirs. Open by saying what the learner will build, not what they will "learn". Every step produces a visible result, early and often. Keep a narrative of the expected: show the output, point out what to notice ("the prompt changes to…"), and flag the likely failure ("If you see X, you skipped Y"). One path only: no options, no alternatives. Cut explanation to one clause and a link. Stay concrete. Write as "we", in commands: "First, do x. Now, do y." Close by naming what the learner built. Pin versions and sample data so nothing unexpected happens, keep every step safe to repeat, and run the tutorial end to end before you ship it. It must work for every reader, every time.

**How-to guide: steps to a goal** ([how-to guides](https://diataxis.fr/how-to-guides/)). Solve a problem a person has, not an operation the machine can perform. Assume competence: skip what anyone in the domain knows. Action only: no teaching, no background, no completeness for its own sake. Link those instead. Real work is messy, so allow forks and judgment ("If you want x, do y") and warn about what can go wrong. Start and end at a meaningful point. The reader joins it to their own work. Order steps so the reader's thinking flows, without needless switches between tools or open questions held for later. Name the guide by the task: "How to integrate APM", not "Integrating APM", and never just "APM".

**Reference: facts for lookup** ([reference](https://diataxis.fr/reference/)). Describe. Only describe. No instruction, no persuasion, no opinion. Be austere, complete, and sure. State facts, options, defaults, limits, and errors with no hedging. Warnings are facts too: "Never call `x` before `y`." Mirror the structure of the code, so code and docs can be navigated together and gaps show. Give every entry the same pattern. A short usage example is fine. An example that starts to say why has become explanation. Generate from code where possible, so it stays true.

**Explanation: understanding and why** ([explanation](https://diataxis.fr/explanation/)). One bounded topic, readable away from the keyboard. It may live under Background, Concepts, or Topics. Each title should tolerate an implicit "About..." in front. Anchor on a real why question. That question also tells you where to stop. Give context: design decisions, history, constraints, and the alternatives considered. Connect the topic to its neighbours. Opinion is allowed here and nowhere else.

Modes blur where they share an edge on the [map](https://diataxis.fr/map/): tutorials and how-to guides both guide action, reference and explanation both hold knowledge, how-to guides and reference both serve work, tutorials and explanation both serve study. The [tutorial and how-to collapse](https://diataxis.fr/tutorials-how-to/) is the most common and the most harmful. [Reference drifts into explanation](https://diataxis.fr/reference-explanation/) through its examples. Don't mix modes: no reference tables inside a tutorial, no hand-holding inside reference, no arguing inside a how-to. Split and link instead.

## Improve existing docs in small steps

Diátaxis is a guide, not a plan ([workflow](https://diataxis.fr/how-to-use-diataxis/)).

- Leave out empty tutorial, how-to, reference, and explanation sections. Structure grows from the inside, out of content that has been improved.
- Work in a loop. Take the piece in front of you: a page, a section, or a sentence. Ask which reader need it serves, and how well. Make the one change that improves it most. Commit it. Repeat.
- Moving content between modes exposes gaps. Explanation lifted out of a tutorial often reveals a step the reader had to guess. Fill the gap.
- Diátaxis cannot check facts ([quality](https://diataxis.fr/quality/)). Accuracy, completeness, and consistency come first. Flow and fit to the reader depend on them.
- Docs are never finished, but every commit leaves them complete: useful as they stand.

## Write sentences to the reader (Google developer style)

- Talk to the reader as "you", in the present tense. "Will" only for things that genuinely happen later.
- Say who does what: "the compiler checks", not "is checked". Passive is fine only when the actor is unknown or beside the point.
- Write instructions as commands: "Click Submit." State facts plainly. Never "should be done".
- Put the condition before the instruction: "To delete the document, click Delete." The reader skips what does not apply.
- Put the common case first. Exceptions after.
- Sound like a knowledgeable friend. No buzzwords, no figurative language, no "please" in instructions, and never "simply", "easy", or "quickly" in a procedure. If it were simple, the reader would not be here.
- Don't pre-announce ("we will soon support...") and don't start consecutive sentences with the same phrase.
- Link with words that say where the link goes: the page title or a short description. Never "click here". Prefer a sentence of context on the page over a link off it.
- Headings carry the point, not just the topic ("Pick the mode first", not "Modes"). Sentence case. A task heading is a bare verb phrase ("Create an instance"). A concept heading is a noun phrase. One h1 per page, no skipped levels.
- Numbered lists for sequences, bullets for everything else. Introduce a list with a complete sentence. Keep items parallel.
- Code goes in code font. UI elements go in bold. Use serial commas. Drop "etc." and say up front that a list is partial.

## Make statements load one at a time (STE rules)

- One instruction per sentence. One thought per sentence everywhere else.
- Split instructions longer than about 20 words and other sentences longer than about 25.
- Put the warning or condition before the step it guards: "If hot oil touches your skin, injuries can occur."
- Keep "the" and "a": "Remove backup file" reads two ways. "Remove the backup file" reads one.
- Give each word one meaning and one job, then keep it. If "check" means inspect, don't also use it for restrain.
- Pick one word per action and stick to it: "start", not "start" here and "initiate" there.
- Write procedures as direct commands, never as narration and never in the passive: "Install the component", not "the component must be installed".
- Avoid "-ing" words where you can. They take too many grammatical jobs and breed misreadings.

## Leave no sentence open to two readings (Global English)

- Keep words like "only" and "not" next to the word they change: "only fails on growth" and "fails only on growth" say different things.
- Break up long noun strings: "the proto import budget check script" becomes "the script that checks the proto-import budget".
- Make every "it", "they", and "this" point at one obvious thing. Repeat the noun when in doubt. Never use "this" or "which" to point at a whole clause.
- Don't drop verbs: "Phase 1 moves the converters and Phase 2 the runtime" leaves Phase 2 without one. Give it one.
- Keep the small words that show structure. "Ensure that the switch is off" keeps "that" because it makes the sentence parse one way.
- Repeat the article in a series when it prevents a misread: "the client and the host", not "the client and host", when they are two things.
- Say which parts "and" or "or" joins when a sentence can group two ways. "Both...and", "either...or", and "if...then" are free disambiguators.
- Use periods, not semicolons. Replace an em dash with a new sentence.
- Make text in parentheses a full grammatical unit or its own sentence. Never form plurals with "(s)".
- No slashes: write "a, b, or both" instead of "a/b" or "and/or".
- Call each thing by one name, everywhere. A doc that says "the gate", "the ratchet", and "the budget check" for one thing teaches three things. Don't reword sentences whose meaning didn't change.
- Skip idioms, colloquialisms, Latin abbreviations, and metaphors. A non-native reader, a translator, and an agent all parse plain constructions best.

## Write German

German docs follow every layer above. Write idiomatic German, never a literal translation of English sentence patterns ([Diátaxis translation guide](https://diataxis.fr/translation/)).

- Address the reader as "Sie". Use "du" only when the project's German docs already do. Never mix. Tutorials still say "wir": "Zuerst erstellen wir…".
- Write steps as imperatives, condition first: "Um das Dokument zu löschen, klicken Sie auf **Löschen**."
- Prefer verbs to Nominalstil: "Die Durchführung der Konfiguration erfolgt in `budget.json`" becomes "Konfigurieren Sie das Budget in `budget.json`." Prefer active voice to "wird … durchgeführt" and imperatives to "man".
- German moves the main verb to the end of the clause. Split long sentences before the reader loses track of the subject.
- Break up long compounds: "Proto-Import-Budget-Prüfskript" becomes "das Skript, das das Proto-Import-Budget prüft". Hyphenate compounds with English parts or acronyms: "API-Schlüssel", "Docker-Image".
- Replace "sollte" with "muss" or "kann". Cut "einfach", "eigentlich", "natürlich", "lediglich", "ja", and "halt".
- Keep the English terms the team says out loud, and only when the sentence means that term: Branch, Commit, Pull Request, Deployment. Fix each term once. Use a German verb where one exists: "hochladen", not "uploaden".
- Translate the meaning in this sentence. A loanword or a German lookalike is often wrong. Context decides the word.
  - "Committed budget" is the agreed limit: "das vereinbarte Budget", not "das committete Budget". Commit stays Commit for the git action.
  - "The actual count" is "die tatsächliche Anzahl", not "die aktuelle Anzahl". "Aktuell" means current.
  - "Eventually the job finishes" is "Der Job wird schließlich fertig", not "Der Job wird eventuell fertig". "Eventuell" means possibly.
  - "You must not deploy" is "Sie dürfen das Deployment nicht ausführen", not "Sie müssen das Deployment nicht ausführen". "Müssen nicht" means there is no obligation.
  - "This flag controls the timeout" is "Dieses Flag steuert den Timeout", not "Dieses Flag kontrolliert den Timeout". "Kontrollieren" means to inspect.
  - "Sensitive data" is "sensible Daten", not "sensitive Daten".
  - "Handle the error" is "Behandeln Sie den Fehler", not "Handeln Sie den Fehler". "Handeln" means to trade or to act.
  - "This issue happens when the file is missing" is "Dieser Fehler tritt auf, wenn die Datei fehlt". Issue stays Issue when you mean the ticket.
- Task headings are infinitive phrases: "Instanz erstellen". How-to titles name the task: "Monitoring einrichten". Explanation titles tolerate an implicit "Über…".
- Address everyone: prefer "Sie" and neutral nouns ("das Team", "Personen, die…") to gender markers, unless the project has its own convention.
- Use the German decimal comma in prose. Quotes are straight keyboard quotes in both languages: "these". Code and output stay as they are.

## Voice and repo specifics

- Cut AI tells by reading and applying `/noslop`.
- PR descriptions and commit messages are writing too. Every layer except Diátaxis applies to them. A PR body is a briefing that a reviewer can read in under a minute. Link logs, SHA lists, and metric tables instead of pasting them.
- Product UI strings are not documentation. Use your product's copy guidelines for those.
- Write real paths and real symbols. Make every count or tree claim true at the commit that lands it, and include the command that regenerates it.

## Worked example

Before:

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

After, in English and in German:

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.

> `budget.mjs` liest das vereinbarte Budget aus `budget.json` und zählt die Dateien mit Proto-Import. Überschreitet die Anzahl das Budget, schlägt die CI fehl. Führen Sie `budget.mjs --write` nur aus, um das Budget zu senken.
