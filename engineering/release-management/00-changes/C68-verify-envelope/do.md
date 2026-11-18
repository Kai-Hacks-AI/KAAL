# C68 do

## What the DO added

- `04-controls/CTL11-verify-envelope/CTL11.md`, equal to the draft in `interface.md`: release/CTL11 `verify Envelope`, detective, with release/I7. It states the envelope-only scope, PASS, FAIL and UNKNOWN, and the three instances with their stages.
- T880 and T881 renamed from `.red.mjs` to `.test.mjs`. Both are green and the finder lists release/CTL11 with them and refuses nothing.

## Checked beside the Cases

The Cases runner (`engineering/cases/cases.test.mjs`): 190 pass, 12 fail. The 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too. This is not a clean full-suite run.

## Not done, as planned

No `status` line: the finder on `main` does not know it until release/C62 reaches `main`; a small Change adds it then. No instance exists yet (interpreter, CLI, hook, CI run), and nothing is wired, loaded or required.
