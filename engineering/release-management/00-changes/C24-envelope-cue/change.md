# C24 change

## PLAN (amended 14 Nov: split into capability and wiring)

1. Add C24 with its gap G56 and the Cases T198 and T199. Both are RED on `main` (`evidence.md`).
2. The cue is one fixed line, written once, as the first visible line of the body of every pull request template:
   `**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.`
3. It is visible text and not a comment, so a pull request opened from the template carries it without the agent having to invent it. It names no Change and repeats nothing from the files, so one line serves a pull request with one Change and a promotion with several.
4. The envelope check accepts exactly that line, and only it, before the first chapter. Any other text there, a changed cue or text beside the cue stays a finding (T199).
5. The envelope judge exports the cue it accepts as `CUE`, and T198 reads the capability texts with the judge's own `stripComments`, so the Case and the judge agree on visible text and on the cue.
6. The body stays an envelope: the cue points to the evidence and is never the authoritative PLAN, DO or ACT evidence. The bare-PR-link reader trial is validation evidence, not a GREEN/RED answer key.

## Split

`.github` travels alone (Change Isolation), so this Change cannot also install the cue in the templates under `.github/`. A first DO that did both failed that check (#1592, closed). The split is the one used for release/C14 and release/C15:

- release/C24 (this Change, collector `kaal/release/envelope-cue`): the capability. The cue, the envelope-check allowance, the cue in the capability texts `sync-template.md` and `fallback-template.md`, and the Cases T198 and T199. T198 reads those two capability texts, not `.github`. Nothing here depends on the wiring.
- release/C25 (`wire envelope cue`, collector `kaal/release/wire-envelope-cue`): `.github` only. It installs the cue in the five typed templates, the default template and the sync template, and carries its own PLAN with its own Cases, including the named mandatory template locations the CPO required plus discovery of every other `.md` in `.github/PULL_REQUEST_TEMPLATE/`, and its own independent verification that the installed `.github` templates contain the cue: the capability-text Cases of this Change do not prove the wiring. It comes after this Change is delivered. `hotfix.md` receives the cue in its own delivery.

## DO

1. Add `05-src/plan-body/cue.mjs` and change `envelope.mjs` and `check.mjs` for step 4.
2. Add the cue to `sync-template.md` and to `fallback-template.md`; for the fallback, the declaration stays on the first line and the cue follows it.
3. Delivered Cases that follow: release/T173 (F18, with its text) allows exactly the cue as the one visible line beside the headings of the fallback. release/T117 and T121 compare the installed SYNC template with `sync-template.md`; until release/C25 installs the cue they compare the two texts without the cue line; as soon as the installed copy carries the cue they compare strictly, byte for byte. release/C25 must delete the transitional branch from T117 and T121 and carry a Case that fails while either file still names the cue or strips it, so the relaxed comparison never becomes the permanent contract.
4. Rename T198 and T199 to `.test.mjs` when green.
5. The gap id is G56: release/G55 is held by release/C23 (Hotfix defect reference). Global uniqueness of C24, G56, T198 and T199 was checked over every remote branch; C25 and T200 are reserved for the wiring.

## Check

After release/C25 installs the cue, the same reader test as in `baseline.md` is run again with the same two links and a PR opened from the new templates, and the result is added to the ACT of release/C25. This Change alone does not change what a reader sees in a PR.

## ACT

1. A 4L retrospective in `act.md`.

## Not in this Change

A template registry or any new mechanism (Owner decision on #1530). The declarations of the templates (the one-time migration). Any file under `.github/` (release/C25). The `hotfix.md` template, which is not on `main`: it receives the cue in the HOTFIX delivery. Wiring, hooks, CI and merge blocking.
