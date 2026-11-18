# C56 baseline

The baseline is `main` at 39261fa. Nothing here depends on work that is not on `main`.

- `release/CTL2` (analyze Vulnerabilities, detective, Intent release/I4) is on `main`, with its workflow source `05-src/wiring/workflows/analyze-vulnerabilities.yml`. The two jobs call `actions/dependency-review-action` with only `base-ref` and `head-ref`, so they run on the action's defaults: `fail-on-severity` low, `fail-on-scopes` runtime, no `allow-ghsas`, but nothing says so.
- `05-src/wiring/rulesets/promoting.json` requires `verify Stages (Promoting)` only. `controls.md` lists `analyze Vulnerabilities (Promoting)` as a detective report that no ruleset requires.
- The ruleset update procedure is standing: the live ruleset is renamed `old <name>`, the new one is loaded beside it, both run, and the old one is retired after success. Loading is a WIRE-side step of the Owner.
- Kai's decision of 17 Nov 2026: holistic vulnerability coverage; the severity is `low`, the scope `runtime`, no exceptions.
