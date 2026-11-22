---
name: principle-compose-over-inherit
description: "Apply when writing or reviewing a subclass, a base class, or a type hierarchy, or when a new mix of behaviors seems to need a new subclass. Put each varying behavior behind a small interface and combine collaborators at construction. Where inheritance stays, the base class owns the flow and subclasses fill only the hooks it calls."
disable-model-invocation: true
---

# Compose Over Inherit

Build a type's behavior from collaborators it holds, not from a parent it extends. Each behavior that varies sits behind a small interface: an interface, protocol, trait, or plain function value. The type receives its collaborators when it is constructed and calls them. A new mix of behaviors is a new list of collaborators, not a new class.

**Why:** A subclass depends on its parent's internals and call order, so the reader traces every level to learn what one method does. A hierarchy grows one class per combination (`EmailNotifier`, `EmailAndSmsNotifier`, `EmailAndSmsAndChatNotifier`). Composition grows one collaborator per behavior, and any set of them combines without new code.

- **One interface per axis of variation.** Replace the subclass chain with `interface Channel { send(message) }`, one implementation per channel, and `Notifier(channels)` whose `notify(message)` calls `channel.send(message)` for each. The caller writes `Notifier([EmailChannel(), SmsChannel()])`.
- **Reuse by calling, not by extending.** A subclass that exists only to reach a helper on its parent wants that helper as a function or a collaborator.
- **A function is a collaborator.** Where the interface has one method and the language has first-class functions, pass the function.
- **Compose only what varies.** An interface with one implementation and no second behavior in sight is a layer to collapse per [Minimize Reader Load](../principle-minimize-reader-load/SKILL.md). Extract the collaborator when the second behavior or combination arrives.
- **Wire collaborators at the composition root.** Business code receives its collaborators and never builds them, per [Boundary Discipline](../principle-boundary-discipline/SKILL.md).
- **Where inheritance stays, the base owns the flow.** Inheritance fits when the framework requires it or when every subtype runs one fixed algorithm with different steps. The base class's public method runs the fixed order and calls protected abstract hooks: `render() { header(); body(); footer() }` with `body()` abstract. Subclasses implement only the hooks. Mark the public method as not overridable (final, sealed, non-virtual) where the language allows. A subclass whose public method calls the parent's helpers to stitch the steps together has turned the base into a toolbox. Move the order into the base.
- **A subtype keeps every promise of its parent.** It accepts the same inputs, returns the same kind of result, and raises the same kinds of errors. A subtype that overrides a method to throw "not supported" or to do nothing is not a subtype. Give it its own type.

**Stop:** do not rewrite inheritance the platform requires or that only classifies, such as a framework's component or test-case base class, or an error hierarchy that callers catch by category.

**The test:** can you add a new mix of existing behaviors without writing a class? Does any subclass call its parent's methods to complete its own public method? If the first answer is no or the second is yes, compose.

Distinct from [Model the Domain](../principle-model-the-domain/SKILL.md), which chooses between plain data and polymorphic objects by what will grow. This file decides how the polymorphic behavior is assembled.
