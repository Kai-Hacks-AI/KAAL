# release/D19: the Dispatcher reads the final step from a pull request's text and skips what it cannot read in silence

Owner: the release capability (the Dispatcher, `05-src/promotion-raise`). Raised by the controls thread from #2536 to #2540 and met again by release on #2547.

## Record

```json
{
  "id": "release/D19",
  "context": "release (the Dispatcher: workflow dispatcher-raise and dispatcher, 05-src/promotion-raise/dispatch.mjs final, final-step.mjs, decide.mjs)",
  "expected": "Where a collector stands, and what a merge into it was, are read from files of KAAL alone, never from a pull request title or body. Position: whether the Changes of a collector reached their final step is read at the merge revision: every Change folder the collector carries (a folder main does not hold, its id the id of its record) is reflected by a retro of the collector. When it is, the PROMOTION is raised, whatever the title or the body of the merged pull request says. When it is not, the run says why in the terms of the files (which carried Change has no retro) and stays green; when the files cannot be read (a carried Change with no readable id) the run is red and names the folder. Inflow: what the merge brought in is classified from the paths it changed on its own (what main already holds does not count) as PLAN, DO, ACT or SYNC against the write map, and a merge the files cannot place (paths of an ACT together with other paths, or in no route) is reported and red. A merge is never skipped without a report.",
  "observed": "The decision reads the body (`## Change` then `## Records` for an ACT, `## Reason` without `## Records` for a SYNC) and the title (`ACT:`). Controls ACTs #2536, #2537, #2538 and #2540 with free-text bodies ended green with {\"action\":\"skip\",\"reason\":\"not-a-final-step\",\"detail\":\"KAAL: unknown\"}; release ACT #2547, whose body had `## Reason` and `## Change`, ended green with detail \"KAAL: SYNC\". `raise Dispatch` was skipped, no PROMOTION was raised and nobody was told. The files of those collectors said the work was done.",
  "where": "engineering/release-management/05-src/promotion-raise/dispatch.mjs (final), final-step.mjs (stepOf, decideFinal) and decide.mjs (decideRaise)",
  "reach": "every collector: the PROMOTION of finished work waits until a person notices",
  "status": "confirmed",
  "reproduction": "Run 45795488785 (#2547) and the classify jobs of #2536 to #2540; locally release/T1535 (position) and release/T1536 (inflow) run `dispatch.mjs final` over fixture trees with a body that follows no convention: a collector whose carried Change is reflected by a retro is skipped where a raise is expected, and no inflow is classified at all."
}
```

## What is shown, and what is not

Shown: the silent skips by the runs above, and by the Case the decision on text rather than files.

Not decided here, and the remedy's: the exact report (a notice in the step summary and an annotation), and the hotfix and wire classes, whose step is also read from the body today and which follow in their own Changes once the collector class reads files.

## Cases

release/T1535 (position) and release/T1536 (inflow), `T1535.red.mjs` and `T1536.red.mjs` in this folder, parked RED on main (a parked Case is not run by the lanes). They ship with the fix as `.test.mjs`.
