# Release Management control-chain assessment (PLAN refinement)

Assessment and PLAN refinement only: nothing is implemented, retired, promoted or published, and the PLAN, RED, DO sequence stands. It answers the CPO handover of 10 Nov: work from the release controls inward, local hooks and scripts included, and give each control one owner of KAAL's control, one owner of its reusable semantics, one authoritative implementation and the right Cases in the right contexts. The findings D1 to D7 are evidence, not the plan. Evidence below is **static reading of the repository at this head**; nothing was run, and every claim that a run must confirm is marked "to confirm".

Principle (CARGO): Change authorizes, Guard guards, Release progresses. Engineering applies the controls to KAAL; the reusable capabilities own the semantics. Two invocations of one implementation are good; two independently maintained implementations of one judgment are not.

## What the hook and CI already share

- `.githooks/pre-push` runs `kaal-guard run --hook`, which runs the Guard check `push` (`push-check.sh`). It calls the same judgments CI calls: `engineering/github/lineage.ts` for Branching and Promotion Source and `engineering/change-isolation/check.mjs` for Change Isolation, "as the target holds it". So **the judgments are already single for these controls**; what differs is the wrapper that supplies the Git facts: `push-check.sh` for the hook, `branching.sh`, `change-isolation.sh`, `promotion-source.sh` and `branching-audit.sh` for CI. That is duplicated plumbing, not a duplicated judgment, and it is where drift can enter (to confirm: the fact resolution of each wrapper).
- Where the judgment really is duplicated: the path rule "a set of paths travels alone" exists as **hand-written regexes** in `check.mjs` (Core, Core support, `.github`) and as **hand-written `grep -E`** in `guard-acceptance-boundary.yml` (the Guard boundary), and that workflow is not a Guard check at all. Two matchers, one idea, two implementations, neither using a parser (Git pathspecs would be).
- Source testing and installed-artifact verification are different judgments and stay apart: `kaal-guard`'s `test/verify.mjs` verifies the installed package; `publish.yml` Pack verifies the packed artifact.

## Control-chain table

Contexts: H hook, PR pull request, MG merge group, P promotion, B publication, S scheduled. Owner column reads KAAL control / reusable semantics. "Cases" are the Cases of the control as the naming map allocates them (T1 to T11); the Case-to-context allocation itself is carried by #1339's RED.

| Control (F#) | Judgment | Ownership (KAAL / semantics) | Authoritative implementation; duplicates | Cases | Contexts | Target | Migration and proof | Performance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| version Package (F3) | the shipped version is new, unique and consistent | Engineering / Release | `release-engine/release.mjs` (shim `engineering/release/release.mjs`); duplicates: Hosting T83/T84, Change T57 and a package-only probe re-implement the judge | T1 to T3, T11 (specified, not built, G1 to G3) | P | keep in Engineering; Release generalizes later (optional) | build T1 to T3; Hosting and Change retire their copies; then remove the shim | the duplicate copies re-run it per package |
| approve Publishing (F1) | publication is bound to record, run, commit and digest and approved | Engineering / Release | `publish.yml` job `approve Publishing`, `npm` environment, `release.mjs`; none | T4, T11 | B | keep | none beyond naming | none |
| verify Package Promotion (F2) | the published package equals the promoted one | Engineering / Release | `release.mjs` installed verification; none | T5, T11 | B | keep; G12 (optional peers) open | decide F2 scope, add a Case | none |
| audit Lineage (F5) | every open lineage and what landed conform | Engineering / Release (lineage semantics) | `lineage.ts` via `branching-audit.sh`; the hook runs the same judgment | T8 | S, H | keep; wrapper reuse | one reusable invocation | scheduled, none |
| verify Ancestry (F7) | a promotion is fresh and shaped from its lineage | Engineering / Release | `lineage.ts` (895 lines: freshness, shape, merge method, source, audit in one file); mixed with bind Merge and the synchronization shape | T8 | H, PR, MG | keep one implementation, split its verdicts by owner | per-verdict equivalence on real inputs | run from 4 workflows plus the hook, each with its own checkout, setup and `npm ci` |
| bind Merge (F10) | the queue's group is the admitted pull request and merges by the right method | Engineering / Release | `lineage.ts` merge-method verdict, `merge-group/` (`bind-group.sh`); queue setting | T8 | PR, MG | keep | as above | MG copy by design |
| accept Capability (F14) | a promotion comes only from a `kaal/*` lineage | Engineering / Release | `lineage.ts source` via `promotion-source.sh`; MG copy | T8 | PR, MG | keep | reusable workflow | as above |
| isolate Change (F6) | Core and `.github` travel alone; the guard boundary stays alone | Engineering / **open: Change or a KAAL-local mechanism** | `check.mjs` regexes (authoritative today), duplicated by the boundary workflow's `grep`; the hook and CI call `check.mjs` | T7, T8 | H, PR, MG | **one KAAL path-set mechanism, run as a Guard check**; generalization into Change is optional | express the three sets as data, one matcher by pathspec, equivalence on real change sets and RED fixtures, new control required before the old retire | 3 invocations of one matcher; no measured saving beyond removing a hand-rolled job |
| approve Change (F15), approve Promotion (F11), serialize Promotion (F13) | required approval and one-at-a-time promotion | Engineering / Release (Change for who may approve) | ruleset and queue settings; the hand-rolled review relay, admission and attestation trio is a competing mechanism (`attest.mjs` and 3 workflows) | T8 | PR, MG | native settings; retire the trio | needs the Owner's ledger-digest decision first | removes 3 workflows and their re-evaluations |
| scan Vulnerabilities (F8), scan Dependencies (F9) | no known vulnerable code or dependency | Engineering / the scanners | CodeQL, dependency-review; none | T8 | PR, MG | keep as used tools | none | none |
| test Candidate (F12), test Integration (F16) | the right Cases pass at the boundary, FAR applied | Engineering / owning capabilities, Testing | `ci.yml` lanes via `lanes/`; Cases: Hosting x3, Acceptance per host, Workspaces, Engineering, Guard | T8, T9 | H (subset), PR, MG, P | per #1339 | per #1339 RED | see below |

## Duplicates, separated by kind (CPO ask)

**Implementations** (one judgment, two codes): the path matcher (`check.mjs` regexes and the boundary `grep`); the release judge in Hosting and Change; the approval trio against native settings.
**Cases** (the same Case defined twice): the release-judge Cases in the packages (above). Nothing else found by static reading.
**Executions** (one Case run twice): `engineering/guard/acceptance/authority.test.mjs`, `engineering/guard/consumer/harness.test.mjs` and `engineering/guard/external/deliver.test.mjs` are named in the `test:engineering` script (Engineering lane), and the Guard job runs `engineering/guard/acceptance/*.test.mjs`, which includes `authority.test.mjs`; so at least one Guard Case likely runs in two lanes (to confirm by running, per host). The wiring of one judgment per event (six copies of checkout, setup, `npm ci` and `kaal-guard run`) repeats work but not a judgment.

## Finding that corrects D4

D4 supposed that the `Workspaces` lane might run Guard's own Cases a second time. Static reading does not support that: `kaal-guard` is **not** a root workspace (the root `workspaces` list omits it; it is a `file:` dev dependency) and `workspaces.mjs` runs `npm test` per workspace. The Guard job is therefore the only runner of Guard's package tests, per host. The overlap that may exist is the Engineering-lane one above. #1339's RED should test this and not the Workspaces hypothesis. A second correction: the map's `release.yml` is `publish.yml` on `main`.

## Revisited questions

- **Mixed Branching.** One file, `lineage.ts`, carries ancestry (freshness), shape of a synchronization, merge method, source and audit. The split of the **verdicts** is right; splitting the **file** is not required for clean ownership. Ownership: freshness and audit are lineage semantics (Release, applied by Engineering); the merge method is Release's; whether the synchronization shape is Change's is an open question for the Owner. Each verdict keeps one implementation, invoked from every context.
- **Path isolation.** Traced: `check.mjs`, the boundary workflow, `push-check.sh`, `change-isolation.sh`, `.githooks/pre-push`, `kaal-change` `isolate`. Change's `isolate` (graph-based, semantic) is a different judgment and is untouched. A path-based rule is a different mechanism, and the name `travel` is not decided.
- **Is generalizing path isolation into Change on the Release Management critical path? No.** What release management needs is one authoritative KAAL implementation: the three path sets expressed as data, one pathspec-based matcher, run as a Guard check from every context, with the hand-rolled boundary workflow retired after proof. That can be done inside Engineering with no new Change product. Moving the rule into `kaal-change` is productization, worthwhile only once the semantics are understood; Engineering then consumes it and keeps no competing copy. It is therefore **optional** for the release path.
- **Source tests and installed-artifact verification** stay separate (above).

## Proposed clean control architecture

1. Each control has one authoritative implementation in the place of its reusable owner; where the owner is Engineering until productized, it lives in `05-src/`, once.
2. Hook and CI call the same implementation through Guard; wrappers shrink to a single shared fact-resolution, not one per context.
3. Release management composes the controls into `KAAL / release / <step>` reusable workflows; the three review workflows, the boundary workflow and the per-event copies retire after proof.
4. Cases live once with their control and are allocated to contexts as data; CI-only coverage (hosts, installed artifacts) is marked as intentional.

## Disposition of existing implementations and contexts

Per workflow and job: as in `control-ownership-plan.md`, with these changes: the hand-rolled boundary workflow and the regexes of `check.mjs` converge on one path-set mechanism (isolate Change); the Guard lane question becomes the Engineering-lane overlap; the Branching split is of verdicts, not of the checker file; the push hook's wrapper is merged with the CI wrappers' fact-resolution.

## Revised critical path (necessary against optional)

Necessary for clean controls on `main`: #1339 RED/DO (claims, lanes, allocation, fail-closed, baseline); version Package (T1 to T3) and the retirement of the duplicate release Cases; the one path-set mechanism and the Guard boundary as a Guard check; the verdict split and reusable workflows for Branching; native approval settings after the ledger decision; proof, contexts, then removal; then promotion in slices. Optional and later: productizing the path rule in `kaal-change`, any `kaal-release` generalization of the engine, splitting `lineage.ts` into files.

## Changes needed in #1343 and the existing work

- #1343 carries this assessment and the corrected D4; its plan no longer treats `travel` as decided or as a prerequisite.
- #1339 (merged): its RED adds the Engineering-lane overlap test and the Case-to-context allocation table; the Workspaces hypothesis is replaced.
- Change's #1344 (a `travel` PLAN) is an optional productization, not a dependency of this path.
- Requirements and Architecture entries: isolate Change and the verdict split, in the next per-control PLANs.

## Open decisions (CPO or Owner)

1. Interim home of the path rule: stays an Engineering mechanism (recommended) or waits for Change.
2. Whether the synchronization shape is Change's.
3. G13, G14, G15, G12 (F2 optional-peer scope), the ledger-digest decision, the proof rulesets and contexts.
4. Whether `lineage.ts` stays one file with split verdicts (recommended) or is split.
