# Hosting SYNC step 3 preparation: scoped Hosting name in the arriving execution acceptance

Owner: Engineering. Target: kaal/hosting. Ordinary working Change; compatibility-only under
the approval of PR #866 (coherent scoped Hosting 0.0.1 transition). Record numbering is
provisional until integration.

Main commit 9a9e896 (#804 execution acceptance) will arrive on kaal/hosting at SYNC step 3
and reaches the collector, where Hosting is `@kaihacksai/kaal-hosting`, with four files that
still name the bare `kaal-hosting`. This Change adds those four files with only the name
corrected, so the SYNC's CI can be green and Hosting does not edit Engineering-owned files.

| Path | Edit |
| --- | --- |
| engineering/acceptance/execution.test.mjs | 3 lines: import, install list, generated import |
| engineering/execution/test/mutations.mjs | 1 line: import |
| engineering/execution/qualification/README.md | 1 line: the Hosting row names the scoped package and notes the earlier bare name |
| engineering/execution/qualification/inspection.json | 3 lines: Core's import and dependency labels and the existing-package name |

Each file is otherwise byte-identical to 9a9e896; inspection.json still parses; no assertion,
inactive-adapter status or evidence is changed. The other eleven arriving paths are not
touched and arrive unchanged.

Consequence for the SYNC: because the four paths are added on both sides, the step 3 merge
reports four add/add conflicts. Resolution is the same for each: keep the collector's
prepared version. Hosting records that in its SYNC ledger; any other difference from
9a9e896 would be a silent edit and must not occur.

Evidence (trial merge in a scratch tree, Node 22, nothing pushed): the diff of each prepared
file against 9a9e896 contains exactly the lines above. With the four prepared files kept,
23 of 24 orchestration tests pass and the unscoped-name imports resolve. The one failure,
E-D13, reports Testing's `kaal-testing/duplicates` export as unavailable because SYNC step 2
(Testing's preparation and merge) was not applied in the trial; it is not caused by this
Change. The packed acceptance test needs the same prerequisite and the Unix-socket
capability the sandbox denies, so it is left to three-host CI after step 2.

No synchronization, promotion or publication. Auto-merge is enabled; approval and required
checks govern.
