# C79 interface

Drafts as they are added in the DO. T1002 to T1004 read them. None of them is on the collector until the DO.

## Draft of I44.md

`````
---
id: release/I44
title: the judge Cases test the sources the judge judges
---
# release/I44 the judge Cases test the sources the judge judges

Contract: the Cases of `verify Stages` take their positive inputs from the real sources, so a new control or declared key is covered without editing a copy, and their negative inputs are small and independent, so each shows the judge can say no. Reason: a hand-kept copy drifts from what the judge really judges and then proves nothing. Owner: release management.
`````

## Draft of F61.md

`````
---
id: release/F61
title: derived-judge-facts
kind: functional
serves: [release/I44]
---
# release/F61 derived-judge-facts

A helper `derive.mjs` returns the facts of the checkout as the judge's own reader returns them. The positive judge Cases take their inputs from it and hold no list of controls or declared rules. A negative Case starts from a copy of those facts, applies one mutation it states itself, expects the judge to fail naming that stage, and expects the unmutated copy to pass.
`````

## Draft of A56.md

`````
---
id: release/A56
title: derived-judge-facts
addresses: [release/F61]
---
# release/A56 derived-judge-facts

`derive.mjs` sits in the folder of this Change, imports `read` and `judge` from `05-src/stages/judge.mjs` and adds nothing of its own to the facts. The Cases of release/C35 and release/C70 import it for their positive inputs, and keep a hand-made negative input only where the negative is the point of the Case.
`````

## Draft of derive.mjs

`````
// Facts for the judge Cases, derived from the real tree: nothing is listed by hand here.
import { fileURLToPath } from 'node:url';
import { read } from '../../05-src/stages/judge.mjs';
export { judge } from '../../05-src/stages/judge.mjs';
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
export const real = () => structuredClone(read(ROOT));
`````
