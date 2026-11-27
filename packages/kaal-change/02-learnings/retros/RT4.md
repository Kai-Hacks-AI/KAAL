---
id: change/RT4
format: 4L
reflects: [change/C14]
---
Account of: I am the change thread. I planned and delivered change/C14, the declaration of the four request types PLAN, DO, ACT and HOTFIX in Hosting's form, as a PLAN (#2629), a SYNC (#2803), a PLAN amendment (#2804) and a DO (#2808) into `kaal/change/declarations`. This is my account only: the CPO's approvals are quoted as given, and the Owner has not been asked what they lacked.

## Liked
- subject: leaving the envelope line out until the format could hold it
  keeps: the PLAN said what was missing and did not claim the line was preserved, so the amendment could add it byte for byte once Hosting's visible text existed.
- subject: Cases parked RED and delivered with no expectation changed
  keeps: the DO only renamed T1553 to T1556, so the CPO could check the expectations against the PLAN.

## Learned
- subject: a gate on another capability's format is lifted by an amendment, not by the DO
  source: T1555 had to allow `visible` and T1703 had to be added, and both are expectations, so they went into a PLAN amendment before the DO.
- subject: a stale local build hides a delivered format
  source: T1703 failed locally with "the declaration format does not have `visible`" because the ignored hosting `dist` predated C115; a rebuild made it pass.
- subject: a local ref of main can be stale without any error
  source: my fetch of main reported nothing and `origin/main` stayed at a commit from 15 November; an explicit refspec fixed it.

## Lacked
- subject: a way to see from one place that a gating Change is on main
  decision-point: deciding whether the C14 DO could start.
  cost: a manual search of main for the Hosting C115 files.
  findable: no
  address: script

## Longed For
- subject: evidence that Hosting renders these types in a real raise
  worked-anyway: T1703 renders each type through `renderTemplate` only. A real raise of a PLAN, DO, ACT and HOTFIX from this declaration would show whether the chapters read as intended.

Decisions: none made, the owner decides.
