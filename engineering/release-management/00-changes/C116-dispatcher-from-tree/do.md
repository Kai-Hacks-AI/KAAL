# C116 do

The DO of the merged PLAN, in `05-src/promotion-raise/` and the workflow source, with the Cases it asked for. The Case ids are T1324 to T1330: T1322 and T1323 were taken by the Defect route while this DO was written, so the "T1322 onward" of the PLAN is read as the next free ids.

## What changed

- `tree.mjs` (new): reads the tree as data: the capability roots, the Change folders that are in the collector and not on main (a folder difference of two checkouts), the retros as `kaal-retro` finds and judges them (its scripts taken from the default branch's checkout), and the paths the merge changed (the diff of a squash commit and its one parent; any other number of parents is refused).
- `final-tree.mjs` (new): decides the final step of a collector from those facts. It asks `demand Act`, `verify Act` and `limit Act` through the library, raises only when all three answer PASS with `applies` true, computes the title from the collector name (`PROMOTION: <capability> <item>`) and builds the three-chapter body from the tree and the source template (a line per carried Change, the placeholder under `Why now`, the table of HOW TO WORK with step 0 naming the source branch and the ACT pull request). `hold Act` is not asked, as declared in the PLAN.
- `final-step.mjs`: the KAAL class is no longer decided from the body; it skips with `decided-from-the-tree`. HOTFIX and WIRE are as they were.
- `dispatch.mjs`: `final` decides a collector from the two checkouts and everything else from the event, as before.
- `raise.mjs`: reads the body by its structure (the chapters of a promotion in order; in HOW TO WORK nothing but table rows) instead of filtering it as free text.
- `05-src/wiring/workflows/dispatcher-raise.yml`: the second checkout (the collector at the merge revision, in `collector/`, two commits deep, no credentials kept); nothing of it is installed or run; the token job reads none. Installing the workflow and the templates into `.github` is a WIRE with the Owner's go.

## Cases

T1324 (the final step from the tree), T1325 (what is not a final step, naming the judge; UNKNOWN never raises), T1326 (the title), T1327 (the body and the template's table), T1328 (the workflow reads the tree as data), T1329 (raise reads strictly), T1330 (the merge read from git, and the whole decision from a checkout). Their fixtures are `tree-fixtures.mjs`.

## Accept list (the Cases that read a KAAL body to decide)

T1152 and T1153 and T1154 (the KAAL class is decided from the tree; their HOTFIX and WIRE assertions stay), T944 and T1158 (the bodies they hand to raise are structured), T1155 (the second checkout of the collector).

## Verified

`node --test engineering/cases/cases.test.mjs`: 355 tests, 339 pass; the 16 failures are the same ones the collector had before this DO (collector-capability T268 to T279 and engineering T386 to T389). `packages/kaal-release/test/pull`: 16 of 16 pass. Nothing runs yet: no workflow of `.github` changed, no hook, no ruleset.
