---
name: noslop
description: >-
  Rewrite text so it no longer reads as model output: stock vocabulary,
  fake balance, chatbot closers, and sentences that praise a result
  instead of stating it. Use when the user says noslop, asks to cut AI
  slop, or wants a draft to read as if a person wrote it.
disable-model-invocation: true
---

# Noslop

Edit the text in front of you. Keep the meaning and the tone the writer chose. Remove the tells below. Once this skill is in context, apply it to every sentence you write or change, including comments, commit messages, and pull request bodies.

Docs still follow `technical-writing`. This skill does not pick a document mode, and it does not restyle a correct sentence that already says the fact.

## Edit

1. Mark every tell.
2. Rewrite those sentences. Do not add a closer, a summary, or a claim the source did not make.
3. Read it again. A sentence that could sit unchanged in another project's docs says nothing here. Name the file, flag, command, or number, or cut the sentence.

If a rewrite changes the meaning, or makes the sentence harder to read, keep the original wording and cut only the tell.

## Tells

### Claims with nothing behind them

- Trailing "-ing" phrases that clap for the sentence: "highlighting", "ensuring", "reflecting", "showcasing", "fostering". Delete them, or replace them with the source, the count, or the command.
- Name the person, the paper, or the file. Otherwise delete the claim.
  English: "Experts believe", "reports suggest", "some argue".
  German: "Studien zeigen".

### Words that mark the draft

Replace these with the plain word, or delete them.

English: additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (as "the area around X"), pivotal, showcase, tapestry, testament, underscore, vibrant, robust, seamless, leverage, utilize, facilitate.

German: nahtlos, entscheidend, "zusammenfassend lässt sich sagen", "es ist wichtig anzumerken", "eine Vielzahl von", "in der heutigen Zeit".

- English: "serves as", "stands as", "boasts", "features". Write "is" or "has".
- German: "stellt sich dar als". Write "ist" or "hat".
- Say the point.
  English: "Not only X, but Y".
  German: "nicht nur X, sondern auch Y".
- Three items because three looks finished. Use the real number.
- A new synonym every sentence for the same thing. Pick one name and repeat it.
- Name the topics when the two ends are not a scale.
  English: "from X to Y".
  German: "von X bis Y".

### Page furniture

- Em dashes. End the sentence, or use a comma.
- A colon that only pivots the sentence. A colon before a list or a literal example stays.
- Bold on every other phrase, including every product name. Bold a UI label, or the few words that carry the point.
- A bold label, a colon, and a sentence that repeats the label. Write the sentence. A bold lead-in that names the item and is followed by a new fact can stay.
- Title Case In Headings. Sentence case. German task headings stay infinitive phrases, as in `technical-writing`.
- Emoji in headings and list markers.
- Curly quotes, including German low-high quotes. Straight keyboard quotes in both languages: "these".

### Talk aimed at the chat

Delete these closers and fillers.

English: "I hope this helps", "let me know if", "of course", "certainly", "great question".

German: "gerne", "selbstverständlich", "gute Frage".

Start with the answer. Do not praise the question first. End on the last fact. Do not offer more help, and do not predict that the work will go well. Cut a throat-clearing intro and a summary outro.

English: "In this document we will...", "In conclusion".

German: "In diesem Dokument werden wir...", "Zusammenfassend lässt sich sagen".

### Padding

- English: "in order to" is "to". Delete "it is important to note that".
- German: "aufgrund der Tatsache, dass" is "weil". Delete "es ist wichtig zu beachten, dass".
- English: "could potentially possibly" is "may", or a fact.
- State the plan, or stop.
  English: "The future looks bright".
  German: "wir sind zuversichtlich".

### Nouns that only sound technical

substrate, wedge, vector (as "way"), locus, vantage, nexus, primitive (as a noun for an idea), harness (when you do not mean the test harness), surface (when you cannot name the UI or the API), bedrock, scaffolding (as metaphor), modality, paradigm, north star, flywheel, gold-plating, ratchet (unless that is the mechanism's name), endgame.

Write the concrete word: base, add, way, the test harness, the named API, more than the job needs, the last phase.

### Sentences that dodge the fact

- A sentence about how the system feels ("stays close at hand", "SQL you can read"). Say what runs, what fails, or the number.
- A sentence the reader has to reparse. Split it. Keep "a" and "the". Do not collapse it into a fragment or an arrow chain.
- Name who does it.
  English: "is validated".
  German: "wird durchgeführt".
- An adverb holding up a weak verb ("runs quickly", "significantly improves"). Use the verb, or the measured change. "simply" and "just" do not belong in a procedure.
- An aphorism, a personified file, or a figurative verb ("rides along", "stands on") where a literal sentence exists. Say what happens.

## Example

English before:

> It is important to note that `import.mjs` serves as a robust safeguard, ensuring that a bad date is seamlessly rejected.

English after:

> `import.mjs` rejects a bad date.

German before:

> Es ist wichtig anzumerken, dass `import.mjs` sich als entscheidender Schutz darstellt und dabei sicherstellt, dass ein ungültiges Datum nahtlos abgelehnt wird.

German after:

> `import.mjs` lehnt ein ungültiges Datum ab.
