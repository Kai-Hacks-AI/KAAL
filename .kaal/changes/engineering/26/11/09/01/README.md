# Engineering: the embed acceptance reports an older nested Foundation as pin-behind (foundation/C19 PLAN B, DO)

Capability: Engineering. Target: kaal/foundation. Record number is provisional until integration. DO of the PLAN merged as #1268 (`engineering/acceptance/plan/pin-ratchet.md`, PLAN B) and the RED Case T1 of `engineering/acceptance/pin-ratchet.red.mjs`.

## Content (4 paths, no `.github`, no ledger entry)

- `engineering/acceptance/embed.test.mjs`: the unconditional "no node_modules inside kaal-core" assertion (line 167) becomes a classification of what is nested there. An older Foundation is printed as `acceptance: pin-behind: ...` and does not fail; the check still fails for a same-version duplicate, a newer copy, and any other nested package.
- `engineering/acceptance/pin-ratchet/classify.mjs`: the pure classifier (also fails a copy below a `floor` when Foundation declares one; no floor is passed yet, because Foundation declares none).
- `engineering/acceptance/pin-ratchet/classify.case.mjs`: 7 Cases for it. Hand-run, not part of the Acceptance lane (the lane scans only top-level `*.test.mjs`).
- This record.

## Check

`node --test engineering/acceptance/pin-ratchet/classify.case.mjs engineering/acceptance/pin-ratchet.red.mjs`: 10 of 10 pass (T1 was RED). `node --check engineering/acceptance/embed.test.mjs`. The Acceptance lane runs in the PR's CI; I could not run it by hand here.

## Act

Not decided here: the Foundation-declared floor (no assertion until Foundation declares one). exit 4 "held" as a non-failing CI report is the report line above; no CI configuration changes. No merge to main, promotion or publication.
