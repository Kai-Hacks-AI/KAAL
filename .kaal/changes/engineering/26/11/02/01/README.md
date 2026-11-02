# Hosting SYNC step 3 preparation: the arriving execution-acceptance set, with the scoped Hosting name

Owner: Engineering. Target: kaal/hosting. Ordinary working Change; compatibility-only under
the approval of PR #866 (coherent scoped Hosting 0.0.1 transition). Record numbering is
provisional until integration.

Main commit 9a9e896 (#804 execution acceptance) arrives at SYNC step 3 with 14 added paths.
Four of them still name the bare `kaal-hosting`, which on this collector is
`@kaihacksai/kaal-hosting`. A SYNC merge may not edit a cleanly arriving file, so this Change
adds the arriving set first. The set is whole because the acceptance test and the
orchestration depend on each other and cannot be green alone.

Ten files are byte-identical to 9a9e896, so the merge takes them without conflict. Four differ
only in the Hosting name:

| Path | Edit |
| --- | --- |
| engineering/acceptance/execution.test.mjs | 3 lines: import, install list, generated import |
| engineering/execution/test/mutations.mjs | 1 line: import |
| engineering/execution/qualification/README.md | 1 line: the Hosting row names the scoped package and notes the earlier bare name |
| engineering/execution/qualification/inspection.json | 3 lines: Core's import and dependency labels and the existing-package name |

At the step 3 SYNC those four are add/add conflicts, each resolved as keep this version.
Any other difference from 9a9e896 would be a silent edit. No assertion, inactive-adapter
status or evidence is changed; inspection.json still parses. `.gitattributes`, which also
changes in 9a9e896, arrives cleanly and is not touched.

Order: this Change lands after SYNC step 2, because the orchestration tests consume Testing's
`kaal-testing/duplicates` export, which arrives with step 2.

No synchronization, promotion or publication. Auto-merge is enabled; approval and required
checks govern.
