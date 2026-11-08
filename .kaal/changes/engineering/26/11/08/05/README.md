# Engineering: PLAN for the pin ratchet in the acceptance checks and the Foundation 0.0.2 root lock, with a RED Case

Capability: Engineering. Target: kaal/foundation. Record number is provisional until integration. Under foundation/C19 (#1254), which amends C17.

## Content (3 paths, no `.github`, no ledger entry)

- `engineering/acceptance/plan/pin-ratchet.md`: PLAN A (root lock derived independently once the workspace Foundation is 0.0.2) and PLAN B (older nested Foundation becomes a pin-behind report; same-version duplicate, declared floor and foreign nested packages stay hard failures; exit 4 held is non-failing).
- `engineering/acceptance/pin-ratchet.red.mjs`: T1 RED (embed.test.mjs:167 still fails every nested copy), T2 and T3 controls.
- This record.

## Check

`node --test engineering/acceptance/pin-ratchet.red.mjs` on kaal/foundation: T1 fails, T2 and T3 pass.

## Act

PLAN and RED Case only. No assertion, lock, pin or version changes. The DO Changes follow with their own CPO approval. No merge to main, promotion or publication.
