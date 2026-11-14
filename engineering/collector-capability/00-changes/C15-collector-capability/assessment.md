# Collector legitimacy and KAAL Core: assessment

Assessment and recommendation only. Read at `main` a900273 (PROMOTION #1530), plus PRs #1629, #1632, #1634. I ran `npm ci`, built kaal-hosting and kaal-core, and ran `engineering/inventory/attribute.mjs`. I did NOT run Core's tests, so "tested" below means "tests exist", not "tests pass" (UNKNOWN).

## Answer to the decision question

Yes, with one correction. Core can be the authority, but not through its registry (`register`/`catalog`): that registry is empty in this repository. The authority Core already provides here is **admission**: Core's `evaluate` admits the CASE Nodes (Capability, Agent, Skill, Extension) in the tracked tree, and `engineering/inventory/attribute.mjs` already turns that into a list of owners. A collector's second segment can be validated against the names of CASE Nodes admitted from `main`. No second registry is needed.

Smallest Change: one Engineering Change that adds a deterministic, report-only check "collector capability is a Core-admitted CASE Node name on main", reusing `attribute.mjs`'s admission code. Details in section 6.

Strict reading today (collector segment = lowercased name of a CASE Node admitted on main) gives: `release` PASS, `review` PASS; `architecture`, `engineering`, `retro` FAIL (no Node), `old` FAIL (legacy parking). That is the real cost of the rule and needs a CPO/Owner decision (section 5).

## 1. What kaal-core implements (intended vs implemented vs tested)

- **Intended** (README.md, docs/): the smallest working KAAL: Kernel, six foundational Nodes plus CASE and LOVE, identity by exact content (SHA-256), admission, and registration of Capabilities, Agents, Skills, Extensions "by one mechanism". Core "knows nothing of branches" (engineering/github/branching.md:3).
- **Implemented** (src/, 16 modules, ~2.1k lines): `evaluate`/`loadEngine` (admission by type id and name, engine.ts), `register`/`catalog` (register.ts:66, :152), Registration assembly for scope claims, kinds and traces (registration.ts, `assemble`), bootstrap/verify/lifecycle/installation contract.
- **Tested** (exist, not run by me): test/plan/*.test.mjs (core/T-ids per area), test/*.test.ts, test/embed/* shipped consumer tests (docs/testing.md).
- **Unreleased**: version 0.0.1, "not published on npm or anywhere else" (README.md). Interfaces "can still change without an upgrade path". Guard does not depend on Core (README.md).
- **Left out on purpose** (docs/limitations.md): recording how owners aligned a shared term, typed relationships, Graph analysis, any meaning of a Node's content.

## 2. How capabilities are identified

- **Identity is content**: a Node's id is the SHA-256 of its exact bytes (README.md). It changes with every edit of the Node, so it cannot be a branch-name segment. Observed ids: Core 06f759e5…, Testing be4d4a38…, Change 5cdac8ea….
- **Name is the stable handle.** `register()` requires `^[a-z0-9]+(-[a-z0-9]+)*$` (register.ts:14), exactly a branch-safe segment, but that name applies to registering into an Engine directory (`.kaal/<capabilities|agents|skills|extensions>/<name>/`).
- **This repository's own Engine registers nothing.** `.kaal/` holds core/, config/guard/ and changes/ only, no `capabilities/` or `skills/` directory. So `catalog(".kaal")` would return nothing useful here.
- **What exists instead**: CASE Nodes live in package trees, and each owner may add `ownership.kaal.json` with `{kind, name, id}` and `paths` (Testing's contract, kaal-testing/lib/attribution.mjs:60-86).
- **Observed on main** (`attribute.mjs`, run by me): 11 CASE Nodes admitted: capabilities Change, Core, Guard, Testing; skills Change Practice, Engineer Skill, Graph, Release, Review, Testing; extension Hosting. Only 6 carry a claim (Change, Core, Graph, Release, Review, Testing). **Guard (engineering/guard/Guard.md) and Hosting have a Node but no ownership.kaal.json on main** (hosting/F56 plans one, the file is absent).
- **Two different "capability" senses.** Core's *kind* "KAAL Capability" (Core, Change, Testing, Guard) is not the same as the id namespace `<capability>/C<n>`, which also covers Skills (release/C18, review) and non-Nodes (engineering/C11, pull/C9, retro/C1). "Capability names are globally unique" is a convention (engineering/guard/testing.md:10), not Core-enforced.

## 3. Can a deterministic control validate `kaal/<capability>/<name>`?

- **Exists**: Core admission over a tree (`evaluate`), the Graph `typed()` listing by kind, Testing's `readClaim`/`attribute` (pure, deterministic, JSON claims), and the working composition `engineering/inventory/attribute.mjs:37-45`. That script is report-only ("Findings do not change the exit status", line 14).
- **Exists, weaker**: branch checks only test the prefix: `startsWith("kaal/")` at engineering/github/lineage.ts:105, :409, :497, :551. Nothing parses a second segment.
- **Missing**: (a) a rule mapping Node name to segment (lowercase, spaces to hyphens; Core's NAME regex is the natural spelling); (b) a reader of the tree at `main`, not the working tree (attribute.mjs reads `git ls-files` of the checkout); (c) a parse of the collector name and a verdict (PASS/FAIL/UNKNOWN; UNKNOWN when `main` cannot be read); (d) the Cases; (e) a policy for the non-Node owners (section 5). Note kaal-core is unreleased and is already a root workspace (package.json workspaces), so a repo-local control may import it without publishing.

## 4. Trust boundary

- Yes: validate against `main`. Precedent: branching-audit.yml says "The checker and holds.json are always read from the default branch's tip"; Change Isolation's `attesters.json` follows the same pattern.
- A collector is established at `main`'s tip with no content (branching.md "Establish"). So at establishment the incoming branch cannot carry any capability declaration, and the name check needs `main` only. The `push` event that already drives Branching audit (branching-audit.yml `on: push: kaal/**`) is the natural trigger.
- Later PRs into the collector can add Nodes or ownership files, but the check reads them from `main`, not from the head. A capability introduced by a PR counts only after promotion.
- Residual: a workflow run from a PR head can be altered by that PR; existing `.github` changes travel alone and are reviewed (Change Isolation), and the check must run the default branch's copy as branching-audit does. This is not new risk.

## 5. Ownership vs collector identity, and kaal-retro

- They are different things. Ownership is path claims keyed by Node name+id. A collector carries a "Branch Intent: one capability" (branching.md:11); `kaal/<capability>/<leaf>` is a convention (kaal-release/plan/release/00-changes.md:26).
- kaal-retro (#1634 body: "a provisional Learning ownership claim"; branch `kaal/retro/skill`, #1629): ownership by Learning is a claim question; the collector name is a separate choice forced by git (a `kaal/learning` branch exists, so `kaal/learning/<x>` cannot). Under the proposed rule `retro` FAILS today because no Node named Retro/retro exists on main. Also `learning` is not a Node on main either, so even Learning would FAIL.
- Choices for the CPO (no recommendation beyond what the evidence supports): (A) kaal-retro ships a Skill Node named Retro, which makes `retro` legitimate once promoted; the Node is the registration, matches how `release` and `review` pass today. (B) The collector is named for an existing owner. (C) The rule accepts a declared repo-local owner set (e.g. `engineering`, `architecture`) via an Owner-controlled file on main, the pattern of `holds.json`. C is exactly the second registry the brief asks to avoid, so use it only for owners that cannot be Nodes (`engineering` is the repo's own realization, and Core knows nothing of branches).
- Existing collectors outside the form: flat names (`kaal/core`, `kaal/learning`, `kaal/hosting`, `kaal/process`…) and `kaal/old/*`. The control must define whether it checks one segment or two, and `old` is not a capability.

## 6. Bootstrap, smallest Change, boundaries

- **Bootstrap**: there is no existing mechanism that solves it. Nearest: Establish creates an empty collector at main (no PR). Honest options: (1) the registering Node lands first on a collector of an already legitimate owner (e.g. kaal/core/<x> or kaal/engineering/<x>), is promoted, then collectors of the new capability are legal, matching "land first, wire later"; (2) an Owner hold. Recommend (1), no new mechanism.
- **Smallest Change** (one Engineering Change, per standing rule not on existing rulesets): a pure function `collectorCapability(ref, admittedNodeNames)` plus a report-only workflow/CLI step that builds `admittedNodeNames` from `main` with `evaluate` and `typed()`, and a table of Cases: kaal/release/x PASS, kaal/review/x PASS, kaal/retro/x FAIL, unreadable main UNKNOWN (never passes), PR-head-introduced Node still FAIL. Enforcement stays Owner-gated and only on a new ruleset.
- **Boundaries**: Core owns Node identity (unchanged, no new field); Engineering owns the check and the Cases; Testing's `attribute` is reused untouched; Release/C18 unaffected. Claims for Guard and Hosting are a separate small Change by their owners, needed only if ownership (not names) is later checked.
- **C18 implication**: none blocking. C18 (#1632) is source-before-install and new-ruleset-beside-old; the collector check is another side-by-side control and should be another source artifact beside it. The only dependency: C18's own collector names (`kaal/release/wire-analyze-vulnerabilities*`) already PASS (segment `release`).
- **kaal-retro implication**: its collector does not pass today; decide A/B/C above before any enforcement. It does not block its DO or its promotion while the check is report-only.

## Evidence index

README.md and docs/limitations.md of packages/kaal-core; src/register.ts:14,66,152; src/registration.ts; engineering/inventory/attribute.mjs:11-45; packages/kaal-testing/lib/attribution.mjs:60-142; engineering/github/lineage.ts:105,409; engineering/github/branching.md:3,11; .github/workflows/branching-audit.yml; ownership.kaal.json in six packages; `.kaal/` contents; branch list on GitHub (second segments seen: architecture, engineering, old, release, retro, review).
