# Release: first-publication download through the artifact API (engineering/C15), focused for main

Owner: Engineering. Target: a focused collector for main (kaal/engineering-artifact-api).
Ordinary working Change. The Owner's hold on PR #737 asked that this Change travel without
the rest of the accumulated Engineering collector; this is the same Change (originally #735,
commit f29fea9) rebuilt on main's tip. Record numbering is provisional until integration.

`gh run download` refuses an artifact uploaded with `archive: false` ("would result in path
traversal", observed on Foundation's first Release run 41219302162). The first-publication
summary (F34) now looks the artifact id up by name and fetches it from the artifact API, which
serves the file as uploaded. T67 asserts the new command.

Scope: engineering/release/release.mjs, engineering/release/release.test.mjs and
engineering/release/README.md, 3 files, +7 -2, byte-identical to the originally reviewed
Change. Nothing else from the Engineering collector (plans, the C16 root governance, the
workflow-selector and root manifest changes) is carried.

No synchronization, promotion or publication. Auto-merge is enabled; approval and required
checks govern.
