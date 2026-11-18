# C144 change

## PLAN

1. Adds F49 (`requirements.md`), the gap G63 (`gap.md`) and the Cases T217 to T221.
2. The Cases are RED on the C143 collector (evidence in the last section). They run the Guard of the checkout in a scratch repository, as the C143 Cases do, through the helpers in `packages/kaal-guard/test/acceptance/discovery-support.mjs`.
3. The PLAN changes no behaviour and touches no hook, workflow or ruleset.

## Cases

| Case | Obligation | Judges |
| --- | --- | --- |
| guard/T217 | F49 | a package file and an engineering-area file with no covering `kaal-guard.json` are a fail naming them and where to register; the selected checks still run; root files, `.github`, `.githooks` and `.kaal` are neither owned nor refused |
| guard/T218 | F49 | a nearest `kaal-guard.json` whose checks do not cover the file does not own it, while a covered file beside it passes |
| guard/T219 | F49, F45 | a repository with no `kaal-guard.json` behaves as before; an unknown selection runs everything and prints that ownership was not judged |
| guard/T220 | F49, F43 | removing a Change's folder and its `kaal-guard.json` is not refused; a path that no longer exists is not judged |
| guard/T221 | F49, F43 | an engineering area registers through its own `kaal-guard.json` like a product; the copy of its content into `.github` or `.githooks` is Delivery and not judged; an area that never registered is a fail |

## Open for the CPO

- **Engineering areas are Solution** (the Owner's 14:17 correction, as the coordinator read it): they register through their own `kaal-guard.json`, and an area becomes engine only through a WIRE. This is not yet confirmed by the Owner, and it reverses C143's "an engineering area root carries none".
- **Owned by coverage.** F49 counts a file owned only if a check of its nearest file applies to it. A package that narrows every check with `when` then has files it does not own. The alternative is a package-level "this folder is mine" member in `kaal-guard.json`. I chose the smaller one that adds no member; the CPO may prefer the other.
- **Verdict.** I use `fail` (exit 1), not `cannot judge` (exit 2), because the repository can fix it by registering. The CPO may prefer another.
- **Closing a Change** passes only because removed paths are not judged. A Change that leaves a file behind after its `kaal-guard.json` goes is refused, which is the intent.

## DO

Not authorized. On the CPO's approval: build F49 in `lib/discovery.mjs`, amend T209 step 4, rename the Cases to `.test.mjs` when green, regenerate `test/verify.json`, add the docs. No hook or workflow is rewired and the root `kaal-guard.json` of KAAL itself is a separate wiring decision.

## ACT

A 4L retrospective in `act.md`.

## RED evidence

Run from the repository root on the collector at 8335545 with Node 22:

`node --test engineering/guard/00-changes/C144-unowned/*.red.mjs`

See the PR description for the output.
