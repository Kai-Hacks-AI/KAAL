# C3 evidence

The PLAN of C3 observes its RED against `main`, not against the collector of C1 or against any open pull request. Work that is not on `main` is not delivered functionality.

## Provenance

- Baseline: `main` at `9033099e9234d4059c841c155abc9c309a7aa6fb`. `main` holds no `engineering/release-management/` and no `.github/PULL_REQUEST_TEMPLATE/`.
- Method: a clean extract of `.github` from that commit, with only the eleven Cases of this PLAN (T43 to T53) laid over it at their own paths, executed with the interim runner of C1:

  ```
  node run-red.mjs --evidence ev-main.json <the eleven Case files>
  ```

  The Cases read only repository files and assert the target state after the DO. Nothing of the collector of C1 is present in that tree. The runner passes no judge to a Case.
- A second execution of the same Cases in the tree of this PLAN shows which of them stay red even with the documents of this PLAN present.

## Result

| Case | Tests | On `main` (assertion that failed) | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T43 | I2 | the PLAN template is absent | the PLAN template is absent |
| release/T44 | F2 | F2 is absent | F1 still states the structure of a PLAN |
| release/T45 | F3 | the PLAN template is absent | the PLAN template is absent |
| release/T46 | A14 | A14 is absent | A3 does not sit under A15 |
| release/T47 | A15 | A4 does not sit under A15 | A4 does not sit under A15 |
| release/T48 | G10 | I2 is absent | the PLAN template is absent |
| release/T49 | G11 | F2 is absent | F1 still states the structure of a PLAN |
| release/T50 | G12 | F3 is absent | the PLAN template is absent |
| release/T51 | G13 | A14 is absent | A3 does not sit under A15 |
| release/T52 | G14 | A4 does not sit under A15 | A4 does not sit under A15 |
| release/T53 | G15 | F1 is absent | F1 does not cite F2 |

All eleven fail on an assertion about intended behaviour: 11 RED-observed, 0 unconditional, 0 error, 0 green, on `main` and in the tree of this PLAN. None is an unconditional failure or a missing import.

## What the RED asks the Change to add relative to `main`

I2, F2, F3, A14 and A15 with their interface, the PLAN template, A3 and A4 under A15, and a narrowed F1 that cites F2.
