# Changes (planned)

One Change per control, each through the full loop as graph Nodes (Intent, Requirement, Architecture, Cases; a Case `tests` a Node and no Node points at a Case). Each Change does four things, in this order, and nothing else (names aligned per F4: self-explanatory, mapped in `03-architecture`, not identical strings):

1. **Add** the control as a job named by the control inside the workflow `release/<station>` (see `03-architecture`), running the code from its home in `05-src/<station>/<control>/`.
2. **Move** the code from where it lives today into `05-src` (history kept with `git mv`; the old path keeps a one-line shim only if a required check or hook still calls it).
3. **Retire** the old check name once the Owner has added the new context to the ruleset by hand, and only when that makes sense: a control with no old equivalent retires nothing.
4. **Prove** it with Cases that sit next to the code (test layout rule); parity Cases pin that the moved code behaves as before.

Order of every rename is **add-new, Owner adds the context to the ruleset, remove-old**, so no step blocks a promotion in flight (#1278, #1272).

| Control | Station | Today (code, check) | Retires |
| --- | --- | --- | --- |
| isolate Change | 12-kaal | `engineering/change-isolation/`, `change-isolation.sh`; `Change Isolation` | `Change Isolation` |
| verify Ancestry | 12-kaal | `engineering/github/branching.sh`, `lineage.ts`; `Branching` | `Branching` (to confirm: it is the freshness check) |
| approve Change | 12-kaal | review half of Change Isolation; `Change Isolation (review)` | `Change Isolation (review)` on `kaal/*` PRs (to confirm) |
| test Integration | 12-kaal | `engineering/lanes/`; `Hosting`, `Workspaces`, `Acceptance`, `Engineering`, `Guard` x3 | the lane names, as they become lanes of the control |
| accept Capability | 11-main | `engineering/github/promotion-source.sh`; `Promotion Source` | `Promotion Source` |
| bind Merge | 11-main | `.github/scripts/bind-group.sh`, merge queue; no named check | none |
| approve Promotion | 11-main | review of a promotion; `Change Isolation (review)` on `main` PRs (to confirm) | none until confirmed |
| test Candidate | 11-main | the lanes on `kaal/*` to `main` incl. `CodeQL` x2 (to confirm) | the lane names |
| serialize Promotion | 11-main | merge queue, one promotion at a time; no named check | none |
| version Package | 11-main | `engineering/release/release.mjs` `readiness()` | none (extends G1 to G4) |
| approve Publishing | 10-npmjs | `release.yml` `environment: npm` | none |
| verify Package Promotion | 10-npmjs | `release.yml` Accept, `provenance()` | none |
| audit Lineage | root | `branching-audit.sh`, `holds.json`; `Branching audit` | `Branching audit` |

Two gates close the set: `gate (main)` and `gate (kaal)` (see `03-architecture`), added once the controls they need exist; the Owner adds those two contexts and then removes the old per-control contexts from the rulesets. Each Change has its own record under this folder when it starts.

## Build order (agreed)

Root (audit Lineage), then `10-npmjs`, then `11-main`, then `12-kaal`.

## Open for the Owner

- Whether the CI lanes stay separate jobs under test Candidate/test Integration (recommended; the gate makes it cosmetic) or become one check each.
- Where `CodeQL` belongs (a lane of test Candidate is proposed) and which control owns `Change Isolation (review)` on `main`.

