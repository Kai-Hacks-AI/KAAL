# Guard: Testing

Testing owns what evidence means. Guard's documents are written outside-in: Intent first, the *why* (I…); then the Requirements, the *what*, as Functional (F…) and Nonfunctional (N…) obligations, each tracing to the Intent it serves; then Architecture, the *where* (A…), each element tracing to the Requirements it answers. The planned tests follow from these documents in PLAN. Code, the *how*, is written in DO to turn those tests from RED to GREEN.

The relationships are exactly these, and no others:

- F and N → I: each Requirement traces to the Intent it serves.
- A → F and N: each Architecture element traces to the Requirements it answers.
- T → I, F, N or A: each test names the contracts it validates or verifies. Tests are not children of Architecture: they answer each of the three outer concerns on their own terms.
- Code → the tests it turns from RED to GREEN, with inner Code tests that evolve in DO. Code has no structural trace to Architecture.
- C → zero or more I: a Change carries Intents, and nothing else is linked to it.

There is no tree beyond these links and no cardinality beyond what each states.

| Loop | Checks | Planned in | Changed in |
| --- | --- | --- | --- |
| Intent | the outcomes I1–I6 hold for a user of Guard | PLAN | only a new PLAN Change |
| Requirements | each obligation F1–F18, N1–N9 holds | PLAN | only a new PLAN Change |
| Architecture | each element A1–A12 keeps its placement, ownership, boundaries and dependencies | PLAN | only a new PLAN Change |
| Code | the implementation, test first, as it turns the outer tests from RED to GREEN | DO | DO, freely |

PLAN establishes the outer three loops and their stable acceptance boundary. DO develops the Code tests. The loops are a concept, not four frameworks or pipelines: every test is a plain `node:test` file, and none needs Testing, Sealing or any other KAAL element.

## Traceability

Each identifier states its relationships where it is defined: a Requirement names its Intents in brackets, an Architecture element its Requirements, and each planned test, in its title, the I, F, N or A contracts it checks, for example `T1 [I2, I3]`. References may be many-to-many. There is no separate traceability framework: the identifiers are the trace. A Change (`C…`) is KAAL's existing Change, carried on GitHub by a pull request. These identifiers follow KAAL's FANATIC concept, which Guard uses and does not own.

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
| N1: T1–T31 pass on Linux, macOS and Windows | N1 | Requirements | CI matrix, from C1 |
| T28: the runner knows nothing of the adapters or GitHub | A3, A7 | Architecture | package |
| T29: nothing depends on an adapter | A7 | Architecture | package |
| T30: the package declares and imports no KAAL element and references no Engineering path | A8, N6 | Architecture | package |
| T31: the acceptance boundary is closed: its files import only Node built-ins and files inside it | A8, N6 | Architecture | package |
| T32: every KAAL check identity and OS matrix entry on `main` before migration is still present | N7 | Requirements | Engineering |
| T33–T35: KAAL's `guard.json`, its Guard-run jobs and its `Guard` job | A11 | Architecture | Engineering |

| T36: a disposable KAAL clone installs the published `0.0.1` from the registry; its lockfile integrity equals the registry's; KAAL's own tree keeps `file:packages/kaal-guard`; `verify` passes and a local check gives KAAL's verdict | I5, F11, N8, N9, A12 | Intent | Engineering |
| T37: in the minimal repository, a dependency and lockfile change to the candidate, then `upgrade`, moves an unmodified managed asset forward and keeps a modified managed asset, a consumer-owned file and every entry of `checks`; in the clone, the same change alters no file | I5, F11, F12 | Requirements | Engineering |
| T38 (H1): a managed asset the candidate manages, missing from the minimal repository and not recorded in `guard.json`, is installed and recorded by `upgrade` | F13 | Requirements | Engineering |
| T39 (H2): after `upgrade` to the candidate, `guard.json` records the writing version and `upgrade` reported the versions it moved from and to | F14 | Requirements | Engineering |
| T40 (H3): the candidate reads a `guard.json` written by `0.0.1` with the same checks, verdicts and managed assets, or refuses it as cannot judge with a next step | F15 | Requirements | Engineering |
| T41: rollback from the candidate to `0.0.1`, then forward again, each through the dependency, the lockfile and `upgrade`, restores each unmodified managed asset in the minimal repository to that version's content, and leaves modified, consumer-owned and KAAL-owned files untouched | I5, F16 | Requirements | Engineering |
| T42: a real `git push` in the clone runs KAAL's hook through the installed published Guard, and its verdicts equal `kaal-guard run --local` with the same facts | I2, I5, A12 | Architecture | Engineering |
| T43 (H4): `init` in the clone adds no workflow job that duplicates one of KAAL's, and none named like an existing job, and reports KAAL's integration as executed but not managed | I5, F17 | Requirements | Engineering |
| T44 (H5): `init` then `remove` in the clone leaves `guard.json` byte for byte as KAAL wrote it | I1, F18 | Requirements | Engineering |

`verify` (F10, T24, T35) checks static CI configuration coverage only: the workflow files name a job for every `ci` check. No test claims that GitHub ran a job or that branch protection requires it.

## RED evidence

A RED outer test is one of two kinds, and they are reported apart:

- **Blocked before behavioural assertion.** A prerequisite the behaviour needs is missing (no package to pack, no `guard.json`, no tooling), so the test stops before its behavioural assertions run. The test says `blocked before behavioural assertion: …`. Its planned assertions are kept as they are; nothing is implemented to turn it into another kind of RED.
- **Exercised behavioural RED.** The behavioural assertion runs and fails on what exists.

At C0a, 32 of the 33 RED tests are blocked: T1, T2, T4 and T6–T27 (25 package scenarios) stop at the missing package, T28–T30 at a missing package file, T33–T35 at KAAL's missing `guard.json`, and T3 at the missing External tooling. One is an exercised behavioural RED: T5, because KAAL's `.githooks/pre-push` does not run `kaal-guard run --local`. Two tests pass, because they guard what already exists: T31, the closed acceptance boundary, and T32, KAAL's check identities.

## Consumer upgrade

T36–T44 are written in K1 and implemented with the A12 harness in K2, in `engineering/guard/acceptance/`. Each runs from `0.0.1` to a candidate. Its evidence names the candidate's source (N9): `packed` is simulated, and only `registry` counts toward a Release. No test claims that KAAL's real GitHub CI or branch protection enforces a published version.

H1, H2 and H3 are hypotheses read from the lifecycle's code, not established defects; K2 demonstrates or refutes each. H4 and H5 come from an assessment of KAAL's adoption: `init` and `remove` were run once by hand in an isolated clone of `main` (`636abbd`) with the development package. `init` installed `.github/workflows/guard.yml` with a job named `Guard` and one job for each of KAAL's eight `ci` checks, named `Hosting`, `Workspaces`, `Branching` and so on. Those are the names of KAAL's existing jobs, so every check would run twice and two check runs would share each name. `remove` deleted the workflow but left `guard.json` reformatted. These are observations, not yet test evidence; K2 records them as T43 and T44. The evidence K2 is expected to record, against a `packed` candidate of today's package:

| Test | Intended evidence | Why |
| --- | --- | --- |
| T36 | GREEN | it guards what `0.0.1` does |
| T37 | GREEN | F12 restates F8, which `upgrade` already meets |
| T38 (H1) | exercised behavioural RED | `upgrade` skips every asset `guard.json` does not record, so a deleted unrecorded workflow never returns |
| T39 (H2) | exercised behavioural RED | `guard.json` records hashes, not the writing version, and `upgrade` reports no versions |
| T40 (H3) | GREEN | the format of `guard.json` has not changed since `0.0.1`; GREEN means H3 is not a defect and the test guards F15 |
| T41 | GREEN | rollback follows from F12 for unmodified assets |
| T42 | GREEN | KAAL's hook calls whichever Guard is installed |
| T43 (H4) | exercised behavioural RED | observed: `init` judges existing files by path, not existing integration by declared check |
| T44 (H5) | exercised behavioural RED | observed: Guard rewrites the whole of `guard.json` with its own formatting |

A test K2 finds otherwise is reported as found, not adjusted to this table. Only a hypothesis K2 demonstrates becomes a package Change (K3).

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
