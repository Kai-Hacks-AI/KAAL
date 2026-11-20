# C110 evidence

## Provenance

- Baseline: the collector `kaal/release/limit-act` at 30ec1fa (`main`), no commit of its own. Method: each Case's `run()` is called in the tree of this PLAN; for the throwaway copy (`git archive` of the collector plus this folder) the drafts of `interface.md` are placed as the DO's files and the five Cases renamed to `.test.mjs`. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T1300 | release/I59 | RED: I59.md is absent |
| release/T1301 | release/F85 | RED: F85.md is absent |
| release/T1302 | release/A75, release/F85 | RED: A75.md is absent |
| release/T1303 | release/F85 | RED: judge-limit-act.mjs is absent |
| release/T1304 | release/CTL30 | RED: release/CTL30 is not listed |

5 RED-observed, 0 error, 0 green.

## Can each Case pass

In the throwaway copy all five are green, and the runner on that copy has 320 tests, 304 pass, 16 fail, the 16 of the collector (315 tests, 299 pass, 16 fail without the five).

Mutations of the judge in that copy, each caught by T1302 (with its draft-equality assertion set aside, because it fails first and masks the others) or by T1303: a folder matching the folder itself; `*` matching more than one segment; every pull request treated as an ACT, or none; the row of the route `act` not required to be single; a folder without a closing `/` accepted; a path with `..` accepted.

## What this shows and does not show

That the judge says whether a pull request is an ACT and whether it stays inside the folders of the route `act`, from given paths and a write map, never reads Git or GitHub (a branch and a commit that call themselves anything change nothing), and never passes on what it cannot read. It does not show that the wiring hands in the right paths, that a workflow runs it or that a station requires it: those are the next Changes, and the control, declared detective and meant to become preventive, stays `designed` until its Cases and evidence exist. The other rows of the write map are not built.
