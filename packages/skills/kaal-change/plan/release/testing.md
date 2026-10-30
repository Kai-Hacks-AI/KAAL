# kaal-change 0.0.1 Release: Testing

The planned outer tests live in `packages/skills/kaal-change/test/plan/release.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO Changes turn them GREEN and move them into the publisher's `test:publisher`.

| Test | Checks | Loop |
| --- | --- | --- |
| change/T24: the package is `@kaihacksai/kaal-change` 0.0.1, with no runtime dependency, Graph as an optional peer, and ships exactly its declared files | change/N6, change/F18, change/A11 | Requirements |
| change/T25: the shipped `docs/` covers intent, requirements, architecture, testing, limitations and operations, defines every identifier a shipped case cites, and cites no plan, record or Change as authority | change/I12, change/F20, change/A13 | Intent |
| change/T26: `docs/operations.md` states start, platforms, use, verify, register, remove and release notes, and the README links every shipped document and does not state operation again | change/F21, change/F30 | Requirements |
| change/T27: the manifest declares every consumer case with when it applies, and the hash of every other shipped file; there are absence and Graph cases; its cases import only public entry points, the verifier only built-ins, and no publisher-only test is shipped | change/F22, change/F24, change/F30, change/N7, change/A14, change/A15 | Architecture |
| change/T28: in a clean consumer, the packed package verifies with Graph over the full delivery path, and verifies without Graph over the cannot-assess contract, with the Graph cases not applicable; a failing case is failed, and a changed file, a missing manifest or an applicable case that did not run is unknown | change/I11, change/I13, change/I14, change/F19, change/F22, change/F23, change/F25 | Intent |
| change/T29: uninstalling leaves the consumer's Change Records and Change Nodes byte-identical, and verification writes nothing outside its temporary directory | change/I15, change/F26, change/N7 | Intent |
| change/T33: without Graph, the installed package's `cannot-assess` names `@kaihacksai/kaal-graph` and offers exactly install-and-retry and analyze, gives no verdict, installs and writes nothing, and consumer verification states the same next step | change/F19, change/F29 | Requirements |
| change/T34: the runtime is declared as Node.js 24 or later and the platforms as Linux, Windows and macOS; `lib/` imports no host module, and the verifier starts its cases with the running Node executable, never through a shell | change/F31, change/A14 | Requirements |
| change/T35: the manifest traces every Requirement `docs/requirements.md` defines to declared cases or an allocation; without Graph, a Requirement traced only to Graph cases is reported unresolved with the peer and the next step, and never as covered | change/F32, change/F29, change/A14 | Intent |

change/T28's Graph scenario packs Graph and Hosting from this repository. It turns GREEN only once Graph is packed under its published name `@kaihacksai/kaal-graph`, which is Graph's rename, not Change's.

The following are validated by review:
- `change/A12`'s dynamic import, at the DO of `change/C1`.
- `change/A16`'s harness, at `change/C6`.
- `change/F24`'s evidence wording, against Testing's consumer-verification semantics.
- `change/F30`'s map to the generic contract, against `packaging/C4`. Conformance to the generic contract itself is decided by Packaging's suite, which Engineering runs on the same candidate (change/A16). Change writes no generic case.

## RED evidence

At `change/C4` all nine are RED. change/T24–change/T27 are discriminating behavioural REDs on the current package: its name is unscoped, and it ships no `docs/`, no manifest and no consumer tests. change/T34 is a discriminating behavioural RED: there is no `docs/operations.md`. change/T28, change/T29, change/T33 and change/T35 are blocked before behavioural assertion, because the package has no consumer verification to run. They run with `node --test packages/skills/kaal-change/test/plan/release.test.mjs`, outside `npm test`.
