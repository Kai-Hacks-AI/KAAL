# Guard: Change

In FANATIC, C is Change: KAAL's existing bounded delivery unit, carried by a pull request. This document holds Guard's Changes, their dependencies, scope, verification and stopping conditions. Nothing is implemented before the Owner authorizes it.

Code is not the subject of this document. It remains the implementation *how*: it is written in DO, test first, to turn the planned outer tests from RED to GREEN, and its own inner Code tests, the fourth loop, evolve with it ([Testing](testing.md)). Code has no identifier series and no structural trace to Architecture: the Architecture conformance tests are what hold it to Architecture. Guard is developed in KAAL Engineering.

The Changes lift what already works in KAAL: the exit-status verdicts, the narrow-adapter rule ("supply facts, act on the exit code") and the trusted checker read from the target ref all run today in `.githooks/pre-push` and the workflows.

## Change map, in dependency order

Each Change depends on the Changes above it and lands only after them. A Change carries zero or more Intents: that is its only traceability link. Its Requirements, Architecture and Tests are reached through those Intents and are not linked again. A Change may carry none, as bounded technical or corrective work does.

| Change | Carries | Scope | Verified when |
| --- | --- | --- | --- |
| **guard/C0a** PLAN | guard/I1–guard/I6 | The Guard Capability Node, these six concerns, and both parts of the outer acceptance boundary. No Guard code. | The outer tests are RED as [Testing](testing.md#red-evidence) reports, and the Owner accepts the boundary. |
| **guard/C0b** Boundary | — | The `Guard Acceptance Boundary` job, for pull requests into `kaal/guard`. It travels alone. | It fails a test DO Change that touches the boundary. It lands before any DO Change. |
| **guard/C1** Runner | guard/I1, guard/I2 | The runner and `kaal-guard run`, with `guard.json`, named outcomes and GitHub reporting. | The outer tests that need only `run` are GREEN. |
| **guard/C1b** Check output | guard/I2 | The runner runs each check synchronously with its output inherited: the check's output goes, unchanged and as it runs, to the hook's terminal or the CI log, and Guard neither captures nor interprets it. Guard's evidence is the exit status, with a trusted checker's provenance (guard/F2, guard/F7). No Guard logging framework, no new dependency. It lands before guard/C3c, whose test lanes print thousands of lines. | Guard's inner tests show a check's output passing through on standard error, Guard's standard output holding only its verdict lines, and the verdict taken from the exit status alone; the outer tests GREEN before stay GREEN. |
| **guard/C2** KAAL Git adapter | guard/I4 | KAAL's `.githooks/pre-push` calls Guard with KAAL's `guard.json`. It travels alone. | KAAL's hook gives today's verdicts on today's scenarios, through Guard. |
| **guard/C3a** KAAL installs Guard | guard/I4 | KAAL installs `kaal-guard` from `packages/kaal-guard` as a development dependency, as an Embed consumer would, and `.githooks/pre-push` calls the installed `kaal-guard run --local`. It is not a workspace, so Guard's outer tests stay out of KAAL's Workspaces and Acceptance lanes, which run every workspace's tests and `test/acceptance/` scenarios. | guard/T5 is GREEN; the hook's verdicts are guard/C2's. |
| **guard/C3b** KAAL CI checks | guard/I4 | KAAL's `guard.json` lists its `ci` checks, and each Guard-run job's logic moves, unchanged, into a KAAL-owned check: the test lanes as their npm scripts, Change Isolation, Promotion Source, Branching and the Branching audit as scripts in `engineering/github/`. The branching checkers are `trusted`, taken from the revision KAAL supplies as `base`: the default branch's tip, as today. | guard/T33 is GREEN; each moved check gives the job's verdicts on today's scenarios, run through Guard. |
| **guard/C3b2** Checks run from the default branch | guard/I4 | Change Isolation reads its checker from the target commit through Git, as the other branching checks already read theirs, so every pull-request check can run from a checkout of the default branch. | Change Isolation gives the job's verdicts on today's scenarios when run from a default-branch checkout. |
| **guard/C3c** KAAL CI integration | guard/I4 | KAAL's existing jobs call `kaal-guard run --check`; names, matrices and triggers are unchanged; the `Guard` job is added and runs Guard's own tests. The `pull_request_target` jobs check out the default branch, where GitHub always takes their workflow from. It travels alone. | Every pre-migration check identity still reports, through Guard (guard/T34): the `push` and `pull_request` jobs and the Branching audit on `kaal/guard`; the `pull_request_target` jobs once they are on the default branch. |
| **guard/C4a** Verify | guard/I2, guard/I4 | `kaal-guard verify` in `lib/github.mjs`: per `ci` check, whether a workflow job declares it in Guard's declared form ([Run](../../packages/kaal-guard/docs/requirements.md)), by name or through `- { check: <name> }` matrix lines (guard/F10). Declared integration only; it infers nothing from scripts or other YAML. | Guard's inner tests show a declared, a matrix-declared and an undeclared `ci` check, every form outside the contract declaring nothing, and a pass claiming declared integration only. On KAAL's tree, `verify` names the two jobs whose invocation sits in a script, Change Isolation and the Branching audit; guard/C4c moves each to a step of its own. |
| **guard/C4b** Lifecycle | guard/I5 | `init`, `upgrade` and `remove` in `lib/lifecycle.mjs`, `managed` in `guard.json`, and the adapter templates `templates/pre-push` and `templates/guard.yml` (guard/F8). | The outer tests of `init`, `upgrade`, `remove` and `verify` are GREEN, guard/T24 among them. |
| **guard/C4c** KAAL runs verify | guard/I5 | KAAL's `Guard` job also runs `kaal-guard verify`, and the Change Isolation and Branching audit jobs invoke Guard in a step of its own, in the declared form, with their facts computed in the step before. Names, triggers and matrices are unchanged. It travels alone. | `verify` passes on KAAL's tree, and guard/T35 is GREEN. |
| **guard/C4d** Embed docs | guard/I3, guard/I5 | The consumer docs shipped in the package. | The packed package alone passes its outer tests on Linux, macOS and Windows, ready to publish as `kaal-guard@0.0.1`. |
| **guard/C5** External | guard/I6 | The External tooling and its instructions. | A delivered Change works in a fresh target and contains no KAAL element. |
| **guard/C6** Package identity | guard/I5 | The package is named `@kaihacksai/kaal-guard` (guard/N6); the command, the Capability and the repository keep their names. It lands as two Changes: the outer tests expecting the scoped name, which touch only the boundary and travel alone, then the package manifest, KAAL's development dependency and lockfile, the consumer docs and the hook line `init` prints. It is not part of guard/C5: an External delivery leaves no package dependency at all. | guard/T30 names the scoped package, and the packed package alone passes its outer tests on Linux, macOS and Windows. |
| **R1** Release | — | Publication of `@kaihacksai/kaal-guard@0.0.1`, a bounded Change of its own: the packed contents inspected, a clean install and its tests verified, and a publishing workflow with the npm bootstrap and Trusted Publishing steps proposed to the Owner. Its workflow travels alone. No release framework, and no change to Guard's runtime. | The Owner accepts the proposal. Nothing is published and no npm credential is created without the Owner's explicit authorization. |

### Consumer upgrade

KAAL is the consumer of its published package, in a disposable clone (guard/A12). KAAL's own development dependency, hook, workflows and `guard.json` do not change (guard/N8).

| Change | Carries | Scope | Verified when |
| --- | --- | --- | --- |
| **K1** PLAN | guard/I5 | guard/I5 extended to the consumer upgrade and adoption, guard/F11–guard/F18, guard/N8–guard/N9, KAAL's adoption assessment in guard/A11, guard/A12, and the planned tests guard/T36–guard/T44 with their intended evidence. No code and no test file. | The Owner accepts the plan. |
| **K2** Harness | guard/I5 | The guard/A12 harness and guard/T36–guard/T44, from `0.0.1` to a `packed` candidate. The boundary rule applies: the tests land as a PLAN Change of their own, before the harness. | Each test's evidence is recorded as found. Each suspicion is established as a Defect or refuted by its test. |
| **K3** Fix | guard/I5 | One bounded package Change for each Defect K2 establishes ([Testing](testing.md#defects)) and the Owner selects, turning its Test Case from RED to GREEN. The tests already exist, so each is a DO Change outside the acceptance boundary. The [K3 Change map](#k3-change-map) gives each one's scope, dependencies and order. | The Defect's Test Case is GREEN against a `packed` candidate, guard/T40 stays GREEN, no other outer test turns RED, and the package's outer tests stay GREEN on Linux, macOS and Windows. The Defect is then recorded as corrected. |
| **K4** Consumer job | — | A non-required job running guard/A12 on the three OSes, so a registry outage cannot block a merge. It travels alone. A separate Engineering decision, not part of K1–K3. | Proposed to the Owner; not authorized. |
| **K5** Publish | — | `0.0.2` through the Guard Release workflow, only with the Owner's authorization and only carrying a K3 Change. | The registry tarball equals the workflow's packed artifact. |
| **K6** Release acceptance | guard/I5 | The `0.0.2` gate: guard/T36, guard/T40, guard/T42, guard/T43 and guard/T64 with the `registry` `0.0.2` (restated in `guard/C30`; see [First release and later upgrades](#first-release-and-later-upgrades)). | All GREEN with `registry` evidence. Only then is the `0.0.2` Release accepted. |

### K3 Change map

This PLAN Change is `guard/C7`. In FANATIC a Change's durable identity is `guard/C<number>`; K3 and K3a–K3d remain only as aliases, and the full map of Guard's Changes is planned in `guard/C12`.

Each K3 Change corrects one Defect in `packages/kaal-guard` and lands in `kaal/guard` on its own. `guard/C23` withdrew `guard/C8`. `guard/C10` now depends on `guard/C23`, and `guard/C9` and `guard/C11` on `guard/C25`, because they record lifecycle state.

| Change | Corrects | Scope | Depends on |
| --- | --- | --- | --- |
| ~~**`guard/C8`** (K3a) Consumer bytes~~ Withdrawn by `guard/C23`, since guard/D4 is retracted | guard/D4 (guard/T44) | Guard edits only its own top-level entries in the text of an existing `guard.json`, inserting, replacing or deleting them, and keeps every other byte. It writes nothing when its entries are unchanged. A `guard.json` that Guard creates keeps today's format. `init`, `upgrade` and `remove` all write through this. | nothing |
| **`guard/C9`** (K3b) New assets | guard/D1 (guard/T38) | In `upgrade`, a managed path that is missing and unregistered is installed under `init`'s rule and registered. A file at that path that the installation record does not register is reported as left untouched. Restated by `guard/C23`. | `guard/C25` |
| **`guard/C10`** (K3c) Existing integration | guard/D3 (guard/T43) | `init` and `upgrade` apply guard/F17's rule: they read only Guard's declared integration contract, as `verify` does, and write the workflow for what remains undeclared, or none. They report each recognized declaration as executed by Guard but not managed. The command layer reads the declarations and passes them to the lifecycle, so the lifecycle still imports no adapter (guard/A7, guard/T29). | `guard/C23` |
| **`guard/C11`** (K3d) Writer version | guard/D2 (guard/T39) | `init` and `upgrade` register each asset's version and SHA-256 in the installation record (guard/F29), and `upgrade` reports the versions it moves between. Restated by `guard/C23`. | `guard/C25` |

This PLAN Change also amends guard/F14, guard/F17 and guard/F18, so K3c and K3d need no PLAN Change of their own, and no planned test changes:
- **K3c and guard/F17.** The rule is limited to Guard's declared contract. In KAAL every `ci` check and the consistency check are declared, so `init` installs no workflow there and reports nine declarations as not managed. guard/T43 asserts that unchanged. The rule's limit is that a consumer job running a check in another form, or a job named like Guard's but declaring nothing, is not recognized. Guard does not interpret GitHub workflow semantics, and KAAL's CI orchestration stays KAAL's (guard/A11).
- **K3d and guard/F14.** Writer provenance is per asset, matching the per-asset SHA-256. It is a separate entry because changing `managed` to hold objects would make `0.0.1` treat every asset as modified on rollback, which breaks guard/F16 and guard/T41.
- **K3 and Guard's installation contract (#335).** K3 imports nothing of Core or Hosting. Its guarantees are standalone ones, and they are the ones an installation contract states: K3a fixes Guard's ownership record to `managed`, `config` and `writers`; K3b installs from the lifecycle's one list of assets, which B3 later moves into the contract; K3c recognizes integration by its declared invocation, not by who wrote it; and K3d records a Guard version, not an installer's, so an asset Core writes from Guard's contract records the same writer. Node stays as it is in K3; Node 24 is B5's.
  - **Mixed versions.** A kept, consumer-modified asset keeps its earlier writer while the others move forward.
  - **Older `guard.json`.** An asset with no writer reads as `0.0.1`.
  - **Rollback.** `0.0.1` keeps the unknown `writers` entry but does not update it, and `remove` under `0.0.1` leaves it behind. The next newer `upgrade` re-records each asset. That is the stated limit.
  - guard/T39 holds as written: after `upgrade`, every unmodified asset records the installed version, and the report names `0.0.1` and that version.

The evidence stays bounded:
- Each Test Case runs against a `packed` candidate, directly and on Linux, as in K2b. Consumer evidence on macOS and Windows needs K4 or a run by hand.
- No version is bumped in K3. So `packed` still carries version `0.0.1`, and guard/T37 and guard/T41 still cannot show an asset's content moving between versions. That waits for K5 and K6.

### guard/C23 Configuration contract

The Owner stopped K3a's DO on #336. Two rulings set the frame:
- **6384007398.** Guard owns its configuration contract and its validation, not the consumer's formatting. It may retract a Requirement, a Test Case or a Defect whose contract was wrong, provided it keeps the evidence.
- **6384194537.** Guard's configuration tells Guard what to guard. Location and format are reconsidered through BASS, with the `kaal-guard` Skill in view. Lifecycle state is kept apart unless that is justified. The format follows who maintains it.

`guard/C23` is the PLAN Change that does this:
- guard/I1 states the model.
- guard/F18 keeps only obligations that hold for every option. Its byte-for-byte wording is superseded, and the old text is kept.
- guard/D4 is retracted and guard/T44 with it, and their evidence is kept ([Testing](testing.md#defects)).
- The options are compared in [Architecture](architecture.md#configuration-options-guardc23), against the Owner's criteria, and the configuration is planned there:
  - `.kaal/config/guard/<name>.md`, Git-tracked, with frontmatter under `core/C5` and a guidance body;
  - state in two scopes: a tracked installation record, `.kaal/state/guard/installation.json`, kept apart from the package's catalogue of published content; and the checkout state, in the Git metadata of the configuration scope Guard wrote;
  - an explicit `--config` path, with the fixed convention as the fallback;
  - strict refusal of undefined members, with diagnostics and a stated extensibility rule.
- guard/F1, guard/F18, guard/A1, guard/A6 and every Requirement that named `guard.json` are restated, and guard/F28 and guard/F29 are added.

It plans the configuration, and approving it accepts that plan. Implementation waits for `guard/C24` and `guard/C25`. Migration was settled by the Owner (#336, 6384215003): `0.0.2` breaks `0.0.1` deliberately, with no migration, dual format or rollback to `0.0.1`. The compatibility contracts are reassessed accordingly:
- guard/I5, guard/F15 and guard/F16 are bounded to `0.0.2` and later.
- guard/F14 no longer reads an unrecorded writer as `0.0.1`.
- guard/T37–guard/T39 and guard/T41 are superseded and re-planned between candidates ([Testing](testing.md#defects)).
- `guard/C11`'s constraint that `managed` keep its `0.0.1` shape falls away.

`run.md`, the package README and the Skill text still describe `guard.json`. They change with the code in `guard/C25`.

The K3 map is reconciled:
- `guard/C8` is withdrawn, and #336 closes unmerged as its record.
- `guard/C9` and `guard/C11` record lifecycle state, so they are rebuilt on `guard/C25`'s state file. `guard/C11`'s rule that `managed` keep its `0.0.1` shape falls away, because the state leaves the declarations.
- `guard/C10` changes no state, so it is unaffected.

| Change | Scope | Depends on |
| --- | --- | --- |
| **`guard/C23`** PLAN | The planned configuration: guard/I1, guard/F1, guard/F18, guard/A1 and guard/A6 restated; guard/F28 and guard/F29 added; guard/T61–guard/T73 planned; guard/D4 and guard/T44 retracted; and this map. No code and no test file | — |
| **`guard/C29`** Guard lane | `engineering/lanes/guard.mjs` and its tests: the required Guard jobs' outer suite is chosen from the form KAAL declares its own checks in, and the lane fails closed, never falling back, when it cannot choose; `test:guard` and `test:guard:plan` | — |
| **`guard/C28`** Lane wiring | The Guard, Guard (macOS) and Guard (Windows) jobs run the lane and its tests. `.github` only | `guard/C29` |
| **`guard/C24`** PLAN of the boundary | The new suite written as whole files in each boundary directory's `plan/`, beside the established suite, which is unchanged and stays the required gate: guard/T61–guard/T73 written, guard/T37–guard/T39, guard/T41 and guard/T44 retired there, and their RED evidence recorded with `test:guard:plan`. It travels alone | `guard/C23`, `guard/C22`, `core/C5`, `guard/C29` |
| **`guard/C25`** Configuration | `.kaal/config/guard/` in the package: the frontmatter parser and schema, the content catalogue in `contract.json`, the installation record, the scoped checkout state, `--config` and discovery, refusal with diagnostics, the two-candidate harness, and the consumer docs and Skill text. It is kept to what `guard/C24`'s tests need. KAAL's `guard.json` becomes `.kaal/config/guard/` in the same Change, which switches the required lane to the planned suite: `guard/C25` merges only with it GREEN | `guard/C24`, `guard/C28`, `core/C5`, `guard/C35`, `guard/C36` |
| **`guard/C31`** Promotion | The planned suite replaces the established files at the top of each boundary directory; `plan/` stays until `guard/C32`. It travels alone | `guard/C25` |
| **`guard/C32`** Lane unwired | The Guard jobs run the top-level suite directly again. `.github` only | `guard/C31` |
| **`guard/C33`** Plan removed | Each boundary directory's `plan/` deleted. It travels alone | `guard/C32` |
| **`guard/C34`** Lane removed | `engineering/lanes/guard.mjs`, its tests and its scripts deleted | `guard/C32` |

### CI responsibility (`guard/C35`)

The Owner reviewed `guard/C25` on #352 (6386490520): Guard provides the machinery for the consumer to register checks and integrate them into its own hooks and CI, and the consumer owns its Test Cases, commands, workflows and the assignment of execution. Guard may validate registrations, execute explicitly assigned checks and report recognized integration, but never infers missing CI responsibility and takes it over. `runs: [ci]` states scope; it triggers nothing.

The PLAN conflicted with that in two places, and `guard/C25`'s DO had followed it:
- guard/F17 had the workflow Guard installs carry a job for each `ci` check no other workflow declares, installed by a bare `init`. `guard/C25` realized it as `kaal-guard list --undeclared` feeding a dynamic matrix that `verify` read as coverage.
- guard/F13 had `upgrade` install any asset the repository lacks, the workflow included.

`guard/C35` restates guard/F8, guard/F10, guard/F13 and guard/F17 and the declared forms in [Run](../../packages/kaal-guard/docs/requirements.md): Guard's workflow is one fixed, catalogued content the consumer opts into with `init --ci`, never installed beside a workflow that already declares a check, and never by `upgrade`; without the opt-in, missing coverage is reported with the step to add. `guard/C36` corrects the planned tests ([Testing](testing.md#planned-outer-tests)). `guard/C25` then drops `list --undeclared` and the dynamic matrix, and keeps its GREEN configuration work.

**Initialization, registration and activation (Owner, #355, 6386981735).** Initialization prepares Guard, registration declares what it may execute, and activation decides where it executes; the consumer owns every activation. `guard/C35` adds guard/F30: `init` prepares the configuration and the installation record and activates nothing; `init --hook` and `init --ci` activate one surface each, and neither implies the other; `run --hook`, `run --ci` and `run --check <name>` execute; `remove --hook` and `remove --ci` undo one activation each, and `remove` both and the record, never touching a declaration or a Test Case. The registration word is `hook`, not `local`, because it names the surface that executes, while `run --check` and `run --ci` run on a developer's machine too; `local` is refused, naming `hook`. `upgrade` installs a new asset only for an activated surface. guard/F1, guard/F4, guard/F8, guard/F13, guard/F17 and guard/F29 follow, `guard/C36` carries the planned tests (guard/T76–guard/T78), and `guard/C25` realizes it.

**Trusted checker mode (Codex on #366, r4368693892).** `materialize` writes each trusted file's bytes but not its mode, so an executable checker named directly as the command cannot start. `guard/C40` restates guard/F7 to keep the mode the base records and plans guard/T81, with guard/D5 suspected. `guard/C41` writes guard/T81 and records it RED, which establishes guard/D5; `guard/C42` fixes `materialize`. guard/F7 is shipped in `0.0.1`, so this is a defect in published behaviour, not planned RED.

**The installation record under Core (the Owner on #373, review 5641784016).** `core/C10` asked who owns the record when Core installs a Capability, and the Owner chose Option A. The Capability's own record decides which of its canonical assets are its own, even when Core installed them. Core's record holds only Core's provider deployments. `core/F33` adopts Guard's record shape (`activated`, and `assets` mapping each path to `{ sha256, version }`), and Core adds no member to it. `guard/C43` restates guard/F29's last bullet to say so. It also aligns guard/F23, which still named `0.0.1`'s `managed` and `writers`. The Owner's two conditions are part of the restated bullet: Core never claims a file because its bytes match a catalogued content, and it keeps the record's Guard members unchanged. Guard's reader already refuses a member it does not define, so it needs no code change. The round trip between Core and the packed Guard is Engineering's scenario, after `core/C13`.

**One frontmatter parsing contract (Owner, #360, 6389758902).** `core/C11` recognizes a typed artifact with Graph's Form reader, which refuses a non-string key. KAAL's declarations with `outcomes: {4: held}` have an integer key, so KAAL's own Engine rejected them. The Owner chose one common contract over a second, lenient reader. `guard/C38` restates guard/F1: outcome statuses are double-quoted, `{"4": held}`, and an unquoted status key is refused, naming the quoted form; meaning and verdicts are unchanged. It plans guard/T79 and guard/T80. `guard/C39` writes them in the boundary, and `guard/C25` realizes the refusal and quotes KAAL's three declarations.

**Published-`0.0.1` consumer evidence (Owner, #352, 6386915109).** guard/T36 and guard/T42 install the published `0.0.1` in a KAAL clone. `guard/C25` converts KAAL to `.kaal/config/guard/`, which `0.0.1`'s root `guard.json` assumption cannot read, so they fail there. That is a version-specific fixture mismatch, not evidence against their obligations. Their failures are kept as explicit transitional evidence and are never counted GREEN, and `guard/C25` does not change them. `guard/C37`, a separate PLAN Change of the acceptance boundary, revises their consumer setup for the `0.0.2` configuration without weakening an assertion. `guard/C20` then proves both against the published `0.0.2` from the registry.

The lane is a bounded transition with planned removal (`guard/C32`–`guard/C34`), agreed on #344 (6385044079, 6385265377). It is not the KAAL-wide model for controlled RED on `kaal/*`, which belongs to another workstream.

`guard/C23` is not an interim correction. It is the configuration architecture for `0.0.2`, and nothing about location, format, ownership or discovery is left for a later PLAN Change.

### Agent guidance

guard/I7 is a separately scoped `0.0.2` improvement. It is planned here and nothing in it is authorized beyond its PLAN Change, `guard/C12`.

**One contract, two levels of realization** (guard/N12). Core owns CASE installation and registration, and may embed Guard. Core owns the Installation Contract Definition, its schema and its outer conformance Test Cases. Guard supplies its installer-neutral instance (guard/F27), and two installers realize it:

| Level | Who | Guarantees | Dependency |
| --- | --- | --- | --- |
| Contract | Core owns the schema and conformance Test Cases; Guard owns its instance | What an installation of Guard is: its assets, the Skill, ownership and lifecycle rules, the Node prerequisite and the provider requirement | none at run time; conformance is verified by KAAL Engineering |
| Standalone conformance | Guard's lifecycle | Local correctness within the contract: the hook, the workflow and the Skill at `.agents/skills/kaal-guard/`, with the reminder naming it | none; Embed keeps zero KAAL dependencies |
| Core enrichment | Core, through Hosting where Core chooses | CASE registration, provider-aware deployments and pointers, dependency and conflict handling, cross-Capability verification | Core reads Guard's contract; Guard never imports Core |

The two levels are not feature-equivalent. Standalone, Claude Code reaches the Skill through the reminder or a consumer's pointer (O1). Native discovery for Claude Code needs Core enrichment.

**Modes.**
- Engineering: KAAL realizes its own Skills, Guard's among them, through Core (#258), and runs Core's conformance Test Cases against Guard's instance.
- External: Engineering's tooling writes the canonical deployment, and may use Core at delivery for further ones. The target owns plain files.
- Embedding: none toward KAAL. The earlier `Guard → kaal-core` dependency is withdrawn, because no Guard behaviour needs it.

**Node.** `0.0.2` raises Guard's floor from 20 to 24, consistent with Core, Graph and Hosting. This is a breaking consumer prerequisite: guard/N1 documents it, and guard/T59 tests that an older Node is refused with that next step.

The Changes for this, with K3's and the release's, are mapped in [Change identities](#change-identities). KAAL stays a Guard executor (guard/A11): it receives Guard's Skill through Core's realization, not through Guard's lifecycle.

guard/C3 lands as four Changes, guard/C3a, guard/C3b, guard/C3b2 and guard/C3c, because `.github` travels alone (Change Isolation): guard/C3c's jobs need the command guard/C3a installs and the checks guard/C3b lists, and its `pull_request_target` jobs run from the default branch (GitHub's rule since December 2025), so their checks must run from a default-branch checkout (guard/C3b2) and can only be observed once promoted. The Owner accepted the first split on #293. guard/T35 needs `kaal-guard verify`, so the `Guard` job gains `verify` in guard/C4c, which travels alone, and guard/T35 turns GREEN there. guard/C4 lands as four Changes for the same reasons: `verify` (guard/C4a) comes before the job that runs it (guard/C4c), the lifecycle (guard/C4b) is the largest piece and is reviewed on its own, and the docs (guard/C4d) describe what guard/C4a and guard/C4b ship.

### 0.0.2 release boundary

The Owner set this boundary in Slack (#kaal, 2026-10-24); this section is its durable record. `0.0.2` ships first, and it is the machinery `guard/C23` planned: consumers declare checks in `.kaal/config/guard/<name>.md`, Guard validates and executes them deterministically through the local hook and GitHub CI, Embed and External deliver the canonical kaal-guard Skill, and a failure or a cannot-judge result directs the agent to actionable guidance. The release is complete only when its isolated Changes, their TDD evidence over several loops, the verification on three OSes and the `registry` acceptance (`guard/C20`) are all done.

**Accepted limitation.** In `0.0.2`, Guard does not establish that a registered consumer Test Case is unchanged since its accepted PLAN baseline. A changed test can still return GREEN, and that is not a Guard integrity guarantee. `guard/C19`'s release notes and the consumer guidance (run.md, the package README and the Skill) state this plainly.

**`0.0.3` hardening candidate.** `guard/C26` (Issue #340) coordinates Test Case integrity and registration with Testing (evidence semantics), Sealing (cryptographic integrity), Change (the accepted PLAN baseline) and Change Isolation (authorization). Guard invokes and reports; it neither duplicates their ownership nor re-baselines silently. It is outside the `0.0.2` critical path, and nothing in `guard/C19` or `guard/C20` depends on it.

### 0.0.3

A review of the published `0.0.2` on 2026-10-26 found five gaps; `guard/C76` plans their correction. The Owner chose that Guard detects and refuses a candidate that changes a trusted check's declaration (guard/D16, `guard/C79`), and that the README states the boundary that remains. guard/D17, the package's `npm test` running the retired suite, is corrected by `guard/C86` (see below). The lane's planned removal (`guard/C32`–`guard/C34`) follows. The three documentation gaps go to `guard/C80`. `guard/C26` (Issue #340) remains the `0.0.3` hardening candidate and is decided on its own.

**The correction of guard/D17 moves out of the boundary (`guard/C84`).** A boundary Change travels alone, so it cannot also remove guard/T98 from `red.json`, and the lane fails a registered Test Case that passes. `guard/C31` would turn guard/T98 GREEN the moment the planned suite sits at the top level, which the package's `test` script already runs. So guard/D17 is corrected by `guard/C86` instead, outside the boundary: the package's `test` script runs the planned suite in `plan/`, and `red.json` drops guard/T98 in the same Change. It follows `guard/C79`, since guard/T98 runs the whole suite. `guard/C31` then promotes the planned suite and touches only the boundary, `guard/C87` points the `test` script at the top level, and `guard/C33` deletes `plan/` after both.

**Scope of the `0.0.3` path (the Owner on #454, review 5653361664).** `guard/C31`–`guard/C34`, the planned suite's promotion and the transitional lane's removal, are on the `0.0.3` path. `guard/C26` (Issue #340) is a separately authorized hardening candidate: `guard/C79` takes none of its responsibilities, and neither `guard/C81` nor `guard/C83` depends on it. `guard/C18` stays proposed and unauthorized and gates nothing. Guard owns its behaviour and its Test Cases; Testing owns what `packed` and `registry` evidence mean, Sealing owns cryptographic integrity and Change Isolation owns authorization, and Guard implements none of them.

**Publication and release acceptance of `0.0.3`.** guard/T65–guard/T68 need two published versions of the same configuration line, so they could not gate `0.0.2` ([below](#first-release-and-later-upgrades)). `0.0.3` is the first version with a published predecessor in the line, so it is the first that can establish their `registry` evidence. Three kinds of evidence are kept apart, and publication never depends on evidence that only publication can produce:

| | Evidence | When | What it decides |
| --- | --- | --- | --- |
| (a) | `packed`, simulated (guard/N9): guard/T65–guard/T68 between two `packed` candidates, as since `guard/C25`; and between the published `0.0.2` from the registry as the older and the packed `0.0.3` candidate as the newer (`guard/C82`), after `guard/C81`'s version bump | before publication | whether Guard Release may be dispatched for `0.0.3` (`guard/C81`) |
| (b) | `registry`: guard/T65–guard/T68 between the published `0.0.2` and the published `0.0.3`, both installed from the registry (`guard/C82`) | after publication | nothing on its own; it is the evidence (c) reads |
| (c) | Release acceptance (`guard/C83`): guard/T65–guard/T68 GREEN with (b) | after publication | only then is `0.0.3` accepted |

The Test Cases and their assertions stay as they are. They show movement only when the newer version's managed workflow differs from the older one's, the newer manages a hook-surface asset the older lacks (guard/T66), and the newer's catalogue holds the older's content. A pair that does not meet this is blocked before its behavioural assertion: never GREEN, so it cannot accept `0.0.3`. The mixed pair in (a) shows before publication whether `0.0.3` meets it. If it does not, Guard Release is not dispatched for `0.0.3` until the Owner decides, and no asset is added only to make these tests observable.

**The managed workflow's own comment (`guard/C88`, the Owner on #476, review 5655507263).** `templates/guard.yml` says it runs everything "in one job", but it has two, `Guard` and `Guard checks`: a consumer-facing documentation defect in a managed asset. `guard/C88` corrects the comment in its own Change before `guard/C81`, and the catalogue holds both the `0.0.2` and the `0.0.3` content of `.github/workflows/guard.yml`, so `upgrade` recognises an unmodified `0.0.2` workflow and moves it. The correction is made for its own sake. Its side effect is that `0.0.3`'s managed workflow differs from `0.0.2`'s, which the pair needs for guard/T65, guard/T67 and guard/T68. guard/T66 still needs a hook-surface asset `0.0.3` lacks, and is not claimed as covered.

**Evidence (a) for `0.0.3` (`guard/C81`).** This was run on kaal/guard at 5460181 with the version bumped to `0.0.3`, on 2026-10-26 on Linux, with Node 24.22.1, npm 11.19.1 and Git 2.43.0. All of it is `packed` evidence, and none of it is `registry` evidence.

| Pair | Command | guard/T36, T40, T42, T43, T64 | guard/T65 | guard/T66 | guard/T67 | guard/T68 |
| --- | --- | --- | --- | --- | --- | --- |
| two `packed` candidates (simulated) | `node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs` | GREEN | GREEN | GREEN | GREEN | GREEN |
| mixed: `registry` `0.0.2` → `packed` `0.0.3` | `GUARD_CANDIDATES=registry:0.0.2,packed node --test --test-concurrency=1 engineering/guard/acceptance/consumer/*.test.mjs` | GREEN | GREEN | blocked before behavioural assertion: the newer candidate adds no asset to the hook surface | GREEN | GREEN |

The mixed pair shows that `0.0.3` meets the precondition for guard/T65, guard/T67 and guard/T68, through `guard/C88`'s workflow difference, and does not meet it for guard/T66. So guard/T66 cannot be GREEN in `guard/C83`, and under [the rule above](#003) Guard Release is not dispatched for `0.0.3` until the Owner decides.

**The Owner's decision for `0.0.3` (#483, review 5656060084).** Guard `0.0.3` proceeds to promotion and Guard Release. For the `0.0.2`→`0.0.3` pair, guard/T66 is recorded as not exercised: it is neither GREEN nor a behavioural failure. Its behaviour stays exercised between simulated candidates, which is `packed` evidence. `guard/C83` accepts `0.0.3` on guard/T65, guard/T67 and guard/T68 with `registry` evidence, and records guard/T66 as not exercised for this pair. No asset is added to make it observable. guard/T66 is revisited when a genuine release adds a hook-surface asset.

**The pre-release review of `0.0.3` (`guard/C91`, the Owner's choice on 2026-10-26).** A review of main at 311e3d4, as an adopter, held the Release on one blocker and found three should-fix gaps. The Owner chose to correct all four before Guard Release, each in its own Change into kaal/guard, with the version still `0.0.3` and no template changed, so the catalogue's hashes stay as they are.

- guard/D18 (`guard/C92`). With `run --ci` or `run --hook`, the runner adds a check the base trusts back to the run only when the candidate deleted its declaration. A candidate that keeps the declaration but changes `runs` to drop the surface being run takes the check out of the run: it is never compared with the base, and the run passes. guard/T94–guard/T96 change `trusted`, `command` and `outcomes` and delete the declaration, but none changes `runs`. guard/T100 proves it, both for `ci` and for `hook`.
- **`guard/C93`.** Plain `init` still says Guard's workflow "runs every ci check in one job"; it has two, `Guard` and `Guard checks`, as `guard/C88` corrected in the workflow's comment.
- **`guard/C94`.** `verify` reads a step as Guard's declared form when the `run:` line only begins with the invocation, so `npx --no kaal-guard run --check unit --github || true` declares `unit` while the step can never fail. The invocation's end is anchored, as the `verify` form already is.
- **`guard/C95`.** Plain `init` says nothing about a registered surface file the repository no longer has, such as `.githooks/pre-push` while `core.hooksPath` still points at it, though the README says it is reinstalled and reported. Plain `init` lists it under still to do, naming the `init` that reinstalls it, and the README says the reinstall needs the surface's flag.

The lane and its `red.json` are gone (#501), so a Test Case written RED in the boundary would land as a red check, and none is marked `todo` or `skip`. guard/T100 is therefore an inner Code test, written in `guard/C92` beside the correction, and its RED run on the uncorrected runner is recorded in that Change's pull request. The same holds for the Code tests of `guard/C93`–`guard/C95`. Whether guard/T100 moves into the boundary later is the Owner's call.

**Publication and release acceptance of `0.0.3` (`guard/C83`).** Guard Release published `@kaihacksai/kaal-guard@0.0.3` on 2026-10-26 (run 40395111724, from main at bf57539, #509, the `npm` environment approved by the Owner), with provenance. Evidence (b) and (c) are recorded in [Testing](testing.md#release-acceptance-of-003-guardc83): between the published `0.0.2` and the published `0.0.3`, both installed from the registry, guard/T65, guard/T67 and guard/T68 are GREEN, and guard/T66 is not exercised for that pair, as the Owner decided on #483. `0.0.3` is accepted.

### Consumer verification (`0.0.4`)

The Owner directed on 2026-10-27 that Guard `0.0.4` becomes verifiable by any npm consumer, and that KAAL Testing states the reusable semantics (guard/I8). The proposal was aligned with Core, which owns kaal-testing, in #kaal (canvas F0CCGQ35B29). This PLAN carries it into Guard's documents.

**Option A, the Owner's decision.**
- **What ships.** The package ships its outer acceptance cases and a small entry, run through npm's own `npm explore <package> -- npm test`.
- **Why not B or C.** A `kaal-guard test` command (B) adds a surface for no gain the consumer needs. A harness delivered by KAAL Testing (C) would make Guard depend on another KAAL element (guard/N6), and kaal-testing is not published.
- **Reuse.** The 71 outer acceptance cases are reused unchanged.
- **Why the entry.** It is what a bare `npm test` cannot be: fail-closed, three-valued and self-checking (guard/F33–guard/F35).

**The Owner's decisions (#kaal, 2026-10-27).** The three options of the joint proposal are settled:
1. **Invocation: option A.** The consumer runs npm's own `npm explore @kaihacksai/kaal-guard -- npm test`. A package-owned command alias may be evaluated later and is not part of this decision.
2. **Scope: acceptance cases only.** Guard ships its product-owned consumer acceptance cases, not its engineering or unit tests.
3. **`cannot verify` exits 2.** The three results stay distinct: `verified` (0), `failed` (1) and `cannot verify` (2). A run in which no case executed is never `verified`.

The decisions authorize no implementation, version bump, release or publication. Guard's cases stay separate from Testing's reusable semantics, and the acceptance scenario stays an unrelated consumer, the installed distribution and a non-destructive run. This PLAN is the bounded authorization request: its approval authorizes `guard/C98` only, and the bump, the release and publication each still need their own.

**Order.**
1. testing/C9 PLAN, Core's Definition-only Change, lands first, because guard/N13 cites its identifiers.
2. `guard/C97`, this PLAN. Documents only.
3. `guard/C98` writes guard/T101–guard/T106 with their RED evidence, then the entry, the manifest, the `files` change and the README section.
4. `guard/C99` sets the version to `0.0.4`, with its release notes.
5. The promotion follows.
6. Guard Release publishes `0.0.4` (`guard/C100`), with the Owner's approval of the `npm` environment.
7. `guard/C101` records release acceptance.

**What release acceptance of `0.0.4` (`guard/C101`) requires:**
- guard/T101–guard/T106 GREEN against the `packed` candidate on Linux, macOS and Windows;
- after publication, guard/T101–guard/T103 and guard/T105 GREEN against `@kaihacksai/kaal-guard@0.0.4` installed from the registry, on Linux, with the registry's integrity recorded beside the lockfile's;
- guard/T65, guard/T67 and guard/T68 GREEN between the published `0.0.3` and `0.0.4`.

**Limitations the README states:**
- The verification shows that the delivered cases pass on the consumer's machine, within their coverage. It does not show this repository's integration, its own checks, or complete correctness.
- The manifest detects a changed installed copy, but it is not npm provenance.
- Registry evidence is from Linux alone.

### The complete product (`0.0.4`)

On #536 (2026-10-27) the Owner set two principles. First, each package carries its complete, canonical consumer-facing specification and its Test Cases, owned by responsibility, not loop depth. Second, Engineering and Product are separated cleanly, with one authority for a shared concern. The Owner approved `guard/C98` as bounded and left the rest to this PLAN and its DO review. `guard/C102` applies the principles: guard/I9, guard/F37–guard/F40, guard/N14, guard/A19, guard/A20 and the planned guard/T107–guard/T112.

**Where each asset goes.** The layout proposed on #536 is the basis:
- **Product, delivered** (`packages/kaal-guard/`):
  - the product Intent, Requirements, Architecture, Testing and Limitations in `docs/`;
  - Operations in the README and the Skill;
  - `bin/`, `lib/`, `templates/` and `contract.json`;
  - the outer cases in `test/acceptance/`;
  - the inner Code tests in `test/unit/`;
  - the verification entry and its manifest.
- **Engineering, not delivered** (`engineering/guard/`): as guard/A20 lists.
- **Split documents.** `intent.md`, `requirements.md`, `architecture.md` and `testing.md` each split by identifier. Engineering keeps only its own identifiers and cites the product's.
- **The Defect register.** Its consumer statement goes to `docs/limitations.md`. Its RED traces stay Engineering evidence.

**Order.** It replaces steps 4 to 7 of [Consumer verification](#consumer-verification-004):
1. `guard/C102`, this PLAN. Documents only.
2. `guard/C103` moves the product contract into the package and adds the authority check:
   - guard/F37, guard/N14, guard/A19's documents and guard/A20;
   - guard/T107 and guard/T111, written RED first.

   External's derived templates and guard/T112 moved to `guard/C105`, as [Testing](testing.md#the-complete-product-004) records. `guard/C103` enforces guard/N14's Definitions. It does not meet Derived assets.

   Every identifier keeps its text and its number, and no accepted test is weakened.
3. `guard/C104` ships the inner loop and makes the verdict judge loops, coverage and applicability:
   - guard/F38–guard/F40;
   - guard/T108–guard/T110, written RED first;
   - `test/unit/`, the manifest's new members and the entry;
   - the coverage choice for each identifier no case cites today.

   It depends on `guard/C103`, because coverage needs the product identifiers in the package.
4. `guard/C99` sets the version to `0.0.4`, with its release notes.
5. The promotion follows, with its sync immediately before it.
6. `guard/C100` publishes, with the Owner's approval of the `npm` environment.
7. `guard/C101` records release acceptance. To what [Consumer verification](#consumer-verification-004) requires, it adds guard/T107–guard/T111 GREEN against the `packed` candidate on Linux, macOS and Windows. guard/T112 is not part of it: it comes with `guard/C105`.

All of it collects in `kaal/guard-verify` as one Guard `0.0.4` increment. This PLAN authorizes `guard/C103` and `guard/C104` only. The bump, the promotion, the release and publication each still need their own approval.

**`guard/C105`: External's derived templates, after `0.0.4`.** guard/N14 requires External's templates to be derived from the package's assets. `guard/C105` meets that requirement and does not weaken it.
- **Scope.** There are three pairs, each a template in `engineering/guard/external/templates/` and the product asset it derives from:
  - the hook, `pre-push`, with its `guard.sh`, from the package's `templates/pre-push`;
  - the workflow, `guard.yml`, from the package's `templates/guard.yml`;
  - the Skill, `skills/kaal-guard/SKILL.md`, from the package's `skills/kaal-guard/SKILL.md`.

  For each pair, the External tooling declares one transformation that produces the template from the product asset. The transformation carries what External does differently, the `guard.sh` runner and one CI job per check, as declared, reviewable steps rather than a copy kept by hand. `GUARD.md` has no product counterpart, so it is External's own asset and outside guard/N14's Derived assets.
- **The Test Case, written RED first.** guard/T112: for each pair, applying the declared transformation to the current product asset gives the template byte for byte. guard/T112 fails, naming the template, when a template has no declared transformation or differs from what the transformation gives. Its RED run is recorded in `guard/C105`'s pull request before the transformation lands. It runs in the `Engineering` job.
- **Accepted when** all of these hold:
  - guard/T112 is GREEN;
  - External's delivery cases, guard/T3, guard/T56, guard/T83 and guard/T93, stay GREEN with unchanged assertions;
  - guard/N14 records Derived assets as enforced.

  If a template cannot be produced from its product asset by a declared transformation, `guard/C105` does not narrow guard/N14 or its test. Instead it returns to the Owner as a PLAN that proposes how to amend guard/N14.
- **Approval.** `guard/C105` is not part of the `0.0.4` increment and is not authorized by this PLAN. It is raised as its own Change, under its own approval.

### First release and later upgrades

Accepting the first published `0.0.2` must not wait on a version that does not exist yet. The consumer Test Cases split by how many published versions they need (restated in `guard/C30`):

| Test Case | Needs | `0.0.2` Release acceptance (`guard/C20`) |
| --- | --- | --- |
| guard/T36, guard/T42 | the published `0.0.2` in a KAAL clone; their consumer setup is revised for the `0.0.2` configuration in `guard/C37`, a PLAN Change of the boundary before `guard/C20`. Until then their failures on the published `0.0.1` are kept as transitional evidence, never counted GREEN, and gate nothing | gates |
| guard/T40 | `0.0.1` and the published `0.0.2`: `0.0.1`'s `guard.json` is refused with the fresh setup as the next step | gates |
| guard/T43 | the published `0.0.2` on KAAL | gates |
| guard/T64 | the published `0.0.2` | gates |
| guard/T65–guard/T68 | two published versions of the `0.0.2` line | does not gate. Before `guard/C20` they have `packed` evidence between two simulated candidates (guard/N9). Their `registry` evidence gates the Release acceptance of the next published version, the first one that has a published predecessor in the line: `0.0.3`, in `guard/C83` ([Publication and release acceptance of `0.0.3`](#003)) |

The package's outer tests (guard/T1–guard/T35 and guard/T61–guard/T73) stay GREEN on Linux, macOS and Windows against the packed release candidate before `guard/C19`, as for every Release. No evidence is dropped: each test keeps its trace, and its `packed` evidence is recorded as simulated.

## Change identities

A Change's durable identity is `<capability>/C<number>`, numbered by its owning Capability. Guard's Changes up to `guard/C6` keep their labels. Guard's numbers from `guard/C7` on are allocated here: no Guard Change in the repository uses them. The earlier labels R1, K1–K6 and B1–B7 remain only as aliases. Core and Engineering allocate their own numbers: Core allocated `core/C3` and `core/C4`, both merged, and Engineering's are pending. A planned Change is not a pull request: the PR column shows only pull requests that exist.

| Change | Alias | Owner | Scope | Depends on | Pull request |
| --- | --- | --- | --- | --- | --- |
| — | R1 | Guard | `0.0.1` release workflow | — | #320–#326, merged |
| — | K1, K2a, K2b | Guard | Consumer upgrade PLAN, its tests and the guard/A12 harness | — | #329, #330, #332, merged; promoted in #333 |
| `guard/C7` | K3 PLAN | Guard | The Defect map guard/D1–guard/D4 and the amendments of guard/F14, guard/F17 and guard/F18 | — | #334, merged |
| `guard/C8` | K3a | Guard | Withdrawn by `guard/C23`: guard/D4 is retracted | `guard/C7` | #336, withdrawn unmerged |
| `guard/C9` | K3b | Guard | guard/D1 (guard/T38): `upgrade` installs a missing, unrecorded asset. Absorbed by `guard/C25`: its obligation holds there, as guard/T66 shows (`guard/C53`) | `guard/C25` | not created, absorbed |
| `guard/C10` | K3c | Guard | guard/D3 (guard/T43): adoption by the declared integration contract | `guard/C23` | #341, merged |
| `guard/C11` | K3d | Guard | guard/D2 (guard/T39): writer version in the installation record. Absorbed by `guard/C25`: its obligation holds there, as guard/T67 shows (`guard/C53`) | `guard/C25` | not created, absorbed |
| `guard/C12` | B1 | Guard | This PLAN: guard/I7, guard/F19–guard/F27, guard/N1, guard/N10–guard/N12, guard/A13–guard/A17, guard/T45–guard/T59. No code and no test file | — | #335, merged |
| `guard/C13` | B2 | Guard | guard/T45–guard/T59, as a PLAN Change inside the acceptance boundary | `guard/C12` | #381, merged |
| `guard/C14` | B3 | Guard | The Skill source, shipped by the package; guard/T45, and guard/T46 for the Embed Skill. Guard's `contract.json` instance moved to `guard/C51` (the Owner's review 5643704078 on #402) | `guard/C13` | #402, merged |
| `guard/C15` | B4 | Guard | The reminder; guard/T47–guard/T49, and guard/T82 with `guard/C16` | `guard/C14` | #407, merged |
| `guard/C16` | B5 | Guard | The standalone lifecycle realizes the instance; Node 24; guard/T50–guard/T54, guard/T57, guard/T59, and guard/T82 with `guard/C15` | `guard/C14`, `guard/C51`, `guard/C25` | #428, merged |
| `guard/C17` | B6 | Guard | External: the canonical variant, and Core's further deployments at delivery; guard/T56, guard/T83 for Core's part, and guard/T46 for the External variant | `guard/C14`; `core/C4` for Core's part | #414, merged |
| `guard/C45` | — | Guard | The Guard lane holds the Feature REDs registered in `engineering/guard/red.json` on `kaal/guard`, and fails any other target while one is registered (the Owner's reviews 5643242085 and 5643271116 on #381 and #389) | `guard/C29` | #389, merged |
| `guard/C46` | — | Guard | The placements the Owner decided on #381 (5643242085): guard/T46 runs only where KAAL's workspace is installed; guard/T56's Core-at-delivery part becomes guard/T83; guard/T82 for the reminder naming the deployed Skill; guard/T58's and guard/A15's stale texts. No code and no test file | `guard/C13`, `guard/C45` | #390, merged |
| `guard/C47` | — | Guard | The Guard lane selects `engineering/guard/acceptance/plan/workspace.test.mjs`, guard/T46's file, only on the host that installs KAAL's workspace, and `red.json` registers guard/T83 as a Feature RED until `guard/C17` | `guard/C46` | #391, merged |
| `guard/C48` | — | Guard | guard/T46 moved to `engineering/guard/acceptance/plan/workspace.test.mjs`, guard/T56 without Core at delivery, guard/T82 and guard/T83 written in the boundary. It travels alone | `guard/C47` | #392, merged |
| `guard/C49` | — | Guard | The Guard lane builds KAAL's workspace (`npm run build`) before it runs `engineering/guard/acceptance/plan/workspace.test.mjs`; a failed build is cannot run, never a held Feature RED | `guard/C47` | #394, merged |
| `guard/C50` | — | Guard | This map update: `guard/C46`–`guard/C49` merged, `guard/C49` allocated. `main` reached `kaal/guard` for `guard/C14`, `guard/C17` and guard/T83 by the synchronization #393 | `guard/C49` | #401, merged |
| `guard/C51` | — | Guard | Guard's `contract.json` as an instance of Core's Installation Contract format, the Skill among its assets, and the lifecycle reading its assets only from it, with no second list in Guard's code; guard/T58. Mandatory before `guard/C16` and the `0.0.2` release (the Owner's review 5643704078 on #402) | `guard/C14`; `core/C13` on `main` and synchronized into `kaal/guard` | #424, merged |
| `guard/C52` | — | Guard | This map update: the split of `guard/C14` and `guard/C51` | `guard/C50` | #403, merged |
| `guard/C53` | — | Guard | guard/D1 and guard/D2 after `guard/C25`: their obligations hold (guard/T66, guard/T67 GREEN, `packed`), their traces stay on guard/T38 and guard/T39, and `guard/C9` and `guard/C11` are absorbed | `guard/C52` | #406, merged |
| `guard/C54` | — | Guard | The pre-plan copy of guard/T3 (`engineering/guard/acceptance/external.test.mjs`) retired; the planned guard/T3 in `plan/external.test.mjs` holds, and accepts the Skill's own name and canonical path. A boundary change, so it travels alone, before `guard/C17` | `guard/C13` | #410, merged |
| `guard/C55` | — | Guard | This map update: `guard/C14`, `guard/C15`, `guard/C17` and `guard/C50`–`guard/C54` merged; `guard/C54` allocated | `guard/C53` | #415, merged |
| `guard/C56` | — | Guard | guard/T58 and guard/T66 read an asset's location as Core's format names it (`target`). A boundary change, so it travels alone, before `guard/C51` | `guard/C13` | #421, merged |
| `guard/C57` | — | Guard | The Skill's source bytes kept exact on every host (`packages/kaal-guard/.gitattributes`: `skills/** -text`), so guard/T50 holds on Windows | `guard/C51` | #425, merged |
| `guard/C58` | — | Guard | guard/T52 expects the files `remove` keeps in the order the harness lists them; the expected set is unchanged. A boundary change, so it travels alone | `guard/C51` | #427, merged |
| `guard/C59` | — | Guard | guard/T52 leaves `engineering/guard/red.json`, as the Owner's review 5643976113 on #427 asks of a separate Guard Change | `guard/C58` | #429, merged |
| `guard/C60` | — | Guard | This map update: `guard/C16`, `guard/C51`, `guard/C55` and `guard/C56`–`guard/C59` merged; `guard/C56`–`guard/C60` allocated. The Feature RED register is empty | `guard/C59` | #430, merged |
| `guard/C61` | — | Guard | PLAN from the `0.0.2` release review (the Owner's choice of 2026-10-25 to correct all nine findings): the amendments of guard/F2, guard/F5, guard/F8, guard/F10, guard/F13, guard/F17, guard/F27–guard/F29 and guard/N1; guard/T84–guard/T92 planned; guard/D6–guard/D14 suspected. No code and no test file | `guard/C60` | #431, merged |
| `guard/C62` | — | Guard | `engineering/guard/red.json` registers guard/T84–guard/T92 as Feature REDs, each until its correcting Change, before they are written | `guard/C61` | #432, merged |
| `guard/C63` | — | Guard | guard/T84–guard/T92 written in the boundary and recorded RED, establishing guard/D6–guard/D14. It travels alone | `guard/C62` | #433 |
| `guard/C64` | guard/D6, guard/D13 | Guard | Declarations: a non-regular entry and a non-canonical `outcomes` key are refused | `guard/C63` | not created |
| `guard/C65` | guard/D7, guard/D8 | Guard | Bytes and mode on every host: Guard's `.gitattributes` assets, and the `--chmod` step `init --hook` reports | `guard/C63` | not created |
| `guard/C66` | guard/D10, guard/D12 | Guard | Lifecycle: a missing registered asset is reinstalled; `remove` deletes only the empty default configuration directory | `guard/C63` | not created |
| `guard/C67` | guard/D11, guard/D14 | Guard | Unreadable workflow entries and an older Git are cannot judge | `guard/C63` | not created |
| `guard/C68` | guard/D9 | Guard | Guard's workflow: pinned current actions, Node 24, expressions through `env:` | `guard/C63` | not created |
| `guard/C69` | — | Guard | The README's Skill lifecycle (`upgrade`, `remove`) and the `0.0.2` release notes: the breaking changes, the fresh setup and the accepted limitation | `guard/C64`–`guard/C68`, `guard/C74` | not created |
| `guard/C70` | — | Guard | The `0.0.2` version in `package.json` and `contract.json`, then the promotion of kaal/guard to `main` | `guard/C69` | not created |
| `guard/C71` | — | Guard | PLAN for the External delivery's workflow (the Owner's choice of 2026-10-25 to correct it in `0.0.2`): guard/F5 and guard/N5 amended for it; guard/T93 planned; guard/D15 suspected; guard/T92's wording follows #433. No code and no test file | `guard/C61` | not created |
| `guard/C72` | — | Guard | `engineering/guard/red.json` registers guard/T93 as a Feature RED until `guard/C74`, before it is written | `guard/C71` | not created |
| `guard/C73` | — | Guard | guard/T93 written in the boundary and recorded RED, establishing guard/D15. It travels alone | `guard/C72` | not created |
| `guard/C74` | guard/D15 | Guard | The External delivery's workflow: pinned current actions, expressions through `env:` | `guard/C73` | not created |
| `guard/C75` | — | Guard | Guard Release's Pack job tests `0.0.2` with the planned package suite, not the retired `0.0.1` one, found when dispatching `guard/C19`. `.github` only | `guard/C70` | #452, merged; promoted in #453 |
| `guard/C76` | — | Guard | PLAN from the review of the published `0.0.2` (the Owner's choice of 2026-10-26: detect and refuse): guard/F7 and guard/N6 amended, and the README's statements; guard/T94–guard/T98 planned; guard/D16 and guard/D17 suspected; publication of `0.0.3` kept apart from its release acceptance, which guard/T65–guard/T68's `registry` evidence gates (`guard/C82`, `guard/C83`). No code and no test file | `guard/C19` | #454, merged; promoted in #492 |
| `guard/C77` | — | Guard | `engineering/guard/red.json` registers guard/T94–guard/T96 until `guard/C79`, and guard/T98 until `guard/C31`, before they are written | `guard/C76` | #455, merged; promoted in #492 |
| `guard/C78` | — | Guard | guard/T94–guard/T98 written in the boundary and recorded RED, establishing guard/D16 and guard/D17. It travels alone | `guard/C77` | #456, merged; promoted in #492 |
| `guard/C79` | guard/D16 | Guard | The runner judges a trusted check's declaration from the base: a changed or absent one is cannot judge, and so is every check when the base resolves to no readable commit | `guard/C78`, `guard/C85` | #458, merged; promoted in #492 |
| `guard/C80` | — | Guard | The README: what `trusted` guards and the review rule it needs, the hook's working tree, Guard's two jobs, CI on the merge commit; the `0.0.3` release notes | `guard/C79`, `guard/C31` | #476, merged; promoted in #492 |
| `guard/C81` | — | Guard | The `0.0.3` version in `package.json` and `contract.json`, then the promotion of kaal/guard to `main` and Guard Release. Guard Release is dispatched only once evidence (a) of [`0.0.3`](#003) is recorded, the mixed pair included | `guard/C80`, `guard/C20`, `guard/C31`–`guard/C34`, `guard/C82`, `guard/C86`, `guard/C87`, `guard/C88` | #483, merged; promoted in #492, #496 and #501; published by Guard Release on 2026-10-26 |
| `guard/C82` | — | Guard | The guard/A12 harness's `candidates()` builds its pair from two named sources as well as from two `packed` candidates: the published `0.0.2` and the packed candidate, or two published versions, each recorded with its source (guard/N9). Harness only: no Test Case or assertion changes | `guard/C76` | #457, merged; promoted in #492 |
| `guard/C84` | — | Guard | PLAN from the Owner's review of `guard/C79` (#458, 5654346996): a `base` that resolves to no readable commit is cannot judge for every selected check (guard/F7); guard/T99 planned and registered in `red.json` until `guard/C79` | `guard/C78` | #461, merged; promoted in #492 |
| `guard/C85` | — | Guard | guard/T99 written in the boundary and recorded RED; guard/T19's placeholder `base` becomes a commit of the consumer, its facts still passed on unchanged. It travels alone | `guard/C84` | #462, merged; promoted in #492 |
| `guard/C86` | guard/D17 | Guard | The package's `test` script runs `test/*.test.mjs` and the planned suite in `test/acceptance/plan/`; `red.json` drops guard/T98 | `guard/C79` | #464, merged; promoted in #492 |
| `guard/C87` | — | Guard | The package's `test` script runs the promoted suite at the top of `test/acceptance/` | `guard/C31` | #469, merged; promoted in #492 |
| `guard/C88` | — | Guard | The managed workflow's comment names its two jobs, `Guard` and `Guard checks`; the catalogue holds both the `0.0.2` and the `0.0.3` content of `.github/workflows/guard.yml`. Separate from the README (`guard/C80`) | `guard/C80` | #479, merged; promoted in #492 |
| `guard/C89` | — | Guard | The Owner's decision on #483 recorded: `0.0.3` proceeds; guard/T66 is not exercised for the `0.0.2`→`0.0.3` pair, neither GREEN nor a failure, and `guard/C83` accepts on guard/T65, guard/T67 and guard/T68 | `guard/C81` | #487, merged; promoted in #492 |
| `guard/C90` | — | Guard | The `plan/` suite file the main → kaal/guard synchronization carried back in through rename detection removed, so `kaal/guard` holds no `plan/` before its promotion | `guard/C33` | #500, merged; promoted in #501 |
| `guard/C91` | — | Guard | The pre-release review of `0.0.3` mapped: guard/D18 suspected and traced to guard/T100, and `guard/C92`–`guard/C95` planned. No code and no test file. It travels alone | `guard/C89` | #504, merged; promoted in #509 |
| `guard/C92` | guard/D18 | Guard | With `run --ci` or `run --hook`, every check the base trusts for that surface is judged against the base, so a candidate that changes its `runs` is cannot judge; guard/T100 written as a Code test and recorded RED in the Change | `guard/C91` | #505, merged; promoted in #509 |
| `guard/C93` | — | Guard | Plain `init` names the managed workflow's two jobs, `Guard` and `Guard checks` | `guard/C91` | #506, merged; promoted in #509 |
| `guard/C94` | — | Guard | `verify` reads a `run:` line as Guard's declared form only when the invocation is the whole line, so a trailing `|| true`, `;` or `&` declares nothing | `guard/C91` | #507, merged; promoted in #509 |
| `guard/C95` | — | Guard | Plain `init` lists a registered surface file the repository no longer has under still to do, naming the `init` that reinstalls it | `guard/C91` | #508, merged; promoted in #509 |
| `guard/C83` | — | Guard | Release acceptance of `0.0.3`: guard/T65, guard/T67 and guard/T68 GREEN with `registry` evidence between the published `0.0.2` and `0.0.3`, and guard/T66 recorded as not exercised for that pair (the Owner on #483). Recorded after publication; `0.0.3` is accepted only then | `guard/C81` (the publication of `0.0.3`), `guard/C82` | #510 |
| `guard/C96` | — | Guard | The README's `Guard/Check` limitation states what KAAL Core now does with typed artifacts since `core/C10`: Core reports a declaration registered only when a `Guard/Check` Type Definition owned by Guard is admitted, Guard installs none, so declarations are unregistered and `kaal verify` passes on them. Docs only; the published `0.0.3` README is unchanged until the next release | `guard/C83` | #515, merged; promoted in #522 |
| `guard/C97` | — | Guard | PLAN for consumer verification in `0.0.4`: guard/I8, guard/F31–guard/F36, guard/N13, guard/A18 and the planned guard/T101–guard/T106. Documents only; the Owner's three decisions recorded | testing/C9 | #529 |
| `guard/C98` | — | Guard | guard/T101–guard/T106 written with their RED evidence recorded, then the verification entry, its manifest, the package's `files` and `test` script, and the README section. guard/T98 runs the package's own tests by their files, because `npm test` becomes the consumer's verification | `guard/C97` | #536, merged |
| `guard/C102` | — | Guard | PLAN for the complete product in `0.0.4`: guard/I9, guard/F37–guard/F40, guard/N14, guard/A19, guard/A20 and the planned guard/T107–guard/T112, applying the Owner's principles on #536. Documents only | `guard/C98` | #537 |
| `guard/C103` | — | Guard | The product contract moves into the package's `docs/`, and Engineering keeps only its own identifiers. guard/T107 and guard/T111 are written with their RED evidence, and the manifest generator writes the product's trace | `guard/C102` | #538 |
| `guard/C104` | — | Guard | The inner loop ships in `test/unit/`, and the verdict judges loops, coverage and applicability. guard/T108–guard/T110 are written with their RED evidence | `guard/C103` | not created |
| `guard/C105` | — | Guard | External's hook, workflow and Skill templates derived from the package's under guard/N14 by declared transformations, with guard/T112 written RED first; scope and acceptance [above](#the-complete-product-004). Not part of the `0.0.4` increment, and not authorized by `guard/C102` | `guard/C103` | not created |
| `guard/C99` | — | Guard | Version `0.0.4` and its release notes | `guard/C104` | not created |
| `guard/C100` | — | Guard | Publication of `0.0.4` through Guard Release, with the Owner's approval of the `npm` environment | `guard/C99`, the promotion | not created |
| `guard/C101` | — | Guard | Release acceptance of `0.0.4`, as [Consumer verification](#consumer-verification-004) states | `guard/C100` | not created |
| `guard/C18` | K4 | Guard | A non-required job running guard/A12 on three OSes. Proposed, not authorized | — | not created |
| `guard/C19` | K5 | Guard | Publication of `0.0.2`, only with the Owner's authorization, with release notes documenting the breaking changes, the fresh `0.0.2` setup and the accepted limitation of the [release boundary](#002-release-boundary) | `guard/C10`, `guard/C25` for `guard/C9` and `guard/C11`, `guard/C15`–`guard/C17`, `guard/C51`, `guard/C64`–`guard/C70`, `guard/C74`, the conformance evidence | not created |
| `guard/C20` | K6 | Guard | Release acceptance of `0.0.2`: guard/T36, guard/T40, guard/T42, guard/T43 and guard/T64 with `registry` evidence for the published `0.0.2`. guard/T65–guard/T68 do not gate it (restated in `guard/C30`) | `guard/C19`, `guard/C37` | #482; evidence in [Testing](testing.md) |
| `guard/C21` | — | Guard | Every identifier in Guard's documents written Capability-qualified, as the Owner ruled on #334 and #335 | — | #337, merged |
| `guard/C22` | — | Guard | The titles of the test files inside the acceptance boundary qualified the same way. A PLAN Change of the boundary; it travels alone | `guard/C21` | #338, merged |
| `guard/C23` | — | Guard | The `0.0.2` configuration: `.kaal/config/guard/` Markdown declarations, and state in two scopes (a tracked installation record apart from the package's content catalogue, and scoped checkout state in Git's metadata); guard/D4 and guard/T44 retracted; compatibility with `0.0.1` dropped | — | #339, merged |
| `guard/C24` | — | Guard | The new suite in each boundary directory's `plan/`: guard/T61–guard/T73 written; guard/T37–guard/T39, guard/T41 and guard/T44 retired there. It travels alone | `guard/C23`, `guard/C22`, `core/C5`, `guard/C29` | #344 |
| `guard/C25` | — | Guard | `.kaal/config/guard/` in the package, and KAAL's own declarations converted, which switches the required lane to the planned suite | `guard/C24`, `guard/C28`, `core/C5`, `guard/C35`, `guard/C36`, `guard/C38`, `guard/C39` | #352 |
| `guard/C26` | — | Guard | Test Case registration: Guard invokes and reports registered consumer Test Cases, coordinated with Testing, Sealing, Change and Change Isolation. A `0.0.3` candidate, outside the `0.0.2` critical path | Testing, Sealing and Change PLANs | Issue #340; not created |
| `guard/C27` | — | Guard | The `0.0.2` release boundary recorded in this document | — | #342, merged |
| `guard/C28` | — | Guard | The required Guard jobs run the Guard lane (`guard/C29`). `.github` only | `guard/C29` | #347 |
| `guard/C29` | — | Guard | The Guard lane: the outer suite chosen from KAAL's own declarations, failing closed | — | #346 |
| `guard/C30` | — | Guard | guard/F1 names `type: Guard/Check` (core/F6); guard/C20 and K6 name the consumer tests `guard/C23` keeps; guard/T55 retired | `guard/C23`, `core/C5` | #345, merged |
| `guard/C31` | — | Guard | The planned suite promoted to the top of each boundary directory. It travels alone; guard/D17 is corrected by `guard/C86`, not here | `guard/C25`, `guard/C86` | #467, merged; promoted in #492 |
| `guard/C32` | — | Guard | The Guard jobs run the top-level suite directly again. `.github` only | `guard/C31` | #471, merged; promoted in #496 (through #494) |
| `guard/C33` | — | Guard | Each boundary directory's `plan/` deleted. It travels alone | `guard/C32`, `guard/C87` | #474, merged; promoted in #501 |
| `guard/C34` | — | Guard | The Guard lane and its scripts deleted | `guard/C32` | #475, merged; promoted in #501 |
| `guard/C35` | — | Guard | CI responsibility and activation: guard/F8, guard/F10, guard/F13 and guard/F17 restated so that Guard's workflow is an explicit `init --ci` opt-in and missing coverage is reported, not filled; guard/F30 separates initialization from activation (`init --hook`, `init --ci`, `remove --hook`, `remove --ci`) and names the registration `hook`, not `local`; guard/T74–guard/T78 planned. No code and no test file | `guard/C23` | #355 |
| `guard/C36` | — | Guard | guard/C35's correction of the planned tests in each boundary directory's `plan/`, and guard/T74–guard/T78 written. It travels alone | `guard/C35`, `guard/C24` | #356 |
| `guard/C38` | — | Guard | One frontmatter parsing contract: guard/F1 restated so that outcome statuses are double-quoted strings, `{"4": held}`, and an unquoted status key is refused; guard/T79 and guard/T80 planned. No code and no test file | `guard/C35` | #363 |
| `guard/C40` | — | Guard | Trusted checker mode: guard/F7 restated so that a base copy keeps the mode the base records; guard/T81 planned and guard/D5 suspected. No code and no test file | `guard/C38` | #367 |
| `guard/C41` | — | Guard | guard/T81 written in the boundary and recorded RED, establishing guard/D5. It travels alone | `guard/C40`, `guard/C39` | #368 |
| `guard/C42` | guard/D5 | Guard | `materialize` writes each trusted file with the mode the base records | `guard/C41`, `guard/C25` | #370 |
| `guard/C43` | — | Guard | The installation record under Core: guard/F29's last bullet restated so that, when Core manages the installation, Core registers Guard's assets in Guard's own record (the Owner's Option A on #373), and guard/F23's record wording aligned with guard/F29. No code and no test file | `guard/C25`, `core/C10` | #375, merged |
| `guard/C44` | — | Guard | The Change map brought up to date: Core's merged Changes and their PRs, `guard/C37`'s PR, and guard/D5 recorded established and corrected. No code and no test file | `guard/C42`, `guard/C43` | not created |
| `guard/C39` | — | Guard | guard/C38's planned tests written in the boundary: guard/T79, guard/T80, and the package harness writing quoted status keys. It travels alone | `guard/C38`, `guard/C36` | #364 |
| `guard/C37` | — | Guard | PLAN of the boundary: guard/T36 and guard/T42's consumer setup revised for the `0.0.2` configuration (`.kaal/config/guard/`), their assertions unchanged and their transitional failures recorded. It travels alone, and `guard/C20` proves both with the published `0.0.2` | `guard/C25` | #382, merged |
| `core/C3` | A0 | Core | Core's PLAN: the Installation Contract Definition, schema and outer conformance Test Cases (`core/T1`…), and Agent Realization | — | #353, merged; on main through #372 |
| `core/C4` | A1 | Core | Core's realization of contracts and Agent Realization, in `kaal-core`; it travels alone | `core/C3`, `core/C5` | #357, merged; on main through #372 |
| `engineering/C…` (pending) | B7 | Engineering | Engineering runs Core's conformance Test Cases against Guard's instance, then realizes it through Core and runs Guard's `upgrade` and `remove` on the result; the evidence is Guard's | `guard/C51`, `core/C3`; `guard/C16` and `core/C4` for the second part | not created |
| `engineering/C…` (pending) | A2 | Engineering | KAAL realizes its own Skills through Core (#258) | `core/C4` | not created |
| `core/C5` | — | Core | PLAN for Deterministic Frontmatter: the KAAL-wide NFR, the Architecture and the outer conformance Test Cases (#337 comment 6383918695) | — | #343, merged; on main through #351 |
| `core/C6` | — | Core | The generic frontmatter schema format and validator in `kaal-core` | `core/C5` | #350, merged; on main through #351 |
| `testing/C3` | — | Testing | Evidence semantics for frontmatter conformance | `core/C5` | not created |
| `engineering/C…` (pending) | — | Engineering | Applies the frontmatter conformance cases to Capability-owned artifacts, including Guard's declarations in `.kaal/config/guard/` | `core/C6`, `testing/C3`, `guard/C25` | not created |

```mermaid
graph LR
  C7[guard/C7 K3 PLAN] --> C23[guard/C23 configuration PLAN]
  C25 --> C9[guard/C9 guard/D1]
  C23 --> C10[guard/C10 guard/D3]
  C25 --> C11[guard/C11 guard/D2]
  C22[guard/C22 test titles] --> C24[guard/C24 boundary]
  C23 --> C24
  C29[guard/C29 lane] --> C28[guard/C28 lane wiring]
  C29 --> C24
  C28 --> C25
  C24 --> C25[guard/C25 configuration]
  C23 --> C35[guard/C35 CI responsibility, activation]
  C35 --> C36[guard/C36 tests corrected]
  C24 --> C36
  C35 --> C25
  C36 --> C25
  C25 --> C31[guard/C31 promotion]
  C31 --> C32[guard/C32 lane unwired]
  C32 --> C33[guard/C33 plan removed]
  C32 --> C34[guard/C34 lane removed]
  FM5 --> C24
  FM5 --> C25
  C25 --> FE
  C12[guard/C12 B1 PLAN] --> C13[guard/C13 tests]
  C13 --> C14[guard/C14 Skill and contract]
  C13 --> C46[guard/C46 placements]
  C45[guard/C45 RED lane gate] --> C46
  C46 --> C47[guard/C47 lane and register]
  C47 --> C48[guard/C48 T46, T56, T82, T83 written]
  C48 --> C14
  C47 --> C49[guard/C49 lane builds the workspace]
  C49 --> C14
  CP[core/C3 PLAN] --> C51
  C14 --> C51[guard/C51 contract instance]
  C13C[core/C13] --> C51
  C51 --> C16
  C56[guard/C56 T58, T66 read target] --> C51
  C51 --> C57[guard/C57 Skill bytes exact]
  C51 --> C58[guard/C58 T52 order]
  C58 --> C59[guard/C59 T52 leaves red.json]
  C14 --> C15[guard/C15 reminder]
  C14 --> C16[guard/C16 standalone lifecycle]
  C25 --> C16
  C14 --> C17[guard/C17 External]
  C54[guard/C54 old T3 retired] --> C17
  CP --> CR[core/C4 realization]
  FM5[core/C5 frontmatter PLAN] --> CR
  FM5 --> FM6[core/C6 validator]
  FM5 --> TT[testing/C3]
  FM6 --> FE[engineering frontmatter]
  TT --> FE
  CR -.-> C17
  C51 --> EC[engineering conformance]
  CP --> EC
  C16 -.-> EC
  CR -.-> EC
  CR --> EA[engineering #258]
  C9 --> C19[guard/C19 publish 0.0.2]
  C10 --> C19
  C11 --> C19
  C15 --> C19
  C16 --> C19
  C25 --> C19
  C17 --> C19
  EC --> C19
  C35 --> C38[guard/C38 quoted outcome keys]
  C38 --> C39[guard/C39 tests for C38]
  C36 --> C39
  C39 --> C25
  C38 --> C40[guard/C40 trusted mode]
  C40 --> C41[guard/C41 T81 RED]
  C41 --> C42[guard/C42 trusted mode fixed]
  C25 --> C42
  C25 --> C43[guard/C43 record under Core]
  CRC[core/C10 record PLAN] --> C43
  C25 --> C37[guard/C37 T36 and T42 setup]
  C37 --> C20[guard/C20 release acceptance]
  C19 --> C20
```

A dotted edge is needed only for the Core-enriched part of a Change. Every Change is separately owned and lands in its owner's collector. Nothing beyond the PLAN Changes the Owner approved is authorized. `guard/C26` is a `0.0.3` candidate and is not in this graph.

## Stopping conditions

- **Checkpoint E**, after guard/C3c: guard/I1 to guard/I4 are met. A pause point, not completion.
- **Checkpoint M**, after guard/C4d: guard/I5 is also met. Still a pause point.
- **Completion**, after guard/C5 and guard/C6: guard/I1 to guard/I6 are all met, and every outer test is GREEN on all three OSes. Only this is done. Publication (R1) is a separate Owner decision.
- A published version's Release is accepted only when its consumer acceptance (K6) is GREEN with `registry` evidence. Publishing alone is not acceptance.
  - **First published `0.0.2`.** It is accepted on the tests feasible with `0.0.2` alone: guard/T36, guard/T40, guard/T42, guard/T43 and guard/T64 (restated in `guard/C30`).
  - **Cross-version upgrade acceptance.** guard/T65–guard/T68 need a second published version of the `0.0.2` line, so they are never a prerequisite for accepting the first `0.0.2`. Their `registry` evidence is part of the acceptance of the first version that has a published predecessor in the line.
- Pausing at a checkpoint is the Owner's decision. While paused, the unmet outcomes are recorded as unmet.
- A planned outer test that cannot pass without changing the boundary is a PLAN defect. It goes back to PLAN as a new PLAN Change.
- A required check name or OS matrix entry on `main` never changes without the Owner.
