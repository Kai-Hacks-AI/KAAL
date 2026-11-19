# C13 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It closes C13 in the collector. What `main` teaches can only be recorded after the promotion, and is not claimed here.

## Liked

The Change stayed small: one control, four Cases, no hook, no workflow, no ruleset. The CPO's condition on the PLAN, evidence of the Engineering check running on a pull request, was cheap to meet because the DO's own Engineering run listed T778 and T780 to T783 by name. The Cases failed on their own assertions on `main` before the DO and passed on a throwaway before they were renamed.

## Learned

The first collector sat on the history of C12's collector. When C12 reached `main` another way, that collector could no longer be promoted cleanly, and the same PLAN had to be carried onto a new collector built from `main`. A collector should be built from `main` as soon as what it needs is there. `node --test` over a file that only exports `id` and `run()` reports `ok` without running the Case, so a Case is shown RED or GREEN by calling `run()`, as `evidence.md` reproduces. A status of `running` has a ground a person can open: a job of a pull request, not a claim.

## Lacked

A way to read, for a control, the pull request run that grounds its status, without opening a job log and searching it. A place where the claim "this check ran on this pull request" is recorded next to the control and checked, instead of being quoted by hand in `evidence.md`.

## Longed For

The Inspector reading the Engineering check as a signed verdict at a station, so that `controls/CTL1` registers where it runs. A ruleset that requires the check, as another control with its own Owner decision, so that a bad declaration stops a merge and CTL1 can be judged for `tested` with a failing run on a pull request.

## Closed

The Gap of this Change, G90, is closed by Cases T780 to T783, green in the collector (6 pass, 0 fail over `engineering/controls`), with the Engineering run of pull request #2001 passing 550 of 550. The control claims `running` only. It blocks nothing, and no failing run on a pull request is shown.

## Sentence

Always Check Controls Tests, Opening Records Showing Evidence Everywhere.
