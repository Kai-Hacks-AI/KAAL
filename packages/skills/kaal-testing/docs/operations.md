# kaal-testing: Operations

How to install, use, verify and remove kaal-testing. What it promises is in the [Requirements](requirements.md), and what it does not is in the [Limitations](limitations.md).

## Install

kaal-testing needs Node 24 or later, on Linux, macOS or Windows (testing/F65).

```
npm install kaal-testing
```

It brings its runtime dependencies, `c8` and `kaal-hosting`, at exact versions (testing/F59). It runs no install script.

## Use

Import the export for the contract you need. Each is described in the [Architecture](architecture.md)'s export inventory (testing/A8).

- `kaal-testing/model`: declare a product's Strategies, Plans, Suites and Cases as plain data; `check` them; derive `tested` and `data`; read one Run's `results`; `evaluate` a Plan Run; and read the `current` evidenced quality from the Runs you retained (testing/F24–testing/F33, testing/F40–testing/F42).
- `kaal-testing/verifiers`: the shared observable result contract for a consumer verifier, with its `SCENARIOS`, `observe`, `judge` and `parity` (testing/F43–testing/F50, testing/F56–testing/F58).
- `kaal-testing/boundary`: `interpret` a realization's verdict on a concern owner's PLAN boundary, with its trust authority's attestation (testing/F18–testing/F23).
- `kaal-testing/acceptance`, `kaal-testing/contracts`, `kaal-testing/coverage`, `kaal-testing/inventory`, `kaal-testing/attribution` and `kaal-testing/report`: a publisher's acceptance runs, contract evidence, execution coverage, line inventory, file attribution and the reconciled report.

The Agent Skill in `skills/kaal-testing/` tells an Agent how to design and evaluate Test Cases with these, and the Nodes in `capability/` and `payload/` carry what Testing means to KAAL.

## Verify

Verify the installed copy from the consumer that installed it:

```
npm explore kaal-testing -- npm test
```

In an installation, `npm test` runs the delivered verification only (testing/F62). It prints one summary line starting `kaal-testing-verification `, with a JSON summary, and ends in exactly one result (testing/F63):

| Result | Exit status | Meaning |
| --- | --- | --- |
| `verified` | 0 | every delivered case passed against bytes that match the shipped manifest |
| `failed` | 1 | an established violation by the package as shipped |
| `unknown` | 2 | it could not verify, with a diagnosis of what was not established |

The run writes only to the operating system's temporary directory and leaves the consumer as it found it (testing/F15). Its result is the consumer's own observation of that run (testing/F17). `npm test -- --list` runs nothing and lists the suites it would run.

## Remove

```
npm uninstall kaal-testing
```

kaal-testing writes nothing outside its own installation and the temporary directory, so nothing else remains.

## Shipped files

| Path | What it is |
| --- | --- |
| `README.md` | the overview, linking these documents |
| `LICENSE` | the package's licence |
| `package.json` | the package manifest |
| `docs/` | Intent, Requirements, Architecture, Testing, Limitations and Operations |
| `capability/Testing.md` | the Capability Node, typed by Core's KAAL Capability |
| `payload/Testing.md` | the Skill Node, typed by Core's KAAL Skill |
| `skills/kaal-testing/` | the Agent Skill, `SKILL.md`, and its references |
| `lib/` | the library modules behind each export, the runner reporter and the observed-run store |
