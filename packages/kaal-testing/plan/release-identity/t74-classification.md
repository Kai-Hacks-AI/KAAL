# T74 namespace check: frozen classification inputs (first pass, for review)

Owner: Testing. Companion to the C36 identity PLAN amendment (#847) and the closure check (#858). Planning only; no test, runtime, manifest or identity change.

`t74-classification.json` lists every match of T74's own search on the collector head it names (`collector`), outside and inside Testing, with the file's Git blob id, line, owner and a **mechanical first-pass class**. It is the "complete candidate-relative match inventory" #847 requires before the C36 DO, as an input for independent review, not as authority:

- Nothing is marked reviewed (`"reviewed": false`). A class is a proposal. `active-module-specifier`, `manifest-entry`, `lock-entry` and `acquisition-selector` rows are the ones the C36 DO must migrate (in the owner's own Change); a row only leaves the findings by an owner-reviewed classification with exact context.
- Rows owned by Engineering, Core, Graph or the Engineer Skill are observations for those owners. Testing does not classify their semantics or edit their files.
- Historical evidence (`test/engineer/redesign-acceptance-evidence.json`) is preserved at its blob id; it is not rewritten.
- Skill-path, Skill-identifier, test-title and planning-record rows are not npm specifiers; they keep the old name unless their owner decides otherwise. `unclassified` never counts as GREEN.
- The first-pass classes are heuristics from the matching line only and can be wrong; reviewers should check any row, and the list must be regenerated against the then-current collector and main before the DO.

Regenerate with the predicate recorded in the JSON, then re-run the classification and diff against this file.

No implementation, synchronization, promotion or publication is authorized.
