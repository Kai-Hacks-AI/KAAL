# Guard: Testing

Testing owns what evidence means. Guard follows the chain of its concerns: Intent says why, Requirements say what, Architecture says where, and Code says how. Each link has its own testing loop:

| Loop | Tests | Planned in | Changed in |
| --- | --- | --- | --- |
| Intent outcome validation | the outcomes O1–O6 hold for a user of Guard | PLAN | only a new PLAN Change |
| Requirements verification | each obligation G1–G10, N1–N7 holds | PLAN | only a new PLAN Change |
| Architecture conformance | each element A1–A11 keeps its placement, ownership, boundaries and dependencies | PLAN | only a new PLAN Change |
| Code implementation tests | the implementation's internal behaviour, test first | DO | DO, freely |

PLAN establishes the outer three loops and their stable acceptance boundary. DO develops the inner Code tests. The loops are a concept, not four frameworks or pipelines: every test is a plain `node:test` file, and none needs Testing, Sealing or any other KAAL element.

## Traceability

Requirements name the outcomes they serve; Architecture elements name the Requirements they serve; each planned test names, in its title, the identifiers it checks and, in brackets, what those trace to. References may be many-to-many. There is no separate traceability framework: the identifiers are the trace.

## Where the tests live

- **In the package**, `packages/kaal-guard/test/`, using only Node and Git: the outer tests for the packaged behaviour in `test/acceptance/`, and, from DO, the Code tests beside them. They ship with the package, so a consumer can run them.
- **In Engineering**, `engineering/guard/acceptance/`: the outer tests that only make sense in KAAL, namely KAAL's integration and External delivery. They may use any KAAL element.

## Planned outer tests

| Loop | Test | Traces to | Where |
| --- | --- | --- | --- |
| Intent | I1: one check gives the same verdict through the hook and through CI, for the same facts | O2, O3 | package |
| Intent | I2: removing Guard leaves the repository's own tests intact | O1 | package |
| Intent | I3: an External delivery works in a fresh repository and leaves nothing from KAAL in it (also verifies N5 and G8, and checks A10) | O6 | Engineering |
| Intent | I4: the packed tarball alone runs `init`, a push, the `ci` subset, `upgrade` and `remove` in a fresh repository, and no other KAAL element appears | O5 | package |
| Intent | I5: KAAL's pre-push hook runs its local checks through Guard | O4 | Engineering |
| Requirements | G1 to G10, N2 to N4, one or more tests each | as in [Requirements](requirements.md) | package |
| Requirements | N1: the package's outer tests pass on Linux, macOS and Windows | O4, O5 | CI matrix, from C1 |
| Requirements | N7: every KAAL check identity and OS matrix entry on `main` before migration is still present | O4 | Engineering |
| Architecture | A3, A7: the runner knows nothing of the adapters or GitHub; nothing depends on an adapter | G3, G6 | package |
| Architecture | A8: the package declares and imports no KAAL element and references no Engineering path (verifies N6) | N6 | package |
| Architecture | A8: the acceptance boundary is closed: its files import only Node built-ins and files inside it | N6 | package |
| Architecture | A11: KAAL's `guard.json`, its Guard-run jobs and its `Guard` job | N7, G5, G10 | Engineering |

`verify` (G10) checks static CI configuration coverage only: the workflow files name a job for every `ci` check. No test claims that GitHub ran a job or that branch protection requires it.

## RED evidence

A RED outer test is one of two kinds, and they are reported apart:

- **Blocked before behavioural assertion.** A prerequisite the behaviour needs is missing (no package to pack, no `guard.json`, no tooling), so the test stops before its behavioural assertions run. The test says `blocked before behavioural assertion: …`. Its planned assertions are kept as they are; nothing is implemented to turn it into another kind of RED.
- **Exercised behavioural RED.** The behavioural assertion runs and fails on what exists.

At C0a, 32 of the 33 RED tests are blocked: 25 package scenarios stop at the missing package, 3 Architecture tests at a missing package file, 3 KAAL tests at the missing `guard.json`, and the External test at the missing tooling. One is an exercised behavioural RED: KAAL's `.githooks/pre-push` does not run `kaal-guard run --local`. Two tests pass, because they guard what already exists: the closed acceptance boundary (A8) and KAAL's check identities (N7).

## Integrity of the outer contract

The boundary is fixed in PLAN, before DO, with plain Git.

- The effective boundary has two parts, `packages/kaal-guard/test/acceptance/` and `engineering/guard/acceptance/`, each with its tests, fixtures and helpers.
- A boundary check, `Guard Acceptance Boundary`, runs on every pull request into `kaal/guard`, from the target branch's version of itself. A DO Change that touches the boundary fails. A PLAN Change may touch only the boundary. It is C0b, not part of this Change.
- kaal-sealing may later be added as an optional Engineering control over `engineering/guard/acceptance/`. It is never a prerequisite, and the package never uses it.

Who may land a PLAN Change is decided by the repository's review. GREEN means the planned cases passed within their coverage. It is bounded evidence, not proof of the Outcome.

## Running

The outer tests join a lane when Guard's code makes them executable. Until then they are run directly:

```sh
node --test packages/kaal-guard/test/acceptance/*.test.mjs engineering/guard/acceptance/*.test.mjs
```
