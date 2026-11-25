# Cobbler, stick to your last

*Why tjstack exists, whose shoulders it stands on, and what I think about building software with AI in late 2026.*

— Thomas Joußen, November 2026

## Standing on other people's shoulders

Let me start with the most important thing: tjstack is, to a large extent, other people's work.

Before tjstack, I maintained my own skill library called Coby. It grew out of my day-to-day work with coding agents, and it taught me a lot about what helps an agent and what only fills its context. When I compared what I had learned with what other developers had published, one approach stood out: [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan (poteto). Its idea is a single router skill that picks the right playbook for the job, delegates to the right models, and verifies the result instead of trusting it. That matched my own experience better than what I had built, so I decided to follow that concept rather than keep reinventing it.

What I added on top:

- My own concepts, principles, and ways of working. The engineering principles, the emphasis on less code verified on the real artifact, and the way the playbooks are cut reflect how I have built and maintained software for years.
- Independence from a single stack. pstack was tailored to TypeScript projects in Cursor. I removed that focus so tjstack works for any project, in any language.
- Support for Claude Code next to Cursor.

tjstack also adapts parts of [skills](https://github.com/mattpocock/skills) by Matt Pocock and [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert, and several principles restate ideas from *Clean Code* by Robert C. Martin. The licenses are in [NOTICE](NOTICE). Thank you to all of you. Open source works because people share what they have learned, and tjstack would not exist without that.

## Everyone can code now. Good.

Coding agents have lowered the barrier to writing software more than anything I have seen in my career. People who would never have touched code are now building tools for themselves, their teams, and their clubs.

I think this is a good thing. Every one of us started somewhere, and career changers have always been welcome in IT. Some of the best engineers I have worked with did not start with a computer science degree.

But I see two attitudes spreading that I do not share.

## "If all you can do is speak a programming language…"

At a conference, I heard someone say, roughly: *"If the only skill you have is that you speak another language — a programming language — then you can pack up in the age of AI."*

The first attitude is that people who are not developers now explain to developers how easy software development is. That devalues the profession, and it shows a misunderstanding of what the profession is.

I have a master's degree in IT. I have built, run, and maintained dozens of software projects. I love code, and writing it has always been one of the parts of this job I enjoy most. But writing code has never been the whole job. The job is also:

- understanding what the people who will use the system actually need, which is often not what they first ask for,
- designing systems that can change without falling apart,
- knowing what to leave out,
- security, data protection, operations, monitoring, and incident response,
- migrations, backward compatibility, and the code that has to keep running while you replace it,
- and taking responsibility when something breaks at 3 a.m.

It also matters *who* you build for. Software for yourself, software for a small group of users, and software for an enterprise are different disciplines. A script that runs on your laptop can fail and nobody notices. An enterprise system has audits, compliance rules, hundreds of integrations, and users who depend on it for their income. I have spent many years learning best practices for software development and software systems, and most of that knowledge is about the second kind of software, not the first.

## The saloon in *Der Schuh des Manitu*

There is a scene in the German western comedy *Der Schuh des Manitu* where the saloon simply collapses, right when everything seems to be going to plan. That is what a lot of AI-generated software reminds me of: it looks like a building from the street, and when you lean on it, it turns out nothing was holding it up.

<p align="center"><img src="assets/statement-saloon.png" alt="Three cowboys stare as a saloon facade with nothing behind it tips over in the desert" width="720"></p>

AI is very good at the first 80 %: the scaffold, the happy path, the demo that works. The remaining 20 % is the work that matters: edge cases, error handling, security, performance under real load, and maintainability two years from now. That 20 % is where most of the effort and most of the risk have always been, and it is exactly where agents still need an experienced engineer.

The numbers support this, if you read them carefully:

- **Benchmarks don't measure the 20 %.** On SWE-bench Verified, the leading agents now report scores above 95 % ([Vals.ai](https://www.vals.ai/benchmarks/swebench), [LLM Stats](https://llm-stats.com/benchmarks/swe-bench-verified)). But these are well-specified GitHub issues with tests that define "done". Most leaderboard entries are self-reported, OpenAI [stopped reporting the benchmark](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/) because of contamination, and [researchers found](https://arxiv.org/pdf/2506.09289) that many "passed" patches were in fact wrong. On the harder [SWE-Bench Pro](https://scale.com/blog/swe-bench-pro), frontier models solved fewer than 25 % of the tasks when it launched in 2025. Nobody hands you an enterprise requirement with a finished test suite attached.
- **Speed is not the same as progress.** In a [randomized controlled trial by METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), experienced open-source developers were 19 % *slower* with AI tools on their own mature repositories, while they believed they were 20 % faster. It is one study with early-2025 tools, but the gap between feeling fast and being fast is worth remembering.
- **AI amplifies what is already there.** The [2025 DORA report](https://cloud.google.com/resources/content/2025-dora-ai-assisted-software-development-report) found that AI adoption is linked to higher delivery throughput, but also to lower delivery stability. Its central conclusion is that AI magnifies the strengths of good teams and the dysfunctions of struggling ones.

## Developers already use AI. We know how.

The second attitude is that someone who fixed a bug for a university project last weekend now wants to explain to professional developers how to build software with AI. As if we had not noticed.

We have. In the [2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025/ai), 84 % of respondents use or plan to use AI tools, and about half of professional developers use them every day. In the [2025 DORA report](https://blog.google/technology/developers/dora-report-2025/), 90 % of the nearly 5,000 technology professionals surveyed use AI at work. Developers are not the people AI is happening *to*. We are the people using it most, every day, on real systems.

And developers are well placed to use it efficiently, precisely because we know the 20 %. We know which output to distrust, which test is missing, and which shortcut will cost us next year. That is not gatekeeping. It is the same reason a carpenter gets more out of a power saw than someone who just bought one. tjstack is my attempt to write down that knowledge in a form an agent can follow.

## Cobbler, stick to your last

There is an old saying: *Cobbler, stick to your last.* In German: *Schuster, bleib bei deinen Leisten.*

I don't mean that anyone should stay out of software. Build things. Learn. You are welcome here. What I mean is this: the biggest gains from AI come when every one of us asks *"How can AI make my own work better?"* and not *"How can AI let me take over someone else's work?"*

A doctor with AI is a better doctor. A lawyer with AI is a better lawyer. A developer with AI is a better developer. A doctor with AI is not a developer, and a developer with AI is not a doctor.

If each of us focuses on improving our own craft with these tools, and respects the craft of others, then we are on a good path, toward a productive future in which people and AI solve interesting problems together and build things none of us could have built alone.

That is why tjstack exists. I hope it helps you with your craft.
