# What the DO of pull/C4 retired

The capability of `pull/C3` read pull requests (pieces typed by commit titles and tied to a Change by a trailer) and is replaced by file-state qualification. [../pull-v1/](../pull-v1/) stays as the record of what shipped.

- **Cases retired with the input they tested:** pull/T19 to T25 and their fixtures (`test/pull/fixtures.mjs` of the earlier basis). Their rules carry over where they still hold: the walk and the declared order (T26), the empty declaration (T29), the qualifiers in the declared order and the advisory boundary (T30). The piece, delivery and Change judgments (T20, T24) are replaced by T26 to T28.
- **Evidence retired:** `test/pull/evidence/wire-fallback-template-2026-11-12.json`, a record of pull-request pieces. The command's live run (`engineering/release-management/05-src/pull-promotion/evidence/`) replaces it.
- **Requirements no longer served by the Script:** pull/F21 to F24 as written (pieces, deliveries, `lifecycle` and `checks` declarations). pull/F25 to F31 serve them.
- **Kept:** the command (`pull/C2`: pull/F14, F15, F20), now with a gatherer that reads file state: the delta, the head tree, the history by ancestry, the text of the ACT candidates and the Case executions of the exact head, taken from the host's CI job logs. Cases T14 and T18 stay.

- **Moved to `test/pull/` as `.test.mjs`:** T31 and T32 of the scope amendment (pull/F32, pull/F33), which the DO turns green.
