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
| `testing/C15` DO: `kaal-testing/model`, TEST A FINDING as guidance, testing/T26–testing/T35 GREEN in Testing's `npm test` | Testing | `testing/C14` |
| `testing/C16` PLAN amendment of `testing/C4`: `observe`, `outcomes`, `compare` and `report` only (proposed on #385, comment 6489569322), handing outcomes over as Runs of this model | Testing | `testing/C14` |
| `change/C2` DO | Change | `testing/C15` |
