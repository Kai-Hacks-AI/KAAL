# C39 change

## PLAN

1. **From.** Show WIP (`show-wip.mjs`, SWIPE) takes the open PRs of a repository as its unit and groups them into stations by the PR's source and target. A branch without an open PR is invisible, several PRs from one branch are several unrelated lines, and nothing says whether main holds work for a package that is not yet released.
2. **To.** The report also holds an inventory, built only when the facts carry `branches`: one entry per branch, in its place, with its PRs as references. A package rule shows whether main holds stock for each package, from npmjs and the release tags. The PR observations (WORK, REVIEW, WAIT, UNKNOWN, exact head, review sequence) stay as they are and become the disposition of a transport.
3. **Because.** Branches hold stock, a PR transports it (CPO handover, Owner 16 Nov 2026). Flow becomes visible by location first, and C38's IN, STOCK and OUT get a view that reads the same words.
4. **Places.** Development is any other branch; Integration is split into hotfix, wire and kaal; `main` is not a place but a destination, and stock only by the package rule. The consumer's config says which branch pattern is which place (`places`, first match wins, `development` for the rest, `default` for main). No default mapping is assumed; a branch no place matches is `unknown place`.
5. **Two views.** The overview is a count per place (branches, branches with a transport, transports) and per package state. A dive-in lists one place in full. `renderInventory(report, { place })` renders both from the same report; an unknown place is an error, not an empty list.
6. **The package rule.** For each package on main, from what the reader observed:

| npmjs `latest` | tags (`@kaihacksai/<name>@<version>`) | state | main holds stock |
| --- | --- | --- | --- |
| none (never published) | any | `unpublished`, next `0.0.1` | yes (a private package carries a note saying so) |
| a version | a tag equal to `latest` only | `current` | no; yes when main is beyond that tag; UNKNOWN when that was not observed |
| a version | a tag that is not `latest` (an `-rc.N` one is a release candidate, another one is tagged and not on npmjs) | `coming` | yes |
| a version | none | `current` | UNKNOWN: no tag says where current ended, and nothing is guessed from `package.json` |
| not observed | any | UNKNOWN | UNKNOWN, naming what was not observed |

   "Beyond the tag" is a single observed fact (`beyondTag`: main has commits the tag does not), not a count.
7. **The reader.** `read.mjs` gains `readBranches` (every branch, following the cursor), `parseTag` (the version is after the last `@`, so a scoped name stays whole) and `readPackages` (`latest` from npmjs, tags, `beyondTag`; a private package is read like any other). Anything it could not read is a gap, never a silent drop and never filled in.
8. **Cases.** T550 to T558, all RED on `main`: the five acceptance examples (T550 branch without PR, T551 one and three PRs, T552 a PR that is no longer open, example 5 reduced to "no BOM"), the places (T553), the two views (T554), the retained PR observations (T555), the package rule (T556, T557) and the reader (T558).
9. **Boundaries.** Read-only, no enforcement, no authorization. No lifecycle or activity inference, no unique-commit counting, no deduplication, no WIP limits or scheduling, no BOM. Branch existence alone proves no outstanding work. Missing evidence is UNKNOWN.

## What becomes redundant later, not in this Change

The CPO asked to keep the PR observations, so C39 removes nothing. Once the branch view has proven itself, these existing parts duplicate it, and a later Change can retire them:

- the `stations` mapping and the `unknown station` group, because the place of a branch replaces grouping PRs by source and target;
- the station-first `render` of one line per PR, which becomes the detail of a transport reached through its reference;
- the station order in `review.stations`, which can follow the places.

These stay: the disposition, exact head, review sequence and type of a PR, and the reader of open PRs, because they are the transports.

## DO

`show-wip.mjs`: `showWip` builds `inventory` (places, entries, transports, overview counts, packages) when `facts.branches` is present, and `renderInventory`. `read.mjs`: `readBranches`, `parseTag`, `readPackages`. `run.mjs` and `show-wip.json`: the places, the default branch and the view. T550 to T558 are renamed to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Ids

C39 and T550 to T558 come from the coordinator's allocation (T550 to T559). The Change adds no Intent, Requirement, Architecture or gap id; it extends the Show WIP requirements of `kaal-release` (coordination/F1 to F10) and says so here.
