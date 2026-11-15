# Pull Promotion: host-neutral gathering and consumption of the delivery verdicts (testing)

Runnable Cases `T430` to `T434`, `.red.mjs`. They are RED because `scripts/deliveries.mjs` and the adapter do not exist. They are not wired into any CI run; the DO moves them to `test/pull/` as `.test.mjs`. Run from the repository root: `node -e "import('./packages/kaal-release/plan/pull-gather/T430.red.mjs').then(m => m.run())"`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T430 | F50 | Candidates of declared classes become deliveries with an opaque `source`; an undeclared class is ignored with a finding; no value, size or unit; facts that are not lists give nothing and a finding; the input is not changed. |
| pull/T431 | F51 | OUT and IN consume `{candidate, side, verdict, revision, authority}`: PASS only at the candidate's revision from the class's registered authority for that side; FAIL likewise; no verdict, another revision, another authority, `held` and an unrecognised value are UNKNOWN; differently shaped evidence for three classes gives the same result. |
| pull/T432 | F52 | The adapter maps heads to declared classes from the supplied class routes (the shape of `kaal-pull.json`) and ignores heads no route matches; a different route set gives a different mapping; IN is PASS only with every required context successful at the PR head, FAIL on a failure, UNKNOWN with no PR at that revision, unreadable required checks, pending, missing or other-revision runs; two required lists give two results. |
| pull/T433 | F53 | The reader, run over a recording client, makes only GET requests; a failing request leaves UNKNOWN and never PASS. |
| pull/T434 | F54, F55 | The same unmodified package module, given a different host (ticket ids, other class names and revisions), gives the right deliveries; its source contains none of this installation's words; an owner with an accepted registration is `auto`, every other is `judge` and still listed, and registration never changes a verdict. |

They do not show the live host or any workflow.
