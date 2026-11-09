# Release management (Engineering)

PLAN, nothing here is built. The root holds the full loop for how a package moves from a working branch out to the world. The stations below it repeat the same loop, one station at a time. Each station has **in** (the receiver's check), **stock** (what holds while work sits at the station) and **out** (the sender's check), so what is out of one station and what is in to the next may be different controls.

| Folder | What it is | State |
| --- | --- | --- |
| `01-intent/` to `04-test/` | the overarching view of the root: Intent, Requirements, Architecture (the flow drawing), planned Cases | this PLAN |
| `05-src/` | four components, all peers: `pipeline/` (the five end-to-end controls) and the stations `npmjs/`, `main/`, `collectors/` | planned; created by each Change |
| `00-changes/` | one planned Change per control: add job, move code to `05-src`, retire the old check | this PLAN |

Layout (Owner, 9 Nov): the folder is only the root loop, `00-changes` to `06-defects`, and it is traced as an element of the Delivery architecture (Delivery vs Solution placement). `05-src/` holds four components, all peers, each a node in the architecture with no loose files: **`pipeline/`**, the end-to-end piece that spans the stations (audit Lineage, isolate Change, verify Ancestry, scan Vulnerabilities, scan Dependencies), and the stations **`npmjs/`**, **`main/`** and **`collectors/`** (named `collectors` so it is not confused with KAAL as a whole; its workflow is `release/collectors`). Rule: a station may use `pipeline/` but never another station. The name follows Domain-Driven Design, with release-management as the bounded context, and leaves `pipeline/` reusable elsewhere. Controls are requirements and components realize them, so a component holds several controls, and a control may be realized by a native setting or a tool and have no source (listed in `03-architecture`). All requirements sit in the root `02-requirements`; Architecture allocates each to exactly one of the four components, which forces precise functional placement. Cases sit next to their component. Folders are created when they hold something, so `00-changes`, `05-src` and `06-defects` do not exist yet. Station `13-change-branch` is dropped for now (Owner, 9 Nov).

Existing controls (`engineering/controls/`), their checks and files, and the release engine (`engineering/release/`, `.github/workflows/release.yml`) are untouched by this PLAN; their checks are renamed later, one Change per control (`00-changes/`), add-new then remove-old. The names below are the Owner's, agreed 9 Nov 2026.

## Path to `main` (overarching plan)

Owner, 9 Nov: this goes into `main` ahead of Foundation 0.0.2 and does not wait for it. Each step is additive, exact-head reviewed, with no admin override, and keeps #1278 and #1272 (10 Nov 18:03 UTC) unblocked.

1. This PLAN (#1320) lands in its collector. A landed PLAN is a go for the steps below, except promotions into `main`, which keep their own explicit Owner go.
2. Proof on a throwaway branch: how a ruleset matches a context from a reusable-workflow job, and a `merge_group` run of the pinned checker (`ref: main`).
3. Per control, in the build order (the five `pipeline/` controls, then `npmjs/`, then `main/`, then `collectors/`): an Engineering Change moving the code into `05-src` with parity Cases, then a `.github`-only Change adding the job under `release/<station>`. Old checks stay until the new context is live.
4. The testing controls (test Candidate, test Integration) do not wait for the `kaal-change/far` DO (F18). They follow the Foundation pattern: an interim version is built now, marked **temporary** in its code, Case names and check output, and replaced once FAR's DO lands. The interim reads the same `far.json` record shape as `change/F7` to `F10`, so the replacement swaps the module and not the record.
5. The two gates, `gate (main)` and `gate (collectors)`, once their controls exist.
6. Promotion of the collector into `main` in reviewed slices, each with the Owner's explicit go.
7. The Owner adds the new contexts to the rulesets, enables the pins and queue settings named in `03-architecture`, and removes the old contexts (`Change Isolation (review)` first, `Branching` last). Then delete the four `pull_request_target` workflows and remove the temporary Actions policy, before 2 Dec 2026.

## Later: kaal-release 0.0.1 (out of scope for this PLAN)

The final, later step on the overarching plan: **kaal-release 0.0.1**, the general release capability, as BASS (Bare, Agent, Skill, Script), that does not force KAAL's approach on consumers. It is what is left over once these controls prove the approach in KAAL's own repository. Nothing in this PLAN designs, names its contents or ships it.

