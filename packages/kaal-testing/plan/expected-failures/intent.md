# Known failures: Intent

This is `testing/C67`, a PLAN Change. It ships no package code and changes no Skill. `testing/C68` (DO, not yet authorized) turns the planned Cases GREEN. Provisional ids, renumbered if another Change lands first and takes any of them.

**What is missing.** Kai's idea (11-19): a defect with a red Test Case imposes a merge challenge, because the Case stays RED on the branch until the defect is fixed. A way out is a list of known failures: while a listed Test Case is RED it is expected; when it turns GREEN the list is stale and the entry must go ("invert the test results on those and use them as a list to fix when placed correctly"). Testing can compare a run with such a list today only by hand. It has no notion of a register of expected failures.

- **testing/I42**: Given a register of expected failures that someone else keeps, Testing can report from one run which RED results were expected, which registered entries no longer hold, which are unconfirmed or absent, and which RED results nobody expected, without changing what it observed and without knowing who keeps the register or why.

**The model is a strict expected failure** (as pytest's `xfail_strict`): an expected failure that passes is not good news to ignore, it is a stale entry. Testing reports it as such. What a stale entry or an unexpected RED means for a merge or a release is not Testing's to say.

**Who knits it together.** This is the interesting part and the PLAN proposes an owner, SIPOC-style, in `architecture.md`. Testing knows only the abstract concept, a register of expected failures. It does not know Defect, review, Change or merge by name.

**Out of scope.** Where the register lives and how entries get in or out (its owner), how a merge or a release is judged on the expectations (a consumer of the report), review findings as a source of expectations (a sibling Change), test-design quality, deployment of the Skill. No promotion, no publication.
