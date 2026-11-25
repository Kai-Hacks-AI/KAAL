# review/C5 DO

Authorized by the CPO's approval of the PLAN (#2327), and by the Owner's rule that a merged PLAN is the go for its DO.

## Delivered

- `skills/kaal-review/scripts/navigate.mjs` exports `navigate(root, { revision })` and the front matter reader `parse`. It lists and reads the tree through Hosting alone (list with skip and links, then readFile), assumes no layout, no Git and no station, and reports malformed files, incoherent records and authority claims as findings. It states no coverage and no approval.
- `skills/kaal-review/references/review-items.md`, a Skill reference that names no station and no KAAL term, linked from `SKILL.md`.
- `@kaihacksai/kaal-hosting` is now a dependency of the package, the permitted one, and no longer a development dependency (the lock file follows).
- `test/review-items.test.mjs` runs the five planned Cases (review/T298, review/T299, review/T1388 to review/T1390) in `scripts.test`, with unit tests of the parser. The temporary `run-red.mjs` is removed.
- The standalone acceptance scenario of review/C2 gains one step: from the fresh host, `navigate` reads a small tree through the installed Hosting. The packed file list in `test/review.test.mjs` names the two new files.

## Checked

- The five Cases are GREEN, and the package tests pass: 26 of 26.
- The Acceptance lane (`npm run test:acceptance`) passes with the new scenario step: 8 scenarios, 46 tests.

## Not done

T1388 to T1390 stay provisional until release confirms the ids. `review-items` in the package layout is Engineering's change (they have raised it as C31). No promotion and no publication.
