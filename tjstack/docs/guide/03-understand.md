# Understand Ledger's code first

An agent that edits code it hasn't traced tends to patch the first place the symptom shows up. The fix passes review, and the real defect stays. The remedy is the same as for a new team member: understand first, then change. This page covers the tools for the first half.

| Skill | Question it answers | Changes files |
| --- | --- | --- |
| `/how` | How does this work today, and where does new code belong? | No |
| `/why` | What led to this shape, according to the record? | No |
| `/explain` | Can you walk me through it until I really get it? | No |
| `/teach` | Can you teach me this topic over the coming weeks? | Yes, a learning workspace |
| `/catch-up` | Where did I leave my own work on this? | No |

All five force the agent to put its understanding into words. That gives you something concrete to check, even when the agent knows the codebase better than you do.

## Start with a read-only investigation

If you don't know the cause yet, ask for a diagnosis and forbid a fix:

```text
/tj-mode the nightly dunning job sometimes sends no emails at all. what do we know, which data did you look at, and what are your top hypotheses? no code changes yet.
```

The no-changes constraint lands this in the [Investigation playbook](../../skills/mode/tj-mode/playbooks/investigation.md). It runs `/how`, adds `/why` when the question is about intent, and answers with citations. A question of the form "A or B?" gets a recommendation and a table of trade-offs. Requesting "which data you looked at" splits the answer into what was observed and what was concluded. If the answer points to a fix, open that as a separate task.

## Trace behavior with `/how`

```text
/how does ledger decide which VAT rate applies to a line item? where do customer exemptions come in?
```

[`/how`](../../skills/understand/how/SKILL.md) explains at onboarding depth, the way a senior colleague would on your first week. Expect up to five sections: Overview, Key concepts, How it works, Where things live, and Gotchas.

Small questions get one subagent that reads and explains in a single pass. Questions that span a subsystem get two to four read-only explorers working different slices, followed by one explainer that merges their notes. If your question could mean several things, `/how` says which reading it chose and continues. Redirect it if the reading is off.

Placement questions are a good use too, before you add anything:

```text
/how where should a retry policy for the payment provider webhook live? who owns retries now?
```

## Dig up history with `/why`

```text
/why do we round VAT per line instead of per invoice? is that still required?
```

[`/why`](../../skills/understand/why/SKILL.md) begins by pinning the question to code: the files and lines, the commits that last changed them, and the PRs those commits name. Then it starts investigators in parallel, one per evidence source. Source control is always searched. The other six categories (issues, long-form docs, chat, infrastructure observability, error tracking, analytics) are searched through whatever you connected in [`/setup-source`](./01-setup.md#connect-evidence-sources-with-setup-source).

The report keeps quotes and inferences apart and links every source. Where the record is thin, it hedges with "appears to" instead of inventing certainty. Finding nothing is a result it reports, because "no one recorded a reason" tells you something. Categories without a connected tool are listed as gaps, so you know which evidence is missing.

The two skills chain well. When a mess probably has a history, ask for the history first: "/why first, then /how".

## Get one plain explanation with `/explain`

```text
/explain this PR's change to the rounding code. i need to be convinced it fixes the cause and doesn't just hide it.
```

[`/explain`](../../skills/understand/explain/SKILL.md) is for when you need understanding, not a summary. It runs `/how` and `/why` side by side, or only one for a small change, and turns both into a single explanation. It opens with a plain definition, connects it to your code, and goes deeper only where your question points. For anything with three or more moving parts, it draws several diagrams in sequence, each adding one part, so the picture grows instead of arriving all at once.

Asking to be "convinced" changes the output from a guided tour into an argument with claims you can attack. You can point it at the agent's own decisions:

```text
/explain why you put the exemption check in the tax engine instead of the invoice builder. what did that cost?
```

Having to justify a choice in writing pushes the agent back into the code for evidence.

## Learn a topic over weeks with `/teach`

`/explain` is one conversation about one question. [`/teach`](../../skills/understand/teach/SKILL.md) is a course you come back to:

```text
/teach i want to understand double-entry bookkeeping well enough to review ledger's accounting export.
```

It keeps a workspace in `docs/learn/<topic>/` unless you choose another place:

- `MISSION.md` holds why you're learning this. The first session writes it, and pushes you to name a concrete goal.
- `RESOURCES.md` lists the sources the lessons rely on.
- `lessons/NNNN-slug.html` holds one short HTML lesson per session, aimed just beyond what you already know.
- `learning-records/NNNN-slug.md` notes what you've shown you understand. A record appears only after you demonstrate it, not after a lesson is read.

Each later session starts by reading the mission and your newest learning record, so it builds on what you know. To continue, run `/teach` again with the same topic.

## Return to a topic with `/catch-up`

```text
/catch-up the credit note work
```

Coming back to a topic after days away, you've forgotten half of it, and a fresh agent knows none of it. [`/catch-up`](../../skills/session/catch-up/SKILL.md) rebuilds the picture from two places. Your own chats, the last seven days by default, show what you did and decided. The shared record shows everything else around the same code: tickets from users, fixes that went in and came out again, errors that still fire. Subagents search your chats while `/why` investigators search the shared record, and then every PR and branch they mention is checked against git.

The brief is short and has a fixed layout. Up to five bullets of overview, one line per thread tagged with its state (such as `[open PR #N]` or `[reverted #N]`), the problems that keep recurring, and one concrete next step.

It works best as the first half of a prompt:

```text
/catch-up the credit note work from last week, then look at this new ticket.
```

`/catch-up` reads chats from the current workspace only. Other projects stay closed unless you ask.

## Continue another agent's branch with Session pickup

When a specific branch needs to move forward, use Session pickup instead:

```text
/tj-mode take over feat/credit-notes. the decision log is in .audit/. continue from where it stopped and don't repeat finished work.
```

The [Session pickup playbook](../../skills/mode/tj-mode/playbooks/session-pickup.md) trusts what the previous agent left behind. From the transcript, cloud-agent URL, or branch you name, it reconstructs what landed and what was decided, marks the point to resume from, and hands the rest to the right playbook. It re-checks inherited claims on the real artifact instead of redoing the work.

Claude Code doesn't store cloud session transcripts locally. Point Session pickup at the pushed branch in that case.

In short: `/catch-up` restores your memory across many chats. Session pickup continues one specific piece of work.

**Pitfall:** skipping this stage because "it'll read the code while fixing" usually buys you a fix in the wrong place and a second round. Tracing first is the cheaper path.

**Try it.** Choose a piece of your code that looks strange. Run `/why` on it and count the gaps in the Sources Consulted section. Three or more gaps mean the answer rests mostly on git. Run `/setup-source` to give it more to read.

Next: [Design the change](./04-design.md).
