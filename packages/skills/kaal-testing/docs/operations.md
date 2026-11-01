# kaal-testing: Operations

How to install, use, verify and remove `@kaihacksai/kaal-testing`, the published kaal-testing package. What it promises is in the [Requirements](requirements.md), and what it does not is in the [Limitations](limitations.md).

## Install

`@kaihacksai/kaal-testing` needs Node 24 or later, on Linux, macOS or Windows (testing/F65).

```
npm install @kaihacksai/kaal-testing
```

It brings its runtime dependencies, `c8` and `@kaihacksai/kaal-hosting`, at exact versions (testing/F59). It runs no install script.

## Use

Import the export for the contract you need. Each is described in the [Architecture](architecture.md)'s export inventory (testing/A8).

- `@kaihacksai/kaal-testing/model`: declare a product's Strategies, Plans, Suites and Cases as plain data; `check` them; derive `tested` and `data`; read one Run's `results`; `evaluate` a Plan Run; and read the `current` evidenced quality from the Runs you retained (testing/F24–testing/F33, testing/F40–testing/F42).
- `@kaihacksai/kaal-testing/verifiers`: the shared observable result contract for a consumer verifier, with its `SCENARIOS`, `observe`, `judge` and `parity` (testing/F43–testing/F50, testing/F56–testing/F58).
- `@kaihacksai/kaal-testing/boundary`: `interpret` a realization's verdict on a concern owner's PLAN boundary, with its trust authority's attestation (testing/F18–testing/F23).
- `@kaihacksai/kaal-testing/acceptance`, `@kaihacksai/kaal-testing/contracts`, `@kaihacksai/kaal-testing/coverage`, `@kaihacksai/kaal-testing/inventory`, `@kaihacksai/kaal-testing/attribution` and `@kaihacksai/kaal-testing/report`: a publisher's acceptance runs, contract evidence, execution coverage, line inventory, file attribution and the reconciled report.

The Agent Skill in `skills/kaal-testing/` tells an Agent how to design and evaluate Test Cases with these, and the Nodes in `capability/` and `payload/` carry what Testing means to KAAL.

## Verify

Verify the installed copy from the consumer that installed it:

```
npm explore @kaihacksai/kaal-testing -- npm test
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
npm uninstall @kaihacksai/kaal-testing
```

`@kaihacksai/kaal-testing` writes nothing outside its own installation and the temporary directory, so nothing else remains.

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

## Timing observations

Pass recorded `{ name, ms }` Cases to `profile` from `@kaihacksai/kaal-testing/timing`. Pass one `{ platform, cases }` run per platform to `skew`; the caller establishes that they concern the same candidate. Retain the raw observations outside Testing. Report each finding and challenge alongside the run verdict without changing it. A skew starts with the Case owner, not a presumed host defect.

## Redesign evidence

Give `candidates(history, options?)` from `@kaihacksai/kaal-testing/redesign` the caller-held runs, oldest first, each `{ platform, cases: [{ name, sha256, ms }] }`. Retain its `unprofiled` findings. Compare behaviour independently with `refactored(before, after)`, each `{ id, version, tests, verdicts }`; verdicts map the same subjects to `pass` or `fail`. Associate a timing row and behavioural check only by Case id and the exact `from`/`to` versions, retaining the timing platform. Without a matching check, preservation is not assessed. Neither signal changes the run verdict.

## Duplicate evidence and planning

Import `duplicates` and `schedule` from `@kaihacksai/kaal-testing/duplicates`. Supply one execution's observed Cases to `duplicates({ runs })`, including nested runs and their initiating Case as `by`. Supply that execution's file requests to `schedule(requests)` before running. Execute each returned run once and bind every `reads[].run` index to its original observation. Failure and unknown stay failure and unknown for every reader. A finding means nothing is scheduled; never interpret an empty invalid schedule as completed assurance.

Plan independently required executions separately. This API provides no evidence authentication or cross-process result reuse. Enabling it in CI requires the lane owner's integration and validation.
