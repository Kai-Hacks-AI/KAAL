# C70 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's framing, a ruleset setting as the answer to a control, turned a brittle idea into a small generic one: the judge holds no shape, the stage declares its rules, settings and checks, and each traces to a control with an Intent. The Cases were written RED against the old judge with a baseline-passes assertion and finding-message checks, so they could not pass by accident; they went green with the draft as written, and the verdict on the real sources did not change. The CPO's review kept the boundary clear: the interpreter is generic, the traceability of ruleset-level settings is not complete.

## Learned

I planned `rules` to replace `requires` and `also`, and only the DO showed that `verify Stages` runs `main`'s judge on the PROMOTION: a tree with only `rules` fails Integrating and Promoting under it. The keys stay beside `rules` as compatibility, which the CPO accepted on the condition that they are removed in a later Change and are not a second authority. The PLAN had named the seven old Cases that would fail and the DO handled them, but two things were missed: the shared helpers had to supply the controls, and T760 and T761 tested an order the new rule no longer cares about, so they were removed as superseded.

## Lacked

A way to run `main`'s judge against the DO's tree at PLAN time. I ran it by hand late in the DO; the evidence should have held that run, as the C59 pattern ("a source change a judge change needs must land first") already warns.

## Longed For

The rules of the five rulesets each traced to a control and an Intent without a gap: the ruleset-level settings (`enforcement`, the refs, the empty bypass list, "no up to date", `do_not_enforce_on_create`) and the Publishing tag rule have none yet.

## Follow-ups

- Remove `requires` and `also` from `stages.json` once this Change is on `main`, as a Change of its own.
- Trace the remaining ruleset-level settings and the Publishing tag rule: each needs a control and an Intent, or an explicit decision that it is an expectation of the ruleset.
- release/C66 (the approval rule of release/CTL10) is the first new setting declared in this form; its DO follows when this Change is on `main` and release/C62 has made `status` mandatory.
- Promote this collector after release/C67 and release/C62 on the seat.
