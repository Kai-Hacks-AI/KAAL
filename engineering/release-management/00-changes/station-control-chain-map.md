# Station and control chain: the inventory (PLAN refinement of C14)

Asked by the CPO and Owner on #1377: before C14 is finalized, map the complete chain of stations and controls. This is an **inventory of the control architecture as it is and is planned**. It adds no workflow, ruleset or template, and defines no release model of its own: stations, controls and ids are those of `03-architecture/architecture.md` and the control overview (C9). It reads from `control-chain-assessment.md` and `lifecycle-flow-assessment.md` and does not repeat them. Where an answer is not settled it says **open**.

Reading key. Execution context: **H** hook (feedback), **PR** pull request CI, **MG** merge group, **P** promotion, **B** publication, **S** scheduled. Status: **main** (live), **collector** (merged on `kaal/engineering-release-management`, not on main), **planned**.

## 1. Stations and positions

A station has three positions. **IN** is what admits work, owned by the receiving station. **STOCK** is what is held and kept true while it waits. **OUT** is what lets it leave, owned by the sending station ("pull-oriented", architecture).

| Station | IN (admission) | STOCK (held) | OUT (exit) |
| --- | --- | --- | --- |
| 12-collectors (`kaal/<capability>/<leaf>`) | approve Change F15, isolate Change F6, verify Envelope F19 (planned), test Integration F16, scan Vulnerabilities F8, scan Dependencies F9, verify Ancestry F7 (shape, merge method) | audit Lineage F5 (S); freeze Collector F21 (planned) holds the collector while a promotion is open | the promotion's own admission is main's IN; the collector's OUT check is freeze Collector F21 (nothing targets it) and a fresh, shaped lineage (verify Ancestry F7) |
| 11-main | bind Merge F10, accept Capability F14, approve Promotion F11, serialize Promotion F13, test Candidate F12, isolate Change F6, verify Ancestry F7 | audit Lineage F5 (S) | version Package F3 (the version leaving main for npm); tag before publication (planned, see 3) |
| 10-npmjs | approve Publishing F1 (the `npm` environment) | verify Package F2 (after publication, and the installed check) | none yet |
| root (spans stations) | isolate Change F6, verify Ancestry F7, audit Lineage F5, the scans F8 and F9 are invoked at the positions above; they are not a station of their own | | |

## 2. Transitions and their carriers

A **carrier** is the pull request (or, for npm, the workflow run) that moves work across a transition. The same control may be invoked at several positions; each control has **one authoritative implementation** (the component in the architecture), listed once in section 4.

| Carrier | Moves | Claims a Change Record | Landing | Notes |
| --- | --- | --- | --- | --- |
| PLAN | a Change's plan into a collector | yes (its folder) | squash | adds failing Cases unwired |
| DO | a Change's implementation into a collector | yes | squash | turns its Cases green; subject `<Area> DO: <concern>` |
| ACT | a corrective or cleanup Change into a collector | yes | squash | same carrier shape as DO; the phase says the intent |
| SYNC | `main` into a collector | none | merge commit, nothing after it | carries work main already accepted; Branching decides it is a synchronization |
| Promotion | the whole collector into `main` | none (carries the collector's Changes) | per the merge-method verdict of Branching (`branching.md#promote`) | only `kaal/*` into `main`; fresh; `.github` and Core travel alone; one at a time |
| Hotfix | one urgent correction of an existing capability, through `kaal/hotfix` (established at main's tip, one correction at a time) | per its Change | squash for the Change into `kaal/hotfix`, squash for the promotion into main (`branching.md#hotfix`); then `main` is synchronized into every collector that owns the corrected behavior | the same controls at the same positions as any carrier; the rename to `hotfix/<name>` and the **RED classification are open** (whether a Hotfix owes a failing Case first is not settled) |
| Publication (npm, different transport) | a version on `main` to npmjs | none | a workflow run, not a pull request: Pack, approve Publishing (environment `npm`), publish, accept | a controlled transition like the others, carried by `workflow_dispatch` and the registry, not by a pull request |

## 3. The chain: required control, owner, implementation, context, evidence, decision

One row per control at each position it is invoked. **Owner** is the semantic owner (the capability that states the judgment). **Implementation** is the one authoritative implementation. **Evidence** is the Cases or the check that records it. **Decision** is what the control admits or refuses.

| Position or transition | Required control (id) | Owner | Authoritative implementation | Context | Cases or evidence | Admission or exit decision |
| --- | --- | --- | --- | --- | --- | --- |
| PLAN, DO or ACT into a collector (IN) | isolate Change (F6) | Engineering (open: Change or a KAAL-local mechanism) | `change-isolation/check.mjs` (the hook and CI call it) | H, PR, MG | T7, T8 | admits only a Change whose paths conform (Core alone, `.github` alone) |
| | verify Envelope (F19), planned | Release management | `envelope/verify-envelope.mjs` | PR (check), gate planned | T46 to T53, T61 to T63 | admits a title and body that name the Change and the phase; not required until the Owner sets the cutoff |
| | approve Change (F15) | Release (Change for who may approve) | setting: `kaal/*` ruleset | PR (gate) | T8 | refuses without an approval of the most recent push |
| | test Integration (F16) | owning capabilities, Testing | `lanes/` (`ci.yml`) | PR, MG | T8, T9 | refuses a red lane at the integration boundary |
| | scan Vulnerabilities (F8), scan Dependencies (F9) | the tools | CodeQL, dependency-review | PR, MG | T8 | refuses a known vulnerable code or dependency |
| | verify Ancestry (F7) and bind Merge (F10, merge method) | Release | `lineage/` (to be split by owner) | H, PR, MG | T8 | refuses a lineage not shaped for its carrier, and a wrong merge method |
| Collector STOCK | audit Lineage (F5) | Release | `lineage/` | S, H | T8 | reports every open lineage that does not conform |
| | freeze Collector (F21), planned | Release management | `promotion/freeze-collector.mjs` (not built) | PR, MG | T31 to T37, T54, T55, T64, T65 | while a promotion of `kaal/X` is open, no pull request may target it; retarget first, withdraw second |
| SYNC (main to collector) | verify Ancestry (F7), isolate Change (F6) | Release | `lineage/`, `change-isolation/` | PR, MG | T8 | admits a merge commit that adds nothing main did not accept; judges only the resolutions |
| Collector OUT, Promotion into `main` (IN of main) | accept Capability (F14) | Release | `promotion-source/` | PR, MG | T8 | admits only a `kaal/*` lineage |
| | verify Ancestry (F7), isolate Change (F6) | Release | `lineage/`, `change-isolation/` | PR, MG | T8 | admits only a fresh promotion (its head contains main's tip) that carries Core or `.github`, never both |
| | bind Merge (F10), serialize Promotion (F13) | Release | `lineage/`, `merge-group/`, queue setting | MG | T8 | one at a time; the group is the admitted pull request |
| | approve Promotion (F11) | Release | setting: `main` ruleset | PR (gate) | T8 | refuses without an approval of the most recent push |
| | test Candidate (F12) | owning capabilities, Testing | `lanes/` | PR, MG, P | T8, T9 | refuses a red lane on the candidate |
| main OUT, toward npm | version Package (F3) | Engineering / Release | `release-engine/release.mjs` (Pack) | P | T1 to T3, T11 (specified, not built) | refuses a version that is not new, unique and consistent |
| | tag before publication, planned | Release | tag ruleset and the writer (planned) | P | open | the tag names exactly the released commit; the proof awaits the Owner's import |
| Publication into npmjs (IN) | approve Publishing (F1) | Release | `npm` environment, `release-engine/` | B | T4, T11 | binds record, run, commit and digest and waits for the Owner |
| npmjs STOCK | verify Package (F2) | Release | `release-engine/` (Accept) | B | T5, T11 | the published bytes equal the packed ones; provenance as recorded |
| npmjs OUT | none yet | | | | | open |

## 4. Rules the map states

- **One authoritative implementation per control.** A control invoked at several positions (isolate Change, verify Ancestry, the scans, the lanes) is one implementation called from several contexts, never reimplemented per position. Known duplicates the assessment lists (the path matcher in the boundary workflow, the release judge in Hosting and Change, the approval trio against native settings) are retirements, not designs.
- **Template and hook guidance is not trusted inbound verification.** The pull request template, the hooks and the PR body tell the author what is expected (feedback, **H**). The trusted inbound verification is what the base controls judge from Git, from the base-controlled code: verify Envelope, Branching, Change Isolation, Promotion Source. The exit authorization is the gate, which only an active ruleset or environment application makes protection (`gate`, `setting`). A guidance that is skipped is a directive; a verdict that is not required protects nothing.
- **Hotfix and its RED classification are open.** Neither this map nor C14 settles whether a Hotfix owes a failing Case before its fix, or what a hotfix's collector is called; both stay with the Owner.
- **npm publication is a transition like the others, with a different transport.** Its IN is approve Publishing, its STOCK is verify Package, its OUT is open. It has no pull request, so the carriers' template and envelope controls do not apply; the workflow run and the `npm` environment carry the same decisions.

## 5. How C14 fits this map

C14 defines no station, control or carrier. It changes only the **form in which a Change and a Case are recorded** and feeds the controls above:

| C14 element | Feeds | Position |
| --- | --- | --- |
| the fragment check (folder equals `id`, `targets` against Git's changed paths) | isolate Change F6 and verify Envelope F19 (a new verdict of the existing controls, not a new control) | PLAN, DO or ACT into a collector, PR |
| the merge-group recompute (duplicate C-ID, next free, identities unique, aliases resolve) | bind Merge F10 (queue binding), at the collector's serialized tip | collector IN, MG |
| the promotion body derived from the head's tree | verify Envelope F19 on the promotion carrier | collector OUT, Promotion, PR |
| Case identity `<X-ID>/T<n>` and the ownership rule | the Cases column above (`Cases or evidence`) | every position |

Each C14 verdict is invoked from an existing authoritative implementation (the envelope and change-isolation components) at a position and context already in the table. Where it does not fit, the finding is a change to this map first.

## 6. Coordination

- **Release management control ownership work** (`control-ownership-plan.md`, `control-chain-assessment.md`): this map reads them; where they say "open", so does this map. No ownership is moved here.
- **kaal-change structured-documentation investigation**: the identity and ownership model of C14 is its subject; this map names only the ids and edges it already uses (`tests`, `refines`, `traces`) and moves no implementation.
- **Open for the Owner:** Hotfix (rename, RED classification); the OUT of npmjs; the tag before publication; which of verify Envelope and freeze Collector become required (active gate applications).
