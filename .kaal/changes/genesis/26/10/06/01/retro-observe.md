# Retro

## Learned

Reading the sealed Work against the code, I learned that the admission control is thinner than its name suggests: admit-lineage.sh is seventeen lines that extract the target's .kaal, point at the checkout's .kaal, and run the existing npm command, so every judgement I might have looked for in it lives elsewhere. I learned that the isolation exception is a single path pattern covering .kaal/changes/, .kaal/seals/changes/ and .kaal/seals/trees/, and that the Work states plainly that the pattern cannot tell whose record it is. That makes "the record of the Change that mutates the boundary" in the intent a property of admission and not of the control that carries the exception. I also learned that this property holds only where admission runs: isolate-boundaries runs on every proposal, while admit-lineage is skipped outside kaal/*, so on a staging branch the pattern would let the records of several Changes travel beside a boundary. The Work's "one Change per proposal" describes lineage proposals only. The isolation test's cases use one record at a time and do not exercise this.

## Liked

The three Work files are short, and each says what it leaves out: no ruleset edit, no automated updates, no number reservation, no waiver. E7 states that the control reports without blocking until the owner requires it. The README repeats the limit about the pattern not knowing whose record it is, so the caveat survives outside the Work. The admit-lineage test sets the baseline up with the repository's own seal-work and close commands, and its cases line up with E4: one new closed Change passes, and none, two, each open stage, altered history and removed history fail. Each case is a one-line expectation, easy to read. The isolation test adds a Node seal beside .github as a failing case, which is the boundary E5 names.

## Lacked

The sealed Work holds an intent, requirements and architecture, but no record of what was run or observed: no test output, no result of the first admission run, no account of what was verified. A reader outside cannot confirm from work/ alone that E4 and E5 were met, and has to read the scripts. The test also never covers the empty-baseline branch of admit-lineage.sh (a target with no .kaal), which E2 and the architecture both describe. The workflow's header comment lists admit-lineage among the names that branch protection requires, while the README and E7 say it is not yet required and is added by hand, so the comment overstates the current state. The Work states "closes independently" and "refreshes against the admitted KAAL" without any evidence in work/ of either. The README line "A semantic KAAL Change and a support-engine mutation are never one Change" is a rule no control here checks.

## Longed

To see the sealed Work carry its own evidence: the commands that were run and their results, kept beside the requirements they answer. I would like one example of a boundary-plus-record proposal passing and the same proposal with a second Change's record failing, so that the reliance on admission for the "right record" is shown and not only argued. I would also like to know, from reading the Work, what happens to the isolation exception when a proposal into a non-lineage branch carries more than one Change record.
