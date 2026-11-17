# C54 do

## What the DO changed

- `05-src/wiring/templates/promotion.md`, written from the draft in the `interface.md` of release/C46:
  - step 0: "Main requires the branch quality of the source branch: name it and its last merged PR; this promotion holds the single-promotion seat". No branch kind is listed.
  - step 1: the freshness check adds a Dependency row with the #<PR> that brings main's tip in, without naming a SYNC.
  - last row: "Merge the approved PROMOTION into main, which requires the approved exact head; this releases the seat and nothing starts automatically". WIRE is no longer named.
  - the conditional-row comment describes the Dependency row without naming the SYNC.
- The expanded table in the C46 `interface.md` has the same rows and the Dependency row "The pull request that brings main's tip into the source".
- Cases release/T662 and T663 reworded to the new rows; T660 to T663 stay green.
- T710 and T711 renamed from `.red.mjs` to `.test.mjs`; green.

## Not done, as planned

`.github` is untouched. The merged records of release/C46 stay as history.
