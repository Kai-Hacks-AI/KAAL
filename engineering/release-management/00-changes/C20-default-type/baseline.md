# C20 baseline

The baseline is the collector `kaal/release/check-pr-envelope`, which holds the delivered release/C12 (PLAN, DO and ACT). Nothing of it is on `main`.

- `templates.mjs` returns a `fallback` for a default file that declares DEFAULT and keeps DEFAULT out of the registry.
- `envelope.mjs` takes the registry as input and reports a TYPE that is not in it as unsupported.
- F17 and A40 describe DEFAULT as a reserved declaration, not a TYPE.
