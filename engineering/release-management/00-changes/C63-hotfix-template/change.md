# C63 change

## PLAN

1. Add the draft of the template in `interface.md`, and the Cases T830 to T832 (RED).
2. Observe the expected RED, and that each Case can pass with the DO's content (`evidence.md`).
3. The PLAN adds no template file, no `.github` file, no check and no ruleset.

## Ids

Allocated by the coordinator on 17 Nov 2026: Change `release/C63`, Cases T830 to T839 (three used). No gap id.

## DO

On the merged PLAN, into the collector of this Change:

1. Add `05-src/wiring/templates/hotfix.md`, equal to the draft.
2. Rename the Cases from `.red.mjs` to `.test.mjs` when they are green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

- The WIRE that installs the template under `.github` is its own step, alone, after the promotion, in the one WIRE of all templates. Until then the template in `.github` stays as it is.
- The way from a `hotfix/*` branch into main is a promotion, with the one promotion template; this template does not describe it.
- The checker of the pull request body (`check PR Envelope`) still treats a HOTFIX pull request as one from a `hotfix/*` branch into main (its Case T189). That is legacy and not changed here.
