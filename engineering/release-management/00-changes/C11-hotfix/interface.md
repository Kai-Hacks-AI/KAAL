# C11 interface: why a Hotfix has its own, and what is the minimum

## Why not PLAN, DO or a promotion

A PLAN says where a Change goes and why (From, To, Because). A DO says what it implements and refactors. A promotion delivers reviewed collector content. None of them answers the three things a reviewer of an urgent correction decides on: whether the defect is real and in which state, whether it truly cannot wait, and whether the path taken is the fastest safe one rather than an improvement in disguise. A DO even asks for a Refactor chapter, which a correction must not have. Identity is the one thing a Hotfix shares with them (Change chapter).

## What the observed Hotfixes show

Four corrections used the Hotfix route (`evidence.md`). All merged, none is open.

| Observation | Where | Consequence |
| --- | --- | --- |
| No body names a defective production state. The defect was cost (#761, #1240), a failure on `main` (#828) or none at all, an ordering decision (#964, "prior to Hosting"). | #761, #828, #964, #1240 | Defect names the state, and must justify the Hotfix. |
| Urgency was why the route was used (`engineering/github/branching.md`: "Urgency alone decides"), yet it is stated only in passing: a measurement (#761), "blocked #816" (#828), a clause of the Owner's decision (#964). | all | Urgency is its own chapter. No other artifact holds it. |
| Every body sets out scope and what is not included. #964 moved 170 files, #761 deliberately three. | all | The trade-off belongs in Approach. The diff already shows what changed. |
| Every body ends with the follow-up work: syntheses into collectors, "no npm publication". Each follow-up is a pull request of its own (#829). | #761, #763, #828, #1240 | Not a chapter. The pull requests state it. |
| No body states recovery. | all | Not a chapter (below). |

## Each candidate chapter, defended or challenged

| Chapter | Decision | Reasoning |
| --- | --- | --- |
| Defect | Keep | The premise of the route. A Defect record, where one exists, holds the symptom and its impact. The chapter adds the state, which no record holds and which the observed bodies left out. |
| Urgency | Keep | The only reason to leave the ordinary path. Held nowhere else, stated implicitly in every observed body. |
| Approach | Keep | The one judgment the diff and the Case cannot show: why this path and not a wider one. It is also where the risk of the three states belongs, see below. |
| Change | Keep, as identity only | First assessed as droppable because the title and the `Driven-by` trailer held the identity. The Owner's title convention (type first, human-readable purpose, no identifier) removes it from the title, and the trailer sits on commits, not on the pull request. The body is now the one place of the pull request that names the Change, so the chapter holds independent value. It carries the id and name and no description. This is kept for traceability, not for uniformity. |
| Correction | Drop | What changes is the diff. What counts as fixed is the Case. What it leaves out survives as the trade-off in Approach. |
| Route | Drop | The route to `main` is the promotion's interface, synchronization into collectors is a Sync pull request, publication is the release engine, and the branch is the delivery path. Which collectors must synchronize follows from ownership of the corrected behavior. |
| Recovery | Drop | It is a property of the delivery path, not of one Hotfix: `main` goes back by undoing the one squash commit, and a published version is not replaced (a version already on the registry is refused), so production goes forward. Nothing observed varied it per Hotfix. |

## Three states, never one

- **Production** is what the npm registry serves. Today: `@kaihacksai/kaal-hosting` 0.0.1, `@kaihacksai/kaal-foundation` 0.0.1 and `@kaihacksai/kaal-guard` 0.0.4. The repository holds no tag, and the registry records no commit for these versions.
- **`main`** is the promoted state, and it is not production. Guard's `main` still says 0.0.4 but declares a dependency on Hosting 0.0.1 that the published 0.0.4 does not. A correction published from `main` carries everything promoted since the last release. That is why Approach says what else a new version would carry, when production is affected.
- **Collector work** is neither. `kaal/guard-release` holds unfinished 0.0.5 work. A correction must not drag it in.

## Shared formatting contract

Every PR interface shares one formatting contract, separate from its meaning (see F16). F16 states only the chapters and their meaning. The Hotfix interface keeps a Change chapter because the contract asks for a stable identity where the interface requires it, and a Hotfix does: under the title convention the body is the only place of the pull request that names the Change. It is not there for uniformity. The contract needs no logic of its own here. Whether and how a reusable body checker covers the Hotfix interface, as `check PR Body` does for the PLAN, is separate planning and authorization.

## Current practice and the target

**Current practice** (observed, not approved as the target): Hotfixes travel through the collector `kaal/hotfix` under `engineering/github/branching.md`, which passes the ordinary `kaal/**` integration controls and then the controls at `main`.

**CPO decisions** (the Hotfix delivery path, not implemented here):
- `hotfix/*` is the target namespace for Hotfix branches.
- Admission is planned as a differentiated path for `hotfix/*` versus ordinary `kaal/**` integration. Every Hotfix still passes the full admission controls at `main`. Each control is assessed on its own; none is assumed relaxed.
- Branching, CI, Guard and ruleset changes each need their own Change and authorization.

**Relationship.** create Hotfix (C11) is the directive interface of the pull request that carries a correction, and its Cases. It is the same whichever branch that pull request travels on, so F16 names no branch. The delivery path is a separate, later Change that decides where it lands and which controls it passes. C11 neither depends on it nor implements any part of it.

## Draft of the template

```
<!-- A HOTFIX pull request. Exactly four chapters in this order and nothing else: no extra headings, commentary, test results, CI status or execution logs. The Change, the Cases, the diff and the checks hold everything else; discussion goes into comments. -->

**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.

## Change

<!-- One line, `<id> <name>`: the stable id and the name of the Change. An identity, not a description; the Defect says what is broken. -->

## Defect

<!-- The KAAL Defect, by its identity `<capability>/D<n>`; a GitHub issue or URL is not that identity. What is broken, and which state is defective: production (the package and its published version), main, or a collector. They are different states; name the one you mean and claim no production impact that does not exist. -->

## Urgency

<!-- Why this cannot follow the ordinary Change path, and the consequence of waiting. A ticket number or a priority label is not an answer. -->

## Approach

<!-- Why this is the fastest safe path from the RED Case to GREEN, not a broader improvement or a refactoring: the choice and what it trades off, not the implementation. If production is affected, say what else from main a new published version would carry. -->
```

## Outside this Change

- A checker, hook, workflow, required check or ruleset for a Hotfix body. Checking a body and admitting a pull request are separate concerns and later Changes.
- The Hotfix delivery path: the `hotfix/*` branch lifecycle and the controls a Hotfix passes. The promotion queue and the Owner's `Promotion-Order` override.
- Whether a Hotfix needs its own approved PLAN before the correction or an ACT after it.
- Tags, release records and publication.
- An agent skill that gives agents the guidance GitHub offers only to people.
- The template file itself, which the DO delivers alone in `.github`.
