# C15 disposition

What stays in the Target and what moves to the owning Change. Trials are Change-oriented and temporary: they learn whether the Target should change. The Target holds only what is enduring.

## Stays in the Target

- `skills/kaal-architecture/SKILL.md`, `package.json`, `LICENSE`, `README.md`, `test/cases.test.mjs` and a new `test/lib.mjs` that the Target Cases use alone.
- `01-intent/I1`, `02-requirements/F1`, `F2`, `F3`, `N1`, and `F4` trimmed to its enduring part (the report ends in a next move).
- `03-architecture/A2` (the Skill) and `A1` (the shell, without the key).
- Cases: `T2` as `T14` (F2), `T4` as `T15` (N1), `T6` as `T16` (A2), the shell half of `T5` as `T17` (A1), the new static `T18` (F1), `T19` (F3) and `T20` (F4), and `T21` and `T22` of F13. All green, none reading a trial or the key.

## Moves to the owning Change

- The key `03-architecture/A1-…/scenarios.json` to `00-changes/C1-classification/trial/key/`.
- `T1`, `T7`, `T8` to C1, and `T9`, `T10`, `T11` to C2, as experimental Cases; they check that the evidence is whole and the disagreements are named.
- `T3`: not rewritten and not green. Its assertion and its red output are kept verbatim as non-executable history in `00-changes/C1-classification/trial/` (`historical-T3.mjs`, a name the runner does not pick up, and `historical-T3.red-output.txt`). Run 3's files stay as recorded.
- `F5` (the realistic-trial requirement) to C2 as `F12`.
- Runs 1 to 4, the five requests, raw outputs, findings, `do.md`, the retrospectives, `evidence.md`, `proposal.md` and `application-1404.md` stay under their Changes.

## Identifiers

New identifiers start above the parked package's maxima (C14, F11, T13, G4, I6, N4, A9). `architecture/T2` becomes `T14` and `F5` becomes `F12`. `T3` is retired. The README states that `architecture/` ids on main from this package are new and that the parked package's ids are not carried over. The three main files that cite the parked ids are not edited.
