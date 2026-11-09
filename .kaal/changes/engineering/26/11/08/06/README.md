# Engineering: RED Cases for Foundation's SHA-256 path moving with the package layout

Capability: Engineering. Target: kaal/engineering-sha256-path. Record number is provisional until integration.

## Intent

Foundation's layout Change moves `packages/kaal-foundation/lib/sha256.mjs` to `packages/kaal-foundation/05-src/skills/kaal-foundation/scripts/sha256.mjs` (byte-identical). The Change Isolation wrapper reads that file from the target's tip (`git show "$BASE:..."`) so the checker can digest a carried ledger entry. After the layout lands, a target lacks the old path; a change that carries an entry (the Foundation 0.0.2 promotion) would then have no digest source. This Change records the Cases; the fix is the next Change in this collector.

## Content (2 paths, no `.github`, no ledger entry)

`engineering/github/sha256-path.red.mjs` (T1 RED, T2 control, T3 RED) and this record.

## Check

`node --test engineering/github/sha256-path.red.mjs` on main: T1 and T3 fail, T2 passes.

## Act

Hand-run, static. The fix lands on main through this collector before Foundation's layout Change merges.
