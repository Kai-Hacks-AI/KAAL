# C14 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It closes C14 in the collector. What `main` teaches can only be recorded after the promotion, and is not claimed here.

## Liked

Kai's rule to build the Control Enforcement Unit in thin slices turned a PLAN of nine Cases over five concerns into one that could be proven alone, and the CPO approved the PLAN and the DO at their exact heads without a round of changes. The Cases of the later slices were not thrown away: they were written, seen RED and then green against a throwaway implementation, and kept as stock for their own PLANs. The throwaway also caught real faults before the DO existed: a Case that looked for the repository root in the wrong place, and a pointer line that pushed the Skill to 601 words.

## Learned

A declaration is read one `key: value` line at a time, so a list of maps was the wrong shape and `Station:mode` entries were the right one. Reading the registry from a Git ref instead of the working tree is the whole point of the slice, and a Case that changes the registration in the candidate and still sees the base's registry is what shows it. A registration is a claim about where a control is meant to judge, not evidence that anything judges, and the reference says so. One consequence the CPO named: `registry.mjs` lists only valid controls, so a control with an invalid `stations` line is silently not registered. That is harmless while nothing enforces, and it would be a fail-open the moment a preventive station relies on it.

## Lacked

Change ids and security acceptance criteria for the later slices, which come with their own PLANs. A way for the registry to say that a control declared a station and failed validation, as opposed to declaring none.

## Longed For

The judge slice, whose PLAN must define and test fail-closed handling of invalid registrations: a control that declares a station but whose declaration is invalid is a failing verdict at that station, never an absent one. Then signing, the workflow and App with their own security criteria, and only after those a ruleset that requires the signed check.

## Closed

The Gap of this Change, G91, is closed by Cases T920, T921 and T928, green in the collector with all 39 existing Cases of the package.

## Sentence

Plans Link Agents Near Delivery, Operating Carefully, Handing Everyone Clear Knowledge, Always Closing Truly.
