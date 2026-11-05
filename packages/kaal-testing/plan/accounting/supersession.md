# Supersession of an immutable Case by `testing/C34`

Owner ruling (5 Nov, Kai A): `testing/T83` is amended in `testing/C34`, the DO of `testing/C33`, so that it admits the one sibling import `testing/N10` approved. It changes nothing else.

| | Before (`testing/C39`) | After (`testing/C34`) |
| --- | --- | --- |
| Title | "... the platform way is unchanged, and the module still imports nothing" | "... the module reads no host and imports only Testing's own model" |
| Assertion on `lib/verifiers.mjs` | no static `import`, no `import()`, no `require()` | exactly one static import, of `./model.mjs`; still no `import()` and no `require()` |
| Scenarios | `SCENARIOS.length` is 19 | unchanged |
| Platform way | judged as `testing/C29` planned | unchanged |

`testing/T13`, which forbids importing a package Testing judges, is untouched: `./model.mjs` is a file of the package, not a package.
