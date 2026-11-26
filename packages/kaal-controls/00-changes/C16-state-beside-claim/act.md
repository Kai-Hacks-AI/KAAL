# C16 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It closes C16 in the collector. What `main` teaches can only be recorded after the promotion, and is not claimed here.

## Liked

The PLAN added three Cases that were RED on their own assertions against `main`, and the DO made exactly those three GREEN, so the same Cases ran inverse in PLAN and DO. The Change stayed small because it only reads what C15 already judges: one line per control, with the claim and the computed state side by side.

## Learned

Showing is not enforcing. The command used to print JSON for `tested` claims only, and now prints a line for every control that declares a minimum, so the exit code had to stay tied to an unshown `tested` claim alone, and `--json` keeps the verdicts for anything that reads them. The computed state is honest because it is short: `tested` when the minimum is shown, `designed` for any other valid control, never `implemented` or `running`.

## Lacked

Observations. No KAAL control has a recorded run, so every line reads 0 of N and computes `designed`. Implemented and running need a result the mechanism produced on its boundary, and nothing writes one down yet.

## Longed For

A log that each control writes for its own runs, what it judged and what it caught, so that `running` can be computed from observation and not from a claim. The first real records for the ten controls that now declare a minimum would then show these lines moving.

## Closed

The Gap of this Change, G93, is closed by Cases T1091 to T1093, GREEN in the collector with all 47 existing Cases of the package (50 in all).

## Sentence

Plans Link Agents Near Delivery, Operating Carefully, Handing Everyone Clear Knowledge, Always Closing Truly.
