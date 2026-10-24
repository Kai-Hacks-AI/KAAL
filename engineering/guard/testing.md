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
| guard/T37: in the minimal repository, a dependency and lockfile change to the candidate, then `upgrade`, moves an unmodified managed asset forward and keeps a modified managed asset, a consumer-owned file and every entry of `checks`; in the clone, the same change alters no file. Superseded by guard/T65 in `guard/C23` | guard/I5, guard/F11, guard/F12 | Requirements | Engineering |
| guard/T38: a managed asset the candidate manages, missing from the minimal repository and not recorded in `guard.json`, is installed and recorded by `upgrade`. Superseded by guard/T66 in `guard/C23` | guard/F13 | Requirements | Engineering |
| guard/T39: after `upgrade` to the candidate, `guard.json` records the writing version and `upgrade` reported the versions it moved from and to. Superseded by guard/T67 in `guard/C23` | guard/F14 | Requirements | Engineering |
| guard/T40: the candidate reads a `guard.json` written by `0.0.1` with the same checks, verdicts and managed assets, or refuses it as cannot judge with a next step | guard/F15 | Requirements | Engineering |
| guard/T41: rollback from the candidate to `0.0.1`, then forward again, each through the dependency, the lockfile and `upgrade`, restores each unmodified managed asset in the minimal repository to that version's content, and leaves modified, consumer-owned and KAAL-owned files untouched. Superseded by guard/T68 in `guard/C23` | guard/I5, guard/F16 | Requirements | Engineering |
| guard/T42: a real `git push` in the clone runs KAAL's hook through the installed published Guard, and its verdicts equal `kaal-guard run --local` with the same facts | guard/I2, guard/I5, guard/A12 | Architecture | Engineering |
| guard/T43: `init` in the clone adds no workflow job that duplicates one of KAAL's, and none named like an existing job, and reports KAAL's integration as executed but not managed | guard/I5, guard/F17 | Requirements | Engineering |
| guard/T44: `init` then `remove` in the clone leaves `guard.json` byte for byte as KAAL wrote it. Retracted with guard/D4 in `guard/C23`; superseded by guard/T64 and retired from the boundary in `guard/C24` | guard/I1, guard/F18 (superseded wording) | Requirements | Engineering |
| guard/T61: a check declared as `.kaal/config/guard/<name>.md` runs with the meaning of its frontmatter, and changing only its body changes no verdict and no order | guard/F1, guard/A1 | Requirements | package |
| guard/T62: a member the schema does not define, a wrong type or a frontmatter outside guard/F1's subset, in a declaration or in Guard's checkout state, is cannot judge for `run`, `verify`, `init`, `upgrade` and `remove`. The diagnostic names the file, the member, the rule and the nearest defined member, and nothing is written | guard/F18, guard/F10, guard/N4 | Requirements | package |
| guard/T63: the hook and workflow Guard writes pass `--config .kaal/config/guard`; without `--config`, `run --check` started in a subdirectory resolves the same declarations from the repository's top level; the hook and CI select from the same effective declarations; with no directory it is cannot judge naming `kaal-guard init` | guard/F28 | Requirements | package |
| guard/T64: `init` then `remove` in the clone and in the minimal repository leaves every declaration byte for byte as written; Guard writes only its managed assets, each byte-identical to catalogued content, its installation record and its checkout state | guard/I1, guard/F18, guard/F29 | Requirements | Engineering |
| guard/T65: between two `packed` candidates of the planned configuration, in the minimal repository, a dependency and lockfile change, then `upgrade`, moves an unmodified managed asset forward and keeps a modified one, a consumer-owned file and every declaration | guard/I5, guard/F11, guard/F12 | Requirements | Engineering |
| guard/T66: between two candidates, a managed asset the newer one manages, missing from the repository, is installed by `upgrade`, and only for a surface the consumer activated; `upgrade` activates none. Corrected in `guard/C35` to the hook, because `upgrade` never installs Guard's workflow (guard/F17), and to the activated surface (guard/F30) | guard/F13, guard/F30 | Requirements | Engineering |
| guard/T67: between two candidates, the installation record registers each unmodified asset's new version and hash, `upgrade` reports the versions it moved between, and a modified asset is reported as modified and kept with its registered version | guard/F14 | Requirements | Engineering |
| guard/T68: between two candidates, back and forward again, each unmodified managed asset returns to that version's content, and modified, consumer-owned and declaration files are untouched | guard/I5, guard/F16 | Requirements | Engineering |
| guard/T69: shared configuration. Without `extensions.worktreeConfig`, `init` in a linked worktree, whose `.git` is a file, sets `core.hooksPath` in the shared scope and records the state under `git rev-parse --git-common-dir`; `remove` in the main checkout unsets it | guard/F29, guard/F8 | Requirements | package |
| guard/T70: in a fresh clone of a repository Guard set up, `upgrade` and `remove` judge each managed asset by the tracked installation record alone; `remove` deletes the unmodified ones, keeps a modified one, and leaves a `core.hooksPath` Guard did not set in that clone | guard/F29, guard/F8, guard/F12 | Requirements | package |
| guard/T71: worktree configuration. With `extensions.worktreeConfig`, `init` in a linked worktree sets `core.hooksPath` only for that worktree and records the state under `git rev-parse --git-path`; the main checkout sees no `core.hooksPath` and its `remove` leaves the worktree's alone; `remove` in that worktree unsets it | guard/F29, guard/F8 | Requirements | package |
| guard/T72: every asset `init` and `upgrade` install is byte-identical to its catalogued content and valid in its format: the hook starts with its shebang and is executable and runs; the workflow parses as YAML; `SKILL.md` begins with frontmatter that holds the standard's `name` and `description` | guard/F29, guard/F8, guard/F19 | Requirements | package |
| guard/T73: a file at a managed path whose bytes equal a published content but which the installation record does not register is not Guard's: `upgrade` and `remove` leave it and report it; a registered asset that is missing or changed is reported and not re-registered | guard/F29, guard/F8 | Requirements | package |
| guard/T74: without `--hook` or `--ci`, `init` activates neither integration: no workflow, no hook, no `core.hooksPath`; it reports each `ci` check no workflow job declares as missing coverage, with the step to add and `init --ci`; `verify` fails on it with the same next step. Added in `guard/C35` | guard/F17, guard/F10, guard/F30, guard/N4 | Requirements | package |
| guard/T75: `init --ci` installs Guard's workflow, which runs `verify` and `kaal-guard run --ci`, where no workflow declares a check; where a workflow of the consumer's declares a check or the consistency check, it installs no workflow, reports what it found and changes none of the consumer's workflows. Added in `guard/C35` | guard/F17, guard/F8 | Requirements | package |
| guard/T76: `init` prepares `.kaal/config/guard/` and the installation record and activates nothing: no hook, no `core.hooksPath`, no workflow. It names `init --hook` and `init --ci`, and a second `init` changes nothing. Added in `guard/C35` | guard/F30, guard/N4 | Requirements | package |
| guard/T77: `init --hook` and `init --ci` each activate one surface and neither implies the other; repeating either changes nothing. `run --hook` runs the `hook` checks, `run --ci` the `ci` checks and `run --check <name>` one check, whatever its `runs`. Added in `guard/C35` | guard/F30, guard/F4, guard/F17 | Requirements | package |
| guard/T79: `outcomes: {"4": held}` makes exit status 4 held, as before; `outcomes: {4: held}` is cannot judge for `run` and `verify`, naming the declaration, `outcomes` and `{"4": held}`, and runs nothing. Added in `guard/C38` | guard/F1, guard/F2, guard/F18 | Requirements | package |
| guard/T81: a trusted checker Git records as executable keeps that mode in its base copy, so a check whose command is `./checks/judge.sh`, with `trusted: checks/judge.sh`, passes on the base's verdict instead of cannot judge. On Windows, which has no executable bit, the check runs the base copy through `sh` and passes. Added in `guard/C40` | guard/F7 | Requirements | package |
| guard/T80: every key in the frontmatter of KAAL's own declarations is a string to YAML 1.2's core schema: each `outcomes` status is double-quoted. Added in `guard/C38` | guard/F1, guard/A11 | Architecture | Engineering |
| guard/T78: `remove --ci` undoes CI only, `remove --hook` the hook only, and `remove` the rest; none touches a declaration or a Test Case. `runs: [local]` is cannot judge, naming `hook`, and `run --local` is cannot judge, naming `--hook`. Added in `guard/C35` | guard/F30, guard/F18, guard/N4 | Requirements | package |

| guard/T45: the packed package carries `skills/kaal-guard/SKILL.md`, named `kaal-guard`, with BASS sections and no script, and names no consumer | guard/F19, guard/A13, guard/N11 | Requirements | package |
| guard/T46: `kaal-engineer-skill` finds no standard or KAAL violation in the Embed Skill or the External variant | guard/F19, guard/A13, guard/A16 | Architecture | Engineering |
| guard/T47: a failing and a cannot-judge local run keep their exit statuses, verdict lines and the check's own stdout and stderr byte for byte, and add exactly one reminder line naming an existing Skill path | guard/F21, guard/F22 | Requirements | package |
| guard/T48: a run of only pass, not applicable or held adds no reminder | guard/F21 | Requirements | package |
| guard/T49: with `--github`, fail and cannot-judge annotations and the step summary name the Skill path, and a passing run's summary does not | guard/F21, guard/A15 | Architecture | package |
| guard/T50: standalone `init` in a fresh repository installs the Skill only at `.agents/skills/kaal-guard/`, installs every file byte-identical to its catalogued content (restated in `guard/C23`), and equals the package's source | guard/F23, guard/F24, guard/N10 | Requirements | package |
| guard/T51: `init` keeps a pre-existing `.agents/skills/kaal-guard/SKILL.md`, reports it, and installs no other Skill file | guard/F23, guard/F8 | Requirements | package |
| guard/T52: `upgrade` moves unmodified Skill files forward and keeps a modified one; `remove` deletes only unmodified Skill files and the directories it emptied, and leaves other skills in `.agents/skills/` untouched | guard/F23, guard/F12 | Requirements | package |
| guard/T53: the standalone lifecycle writes no supplier-specific location (`.claude/skills/`, `.github/skills/` and the like), even where such directories exist, and its report names the canonical path | guard/F23, guard/N10, guard/N12 | Requirements | package |
| guard/T54: `init`, `upgrade` and `remove` create, edit and remove no `AGENTS.md`, `CLAUDE.md` or other instruction file; `init` reports the canonical path and how an agent reaches it, and proposes no supplier-specific pointer | guard/F26 | Requirements | package |
| guard/T55: a consumer of `0.0.1` moves to the candidate, runs `upgrade`, and gains the Skill at the canonical location. Retired in `guard/C30`: `0.0.2` offers no upgrade from `0.0.1` (`guard/C23`); a fresh `0.0.2` setup gains the Skill (guard/T50), and a later version's new asset is installed by `upgrade` (guard/T66) | guard/I5, guard/F13, guard/F23, guard/A12 | Requirements | Engineering |
| guard/T57: a modified deployment is kept and reported while the others move forward, and `remove` leaves it | guard/F23, guard/F8 | Requirements | package |
| guard/T56: an External delivery writes the Skill variant at the canonical location and, where Core is used at delivery, where Core computes for the passed declaration; it names neither KAAL nor npm; its hook's reminder names the canonical path; a target's existing Skill and instruction files are untouched | guard/I6, guard/F25, guard/F26, guard/A16 | Requirements | Engineering |
| guard/T58: `contract.json` and the lifecycle agree: every asset and `guard.json` entry standalone `init` writes is in the contract, every one in the contract is written, and the contract names no supplier location beyond the canonical one | guard/F27, guard/A17 | Architecture | package |
| guard/T59: the package declares Node `>=24`; on an older Node every command exits as cannot judge, naming Node 24 as the next step, and the README states the prerequisite | guard/N1, guard/F27 | Requirements | package |

**Cross-Capability conformance.** Guard's instance is checked by Core's outer conformance Test Cases for the Installation Contract (`core/T1`…, defined in `core/C3`), executed by KAAL Engineering against `contract.json`, and, once Core realizes contracts, by realizing it through Core and then running Guard's standalone `upgrade` and `remove` on the result. Guard records its own evidence for them and does not copy their definitions. guard/T58 stays Guard's own: it checks that the instance and the lifecycle agree.

`verify` (guard/F10, guard/T24, guard/T35) checks static CI configuration coverage only: the workflow files name a job for every `ci` check. No test claims that GitHub ran a job or that branch protection requires it.

**CI responsibility (`guard/C35`).** The Owner ruled on #352 (6386490520) that the consumer owns its CI and the assignment of each check's execution, and that Guard never infers missing CI responsibility and takes it over (guard/F17). The planned tests that installed Guard's workflow through a bare `init` encoded the opposite, so `guard/C36` corrects them inside the boundary, as a PLAN Change of its own:
- guard/T8, guard/T17, guard/T18, guard/T63, guard/T70, guard/T72 and guard/T73 (package) and guard/T65, guard/T67 and guard/T68 (consumer) opt in with `init --ci` where they need Guard's workflow; their obligations are unchanged. guard/T8 matches `kaal-guard run --ci`, the form of the fixed workflow.
- guard/T66 moves to the hook: a later version's new asset is installed by `upgrade`, and Guard's workflow is not one (guard/F13). guard/D1's trace stays on guard/T66.
- guard/T74 and guard/T75 are added for the opt-in and for reporting missing coverage.
- The Owner's follow-up on #355 (6386981735) separates initialization, registration and activation (guard/F30). Every planned test that needs the hook opts in with `init --hook` (guard/T1, guard/T4, guard/T9, guard/T10, guard/T14, guard/T16, guard/T20, guard/T24, guard/T26, guard/T62, guard/T69, guard/T71); those that need both use `init --hook --ci`. Declarations say `runs: [hook]` and the hook runs `kaal-guard run --hook`, so guard/T5 and guard/T8 match that form. guard/T66 also requires that `upgrade` installs a new asset only for an activated surface and activates none.
- guard/T76, guard/T77 and guard/T78 are added for initialization without activation, each activation apart, and undoing each.
- guard/T36 and guard/T42 keep `run --local`: they run the published `0.0.1`, and `guard/C37` revises their setup.
- guard/T16, guard/T24, guard/T43 and guard/T64 hold unchanged: none of them needs a workflow from a bare `init`.
No Test Case is retracted, and no RED evidence is dropped.

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
| guard/D4 | guard/T44 | Guard rewrites the whole of `guard.json` with its own formatting, so `init` then `remove` changes bytes the consumer wrote | established in K2b (`packed`, Linux); retracted in `guard/C23` |

guard/D5 is a defect in guard/F7 as `0.0.1` ships it, found by Codex on #366 (r4368693892), outside the consumer upgrade:

| Defect | Traces to | Gap | Status |
| --- | --- | --- | --- |
| guard/D5 | guard/T81 | the base copy of a trusted checker is written without the mode the base records, so an executable checker run as `./checker.sh` fails to start (EACCES) and its check is cannot judge | suspected (Codex on #366, r4368693892; reproduced directly against `materialize`); established once guard/T81 is recorded RED in `guard/C41` |

guard/T40's suspicion was refuted, so it has no D, and guard/T40 keeps guarding guard/F15.

**Compatibility with `0.0.1` retracted.** The Owner ruled on #336 (6384215003) that `0.0.2` may break `0.0.1`, with no migration, no dual format and no rollback to it. The consumer Test Cases written against `0.0.1` are reassessed under `guard/C23`, and their K2b evidence stays recorded above:
- **guard/T37, guard/T38, guard/T39 and guard/T41** run an upgrade or a rollback between `0.0.1` and a candidate, a path `0.0.2` no longer offers. Their obligations (guard/F12–guard/F14 and guard/F16) still hold from `0.0.2` on. They are superseded by guard/T65–guard/T68, which run between two candidates of the planned configuration. `guard/C24` writes them, and the harness builds the two candidates.
- **guard/D1 and guard/D2** stay established on their K2b evidence. They are defects in the lifecycle's rules, not in `0.0.1`'s format. Their trace moves to guard/T66 and guard/T67 once those tests are recorded RED.
- **guard/T40** holds. guard/F15 now names refusal, with the fresh setup as the next step, as `0.0.1`'s answer.
- **guard/T36 and guard/T42** keep their `0.0.1` evidence, and `guard/C20` points them at the published `0.0.2`.
- **guard/T43** runs only the candidate, and it holds.

**guard/D4 retracted.** The Owner ruled on #336 that Guard owns its configuration contract and its validation, not the consumer's formatting. The byte-for-byte wording of guard/F18 was therefore a wrong contract, not a gap in Guard's behaviour. `guard/C23` supersedes that wording, so guard/D4 is retracted rather than corrected, and its evidence stays recorded above. Its correction, the text-preserving editor of `guard/C8` (#336), is withdrawn unmerged. guard/T44 is superseded by guard/T64, which holds by construction under the planned configuration because Guard never writes a declaration. `guard/C24` writes it. Whatever the replacement proves RED becomes a new Defect, numbered from guard/D5.

## Agent guidance

guard/T45–guard/T59 are planned in `guard/C12`. They are written as a PLAN Change of their own (`guard/C13`) before any code, and they are expected RED, blocked or exercised, as guard/C0a records. guard/T55 is retired in `guard/C30`, because `0.0.2` offers no upgrade from `0.0.1`. guard/T50, guard/T53 and guard/T56 show placement only. How a supplier's agent then reaches the Skill is observed by hand and labelled as an observation (guard/N9).

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
