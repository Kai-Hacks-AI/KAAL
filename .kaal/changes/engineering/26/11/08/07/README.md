# Engineering: the Change Isolation judge finds Foundation's SHA-256 at the new layout path and at the old one

Capability: Engineering. Target: kaal/engineering-sha256-path. Record number is provisional until integration. Fixes the RED Cases of record 06.

## Content (6 paths, no `.github`, no ledger entry)

- `engineering/github/change-isolation.sh`: reads `packages/kaal-foundation/05-src/skills/kaal-foundation/scripts/sha256.mjs` from the target's tip first, then `packages/kaal-foundation/lib/sha256.mjs`.
- `engineering/change-isolation/check.mjs`: the comment names both.
- `engineering/change-isolation/carried-entry.test.mjs`, `engineering/guard/acceptance/package.test.mjs`, `engineering/github/handler-deferred.red.mjs`: resolve whichever of the two paths exists.
- This record.

## Check

`node --test engineering/github/sha256-path.red.mjs engineering/change-isolation/carried-entry.test.mjs engineering/github/handler-deferred.red.mjs`: 12 of 12 pass (T1 and T3 were RED). `bash -n` on the wrapper; `node --check` on package.test.mjs.

## Act

Hand-run. Reaches main by promotion, then syncs into kaal/foundation before Foundation's layout Change merges. The layout file is byte-identical, so the digest source does not change.
