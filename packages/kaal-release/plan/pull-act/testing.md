# Pull Promotion: the collector-level concluding ACT (testing)

Runnable Case `T33`, `.red.mjs`, shared fixtures in `fixtures.mjs` (a copy of the Cases' fixtures). It is RED because today's Script has no `history` of retrospectives: every file that matches `act.files` is a candidate. It is not wired into any CI run; the DO moves it to `test/pull/` as `.test.mjs`. Run it from this folder: `node -e "import('./T33.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T33 | F34 | With `history` declared, Change-history retrospectives do not count as ACT candidates: any number of them with exactly one concluding 4L ACT after them qualifies; none concluding, two concluding or an incomplete one does not; a history retrospective changed after the concluding ACT does not qualify, one the history never places is not judged; a history file is not read; a file in both lists is history; without `history` the approved F28 behaviour holds. |

It does not prove that the names of this repository's declaration are the right ones.
