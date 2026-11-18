# C76 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Proving feasibility on a throwaway copy of the tree before the DO meant the DO was a copy of a run that already passed, and the CPO's finding that the first PLAN showed no feasibility was answered with a run, not an argument. Declaring `standing` once per stage and letting the judge read it kept the change small: one key, one comparison, one trace to a control with an Intent.

## Learned

A control now needs a `status` line from the day it exists, so a draft written without it fails the finder; the PLAN had to be corrected after the CPO's review, and the DO and its Cases now require the line. The shared fixtures and helper of earlier Changes build the judge's facts, so a new key means amending them, or older Cases stop describing the real tree. The first Branching run on a new pull request starts before auto-merge is registered and fails; the run that matters is the one with the latest start.

## Lacked

A way to see which Cases build facts for the judge before changing it, short of running the whole runner. A single place that lists the keys `stages.json` declares and which Change added them, so the later removal of the compatibility keys can be planned without reading each Change.

## Longed For

Judge Cases that read the real `stages.json` as well as the fixtures, so a stage that forgets `standing` fails in one place. The three judge Changes (C76, C77, C78) landing in one order the tooling knows, so they stop being sequenced by hand.
