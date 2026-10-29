# Testing Model: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A12** [testing/N7, testing/N8, testing/F24–testing/F29]: `kaal-testing/model` is one module, `lib/model.mjs`, exporting:
  - `check(model)`, the findings;
  - `tested(model)`, the derived view from subject to the Cases that test it;
  - `results(model, observed)`, each Case's, Suite's and Plan's result;
  - `evaluate(model, observed, plan, { allowances })`.

  `observed` maps a Case's identity to `passed`, `failed`, `skipped` or `todo`, as `testing/C4`'s outcomes give them. It is the observation of **one** Run: `results` and `evaluate` say what that Run shows about the definitions, and neither keeps it. The module imports nothing, not even Testing's own modules, and names no other Capability's kind and no FAR role.
- **testing/A13** [testing/F25]: **A model is given, never discovered.** Strategies, Plans, Suites and Cases are product-owned data that the caller hands in. Testing keeps no registry, reads no path and names no file in which a product keeps them. A Change's `plan/<topic>/testing.md` stays a document for people.
- **testing/A14** [testing/N8]: **A standalone package, later.** Because the model needs no host and no other Capability, it can ship in a dependency-free package that consumers use to declare and evaluate their own Plans. This is the direction of the research thread's option 2. Packaging and publication are a separate Change, not this one, and Hosting-based `accept` and coverage stay KAAL-internal.

## How FAR uses it, with no FAR in Testing

Change composes two ordinary Plans (`change/C2`, #558). It evaluates the Features Plan with no allowances, and the Regression Plan with its Accept list as `allowances`. An accepted Case stays `failed`, and the Regression Plan passes with that allowance listed. Testing never learns which Plan is which, or that the allowances are an Accept list. Change's `exceptions` input maps to `allowances`.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the kinds, identities, relationships, results and Plan evaluation of testing/F24–testing/F29 |
| Each product or Capability | its Strategies, Plans, Suites and Cases, and the meaning of every subject its Cases test |
| Change | FAR: which Plans it composes, and its Accept list |
| Engineering | which Plans a gate evaluates, and with what allowances, executed by Guard |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C14` PLAN, this Change | Testing | none |
| `testing/C15` DO: `kaal-testing/model`, TEST A FINDING as guidance, testing/T26–testing/T35 GREEN in Testing's `npm test` | Testing | `testing/C14` |
| `testing/C16` PLAN amendment of `testing/C4`: `observe`, `outcomes`, `compare` and `report` only (proposed on #385, comment 6489569322) | Testing | `testing/C14` |
| `testing/C18` PLAN: Runs and Test Data. Plans, Suites and Cases each run 0..n times; a Plan Run may encompass Suite Runs and a Suite Run Case Runs, and a Case may run directly. A Run is distinct from its definition and holds its Case Results, with the provenance to identify the exact definitions, versions and effective data it executed. Retention is the context's decision. Test Data is defined at Plan, Suite or Case level, owned by its defining context and distinct from its reuse, and may be external. A retired Case stays provenance and is no longer executable. (Owner alignment on #583, comment 6495452330.) | Testing | `testing/C14` |
| `change/C2` DO | Change | `testing/C15` |
