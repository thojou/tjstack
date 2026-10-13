---
name: principle-test-behavior-not-implementation
description: "Apply when you write, change, or keep a test. Call the code the way its users do and assert the result they observe against a literal expected value. If the test would still pass when every dependency returned an empty or wrong value, rewrite the assertion or delete the test."
disable-model-invocation: true
---

# Test Behavior, Not Implementation

A test calls the code as its users do and asserts the exact result they see. Rewrite or delete any test that would still pass if every imported function returned an empty or wrong value.

These shapes fail that check:

- Loose or no assertion: only checks that a value is present, truthy, non-zero, or that nothing threw.
- Call or absence only: only checks that a function was called or was not called, or that a result is missing or empty, without the payload or the other input that should produce it.
- Expected value computed by the code under test.
- Restated constant, config default, table row, or prompt string.
- Assertions on data the test built, with no call to the subject.

Fix: call the subject in the test body with one concrete input and assert the literal output or effect. When a collaborator is substituted, assert the payload it received. For an absence, also assert the presence on another input. For a constant, test the mechanism that reads it with one input instead of restating the value.

Keep relation checks across table rows (a key in two tables, a parent that exists). Where the language has a separate type-level check, keep that check too.
