# C68 change

## PLAN

1. Add the draft in `interface.md` (the control item `CTL11.md`) and the Cases T880 and T881, both RED.
2. Observe the expected RED and that each Case can pass with the draft as the DO's file (`evidence.md`).
3. The PLAN adds no control item, no source, no workflow, no hook, no `.github` file, no ruleset and no setting.

## Mechanism

None is built. The control states what the check reveals and where it runs:

- **Scope.** The envelope only: route, title, chapters present and not empty, line shapes, the `HOW TO WORK` table, the `Driven-by` identity, and for a WIRE the control it names. Not the truth of what is written: whether a Defect is real, an Urgency holds, a scope is right. That is for review and approval.
- **Verdicts.** PASS: the envelope is well formed. FAIL: a finding naming the rule. UNKNOWN: something could not be read. PASS authorizes nothing.
- **Instances.** The same check, with the same rules and Cases, in three places: the CLI (Developing, by hand), the pre-push hook (Developing, the local part only), and CI on the pull request (full envelope, read only). Each is a later Change; this one only names them. Only the CI run can later be required by a ruleset, and that is a second, preventive control with its own Owner decision.

## Ids

Change `release/C68`, Cases T880 and T881, control `release/CTL11`, Intent `release/I7`. Allocated by the coordinator on 17 Nov 2026.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change: add `04-controls/CTL11-verify-envelope/CTL11.md` equal to the draft, and rename T880 and T881 from `.red.mjs` to `.test.mjs` when they are green. The DO adds no `status`: the finder on `main` does not know it yet, and a small Change adds it after release/C62 reaches `main`.

## ACT

A 4L retrospective in `act.md`.

## Left open

- **Order.** Release/C67 (the route correction) must be on `main` before the interpreter (S2). This Change does not depend on it: it declares only.
- **The `status` line** waits for release/C62.
- **The type.** `verify Envelope` is detective. The Owner may name another of the four types the finder accepts.
