# core/C53 PLAN: bounded amendment of one Core test line (exact Foundation 0.0.2 pin)

Review material only. This PLAN changes no test, script or package byte; it asks for approval of one bounded change to an existing, immutable test, beside the pin Change that foundation/C17 (#848, Route A) already assigns to Core.

## Why

Route A (#848, merged) moves Core's exact `@kaihacksai/kaal-foundation` dependency from `0.0.1` to `0.0.2`, with the matching assertion in `engineering/acceptance/embed.test.mjs`. Core's own boundary test asserts the same dependency map, so it must move with the pin or Core's suite fails. #848 does not name it.

## The amendment

`packages/kaal-core/test/boundary.test.ts`, one value on one line, in the test "depends at runtime on kaal-foundation, kaal-hosting and yaml alone, with Graph only for the build":

- `"@kaihacksai/kaal-foundation": "0.0.1"` becomes `"@kaihacksai/kaal-foundation": "0.0.2"`.

No title, assertion shape, fixture or other line changes. `amendment.patch` is the exact change, written against `kaal/foundation`.

## Bounds

One value of one existing test. The pin Change that follows also edits `packages/kaal-core/package.json`, the Route A assertion in `engineering/acceptance/embed.test.mjs`, and `packages/kaal-core/test/verify.json` (regenerated from a clean build; only the `package.json` digest moves). It touches no lock and no other package. No promotion or publication.
