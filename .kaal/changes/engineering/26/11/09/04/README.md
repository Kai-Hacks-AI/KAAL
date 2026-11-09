# Engineering (interim owner): the acceptance lane reports a nested, strictly older copy as pin-behind (foundation/C19)

Capability: Engineering, **interim owner**. Target: kaal/foundation. Record number is provisional until integration.

## Ownership

Kai, 9 Nov 2026: Engineering may own things before the package that should own them is up and running ("Engineer KAAL to be able to Embed KAAL"). This rule belongs to **Packaging** once it is installed; until then Engineering holds it. Testing's held PLAN and DO (#1286, #1288, Cases T141 to T147) stay held and are the reference for the semantics; they are not merged here. Hand-over to Packaging: move `engineering/delivery/pin-behind.mjs` and its Cases with the lane, and delete the `reclassify` call in `engineering/delivery/pack.mjs`.

## Intent

Foundation's #1272 (0.0.2 layout) fails its Acceptance check on six lines "<host> holds @kaihacksai/kaal-foundation from registry ...0.0.1, not the packed tarball" (embed, Change twice, engineer-skill, Graph). They come from Testing's `findings`, which fails any installed package whose bytes differ from the packed tarball. Under C19 (consumers may stay on an older published Foundation) a nested, strictly older copy must be a visible, non-failing pin-behind.

## Content (5 paths, no `.github`, no ledger entry)

- `engineering/delivery/pin-behind.mjs`: `readHolds` (the same read Testing makes of `node_modules/.package-lock.json`) and `reclassify`. Only a mismatch that is nested (more than one `node_modules/` segment), with held and packed versions plain x.y.z and held strictly below packed, becomes `{ kind: "pin-behind" }`; top-level, same, newer, odd or missing versions stay verified failures. Identical evidence texts are matched by count, so a top-level copy is never excused by a nested one.
- `engineering/delivery/pack.mjs`: `deliver` reclassifies Testing's findings and recomputes `passed` from the settled findings (Testing already adds a failed runner as a verified failure). Needs the packed `version` from #1287.
- `engineering/delivery/pin-behind.test.mjs`: 9 Cases (3 failed against an identity stub before `reclassify` existed), added to `test:engineering` in the root `package.json`.
- This record.

## Check

`node --test engineering/delivery/pack.test.mjs engineering/delivery/pin-behind.test.mjs`: 12 of 12. End to end: `npm run test:acceptance` on #1272's head 75bfa92 plus these files: "acceptance: passed; packed 8 packages once; 8 scenarios in 8 processes", exit 0, with the nested older copies printed as pin-behind.

## Act

No change to Testing or to any scenario. The Foundation-declared floor stays unasserted. No promotion or publication.
