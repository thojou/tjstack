---
name: teach
description: "Teach the user a skill or concept across several sessions from a teaching workspace: a mission, curated resources, short HTML lessons, and learning records that track what the user already understands. Use for /teach, 'teach me X', 'I want to learn X', or continuing a learning topic from an earlier session."
disable-model-invocation: true
argument-hint: "What would you like to learn?"
---

# Teach

The user wants to learn a topic over several sessions. Keep the state in a teaching workspace so each session picks up where the last one ended.

## The workspace

The default is `docs/learn/<topic-slug>/` under the working directory. If the user names another directory, use it.

| File | Holds | Format, read only when writing that file |
| --- | --- | --- |
| `MISSION.md` | Why the user is learning this | [mission-format.md](references/mission-format.md) |
| `RESOURCES.md` | Trusted sources and communities | [resources-format.md](references/resources-format.md) |
| `lessons/NNNN-slug.html` | One lesson per file | [Lesson structure](#lesson-structure) |
| `learning-records/NNNN-slug.md` | What the user now understands | [learning-record-format.md](references/learning-record-format.md) |
| `reference/*.html` | Compressed cheat sheets | None |
| `GLOSSARY.md`, optional | Terms the user has mastered | [glossary-format.md](references/glossary-format.md) |
| `NOTES.md`, optional | The user's teaching preferences and working notes | None |

Lessons and learning records number independently. Get each number from the **adr** skill's script for that directory.

```bash
bash <this skill's directory>/../adr/scripts/next-id.sh <workspace>/lessons
```

**First run.** Create `lessons/`, `learning-records/`, and `reference/`. Write `MISSION.md` before anything else.

**Later sessions.** Read `MISSION.md`, `NOTES.md`, and the highest-numbered learning record before planning the next lesson. Skim `RESOURCES.md` when a gap shows.

**Stopping.** When the user drops the topic, ask whether to mark the mission complete or leave it paused. Delete nothing unless the user asks.

## Each session

1. **Clarify the mission.** If `MISSION.md` is missing or vague, ask the user why they want to learn this. Push for a concrete outcome.
2. **Ground in resources.** Fill or consult `RESOURCES.md` before teaching from memory.
3. **Teach one lesson.** Write one short, self-contained HTML lesson. Pitch it just past what the learning records show the user knows.
4. **Record progress.** Write a learning record only when the user shows real understanding. Update `GLOSSARY.md` or `reference/` when a term or a cheat sheet is earned.

## Principles

- **Knowledge, skills, wisdom.** Knowledge comes from the sources in `RESOURCES.md`. Skills come from interactive lessons. Wisdom questions go to the communities listed there.
- **Retention over fluency.** Use retrieval practice, spacing, and interleaving. A lesson that feels easy is not proof of learning.
- **Every lesson serves the mission.** If you cannot say how a lesson moves the user toward `MISSION.md`, pick another.
- **Zone of proximal development.** Read the learning records before choosing a topic. Do not reteach what a record says the user knows.

## Lesson structure

One HTML file per lesson, `lessons/NNNN-slug.html`. Keep it short enough to finish in one sitting.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{Lesson title}</title>
  <style>/* clean, readable typography */</style>
</head>
<body>
  <article>
    <h1>{Lesson title}</h1>
    <p>{One tightly scoped concept tied to the mission}</p>
    <!-- primary source link, an exercise or quiz, links to related lessons and reference docs -->
    <p><em>Ask follow-up questions in the chat.</em></p>
  </article>
</body>
</html>
```

Each lesson cites one primary, high-trust source, links related lessons and reference docs, and gives the user one tangible win. Write it in the user's language. Open it for the user when the host can (`open`, `xdg-open`, or a file preview).

**Reply:** the lesson path, what it teaches and why it comes next, and any record or glossary entry written this session.
