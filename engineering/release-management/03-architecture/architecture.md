# Architecture

## The flow (system view)

```
   12-kaal (kaal/*)             11-main                      10-npmjs
 +------------------+      +------------------+      +-------------------+
 | in:  approve     |      | in:  bind Merge  |      | in:  approve      |
 |   Change, test   |      |   approve Promo, |      |   Publishing      |
 |   Integration,   |      |   test Candidate,|      | stock: verify     |
 |   isolate Change |      |   serialize Pro- |      |   Package         |
 | stock: audit     |      |   motion, accept |      |   Promotion       |
 |   Lineage        |      |   Collector      |      | out:  (none yet)  |
 | out: verify      | ---> | stock: audit     | ---> +-------------------+
 |   Ancestry       |      |   Lineage        |
 +------------------+      | out: version     |
                           |   Package        |
                           +------------------+
```

Station `13-change-branch` is dropped for now (Owner, 9 Nov). Pull-oriented: each station owns its **in** move, and the sender owns its **out** check; the same station's out and the next station's in may be different controls. The drawing reads left to right (work moves toward npm) and the receiver pulls. This PLAN designs only the border `11-main` to `10-npmjs`; `audit Lineage` at the root serves both 11 and 12. Control names are the Owner's; existing checks and files keep their names.

## Elements

- **release-management/A1 [F3]. Version gate (11-main out).** Today `readiness()` (`engineering/release/release.mjs`) inside Pack. Planned additions, each a separate DO with its own RED Case: greater-than-latest (G1), release tag (G2), version-set-by-Change (G3).
- **release-management/A2 [F1]. Approval gate (10-npmjs in).** `release.yml` Publish job, `environment: npm`; `publishable()`. Planned: the release record names the approving run (G5).
- **release-management/A3 [F2]. Promotion check (10-npmjs stock).** `provenance()` and Accept. Planned: the record carries the promotion it came from (G9).

Nothing above changes `.github` in this PLAN; `.github` changes travel alone as their own Change.
