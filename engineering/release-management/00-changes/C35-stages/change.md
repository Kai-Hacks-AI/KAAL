# release/C35 change: Engineering / verify Stages, the one check of the minimal set 1

Owner direction (16 Nov 2026): the first rulesets carry no legacy control. Set 1 is the smallest possible set, so controls migrate one at a time, and it must also unblock the `.githooks` migration (#1705). One check, owned by Engineering (Release Management), protects the structure of the delivery stages. This Change corrects release/C34 (set 1 sources on `main`, which carry legacy controls) and builds on it.

## From, to, because

- **From:** set 1 on `main` copies the legacy rules and checks of the old three rulesets (approvals, merge queue, code scanning, deletion, force-push, many checks, Guard). Nothing verifies that the delivery stages exist, and a `wire/*` head has no required check, so C16 fails closed and #1705 cannot be admitted.
- **To:** a declaration of the stages (`stages.json`) and a judge that checks the stage sources against it, reported as one check per ruleset, `Engineering / verify Stages (<Ruleset>)`. Set 1 shrinks to the minimum: `collectors`, `hotfixing`, `wiring` and `promotion`, each carrying only that check, with no bypass and no "up to date", and `publishing` carrying one rule.
- **Because:** migration must be controlled, one control at a time, and C16 needs a real check to read on a `wire/*` head.

## The stages

| # | Stage | Kind | Target | Source |
| --- | --- | --- | --- | --- |
| 1 | Development | `.githooks` | all other branches | dispatcher, `old/`, `new/` |
| 2 | Integration | the overarching concept | `kaal/**`, `hotfix/**`, `wire/**` | none of its own |
| 2.1 | Collectors | branches | `kaal/**` | `collectors.json` (today the live `old integration`) |
| 2.2 | Hotfixing | branches | `hotfix/**` | `hotfixing.json` |
| 2.3 | Wiring | branches | `wire/**` | `wiring.json` |
| 3 | Promotion | branch | the default branch (`main`) | `promotion.json` |
| 4 | Publishing | tags | `trial-*@*` | `publishing.json` |

## The check, in three levels; this Change is level 1 only

1. **Exist in Engineering (this Change).** The stages exist as sources on the branch: `.githooks` has its dispatcher with `old/` and `new/`; each of the four branch rulesets has a source with the agreed name and target, an empty bypass list, and nothing in it but one `required_status_checks` rule that requires exactly `verify Stages (<Ruleset>)`, strict false; `publishing.json` exists with the tag target. Anything unreadable fails closed. The job `verify Stages (Promotion)` also judges `publishing.json`, because a tag ruleset cannot require a check and publishing starts from `main`.
2. **Wired up in GitHub (later Change):** the live rulesets exist with these targets.
3. **Engineering = GitHub (later Change):** the live rulesets equal the sources; this is the check that matters most inside a Change.

- **Publishing needs one rule:** a tag ruleset has no rule list that can be empty, so `publishing.json` carries `update` alone: a published tag cannot be moved. It is one of the four rules of `old publishing`, which keeps running; it is the smallest rule that makes the stage exist. No creation, deletion or force-push rule is added.
- **Name:** workflow `Engineering`, job `verify Stages (<Ruleset>)`, shown by GitHub as `Engineering / verify Stages (Collectors)`, `(Hotfixing)`, `(Wiring)`, `(Promotion)`. A ruleset binds the job name alone, so the required context is `verify Stages (<Ruleset>)`, which is unique. The verb is `verify`, the detective class (release/C5 `naming.md`). The Owner's reason for not using Guard: Guard guards different things than what Engineering wires by hand. Naming amendment of release/C5 `naming.md`: the workflow is named by the concern that owns the check (`Engineering`), not `KAAL <capability>`. The CI job `Engineering` that runs the engineering tests keeps its name; the longer names are distinct.
- **Home:** `engineering/release-management/05-src/stages/` (`stages.json`, the judge); the workflow lives alone in `.github` (a later step).

## Sequence (each its own Change or step)

1. This PLAN, CPO review at the exact head; T480-T487 RED.
2. DO on collector `kaal/engineering/places`: `stages.json`, the judge, the five minimal sources replacing C34's five and `controls.md` reduced to the same; C34's Cases adjusted or retired as the CPO sees fit; the new Cases GREEN. ACT, promotion.
3. `.github`, alone: the workflow `Engineering` with the four jobs. It reports harmlessly until required.
4. Owner (needs Kai's go): install `wiring` first. #1705 is then admitted by C16 and lands: the `.githooks` structure on `main` (baseline 0). Then `collectors`, `hotfixing`, `promotion` and `publishing`.
5. Controls migrate one at a time into these rulesets (analyze Vulnerabilities first). Levels 2 and 3 follow as their own Changes.

Development is judged on fixtures at the DO; the real `.githooks` tree passes only after #1705. So the check is required in `wiring` first, and in the others after #1705 has landed.

## Cases (all RED on `main`)

T480 the stages declaration holds the five stages (with `Integration` as the concept over Collectors, Hotfixing and Wiring) and their targets. T481 the ruleset sources are exactly the four branch rulesets, each with one `required_status_checks` rule requiring exactly its own `verify Stages (<Name>)`, empty bypass, strict false. T482 no legacy control in any source. T483 the judge passes the agreed structure and fails a missing ruleset, a wrong target, an extra rule, an extra context and an unreadable input. T484 the judge reads Development: dispatcher with `old/` and `new/`, any part missing fails (fixtures). T485 the check names are unique and exactly `verify Stages (<Name>)`, distinct from `Guard (...)` and the CI job `Engineering`. T486 C16 admits a `wire/*` head when the effective `wiring` rules require only `verify Stages (Wiring)` and it is green on the exact head, and refuses it when red. T487 Publishing exists as a tag source with `update` as its only rule and no check, and the judge fails without it.

## Not in this Change

No live ruleset is created, changed or retired; no install steps are issued; the live rulesets are not read (levels 2 and 3); no Guard, approval, merge queue, scanning or other legacy control; no replacement for `Promotion Source` (C16 is a bridge); the release/C18 sources are reconciled later.
