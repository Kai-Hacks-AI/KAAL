# kaal-core: Testing

This document says which tests ship with kaal-core, what each checks, how the installed verification decides its result, which tests are the publisher's alone, and which Requirement each kind of test checks.

What `verified`, `failed` and `cannot verify` mean is defined by KAAL's Testing capability (testing/C9), not by kaal-core. kaal-core applies those meanings to its own package and does not widen them. `verified` means that every required case executed successfully against the installed candidate. A missing, skipped, unexecuted or failed required case can never establish it. `validated` is a review judgment, never an automatic consequence of a passing run.

## Delivered tests

These four files ship in the package. They are plain `node:test` files that import kaal-core by its package name, so they exercise whichever copy is installed. Each test title names, in brackets, the `core/…` identifiers it checks.

| File | Loop | What it checks |
| --- | --- | --- |
| `test/embed/intent.test.mjs` | Intent | Bootstraps an Engine and verifies it, and leaves an existing Engine unchanged. Admits registrations end to end: assembles them one way, reports what it cannot judge, and needs no Graph. |
| `test/embed/requirements.test.mjs` | Requirements | Payload admission: every payload Node is admitted and none rejected, with the foundational ids kept. Frontmatter validation against a supplied schema, unaffected by the body. Installation Contract conformance: the shipped contract conforms and Core's conformance cases hold on it. Registration findings: unknown kinds with their candidates, unresolved targets, and traces the rule does not permit. The shipped Core Skill Node is admitted by the unchanged payload and has the correct Skill type. |
| `test/embed/architecture.test.mjs` | Architecture | Each declared entry point loads and offers what it exports. No Graph is needed at run time. The delivered Node support carries its provenance. |
| `test/embed/code.test.mjs` | Code | Unit checks of exported functions: the Registration Type and its schema, assembly that is empty for no input and independent of order, and an absent complement reported as unavailable. |

## The verifier, the manifest and the runner

- **`test/verify.json`** is the shipped manifest (core/F85). Its `files` member lists every other file the package ships, each with its SHA-256. Its `cases` member declares each required test case by its delivered file, its full name and the `core/…` identifiers it tests. It is generated from the packed file list and committed, never edited by hand: the publisher regenerates it explicitly after a shipped file changes, the build never writes it, and the publisher's tests fail on a stale one (core/T97).
- **`test/verify.mjs`** is the consumer verification, `npm run test:consumer` (core/F70, core/F87). It:
  1. hashes the package's files, outside any nested `node_modules`, and compares them with the manifest. A missing or changed file, or in an installation an added one, gives `cannot verify`, naming the first path that differs. No case runs then;
  2. runs each delivered test file on its own, in a scratch directory it removes afterwards;
  3. compares the cases that ran with the declared cases. A declared case that failed gives `failed`. A declared case that did not run, was skipped or was todo, or an undeclared case that ran, gives `cannot verify`. Otherwise every required case executed successfully, and the result is `verified`;
  4. prints one execution record, `kaal-core-execution: ` followed by JSON naming the candidate (name, version and the manifest's SHA-256) and each case's outcome (`passed`, `failed`, `skipped`, `todo` or `not run`), then the result line as the last line of standard output. The exit status is 0, 1 or 2.

  The record speaks only for the candidate it names. kaal-core stores no evidence in your environment: the record lives in your terminal or CI log.
- **`test/run.mjs`** is `npm test` (core/F75). In an installation, recognized when the package directory sits directly inside a `node_modules` directory, it runs `test:consumer` alone and exits with its result. In the source workspace it runs every declared `test:<name>` suite. If it cannot tell which place it is in, or a required suite is missing, it reports `cannot verify` with exit 2 and runs nothing.

Both scripts reach the host only through `kaal-hosting` and hash only through Foundation (core/F88). How to run the verification is in [Operations](operations.md).

## Publisher tests: not delivered

The publisher's Engineering tests are not delivered. They do not ship in the package and never run in an installation, and nothing a consumer runs reports them as run. They are:

- **the planned outer tests** in `test/plan/`, one file for each area of Core. Each test title starts with a `core/T…` id and names the Requirements it checks in brackets. They are written before the code and are immutable to the code that turns them GREEN;
- **the build-time Code tests**, compiled from the TypeScript files in `test/` (such as `test/core.test.ts`) and run after a build;
- **the release checks** added by the Owner's review: `test/manifest.test.mjs` (core/T97), which requires the committed manifest to be current, and `test/acquisition.test.mjs` (core/T96), which shows that every documented install or run names `@kaihacksai/kaal-core` and that the documented command never runs an unrelated unscoped `kaal-core`;
- **the bench**, which measures admission.

In the source workspace, `npm test` runs these with the consumer verification. They include release acceptance, which packs kaal-core with its runtime dependencies, installs the tarballs into a clean directory and checks that the installed `npm test` ends in `verified`, and that damage never does.

## Coverage

For each `core/…` Requirement (see [Requirements](requirements.md)), this table says whether a delivered test checks it, a publisher test does, both do, or no test does. "Delivered" means a delivered test's title names the Requirement. "Publisher" lists the planned outer tests whose titles name it. The build-time Code tests and the bench are not counted. A test naming a Requirement is a claim that it checks it. Whether it checks it fully is a review judgment.

Of 106 Requirements, 19 are checked by a delivered test, 98 by a publisher test, and 6 by no test. 17 are checked by both.

The six Requirements no test checks are core/F7 and core/F8 (ownership of Skill format and of Types, statements of responsibility), core/N1 and core/N3 (where frontmatter validation applies), core/N5 (a contract adds no runtime dependency) and core/N7 (the Node.js 24 prerequisite, which `package.json` declares and core/T92 checks under core/F86).

| Requirement | Checked by | Publisher tests |
| --- | --- | --- |
| core/F1 | delivered and publisher | core/T5 |
| core/F2 | publisher only | core/T2 |
| core/F3 | publisher only | core/T3, core/T4 |
| core/F4 | publisher only | core/T5, core/T6 |
| core/F5 | delivered and publisher | core/T1 |
| core/F6 | publisher only | core/T7 |
| core/F7 | no test | none |
| core/F8 | no test | none |
| core/F9 | publisher only | core/T10 |
| core/F10 | publisher only | core/T10, core/T12 |
| core/F11 | delivered and publisher | core/T10, core/T12 |
| core/F12 | publisher only | core/T10 |
| core/F13 | publisher only | core/T10 |
| core/F14 | publisher only | core/T13 |
| core/F15 | publisher only | core/T11 |
| core/F16 | publisher only | core/T14 |
| core/F17 | publisher only | core/T15, core/T16 |
| core/F18 | publisher only | core/T17, core/T22 |
| core/F19 | delivered only | none |
| core/F20 | publisher only | core/T18 |
| core/F21 | publisher only | core/T19 |
| core/F22 | publisher only | core/T17 |
| core/F23 | delivered and publisher | core/T23 |
| core/F24 | publisher only | core/T24 |
| core/F25 | publisher only | core/T23 |
| core/F26 | publisher only | core/T26 |
| core/F27 | publisher only | core/T26 |
| core/F28 | publisher only | core/T25 |
| core/F29 | publisher only | core/T27 |
| core/F30 | publisher only | core/T28 |
| core/F31 | publisher only | core/T29 |
| core/F32 | delivered and publisher | core/T31 |
| core/F33 | publisher only | core/T32, core/T33 |
| core/F34 | publisher only | core/T34 |
| core/F35 | publisher only | core/T35 |
| core/F36 | publisher only | core/T36 |
| core/F37 | publisher only | core/T37 |
| core/F38 | publisher only | core/T32, core/T33 |
| core/F39 | publisher only | core/T39 |
| core/F40 | publisher only | core/T40 |
| core/F41 | publisher only | core/T41 |
| core/F42 | publisher only | core/T43 |
| core/F43 | publisher only | core/T44 |
| core/F44 | publisher only | core/T45, core/T46 |
| core/F45 | publisher only | core/T47 |
| core/F46 | publisher only | core/T44 |
| core/F47 | delivered only | none |
| core/F48 | publisher only | core/T51 |
| core/F49 | publisher only | core/T50 |
| core/F50 | delivered and publisher | core/T52, core/T73 |
| core/F51 | publisher only | core/T52, core/T53, core/T54, core/T67 |
| core/F52 | delivered and publisher | core/T53, core/T54, core/T55 |
| core/F53 | publisher only | core/T54, core/T57, core/T67 |
| core/F54 | publisher only | core/T56, core/T67 |
| core/F55 | delivered and publisher | core/T55, core/T58 |
| core/F56 | delivered and publisher | core/T58 |
| core/F57 | publisher only | core/T60, core/T61, core/T62 |
| core/F58 | publisher only | core/T60, core/T63 |
| core/F59 | publisher only | core/T60, core/T64 |
| core/F60 | publisher only | core/T60 |
| core/F61 | publisher only | core/T61, core/T63, core/T64, core/T65 |
| core/F62 | publisher only | core/T68, core/T69 |
| core/F63 | publisher only | core/T69 |
| core/F64 | publisher only | core/T70 |
| core/F65 | publisher only | core/T68 |
| core/F66 | publisher only | core/T72 |
| core/F67 | publisher only | core/T73 |
| core/F68 | delivered and publisher | core/T77 |
| core/F69 | publisher only | core/T74 |
| core/F70 | delivered and publisher | core/T75, core/T76, core/T91 |
| core/F71 | publisher only | core/T75 |
| core/F72 | publisher only | core/T76 |
| core/F73 | publisher only | core/T78 |
| core/F74 | publisher only | core/T79 |
| core/F75 | publisher only | core/T75, core/T80 |
| core/F76 | delivered and publisher | core/T81 |
| core/F77 | delivered and publisher | core/T82 |
| core/F78 | publisher only | core/T83 |
| core/F79 | delivered and publisher | core/T84, core/T85, core/T94, core/T95 |
| core/F80 | delivered and publisher | core/T86 |
| core/F85 | publisher only | core/T76, core/T91, core/T92 |
| core/F86 | publisher only | core/T92 |
| core/F87 | publisher only | core/T91 |
| core/F88 | publisher only | core/T93 |
| core/F89 | delivered and publisher | core/T98 |
| core/N1 | no test | none |
| core/N2 | publisher only | core/T8 |
| core/N3 | no test | none |
| core/N4 | publisher only | core/T20, core/T21 |
| core/N5 | no test | none |
| core/N6 | publisher only | core/T22 |
| core/N7 | no test | none |
| core/N8 | publisher only | core/T30 |
| core/N9 | publisher only | core/T29 |
| core/N10 | publisher only | core/T38 |
| core/N11 | publisher only | core/T42 |
| core/N12 | publisher only | core/T46, core/T47, core/T48 |
| core/N13 | publisher only | core/T19, core/T49 |
| core/N14 | delivered and publisher | core/T57, core/T59 |
| core/N15 | publisher only | core/T56 |
| core/N16 | publisher only | core/T59 |
| core/N17 | publisher only | core/T65 |
| core/N18 | publisher only | core/T71 |
| core/N19 | publisher only | core/T74 |
| core/N20 | publisher only | core/T86 |
| core/N23 | publisher only | core/T91 |

## Core Skill verification

The declared source `test:skill` suite runs core/T98 from the initialization PLAN; the rest of that PLAN is not enrolled or claimed implemented. The delivered Requirements loop checks the shipped Node against Core's real admission API. The publisher independently runs Engineer Skill's checker against the delivered/relocated Agent Skill. Procedure quality and authority language remain review judgments, not evidence that an agent used the Skill.
