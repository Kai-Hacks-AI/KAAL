# Engineering: Codex review discipline in AGENTS.md

Capability: Engineering. Collector: kaal/engineering. Record number is provisional until
integration.

## Intent

Make Codex review part of how every KAAL Change is handled, and keep its findings in their place.

Kai's rule (3 November): every PR requests `@codex review`. The owning thread triages each finding by judgement. A finding is input, not a gate. A valid finding can still be out of scope for the PR it appears on.

## Design

One section, "Review with Codex", added to the repository's root `AGENTS.md`:

- Every PR asks for `@codex review`.
- In scope: fix it in this PR.
- Valid but out of scope: record it as a Defect, confirmed through a Test Case, and route it to the capability that owns the behaviour. The PR is not widened.
- Invalid: reply with the reasoning.
- A finding never replaces required checks or reviews and never weakens a test.

Defect concept and record stay with `kaal-defect` as incubated in Testing; the instance belongs to its originating context. Nothing here defines Defect semantics.

## Scope and authorization

Documentation only. No workflow, harness, test, manifest or lock change. Ordinary Change into `kaal/engineering`. No synchronization, promotion or publication.
