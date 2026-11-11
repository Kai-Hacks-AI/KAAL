# C11 interface: why a Hotfix has its own, and how it was derived

## Why not PLAN, DO or a promotion

A PLAN says where a Change goes and why (From, To, Because). A DO says what it implements and refactors. A promotion delivers reviewed collector content. None of them says four things a reviewer of an urgent correction has to decide on: whether the defect is real and which state it is in, whether the correction stays inside its boundary, what the correction reaches and what it drags along, and how to get back. A DO even asks for a Refactor chapter, which a correction must not have.

## What the observed Hotfix pull requests show

All four merged, none is open (`evidence.md`).

| Observation | Where | What it means for the interface |
| --- | --- | --- |
| No body names a defective production state. The urgency was cost (#761, #1240), a failure on `main` (#828) and ordering (#964, "prior to Hosting"). | #761, #828, #964, #1240 | Defect must say which state is defective, and may say it is not production. |
| Every body lists what is not included, in its own words: "Exact scope", "Not included", "No package, manifest, version, workflow ...". | #761, #763, #828, #964, #1240 | Correction states its boundary, because the authors already do. |
| Every body ends with the work that remains: a separate synchronization into Hosting and Guard's collector, SYNC #829 into `kaal/core`, "neither synchronization nor npm publication is performed by this PR". | #761, #763, #828, #1240 | Route names the states and collectors the correction must still reach. |
| The same statement is longer each time, from a scope list (#828) to validation transcripts (#761), and the headings differ in every body (Problem and change; Exact scope; Intent, Design, Verified by, Validated by; Intent, Change, Evidence, Not included). | all | A fixed, short set of chapters. |
| No body says how the state is restored if the correction is wrong. | all | Recovery. This is an absence, not an observed problem, and is the least evidenced chapter. |

## Three states, never one

- **Production** is what the npm registry serves. Today: `@kaihacksai/kaal-hosting` 0.0.1, `@kaihacksai/kaal-foundation` 0.0.1 and `@kaihacksai/kaal-guard` 0.0.4 (`0.0.0-stage` also exists for each). `kaal-change`, `kaal-core` and the other packages are not on the registry. The repository holds no tag, and the registry records no commit for any of these versions, so production is identified by package and published version.
- **`main`** is the promoted state. It is not production. Guard's `main` still says 0.0.4 but declares a dependency on Hosting 0.0.1 that the published 0.0.4 does not declare, and holds acceptance and test changes promoted after the publication (#1240). A correction published from `main` therefore carries everything promoted since the last release, not only the correction. That is why Route asks what else the version would carry.
- **Collector work** is neither. `kaal/guard-release` holds unfinished 0.0.5 work (#761). A correction made for production must not drag it in, and a collector that owns the corrected behavior has to take the correction from `main` afterwards.

## What is deliberately left out

- **Verification.** The reviewer needs it, and it already lives in the Case that reproduces the defect, in the checks and in the review. A chapter would repeat them.
- **Impact on collectors as a chapter of its own.** It is one clause of Route.
- **Attribution, status, retrospective.** As in the other interfaces.
- **How a hotfix is promoted, synchronized or published.** Route only names them. create Promotion and create Sync own the first two, and Engineering's Release engine owns publication.

## Current practice and the target

**Current practice** (observed, not approved as the target): Hotfixes travel through the collector `kaal/hotfix` under `engineering/github/branching.md`, which is protected like any `kaal/*` collector and so passes the ordinary `kaal/**` integration controls and then the controls at `main`.

**CPO decisions on this PLAN** (the Hotfix delivery path, not implemented here):
- `hotfix/*` is the target namespace for Hotfix branches.
- Admission is planned as a differentiated path for `hotfix/*` versus ordinary `kaal/**` integration. Every Hotfix still passes the full admission controls at `main`. Each control is assessed on its own; none is assumed relaxed.
- Branching, CI, Guard and ruleset changes each need their own Change and authorization.

**Relationship.** create Hotfix (C11) is the directive interface of the pull request that carries a correction, and its Cases. It is the same whichever branch the pull request travels on, so F16 names no branch: Route says only "the branch that carries the correction". The Hotfix delivery path is a separate, later Change that decides where that pull request lands and which controls it passes. C11 neither depends on it nor implements any part of it.

## Draft of the template

```
<!-- A HOTFIX pull request. Exactly five chapters in this order and nothing else: no extra headings, commentary, test results, CI status or execution logs. The Cases, the diff and the checks hold the evidence; discussion goes into comments. -->

## Change

<!-- One line, `<id> <name>: <short description>`: the stable id, the name and what this correction is. -->

## Defect

<!-- The symptom and its impact now, and the defective state: production (the package and its published version), main, or a collector. They are different states; name each one you mean. If only main or a collector is defective, say so. -->

## Correction

<!-- What this correction changes and what it deliberately leaves out. It restores: no refactoring, and nothing unrelated that a collector holds. -->

## Route

<!-- How the correction reaches main, production and the work in flight: whether a new package version is published and what else from main it would carry, and which collectors must take the correction from main. If none, say so. -->

## Recovery

<!-- How each state returns to what it was if the correction proves wrong: how main undoes the squash commit, and which previous published version production stays on. -->
```

## Outside this Change

- A checker, hook, workflow, required check or ruleset for a Hotfix body. Checking a body and admitting a pull request are separate concerns and later Changes.
- Whether a Hotfix needs its own approved PLAN before the correction or an ACT after it. This interface covers the pull request that carries the correction; the CPO decides the rest.
- The Hotfix delivery path: the branch lifecycle and the controls a Hotfix passes (next section). The promotion queue and the Owner's `Promotion-Order` override. An urgent promotion queued behind older ones in #763 is Promotion's concern.
- Tags, release records and publication.
- An agent skill that gives agents the guidance GitHub offers only to people.
- The template file itself, which the DO delivers alone in `.github`.
