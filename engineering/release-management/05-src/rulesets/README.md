# rulesets

Declarative GitHub configuration of the release controls, one file per ruleset, and the check that the active configuration equals it. It holds no judgment of its own.

- `integration.ruleset.draft.json`: the `integration` ruleset: approval of the most recent push, no rewrite or delete, merge methods `squash` and `merge`, on `kaal/**` and `kaal/**/*`; no bypass actors, no status checks, no merge queue.
