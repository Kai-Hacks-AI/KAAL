# kaal-change 0.0.1 Release: Testing

The planned outer tests live in `packages/skills/kaal-change/test/plan/release.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO Changes turn them GREEN and move them into the publisher's `test:publisher`.

| Test | Checks | Loop |
| --- | --- | --- |
| change/T24: the package is `@kaihacksai/kaal-change` 0.0.1, with no runtime dependency, Graph as an optional peer, and ships exactly its declared files | change/N6, change/F18, change/A11 | Requirements |
| change/T25: the shipped `docs/` covers intent, requirements, architecture, testing and limitations, defines every identifier a shipped case cites, and cites no plan, record or Change as authority | change/I12, change/F20, change/A13 | Intent |
| change/T26: the README states start, use, verify, register, remove and release notes | change/F21 | Requirements |
| change/T27: the manifest declares every consumer case and the hash of every other shipped file, its cases import only public entry points, and no publisher-only test is shipped | change/F22, change/F24, change/N7, change/A14, change/A15 | Architecture |
| change/T28: in a clean consumer, the packed package verifies with Graph; without Graph, delivery cannot assess and the result is unknown, then verified once delivery is excluded; a case that fails is failed | change/I11, change/I13, change/I14, change/F19, change/F22, change/F23, change/F25 | Intent |
| change/T29: uninstalling leaves the consumer's Change Records and Change Nodes byte-identical, and verification writes nothing outside its temporary directory | change/I15, change/F26, change/N7 | Intent |

change/T28's Graph scenario packs Graph and Hosting from this repository. It turns GREEN only once Graph is packed under its published name `@kaihacksai/kaal-graph`, which is Graph's rename, not Change's.

The following are validated by review:
- `change/A12`'s dynamic import, at the DO of `change/C1`.
- `change/A16`'s harness, at `change/C6`.
- `change/F24`'s evidence wording, against Testing's consumer-verification semantics.

## RED evidence

At `change/C4` all six are RED. change/T24–change/T27 are discriminating behavioural REDs on the current package: its name is unscoped, and it ships no `docs/`, no manifest and no consumer tests. change/T28 and change/T29 are blocked before behavioural assertion, because the package has no consumer verification to run. They run with `node --test packages/skills/kaal-change/test/plan/release.test.mjs`, outside `npm test`.
