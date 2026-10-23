# Guard: Testing

Testing owns what evidence means. Guard's concerns form a chain: Intent says why (I…), Requirements say what, as Functional (F…) and Nonfunctional (N…) obligations, Architecture says where (A…), and Code says how (C…). Tests (T…) trace back to the concerns they check. They do not form a rigid linear pipeline: one test may check several concerns.

| Loop | Checks | Planned in | Changed in |
| --- | --- | --- | --- |
| Intent | the outcomes I1–I6 hold for a user of Guard | PLAN | only a new PLAN Change |
| Requirements | each obligation F1–F10, N1–N7 holds | PLAN | only a new PLAN Change |
| Architecture | each element A1–A11 keeps its placement, ownership, boundaries and dependencies | PLAN | only a new PLAN Change |
| Code | each Code element C1–C8 behaves as built, test first | DO | DO, freely |

PLAN establishes the outer three loops and their stable acceptance boundary. DO develops the Code tests. The loops are a concept, not four frameworks or pipelines: every test is a plain `node:test` file, and none needs Testing, Sealing or any other KAAL element.

## Traceability

Functional and Nonfunctional Requirements name the Intent outcomes they serve. Architecture elements name the Requirements they serve. Code elements name the Architecture elements they realize. Each planned test is titled with its `T` identifier and, in brackets, the I, F, N or A identifiers it checks, for example `T1 [I2, I3]`. References may be many-to-many. There is no separate traceability framework: the identifiers are the trace. Together, the identifiers spell FANATIC: Functional And Nonfunctional Architecture Tests Intended Code.

Change identifiers are `CH…`, never `C…`. CH0a is the Change the Owner authorized as C0a.

## Where the tests live

- **In the package**, `packages/kaal-guard/test/`, using only Node and Git: the outer tests for the packaged behaviour, in `test/acceptance/`, and the Code tests beside them, from DO. They ship with the package, so a consumer can run them.
- **In Engineering**, `engineering/guard/acceptance/`: the outer tests that only make sense in KAAL, namely KAAL's integration and External delivery. They may use any KAAL element.

## Planned outer tests

| Test | Checks | Loop | Where |
| --- | --- | --- | --- |
| T1: one check gives the same verdict through the hook and through CI, for the same facts | I2, I3 | Intent | package |
| T2: removing Guard leaves the repository's own tests intact | I1 | Intent | package |
| T3: an External delivery works in a fresh repository and leaves nothing from KAAL in it | I6, N5, F8, A10 | Intent | Engineering |
| T4: the packed tarball alone runs `init`, a push, the `ci` subset, `upgrade` and `remove` in a fresh repository, and no other KAAL element appears | I5 | Intent | package |
| T5: KAAL's pre-push hook runs its local checks through Guard | I4 | Intent | Engineering |
| T6–T24: one or more tests for each of F1–F10 | F1–F10 | Requirements | package |
| T25–T27: N2, N3, N4 | N2–N4 | Requirements | package |
| N1: T1–T31 pass on Linux, macOS and Windows | N1 | Requirements | CI matrix, from CH1 |
| T28: the runner knows nothing of the adapters or GitHub | A3, A7 | Architecture | package |
| T29: nothing depends on an adapter | A7 | Architecture | package |
| T30: the package declares and imports no KAAL element and references no Engineering path | A8, N6 | Architecture | package |
| T31: the acceptance boundary is closed: its files import only Node built-ins and files inside it | A8, N6 | Architecture | package |
| T32: every KAAL check identity and OS matrix entry on `main` before migration is still present | N7 | Requirements | Engineering |
| T33–T35: KAAL's `guard.json`, its Guard-run jobs and its `Guard` job | A11 | Architecture | Engineering |

`verify` (F10, T24, T35) checks static CI configuration coverage only: the workflow files name a job for every `ci` check. No test claims that GitHub ran a job or that branch protection requires it.

## RED evidence

A RED outer test is one of two kinds, and they are reported apart:

- **Blocked before behavioural assertion.** A prerequisite the behaviour needs is missing (no package to pack, no `guard.json`, no tooling), so the test stops before its behavioural assertions run. The test says `blocked before behavioural assertion: …`. Its planned assertions are kept as they are; nothing is implemented to turn it into another kind of RED.
- **Exercised behavioural RED.** The behavioural assertion runs and fails on what exists.

At CH0a, 32 of the 33 RED tests are blocked: T1, T2, T4 and T6–T27 (25 package scenarios) stop at the missing package, T28–T30 at a missing package file, T33–T35 at KAAL's missing `guard.json`, and T3 at the missing External tooling. One is an exercised behavioural RED: T5, because KAAL's `.githooks/pre-push` does not run `kaal-guard run --local`. Two tests pass, because they guard what already exists: T31, the closed acceptance boundary, and T32, KAAL's check identities.

## Integrity of the outer contract

The boundary is fixed in PLAN, before DO, with plain Git.

- The effective boundary has two parts, `packages/kaal-guard/test/acceptance/` and `engineering/guard/acceptance/`, each with its tests, fixtures and helpers.
- A boundary check, `Guard Acceptance Boundary`, runs on every pull request into `kaal/guard`, from the target branch's version of itself. A DO Change that touches the boundary fails. A PLAN Change may touch only the boundary. It is CH0b, not part of this Change.
- kaal-sealing may later be added as an optional Engineering control over `engineering/guard/acceptance/`. It is never a prerequisite, and the package never uses it.

Who may land a PLAN Change is decided by the repository's review. GREEN means the planned cases passed within their coverage. It is bounded evidence, not proof of the Outcome.

## Running

The outer tests join a lane when Guard's code makes them executable. Until then they are run directly:

```sh
node --test packages/kaal-guard/test/acceptance/*.test.mjs engineering/guard/acceptance/*.test.mjs
```
