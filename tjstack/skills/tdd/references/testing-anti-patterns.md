# Testing anti-patterns

Read this before you add a mock, a fake, a test helper, or a method that only tests call. A substitute exists to cut the code under test off from something slow or external. It is never the thing the test checks.

The **test-behavior-not-implementation** principle skill owns the assertion rules. This file owns substitutes and test scaffolding.

## 1. The assertion only sees the substitute

```python
# Bad: the stub returns the price the test then expects
def test_checkout_total(monkeypatch):
    monkeypatch.setattr(cart, "compute_total", lambda items: 42)
    assert checkout(["apple"]).total == 42

# Good: real pricing, the only substitute is the external tax service
def test_checkout_total_adds_tax():
    taxes = FixedRateTaxService(rate=Decimal("0.10"))
    assert checkout(["apple"], taxes=taxes).total == Decimal("1.10")
```

**Check.** Ask what would still be true if the production code under test were deleted. If the assertion would still pass, it checks the substitute. Remove the substitute or move it outward to the real boundary.

## 2. Production methods that exist for tests

```python
# Bad: reset() exists only so tests can clean up
class RateLimiter:
    def reset(self):
        self._buckets.clear()

# Good: each test builds a fresh limiter, or a fixture owns the cleanup
@pytest.fixture
def limiter():
    return RateLimiter(store=InMemoryStore())
```

**Check.** Before adding a method, search for its callers. If every caller is a test, it belongs in a fixture or test helper. If the class does not own the resource the method touches, it is the wrong home anyway.

## 3. Substituting something whose side effects the test needs

```python
# Bad: faking save() also drops the write that makes the second call a duplicate
def test_rejects_duplicate_user(monkeypatch):
    monkeypatch.setattr(repo, "save", lambda user: None)
    register("ada@example.com")
    with pytest.raises(DuplicateUser):
        register("ada@example.com")  # never raises

# Good: keep the real repository on an in-memory store, fake only the mailer
def test_rejects_duplicate_user():
    service = Registration(repo=UserRepo(InMemoryStore()), mailer=NullMailer())
    service.register("ada@example.com")
    with pytest.raises(DuplicateUser):
        service.register("ada@example.com")
```

**Check.** Before you substitute a function:

1. Write down what the real one changes: storage, caches, events, files.
2. Decide which of those the test relies on.
3. Substitute below that point, at the network call, the clock, or the email gateway.
4. When unsure, run the test with everything real once, see what it needs, then add the smallest substitute.

"It might be slow" is not a reason until you have measured it.

## 4. Fakes with half the shape

```python
# Bad: only the fields this test reads
fake_order = {"id": "o-1", "status": "paid"}

# Good: built from the real type, so missing fields fail loudly
fake_order = Order(id="o-1", status="paid", items=[], currency="EUR", created_at=NOW)
```

Code further down reads fields the test author never thought about. A partial fake passes the unit test and breaks in integration. Build fakes from the real type, a schema, or a recorded response.

## 5. Tests scheduled for later

"Feature done, tests next" means the feature is not done. The test is part of the change. Run the **tdd** cycle.

## When the substitutes take over

Warning signs:

- Arranging the fakes takes more lines than the act and the assertion.
- Changing a fake breaks tests while the behavior stays the same.
- The fake lacks methods the real object has.
- Nobody can say which boundary the fake stands for.

At that point a test with the real collaborators and one fake at the outer edge is usually shorter and more honest.

## Quick reference

| Smell | Fix |
|---|---|
| Assertion passes with the subject deleted | Remove the substitute or move it to the real boundary |
| Method only tests call | Move it to a fixture or test helper |
| Substitute swallows a needed side effect | Substitute one level lower |
| Fake with a partial shape | Build it from the real type or a recorded response |
| Tests after the feature | Run the tdd cycle |
| Fake setup dominates the test | Use real collaborators, fake only the edge |
