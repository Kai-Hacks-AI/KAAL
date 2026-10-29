# Consumer Verifier Conformance: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A18** [testing/F43–testing/F48, testing/N9]: `kaal-testing/verifiers` is one module, `lib/verifiers.mjs`, importing nothing, that exports:
  - `SCENARIOS`, the frozen list of `{ id, change, result, cases, target? }`. `cases` is `pass` where every declared case is reported, `none` where none is declared, and `any` where the scenario constrains no case. `target` is the outcome of the case the scenario targets.
  - `observe({ exit, stdout }, { prefix, words })`, which gives `{ observation, findings }`. `observation` is null when the run shows none.
  - `judge(scenario, observed, facts)`, which gives `{ scenario, conforms, differences }`. `facts` is `{ package: { name, version, location }, platform, node, digest, cases, target, applicability }`, as the harness established them. `applicability` maps a case's name to the `{ platforms, reason }` the harness read from the installed manifest and checked itself. It is empty where no case is declared not applicable.

  It adds a row to testing/A8's export inventory, with consumer verification "no". It serves the publisher and Engineering, who check a verifier. No consumer's verification uses it, and no product depends on it.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the result and evidence semantics (testing/F11–testing/F17) and these conformance cases: the scenarios, how a run is observed, and how an observation is judged |
| Each package | its verifier, its tests, its summary prefix and result words, and how its own manifest and cases realize each scenario's change |
| Packaging | the package entrypoint convention |
| Engineering (#641) | execution and static enforcement against conditional weakening: a case that keeps its identity but branches on the platform to weaker assertions (testing/F48) |
| Engineering | the harness: packing each candidate, installing it into a fresh consumer, making each scenario's change, running the verifier, establishing the facts (applicability included), and calling `judge`, in its own Change (#625), on Linux, Windows and macOS |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C29` PLAN, this Change | Testing | none |
| `testing/C30` DO: `kaal-testing/verifiers`, its inventory row, testing/T54–testing/T60 GREEN in Testing's `npm test` | Testing | `testing/C29` |
| `engineering/C…` the harness that checks each installed verifier against these cases (#625) | Engineering | `testing/C30` |
| Each verifier passes the cases in Engineering's lane (Guard, Graph #627, Hosting #629) | Engineering, each package | `engineering/C…` |
