# C76 baseline

The baseline is the collector `kaal/release/stages-extra-rule` at its tip, which holds release/C70 (judge, `stages.json` with `rules`, Cases T900 to T903), on `main` c8291db.

- The six sources under `05-src/wiring/rulesets/` hold `enforcement: active`, their own refs and an empty `bypass_actors`.
- The judge (`05-src/stages/judge.mjs`, release/C70) judges the refs and the empty bypass list as fixed expectations, and does not read `enforcement` at all: a source that is `disabled` or `evaluate` passes.
- No control or Intent states why these three settings hold; the judge reads no control for them (release/C70, `change.md`, Left open).
