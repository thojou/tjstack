---
name: prototype
description: "Builds a throwaway prototype that settles one design decision. A look question gets competing variants behind a switcher. A logic, behavior, or timing question gets the smallest runnable artifact that shows the answer. Use for /prototype, 'prototype this', 'mock up some options', 'try a few variants', or a which-approach fork that running something can settle."
disable-model-invocation: true
---

# Prototype

You own the design decision, not the code. The prototype is a throwaway instrument that settles one decision. The real build follows in the **Feature** playbook.

Speed beats polish. Code quality does not matter. No planning. The Laziness Protocol's smallest change and the usual verification bar both invert here. The rigor goes into picking the right design cheaply. Propose variants the user did not ask for. Throw an approach away and try another.

## Phase A: Scope the decision

Name the one decision the prototype exists to make. A look decision picks a layout, an interaction, or a density. An empirical fork picks a behavior, a timing, or an approach.

No decision means no prototype. Route to the **Feature** playbook. An investigation whose deliverable is a cited answer does not build one either.

Name the question type before any code. A look question and a logic question produce different artifacts, and picking the wrong one wastes the prototype. Logic covers behavior, timing, state, and which approach holds. If the type is ambiguous and the user is away, match the surrounding code. A backend module means logic. A page or component means look. State that assumption in the reply.

Then decide who settles it. A fact you can observe, such as behavior, timing, layout, output, or perf, is not a question for the operator. The observation decides. A product or preference call that no run can settle stays with the operator.

## Phase B: Gather references

Skip this phase when the direction is set. Skip it for a logic, timing, or perf question.

When the look space is open, search for prior art. Summarize a moodboard of themes, palettes, and layouts. When the user is in the session, show it with a recommended direction and let them pick before you build. When they are away, carry those references into the variants. Do not pick one direction for them. The visual pick stays with the operator.

## Phase C: Build the throwaway

Build in an isolated scratch dir outside the production tree, such as `/tmp/prototype-<slug>/`. The one exception is a look prototype that mounts inside an existing shell, covered below. No tests and no abstractions.

**Logic question.** If a run alone answers it, write the smallest script that exercises the question. If the answer depends on stepping through states, build one self-contained HTML file instead. Its title states the question. After every action it shows the full relevant state in domain language. Give it free-play buttons plus a few guided scenarios for the awkward cases. Keep state in memory. No framework and no server.

**Look question.** Build variants that disagree about layout, hierarchy, or primary action. A color or copy change is not a variant. Default to 3. More than 5 is noise.

If a real page or shell exists, mount the variants there and swap only the subtree. A vacuum page hides density and layout problems. Use the project's styling. Do not scaffold Vite, Next, or a second HTML app beside the shell. A new throwaway route inside the app is the last resort, only when no existing page can host the variants.

If nothing exists to host them, use vanilla HTML, CSS, and JS, or the lightest stack that renders the idea. CDN dependencies and a dev server with hot reload are fine. No production framework.

**Inside the app.** Add only the variant subtree, the switcher, and the last-resort route if one was unavoidable. Name each so it is obviously a prototype. When the decision is made, delete them or leave them uncommitted. Never merge them.

## Phase D: Compare behind one switcher

Put every look variant behind one switcher, each variant labeled. This is the **principle-exhaust-the-design-space** skill made cheap. A logic question is one artifact. Its guided scenarios are cases, not variants.

- The bar shows previous, the variant label, and next.
- A `?variant=` URL param keeps the variant across a reload.
- Left and right arrow keys cycle. They do not fire while an input has focus.
- The bar is visually not part of the design.
- Production builds do not render it.

## Phase E: Drive and observe

Drive every artifact before you share it. The observation is the test here, not an assertion, per the **principle-prove-it-works** skill. If `control-ui` or `control-cli` is installed, use it for the drive. Otherwise drive the surface yourself.

For a look question, open the prototype and step through every variant. Screenshot each one and drive the interaction. A blank page, an exception, or a broken switcher is not a result. Fix it, then share the URL. If no browser automation exists, say so and still record what you could run.

For a logic question, observe the thing you are deciding. Log the timing, print the output, or watch the render. In the HTML file, run every guided scenario and read the state after each step.

## Phase F: Present and hand off

Present the alternatives, their tradeoffs, and your recommendation. The output is the decision plus the throwaway artifact, not shippable code.

When the observation settled an observable fact, report the decision. Do not ask the operator to confirm it. When the call is a product or preference call, show the options with your recommendation and let the operator answer in their own words. Do not invent a shorthand token for them to type back.

Do not promote prototype code. Hand the chosen direction to the **Feature** playbook, which rewrites the winner. When the open question is the shape, hand it to the **architect** skill instead.

**Reply:** the variants explored, the evidence, the tradeoffs, your recommendation, and the path. The evidence is screenshots for a look decision, and the observed state, output, or timing for a logic one. The path is the scratch directory, or the in-app route when the variants mount in a shell. Name any question-type assumption from Phase A. Say plainly that the prototype is throwaway. The path in the reply is the record.
