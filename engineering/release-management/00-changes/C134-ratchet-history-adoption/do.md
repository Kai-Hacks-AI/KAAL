# C134 do

Adds `history.jsonl` beside the baseline of CTL20 and CTL36, each with the adoption line (`from: null`, `to: 5`, change `release/C134`),. Cases T1522 (the file is a sound chain, adoption first, ends at the size of the baseline) and T1523 (the next reduction line passes `judgeProgress` of the shared library, a line that does not follow and a missing line fail).

## Departures from the PLAN, recorded

1. **The control records are not changed.** The finder of controls C24 and C25 knows no history field, so a front-matter key would be an unknown one, and release/T1129 pins the whole text of CTL20, so prose added to the record fails it (the first run of this DO showed it). The history is found by the convention of C25, beside the baseline file the record names.
2. **`judgeProgress` does not judge the adoption line.** It says `history-without-change` when a history line appears and the baseline did not shrink. So the adoption is checked by T1522 (a sound chain, which `soundHistory` of the library does not export), and T1523 shows the reductions that follow pass the library. A judgment of the adoption pair is for controls' library, not changed here.

## Tracked, as the CPO asked

- **The verification Change** (the judge that runs `judgeProgress` on a pull request that lowers a baseline, needing the times of the base and head commits and so a WIRE of the workflows) follows this Change. It needs its own PLAN and the Owner's go.
- **Until it exists**, a reduction recorded by hand is a claim, not a fact. The history is not treated as trusted by any report, and the first reduction (release C133's D15) is validated by `judgeProgress` in that pull request's own Case, run by hand against the base and the head, before its line is relied on.
