# Explicit BASS decisions in Skill authoring: DO

Owner: Engineer Skill. Target: kaal/engineer-skill. Ordinary working Change
delivering the accepted PLAN (#845, plan/bass-procedure/README.md). Record
numbering is provisional until integration.

Changes: one new step in the Skill's SKILL.md procedure, one contained reference
(references/bass-decisions.md) and one focused test (test/bass-procedure.test.mjs,
added to the package test script). The Skill Node, BASS Definition, checker and
validator, exports, bin, dependencies, version and existing tests are unchanged.

Observed: the reference is linked by relative path and shipped in the normal pack
inventory; the unchanged checker accepts the Skill where it ships and where a copy
is placed elsewhere; removing the linked reference from that copy fails the checker.
Package tests: 40 pass. Whether the examples are proportionate and sound is
independent validation, not claimed here.

No synchronization, promotion or npm publication. Auto-merge is enabled on the
pull request; approval and required checks govern integration.
