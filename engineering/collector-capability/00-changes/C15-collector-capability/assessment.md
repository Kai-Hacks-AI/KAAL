# Collector legitimacy and KAAL Core: assessment (revised)

Read at `main` a900273 (PROMOTION #1530) and PRs #1629, #1632, #1634, #1638. I ran `npm ci`, built kaal-hosting and kaal-core, and ran `engineering/inventory/attribute.mjs`. I did NOT run Core's tests, so whether they pass is UNKNOWN.

## Status of this document

- **Accepted by the CPO:** direction B. Core is the source of collector authority; only a Core-admitted Capability holder authorizes a collector scope; main is the trusted source; report-only until the Owner approves enforcement; no parallel registry; no permanent branch exceptions (no branch is permanent except `main`).
- **Superseding conclusion (this document's current answer):** the capability identifier for the second segment of `kaal/<capability>/<name>` is a **Core Registration scope** (core/F47-F49), and it authorizes a collector only if the scope's holder resolves to an admitted **KAAL Capability** Node. It is not a lowercased Node name, and an admitted Node without a registered scope does not authorize anything.
- **Historical findings** kept below are labelled; they are observations about main, not recommendations. An earlier draft proposed a name-based rule (Node name, lowercased, as the segment) and a table in which `release` and `review` passed. **That is withdrawn:** Core derives nothing from a name's spelling, Release and Review are Skills, and no Registration exists on main, so nothing passes today.
- **Assessment accepted is not PLAN approved.** The implementation PLAN is this PR (`change.md`, Cases T268-T276); nothing is activated and no ruleset is involved.

## 1. What kaal-core implements (intended / implemented / tested)

- **Intended** (README.md, docs/): Kernel, six foundational Nodes plus CASE and LOVE, identity by exact content (SHA-256), admission, and registration of Capabilities, Agents, Skills and Extensions "by one mechanism". Core knows nothing of branches (engineering/github/branching.md:3).
- **Implemented** (src/): `evaluate`/`loadEngine` admit Nodes by type id and name (engine.ts); `register`/`catalog` write and list an Engine directory (register.ts:66, :152); Registration assembly (registration.ts `assemble`): one scope has one holder, collisions are findings, scopes and identities are opaque text, `holder` is opaque text (so Core cannot itself say a holder is a Capability).
- **Tested:** test files exist (test/plan/registration.test.mjs and others; docs/testing.md). Not run by me.
- **Unreleased:** version 0.0.1, not published anywhere (README.md); interfaces can still change.

## 2. Identifier and what is on main (observed)

- A Node's id is the SHA-256 of its bytes and changes with every edit, so it cannot be a branch segment. The Registration **scope** is Core's stable, opaque identifier for a holder (the `<capability>/F12` id namespace is already these scopes).
- **No Registration instance exists on main.** Only the Definition (`packages/kaal-core/capability/Registration.md`) and the README mention it. So no scope is claimed by anyone, and every collector segment is today UNKNOWN or a migration finding.
- **Admitted CASE Nodes on main** (historical observation from `attribute.mjs`): capabilities Change, Core, Guard, Testing; skills Change Practice, Engineer Skill, Graph, Release, Review, Testing; extension Hosting. Six carry an `ownership.kaal.json`. This is useful only as the admitted-Capability set; it is not an authorization list.
- **Core is unpublished and `.kaal/` is not a deployed Engine of capabilities.** `.kaal/` holds the Core foundation copy, `config/guard` and `changes` only, with no `capabilities/` directory, so `catalog(".kaal")` would list nothing. The control must therefore not depend on a deployed or published Core.

## 3. Engineering-side evidence while Core is unpublished

- Core is a root workspace (package.json `workspaces`), and `engineering/inventory/attribute.mjs:37-45` already imports it from source (`evaluate`, `foundation`) and builds the admitted-Node set from a map of tracked files, with no `.kaal/` deployment. The control uses the same route on the files of `main`.
- Proposed evidence (`change.md`): (a) admit the tree of `main` with `evaluate` and list the Nodes typed KAAL Capability (the capability set); (b) read the Registrations on main (Nodes typed Core/Registration), validate them against `REGISTRATION_SCHEMA`, run `assemble`, and take its scope claims and collision findings. PASS needs a claimed, uncollided scope whose holder is in (a). Absent, empty, unreadable or ambiguous evidence is UNKNOWN.
- Existing deterministic pieces: Core `evaluate`/`assemble`, Graph `typed()`, Testing's `readClaim`/`attribute`. Today's branch checks only test `startsWith("kaal/")` (engineering/github/lineage.ts:105, :409).

## 4. Trust boundary

- Read Registrations and Nodes from the default branch's tip only, as `branching-audit.yml` already does for its checker and `holds.json`. A collector is created empty at main's tip (branching.md "Establish"), so an incoming branch cannot carry its own declaration; later PRs cannot authorize themselves (T272). A capability counts only after its Registration and Node are on main.
- Residual: a workflow from a PR head can be altered by that PR; `.github` changes travel alone and are reviewed, and the check must run main's copy. Not new risk.

## 5. Ownership and collector identity; kaal-retro

- Different things: ownership is path claims keyed by Node name+id; a collector carries a Branch Intent of one capability (branching.md:11).
- kaal-retro (#1634) claims Learning ownership while using `kaal/retro/skill`. Under the accepted rule `retro` is not authorized: no Retro Registration exists, and a Skill holder never authorizes a scope. Per the Owner, Retro remains its own capability (#1640) and needs its own legitimate capability identity; no Retro Capability Node is created merely to match the collector. The flat `kaal/learning` branch is not a constraint (no branch is permanent except `main`); if a `kaal/learning/<name>` collector is needed, the CTO asks the Owner for the specific operation.
- Migration findings (never authorized): flat and legacy refs, `kaal/old/*`, and non-Node namespaces such as `engineering` and `architecture`, reported, with no permanent exception.

## 6. Bootstrap

- No existing mechanism solves it by itself. The fit with current practice: a capability's Registration and Capability Node land on main through a collector of an owner that already passes, and are promoted; only then do collectors of the new capability pass (T273). Each Capability owner lands its own Registration in a Change it owns; Core only assembles and reports collisions.
- Before any owner has a Registration, every collector is UNKNOWN or a finding. That is expected during migration, and why nothing is enforced.

## 7. Smallest Change, boundaries, implications

- **Smallest Change:** engineering/C15 (PR #1638): a pure `collectorCapability(ref, { registrations, capabilities })` plus a report-only reader of main's evidence, with RED Cases T268-T276. Engineering owns the control; Core owns registration and identity and gains nothing about branches; Testing's `attribute` is untouched.
- **Not in this Change:** landing any Registration, creating Capability Nodes, ruleset or workflow install, Skill-to-capability ownership (undeclared on main).
- **C18:** unaffected; its `kaal/release/...` collectors are migration findings under this rule, report-only.
- **Earlier Core 0.0.1 work:** `kaal/core` (stale, 5 Nov, unpromoted) holds core/C50 (independent discovery and optional composition, T112-T114), core/C47 and initialization plans. They add no branch knowledge; they show registration discovery in fixtures only. Core's own promotion decisions are separate.

## Evidence index

packages/kaal-core: README.md, docs/limitations.md, plan/registration/requirements.md (core/F47-F49), plan/release/intent.md, src/registration.ts, src/register.ts:14,66,152, capability/Registration.md; engineering/inventory/attribute.mjs:37-45; packages/kaal-testing/lib/attribution.mjs; engineering/github/lineage.ts:105,409; engineering/github/branching.md:3,11; .github/workflows/branching-audit.yml; package.json workspaces; `.kaal/` contents.
