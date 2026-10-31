# kaal-testing: Testing

This is kaal-testing's Test Plan: which Test Cases verify the [Intent](intent.md), [Requirements](requirements.md) and [Architecture](architecture.md), and where they run.

## Where the cases run

- **Delivered cases.** The package ships its consumer cases, run by the installed verification (testing/F61, testing/F63). In an installation, `npm test` runs them and nothing else (testing/F62). Each is a Case in Testing's own model, shipped in `test/verify.json`, and its `tests` names the identifiers it verifies. Whether an identifier is evidenced is derived from those traces and the latest relevant Run (testing/F66, testing/F40), never declared beside them.
- **Publisher's cases.** The planned tests below, the implementation tests and the Engineering harness's checks of the verifier verify the publisher's process. They run in the source workspace, where `npm test` runs every declared suite, and they are not delivered.

## Planned tests

Each planned test is established before implementation and is immutable afterwards. Each row names the test, what it checks and its loop. They are grouped by the topic of the [Requirements](requirements.md).

### RED Evidence and Feature-Accepted Regressions

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T1: observe records each given file by its bytes or as absent, and each test it ran with its file, suite path and outcome | testing/F1 | Requirements |
| testing/T2: suites are not Test Cases; a skipped or `todo` test is RED with its marker; a failing test without an identity is an Unidentified RED; a duplicate identity is a finding | testing/F2 | Requirements |
| testing/T3: Regression, Persisting and Feature REDs, new GREEN, and a Missing RED for an established Test Case that disappeared | testing/F3 | Requirements |
| testing/T4: unknown evidence is never read as absent or new | testing/F3 | Requirements |
| testing/T5: a decided FAR entry names its Change and its Test Cases; each malformed member is a finding and accepts nothing | testing/F4 | Requirements |
| testing/T6: an accepted entry marks only its listed Regression or Missing REDs, under its Change, and they stay RED; any other listed identity is stale | testing/F5 | Requirements |
| testing/T7: evaluation follows the gate's policy; acceptance subtracts single identities; findings always block, a candidate file that did not run to the end among them; a malformed policy fails closed | testing/F10 | Requirements |
| testing/T8: the report lists every RED by identity, class and file; an accepted RED carries its Change and is counted RED, never GREEN | testing/F6 | Requirements |
| testing/T14: the same observed runs, FAR outcome and policy give the same results | testing/N1 | Requirements |
| testing/T15: `kaal-testing/red` reads runs only through Testing's own observation, and imports no host module | testing/N4 | Architecture |

### Contract Evidence from Observed Runs

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T9: `accept` lists each test it ran, with its file, the file's bytes as run, its suite path and its outcome | testing/F7, testing/A5 | Requirements |
| testing/T10: a statement whose offered tests passed in the run is `observed`, and its inference is still a judgment; a statement with a failed test is a `verified failure` | testing/F8 | Requirements |
| testing/T11: a copied run, a test the run did not execute, and bytes other than those run stay `unknown`, each with its reason, and changing the run's fields afterwards changes no classification | testing/F8, testing/I5, testing/A5 | Requirements |
| testing/T12: a scenario that installed nothing gives no evidence, and neither does a test that installed the package and passed in a run whose provenance failed elsewhere | testing/F9 | Requirements |
| testing/T13: kaal-testing's runtime depends on `c8` and Hosting only, and nothing it delivers imports a package it judges | testing/N3, testing/A6 | Architecture |

### Consumer Verification

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T16: the Node's consumer verification section states delivery, the fail-closed entry point and the three results verbatim | testing/F11, testing/F12, testing/F13 | Requirements |
| testing/T17: it states the named subject, isolation and a repeatable procedure, the two scopes, and whose observation a consumer's result is, verbatim | testing/F14, testing/F15, testing/F16, testing/F17 | Requirements |
| testing/T18: the section names no product, package manager, version control system or hosting service, and kaal-testing gains no export or dependency for consumer verification | testing/N5, testing/I6 | Architecture |
| testing/T19: the Agent Skill and the README carry the section, and the Skill points to the Node | testing/A8 | Architecture |

### PLAN Boundary Integrity

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T20: an untouched boundary is "unchanged within the declaration", never "met", and still lists execution reproducibility and behavioural validity as unknown | testing/F22, testing/F23, testing/I8 | Intent |
| testing/T21: a changed planned test, and a file a sync re-adds beneath a declared directory, are verified failures naming concern, owner, path and change | testing/F18, testing/F21 | Requirements |
| testing/T22: a lost executable mode (guard/D5) fails under a verdict that compared mode, and stays unknown under one that did not | testing/F19, testing/F21 | Requirements |
| testing/T23: an anchor read from the PR head, a missing anchor, and working-tree bytes give unknown, never unchanged | testing/F20 | Requirements |
| testing/T24: an undeclared cross-Capability dependency stays unknown, and a declaration whose path leaves the repository is a verified failure | testing/F18, testing/F22 | Requirements |
| testing/T40: a verdict's own labels never establish trust: without the trust authority's attestation bound to its anchor, it is unknown, never unchanged and never a verified failure | testing/F20, testing/F23 | Requirements |
| testing/T41: a change entry that does not read, and an unrecognized change to a declared path, leave the boundary unknown, never unchanged | testing/F19, testing/F23 | Requirements |
| testing/T25: the same declaration and verdict give the same result from realization A and from realization B, and `boundary` imports no host module and no Sealing | testing/N6, testing/A10, testing/A11 | Architecture |

### Testing Model

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T26: identities are the holder's: any nonempty string, unique across the model; Testing imposes no format, and a model whose Cases use another holder's identities is checked and evaluated like any other | testing/F24 | Requirements |
| testing/T27: only the levels a product uses are declared; a Strategy names at least one Plan and a Plan at least one Suite; a Case is defined once and may be in several Suites; a reference to an undeclared element is a finding | testing/F25 | Requirements |
| testing/T28: a Case's tests → subjects are opaque to Testing, of any kind; incoming views are derived, never declared; no result says anything about a subject | testing/N7 | Requirements |
| testing/T29: a Case is passed, failed, inapplicable only as the Plan declares it and only when it did not run, and otherwise unknown | testing/F26 | Requirements |
| testing/T30: Suite and Plan aggregation, and an empty Suite is unknown | testing/F27 | Requirements |
| testing/T31: an allowed Case stays failed, and the Plan's evaluation passes with its allowances listed | testing/F28 | Requirements |
| testing/T32: stale allowances; unknown is never allowed; an allowance outside the Plan, or malformed, leaves the Plan unevaluable | testing/F28 | Requirements |
| testing/T33: evaluation takes no baseline and no retention | testing/F29, testing/F33 | Requirements |
| testing/T34: the same model and Run give the same results, and the inputs are not changed | testing/N8 | Requirements |
| testing/T36: a Plan, a Suite or a Case runs on its own, any number of times; a Plan Run may encompass Suite Runs and a Suite Run Case Runs; each Run holds its own Case Results, apart from the definitions | testing/F30 | Requirements |
| testing/T37: a Run's provenance identifies the definitions and versions it executed and its effective Test Data; a Case Result counts only for the definition it identifies | testing/F31 | Requirements |
| testing/T38: Test Data is defined at Plan, Suite or Case level and owned by its defining context; reuse leaves ownership where it is; its content is opaque and may be external | testing/F32 | Requirements |
| testing/T39: a retired Case stays declared as provenance and is no longer executable; Testing keeps no Run | testing/F33 | Requirements |
| testing/T35: `kaal-testing/model` is one module that imports nothing and names no other Capability's kind | testing/A12 | Architecture |

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T50: the latest applicable Run, in the consumer's order, is the current evidence; an older Run never stands in for it, and Testing reads no clock | testing/F40 | Requirements |
| testing/T51: applicability follows the definitions, versions and Test Data the model now declares; a Run of another element or version is disclosed as inapplicable, never counted | testing/F40, testing/F41 | Requirements |
| testing/T52: an incomplete, unknown or invalid latest applicable Run makes the current quality unknown, and never falls back to an older GREEN | testing/F41 | Requirements |
| testing/T53: retention is the consumer's: zero, one or many Runs are accepted as given, nothing is kept between calls, and with none retained the quality is unknown | testing/F42 | Requirements |

### Consumer Verifier Conformance

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T54: the contract names its scenarios, each with the change a harness makes and the result every conforming verifier shows, and covers at least hosting/F26's minimum set | testing/F43 | Requirements |
| testing/T55: a run is observed from its exit status and its one summary line, read through the verifier's declared words; anything else is no observation | testing/F44 | Requirements |
| testing/T56: a verifier that shows what the contract expects conforms in every scenario | testing/F45 | Requirements |
| testing/T57: a matching result label is never enough: exit status, cause, package, platform, Node, digest and every case's outcome are each compared with the harness's facts | testing/F45 | Requirements |
| testing/T58: a verifier that claims any other result than the scenario's never conforms, on zero or absent cases, a missing or tampered manifest or installation, skipped, todo or inapplicable cases, failures, or a changed consumer | testing/F46 | Requirements |
| testing/T59: a case is not applicable only where the harness established an explicit platform scope excluding the platform, and a reason; a skipped, todo or unsupported case claimed inapplicable never verifies | testing/F47 | Requirements |
| testing/T60: neither evasion verifies: a declared case silently omitted on a platform, or replaced there by a stand-in, stays visible as not run; an inapplicable case is never counted as passed | testing/F48 | Requirements |
| testing/T61: a run that is not verified reports its observation, its evidence or uncertainty, and a next step that claims no more than it knows; a verified run reports none | testing/F49 | Requirements |
| testing/T62: a case that needs an optional complement, present or absent, is not applicable only where the harness established that complement's opposite state and that it is optional; a missing required dependency never makes a case inapplicable, and never verifies | testing/F47 | Requirements |

### Applicability by Host Fact

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T80: a case declared by a host fact that the harness established not holding, reported not applicable with that same applicability, conforms to the not-applicable scenario | testing/F68, testing/F69, testing/F71 | Requirements |
| testing/T81: a host declaration establishes nothing where the fact holds, was not established, is inherited, or has no reason or https evidence; and a verifier that shows another host list, other evidence or no host never conforms | testing/F68, testing/F69 | Requirements |
| testing/T82: where the fact holds, the declared case runs: reported pass it conforms to clean, and reported not applicable, skipped, todo or not run it does not | testing/F70 | Requirements |
| testing/T83: the verifier contract stands: no scenario is added, the platform way is unchanged, and the module still imports nothing | testing/F71, testing/N14 | Architecture |

### Cross-Platform Inventory Parity

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T70: parity needs exactly one run per supported platform of one candidate, each with the same declared cases; anything else is unknown, with a finding | testing/F56 | Requirements |
| testing/T71: every declared case stays visible on every platform: one left out, reported twice, or replaced by a stand-in is a finding, and it is not run there | testing/F57 | Requirements |
| testing/T72: a case is not applicable on a platform only with that platform's established applicability, and by a platform scope only in the operating-system boundary; it is never counted as passed, and a case not applicable on every platform is exercised on none | testing/F57, testing/F67 | Requirements |
| testing/T73: together the runs are failed when any platform's is, verified only when every platform's is and nothing is found, and unknown otherwise; an unresolved challenge finding never verifies | testing/F58 | Requirements |

### BRITTLE

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T84: the Testing Node defines BRITTLE, its expansion, false RED and false GREEN as defects of the Case, and learning through the same traces and versions | testing/F72, testing/F74 | Requirements |
| testing/T85: the Skill's BRITTLE section gives the four design checks and points to the reference, which ships | testing/F73 | Requirements |
| testing/T86: the reference gives the lesson record, a correction that traces to the same target as a new version or Case, a false GREEN as a Defect that a later GREEN never erases, and Testing as verification with Review as validation; it cites no Change, pull request or other capability's identifier | testing/F74, testing/F75 | Requirements |
| testing/T87: through the model, a corrected Case version leaves the brittle version's Run no longer current, and a Case that tests a Defect is traced to it | testing/F74, testing/N15 | Architecture |

### Testing 0.0.1 Release Readiness

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T74: the package states its scoped name, its version, public access and exact registry dependencies, and no importer uses its old name | testing/F59 | Requirements |
| testing/T75: the package ships its six documents; they cite no plan, Change or repository path as authority, and the README links each | testing/F60 | Requirements |
| testing/T76: the shipped manifest gives every other shipped file's SHA-256, the delivered cases as a model that checks clean and traces each to identifiers the documents define, every supported platform, and no applicability, so no case is scoped by platform | testing/F61, testing/F64, testing/F65, testing/F66 | Requirements |
| testing/T77: in the source workspace npm test runs every declared suite, the publisher's and the consumer's; nothing it needs runs in an installation | testing/F62 | Requirements |
| testing/T78: packed and installed alone in a fresh consumer, npm test there verifies the installed copy and conforms to the shared verifier contract's clean scenario | testing/F59, testing/F61, testing/F63, testing/F64, testing/N12 | Architecture |
| testing/T79: the installed verification imports only Node's built-ins, by any import form, so a broken library cannot mask itself; no delivered case reads this repository; and no shipped file branches on the operating system | testing/F65, testing/N12, testing/N13 | Architecture |
