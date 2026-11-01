# Configuration slice: evidence and limits

This file records the accepted #814 configuration slice. Later classification and inspection evidence is scoped in classification.md; it does not retroactively broaden these results.

PLAN authority: #797 and #801, including review 5729889977 permitting bounded TDD/DO. Owning collector: kaal/branching-0.0.1. Source/dependency inspection baseline: 1f79213a038f935e47382e69275cd8873de389b8.

The approved 38 Case identities are unchanged. This Change exercises only the configuration-related portions below; it does not mark the whole capability accepted.

| Loop / Case | Scope in this Change | Remaining obligation |
| --- | --- | --- |
| Architecture T1-T3 | Pure configuration engine, prohibited direct filesystem import, undecidable dynamic access | Whole Skill/scripts/adapter boundary and independent duplication validation |
| Acceptance T12 | Two naming schemes accepted through installed public validator; External shape needs no target files/check identity | Runtime role/transaction selection |
| Acceptance T13 | Missing input/fields, malformed JSON, decoded duplicate keys, unknown fields/version and nonfinite values rejected | Adapter-level missing policy acquisition/authority |
| Acceptance T14 | Selector overlaps, repeated roles/remainders/transaction identities and malformed refs rejected | Runtime graph-based classification |
| Acceptance T15 | Unsupported method, broken role references, missing declarations/obligations and contradictions rejected | Actual provider availability and live obligations |
| Implementation | Parser-key scope, escaped duplicate spelling, External source/path contradiction | Subsequent transaction/authority/adapters |

All other planned Cases remain pending. In particular T16-T18 and T31-T38 are not established by these configuration tests.

## Commands and integration

- `npm test -w kaal-branching` runs architecture and implementation tests.
- `npm run test:architecture -w kaal-branching` and `npm run test:implementation -w kaal-branching` keep those loops independently runnable.
- The existing Engineering Acceptance lane packs the workspace once and discovers `test/acceptance/configuration.test.mjs`. Its scenario uses Testing's install() and only the installed public export.
- For a focused run, the caller packs the candidate once, builds a manifest with tarball/sha256/integrity, then runs `node test/run-acceptance.mjs <manifest.json> <new-run-directory>` from this workspace. The test driver/scenario never pack.
- The JSON evidence records the behavioral RED scaffold, GREEN artifact and six discriminating mutants with unchanged outer-test/fixture identities. The scaffold is a loadable public function rejecting all input, not a missing module.

Local verification used Node 24.22.1 on Linux, the accepted Testing harness and Hosting source from the inspection baseline. Hosting was transpiled for the local harness using TypeScript 5.9.3; no Hosting source changed. Registry dependencies were acquired from the local npm cache in offline mode. Full repository and Windows/macOS CI remain required; local results do not stand in for them.

Testing's recorded unknowns remain visible: host containment and unrecorded installations. These tests do not prove that an External target was accessed or protected; no target operation occurs.

Outer acceptance assertions were written before the configuration engine and remained unchanged through RED/GREEN and mutation runs. Independent PR review is still required. The preservation evidence is scoped to these unchanged test bytes and the listed mutants; it does not claim exhaustive correctness.

