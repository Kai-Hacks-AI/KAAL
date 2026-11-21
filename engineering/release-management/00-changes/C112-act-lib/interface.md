# C112 interface

Drafts of the three elements the DO adds. The library itself has no draft: the DO moves existing code, and what a module offers is stated by A77 and judged by the Cases.

## Draft of I61.md

`````
---
id: release/I61
title: the judges of the ACT share one library of facts
---
# release/I61 the judges of the ACT share one library of facts

Contract: the facts a judge of the ACT judges (what a tree holds, which Changes a collector carries, which Cases apply to them, which retros reflect them, whether those Cases are really green, which paths a route may write) are read in one place that no judge owns, and the judges are thin: they say what the facts mean and nothing else. A judge does not import another judge. A new judge, and the Dispatcher that asks them, reuse the facts without importing a judgement. Reason: when one judge reaches into another to find a fact, a change of the one is a change of the other, and the next control has to choose which judge to copy. Owner: release management.
`````

## Draft of F87.md

`````
---
id: release/F87
title: act-lib
kind: functional
serves: [release/I61]
---
# release/F87 act-lib

The library offers four layers, each importing only the layers below it and Node's own modules: the tree (the files of a folder in a fixed order, the frontmatter of a Markdown file), the facts of a collector (the elements and drafts of a tree, the ids a Change justifies, the Cases that apply to a Change, the qualified id of a Change from its record, the retros that reflect Changes, the Changes a collector carries), the state of its Cases (whether the Cases that apply to all the carried Changes together are really green, observed by Testing, parked ones counting red, an unobserved one making the answer UNKNOWN) and the write map (whether a path lies in the folders and files of a route, relative to a capability root). It reads only the tree it is handed, never Git or GitHub, and decides nothing: it returns facts and states, the judge returns a verdict. A judge imports the library and Node's own modules and no other judge; the library imports no judge.
`````

## Draft of A77.md

`````
---
id: release/A77
title: act-lib
addresses: [release/F87]
---
# release/A77 act-lib

The component is the folder `05-src/phase/lib/` with one module for each layer: `tree.mjs` (`walk`, `frontmatter`), `collector.mjs` (`elementsOf`, `justifiedBy`, `applicableCases`, `changeIdOf`, `retrosOf`, `carriedChanges`), `cases-green.mjs` (`casesAreGreen` over the Cases of one set, `applicableCasesAreGreen` over the Cases of all the carried Changes together; the answer is `{ verdict, progress, findings, message }` as `judgeAct` gave it) and `write-map.mjs` (`inFolder`, `isFile`, `relativeToRoot`, `inRoute`; the data stays in `write-map.json`, and the matching is handed the roots, relative to the repository). The judges `judge-act.mjs`, `judge-demand-act.mjs` and `judge-limit-act.mjs` keep their exported judge and their command line, import from the library, and no judge imports another judge. A judge keeps exporting the facts and matchers it exported before (`judge-act.mjs` the facts of a collector, `judge-limit-act.mjs` `inFolder` and `isFile`) as re-exports of the library, so that the Cases written against it stay valid. The library is the layer the next judge, the flag `applies` and the Dispatcher are built on.
`````
