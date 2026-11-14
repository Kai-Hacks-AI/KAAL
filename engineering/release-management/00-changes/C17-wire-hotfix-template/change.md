# C17 change

## PLAN (amended 14 Nov: KAAL Defect hint, envelope cue, nine Hotfix Cases)

The CPO asked on #1530 that the HOTFIX delivery be re-wired to the draft amended by release/C23, that it carry the Change envelope cue, and that it carry the nine Hotfix Cases moved out of release/C11. Amendments to the PLAN below:

1. **Nine Hotfix Cases.** T150, T151, T152, T153, T154, T155, T157, T159 and T160 return at their original paths as `.red.mjs`, byte for byte the blobs of `main` 929d4dd listed in `C11-hotfix/case-transfer.md`. All nine are RED here because the template is not on `main`; they are not active Cases, so CI does not run them.
2. **Envelope cue.** New gap release/G57 and Case T201 (RED): the draft in `C11-hotfix/interface.md` opens its visible body with the one cue line of release/C24, once, directly followed by the Change chapter. The cue text is the one fixed by release/C24; this Change does not define it and adds no check or registry (Owner decision on #1530). Ids G57 and T201 were checked against every remote branch; C25 and T200 stay reserved for the wiring of release/C25.
3. **Defect hint.** No new Case: T181 already compares the installed template with the draft, and the draft already carries the KAAL Defect hint of release/C23.


## PLAN

1. Add C17 with its Case T181 for the gap. T181 compares the installed template with the fenced draft in `interface.md` of release/C11 byte for byte, so the installation cannot drift from the capability.
2. The Case is RED on `main` because the template is not installed.
3. The PLAN installs nothing and changes nothing of release/C11.

## DO

1. The template `.github/PULL_REQUEST_TEMPLATE/hotfix.md`, unchanged from the draft, travels alone in its own `.github` collector `kaal/release/wire-hotfix` and reaches `main` first, because Change Isolation keeps `.github` apart from engineering. This Change's engineering files travel in the collector `kaal/release/wire-hotfix-engineering` and reach `main` second. The DO is the Case renamed from `T181.red.mjs` to `T181.test.mjs` once the template is on `main` and the engineering collector is synchronized.

## DO (amended 14 Nov)

1. In the `.github` collector: `hotfix.md` replaced by the amended draft (KAAL Defect hint and cue), `.github` only. T181 is run at the exact heads and the sha256 of both files is recorded.
2. In the engineering collector: the draft in `interface.md` gets the cue line (T201 turns green), and T181 and the nine Cases are renamed to `.test.mjs` in the DO that follows the `.github` promotion once the collector is synchronized, so no RED Case is active in CI. This is the explicit reactivation obligation for the nine Cases.
3. `C11-hotfix/change.md` and `evidence.md` still name T150 to T160 as release/C11's Cases; `case-transfer.md` records that the nine moved here. They are not rewritten.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## Not in this Change

Hooks, workflows, required checks, ruleset changes, a checker of HOTFIX bodies, the delivery path of a Hotfix, the text and interface of the template, and the other templates.

## Dependencies

release/C11 comes first and is on `main`. The superseded collector `kaal/release/wire-hotfix-template` is deleted only after this one is green, and only with a go.
