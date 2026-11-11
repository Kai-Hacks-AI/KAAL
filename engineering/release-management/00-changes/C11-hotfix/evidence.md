# C11 evidence

The PLAN of C11 observes its RED against `main`. Work that is not on `main` is not delivered functionality, and C11 cites nothing that is not on `main`.

## Provenance

- Baseline: `main` at `d19abeff8225c578416138e9def950d952ba898b`. `main` holds the PLAN template and no Hotfix template.
- Method: the eleven Cases of this PLAN (T150 to T160) are copied over a checkout of `main` and each Case's `run()` is called. A second execution in the tree of this PLAN shows which Cases stay red with the documents of this PLAN present.
- A throwaway reference template, outside the repository, was built from the draft in `interface.md` to show that the Cases can pass: all eleven were green with it. It implies no wording of the delivered template.
- Mutation: the reference template was altered six times, and each alteration turned the Case that owns it RED with a message naming the fault: Urgency renamed (T151, T153), Approach renamed to Route (T151, T154, T155), an Urgency hint that accepts a ticket number (T153), a Defect hint that no longer forbids a false production claim (T152), an Approach hint without the refactoring bar (T154) and an introduction that no longer says the Cases and the diff hold everything else (T155).

## Result

| Case | Tests | On `main` (assertion that failed) | In the tree of this PLAN |
| --- | --- | --- | --- |
| release/T150 | I10 | I10 is absent | the Hotfix template is absent |
| release/T151 | F16 | the Hotfix template is absent | the Hotfix template is absent |
| release/T152 | F16 | the Hotfix template is absent | the Hotfix template is absent |
| release/T153 | F16 | the Hotfix template is absent | the Hotfix template is absent |
| release/T154 | F16 | the Hotfix template is absent | the Hotfix template is absent |
| release/T155 | F16 | the Hotfix template is absent | the Hotfix template is absent |
| release/T156 | A36 | A36 is absent | green |
| release/T157 | A39 | A39 is absent | the Hotfix template is absent |
| release/T158 | G41 | I10 is absent | green |
| release/T159 | G42 | F16 is absent | the Hotfix template is absent |
| release/T160 | G43 | A36 is absent | the Hotfix template is absent |

On `main`: 11 RED-observed, 0 error, 0 green. In the tree of this PLAN: 9 RED-observed and 2 green, about documents this PLAN adds. The red Cases wait for the Hotfix template, a `.github` change that the DO delivers.

## The observed Hotfix corrections

Each row is one correction on the Hotfix route, merged. No Hotfix pull request is open, and `kaal/hotfix` does not exist now (deleted after its promotion, as `engineering/github/branching.md` says).

| Correction | Pull requests | Defective state | What made it urgent | Production touched | Reconciliation said in the body |
| --- | --- | --- | --- | --- | --- |
| guard/C136, Guard CI optimization | #761 into `kaal/hotfix`, promotion #763 (2026-10-31) | none: cost, Windows Guard step 24m28s | held in `kaal/guard-release` with unfinished 0.0.5 work | no, "No npm publication is needed" | separate synchronization into Hosting and Guard's release collector |
| Graph byte preservation | #821, promotion #828 (2026-11-01) | `main` and collectors: Windows checkout converted Graph inputs, Core's installed verifier refused `form.d.ts` | blocked #816, and the Owner's prioritization | no, "npm publication ... remain outside" | SYNC #829 into `kaal/core`, then refresh #816 |
| flat `packages/` layout | #956, promotion #964 (2026-11-03) | none: an Owner decision, "Option A, hotfix! Prior to hosting" | ordering before the Hosting promotion | no, "no npm publication" | none stated |
| guard/C142, Guard Windows acceptance | #1207 and syncs #1238, #1253, #1261, promotion #1240 (2026-11-08), `.github` part alone as #1233 | none: cost, Windows job 8m50s to 3m21s | held with unfinished 0.0.5 work | no, "No version bump, npm publication" | `guard-release.yml` retired later |

None of the four corrected a defect in a published version. In all four the urgency lay in `main` or in the collectors.

## The states today

| State | Evidence |
| --- | --- |
| Production | The npm registry serves `@kaihacksai/kaal-hosting` 0.0.1 (2026-11-08), `@kaihacksai/kaal-foundation` 0.0.1 (2026-10-31) and `@kaihacksai/kaal-guard` 0.0.4 (2026-10-28), each with an earlier `0.0.0-stage`, and Guard also 0.0.1 to 0.0.3. `@kaihacksai/kaal-change` and `kaal-core` are not on the registry. The registry holds no `gitHead` for any of these versions and the repository holds no tag. |
| `main` | `packages/kaal-guard/package.json` is 0.0.4 and declares `@kaihacksai/kaal-hosting` 0.0.1 as a dependency. The published 0.0.4 tarball declares none. Twelve Guard paths changed since the commit that promoted 0.0.4 (#550), among them the acceptance harness and `test/verify.json` (#1240). Same version number, different content. |
| Collector work | `kaal/guard-release` holds Guard 0.0.5 work that is on neither `main` nor production (#761, #763). |

## Reproduce

Run from a checkout of this branch, with Node 22 and no dependencies. For each `T150` to `T160` `.red.mjs` file import it, call `run()` and report RED-observed when it throws an assertion error. The registry facts come from `npm view` on the three package names and from `npm pack @kaihacksai/kaal-guard@0.0.4`.
