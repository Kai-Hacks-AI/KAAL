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

## Decision: how collectors are named (Owner, 9 Nov 2026; recorded, not yet applied)

Collectors are named by capability, and a sub-capability is allowed, with one clean concept:

- A collector is always `kaal/<capability>/<leaf>`, never a bare `kaal/<capability>`, because git cannot hold the ref `kaal/<capability>` and the refs under `kaal/<capability>/` at the same time.
- The leaf is the **version** for a versioned capability (`kaal/foundation/0.0.2`) and a **descriptive name** otherwise (`kaal/engineering/release-management`).
- The Owner will change the ruleset pattern to `kaal/**`.
- Link to *version Package* (`11-main` out): the collector's version leaf should match the package version that gets released.
- Consequence for the control: `accept Capability` (formerly accept Collector, today's promotion source) judges that a promotion comes from a capability's collector.

Nothing is renamed by this PLAN: existing branches (including this PLAN's own collector `kaal/engineering-release-management`, which would be `kaal/engineering/release-management`), rulesets and the Promotion Source check keep their names. Migration is a later Change.
