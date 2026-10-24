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
| Intent | the outcomes guard/I1–guard/I6 hold for a user of Guard | PLAN | only a new PLAN Change |
| Requirements | each obligation guard/F1–guard/F18, guard/N1–guard/N9 holds | PLAN | only a new PLAN Change |
| Architecture | each element guard/A1–guard/A12 keeps its placement, ownership, boundaries and dependencies | PLAN | only a new PLAN Change |
| Code | the implementation, test first, as it turns the outer tests from RED to GREEN | DO | DO, freely |

PLAN establishes the outer three loops and their stable acceptance boundary. DO develops the Code tests. The loops are a concept, not four frameworks or pipelines: every test is a plain `node:test` file, and none needs Testing, Sealing or any other KAAL element.

## Traceability

Each identifier states its relationships where it is defined: a Requirement names its Intents in brackets, an Architecture element its Requirements, and each planned test, in its title, the I, F, N or A contracts it checks, for example `guard/T1 [guard/I2, guard/I3]`. References may be many-to-many. There is no separate traceability framework: the identifiers are the trace. These identifiers follow KAAL's FANATIC concept, which Guard uses and does not own.

Every identifier is written Capability-qualified, as `<capability>/<id>`, in definitions, relationships, tests and Change maps, including references within Guard: `guard/F27`, `guard/T58`, `core/T1`. Capability names are globally unique, and numbering is local per Capability and per type. The titles of the test files inside the acceptance boundary are qualified by a Change of their own, `guard/C22`, because the boundary changes only in a PLAN Change that travels alone. Until then, a bare identifier in a test title means Guard's. A Change (C) is KAAL's existing Change, carried on GitHub by a pull request, and its durable identity is `guard/C<number>`. Earlier labels (R1, K1–K6, B1–B7, and the hypotheses H1–H5) remain only as aliases ([Change](change.md#change-identities)). A Defect (D) traces only to the Test Case that proves it RED.

## Where the tests live

- **In the package**, `packages/kaal-guard/test/`, using only Node and Git: the outer tests for the packaged behaviour, in `test/acceptance/`, and the Code tests beside them, from DO. They ship with the package, so a consumer can run them.
- **In Engineering**, `engineering/guard/acceptance/`: the outer tests that only make sense in KAAL, namely KAAL's integration and External delivery. They may use any KAAL element.

## Planned outer tests

| Test | Checks | Loop | Where |
| --- | --- | --- | --- |
| guard/T1: one check gives the same verdict through the hook and through CI, for the same facts | guard/I2, guard/I3 | Intent | package |
| guard/T2: removing Guard leaves the repository's own tests intact | guard/I1 | Intent | package |
| guard/T3: an External delivery works in a fresh repository and leaves nothing from KAAL in it | guard/I6, guard/N5, guard/F8, guard/A10 | Intent | Engineering |
| guard/T4: the packed tarball alone runs `init`, a push, the `ci` subset, `upgrade` and `remove` in a fresh repository, and no other KAAL element appears | guard/I5 | Intent | package |
| guard/T5: KAAL's pre-push hook runs its local checks through Guard | guard/I4 | Intent | Engineering |
| guard/T6–guard/T24: one or more tests for each of guard/F1–guard/F10 | guard/F1–guard/F10 | Requirements | package |
| guard/T25–guard/T27: guard/N2, guard/N3, guard/N4 | guard/N2–guard/N4 | Requirements | package |
| guard/N1: guard/T1–guard/T31 pass on Linux, macOS and Windows | guard/N1 | Requirements | CI matrix, from guard/C1 |
| guard/T28: the runner knows nothing of the adapters or GitHub | guard/A3, guard/A7 | Architecture | package |
| guard/T29: nothing depends on an adapter | guard/A7 | Architecture | package |
| guard/T30: the package declares and imports no KAAL element and references no Engineering path | guard/A8, guard/N6 | Architecture | package |
| guard/T31: the acceptance boundary is closed: its files import only Node built-ins and files inside it | guard/A8, guard/N6 | Architecture | package |
| guard/T32: every KAAL check identity and OS matrix entry on `main` before migration is still present | guard/N7 | Requirements | Engineering |
| guard/T33–guard/T35: KAAL's `guard.json`, its Guard-run jobs and its `Guard` job | guard/A11 | Architecture | Engineering |

| guard/T36: a disposable KAAL clone installs the published `0.0.1` from the registry; its lockfile integrity equals the registry's; KAAL's own tree keeps `file:packages/kaal-guard`; `verify` passes and a local check gives KAAL's verdict | guard/I5, guard/F11, guard/N8, guard/N9, guard/A12 | Intent | Engineering |
| guard/T37: in the minimal repository, a dependency and lockfile change to the candidate, then `upgrade`, moves an unmodified managed asset forward and keeps a modified managed asset, a consumer-owned file and every entry of `checks`; in the clone, the same change alters no file | guard/I5, guard/F11, guard/F12 | Requirements | Engineering |
| guard/T38: a managed asset the candidate manages, missing from the minimal repository and not recorded in `guard.json`, is installed and recorded by `upgrade` | guard/F13 | Requirements | Engineering |
| guard/T39: after `upgrade` to the candidate, `guard.json` records the writing version and `upgrade` reported the versions it moved from and to | guard/F14 | Requirements | Engineering |
| guard/T40: the candidate reads a `guard.json` written by `0.0.1` with the same checks, verdicts and managed assets, or refuses it as cannot judge with a next step | guard/F15 | Requirements | Engineering |
| guard/T41: rollback from the candidate to `0.0.1`, then forward again, each through the dependency, the lockfile and `upgrade`, restores each unmodified managed asset in the minimal repository to that version's content, and leaves modified, consumer-owned and KAAL-owned files untouched | guard/I5, guard/F16 | Requirements | Engineering |
| guard/T42: a real `git push` in the clone runs KAAL's hook through the installed published Guard, and its verdicts equal `kaal-guard run --local` with the same facts | guard/I2, guard/I5, guard/A12 | Architecture | Engineering |
| guard/T43: `init` in the clone adds no workflow job that duplicates one of KAAL's, and none named like an existing job, and reports KAAL's integration as executed but not managed | guard/I5, guard/F17 | Requirements | Engineering |
| guard/T44: `init` then `remove` in the clone leaves `guard.json` byte for byte as KAAL wrote it | guard/I1, guard/F18 | Requirements | Engineering |

| guard/T45: the packed package carries `skills/kaal-guard/SKILL.md`, named `kaal-guard`, with BASS sections and no script, and names no consumer | guard/F19, guard/A13, guard/N11 | Requirements | package |
| guard/T46: `kaal-engineer-skill` finds no standard or KAAL violation in the Embed Skill or the External variant | guard/F19, guard/A13, guard/A16 | Architecture | Engineering |
| guard/T47: a failing and a cannot-judge local run keep their exit statuses, verdict lines and the check's own stdout and stderr byte for byte, and add exactly one reminder line naming an existing Skill path | guard/F21, guard/F22 | Requirements | package |
| guard/T48: a run of only pass, not applicable or held adds no reminder | guard/F21 | Requirements | package |
| guard/T49: with `--github`, fail and cannot-judge annotations and the step summary name the Skill path, and a passing run's summary does not | guard/F21, guard/A15 | Architecture | package |
| guard/T50: standalone `init` in a fresh repository installs the Skill only at `.agents/skills/kaal-guard/`, records every file under `managed` and `writers`, and equals the package's source | guard/F23, guard/F24, guard/N10 | Requirements | package |
| guard/T51: `init` keeps a pre-existing `.agents/skills/kaal-guard/SKILL.md`, reports it, and installs no other Skill file | guard/F23, guard/F8 | Requirements | package |
| guard/T52: `upgrade` moves unmodified Skill files forward and keeps a modified one; `remove` deletes only unmodified Skill files and the directories it emptied, and leaves other skills in `.agents/skills/` untouched | guard/F23, guard/F12 | Requirements | package |
| guard/T53: the standalone lifecycle writes no supplier-specific location (`.claude/skills/`, `.github/skills/` and the like), even where such directories exist, and its report names the canonical path | guard/F23, guard/N10, guard/N12 | Requirements | package |
| guard/T54: `init`, `upgrade` and `remove` create, edit and remove no `AGENTS.md`, `CLAUDE.md` or other instruction file; `init` reports the canonical path and how an agent reaches it, and proposes no supplier-specific pointer | guard/F26 | Requirements | package |
| guard/T55: a consumer of `0.0.1` moves to the candidate, runs `upgrade`, and gains the Skill at the canonical location | guard/I5, guard/F13, guard/F23, guard/A12 | Requirements | Engineering |
| guard/T57: a modified deployment is kept and reported while the others move forward, and `remove` leaves it | guard/F23, guard/F8 | Requirements | package |
| guard/T56: an External delivery writes the Skill variant at the canonical location and, where Core is used at delivery, where Core computes for the passed declaration; it names neither KAAL nor npm; its hook's reminder names the canonical path; a target's existing Skill and instruction files are untouched | guard/I6, guard/F25, guard/F26, guard/A16 | Requirements | Engineering |
| guard/T58: `contract.json` and the lifecycle agree: every asset and `guard.json` entry standalone `init` writes is in the contract, every one in the contract is written, and the contract names no supplier location beyond the canonical one | guard/F27, guard/A17 | Architecture | package |
| guard/T59: the package declares Node `>=24`; on an older Node every command exits as cannot judge, naming Node 24 as the next step, and the README states the prerequisite | guard/N1, guard/F27 | Requirements | package |

**Cross-Capability conformance.** Guard's instance is checked by Core's outer conformance Test Cases for the Installation Contract (`core/T1`…, defined in `core/C3`), executed by KAAL Engineering against `contract.json`, and, once Core realizes contracts, by realizing it through Core and then running Guard's standalone `upgrade` and `remove` on the result. Guard records its own evidence for them and does not copy their definitions. guard/T58 stays Guard's own: it checks that the instance and the lifecycle agree.

`verify` (guard/F10, guard/T24, guard/T35) checks static CI configuration coverage only: the workflow files name a job for every `ci` check. No test claims that GitHub ran a job or that branch protection requires it.

## RED evidence

A RED outer test is one of two kinds, and they are reported apart:

- **Blocked before behavioural assertion.** A prerequisite the behaviour needs is missing (no package to pack, no `guard.json`, no tooling), so the test stops before its behavioural assertions run. The test says `blocked before behavioural assertion: …`. Its planned assertions are kept as they are; nothing is implemented to turn it into another kind of RED.
- **Exercised behavioural RED.** The behavioural assertion runs and fails on what exists.

At guard/C0a, 32 of the 33 RED tests are blocked: guard/T1, guard/T2, guard/T4 and guard/T6–guard/T27 (25 package scenarios) stop at the missing package, guard/T28–guard/T30 at a missing package file, guard/T33–guard/T35 at KAAL's missing `guard.json`, and guard/T3 at the missing External tooling. One is an exercised behavioural RED: guard/T5, because KAAL's `.githooks/pre-push` does not run `kaal-guard run --local`. Two tests pass, because they guard what already exists: guard/T31, the closed acceptance boundary, and guard/T32, KAAL's check identities.

## Consumer upgrade

guard/T36–guard/T44 are written in K1 and implemented with the guard/A12 harness in K2, in `engineering/guard/acceptance/`. Each runs from `0.0.1` to a candidate. Its evidence names the candidate's source (guard/N9): `packed` is simulated, and only `registry` counts toward a Release. No test claims that KAAL's real GitHub CI or branch protection enforces a published version.

The suspicions behind guard/T38, guard/T39 and guard/T40 were read from the lifecycle's code, not established defects; K2 establishes or refutes each by its test. Those behind guard/T43 and guard/T44 come from an assessment of KAAL's adoption: `init` and `remove` were run once by hand in an isolated clone of `main` (`636abbd`) with the development package. `init` installed `.github/workflows/guard.yml` with a job named `Guard` and one job for each of KAAL's eight `ci` checks, named `Hosting`, `Workspaces`, `Branching` and so on. Those are the names of KAAL's existing jobs, so every check would run twice and two check runs would share each name. `remove` deleted the workflow but left `guard.json` reformatted. These are observations, not yet test evidence; K2 records them as guard/T43 and guard/T44. The evidence K2 is expected to record, against a `packed` candidate of today's package:

| Test | Intended evidence | Why |
| --- | --- | --- |
| guard/T36 | GREEN | it guards what `0.0.1` does |
| guard/T37 | GREEN | guard/F12 restates guard/F8, which `upgrade` already meets |
| guard/T38 | exercised behavioural RED | `upgrade` skips every asset `guard.json` does not record, so a deleted unrecorded workflow never returns |
| guard/T39 | exercised behavioural RED | `guard.json` records hashes, not the writing version, and `upgrade` reports no versions |
| guard/T40 | GREEN | the format of `guard.json` has not changed since `0.0.1`; GREEN refutes the suspicion and the test guards guard/F15 |
| guard/T41 | GREEN | rollback follows from guard/F12 for unmodified assets |
| guard/T42 | GREEN | KAAL's hook calls whichever Guard is installed |
| guard/T43 | exercised behavioural RED | observed: `init` judges existing files by path, not existing integration by declared check |
| guard/T44 | exercised behavioural RED | observed: Guard rewrites the whole of `guard.json` with its own formatting |

A test K2 finds otherwise is reported as found, not adjusted to this table. Only a Defect K2 establishes becomes a package Change (K3).

Recorded in K2b, against a `packed` candidate of the package at `kaal/guard` 16783c0, on Linux only (Node 22, npm 10, Git 2.43), by running `node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs` directly:

| Test | Recorded evidence | Suspicion |
| --- | --- | --- |
| guard/T36 | GREEN: the clone's lockfile holds the registry's integrity for `0.0.1` | |
| guard/T37 | GREEN | |
| guard/T38 | exercised behavioural RED: upgrade did not install a managed asset the consumer does not have | established: guard/D1 |
| guard/T39 | exercised behavioural RED: `guard.json` does not record the version that wrote its managed assets | established: guard/D2 |
| guard/T40 | GREEN | refuted |
| guard/T41 | GREEN | |
| guard/T42 | GREEN: the hook printed `pass: push: exit status 0`, the same line as `run --local` | |
| guard/T43 | exercised behavioural RED: `init` installed `.github/workflows/guard.yml` beside KAAL's workflows | established: guard/D3 |
| guard/T44 | exercised behavioural RED: Guard rewrote `guard.json` with its own formatting | established: guard/D4 |

This evidence is bounded:
- The `packed` candidate carries the same version and templates as `0.0.1`. guard/T37 and guard/T41 therefore show that the consumer's files are kept and that versions can be switched back and forth. They do not yet show an asset's content moving between versions; that needs a candidate whose templates differ.
- It is simulated (guard/N9). It was recorded on one OS, and it says nothing about KAAL's real GitHub enforcement.

## Defects

A suspected Defect (D) names an observed or suspected gap. It is established only by a Test Case (T) that proves the deviation as an exercised behavioural RED, and it traces to that T alone. The T keeps its own traces to I, F, N and A, and D does not repeat them. A GREEN test refutes the suspicion, and no D is recorded for it. When a corrective Change turns the T GREEN, the D is corrected. These records are Guard's own. Shared Defect semantics are outside Guard's scope.

These four are defects in behaviour the published `0.0.1` already ships, measured against guard/I5's consumer upgrade. None is a regression, because no published version met these obligations. None is an expected RED of planned implementation either, because no Change has implemented them yet.

| Defect | Traces to | Gap | Status |
| --- | --- | --- | --- |
| guard/D1 | guard/T38 | `upgrade` skips every asset `guard.json` does not record, so a managed asset the consumer lacks is never installed or recorded | established in K2b (`packed`, Linux) |
| guard/D2 | guard/T39 | `guard.json` does not record the version that wrote its managed assets, and `upgrade` names no versions | established in K2b (`packed`, Linux) |
| guard/D3 | guard/T43 | `init` judges existing files by path, not existing integration by declared check, so it adds a `guard.yml` that duplicates KAAL's jobs | established in K2b (`packed`, Linux) |
| guard/D4 | guard/T44 | Guard rewrites the whole of `guard.json` with its own formatting, so `init` then `remove` changes bytes the consumer wrote | established in K2b (`packed`, Linux) |

guard/T40's suspicion was refuted, so it has no D, and guard/T40 keeps guarding guard/F15. The titles of guard/T38–guard/T44 in `engineering/guard/acceptance/consumer/consumer.test.mjs` still carry the earlier labels H1–H5. They sit inside the acceptance boundary and are not changed here.

## Agent guidance

guard/T45–guard/T59 are planned in `guard/C12`. They are written as a PLAN Change of their own (`guard/C13`) before any code, and they are expected RED, blocked or exercised, as guard/C0a records. guard/T55 also needs K3b (guard/D1), because a `0.0.1` consumer gains the Skill only through `upgrade` installing assets it lacks. guard/T50, guard/T53 and guard/T56 show placement only. How a supplier's agent then reaches the Skill is observed by hand and labelled as an observation (guard/N9).

**Observation O1, Claude Code, recorded in `guard/C12`.** This was run with Claude Code 2.1.310 in headless mode (`claude -p`), with read-only tools. Each run used a scratch repository holding a minimal `kaal-guard` Skill at `.agents/skills/kaal-guard/`, and the Skill told the agent to begin its answer with a marker token. Each setup was asked twice what to do about a pasted `fail: unit` verdict:

| Setup | Followed the Skill | Listed among its skills |
| --- | --- | --- |
| no pointer and no reminder | 0 of 2 | — |
| `CLAUDE.md` holding `@AGENTS.md`, and `AGENTS.md` naming the Skill path | 2 of 2 | no |
| the verdict followed by a reminder line naming the path, with no pointer | 2 of 2 | — |
| a copy in `.claude/skills/kaal-guard/`, as a control | 2 of 2 | yes |

So instruction-based access, through the reminder or through a pointer, gives the behaviour guard/I7 needs when a verdict is shown. It is not native discovery: Claude Code neither lists the canonical Skill nor activates it unprompted, and `/kaal-guard` does not exist. That is the stated limit. The sample is small, uses one model and runs headless; it is evidence for the placement decision, not a guarantee. Codex and Copilot are expected to discover the Skill natively (guard/N10), and that is still to be observed by hand.

## Integrity of the outer contract

The boundary is fixed in PLAN, before DO, with plain Git.

- The effective boundary has two parts, `packages/kaal-guard/test/acceptance/` and `engineering/guard/acceptance/`, each with its tests, fixtures and helpers.
- A boundary check, `Guard Acceptance Boundary`, runs on every pull request into `kaal/guard`, from the target branch's version of itself. A DO Change that touches the boundary fails. A PLAN Change may touch only the boundary. It is guard/C0b, not part of this Change.
- kaal-sealing may later be added as an optional Engineering control over `engineering/guard/acceptance/`. It is never a prerequisite, and the package never uses it.

Who may land a PLAN Change is decided by the repository's review. GREEN means the planned cases passed within their coverage. It is bounded evidence, not proof of the Outcome.

## Running

The outer tests join a lane when Guard's code makes them executable. Until then they are run directly:

```sh
node --test packages/kaal-guard/test/acceptance/*.test.mjs engineering/guard/acceptance/*.test.mjs
```

The consumer upgrade tests need the npm registry and sit outside the required jobs. They are run directly, one at a time:

```sh
node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs
GUARD_CANDIDATE=registry:<version> node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs
```
