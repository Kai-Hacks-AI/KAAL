# C29 evidence

The PLAN of C29 observes its RED against the collector `kaal/engineering/workflow-sources`, cut at `main` f61a2ca2. It cites nothing that is not on that collector.

## Provenance

- Method: the Case's `run()` is called in the tree of this PLAN. No job executes it yet. Observed 21 Nov 2026, Node 22 on Linux.
- The inventory (21 installed, 6 with a source, 15 without) is read from `main` f61a2ca2 with `git ls-tree`; a source is a file of the same name outside `.github`.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1335 | F62 | RED: workflows is not a child of 13-source |

1 RED-observed, 0 error, 0 green. It fails on its own assertion.

## Can it pass

In the working tree with `draft/` copied over the template, T1335 is GREEN: a workflow source beside the Skill, and a workflow source without the Skill, are accepted, and `13-source/pipelines/ci.yml` is named ("13-source holds pipelines").

## Other Cases that read the template

With the draft template, T1223 (the source holds `skill`, `scripts` and `unit-tests`) fails: the DO amends it to the four children. Every other layout Case that is GREEN on the collector stays GREEN. T1178 and T1228 are RED on the collector and with the draft alike (they need the Hosting environment).

## What this shows and does not show

T1335 shows the template gives a workflow source a place and the check follows it. It does not show that `13-source` is the right parent (the Owner's judgement), that the owners are right, or that any workflow is equal to a source: the moves and the control do that.
