# C41 change

## PLAN

1. **From.** The envelope check enforces the chapter list of a type and a few content limits. It knows nothing of a table, so a `HOW TO WORK` chapter, once a template carries it, would be judged only by the generic rules.
2. **To.** `howToWorkProblems(body)` in `05-src/plan-body/envelope.mjs`, called by `verifyEnvelope` for every body, judging only the format described in `interface.md`. It stays silent on a body without the chapter, so it changes no verdict today. Details may hold `#<number>` PR references.
3. **Because.** Owner direction (16 Nov 2026): the checker validates the format of the chapter, not specific steps; step wording lives in the template and is judged by the Skill and the reviewer. Landing the rule before any template carries the chapter lets each template Change add its table against a rule that exists.
4. **Cases.** T570 to T573, all RED on `main`:
   - T570: a well-formed table gives no finding, with Dependency rows in the middle and Status and Details free; a body without the chapter gives none.
   - T571: a table with other than five columns or a different header is a finding; so is anything but one table in the chapter.
   - T572: step 0 not a Predecessor, the last row not a Successor, a Predecessor or Successor in the middle, a numbering gap, repeat or non-number, and a Who outside the five values are each a finding.
   - T573: a Dependency row without a `#<number>` is a finding; a `#<number>` reference is not rejected as a link by the existing rules, while a URL in Details still is; the wording of an Action changes no verdict; `verifyEnvelope` reports the findings of the rule.
5. **Interplay noted, not changed here.** `check.mjs` requires the PLAN body to hold exactly Change, From, To and Because, so a PLAN template with the new chapter needs its own Change for that rule. That is the PLAN template Change, not this one.
6. **Not in this Change.** Any template, any `.github` file, the chapter's text in a template, the requirement that a type must carry the chapter, the PLAN body check, and the HOW TO WORK Definition (release/C40).

## DO

`howToWorkProblems` in `envelope.mjs`, exported, and called by `verifyEnvelope`. T570 to T573 are renamed to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Ids

C41 and T570 to T573 come from the coordinator's allocation (T570 to T579). The Change adds no Intent, Requirement, Architecture or gap id.
