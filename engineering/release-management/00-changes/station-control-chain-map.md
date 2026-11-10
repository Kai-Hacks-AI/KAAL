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
| Hotfix | one urgent correction of an existing capability, through `kaal/hotfix` (established at main's tip, one correction at a time) | **open (Owner): a Change record or the Defect alone**; always a Defect Record and prior RED evidence | squash for each pull request into `kaal/hotfix`, squash for the promotion into main (`branching.md#hotfix`); then `main` is synchronized into every collector that owns the corrected behavior | a distinct carrier, not PLAN, DO or ACT relabeled; subject to the applicable trusted controls and approvals; one defect may have several pull requests (see 3a) |
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

## 3a. The Hotfix chain: Defect to promotion

Traceability runs **Defect → RED evidence → hotfix pull request(s) → GREEN evidence → integration and promotion**. Each link is read from Git and from records on the base, never from text a pull request wrote about itself.

| Link | What it is | Owned by | How a control verifies it |
| --- | --- | --- | --- |
| Defect | a **Defect Record** in the owning capability (`<capability>/06-defects/D<n>-<slug>.md`, id `<capability>/D<n>`, with its `expected`, `observed`, `where`, `status` and `tests`), in force on the base before the first hotfix pull request | the owning capability (the capability corrected keeps ownership of the behavior) | the Hotfix verdict reads the record **from the base**: it exists, its status is `confirmed`, and it lists RED Cases |
| RED evidence | the Cases the record lists, each with a Confirming Run recorded in the record | the Defect (their identity is owned by it) | the listed Cases exist on the base and are recorded RED at the recorded Case version; a record with no RED Case, or one that is not reproducible, refuses the carrier |
| hotfix pull request(s) | one or more pull requests, each referencing **exactly one** defect (`Driven-by: <capability>/D<n>`); whether they also reference a Change record is the open decision below | the Defect | the changed paths (from Git) stay within the record's `where` and the owning capability; Change Isolation stays the authority on what may travel together |
| GREEN evidence | the same Cases turned GREEN by the fix, in the lanes at the integration and promotion boundaries, and the Run that answers the record | the Defect | test Candidate and test Integration run the Cases the record lists; the record is **answered** only by a Run in which they pass at their Case version |
| integration and promotion | the carriers of section 2, unchanged | Release | the controls of section 3, unchanged |

**Several pull requests for one defect.** Each pull request names the same defect. The defect's pull requests are **computed from Git** (the `Driven-by:` trailers and the pull requests that carry them), never listed by hand in the record, so a second pull request collides with nothing. Which pull request answers the record is the one whose Run has the Cases GREEN.

**Decision for the Owner: how a Hotfix is documented.** Defect identity and Change identity are different concerns; a Hotfix is a controlled A to B transformation triggered by a Defect. Options:

| Option | What it means | Consequence |
| --- | --- | --- |
| A. Defect-only | the Defect Record is the only record; pull requests reference it | no Change record or lifecycle for a Hotfix; the least ceremony; the Defect must then carry what a Change's intent would say |
| B. Change linked to the Defect | a Hotfix is a Change (a C-ID, a fragment, PLAN or DO as needed) whose trigger is the Defect; the RED evidence is its PLAN evidence | one governance for every transformation; more ceremony for an urgent fix |
| C. The Defect owns a Change | the Defect Record is the parent node; one Change under it per correction; several pull requests share it | keeps the two identities apart and the lineage traceable; the heaviest |

Not recommended here without the Owner: the earlier note that a Hotfix has no Change record was a clarification of the defect-driven trigger, not an Owner-approved exclusion from Change governance.

**Also open, for the Owner and the investigation below.** The envelope of a hotfix pull request: what its title and body carry in place of a Change's `<capability>/<C-ID> <PHASE>` (proposal under option A: `<capability>/<D-ID> Hotfix: <concern>`, with the carrier as the marker and no phase; under B or C it carries the C-ID); and the exact Hotfix verdict (a new verdict of verify Envelope, no new control). The identity and documentation shape is part of the kaal-change structured-documentation investigation: whether the Defect is the node, with the pull requests as computed edges, as proposed here.

## 3b. Realization and assurance of each control

**Use the smallest sufficient realization** (CPO and Owner, 10 November 2026). A station-boundary control is realized as **(1) native GitHub configuration**, **(2) declarative configuration applied to GitHub** (for example ruleset JSON), or **(3) a KAAL judgment enforced through a required check**. KAAL code does not duplicate a judgment Git or GitHub already makes natively merely to make a control appear implemented: approvals, queue order, required status, environment protection and tag protection are native; shape, ancestry, isolation, envelope, freeze and package judgments exist only because GitHub does not make them.

For every control the map records the **semantic owner**, the **enforcing mechanism**, its **configuration or implementation reference**, the **boundary** and the **evidence**. Two kinds of evidence are kept apart:

- **Effective configuration**: what GitHub reports as active (the ruleset, the queue and environment settings as read from the API). A file that describes a setting is not evidence that the setting is active.
- **Actual enforcement behavior**: what happens when the boundary is exercised (a refused merge, a wrong method rejected). Verification is proportionate: it exercises the setting where that is feasible; it does not rebuild GitHub's mechanisms.

| Control | Realization | Semantic owner | Mechanism and reference | Boundary | Effective configuration | Enforcement behavior |
| --- | --- | --- | --- | --- | --- | --- |
| approve Change F15, approve Promotion F11 | native (1), declarative (2) planned | Release (Change for who may approve) | `kaal/*` and `main` rulesets (code owner review, approval of the most recent push); ruleset JSON planned, import awaits the Owner | collector IN, main IN | planned: read the active ruleset and compare it to the JSON | planned: a canary pull request that must be refused without an approval of its latest push |
| serialize Promotion F13, bind Merge F10 (queue) | native (1) | Release | merge queue settings (one at a time, method); `merge-group/` binds the group to the admitted pull request | main IN | planned: read the queue settings | the group is the admitted pull request (`merge-group/`, T8) |
| tag before publication | declarative (2), planned | Release | tag ruleset via the GitHub App; proof awaits the Owner's import | main OUT | planned: read the tag ruleset | planned |
| approve Publishing F1 | native (1) plus KAAL binding (3) | Release | `npm` environment (required reviewer) and `release-engine/` (binds record, run, commit, digest) | npmjs IN | planned: read the environment's protection | the workflow waits for approval (T4, T11); the binding is KAAL's |
| scan Vulnerabilities F8, scan Dependencies F9 | native tools | the tools | CodeQL, dependency review, Dependabot | collector IN, main IN | the workflow runs and its required status is in the ruleset (planned read) | the scanner's own verdict |
| isolate Change F6, verify Ancestry F7, accept Capability F14, verify Envelope F19, freeze Collector F21, verify Package F2, version Package F3 | KAAL judgment (3) | named in 3 | the components of the architecture | per section 3 | the required check is in the ruleset (planned read) | the Cases of the component (T7, T8, T46 to T53, T31 to T37 and the others) |
| test Candidate F12, test Integration F16 | KAAL lanes (3) | owning capabilities, Testing | `lanes/` and the CI workflow | per section 3 | the required status is in the ruleset (planned read) | the lanes' own results |

**Which are required checks.** A KAAL judgment protects only when its check is a required status in an active ruleset (native), so every KAAL row also has the effective configuration "its check is required"; today that is read by hand, and the planned read automates it.

### Detective follow-up where a preventive control cannot be exercised directly

Some preventive controls cannot be inspected or exercised directly, but their failure has a predictable, observable consequence. For each, the map defines a follow-up **detective control**: the **failure signature** to look for, the **evidence source**, **when and how often** it runs, the **accountable owner**, and the **response or escalation**. A detective control is a first-class option and is itself tested where feasible: a Case shows it recognizes the failure signature. Inspecting an outcome is **indirect assurance**; it does not prove that the preventive control's configuration is right, which is **direct verification** (read the effective configuration, or exercise the boundary). The map keeps the two apart and claims only the one it has.

| Preventive control | Failure signature | Evidence source | Cadence | Owner | Response | Status |
| --- | --- | --- | --- | --- | --- | --- |
| approve Change F15, approve Promotion F11 | a pull request merged into `kaal/*` or `main` with no approval of its latest push | pull request, review and merge data | scheduled (audit Lineage F5 is the existing scheduled run to extend) | Release | report to the Owner, hold promotions until explained | planned |
| serialize Promotion F13 | two promotions merged at the same time, or a promotion merged outside the queue | merge and queue data on `main` | scheduled | Release | report to the Owner | planned |
| approve Publishing F1 | a version on npm with no approved deployment of the `npm` environment for its commit and run | registry data against deployment records | after each publication (verify Package F2) and scheduled | Release | report to the Owner, deprecate the burned version | planned (partly in verify Package) |
| tag before publication | a published version whose tag is absent or names another commit | registry and tag data | after each publication | Release | report to the Owner | planned |
| scan Vulnerabilities F8, scan Dependencies F9 | the scanner not running on a head that reached `main` | workflow run records for the head | scheduled | Release | report to the Owner | planned |
| isolate Change F6 (the path rule) | a promotion that carries Core and `.github` together | the promotion's changed paths | scheduled (audit Lineage F5 already judges landed lineage) | Release | report to the Owner | partly live in audit Lineage |

None of these claims to prove a preventive control's configuration. Each row says what its evidence shows: the failure has or has not happened.

## 4. Rules the map states

- **Smallest sufficient realization.** A control uses a native setting where GitHub makes the judgment itself (3b); a KAAL judgment exists only where GitHub does not. Where a preventive control cannot be exercised, a detective follow-up is defined (3b) and its limits stated.
- **One authoritative implementation per control.** A control invoked at several positions (isolate Change, verify Ancestry, the scans, the lanes) is one implementation called from several contexts, never reimplemented per position. Known duplicates the assessment lists (the path matcher in the boundary workflow, the release judge in Hosting and Change, the approval trio against native settings) are retirements, not designs.
- **Template and hook guidance is not trusted inbound verification.** The pull request template, the hooks and the PR body tell the author what is expected (feedback, **H**). The trusted inbound verification is what the base controls judge from Git, from the base-controlled code: verify Envelope, Branching, Change Isolation, Promotion Source. The exit authorization is the gate, which only an active ruleset or environment application makes protection (`gate`, `setting`). A guidance that is skipped is a directive; a verdict that is not required protects nothing.
- **A Hotfix is triggered by a Defect (Owner and CPO, 10 November 2026).** Its prerequisites are an existing **Defect Record** and one or more **RED Cases** that reproducibly prove the defect; both come first (this answers the earlier open question: a Hotfix owes a prior RED, yes). RED and GREEN are **evidence states within PLAN and DO, not a lifecycle stage**. **Whether the Hotfix is also documented as a Change (a Change record and lifecycle) or by the Defect alone is an open Owner decision** (3a); defect identity and change identity are different concerns, and a Hotfix still effects a controlled A to B transformation. Nothing here authorizes a new gate, a hotfix execution, a promotion or the retirement of a legacy control. Still open: the rename `kaal/hotfix` to `hotfix/<name>`.
- **npm publication is a transition like the others, with a different transport.** Its IN is approve Publishing, its STOCK is verify Package, its OUT is open. It has no pull request, so the carriers' template and envelope controls do not apply; the workflow run and the `npm` environment carry the same decisions.

## 5. How C14 fits this map

C14 defines no station, control or carrier, and its fragment is the record of the persistent Change that PLAN, DO and ACT carriers share. How a Hotfix is documented (a Change record or the Defect alone) is an open Owner decision (3a); until decided, C14's check neither requires nor forbids a fragment for it. It changes only the **form in which a Change and a Case are recorded** and feeds the controls above:

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
- **Open for the Owner:** how a Hotfix is documented (3a) and its envelope and the rename `kaal/hotfix` to `hotfix/<name>`; the OUT of npmjs; the tag before publication; which of verify Envelope and freeze Collector become required (active gate applications).
