# C111 evidence

## Provenance

- Baseline: the collector `kaal/release/verify-act` at bed61a2 (`main`, 20 Nov 2026). Method: each Case's `run()` is called in the tree of this PLAN; for the throwaway copy the judge of release/C103 as its DO (#2165, head e9f990e) is placed first, because this judge reuses `changeIdOf`, then the drafts as the DO's files and the five Cases renamed. Observed 20 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| release/T1305 | release/I60 | RED: I60.md is absent |
| release/T1306 | release/F86 | RED: F86.md is absent |
| release/T1307 | release/A76, release/F86 | RED: A76.md is absent |
| release/T1308 | release/F86 | RED: judge-verify-act.mjs is absent |
| release/T1309 | release/CTL31 | RED: release/CTL31 is not listed |

5 RED-observed, 0 error, 0 green.

## Can each Case pass

In the throwaway copy all five are green, and the runner on that copy has 320 tests, 304 pass, 16 fail, the 16 of the collector. T1308 runs the real kaal-retro scripts on retros built from the real RT1 as the model of the form.

Mutations of the judge in that copy (the same change made in the draft, so that the draft-equality assertion does not mask them), each caught: an unjudged retro passed (T1307, T1308); the finder's refusals ignored (T1307, T1308); the retros of another collector judged (T1307, T1308); a malformed retro ignored (T1307, T1308); a retro without a judgement counted well formed (T1307).

## What this shows and does not show

That the judge says what the form answers of kaal-retro mean for the carried Changes, never passes what it cannot read or what the form judgement does not know, never reads Git or GitHub, and does not define the form. It does not show that a retro is true, that a job runs it or that a station requires it: those are the next Changes, and the control, declared detective and meant to become preventive, stays `designed` until its Cases and evidence exist.
