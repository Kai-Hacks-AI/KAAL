# Guard: Testing, Engineering's part

Guard's product Testing is authoritative in the package: [`packages/kaal-guard/docs/testing.md`](../../packages/kaal-guard/docs/testing.md). It holds the loops, the trace of every delivered case and what is verified elsewhere. The delivered cases define themselves by their titles, and their trace is written from those titles. This page holds only Engineering's part:
- the plan and evidence of the Test Cases that only make sense in KAAL, in `engineering/guard/acceptance/`: KAAL's integration (guard/A11), External delivery (guard/A10, guard/A16), consumer acceptance against the registry (guard/A12), the verification's own Test Cases and the authority check (guard/A20);
- the RED and GREEN record of every Test Case, delivered or not;
- the Defect register.

Testing owns what evidence means. The relationships are these: F and N trace to I, A to F and N, and each Test Case names in its title the I, F, N or A contracts it checks. A Change (C) carries Intents, and a Defect (D) traces only to the Test Case that proves it RED.

Every identifier is written Capability-qualified, as `<capability>/<id>`, in definitions, relationships, tests and Change maps, including references within Guard: `guard/F27`, `guard/T58`, `core/T1`. Capability names are globally unique, and numbering is local per Capability and per type. The titles of the test files inside the acceptance boundary are qualified by a Change of their own, `guard/C22`, because the boundary changes only in a PLAN Change that travels alone. Until then, a bare identifier in a test title means Guard's. A Change (C) is KAAL's existing Change, carried on GitHub by a pull request, and its durable identity is `guard/C<number>`. Earlier labels (R1, K1–K6, B1–B7, and the hypotheses H1–H5) remain only as aliases ([Change](change.md#change-identities)). A Defect (D) traces only to the Test Case that proves it RED.

## Planned outer tests

| Test | Checks | Loop | Where |
| --- | --- | --- | --- |
| guard/T3: an External delivery works in a fresh repository and leaves nothing from KAAL in it | guard/I6, guard/N5, guard/F8, guard/A10 | Intent | Engineering |
| guard/T5: KAAL's pre-push hook runs its local checks through Guard | guard/I4 | Intent | Engineering |
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
| guard/T64: `init` then `remove` in the clone and in the minimal repository leaves every declaration byte for byte as written; Guard writes only its managed assets, each byte-identical to catalogued content, its installation record and its checkout state | guard/I1, guard/F18, guard/F29 | Requirements | Engineering |
| guard/T65: between two `packed` candidates of the planned configuration, in the minimal repository, a dependency and lockfile change, then `upgrade`, moves an unmodified managed asset forward and keeps a modified one, a consumer-owned file and every declaration | guard/I5, guard/F11, guard/F12 | Requirements | Engineering |
| guard/T66: between two candidates, a managed asset the newer one manages, missing from the repository, is installed by `upgrade`, and only for a surface the consumer activated; `upgrade` activates none. Corrected in `guard/C35` to the hook, because `upgrade` never installs Guard's workflow (guard/F17), and to the activated surface (guard/F30) | guard/F13, guard/F30 | Requirements | Engineering |
| guard/T67: between two candidates, the installation record registers each unmodified asset's new version and hash, `upgrade` reports the versions it moved between, and a modified asset is reported as modified and kept with its registered version | guard/F14 | Requirements | Engineering |
| guard/T68: between two candidates, back and forward again, each unmodified managed asset returns to that version's content, and modified, consumer-owned and declaration files are untouched | guard/I5, guard/F16 | Requirements | Engineering |
| guard/T80: every key in the frontmatter of KAAL's own declarations is a string to YAML 1.2's core schema: each `outcomes` status is double-quoted. Added in `guard/C38` | guard/F1, guard/A11 | Architecture | Engineering |

| guard/T46: `kaal-engineer-skill` finds no standard or KAAL violation in the Embed Skill or the External variant. It needs KAAL's workspace installed and built, so it runs only in the Guard lane on the host that installs it, and turns GREEN only with `guard/C14` and `guard/C17` (restated in `guard/C46`) | guard/F19, guard/A13, guard/A16 | Architecture | Engineering |
| guard/T55: a consumer of `0.0.1` moves to the candidate, runs `upgrade`, and gains the Skill at the canonical location. Retired in `guard/C30`: `0.0.2` offers no upgrade from `0.0.1` (`guard/C23`); a fresh `0.0.2` setup gains the Skill (guard/T50), and a later version's new asset is installed by `upgrade` (guard/T66) | guard/I5, guard/F13, guard/F23, guard/A12 | Requirements | Engineering |
| guard/T56: an External delivery writes the Skill variant at the canonical location; it names neither KAAL nor npm; its hook's reminder names the canonical path; a target's existing Skill and instruction files are untouched. Core at delivery moved to guard/T83 in `guard/C46` | guard/I6, guard/F25, guard/F26, guard/A16 | Requirements | Engineering |
| guard/T83: where Core's realization is available at delivery, an External delivery also writes the further deployments Core computes for the passed declaration, lists Core's pointers in `GUARD.md`, and leaves no Core or Hosting element in the target. Added in `guard/C46` | guard/I6, guard/F25, guard/A16 | Requirements | Engineering |
| guard/T93: the workflow an External delivery writes pins `actions/checkout`, and `actions/setup-node` where it sets up Node, by commit SHA, and has no `${{` expression in any `run:` line. Added in `guard/C71` | guard/F5, guard/N5 | Requirements | Engineering |
| guard/T98: the package's own test files, run from `packages/kaal-guard`, pass on Node 24, and no file of the retired `0.0.1` suite runs. Added in `guard/C76`. Revised in `guard/C98`, because `npm test` became the consumer's verification (guard/F32) | guard/N6 | Requirements | Engineering |

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

**For `0.0.3`, guard/T65–guard/T68.** Their `packed` evidence between two simulated candidates is not `registry` evidence and never counts as it. With the published `0.0.2`, the next version can supply their `registry` evidence: before publication, a mixed pair (the published `0.0.2` as the older, the packed `0.0.3` candidate as the newer) is still `packed` evidence and decides only whether `0.0.3` is published; after publication, the pair of published versions is their `registry` evidence and gates `0.0.3`'s Release acceptance (`guard/C83`). [Change](change.md#003) gives the order. Their assertions do not change.

**Release acceptance of `0.0.2` (`guard/C20`).** guard/T36, guard/T40, guard/T42, guard/T43 and guard/T64 are GREEN with `registry` evidence for the published `@kaihacksai/kaal-guard@0.0.2` (integrity `sha512-jwwaDwY9GuojEeg6SdIY+/1ZUHMnR0cZTh2skt9UZuE2T7n7pytE5HnSN29TCNiwM9TohMRSEkxCe9Ew9M9yXg==`), installed from the registry. They ran on kaal/guard at 43b33cb, on 2026-10-26 on Linux, with Node 24.22.1, npm 11.19.1 and Git 2.43.0:

```sh
GUARD_CANDIDATE=registry:0.0.2 node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs
```

Each of the five names `@kaihacksai/kaal-guard@0.0.2 (registry)` as its candidate. All 9 consumer Test Cases pass, 0 fail, none skipped. guard/T65–guard/T68 pass in the same run but do not gate `0.0.2` and are not counted as its acceptance: two published versions of the line are their evidence (`guard/C83`). The evidence is from Linux alone. These consumer tests sit outside the required jobs, and no job runs them on macOS or Windows (`guard/C18` stays unauthorized), so `0.0.2`'s acceptance claims no other OS.

### Release acceptance of `0.0.3` (`guard/C83`)

guard/T65, guard/T67 and guard/T68 are GREEN with `registry` evidence between the published `@kaihacksai/kaal-guard@0.0.2` (older) and the published `@kaihacksai/kaal-guard@0.0.3` (newer, integrity `sha512-uW2ddZZFoEAJRaEDAJC1+0/xfj4LbGoEVGshElLVfGzO5POudLjQP9cvaj97cC3OxsYiCtEJNBFoYnqPj4+ViQ==`, published 2026-10-26T20:26:37Z with provenance), both installed from the registry. They ran on main at bf57539, on 2026-10-26 on Linux, with Node 24.22.1, npm 11.19.1 and Git 2.43.0:

```sh
GUARD_CANDIDATE=registry:0.0.3 GUARD_CANDIDATES=registry:0.0.2,registry:0.0.3 node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs
```

| Test Case | Result | Candidate |
| --- | --- | --- |
| guard/T36, guard/T42 | GREEN | the published `0.0.2` they consume |
| guard/T40, guard/T43, guard/T64 | GREEN | `@kaihacksai/kaal-guard@0.0.3 (registry)` |
| guard/T65, guard/T67, guard/T68 | GREEN | `registry` `0.0.2` → `@kaihacksai/kaal-guard@0.0.3 (registry)` |
| guard/T66 | not exercised for this pair: blocked before behavioural assertion, "the newer candidate adds no asset to the hook surface" | `registry` `0.0.2` → `@kaihacksai/kaal-guard@0.0.3 (registry)` |

The run reports 9 tests, 8 pass and 1 fails; the one is guard/T66's blocked precondition, which the Owner recorded on #483 as neither GREEN nor a behavioural failure (`guard/C89`). Its behaviour stays exercised between two `packed` candidates. No asset was added to make it observable, and it is revisited when a genuine release adds a hook-surface asset. With this, `0.0.3` is accepted. The evidence is from Linux alone, and these consumer tests sit outside the required jobs, so `0.0.3`'s acceptance claims no other OS.

## Consumer verification (`0.0.4`)

guard/T101–guard/T106 test the verification itself (guard/I8). Each one:
- packs a candidate of the package;
- installs only that tarball into an unrelated, minimal npm consumer outside the KAAL checkout (`npm init`, `git init`, one file of its own);
- runs the documented `npm explore @kaihacksai/kaal-guard -- npm test`.

They live in `engineering/guard/acceptance/` and do not ship (guard/A18). Their candidate source is `packed` (guard/N9). A `registry` run happens after publication only, and nothing is claimed for the registry before it.

| Test | Checks | Intended evidence on `0.0.3` |
| --- | --- | --- |
| guard/T101: the documented command executes the delivered cases, more than zero of them, and a passing run gives `verified`, exit 0 | guard/F31, guard/F32, guard/F33 | RED: `0.0.3` runs 0 tests and exits 0 |
| guard/T102: the output and its summary line name the package, the candidate's version, its install location and the installed files' hashes, and these equal the candidate's | guard/F34 | RED: `0.0.3` names nothing |
| guard/T103: negative behaviour. One byte changed in the installed `lib/runner.mjs` gives `cannot verify`, exit 2, naming the file. A delivered case made to fail gives `failed`, exit 1, naming the case | guard/F33, guard/F34 | RED |
| guard/T104: each of these gives `cannot verify`, exit 2, with its cause, and never `failed`: no `git` on PATH, zero cases, a skipped case, one declared case not executed | guard/F33 | RED |
| guard/T105: after a run, the consumer's working tree, `.git`, npm configuration and the installed package are as they were, and the output says so | guard/F35 | RED: `0.0.3` makes no such claim |
| guard/T106: a second run against the same installation gives the same result, and the output names `kaal-guard verify` for integration | guard/F32, guard/F36 | RED |

**How RED-first is recorded.** There is no RED lane: #501 removed it. So a Test Case written RED in the boundary would land as a red check, and none is marked `todo` or `skip` (`guard/C91`). guard/T101–guard/T106 are therefore written in `guard/C98`, beside the entry. Their RED run, against a candidate without the entry and against the published `0.0.3`, is recorded in that Change's pull request before the entry is added, as for guard/T100 in `guard/C92`. They live in `package.test.mjs`, which every Guard host runs, Linux, macOS and Windows.

**The RED run (`guard/C98`, #536).** On the packed candidate without the entry, and on `0.0.3` installed from the registry, all six were RED. The documented command exited 0 and printed no `kaal-guard-verification` summary line. With a planted case, `0.0.3`'s `npm test` ran it and passed, so nothing it ran was accounted for.

## The complete product (`0.0.4`)

guard/T107–guard/T112 are planned in `guard/C102`. They are placed by what each one verifies (guard/A20):
- guard/T107 checks a product promise, so it is a delivered case in `test/acceptance/architecture.test.mjs`. It is the one addition to the acceptance boundary.
- guard/T108–guard/T110 verify the verifier, so they are in `engineering/guard/acceptance/package.test.mjs`, beside guard/T101–guard/T106.
- guard/T111 and guard/T112 check KAAL's own authority and derivation, so they are in `engineering/guard/acceptance/authority.test.mjs`. guard/T111 runs in the `Engineering` job (`npm run test:engineering`). guard/T112 is not written yet: it comes with `guard/C105`.

guard/T107 is defined by its title, and the product's trace in `packages/kaal-guard/docs/testing.md` lists it.

| Test | Checks | Written in | Intended evidence on the `guard/C98` candidate |
| --- | --- | --- | --- |
| guard/T108: a candidate in which a declared product identifier has neither a covering case nor an allocation is `cannot verify`, exit 2, naming the identifier; allocated to the publisher it is `verified`, and the output and summary line name the allocation as not verified by this run; one no Test Case verifies is named `unverified` | guard/F38 | `guard/C104`, reworded in `guard/C108` | RED: no coverage is declared or judged |
| guard/T109: `npm test` runs the outer and the inner loop and accounts for each case under its loop; a candidate with the inner loop emptied is `cannot verify`, naming the loop | guard/F39 | `guard/C104` | RED: the inner loop does not ship |
| guard/T110: a case that declares the current platform not applicable is reported as not applicable, named and not run, and the run can still be `verified`; the same case skipped without that declaration is `cannot verify`; an identifier only such a case covers is named as not verified here unless the contract declares it not applicable | guard/F40 | `guard/C104` | RED: no applicability is declared |
| guard/T111: in KAAL, every Guard identifier is defined exactly once, every product identifier only in `packages/kaal-guard/docs/`, and every identifier a delivered case cites is defined | guard/N14, guard/A20 | `guard/C103` | RED: the product identifiers are defined in `engineering/guard/` |
| guard/T112: External's hook, workflow and Skill templates equal the package's under their declared transformation | guard/N14, guard/A16 | `guard/C105` | RED: no transformation is declared, and the templates differ |

**RED-first.** As for guard/T101–guard/T106 (`guard/C91`), each test is written in the DO Change named in the table. Its RED run is recorded in that Change's pull request before the change that turns it GREEN. None is marked `todo` or `skip`.

**What is exempted, and what is not.** Every product identifier is either covered or exempted, and nothing is exempted silently:
- **Exempted.** Verified by Engineering before each release:
  - guard/I8, guard/F31–guard/F36, guard/F38–guard/F40, guard/N13 and guard/A18, by guard/T101–guard/T110;
  - guard/F11 and guard/F14–guard/F16, by consumer acceptance against the registry (guard/A12).
- **No case cites them today.** guard/F20, guard/A2, guard/A4, guard/A5, guard/A6 and guard/A14. For each, `guard/C104` does one of two things, and its pull request lists the choice for each identifier:
  - names the delivered cases that already exercise it in their titles, where they do (for example, guard/T9 exercises the shipped hook, guard/A4);
  - or adds a delivered case.
- **The inner loop's skipped case.** One inner case is skipped on Windows today ("supplies no changed paths when Git cannot compute them"). It becomes a declared applicability (guard/F40), never a silent skip.

**The coverage choices (`guard/C104`, #540).** Each identifier that no delivered case cited before `guard/C104`, and what `guard/C104` does for it. The list above missed two of them, guard/I9 and guard/A18, which `guard/C102` added; the generator found them, because it refuses an identifier that is neither covered nor exempted. Every choice adds a citation to a case title or an exemption row in the product's `docs/testing.md`. No assertion changes, and no case is added.

| Element | Identifier | Choice |
| --- | --- | --- |
| The repository's checks | guard/A2 | named in guard/T61, which declares a check as `<name>.md` and runs it with its declared meaning |
| The Git adapter | guard/A4 | named in guard/T9, guard/T10 and guard/T14, which run the shipped hook on a push |
| The GitHub adapter | guard/A5 | named in guard/T11–guard/T13, which run Guard as a workflow job and read its job verdict and reports |
| The lifecycle | guard/A6 | named in guard/T16–guard/T18, which run `init`, `upgrade` and `remove` on managed assets |
| The Skill's placement | guard/A14 | named in guard/T50–guard/T53, which install, keep, move forward and remove the Skill |
| A complete product | guard/I9 | named in guard/T107, which checks that the package carries its contract and defines every identifier its cases cite |
| The verification entry | guard/A18 | exempted, with guard/I8, guard/F31–guard/F36, guard/F38–guard/F40 and guard/N13: a delivered run cannot verify its own verifier, so guard/T101–guard/T110 verify it before each release |
| Guidance | guard/F20 | exempted: it is guidance in the Skill and the README, which Guard never parses; the publisher reviews it with each release |

**The RED run (`guard/C104`, #540).** guard/T108–guard/T110 were written first, in their own commit, against the verifier as `guard/C103` left it:
- guard/T108 failed because an identifier with neither a covering case nor an exemption gave `verified`;
- guard/T109 failed because the summary named no loop;
- guard/T110 failed because a case declared not applicable was counted as skipped, giving `cannot verify`.

guard/T103 and guard/T104, whose fixture `reduce()` now also empties `test/unit/` and declares one loop, still passed.

**The RED run (`guard/C103`, #538).** guard/T107 and guard/T111 were written first, in 3b6fda3, before the contract moved:
- guard/T107 failed because the package carried no `docs/`;
- guard/T111 failed because every identifier the delivered cases cite was defined in `engineering/guard/`, and guard/F28, guard/F7 and others were defined more than once there, by their amendments.

The same commit left guard/T101 `cannot verify`, because the manifest no longer matched the cases. The contract then moved, and the manifest was regenerated, and all three are GREEN.

**How guard/T111 recognises a definition.** The definition forms are canonical. guard/A20 names them, and guard/T111 refuses every other line shaped like a definition. A definition in another layout therefore fails the check; it is not silently ignored.

During the review of #538, the recognition rule was corrected after the RED run. That run had counted Engineering's evidence rows, such as `| guard/T36 | GREEN |`, as definitions. The correction adds three things: plan ranges (`| guard/T33–guard/T35: …`), Defects as identifiers, and the refusal of every non-canonical form. Discriminating evidence for the corrected rule:
- **The checker is tested first.** Before guard/T111 judges KAAL, its own subtests run on fixtures:
  - a clean contract gives no finding;
  - a product identifier defined twice is found, in one file and across files;
  - a product identifier retained in `engineering/guard/` is found, as an obligation and as a planned Test Case;
  - an identifier a delivered case cites is found undefined when nothing defines it, or when only an Engineering evidence row cites it;
  - eighteen other forms shaped like a definition are each refused, while a quoted form in a code span is not;
  - the canonical forms are recognised with CRLF line endings, and a range defines each Test Case in it.
- **The corrected rule is still RED on the RED commit.** Run against 3b6fda3's tree, it finds:
  - 118 identifiers the delivered cases cite that are defined in `engineering/guard/` and not in the package;
  - 9 identifiers defined more than once, guard/F2, guard/F5 and guard/F7 among them, by their amendments;
  - 15 non-canonical lines.
- **No layout or wording hid a definition.** Making the forms canonical meant changing 15 lines of `engineering/guard/`:
  - fourteen bold citations of Test Cases and Defects, such as `- **guard/T107** checks …`, lost their bold, or were reworded so the bold no longer opens with the identifier;
  - one heading that opened with guard/D1 was reworded, and the two links to it were updated.

  Each was a citation, not a definition. No identifier's text or number changed.

**External's derived templates move to `guard/C105`, with guard/T112.** External's templates are not a copy of the package's assets that a transformation could produce. They describe a different runner: `.githooks/guard.sh` with one CI job per check, where the package has `kaal-guard run`. Deriving them means redesigning the External delivery. On #537 the Owner asked that External's derivation neither expand nor block the consumer-verification milestone. So `guard/C103` leaves the templates as they are, and guard/N14's Derived assets stays unmet until `guard/C105`, as guard/N14 records. [Change](change.md#the-complete-product-004) gives `guard/C105`'s scope and acceptance.

## Consumer-experience corrections (`0.0.4`)

guard/T113–guard/T117 are planned in `guard/C107`. They verify the verifier, the delivered cases and the tarball's boundary, so they are in `engineering/guard/acceptance/package.test.mjs`, beside guard/T101–guard/T110.

| Test | Checks | Written in | Intended evidence against `afa9ca3` |
| --- | --- | --- | --- |
| guard/T113: two runs of the documented command, one passing and one with a planted failing case, each with the child's temporary directory set to a fresh empty directory, leave that directory empty | guard/F35 | `guard/C108` | RED: about 150 directories remain after one run |
| guard/T114: a consumer holding a Unix socket and a FIFO is `verified`, exit 0, within the case's time limit, naming neither; replacing the FIFO with a regular file between snapshots is `failed`, naming it. Registered on Linux and macOS, where the file system has both kinds | guard/F33, guard/F35 | `guard/C108` | RED: the socket gives `cannot verify` advising reinstall, and the FIFO hangs until the limit |
| guard/T115: a delivered case that appends to a consumer file gives `failed`, exit 1, naming the path, with the next step to check concurrent activity and no advice to restore paths | guard/F33, guard/F35 | `guard/C108` | RED: the next step says to restore the paths from version control |
| guard/T116: the packed candidate holds only the package's declared `files`, and no path from `engineering/`, no Engineering Test Plan and no release evidence | guard/F37, guard/A19 | `guard/C108` | GREEN on `afa9ca3`, where the review found none by hand; RED, naming the path, on a candidate with a planted `engineering/` file |
| guard/T117: `snapshot()`, with its file-system reads patched so a listed file is removed before it is read, completes and records the file as absent | guard/F35 | `guard/C108` | RED: `snapshot()` throws `ENOENT`, which ends a run as "could not complete" |

**The baseline (`guard/C108`, d49f0cf).** Verified first: guard/T113–guard/T117, and guard/T108 in allocation wording, were written in their own commit and run against the product as #545 and #546 left it (Linux, Node 24):
- guard/T113 RED: the whole delivered suite left 148 and 148 entries in its temporary directory over two runs.
- guard/T114 RED: the run with a Unix socket and a FIFO did not complete within the case's 300 s limit.
- guard/T115 RED: the next step said "restore those paths from version control and report this output to the package's maintainers".
- guard/T116 GREEN: 35 packed files and no publisher material; with a planted `docs/engineering/testing.md` it named that path. This makes an existing obligation explicit, so GREEN is the honest baseline, not a missing RED.
- guard/T117 RED: `snapshot()` threw `ENOENT` on `lstat` of the vanished `maintenance.lock`. The case patches `fs.readdirSync` through `syncBuiltinESMExports()` to remove the file after listing, so the shipped `snapshot()` meets the race itself, deterministically.
- guard/T108 RED on wording: an allocated identifier gave `cannot verify` ("neither … nor an exemption").

**After `guard/C108`.** The same cases are GREEN on Linux: the whole Guard command passes, 161 of 161, under an empty temporary directory.
- guard/T113 judges what the run leaves, less Node's module compile cache (`node-compile-cache`), which npm's own CLI turns on in the temporary directory and reuses; it is npm's, not the run's.
- guard/T114 is registered on Linux and macOS only, where the file system has sockets and FIFOs.
- Engineering's own acceptance files are not delivered, so no Test Case covers their cleanup. Their `mkdtemp` roots are removed in `after` hooks, and the Guard command left nothing but `node-compile-cache` in its temporary directory. `engineering/guard/external/deliver.test.mjs` and `engineering/guard/consumer/harness.mjs` are outside this Change and unchanged.

## Release acceptance of `0.0.4` (`guard/C101`)

`@kaihacksai/kaal-guard@0.0.4` was published on 2026-10-28 at 13:15 UTC by Guard Release, run 40692680679, from main at f0d1eb9. The Owner approved the `npm` environment, and npm attached provenance (Sigstore log index 3539276054). The registry's tarball has SHA-256 `ecd79c5bd251d2837c71688ba72798a1bcb140de36969347e2198e8982abaa4a`, the digest recorded in `guard/C100`. Its integrity is `sha512-W+cpBV6fQ0zhJVG+PRX9/FPTUIAZtxU9d4+8d4XY84Shko4odgKDIXkwlXdeGQR4tVI5Fkh2o7F5EiTRrwgL6Q==`, and it is tagged `latest`.

**`packed`, on Linux, macOS and Windows.** f0d1eb9's `Guard` jobs (run 40682336282) ran these:
- guard/T101–guard/T110 are GREEN on all three operating systems.
- guard/T111 is GREEN on Linux. It is not in the macOS and Windows jobs, which name three acceptance files and not `authority.test.mjs`, so its evidence is from Linux alone. It reads the shipped documents' text and starts no process.
- On Windows, guard/T114 is not registered, as declared.

**`registry`, on Linux.** These ran on f0d1eb9 with Node 24.22.1, npm 11.19.1 and Git 2.43.0:

```sh
GUARD_CANDIDATE=registry:0.0.4 node --test --test-concurrency=1 --test-name-pattern="guard/T10[1235]" engineering/guard/acceptance/package.test.mjs
GUARD_CANDIDATE=registry:0.0.4 GUARD_CANDIDATES=registry:0.0.3,registry:0.0.4 node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs
```

| Test Case | Result | Candidate |
| --- | --- | --- |
| guard/T101, guard/T102, guard/T103, guard/T105 | GREEN. The installed copy's lockfile integrity equals the registry's integrity above | `@kaihacksai/kaal-guard@0.0.4 (registry)` |
| guard/T36, guard/T42 | GREEN | the published `0.0.2` they consume |
| guard/T40, guard/T43, guard/T64 | GREEN | `@kaihacksai/kaal-guard@0.0.4 (registry)` |
| guard/T67 | GREEN | `registry` `0.0.3` → `0.0.4` |
| guard/T65, guard/T66, guard/T68 | stopped before their behavioural assertion, because their applicability was still coded as assertions. `guard/C112` declares it, and its run below reports them not applicable for this pair | `registry` `0.0.3` → `0.0.4` |

**The acceptance basis.** `0.0.4` is accepted on two concerns, each with its own Test Cases. Both succeeded:
- **Desired result.** The installed product's verification is GREEN within its declared scope. `packed`: guard/T101–guard/T110 on Linux, macOS and Windows, and guard/T111 on Linux only. `registry` on Linux: guard/T101, guard/T102, guard/T103, guard/T105, guard/T36, guard/T40, guard/T42, guard/T43 and guard/T64.
- **Transition, `registry` `0.0.2` → `0.0.4`.** guard/T118, guard/T65, guard/T67 and guard/T68 are GREEN. guard/T66 is not applicable.
- **Transition, `registry` `0.0.3` → `0.0.4`.** guard/T118 and guard/T67 are GREEN. guard/T65, guard/T66 and guard/T68 are not applicable, because the two versions ship the same workflow and `0.0.4` adds no asset to the hook surface.

[Transition acceptance of `0.0.4`](#transition-acceptance-of-004-guardc112) has the run. A case that is not applicable is neither GREEN nor RED and is not counted as passed. No asset was changed to make a case observable, no assertion was weakened, and no recorded result was rewritten. Both supported upgrade paths have GREEN, outcome-oriented guard/T118 evidence. The limits stand: `registry` evidence is from Linux, and guard/T111 from Linux only. `0.0.4` ships no target-owned migration contract; that is `guard/C113`, for `0.0.5`.

## Transition acceptance of `0.0.4` (`guard/C112`)

guard/T118 is planned in `guard/C112`. It is producer-side evidence that a migration path the target release supports works. It is not a record of a consumer's operational run. It is in `engineering/guard/acceptance/consumer/consumer.test.mjs`, beside guard/T65–guard/T68, and runs for each declared source of the target: `registry` `0.0.2` → `0.0.4` and `0.0.3` → `0.0.4`.

| Test | Checks | Written in | Intended evidence against the published `0.0.4` |
| --- | --- | --- | --- |
| guard/T118: an installation of the older version, integrated with `init --hook --ci` and holding a consumer-owned file and one modified managed asset, is moved to the newer version by a dependency change and `upgrade`. Only the dependency, the lockfile and the installation record change; each managed asset the two versions ship identically stays byte for byte, and each they ship differently moves to the newer content; the modified asset and the consumer's file are kept; the record names the newer version for each unmodified asset; and the newer version's consumer verification gives `verified`, exit 0, on the migrated installation | guard/F11, guard/F12, guard/F14, guard/F31 | `guard/C112` | expected GREEN for both pairs. A hand observation on #552 for `0.0.3` → `0.0.4` matched it, but that is not evidence. The case is verified first, not made RED first: GREEN at the baseline is legitimate, because the case makes an existing obligation explicit |

guard/T65, guard/T66 and guard/T68 keep their assertions and their recorded results. `guard/C112` turns their preconditions into declared applicability. It is judged before any behavioural step, from the two versions' packages installed side by side: their `contract.json` and the content each managed asset ships with.
- guard/T65 and guard/T68 apply when the pair ships the workflow, the managed asset they watch move, with different content.
- guard/T66 applies when the newer version adds an asset to the hook surface.
- guard/T118 applies to released versions. The harness's own `packed` variants (`-candidate.N`) change a package after its manifest was made, so their verification cannot pass by design. guard/T118 is run with `GUARD_CANDIDATES` naming the pair.

A pair that does not meet the condition is reported `not applicable` with the reason. That is neither GREEN nor RED, and an assertion that was not executed is never counted as passed. guard/T68 keeps "the workflow did not move forward" as its assertion; it is executed only for a pair the condition admits. The 0.0.2 → 0.0.3 GREEN results and guard/C89 stand as recorded.

**The run (`guard/C112`, `registry`).** On Linux with Node 24, the whole of `consumer.test.mjs` was run for each declared source of the published `0.0.4`, with `GUARD_CANDIDATES=registry:<source>,registry:0.0.4`. guard/T118 is GREEN for both on the first run: it makes an existing obligation explicit, so this is verified first, not made RED first.

| Case | `0.0.2` → `0.0.4` | `0.0.3` → `0.0.4` |
| --- | --- | --- |
| guard/T118 | GREEN; shipped differently: the workflow | GREEN; shipped differently: none |
| guard/T65 | GREEN | not applicable: the two ship the same workflow |
| guard/T66 | not applicable: `0.0.4` adds no asset to the hook surface | not applicable: the same |
| guard/T67 | GREEN | GREEN |
| guard/T68 | GREEN | not applicable: the two ship the same workflow |
| guard/T36, guard/T40, guard/T42, guard/T43, guard/T64 | GREEN | GREEN |

Without `GUARD_CANDIDATES`, the harness's `packed` variants give guard/T36–guard/T68 GREEN, guard/T66 included, and guard/T118 not applicable.

## The managed workflow keeps no credential (`guard/C114`)

guard/T119 is planned in `guard/C114`. It checks a product obligation, guard/N15, so it is a product acceptance case in `packages/kaal-guard/test/acceptance/requirements.test.mjs` and is delivered with the package.

| Test | Checks | Written in | Intended evidence against `0.0.4` |
| --- | --- | --- | --- |
| guard/T119: in a consumer that ran `init --ci`, every `actions/checkout` step of the installed `.github/workflows/guard.yml` sets `persist-credentials: false`, and the installed content is catalogued for that path in `contract.json` together with every earlier catalogued content of it | guard/N15, guard/F29 | `guard/C114` | RED: neither checkout step sets it |

## What a consumer reads and types (`guard/C115`)

guard/T120–guard/T122 are planned in `guard/C115`. They are product acceptance cases in `packages/kaal-guard/test/acceptance/requirements.test.mjs`, delivered with the package.

| Test | Checks | Written in | Intended evidence against `0.0.4` |
| --- | --- | --- | --- |
| guard/T120: a verification whose manifest allocates two identifiers to the same place prints that allocation on one line naming both, and never the same allocation twice | guard/F34 | `guard/C115` | RED: one line per allocated identifier, 16 in all, repeating shared allocations |
| guard/T121: every next step that asks for a report names the package's `bugs` URL, and `package.json` declares it | guard/F33 | `guard/C115` | RED: "the package's maintainers", with no destination |
| guard/T122: `kaal-guard --version` prints the installed version and `kaal-guard --help` prints the usage, each with exit 0, in a directory that is not a repository, leaving it unchanged | guard/F41 | `guard/C115` | RED: both end as an unknown command |

## Defects

A suspected Defect (D) names an observed or suspected gap. It is established only by a Test Case (T) that proves the deviation as an exercised behavioural RED, and it traces to that T alone. The T keeps its own traces to I, F, N and A, and D does not repeat them. A GREEN test refutes the suspicion, and no D is recorded for it. When a corrective Change turns the T GREEN, the D is corrected. These records are Guard's own. Shared Defect semantics are outside Guard's scope.

These four are defects in behaviour the published `0.0.1` already ships, measured against guard/I5's consumer upgrade. None is a regression, because no published version met these obligations. None is an expected RED of planned implementation either, because no Change has implemented them yet.

| Defect | Traces to | Gap | Status |
| --- | --- | --- | --- |
| guard/D1 | guard/T38 | `upgrade` skips every asset `guard.json` does not record, so a managed asset the consumer lacks is never installed or recorded | established in K2b (`packed`, Linux); its obligation holds since `guard/C25` (#352), where guard/T66 is GREEN (`packed`, Linux), see [below](#after-guardc25-guardd1-and-guardd2) |
| guard/D2 | guard/T39 | `guard.json` does not record the version that wrote its managed assets, and `upgrade` names no versions | established in K2b (`packed`, Linux); its obligation holds since `guard/C25` (#352), where guard/T67 is GREEN (`packed`, Linux), see [below](#after-guardc25-guardd1-and-guardd2) |
| guard/D3 | guard/T43 | `init` judges existing files by path, not existing integration by declared check, so it adds a `guard.yml` that duplicates KAAL's jobs | established in K2b (`packed`, Linux) |
| guard/D4 | guard/T44 | Guard rewrites the whole of `guard.json` with its own formatting, so `init` then `remove` changes bytes the consumer wrote | established in K2b (`packed`, Linux); retracted in `guard/C23` |

guard/D5 is a defect in guard/F7 as `0.0.1` ships it, found by Codex on #366 (r4368693892), outside the consumer upgrade:

| Defect | Traces to | Gap | Status |
| --- | --- | --- | --- |
| guard/D5 | guard/T81 | the base copy of a trusted checker is written without the mode the base records, so an executable checker run as `./checker.sh` fails to start (EACCES) and its check is cannot judge | established: guard/T81 recorded RED in `guard/C41` (#368); corrected by `guard/C42` (#370), where guard/T81 is GREEN |

guard/D6–guard/D14 are suspected defects in the `0.0.2` candidate, found by the release review of 2026-10-25 on kaal/guard at `ac8ff06` (the review's evidence is kept in the project, not here). Each is established only when its Test Case is recorded RED in `guard/C63`; a GREEN refutes it.

| Defect | Traces to | Gap | Status |
| --- | --- | --- | --- |
| guard/D6 | guard/T84 | a declaration that is not a regular file is skipped, so a failing check vanishes and the run passes | suspected (`guard/C61`) |
| guard/D7 | guard/T85 | Git rewrites Guard's files to CRLF under `core.autocrlf=true`: the hook fails under `sh`, and `upgrade` and `remove` call Guard's own files modified | suspected (`guard/C61`) |
| guard/D8 | guard/T86 | where `core.fileMode` is `false`, the hook is committed without its executable bit, and other clones never run it | suspected (`guard/C61`) |
| guard/D9 | guard/T87 | Guard's workflow uses unpinned actions built for Node 20, and puts `github.base_ref` into a `run:` line as shell | suspected (`guard/C61`) |
| guard/D10 | guard/T88 | a registered asset the repository lost is never reinstalled; `core.hooksPath` stays set, and no hook runs | suspected (`guard/C61`) |
| guard/D11 | guard/T89 | an unreadable workflow entry makes `verify` fail (exit 1) with a stack trace instead of cannot judge | suspected (`guard/C61`) |
| guard/D12 | guard/T90 | `remove --config <dir>` deletes that directory when it is empty, even outside the repository | suspected (`guard/C61`) |
| guard/D13 | guard/T91 | an `outcomes` key with a leading zero is accepted and never matches its exit status | suspected (`guard/C61`) |
| guard/D14 | guard/T92 | an older Git is not refused; without `--show-scope`, `init --hook` may set a local `core.hooksPath` over a global one | suspected (`guard/C61`) |

guard/D15 is a suspected defect of the same kind in the External delivery's workflow, outside the package, found while correcting guard/D9 (`guard/C71`). It is established only when guard/T93 is recorded RED in `guard/C73`.

| Defect | Traces to | Gap | Status |
| --- | --- | --- | --- |
| guard/D15 | guard/T93 | the External delivery's workflow uses an unpinned `actions/checkout@v4` and `actions/setup-node@v4`, and puts `github.base_ref`, the pull request's SHAs and the check name into `run:` lines as shell | suspected (`guard/C71`) |

guard/D16 and guard/D17 are defects in the published `0.0.2`, found by a review of `@kaihacksai/kaal-guard@0.0.2` on 2026-10-26 (its evidence is kept in the project, not here). Each is established only when its Test Cases are recorded RED in `guard/C78`; a GREEN refutes it. guard/T97 guards the correction against blocking legitimate changes and is expected GREEN, so no D traces to it.

| Defect | Traces to | Gap | Status |
| --- | --- | --- | --- |
| guard/D16 | guard/T94, guard/T95, guard/T96 | Guard reads a trusted check's declaration from the candidate, so a candidate that drops `trusted`, rewrites the command or deletes the declaration runs its own checker or none, and can pass | established: guard/T94–guard/T96 recorded RED in `guard/C78` (#456); corrected by `guard/C79` (#458), where they are GREEN |
| guard/D17 | guard/T98 | the package's `test` script still runs `test/acceptance/*.test.mjs`, the retired `0.0.1` suite, which `0.0.2` correctly fails | established: guard/T98 recorded RED in `guard/C78` (#456); corrected by `guard/C86` (#464), where guard/T98 is GREEN |

guard/T40's suspicion was refuted, so it has no D, and guard/T40 keeps guarding guard/F15.

guard/D18 was a defect in `0.0.3` before its Release, found by the pre-release review on 2026-10-26 (`guard/C91`; its evidence is kept in the project, not here). guard/T100 is an inner Code test in `packages/kaal-guard/test/runner.test.mjs`, not a boundary test: with the lane removed (#501), a RED Test Case can no longer land in the boundary on its own. guard/D18 is established only when guard/T100 is recorded RED on the uncorrected runner in `guard/C92`'s pull request.

| Defect | Traces to | Gap | Status |
| --- | --- | --- | --- |
| guard/D18 | guard/T100 | with `run --ci` or `run --hook`, a candidate that changes a trusted check's `runs` so it no longer names that surface removes the check from the run, unjudged, and the run can pass | established: guard/T100 recorded RED on the uncorrected runner in `guard/C92`'s pull request (#505); corrected by `guard/C92` (#505), where guard/T100 is GREEN |

**Compatibility with `0.0.1` retracted.** The Owner ruled on #336 (6384215003) that `0.0.2` may break `0.0.1`, with no migration, no dual format and no rollback to it. The consumer Test Cases written against `0.0.1` are reassessed under `guard/C23`, and their K2b evidence stays recorded above:
- guard/T37, guard/T38, guard/T39 and guard/T41 run an upgrade or a rollback between `0.0.1` and a candidate, a path `0.0.2` no longer offers. Their obligations (guard/F12–guard/F14 and guard/F16) still hold from `0.0.2` on. They are superseded by guard/T65–guard/T68, which run between two candidates of the planned configuration. `guard/C24` writes them, and the harness builds the two candidates.
- guard/D1 and guard/D2 stay established on their K2b evidence. They are defects in the lifecycle's rules, not in `0.0.1`'s format. Their trace moves to guard/T66 and guard/T67 once those tests are recorded RED.
- guard/T40 holds. guard/F15 now names refusal, with the fresh setup as the next step, as `0.0.1`'s answer.
- guard/T36 and guard/T42 keep their `0.0.1` evidence, and `guard/C20` points them at the published `0.0.2`.
- guard/T43 runs only the candidate, and it holds.

**Retraction of guard/D4.** The Owner ruled on #336 that Guard owns its configuration contract and its validation, not the consumer's formatting. The byte-for-byte wording of guard/F18 was therefore a wrong contract, not a gap in Guard's behaviour. `guard/C23` supersedes that wording, so guard/D4 is retracted rather than corrected, and its evidence stays recorded above. Its correction, the text-preserving editor of `guard/C8` (#336), is withdrawn unmerged. guard/T44 is superseded by guard/T64, which holds by construction under the planned configuration because Guard never writes a declaration. `guard/C24` writes it. Whatever the replacement proves RED becomes a new Defect, numbered from guard/D5.

### After guard/C25: guard/D1 and guard/D2

guard/D1 and guard/D2 were established by guard/T38 and guard/T39 in K2b. Those tests run an upgrade from `0.0.1`, a path `0.0.2` no longer offers, so they are retired and can never turn GREEN. Their obligations moved to guard/T66 and guard/T67, which `guard/C24` wrote and `guard/C25` (#352) satisfied in the same delivery, so neither was ever recorded RED. On `kaal/guard` at 0e85ebb, `node --test engineering/guard/acceptance/plan/consumer/consumer.test.mjs` passes guard/T65–guard/T68 between two `packed` candidates on Linux.

A Defect traces only to the Test Case that proved it RED, so guard/D1 and guard/D2 keep their traces to guard/T38 and guard/T39 and do not move to guard/T66 and guard/T67. They are recorded as no longer observable, with their obligations held by guard/T66 and guard/T67. They are not recorded as corrected by a GREEN of the Test Case that proved them. `guard/C9` and `guard/C11`, their planned corrections, are absorbed by `guard/C25` and are not created (`guard/C53`). guard/T66 and guard/T67 still need `registry` evidence for a second published version of the `0.0.2` line, as [Consumer upgrade](#consumer-upgrade) says.

## Agent guidance

guard/T45–guard/T59 are planned in `guard/C12`. They are written as a PLAN Change of their own (`guard/C13`) before any code, and they are expected RED, blocked or exercised, as guard/C0a records. They run without any `todo` or `skip` marker, and their real failures are the evidence: on `kaal/guard`, the Guard lane holds each one registered in `engineering/guard/red.json` as a Feature RED (`guard/C45`), names it, and never reports it as GREEN, and any run that targets another branch fails while one is registered. guard/T82 and guard/T83 are added in `guard/C46` and written in `guard/C48`. guard/T55 is retired in `guard/C30`, because `0.0.2` offers no upgrade from `0.0.1`. guard/T50, guard/T53 and guard/T56 show placement only. How a supplier's agent then reaches the Skill is observed by hand and labelled as an observation (guard/N9).

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
GUARD_CANDIDATES=registry:<older>,packed node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs
GUARD_CANDIDATES=registry:<older>,registry:<newer> node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs
```
