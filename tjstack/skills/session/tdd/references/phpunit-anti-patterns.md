# PHPUnit anti-patterns

Read this before you call `createStub()` or `createMock()`, add a test helper, or touch `phpunit.xml`. A test double cuts the class under test off from something slow or external. It is never the thing the test checks.

The **test-behavior-not-implementation** principle skill owns the general assertion rules. This file owns the PHP and PHPUnit specifics. Version notes refer to PHPUnit. Check `vendor/bin/phpunit --version` before using an API marked with a version.

## Doubles

### 1. The assertion only sees the double

```php
// Bad: the stub returns the total the test then expects
$pricing = $this->createStub(PricingService::class);
$pricing->method('total')->willReturn(Money::EUR('42.00'));
$this->assertEquals(Money::EUR('42.00'), (new Checkout($pricing))->total($cart));

// Good: real pricing; the only double is the external tax rate lookup
$rates = $this->createStub(TaxRateProvider::class);
$rates->method('rateFor')->willReturn('0.10');
$checkout = new Checkout(new PricingService($rates));
$this->assertSame('11.00', $checkout->total(Cart::with(Item::priced('10.00')))->amount());
```

**Check.** Ask whether the assertion would still pass if the class under test returned its input unchanged. If yes, it checks the double. Remove the double or move it outward to the real boundary.

### 2. A mock where a stub belongs

A stub feeds indirect input: what a query returns. A mock verifies indirect output: that a command was sent. Use `createStub()` for the first and `createMock()` with `expects()` only for the second.

```php
// Bad: a mock with no expectation, and a with() that checks nothing
$repo = $this->createMock(OrderRepository::class);
$repo->method('find')->with('o-1')->willReturn($order);

// Good: a stub for the query
$repo = $this->createStub(OrderRepository::class);
$repo->method('find')->willReturn($order);

// Good: a mock only for the command whose effect is the behavior under test
$mailer = $this->createMock(Mailer::class);
$mailer->expects($this->once())
    ->method('send')
    ->with($this->callback(fn (Email $mail): bool => $mail->to() === 'ada@example.com'));
```

- Never verify how often a query was called. Assert on the result instead.
- `expects($this->any())` is deprecated since 12.5 and removed in 14. Use a stub.
- `with()` without `expects()` is deprecated since 13.0 and removed in 14.
- Since 12.5, a mock without expectations triggers a PHPUnit notice. Fix the test, don't silence it with `#[AllowMockObjectsWithoutExpectations]`.
- Since 11, expectations on a stub are deprecated, and 12 rejects them.

### 3. Over-specified interactions

```php
// Bad: pins call order and internal steps nobody depends on
$logger->expects($this->exactly(3))->method('info')->withConsecutive([...], [...], [...]);

// Good: verify the one outgoing message that matters, in any order when order doesn't matter
$bus->expects($this->exactly(2))
    ->method('dispatch')
    ->withParameterSetsInAnyOrder([new OrderPlaced('o-1')], [new StockReserved('o-1')]);
```

`withConsecutive()` and `at()` are gone since PHPUnit 10. Since 13.0, use `withParameterSetsInOrder()` only when the order is part of the contract, otherwise `withParameterSetsInAnyOrder()`. Since 13.0, `seal()` makes a mock fail on any call you did not configure, and `requireSealedMockObjects="true"` enforces it project-wide.

### 4. Doubling types you don't own

```php
// Bad: mocking Doctrine, Guzzle, or PDO directly couples the test to their call sequence
$em = $this->createMock(EntityManagerInterface::class);
$em->expects($this->once())->method('persist');
$em->expects($this->once())->method('flush');

// Good: depend on your own port, double that, and integration-test the adapter once
interface Invoices { public function save(Invoice $invoice): void; }
```

Wrap a framework or vendor API behind an interface you own, double the interface, and cover the adapter with an integration test against the real thing. Where the vendor ships its own test double, use it: Symfony `MockHttpClient`, Guzzle `MockHandler`, Symfony `MockClock` for any PSR-20 `ClockInterface`.

### 5. Doubling values, entities, and `final` classes

Construct entities, value objects, DTOs, and enums for real. A doubled entity hides invariants its constructor enforces. PHPUnit cannot double `final` classes, `enum`s, or `final`, `private`, and `static` methods. That limit is design feedback: depend on an interface. Tools that strip `final` at runtime are a last resort for legacy or vendor code.

### 6. A double that swallows a side effect the test needs

```php
// Bad: stubbing save() drops the write that makes the second call a duplicate
$users = $this->createStub(UserRepository::class);
$service = new Registration($users, $mailer);
$service->register('ada@example.com');
$this->expectException(DuplicateUser::class);
$service->register('ada@example.com'); // never throws

// Good: an in-memory implementation of your own interface keeps the behavior
$service = new Registration(new InMemoryUserRepository(), new NullMailer());
$service->register('ada@example.com');
$this->expectException(DuplicateUser::class);
$service->register('ada@example.com');
```

Before you double a dependency, write down what the real one changes: storage, cache, events, files. If the test relies on that change, use a fake (an in-memory implementation) instead of a stub.

### 7. Doubles with half the shape

Arrays standing in for API responses or rows break as soon as production code reads a key the test author forgot. Build fixtures from the real type: a DTO, an entity built through its constructor, or a recorded JSON response decoded by the real mapper. `createConfiguredStub()` is for edge cases, not a shortcut around building real objects.

## Assertions

### 8. Loose or misleading assertions

| Smell | Problem | Instead |
|---|---|---|
| `assertEquals('1', $count)` | `==` semantics, `'1'` equals `1` | `assertSame(1, $count)` |
| `assertTrue($a == $b)` | Failure says "false is not true" | `assertSame($b, $a)` |
| `assertNotNull($result)`, `assertInstanceOf(...)` alone | Any object passes | Assert the value the caller uses |
| `assertCount(2, $items)` alone | Wrong items pass | Assert the items, `assertSame` on the list |
| `expectException(\Exception::class)` | Any failure passes, including a `TypeError` in setup | The specific exception class plus its message |
| Expected value computed with production code | Test agrees with itself | A literal |

For exception messages, use `expectExceptionMessageIsOrContains()` on 13.2 and later (`expectExceptionMessage()` is soft-deprecated there), `expectExceptionMessage()` before. Call the expectation right before the line that should throw.

### 9. Useless tests

A test without assertions or expectations is risky by default. Do not paper over it with `#[DoesNotPerformAssertions]` unless "does not throw" is really the contract, and then say so in the method name.

## State and isolation

### 10. Hidden time, randomness, and globals

`time()`, `date()`, `new DateTimeImmutable()`, `rand()`, `uniqid()`, `$_SERVER`, `$_ENV`, static properties, and singletons make results depend on when and in which order tests run. Inject a PSR-20 `ClockInterface` (`MockClock` in tests), a `Random\Randomizer` with a seeded engine, and configuration objects. Turn on `beStrictAboutChangesToGlobalState` to catch leaks.

### 11. Order-dependent tests

Tests that share state through static properties, `setUpBeforeClass()`, or `#[Depends]` chains pass only in file order. Build fresh state in `setUp()` or in the test. Run `--order-by random` to expose hidden coupling, and `--repeat <N>` (13.3+) to stress a suspect.

### 12. Retrying flakiness away

`#[Retry]` and `--retry` (13.3+) tolerate a flaky test, they do not fix it. Use them only for a dependency you cannot control, such as a remote sandbox, and say so in the test. Everything else gets a deterministic fix.

### 13. Databases without isolation

Integration tests that write to a shared database leak rows into each other. Wrap each test in a transaction that rolls back (DAMA DoctrineTestBundle, Laravel `RefreshDatabase`), or reset the schema per test. Keep these tests in their own suite or group so the unit suite stays fast.

## Structure

### 14. Docblock metadata

`@test`, `@dataProvider`, `@covers`, `@depends`, `@group` are deprecated since 11 and ignored since 12. Use the attributes in `PHPUnit\Framework\Attributes`.

### 15. Data provider smells

- Providers are `public static` since PHPUnit 10.
- Name each data set (`'negative amount' => [...]`) so a failure says which case broke.
- Keep expected values literal. A provider that calls production code to compute them tests nothing.
- One provider per rule. Mixing happy paths and error paths in one provider hides which branch failed.

### 16. Testing private methods

`ReflectionMethod::invoke()` on a private method pins the implementation. Test through the public API. If a private method needs its own tests, it wants to be its own class.

### 17. Test-only production code

A public setter, `reset()`, or `if ($this->testing)` that only tests use. Build the state the test needs through the constructor or a builder in `tests/`. If the class does not own the resource, the method is in the wrong class anyway.

### 18. Output and leftovers

`var_dump()`, `echo`, `dd()`, or `ray()` left in tests or code. `beStrictAboutOutputDuringTests="true"` marks such a test risky.

## Strict configuration

Recommend these in `phpunit.xml.dist` when the project lacks them, as a separate change, not inside a feature commit:

```xml
<phpunit
    failOnAllIssues="true"
    beStrictAboutOutputDuringTests="true"
    beStrictAboutChangesToGlobalState="true"
    executionOrder="random">
```

`failOnAllIssues` (12.5 and later) makes every risky test, warning, deprecation, notice, and PHPUnit notice fail the run, including "No expectations were configured for the mock object". On older versions, list the flags one by one: `failOnRisky`, `failOnWarning`, `failOnDeprecation`, `failOnNotice`, `failOnPhpunitDeprecation`. Consider `requireCoverageMetadata="true"` with `#[CoversClass]`, and mutation testing (Infection) to find tests that pass no matter what the code does.

## Quick reference

| Smell | Fix |
|---|---|
| Assertion passes with the subject gutted | Remove the double or move it to the boundary |
| `createMock()` without `expects()` | `createStub()` |
| Verifying query calls or call order | Assert the result; verify only commands, in any order unless order is the contract |
| Mocking Doctrine, Guzzle, PDO | Your own interface, plus one adapter integration test |
| Doubled entity, value object, enum | Construct the real one |
| Stub swallows a needed write | In-memory fake |
| `assertEquals`, `assertTrue($a == $b)` | `assertSame` with a literal |
| Broad `expectException` | Specific class and message |
| `time()`, `rand()`, statics | Injected clock and randomizer, fresh state per test |
| `#[Retry]` on your own code | Deterministic fix |
| Docblock annotations | Attributes |
| Reflection on privates, test-only methods | Public API, builders in `tests/` |
