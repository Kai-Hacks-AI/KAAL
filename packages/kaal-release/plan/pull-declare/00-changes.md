# Pull Promotion: declare the collectors that are complete or near complete (Change A to B)

This is `pull/C12`, a PLAN Change. It changes no workflow and, apart from one small report check, no code. It declares collectors in `declaration.json` so Pull Promotion can read them. It records no value or size: those are the Owner's inputs. The report stays advisory and authorizes nothing.

## Assessment

A collector that is not in `declaration.json` is invisible to the report. Three collectors are now candidates and none is declared. I read each one's real layout on the host at its current head:

| Collector | Head | What it holds | What the committed evidence patterns recognize | What they do not |
| --- | --- | --- | --- | --- |
| `kaal/engineering/collector-capability` (engineering/C15) | `45f01f8` | `engineering/collector-capability/` with the Change folder `00-changes/C15-collector-capability/`: Cases `T268` to `T279`, `act.md`, `change.md`, `assessment.md` | PLAN (`change.md`) and DO (any `engineering/` file) | The Cases sit under `engineering/collector-capability/00-changes/`, but the Case patterns only name `engineering/release-management/`, so the twelve are "neither a Case nor declared". The Change's `act.md` is history. There is no concluding collector-level ACT yet, which is the collector's own missing work and not a pattern gap. |
| `kaal/guard/registration` (guard/C143) | `d619d1b` | `engineering/guard/00-changes/C143-registration/`: `change.md`, `gap.md`, `requirements.md` and four `.red.mjs` Cases. It holds a PLAN only | PLAN (`change.md`, `gap.md`) | Nothing yet to recognize as DO, Case or ACT. That is an honest "does not qualify", not a pattern gap. |
| `kaal/retro/skill` | `f77dff6` | `packages/kaal-retro/`: `plan/skill/*.md`, `skills/kaal-retro/`, and node tests in `test/plan/` with no Case ids | PLAN (`requirements.md`), DO (`packages/`) | The node tests in `test/plan/` match neither a Case pattern nor `other`, so they are "neither a Case nor declared". They are not Cases; the collector would need Case files for the qualification to read. |

`kaal/release/pull-next` (pull/C9) was also asked for. Its branch is gone because #1622 landed on `main`, so a declaration entry for it would never match a collector. It is not declared. The C26 Engineering collector does not exist yet and is declared when its branch does.

## A: the present

None of the three is declared. Asking the report about them is only possible with an uncommitted copy of the declaration, which is not reviewed.

## B: the target

`declaration.json` is changed, in one reviewed Change, to:

1. **Declare** the three collectors, each with a **scope** that fits its real layout and excludes work inherited from `main`: `^engineering/collector-capability/`, `^engineering/guard/` and `^packages/kaal-retro/`.
2. **Recognize what already exists and is not a Case**: add the collector-capability Case path to the Case patterns (`engineering/collector-capability/00-changes/<change>/T<n>.test.mjs`), and declare the retro node tests (`packages/kaal-retro/test/plan/*.test.mjs`) as `other`, so they are neither silently counted as Cases nor reported as unexplained.
3. **Leave `value`, `size` and `unit` as Owner inputs**: each new entry has all three absent. The numbers are the Owner's to record, with the CPO advising and reviewing the recorded declaration. A partial or invalid triple is a problem in the report, never a guess. Until the Owner records them, `chooseNext` judges the order.

Nothing is weakened: the PLAN, DO, Case-completeness and ACT rules, the 4L headings, the history patterns and the twelve existing entries stay as they are. A collector that has no DO, no executed Case or no concluding ACT still does not qualify, and the report says what is missing. Declaring a collector never makes it qualify.

## Open points for the CPO and CTO

1. **Executions.** A bare Case id such as `T268` has no execution in the host's CI log unless a runner logs it under a scoped id, as pull/C8 did for the Show WIP Cases. How the collector-capability Cases are logged is Engineering's. Until they are, the report will say "no execution", which is correct.
2. **Retro.** `kaal/retro/skill` has no Case files the qualification reads. Whether it gets Case ids, or a retro-specific pattern, is a separate call.
3. **Guard registration.** Only its PLAN has landed. It is declared so the report can show it; it qualifies only after its DO and ACT.

## Not in this Change

The one Script change is the report naming a partial value, size and unit triple in `problems` (pull/F49); there is no other Script change, and no workflow, ruleset, App or hook. No value, size or unit is recorded. No collector is promoted, synchronized or reported as qualifying by this Change.

## Order

PLAN (this), then DO (the declaration edit; T47 to T50 to green), ACT, SYNC when it holds the seat, PROMOTION. Collector: `kaal/release/pull-declare`, from `main`.
