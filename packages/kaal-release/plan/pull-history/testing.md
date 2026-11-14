# Pull Promotion: the history of a synchronized collector (testing)

Runnable Case `T35`, `.red.mjs`, built on a real git repository: a `main` and a collector branch with commits on both sides, merged twice (two SYNCs), so the commit records carry the parents git itself reports. It is RED because today's `historyOf` demands one first-parent line that starts at the merge base. It is not wired into any CI run; the DO moves it to `test/pull/` as `.test.mjs`. Run it from the repository root: `node -e "import('./packages/kaal-release/plan/pull-history/T35.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T35 | F36 | On the SYNC-shaped repository the history is the collector's first-parent line, oldest first, ending at the head and including both SYNC commits and no commit of `main`, whatever order the host lists the commits in. A SYNC commit brings no paths into the facts. A head that is not listed, a commit the host left out, a collector commit off the line (a second parent that is a collector commit) and a commit without parents each fail with "could not order the history". An unsynchronized, linear collector gives the same history as before. |

The DO also revises one assertion of `T14` (a history whose first commit does not follow the merge base): the start of the line is now "the first commit's first parent is not a collector commit", so that assertion is replaced, not deleted, by the F36 cases above.

It does not show the live host: the live run on the synchronized `kaal/release/plan` is the DO's integration evidence.
