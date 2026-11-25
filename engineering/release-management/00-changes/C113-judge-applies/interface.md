# C113 interface

Drafts of the three elements the DO adds. The code has no draft: the DO changes the judges and adds one module of the library, and the Cases judge what they answer.

## Draft of I62.md

`````
---
id: release/I62
title: a judge of the ACT says whether it had anything to judge
---
# release/I62 a judge of the ACT says whether it had anything to judge

Contract: when a judge of the ACT answers PASS, the place that asks it can tell "judged, and fine" from "nothing to judge here", without reading anything but the answer. The answer carries a flag, `applies`, beside the verdict. A place that needs every judge of the ACT to have judged, such as the one that decides whether the final step of a collector is done, counts only a PASS that applies. Reason: a PASS with nothing to judge is true of a collector that has not begun its ACT as much as of one that has finished it, and a decision made from that cannot be told apart from one made from a pull request body. Owner: release management.
`````

## Draft of F88.md

`````
---
id: release/F88
title: judge-applies
kind: functional
serves: [release/I62]
---
# release/F88 judge-applies

Every judge of the ACT answers `{ verdict, applies, message }` and what it answered before. `applies` is a boolean. It is false only on a PASS that had nothing to judge: `hold Act` when no retro reflects a carried Change; `demand Act` when the collector does not yet have exactly one ACT that reflects every carried Change (no retro yet, or a partial one); `limit Act` when the pull request changes no folder or file of the ACT route. Otherwise it is true: a PASS that judged, and every FAIL and every UNKNOWN, which never have nothing to judge. A verdict other than PASS with `applies` false is refused. The final step of a collector is done when `hold Act`, `demand Act`, `verify Act` and `limit Act` each answer PASS with `applies` true on the merged tree; any FAIL, any UNKNOWN and any PASS that does not apply is not done. The flag is the judge's: whether it blocks or advises is the place's that asks. It changes no verdict and no message.
`````

## Draft of A78.md

`````
---
id: release/A78
title: judge-applies
addresses: [release/F88]
---
# release/A78 judge-applies

The component is the module `05-src/phase/lib/result.mjs` of the library of release/A77, a layer with no imports: `answer(verdict, applies, message, more)` makes an answer and refuses a verdict that is not PASS, FAIL or UNKNOWN, an `applies` that is not a boolean and an `applies` false on anything but a PASS; `pass`, `fail` and `unknown` make the three kinds; `judgedAndFine(answer)` is true only for a PASS that applies, which is what the final step counts. `cases-green.mjs` and the judges `judge-act.mjs`, `judge-demand-act.mjs` and `judge-limit-act.mjs` build their answers with it and keep every verdict, message and command line they have. The layering of release/A77 is kept: the new module imports nothing, and a judge imports Node and the library only.
`````
