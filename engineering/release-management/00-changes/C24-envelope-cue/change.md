# C24 change

## PLAN

1. Add C24 with its gap G56 and the Cases T198 and T199. Both are RED on `main` (`evidence.md`).
2. The cue is one fixed line, written once, as the first visible line of the body of every pull request template:
   `**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.`
3. It is visible text and not a comment, so a pull request opened from the template carries it without the agent having to invent it. It names no Change and repeats nothing from the files, so one line serves a pull request with one Change and a promotion with several.
4. "Every template" means the named mandatory locations (the five typed templates, the default `.github/pull_request_template.md` and the fallback text of release/A41), which T198 requires to exist, and every other `.md` file in `.github/PULL_REQUEST_TEMPLATE/`, which T198 discovers, so a template that lands later without the cue turns T198 RED. No count stands in for the mandatory list.
5. The envelope check accepts exactly that line, and only it, before the first chapter. Any other text there, a changed cue or text beside the cue stays a finding (T199).
6. The envelope judge exports the cue it accepts as `CUE`, and T198 reads template text with the judge's own `stripComments`, so the Case and the judge agree on visible text and on the cue.
7. The body stays an envelope: the cue points to the evidence and is never the authoritative PLAN, DO or ACT evidence. The bare-PR-link reader trial is validation evidence, not a GREEN/RED answer key.

## DO

1. Add the cue to the templates on `main` and to the fallback text. Where a template opens with a declaration comment, the declaration stays on the first line and the cue follows it.
2. Change `envelope.mjs` for step 5. `check.mjs` (the PLAN body shape) allows the same line.
3. Three delivered Cases and one text change follow from step 1 and are named here: release/T117 and T121 compare the installed SYNC template byte for byte with `sync-template.md`, so that text carries the cue too; release/T173 (F18, with its text) allows exactly the cue as the one visible line beside the headings of the fallback.
4. Rename T198 and T199 to `.test.mjs` when green.
5. The gap id is G56: release/G55 is held by release/C23 (Hotfix defect reference). Global uniqueness of C24, G56, T198 and T199 was checked over every remote branch.

## Check

After the DO, the same reader test as in `baseline.md` is run again with the same two links and a PR opened from the new templates, and the result is added to `act.md`.

## ACT

1. A 4L retrospective in `act.md`.

## Not in this Change

A template registry or any new mechanism (Owner decision on #1530). The declarations of the templates (the one-time migration). The `hotfix.md` template, which is not on `main`: it receives the cue in the HOTFIX delivery, and T198 turns RED if it lands without it. Wiring, hooks, CI and merge blocking.
