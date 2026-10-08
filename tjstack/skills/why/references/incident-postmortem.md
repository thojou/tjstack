# Incident & Postmortem Context

Not a separate source, a **cross-cutting angle**. Incidents often motivate defensive code ("we added this check after the X outage"), so if the target looks defensive (null checks, retry logic, timeout handling, rate limiting, feature flags), search incident and postmortem language inside the assigned source only.

- **Git**: commits with messages like "fix for incident", "add defensive check", "revert" followed by "re-apply with..." are strong signals

Record cross-source links under Additional Leads. Do not chase them.

If you find an incident link inside the assigned source, fetch the full postmortem. Postmortems typically have an "Action Items" section that ties directly to code changes.

Worth spending time on when the code's defensive character makes an incident-driven origin plausible. Skip it for code that doesn't look defensive.
