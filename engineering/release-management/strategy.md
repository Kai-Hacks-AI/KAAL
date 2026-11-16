# Release strategy

How a change gets from development to npmjs. `05-src/stages/stages.json` and `verify Stages` answer to this file. Small on purpose, to be improved.

## Chain

A change walks four stages. Each stage has one gate that must pass before the change moves on. UNKNOWN never passes.

```chain
1 Developing
2 Integrating: Collecting, Hotfixing, Wiring
3 Promoting
4 Publishing
challenges: Integrating > Developing (backward), Promoting > Integrating (backward), Promoting > Publishing (forward)
```

- **Developing:** work on any branch; the `.githooks` check runs before a push.
- **Integrating:** work lands on a collector `kaal/<capability>/<concern>` (Collecting), on `hotfix/*` (Hotfixing) or on `wire/*` (Wiring). Wiring installs approved tooling from `main` and develops nothing.
- **Promoting:** a PR into `main` through the merge queue, squashed, one at a time, with the CPO's approval of the exact head.
- **Publishing:** a tag, then npmjs only on the Owner's go.

## Challenge model

Each stage checks itself. Three challenges cross a stage boundary, and nothing else does:

- **Integrating > Developing (backward):** Integrating challenges the completed Developing work, for example that the declared `.githooks` are installed and intact. That is not evidence that the local hook executed.
- **Promoting > Integrating (backward):** before admission to `main`, Promoting challenges Integrating's declared requirements. It does not repeat all of Integrating's tests.
- **Promoting > Publishing (forward):** Promoting challenges that Publishing is ready, on purpose, because Publishing is a tag and no later stage can challenge it.

Verifying readiness is not proving that a later publication occurred. Whatever a later stage finds could have been found earlier, so a finding is a gap in the earlier stage to fix.

## IN, STOCK and OUT

- **IN:** the rules for getting a change into a place (merge rules, rulesets by target).
- **STOCK:** tests against the branches that hold work. `main` holds no stock. The delivery stock is `hotfix/*`, `wire/*` and `kaal/<capability>/*`; every other branch is development stock.
- **OUT:** the rules for creating the PR to the next place, and for publishing to npmjs. A PR opens only when all checks are green at its head.

## Priority and flow

Hotfix before wire before ordinary promotion, with no preemption. Promotions go one at a time. A PLAN never goes to `main` alone: PLAN, DO and ACT go into the collector, then the collector is promoted. Only `hotfix/*`, `wire/*` and `kaal/*` reach `main`, with no admin override.
