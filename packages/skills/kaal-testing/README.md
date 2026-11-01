# kaal-testing

KAAL Testing: how a capability's tests are designed and executed, and how their evidence is measured and reported. It is not part of Core. Core provides the `KAAL Capability` and `KAAL Skill` types and admission, and this capability joins through them.

```
capability/Testing.md                  the Capability Node, typed by Core's KAAL Capability
payload/Testing.md                     the Skill Node, typed by Core's KAAL Skill
docs/                                  the shipped documents: Intent, Requirements, Architecture, Testing, Limitations, Operations
skills/kaal-testing/                   the Agent Skill: SKILL.md
skills/kaal-testing/references/        findings.md
lib/coverage.mjs                       execution and evidence: kaal-testing/coverage
lib/inventory.mjs                      non-blank text lines: kaal-testing/inventory
lib/attribution.mjs                    CASE-owned file attribution: kaal-testing/attribution
lib/contracts.mjs                      contract evidence: kaal-testing/contracts
lib/reporter.mjs                       the runner reporter accept() observes tests through
lib/observed.mjs                       what accept() observed, kept private to the process
ownership.kaal.json                    Testing's own ownership claim (repository data, not delivered)
evidence.kaal.json                     Testing's own contract evidence mapping (repository data, not delivered)
```

## Documents

These documents are authoritative and ship with the package:

- [Intent](docs/intent.md): why Testing exists and what it promises.
- [Requirements](docs/requirements.md): the functional and nonfunctional requirements.
- [Architecture](docs/architecture.md): the decisions that realize them, and the export inventory.
- [Testing](docs/testing.md): the Test Plan, its delivered and publisher's cases.
- [Limitations](docs/limitations.md): what a result does not show.
- [Operations](docs/operations.md): installation, use, verification and removal, and the shipped files.

The Node carries what Testing means to KAAL. The Agent Skill tells an Agent how to do the work and points to the Node. It assumes no host and names no particular system.

## What it teaches

A capability's evidence comes from three loops, and none stands in for another:
- **Architecture conformance:** the capability respects the boundaries it declares. This is verified mechanically where possible, and validated by an Agent or a person where not.
- **Capability acceptance:** the delivered capability behaves as its contract states.
- **Implementation:** internal behaviour, test first.

Intent, Requirements and Architecture each own the tests PLAN establishes for them. Those tests are immutable to DO and CHECK; implementation tests may evolve without weakening them. A planned test stands clean RED before coding, failing for the intended missing behaviour alone, and GREEN is bounded evidence, not proof of the outcome. A defect in a planned test belongs to ACT.

Each concern owner declares its planned boundary, the planned tests and everything that gives them meaning, and `interpret` from `kaal-testing/boundary` reads a realization's verdict on it: separate PLAN Change or trusted Seal, read the same way (testing/F18–F23). A changed declared path is a verified failure; an untrusted anchor or working-tree bytes are unknown; an untouched boundary is unchanged within the declaration, never met. Byte integrity, reproducibility and behavioural validity stay separate claims. Testing interprets the verdict and never produces or authenticates it: `interpret(declaration, verdict, attestation)` reads it only with its trust authority's attestation bound to its anchor, and is unknown otherwise or when the verdict does not read (testing/C19).

`kaal-testing/model` holds a product's Strategies, Plans, Suites and Cases as plain data, with the identities their holder assigns and outgoing **tests →** traces to opaque subjects (testing/F24–F33). `check` gives the model's findings, `tested` and `data` the derived views, `results(model, run)` each Case's, Suite's and Plan's result in one Run, `evaluate(model, run, { allowances })` a Plan Run's evaluation, and `current(model, runs, of, { allowances })` the current evidenced quality of a Plan, Suite or Case from the Runs a consumer retained, oldest first (testing/F40–F42): the latest applicable Run's, never an older one's, with every inapplicable Run disclosed. A Case that did not run, ran skipped, or ran a version its Run does not identify is unknown; an allowed Case stays failed; Testing keeps no Run. `results` gives raw observations of one Run, never a verdict: a `passed` in it beside any finding is not GREEN evidence. The only verdict is `evaluate`'s `result`, which is unknown whenever there is a finding. How a consumer, such as Change, turns it into its own criterion is that consumer's. The module imports nothing.

`kaal-testing/verifiers` is the shared observable result contract for a product's consumer verifier (testing/F43–F50). `SCENARIOS` are the outcomes every verifier must report correctly, `observe(run, { prefix, words })` reads one verifier run's exit and one-line JSON summary, and `judge(scenario, observed, facts)` compares it with the facts its harness established: the result, the package, platform, Node and digest, and every declared case with its outcome and applicability. A failed result needs established evidence; whatever was not established is unknown, with a diagnosis. The publisher and Engineering use it to check a verifier; no verifier or product depends on it, and the module imports nothing.

An invariant is tested exhaustively where it is owned, and its integration selectively where it is consumed.

Findings are verified failures, potential defects, architectural concerns or unknowns, and the kinds are never merged. A clean result shows only what its checks cover.

## Execution and evidence

`kaal-testing/coverage` runs a workspace's own tests under V8 coverage (c8) and measures which delivered files and lines they executed:

- `cover(workspace, delivered, { root, dir })` runs `npm test -w <workspace>` from `root`, counting only the `delivered` files the caller names, into a report directory the caller provides fresh: one already holding a summary is refused, and `cover` removes nothing. It resolves to line, branch and function coverage, each delivered file's executed and executable lines, and the delivered files never executed, or to a failure naming the workspace and the missing evidence.
- `evidence(workspace, root, text)` reads one c8 JSON summary into that evidence, or into that failure.

Which workspaces exist, building them and which files they deliver are packaging: the caller decides them. Commands, reads and every other host operation go through Hosting. Testing declares the only host modules its delivered code imports directly (`node:path`, `node:url`), and checks that declaration with Hosting's conformance inspection in its own tests. Coverage is evidence of executed code, not of correctness, and no percentage is required.

## Acceptance runs

`kaal-testing/acceptance` runs capabilities' acceptance scenarios against the packages as delivered. Each capability owns its scenarios and what they assert. They live in its workspace under `test/engineer/*.test.mjs`. Building and packing each package exactly once is packaging: the caller does it and hands over a manifest, `{ name: { tarball, sha256, integrity } }`.

- **Discovery:** `discover(workspaces)` finds the scenarios by that convention. Test locations say a case's purpose and owner. They are locations, not Testing kinds: Case, Suite, Plan and Run are unchanged. `test/embed/` holds a capability's own cases, shipped with it and run by its own `npm test` against the installed package. `test/engineer/` holds Engineering's lane scenarios, which `install()` the packed tarballs. There is no `test/external/` convention. Until every owner has moved its scenarios, `discover` also reads the earlier `test/acceptance/`.
- **Running:** `accept({ manifest, scenarios, run, cwd })` runs them in parallel. `run` is a missing or empty directory, which Testing initializes with the manifest, a ledger and the hosts. An empty scenario list is refused before anything is written or run, since the runner would otherwise discover tests of its own.
- **Outcome:** the result keeps the runner's own exit status apart from `passed`. `passed` is false whenever there is a verified failure, even if the runner exited 0. Unknowns stay in the findings and do not decide `passed`; a gate that wants them to fail says so itself.
- **Installing:** in a scenario, `install(names)` installs the manifest's tarballs into a fresh host of its own under the run, and records what it consumed. A tarball that no longer holds the bytes packed for it is refused. A scenario never builds or packs.
- **Findings:** `findings(...)` reads the ledger, and npm's record of what each host holds, into findings. These are verified failures:
  - bytes other than the packed tarball;
  - a package this run did not pack;
  - a host holding a packed package from elsewhere;
  - a host shared by two installations;
  - a scenario that installed nothing;
  - a host whose record cannot be read;
  - a failed scenario run.
- **Observed tests:** `tests` lists each test the runner executed, as Testing's own reporter saw it on the runner's stdout, a channel no scenario writes to: `{ file, sha256, test, outcome }`, with the scenario's path relative to `cwd`, its bytes as run, its full suite path, and pass, fail, skip or todo. Each scenario is hashed before and after the run. One whose bytes changed is a verified failure of the run, and its tests pin no bytes. A change undone before the run ends is not seen, since scenarios run as the same user. The spec report goes to `runner.stderr`, and `runner.stdout` is empty. Only the object `accept` returned is an observed run, and only in the process that ran it: what it observed is kept privately, so a copy, a changed field or a run read back from disk is a claim, not an observation.
- **Unknowns:** two things stay unknown, never passed:
  - whether the hosts lie physically outside the repository, until Hosting offers a portable containment contract;
  - installations a scenario makes without `install()`.

Whether any package was rebuilt, or a tarball changed during the run, is packaging's to check.

## Non-blank text lines

`kaal-testing/inventory` counts the files a caller lists. The metric is broad on purpose: a **non-blank text line** is any line with a non-whitespace character in any text file, whether code, Markdown, YAML, JSON or configuration. It is not executable lines of code, and it is never a denominator for coverage.

`inventory(files)` takes `{ path, bytes }` for each file and returns every file once, with how it was counted:
- **text:** its non-blank lines;
- **binary:** NUL bytes or not UTF-8, so no text lines;
- **excluded:** for example a `package-lock.json` generated by npm. It is counted, shown with its reason, and kept out of the total.

Which files exist is the caller's answer. The count says how much text is tracked, not what runs or who owns it.

## CASE-owned attribution

`kaal-testing/attribution` attributes an inventory's files to the Capabilities, Agents, Skills and Extensions that claim them. Testing owns how claims are read, resolved and reported, with one rule for all four kinds. Each owner owns its own claim.

- **A claim** is an ownership file named `ownership.kaal.json`, kept in its owner's own tree and found by that name. There is no central list. It names one typed owner: its CASE kind (`capability`, `agent`, `skill` or `extension`) and the exact `{ name, id }` of its own Node. It lists repository-relative path patterns. A pattern is a file path, or a directory path ending in `/` that covers everything beneath it. Patterns are literal: there are no wildcards.
- **Scope:** an ownership file's scope is the directory holding it. Every pattern must lie within that scope, so an owner claims only within its own tree. An ownership file with a pattern outside its scope is a verified failure and claims nothing.
- **Resolution:** the caller supplies the admitted CASE Nodes with their kinds, from Core. A claim resolves only when its kind, name and id all match one of them. Otherwise it is a verified failure, and its paths stay unassigned. So is an ownership file that does not read. An owner keeps the kind Core gives it: a Skill is never counted as a Capability.
- **Host boundary:** Testing takes the inventory and the ownership files' bytes as given. Listing the files, reading their bytes and every host path operation are the caller's, through Hosting. Testing compares the declaration's repository-relative strings as written. A claim is a declaration: it attributes the tracked paths it names, within its scope, and nothing more.
- **Attribution** of each file:
  - claimed by exactly one owner: that owner's;
  - claimed by none: unassigned;
  - claimed by two or more: an architectural concern naming every claimant. It is not attributed by precedence, proximity or splitting. It is listed among the conflicts and counted as unassigned until the claims are fixed.
- **Stale claims:** a pattern that matches no inventoried file is a potential defect.
- **Accounting:** the repository's non-blank text lines always equal the singly attributed lines plus the unassigned lines. Binary and excluded files are attributed but carry no lines.

`attribute(inventory, claimFiles, owners)` returns each owner's kind, files and lines, the unassigned and conflicting files, and every finding. A package or a directory is never taken as ownership: a capability may be delivered in any number of packages, or none, and a file belongs to an owner only when that owner claims it. Ownership is structural. It says which responsibility a file belongs to, not who is accountable for it or who verified it.

## Reconciled report

`kaal-testing/report` puts the two dimensions side by side. Neither is derived from the other.

- **Package dimension:** each workspace's delivered JavaScript, executed by that workspace's own tests, from `cover`.
- **Ownership dimension:** each owner's files and non-blank text lines, from `attribute`, unchanged.
- **Reconciliation:** a delivered file joins an owner only when attribution gives that exact tracked path to exactly one owner. Every delivered file gets exactly one status:
  - **attributed** to its owner;
  - **unclaimed**;
  - **conflicting claims**;
  - **no tracked identity**, for a delivered file Git does not track, such as built output. No source is guessed for it.
- **Metrics:** an owner's delivered files report executable lines executed, as V8 coverage counts them, beside its non-blank text lines. No ratio of one to the other is formed. A file in a workspace whose coverage failed counts as not measured, and the failure is a verified failure.

`report(attribution, coverage)` takes `attribute`'s result and one coverage result per workspace, and returns the ownership dimension, the package dimension, the reconciliation per owner and per status, and every finding.

## Contract evidence

`kaal-testing/contracts` reads what a capability's own mapping shows about its contracts in one run. The capability owns the mapping, `evidence.kaal.json` beside its ownership claim. Each entry quotes one of its authoritative statements verbatim, pinned by the quote's sha256, and offers conformance or acceptance tests for it, each pinned by its file's sha256 and its full suite path. Implementation tests are never offered. Each entry also states the inference from those tests to the statement, its limits, and a review record or `null`.

- **Mechanical facts:** the statement is present verbatim, and each test file holds its pinned bytes.
- **Judgment:** the inference is "proposed, not reviewed". A review record in the mapping is the owner's own claim, so it is reported as declared, not verified, and as stale once a pin changes.
- **Observed, only from a run:** no per-test result is accepted from any record, however exactly it names the file, its hash and the test: a record is a claim. An offered acceptance test is observed only through a run `accept` returned in this process, when that run executed its file at its pinned bytes and its exact suite path, its scenario installed a packed package, and the run's provenance holds: no foreign bytes, unpacked package, host holding a package from elsewhere, shared host or unreadable host record. A failed test is a verified failure. Anything else, including a skipped test, a conformance test and every test without a run, stays unknown, with its reason.

`problems(mapping, owner)` says why a mapping does not read. `classify(mapping, files, run)` classifies each statement: a verified failure when an offered test failed in the run, observed when every offered test passed in it, and otherwise unknown, with its reason. Observed says what the run showed of those tests, not that the statement holds: the inference stays a judgment. There is no percentage, ratio or gate. Nothing here runs a test.

The observation does not outlive the process. A run kept on disk, or handed to another process, carries no provenance, so a durable or cross-process record of observed evidence is a separate Change.

## Consumer verification

The `Testing` Node states what it takes for a consumer to verify an installed product without its source (testing/F11–F17). The product delivers its own declared acceptance or conformance cases and one entry point that fails closed. Each run gives one result, failed, unknown or verified, each with its own exit status and summary, and names the subject it exercised. The run leaves the consumer's content unchanged, its procedure is repeatable, and each run reports the outcome and conditions it observed, never a promise that the same installation gives the same result. It keeps product conformance apart from consumer integration. A consumer's result is its own observation, not evidence Testing observed. The section names no realization. npm is the first, recorded in `plan/consumer/architecture.md` (testing/A9). kaal-testing ships no mechanism for it.

## Boundaries

Testing keeps no registry. Its execution runs a capability's own cases as that capability defines them, and adds none.

Each capability owns its contracts and its cases. The obligation to demonstrate them belongs to the capability and its engineering. So do builds, packaging, and when checks run and what they gate.

## Register the Nodes

```sh
npx kaal register capability testing node_modules/kaal-testing/capability
npx kaal register skill kaal-testing node_modules/kaal-testing/payload
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.

## Run timing

`@kaihacksai/kaal-testing/timing` reads durations already recorded by a harness. It measures nothing and keeps no history.

```js
import { profile, skew } from "@kaihacksai/kaal-testing/timing";
const evidence = profile({ cases: recordedCases }); // [{ name, ms }]
const platforms = skew(platformRuns); // [{ platform, cases }], same Cases on each
```

`profile` challenges concentration in the slowest share and outliers against the run's own median. `skew` compares each Case with its median duration on the other platforms. `DEFAULTS` is frozen: `{ share: 0.8, budget: 0.8, outlier: 10, floor: 1000, factor: 4, minimum: 5 }`. Each option can be overridden; malformed inputs or options give `unknown` with findings and no challenges.

Both return `{ result, challenges, findings }`, with `result` `challenged`, `unchallenged` or `unknown`. They never decide a run's verdict. The Case/suite owner investigates concentration; the named Case owner investigates an outlier or platform skew. A timing difference establishes no cause. Hosting is consulted for demonstrated host-specific causes and owns confirmed operating-system-boundary defects.
