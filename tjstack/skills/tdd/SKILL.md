---
name: tdd
description: "Drive a PHP feature, behavior change, or bug fix test-first with PHPUnit: write one failing test, watch it fail for the right reason, write the minimal code to pass, refactor while green, repeat. Use for /tdd, 'TDD this', 'write a failing test first', 'add a regression test', or a bug with a cheap local test path. Falls back to the closest executable check when a test would be expensive, brittle, or unclear."
disable-model-invocation: true
---

# TDD

Only a test that has been red can show it guards anything. Turn the intended behavior into an executable check, see it go red, then make it green with the smallest change.

This skill assumes PHP and PHPUnit. In a Pest project, write Pest tests: the cycle and the anti-patterns apply unchanged. In another stack, use its runner the same way.

## Gate: is there a cheap test path?

Before the first test, learn how the project tests:

- Read `phpunit.xml` or `phpunit.xml.dist` for the suites (often `tests/Unit`, `tests/Integration`, `tests/Feature`) and the strictness flags.
- Run `vendor/bin/phpunit --version`, and use only API that version has. [references/phpunit-anti-patterns.md](references/phpunit-anti-patterns.md) names the version for each newer API.
- Check `composer.json` scripts for the project's test command (`composer test`, `php artisan test`, `bin/phpunit`), and use it over a bare `vendor/bin/phpunit` when it adds setup.
- Find the existing test class for the code path. Follow its naming, base class, and folder.

Run the full cycle when a unit test, or an integration test the project already runs locally, covers the path cheaply. Skip a new test when it would need booting the whole framework for a pure function, a real external API, production-only data, vague reproduction steps, or a pile of mocks. Then use the closest executable check instead: a targeted script, an `artisan` or `bin/console` command, an HTTP request against the local app, or a log assertion. Prefer no new test over a bad test.

Throwaway prototypes, generated code (migrations, proxies), and plain configuration are out of scope. A prototype goes to the **prototype** skill.

## The cycle

### 1. Red: write one failing test

State the intended behavior and the smallest observable case that shows it. For a bug, that is the reproduction. One test method covers one behavior. A method name that joins two claims is two tests.

```php
#[CoversClass(InvoiceCalculator::class)]
final class InvoiceCalculatorTest extends TestCase
{
    public function testAddsVatToTheNetAmount(): void
    {
        $calculator = new InvoiceCalculator(vatRate: '0.19');

        $total = $calculator->gross(Money::EUR('100.00'));

        $this->assertSame('119.00', $total->amount());
    }
}
```

- Arrange, act, assert, in that order, each once.
- Call the code the way its users do and assert the literal result they observe, per the **test-behavior-not-implementation** principle skill. Use `assertSame` with a literal expected value. Reach for `assertEquals` only for objects compared by value, and say why.
- Use PHP 8 attributes (`#[Test]`, `#[DataProvider]`, `#[CoversClass]`), never docblock annotations. PHPUnit 11 deprecated annotations and PHPUnit 12 dropped them.
- Several inputs for one rule go into one data provider: `public static`, named data sets, literal expected values.
- Design the call from the caller's side first. If the test is awkward to write, the class is awkward to use: change the class, not the test.
- Use real objects. Construct entities, value objects, and DTOs. Double only a port to a slow or external system, and only after you know which side effects the test depends on. Read [references/phpunit-anti-patterns.md](references/phpunit-anti-patterns.md) before you call `createStub()` or `createMock()`, or add a test helper.

### 2. Verify red: watch it fail

Mandatory. Run only the new test:

```bash
vendor/bin/phpunit --filter 'InvoiceCalculatorTest::testAddsVatToTheNetAmount'
```

- PHPUnit prints `F` for a failure and `E` for an error. Red means `F`: an assertion failed.
- An `E` (class not found, undefined method, `TypeError`) does not count. Add the missing class or method with the real signature and a body that returns a value of the declared type, then run again until the assertion fails.
- The failure message matches the behavior you are about to add, and nothing else explains it: no typo, wrong namespace, stale autoloader (`composer dump-autoload`), or cached container.

A test that is green on its first run either covers behavior that already exists or checks the wrong thing. Correct the test before touching production code.

**Code already written?** Code that came before its test is unverified, not wrong. Stash or revert the production change, run the test, and confirm it fails for the intended reason. Then restore the change and continue at step 4. Never adjust a test until it passes against code you have not seen it fail without.

### 3. Green: write the minimal code

Write the simplest production change that makes the test pass. No options, parameters, or abstractions the test does not demand, per the **laziness-protocol** principle skill. For a bug, fix the root cause, not the symptom, per the **fix-root-causes** principle skill.

Do not refactor other code or add features in this step.

### 4. Verify green: watch it pass

Mandatory. Rerun the new test, then the project's whole test command, even when the task named one file. A green test class is not a green suite.

```bash
vendor/bin/phpunit --display-all-issues
```

- The new test passes.
- Every other test still passes.
- The run is clean: no new risky (`R`), warning (`W`), deprecation (`D`), or notice (`N`) markers, and no PHPUnit notice such as "No expectations were configured for the mock object".
- When the project runs static analysis (PHPStan, Psalm) or a coding-standard check in CI, run it on the touched files too.

If the new test fails, fix the code, not the test. If another test fails, fix it now. A failure you did not cause still goes in the reply by name.

### 5. Refactor while green

Only after green: remove duplication, improve names, extract helpers. Rerun after each change. Add no behavior. Behavior comes from the next failing test.

### 6. Next test

Pick the next behavior, edge case, or error path and return to step 1. For an error path, expect the specific exception class and its message, and act after the expectation. One behavior per loop keeps every failure local, per the **sequence-verifiable-units** principle skill.

## Guardrails

- Never change a test to match a wrong implementation.
- Never weaken an existing assertion unless the expected behavior has changed and you can say why.
- Never skip, delete, `markTestSkipped()`, or `#[Group]`-exclude a test to get green.
- Never add `#[Retry]` or `--retry` to hide a flaky test. Make it deterministic: inject the clock and the randomizer, and isolate state. `--repeat` and `--order-by random` help you find the flake.
- Keep a regression test focused on its bug. Add sibling coverage for a broader failure class after the focused test lands.
- Never add a public method, setter, or `reset()` to production code that only tests call, and never reach into private members with Reflection. Test through the public API.
- Commit with the **git-commit** skill so the failing test lands before the fix, or with it in one commit. The history then shows red before green.

## Excuses to catch

Each of these sends you back to step 1.

| Excuse | Answer |
|---|---|
| "This is trivial." | Trivial code still regresses, and its test is the cheapest one you will write today. |
| "I'll add the test once it works." | A test written against finished code goes green on the first run, so it never showed it can fail. It records what the code does, not what it should do. |
| "I clicked through it in the browser." | A manual run leaves nothing a reviewer or the next change can replay. |
| "I have to explore first." | Fine. Then stash or discard the spike and start the cycle from red. |
| "It was green right away, nice." | That is the warning sign, not the reward. Break the behavior and watch the test notice. |
| "`createMock()` is quicker." | A mock-heavy test checks your configuration of the mock. Build the real object, double only the port. |
| "The class is `final`, I can't test it." | `final` blocks doubling, not testing. Use the real object, or depend on an interface. |
| "This case is special." | Write down which gate condition it meets. If none, run the cycle. |

## When stuck

| Symptom | Next move |
|---|---|
| No idea how to test it | Start from the assertion you want to read, then write the call that would make it true. |
| The test is long and tangled | The class does too much. Split it or narrow its inputs. |
| Every collaborator needs a double | Dependencies are created inside the class (`new`, static calls, facades, `time()`). Inject them through the constructor. |
| Setup dwarfs the assertion | Move the setup into a builder or an object mother. If it stays large, the design is the problem. |
| You need the container or the database | Split the pure logic out of the framework class and unit test that. Keep one integration test for the wiring. |

## Reply

Report the evidence, not only the outcome, per the **prove-it-works** principle skill:

- The failing-before test or check, and the failure it produced, pasted verbatim.
- The passing-after run, and the nearby suites and static analysis you also ran.
- If you could not show failing-before evidence, say why and name the closest check you used instead.
