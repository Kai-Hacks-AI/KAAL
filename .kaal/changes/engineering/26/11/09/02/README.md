# Engineering: CI repairs for Foundation's layout Change (checker without dist/, .bin in the nested walk)

Capability: Engineering. Target: kaal/foundation. Record number is provisional until integration. Found by Foundation on #1272 (head 65421e1): two Engineering-owned checks fail there.

## Defects

1. `engineering/change-isolation/check.mjs` imports Foundation's SHA-256 through the package export, which after the layout points into `dist/` (generated, gitignored, not built before the Engineering job). `entryDigest` then throws "Foundation SHA-256 is not reachable from the checker". The same gap would hit main right after Foundation's promotion.
2. `engineering/acceptance/embed.test.mjs` (my PLAN B DO, #1280) walked `node_modules/kaal-core/node_modules` including `.bin` and read `.bin/package.json` (ENOENT).

## Content (6 paths, no `.github`, no ledger entry)

- `engineering/change-isolation/check.mjs`: two more candidates after the package export and the lone copy: the source file at the new layout path, else the pre-layout `lib/sha256.mjs`. The judge's wrapper still places its verbatim copy.
- `engineering/acceptance/pin-ratchet/classify.mjs`: `listNested(dir)` (dot entries are not packages); `embed.test.mjs` uses it.
- Cases: `classify.case.mjs` (listNested with a `.bin`, and a missing directory; 9 of 9 with the earlier 7) and `engineering/github/sha256-path.red.mjs` T4 (RED before the fix: no source-path candidate).
- This record.

## Not in this Change

The Guard line "holds @kaihacksai/kaal-foundation from registry 0.0.1, not the packed tarball" comes from Testing's `packages/kaal-testing/lib/acceptance.mjs` (`findings`), which fails any installed package whose integrity differs from the packed one. Under C19 a nested older Foundation should be a pin-behind finding there too. That is Testing's capability; it needs Testing's own PLAN.

## Act

Hand-run Cases; CI decides the rest. No promotion or publication.
