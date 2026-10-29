# Testing Model: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A12** [testing/N7, testing/N8, testing/F24–testing/F33]: `kaal-testing/model` is one module, `lib/model.mjs`, exporting:
  - `check(model)`, the findings;
  - `tested(model)`, the derived view from subject to the live Cases that test it;
  - `data(model)`, the derived view from each Test Data item to its owner and the contexts that reuse it;
  - `results(model, run)`, each Case's, Suite's and Plan's result in that one Run, its effective Test Data and its findings;
  - `evaluate(model, run, { allowances })`, the evaluation of a Plan Run.

  A model declares `strategies`, `plans`, `suites` and `cases`. A Plan, Suite or Case may carry a `version` and `data: [{ id, version?, content? | external? }]`, and reuse others' Test Data by `uses: [id]`. A Case may be `retired: true`.

  A Run is `{ id, of, provenance: { <definition>: <version or null> }, outcomes: { <case>: passed | failed | skipped | todo }, data: { <test data>: <version or null> }, runs: [<encompassed Run>] }`. An encompassed Run inherits its parent's provenance. `outcomes` are as `testing/C4`'s outcomes give them. `results` and `evaluate` say what that one Run shows about the definitions, and neither keeps it.

  The module imports nothing, not even Testing's own modules, and names no other Capability's kind and no FAR role.
- **testing/A13** [testing/F25]: **A model is given, never discovered.** Strategies, Plans, Suites and Cases are product-owned data that the caller hands in. Testing keeps no registry, reads no path and names no file in which a product keeps them. Runs are handed in the same way, one at a time: Testing stores none, so retention is wholly the holding context's. A Change's `plan/<topic>/testing.md` stays a document for people.
- **testing/A14** [testing/N8]: **A standalone package, later.** Because the model needs no host and no other Capability, it can ship in a dependency-free package that consumers use to declare and evaluate their own Plans. This is the direction of the research thread's option 2. Packaging and publication are a separate Change, not this one, and Hosting-based `accept` and coverage stay KAAL-internal.

## Semantic ownership

These are the boundaries this PLAN draws with existing contracts. Each is surfaced for the Owner before DO.

- **Data owns provenance and lifecycle as management.** Data's Definition covers provenance and lifecycle, "from creation through retention to supersession or disposal", while "each consuming capability keeps the meaning of its own data". Testing therefore defines only what a Run must identify for its results to count (testing/F31) and that retention is not Testing's (testing/F33). It defines no provenance mechanism, retention policy or store. Data, not Testing, says how Runs and Test Data are kept and disposed of.
- **Test Data is Testing's kind, not Data's.** Containing data does not make anything Data's. Testing owns the Test Data kind's ownership and reuse rules (testing/F32), and the defining context owns each item's content and meaning.
- **The model is not a Graph.** Its elements are plain data handed to the module, not Graph Nodes, so Core's Typed Form rule does not apply to them. Representing them as Nodes, with **tests →** as a Graph Edge, would be a later Change with Graph and Core.
- **Runs and `testing/C4`.** `testing/C4` observes outcomes and `testing/C8`'s `accept` observes a run, keyed by runner test, not by Case. Mapping a runner's test to a Case's identity is the product's. Handing observations over as Runs of this model is `testing/C16`'s amendment, so this Change leaves both unchanged.
- **Change's FAR.** `evaluate` now takes the Plan's Run rather than outcomes and a Plan name. `change/C2` (#558) composes two Plan Runs, so its DO adopts this signature.

## How FAR uses it, with no FAR in Testing

Change composes two ordinary Plans (`change/C2`, #558). It evaluates a Run of the Features Plan with no allowances, and a Run of the Regression Plan with its Accept list as `allowances`. An accepted Case stays `failed`, and the Regression Plan passes with that allowance listed. Testing never learns which Plan is which, or that the allowances are an Accept list. Change's `exceptions` input maps to `allowances`.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the kinds, identities, relationships, Runs, provenance rules, Test Data ownership, retirement, results and Plan evaluation of testing/F24–testing/F33 |
| Each product or Capability | its Strategies, Plans, Suites and Cases, the meaning of every subject its Cases test, its Test Data's content, its Runs, and which Runs it keeps |
| Data | how Runs and Test Data are managed as data: provenance and lifecycle mechanisms, including retention and disposal, and never what they mean |
| Change | FAR: which Plans it composes, and its Accept list |
| Engineering | which Plans a gate evaluates, and with what allowances, executed by Guard |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C14` PLAN, this Change | Testing | none |
| `testing/C15` DO: `kaal-testing/model`, its row in testing/A8's export inventory, TEST A FINDING as guidance, testing/T26–testing/T39 GREEN in Testing's `npm test` | Testing | `testing/C14` |
| `testing/C16` PLAN amendment of `testing/C4`: `observe`, `outcomes`, `compare` and `report` only (proposed on #385, comment 6489569322), handing outcomes over as Runs of this model | Testing | `testing/C14` |
| `change/C2` DO | Change | `testing/C15` |

## Road to kaal-testing 0.0.1

The Owner asked on this PR (comment 6502482109) for a bounded release path, analogous to Core's, Agents' and Change's, that keeps Testing's own semantics. It is planned here for coordination only. Nothing in it is authorized by this PLAN, and each step is its own PR, one at a time into `kaal/testing`.

**The consumer outcome.** A fresh consumer can do all of the following:
- install Testing;
- declare its own Strategies, Plans, Suites, Cases, Test Data and Runs;
- evaluate them, and interpret boundary verdicts;
- inspect results, provenance, allowances and findings;
- read what that evidence does and does not establish.

The quality bar is `@kaihacksai/kaal-guard`.

| # | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `testing/C19` PLAN amendment (#618): attested verdicts, and unreadable verdicts stay unknown | Testing | none |
| 2 | `testing/C12` DO (#617): `kaal-testing/boundary` | Testing | 1 |
| 3 | `testing/C14` PLAN (this PR): the model | Testing | none |
| 4 | `testing/C15` DO: `kaal-testing/model` | Testing | 3 |
| 5 | `testing/C16` PLAN amendment of `testing/C4`: observations handed over as Runs, through Testing's runner reporter, with the product mapping runner tests to its Case identities | Testing | 4 |
| 6 | `testing/C20` DO of `testing/C16` | Testing | 5 |
| 7 | `testing/C21` PLAN, the 0.0.1 consumer contract. It covers: the published name and the consumer surface; the publisher-only parts and why; Intent, Requirements, Architecture, limitations, installation, use and removal; the declared consumer Cases behind a fail-closed `test/verify.mjs`, as testing/F11–testing/F17 ask; and the planned acceptance scenarios against the packed artifact, including negative cases and the dependency boundary | Testing | 2, 4, 6 |
| 8 | `testing/C22` DO of `testing/C21`: consumer documents, the packaged verification and the package metadata | Testing | 7 |
| 9 | Release acceptance: Testing's scenarios run against one packed tarball in a clean consumer, plus the release workflow | Engineering, with Testing's scenarios | 8 |
| 10 | Collector freshness: a sync of `kaal/testing` from main, only with the Owner's alignment and the promotion slot | Coordinator, Testing | 9 |
| 11 | Promotion of `kaal/testing` to main | Testing | 10 |
| 12 | npm publication, authorized separately and in the Owner's hand | Engineering, the Owner | 11 |

**Cross-capability dependencies.** None moves semantic ownership.
- **Core.** Testing's Nodes are typed by Core's KAAL Capability and KAAL Skill, and Engineering's conformance (#607) checks them. kaal-core is not on npm, so in a consumer, admission stays unresolved, never GREEN. Testing needs no Core at runtime.
- **Change.** `change/C2` composes Plan Runs and evaluates with its Accept list as `allowances`, after `testing/C15`.
- **Guard.** Guard's consumer verification realizes testing/F11–testing/F17 and is the quality bar. Its evidence stays Guard's, and Testing depends on no Guard package.
- **Hosting.** `accept`, `coverage` and `contracts` run commands through Hosting, and kaal-hosting is not on npm. See decision 2.
- **Data.** It owns the lifecycle and provenance management of kept Runs and Test Data.
- **Engineering.** It owns release acceptance, gates, workflows and publication mechanics.

**Owner decisions** (`testing/C21` follows them):
1. The published name: `@kaihacksai/kaal-testing`, as Guard's, is proposed.
2. The consumer surface. Proposed: 0.0.1 publishes only the host-free modules (`model`, `boundary`, `attribution`, `inventory`, `report`) and Testing's Node and Skill, with no runtime dependency. The Hosting-based `acceptance`, `coverage` and `contracts` stay KAAL-internal, as testing/A14 already says, until kaal-hosting is published. The alternative is to wait for Hosting's own publication.
3. Core's 0.0.1 publication is not proposed as a prerequisite. Until then, admission is reported unresolved.

**What 0.0.1 can deliver now:** the model, Runs and evaluation; boundary interpretation; attribution, inventory and the reconciled report over data the caller gives; the Node and the Skill; the consumer verification of Testing itself.

**Future scope:**
- Hosting-based acceptance and coverage for consumers;
- the Boundary Test Plan (Owner review 6490993449 on #556);
- Case diagnostics G-D1 (#385);
- Sealing's realization B producing verdicts;
- model elements as Graph Nodes;
- runner adapters beyond `node:test`.
