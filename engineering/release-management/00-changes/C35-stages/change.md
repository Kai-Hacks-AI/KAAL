# release/C35 change: Engineering / verify Stages, the one check of the minimal set 1

Owner direction (16 Nov 2026): the first rulesets carry no legacy control. Set 1 is the smallest possible set, so controls migrate one at a time, and it must also unblock the `.githooks` migration (#1705). One check, owned by Engineering (Release Management), protects the structure of the delivery stages. This Change corrects release/C34 (set 1 sources on `main`, which carry legacy controls) and builds on it. CPO feedback of 16 Nov (stage vocabulary and shared enforcement) is applied: activity names, and Integrating as a first-class ruleset.

## From, to, because

- **From:** set 1 on `main` copies the legacy rules and checks of the old three rulesets (approvals, merge queue, code scanning, deletion, force-push, many checks, Guard). Nothing verifies that the delivery stages exist, and a `wire/*` head has no required check, so C16 fails closed and #1705 cannot be admitted.
- **To:** a declaration of the stages (`stages.json`) and a judge that checks the stage sources against it, reported as one check per ruleset, `Engineering / verify Stages (<Ruleset>)`. Set 1 becomes six minimal rulesets, five carrying only their own check and `publishing` carrying one rule.
- **Because:** migration must be controlled, one control at a time, and C16 needs a real check to read on a `wire/*` head.

## The stages (activity names)

| # | Stage | Kind | Target | Source |
| --- | --- | --- | --- | --- |
| 1 | Developing | `.githooks` | all other branches | dispatcher, `old/`, `new/` (no ruleset) |
| 2 | Integrating | ruleset, common to all three families | `kaal/**`, `hotfix/**`, `wire/**` | `integrating.json` |
| 2.1 | Collecting | ruleset | `kaal/**` | `collecting.json` (today the live `old integration`) |
| 2.2 | Hotfixing | ruleset | `hotfix/**` | `hotfixing.json` |
| 2.3 | Wiring | ruleset | `wire/**` | `wiring.json` |
| 3 | Promoting | ruleset | the default branch (`main`) | `promoting.json` |
| 4 | Publishing | ruleset, tag based | `trial-*@*` | `publishing.json` |

Six GitHub rulesets plus Developing through `.githooks`. **Enforcement is additive: Integrating plus the applicable specialized ruleset.** Integrating holds only what is common to all three families; Collecting, Hotfixing and Wiring hold only their own. No control is duplicated. The existing live rulesets stay in place and keep enforcing their protections; the new ones start minimal and controls migrate individually, each with verification before the old enforcement retires.

## The check, in three levels; this Change is level 1 only

1. **Exist in Engineering (this Change).** The stages exist as sources on the branch. Each branch ruleset has a source with the agreed name and target, an empty bypass list, and nothing in it but one `required_status_checks` rule that requires exactly its own `verify Stages (<Ruleset>)`, strict false. `integrating.json` covers all three families. `publishing.json` exists with the tag target. Anything unreadable fails closed. Two stages have no ruleset that can carry the check, so a job judges them: `verify Stages (Wiring)` judges Developing (the `.githooks` dispatcher with `old/` and `new/`, because WIRE is what installs it, so no other ruleset waits for `.githooks`), and `verify Stages (Promoting)` judges `publishing.json`, because a tag ruleset cannot require a check and publishing starts from `main`.
2. **Wired up in GitHub (later Change):** the live rulesets exist with these targets.
3. **Engineering = GitHub (later Change):** the live rulesets equal the sources; this is the check that matters most inside a Change.

- **Effective checks:** a `wire/*` head must be green on `verify Stages (Integrating)` and `verify Stages (Wiring)`, a `kaal/**` head on `(Integrating)` and `(Collecting)`, a `hotfix/**` head on `(Integrating)` and `(Hotfixing)`, and `main` on `(Promoting)`. C16 reads exactly these from the head's effective rules.
- **Publishing needs one rule:** a tag ruleset has no rule list that can be empty, so `publishing.json` carries `update` alone: a published tag cannot be moved. It is one of the four rules of `old publishing`, which keeps running; it is the smallest rule that makes the stage exist. No creation, deletion or force-push rule is added.
- **Name:** workflow `Engineering`, job `verify Stages (<Ruleset>)`, shown by GitHub as `Engineering / verify Stages (Integrating)`, `(Collecting)`, `(Hotfixing)`, `(Wiring)`, `(Promoting)`. A ruleset binds the job name alone, so the required context is `verify Stages (<Ruleset>)`, which is unique. The verb is `verify`, the detective class (release/C5 `naming.md`). The Owner's reason for not using Guard: Guard guards different things than what Engineering wires by hand. Naming amendment of release/C5 `naming.md`: the workflow is named by the concern that owns the check (`Engineering`), not `KAAL <capability>`. The CI job `Engineering` that runs the engineering tests keeps its name; the longer names are distinct.
- **Home:** `engineering/release-management/05-src/stages/` (`stages.json`, the judge); the workflow lives alone in `.github` (a later step).

## Sequence (each its own Change or step)

1. This PLAN, CPO review at the exact head; T480-T487 RED.
2. DO on collector `kaal/engineering/places`: `stages.json`, the judge, the six minimal sources replacing C34's five and `controls.md` reduced to the same; C34's Cases adjusted or retired as the CPO sees fit; the new Cases GREEN. ACT, promotion.
3. `.github`, alone: the workflow `Engineering` with five jobs. It reports harmlessly until required.
4. **Bootstrap of #1705, Owner (needs Kai's go):** install `integrating` and `wiring` first. #1705 (`wire/githooks-split`) is then admitted by C16 on `verify Stages (Integrating)` and `(Wiring)` green on its exact head, and lands: the `.githooks` structure is on `main` (baseline 0). Then install `collecting`, `hotfixing`, `promoting` and `publishing`.
5. Controls migrate one at a time into these rulesets (analyze Vulnerabilities first). Levels 2 and 3 follow as their own Changes.

## Cases (all RED on `main`)

T480 the stages declaration holds the stages (Developing, Integrating with Collecting, Hotfixing and Wiring, Promoting, Publishing) and their targets. T481 the six rulesets: five branch rulesets each with one `required_status_checks` rule requiring exactly its own `verify Stages (<Name>)`, empty bypass, strict false, and the agreed targets, with Integrating covering all three families. T482 no legacy control in any source. T483 the judge passes the agreed structure and fails a missing ruleset, a wrong target, an Integrating that misses a family, an extra rule, an extra context and an unreadable input. T484 the judge reads Developing (dispatcher with `old/` and `new/`); any part missing fails, and only the Wiring job reports it. T485 the check names are unique, so no shared control is duplicated, exactly `verify Stages (<Name>)`, distinct from `Guard (...)` and the CI job `Engineering`. T486 enforcement is additive: C16 admits a `wire/*` head when Integrating and Wiring together require only their two checks and both are green on the exact head, and refuses it when either is red. T487 Publishing exists as a tag source with `update` as its only rule and no check, and the Promoting job fails without it.

## Not in this Change

No live ruleset is created, changed or retired; no install steps are issued; the live rulesets are not read (levels 2 and 3); no Guard, approval, merge queue, scanning or other legacy control; no replacement for `Promotion Source` (C16 is a bridge); the release/C18 sources are reconciled later.

## DO

`05-src/stages/stages.json` (the declaration) and `05-src/stages/judge.mjs` (`judge()` and a small CLI, `node judge.mjs <root> <Ruleset>`: exit 0 pass, 1 this job fails, 2 cannot judge). The six ruleset sources replace C34's five in `05-src/wiring/rulesets/` (`integration.json` and `promotion.json` renamed `integrating.json` and `promoting.json`, `collecting.json` added, `hotfixing.json`, `wiring.json` and `publishing.json` reduced), `controls.md` reduced to the same, README updated. C34's Cases T454-T459 are retired (they judged the legacy copies); T480-T487 are GREEN. On `main` today `verify Stages (Wiring)` fails by design, because the `.githooks` structure is not there yet: it passes on #1705's head. No workflow, no live ruleset, no install.
