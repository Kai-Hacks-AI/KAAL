# Consumer Verification: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A8** [testing/N5, testing/F11–testing/F17]: Testing ships text only.
  - **The Node.** `payload/Testing.md` gains `## Consumer verification`, holding the statements of testing/F11 to testing/F17 verbatim.
  - **The Skill.** `skills/kaal-testing/SKILL.md` gains `## Making a product verifiable by its consumers`. It tells an Agent how to apply the section, and points to the Node for what it means.
  - **The README.** It summarizes the section.
  - **No mechanism.** kaal-testing gains no export, no module and no dependency. A product realizes the contract in its own code and cites these ids, so it depends on no Testing package. A reusable mechanism, such as an entry point delivered by Testing, is a later Change once kaal-testing is published.
  - **The export inventory.** Every kaal-testing export is declared below with the contract it serves and its owning Change. A Change that adds an export adds its row, and only a row may say an export serves consumer verification. None does: a row that did would be a new mechanism, which needs its own PLAN (`testing/C17`).

    | Export | Serves | Owning Change | Consumer verification |
    | --- | --- | --- | --- |
    | `./acceptance` | capability acceptance: the producer runs its scenarios against its own packed bytes before release | Testing | no |
    | `./boundary` | PLAN boundary integrity: interpreting a realization's verdict on one concern owner's declaration | `testing/C12` | no |
    | `./attribution` | CASE-owned file attribution | Testing | no |
    | `./contracts` | contract evidence of a capability's mapping | Testing | no |
    | `./coverage` | execution and evidence of a capability's own tests | Testing | no |
    | `./inventory` | non-blank text lines of the listed files | Testing | no |
    | `./model` | the Testing model: Strategies, Plans, Suites, Cases, Test Data and Runs, their results and Plan evaluation | `testing/C15` | no |
    | `./package.json` | the package manifest | Testing | no |
    | `./redesign` | recurring timing signals and independent Case-preservation evidence | `testing/C53` | no |
    | `./report` | the reconciled package and ownership report | Testing | no |
    | `./timing` | given-duration concentration, outlier and platform-skew evidence | testing/C47 | no |
    | `./verifiers` | the shared observable result contract for consumer verifiers: its scenarios, `observe` and `judge` | `testing/C30` | no |
- **testing/A9** [testing/F12, testing/F13]: **npm, the first realization.** Testing records it here without making it the definition.
  - **The entry point.** `npm explore <package> -- npm test` runs the installed package's own `test` script. The product's script runs one small entry file of its own.
  - **Exit statuses.** The recommended statuses are 0 for verified, 1 for failed and 2 for unknown. The summary is one machine-readable line.
  - **Why the runner alone is not enough.** These are the facts that make an entry file necessary, observed on Node v24.22.1 from an unrelated consumer:
    - `node --test` given a glob under `node_modules` finds 0 tests and exits 0;
    - given a relative path there, it reports "Could not find" and exits 1, the same as a failure;
    - a skipped case still exits 0;
    - under `npm explore`, both the working directory and `INIT_CWD` are the package's own directory.
  - **The byte identity.** npm records it in `node_modules/.package-lock.json` as `integrity`. Under another package manager it stays unknown.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | the semantics of testing/F11 to testing/F17 |
| Each product | its delivered cases, their expectations and acceptance criteria, the declaration of which cases it delivers, its entry point, its preconditions, and its realization of the results |
| Engineering | when verification runs, what it gates, release acceptance against the registry, and publishing |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C9` PLAN, this Change | Testing | none |
| `testing/C10` DO: the Node section, the Skill section and the README | Testing | `testing/C9` |
| Guard's 0.0.4 PLAN, realizing these semantics for `@kaihacksai/kaal-guard` | Guard (Engineering) | `testing/C9` |

The following are referenced and not changed:
- `testing/C4` (#385), RED evidence and FAR;
- C-T1 (#282);
- `testing/C7` and `testing/C8`.
