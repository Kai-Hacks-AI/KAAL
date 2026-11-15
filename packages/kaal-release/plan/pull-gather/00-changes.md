# Pull Promotion: list the stock branches that are ready, from verdicts that already exist (Change A to B)

This is `pull/C13`, a PLAN Change. It ships no code, installs nothing, changes no workflow, ruleset or declaration and opens no PR. It is the first slice of the CTO assessment of 15 Nov 2026 (`pull-promotion/true-pull-architecture-assessment.md`, section 6, step 1), cut down to the smallest path after the Owner's alignment of the delivery model. It authorizes preparation, not promotion or publication.

## The model (Owner, 15 Nov 2026)

- **`main` is production and has no stock.** The stocks are `kaal/<capability>/*`, `hotfix/*` and `wire/*`, each moving into `main`. Every other branch is development.
- **STOCK** is the checks of a branch. A stock branch is ready when it passes all its tests at its exact head. A collector that is only "P green" (planned RED Cases still open) is not ready.
- **OUT** is opening the PR, and only for a ready branch. **IN** is the ruleset of the target. Both belong to the pull and the destination; selection reads neither.
- A registered capability registers its stock. Auto-pull is opt-in at stock level; unregistered stock is still listed for judge-pull.
- `kaal-release` is a reusable product: it knows no branch names, GitHub or repository layout. This installation's conventions live in Engineering.

## A: the present

`laneStep` (pull/C10) and the class selection (pull/C11) judge candidates nobody produces. A person writes the list, and `hotfix/*` and `wire/*` branches are not seen at all. The STOCK verdict that says "ready" does not exist as a published verdict yet: the Pull Promotion qualification is run by hand, and nothing separates a green branch from a "P green" one.

## B: the target

1. **Package** (`scripts/deliveries.mjs`, host-neutral): `resolveDeliveries(facts)` takes declared classes, stock items `{id, class, name, revision, stock}`, the authority each class registers for its STOCK verdict, STOCK verdicts `{candidate, verdict, revision, authority}` and the accepted registrations. It returns, per item, `ready` (a `PASS` verdict from the class's authority at the item's exact revision) and `pull` (`auto` if its stock is registered, else `judge`). Missing, stale, `held` or unrecognised is not ready (UNKNOWN). It reads nothing behind a verdict and produces no value, size or unit.
2. **Adapter** (`engineering/release-management/05-src/pull-promotion/gather.mjs`): lists the branches of this installation (`kaal/<capability>/*`, `hotfix/*`, `wire/*`; routes from the Engineering `kaal-pull.json`), reads the head SHAs and the published verdicts with GET calls only, and passes normalized facts. Anything else, `main` included, is not an item.

Nothing else: no OUT or IN field, no reading of PRs or merge checks, no producer of the verdict.

## Existing mechanisms (read on `main`)

The STOCK verdict has no producer today. The nearest are the Pull Promotion qualification (PDCA from file state, run by hand), the nine Hotfix Cases and the WIRE install judge `wire-judge.mjs`; none publishes a verdict with a revision and an authority, and none yet distinguishes green from "P green". Those producers are separate Changes. Until each exists its items read as not ready.

## Not in this Change

No producer of STOCK verdicts, no OUT or IN logic, no admission of `hotfix/*` or `wire/*` into `main`, no change to `laneStep` or C11, no dry-run caller, no workflow, App or ruleset.

## Open points for the CPO

1. **pull/C11 amendment.** It requires `out` and `in` both PASS and checks branch prefixes in the package. Readiness should be the STOCK verdict only and `source` opaque. Separate amendment, not made here.
2. **Verdict carrier**: proposed a check run on the exact head carrying `{verdict, revision, authority}`.
3. **Registrations** come from pull/C14 (#1708).
4. **Dependency**: the DO waits for `laneStep` on `main`.

## Order

PLAN (this), then DO (package module, adapter, README, T430 to T433 to green), ACT, a concluding collector-level ACT, SYNC and PROMOTION. Collector: `kaal/release/pull-gather`, from `main`.
