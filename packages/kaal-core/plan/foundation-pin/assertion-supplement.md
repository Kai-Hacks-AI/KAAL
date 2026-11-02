# Core/C48 PLAN: the omitted pin assertion, and Core's exact path set

Supplement to approved Core/C47 (#856), found while preparing its DO against
Foundation's 0.0.2 candidate (#838, head `803d13d`). It changes only this planning file.

## Planning defect

C47 named one assertion, `engineering/acceptance/embed.test.mjs:203`. Core has a
second exact-pin assertion: `packages/kaal-core/test/boundary.test.ts:91`
("depends at runtime on kaal-foundation, kaal-hosting and yaml alone"), which
deep-equals `{ "@kaihacksai/kaal-foundation": "0.0.1", ... }`. With the pin at 0.0.2
it fails, so the DO cannot be green without amending it. Changing a Core test
without a reviewed amendment would break the immutable-test boundary, so it is
proposed here first, as C45 did for T96.

## Exact amendment

`boundary.test.ts:91`: the value `"0.0.1"` becomes `"0.0.2"` for
`@kaihacksai/kaal-foundation` only. `kaal-hosting` stays `0.0.1`, `yaml` stays
`2.9.1`, and the assertion stays a strict deep equality. It is the same
discriminator on the new version, not a relaxation, and no other line of the
test changes.

## Core's complete path set for the atomic change

For the ledger entry (Engineering #854/#862) Core's paths are exactly:

1. `packages/kaal-core/package.json` (the pin, `0.0.1` to `0.0.2`)
2. `packages/kaal-core/test/boundary.test.ts` (line 91, above)
3. `packages/kaal-core/test/verify.json` (regenerated explicitly: `package.json` is shipped)
4. `engineering/acceptance/embed.test.mjs` (line 203, per C47)

Core's code, API, docs, other dependencies and version do not change. The other
owners' paths (Foundation's package, the Change and Testing pins and their
assertions) and the root lock remain theirs and Engineering's.

## Local preparation evidence (Linux, Node 24.22.1; scratch, not committed)

- Intended RED: Core left at 0.0.1 beside Foundation 0.0.2: `npm ci` fails.
- With Core's four paths plus the other owners' pins and an `npm install --package-lock-only`
  derived lock (scratch only): clean `npm ci` resolves one Foundation, the workspace copy.
  Core's `npm test` passes (source suite verified), `manifest --check` and T96/T97 pass.
  Without the `boundary.test.ts` change Core's suite fails, which found this defect.
- This is local diagnosis, not the lock derivation twice, not three-host evidence, and not
  the ledger entry. The scratch patch is a candidate for review, not an integration.

This PLAN grants no integration, SYNC, promotion or publication.
